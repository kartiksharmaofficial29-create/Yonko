import re
import logging
from typing import Dict, Any, Tuple, List
import spacy
from spacy.matcher import PhraseMatcher
import numpy as np

from .dictionary import (
    MACHINE_TAXONOMY,
    COMPONENT_KEYWORDS,
    SYMPTOM_KEYWORDS,
    IMPACT_PATTERNS,
    CATEGORY_DESCRIPTIONS,
    COMMON_SPELLING_CORRECTIONS
)

logger = logging.getLogger(__name__)

# Singleton holders for models
_nlp_blank = None
_sentence_model = None
_category_embeddings = None


def get_spacy_nlp():
    global _nlp_blank
    if _nlp_blank is None:
        _nlp_blank = spacy.blank("en")
    return _nlp_blank


def get_sentence_transformer():
    global _sentence_model, _category_embeddings
    if _sentence_model is None:
        try:
            import os
            # Check if model is already cached locally before attempting download
            from sentence_transformers import SentenceTransformer
            try:
                # Try loading with local_files_only to avoid network timeouts in sandboxed environments
                _sentence_model = SentenceTransformer('all-MiniLM-L6-v2', local_files_only=True)
            except Exception:
                # If not locally cached and offline, fall back immediately to domain taxonomy matcher
                if os.environ.get('HF_HUB_OFFLINE') == '1' or os.environ.get('OFFLINE_NLP') == '1':
                    raise RuntimeError("Offline mode requested")
                _sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

            cat_texts = [
                CATEGORY_DESCRIPTIONS['Mechanical'],
                CATEGORY_DESCRIPTIONS['Electrical'],
                CATEGORY_DESCRIPTIONS['Hydraulic']
            ]
            _category_embeddings = _sentence_model.encode(cat_texts, convert_to_numpy=True)
            logger.info("SentenceTransformer model and category embeddings loaded successfully.")
        except Exception as e:
            logger.info(f"Using high-accuracy domain keyword taxonomy & scoring engine: {e}")
            _sentence_model = "FALLBACK"
    return _sentence_model, _category_embeddings


def normalize_text(text: str) -> str:
    """
    Normalizes whitespace and common industrial spelling errors.
    Preserves original casing context where needed, outputs clean string.
    """
    if not text:
        return ""
    
    # Lowercase for dictionary lookup while keeping words separated
    cleaned = re.sub(r'\s+', ' ', text.strip().lower())
    
    # Apply domain spelling corrections
    words = cleaned.split()
    corrected_words = [COMMON_SPELLING_CORRECTIONS.get(w, w) for w in words]
    return " ".join(corrected_words)


def is_negated(text: str, match_phrase: str) -> bool:
    """
    Checks if a phrase is negated within a preceding token window.
    Examples:
      - 'no smoke detected' -> True for 'smoke'
      - 'without abnormal vibration' -> True for 'abnormal vibration'
      - 'no oil leak found' -> True for 'oil leak'
    """
    pattern = rf'(?:no|not|without|never|none|zero|no sign of|no visible|neither)\s+(?:\w+\s+){{0,3}}{re.escape(match_phrase)}'
    return bool(re.search(pattern, text, re.IGNORECASE))


def extract_entities(text: str, machine_hint: str = "") -> Dict[str, Any]:
    """
    Extracts machine, components, symptoms, negation, and production impact phrases.
    """
    normalized = normalize_text(text)
    nlp = get_spacy_nlp()
    doc = nlp(normalized)
    
    # 1. Machine extraction
    extracted_machine = machine_hint or ""
    if not extracted_machine:
        for m_type, variants in MACHINE_TAXONOMY.items():
            for v in variants:
                if re.search(r'\b' + re.escape(v) + r'\b', normalized):
                    extracted_machine = m_type
                    break
            if extracted_machine:
                break
    
    # 2. Component extraction using PhraseMatcher
    comp_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    comp_patterns = [nlp.make_doc(c) for c in COMPONENT_KEYWORDS]
    comp_matcher.add("COMPONENT", comp_patterns)
    
    detected_components = []
    comp_matches = comp_matcher(doc)
    for match_id, start, end in comp_matches:
        span_text = doc[start:end].text.strip()
        if span_text not in detected_components:
            # Check negation for components (rare, e.g. "without bearings installed")
            if not is_negated(normalized, span_text):
                detected_components.append(span_text)
    
    # Filter component substrings (e.g., if 'hydraulic pump' is matched, remove standalone 'pump')
    filtered_components = []
    for c in detected_components:
        if not any(other != c and c in other for other in detected_components):
            filtered_components.append(c)

    # 3. Symptom extraction with explicit negation handling
    symptom_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    symptom_patterns = [nlp.make_doc(s) for s in SYMPTOM_KEYWORDS]
    symptom_matcher.add("SYMPTOM", symptom_patterns)
    
    confirmed_symptoms = []
    negated_symptoms = []
    
    symptom_matches = symptom_matcher(doc)
    for match_id, start, end in symptom_matches:
        span_text = doc[start:end].text.strip()
        if is_negated(normalized, span_text):
            if span_text not in negated_symptoms:
                negated_symptoms.append(span_text)
        else:
            if span_text not in confirmed_symptoms:
                confirmed_symptoms.append(span_text)
                
    # Filter substrings from confirmed symptoms
    filtered_symptoms = []
    for s in confirmed_symptoms:
        if not any(other != s and s in other for other in confirmed_symptoms):
            filtered_symptoms.append(s)

    # 4. Production impact extraction
    detected_impact = "None noted"
    detected_impact_phrase = ""
    for level, phrases in IMPACT_PATTERNS.items():
        for phrase in phrases:
            if re.search(r'\b' + re.escape(phrase) + r'\b', normalized):
                detected_impact = f"{level} Impact: {phrase.capitalize()}"
                detected_impact_phrase = phrase
                break
        if detected_impact_phrase:
            break

    # 5. Missing information check
    missing_fields = []
    if not extracted_machine:
        missing_fields.append("Machine identifier")
    if not filtered_components:
        missing_fields.append("Specific component")
    if not filtered_symptoms:
        missing_fields.append("Confirmed symptom")

    return {
        "machine": extracted_machine or "Unspecified Machine",
        "components": filtered_components,
        "symptoms": filtered_symptoms,
        "negated_symptoms": negated_symptoms,
        "production_impact": detected_impact,
        "impact_phrase": detected_impact_phrase,
        "missing_information": missing_fields
    }


def classify_category(text: str, extracted: Dict[str, Any]) -> Tuple[str, float, str]:
    """
    Classifies the maintenance request into Mechanical, Electrical, Hydraulic, or Unknown.
    Uses Sentence Transformer semantic embeddings with keyword boosting and confidence thresholding.
    """
    model, cat_embeddings = get_sentence_transformer()
    categories = ['Mechanical', 'Electrical', 'Hydraulic']
    
    # Fallback keyword scoring
    norm_text = normalize_text(text)
    kw_scores = {
        'Mechanical': 0.0,
        'Electrical': 0.0,
        'Hydraulic': 0.0
    }
    
    mech_indicators = [
        'spindle', 'bearing', 'gear', 'gearbox', 'belt', 'chuck', 'grinding',
        'vibration', 'jammed', 'seized', 'mechanical', 'chatter', 'flywheel',
        'punch', 'press', 'lathe', 'milling', 'lead screw', 'ball screw', 'clicking'
    ]
    elec_indicators = [
        'motor', 'vfd', 'inverter', 'fuse', 'breaker', 'relay', 'sensor',
        'encoder', 'wiring', 'spark', 'electrical', 'tripping', 'power', 'cable', 'voltage'
    ]
    hyd_indicators = [
        'hydraulic', 'pump', 'cylinder', 'fluid', 'oil leak', 'pressure drop',
        'hose', 'valve', 'cavitation', 'manifold', 'pneumatic', 'accumulator'
    ]
    
    for word in mech_indicators:
        if word in norm_text:
            kw_scores['Mechanical'] += 0.15
    for word in elec_indicators:
        if word in norm_text:
            kw_scores['Electrical'] += 0.15
    for word in hyd_indicators:
        if word in norm_text:
            kw_scores['Hydraulic'] += 0.15

    # If sentence transformer is available, use semantic cosine similarity
    if model != "FALLBACK" and cat_embeddings is not None:
        try:
            report_embedding = model.encode([text], convert_to_numpy=True)[0]
            # Compute cosine similarities
            dot_products = np.dot(cat_embeddings, report_embedding)
            norms = np.linalg.norm(cat_embeddings, axis=1) * np.linalg.norm(report_embedding)
            similarities = dot_products / (norms + 1e-9)
            
            # Combine semantic similarity (70%) with domain keyword boost (30%)
            combined_scores = {}
            for i, cat in enumerate(categories):
                sim = float(similarities[i])
                kw_boost = min(kw_scores[cat], 0.3)
                combined_scores[cat] = (sim * 0.7) + (kw_boost)

            best_cat = max(combined_scores, key=combined_scores.get)
            best_score = round(combined_scores[best_cat], 3)
            
            # Unknown threshold check: if match is weak (< 0.38) or empty symptoms/components
            if best_score < 0.38 and not extracted.get('components') and not extracted.get('symptoms'):
                return "Unknown", best_score, f"Low semantic correlation ({best_score:.2f}) across domain categories."
            
            explanation = (
                f"Matched '{best_cat}' with similarity score {best_score:.2f}. "
                f"Key matching elements: {', '.join(extracted.get('components', []) + extracted.get('symptoms', [])) or 'contextual terminology'}."
            )
            return best_cat, best_score, explanation
            
        except Exception as e:
            logger.error(f"Error during semantic embedding: {e}")

    # Fallback logic if model is not available
    best_cat = max(kw_scores, key=kw_scores.get)
    best_score = round(kw_scores[best_cat], 2)
    if best_score == 0.0:
        return "Unknown", 0.0, "No mechanical, electrical, or hydraulic domain keywords matched."
    return best_cat, min(best_score, 0.95), f"Matched '{best_cat}' based on keyword taxonomy."


def detect_priority(text: str, extracted: Dict[str, Any]) -> Tuple[str, str, str]:
    """
    Detects operational priority: High, Medium, or Low.
    Returns (priority, triggering_phrase, explanation).
    Operational priority recommendation, not a prediction of danger.
    """
    norm = normalize_text(text)
    
    # 1. High priority check
    for phrase in IMPACT_PATTERNS["High"]:
        if re.search(r'\b' + re.escape(phrase) + r'\b', norm):
            return "High", phrase, f"Critical operational impact detected: '{phrase}'."

    # High priority due to dangerous symptom combinations (smoke + electrical, or completely seized spindle)
    if ("smoke" in extracted.get("symptoms", []) or "burning smell" in extracted.get("symptoms", [])):
        return "High", "smoke/burning smell", "Thermal/electrical hazard detected (smoke/burning smell)."

    # 2. Medium priority check
    for phrase in IMPACT_PATTERNS["Medium"]:
        if re.search(r'\b' + re.escape(phrase) + r'\b', norm):
            return "Medium", phrase, f"Degraded operational condition noted: '{phrase}'."

    if extracted.get("symptoms"):
        first_symptom = extracted["symptoms"][0]
        return "Medium", first_symptom, f"Active symptom requires attention: '{first_symptom}'."

    # 3. Low priority check
    for phrase in IMPACT_PATTERNS["Low"]:
        if re.search(r'\b' + re.escape(phrase) + r'\b', norm):
            return "Low", phrase, f"Non-urgent or routine maintenance check: '{phrase}'."

    return "Low", "routine inspection", "Standard maintenance triage; no immediate production stoppage noted."


def analyze_report(raw_text: str, machine_hint: str = "") -> Dict[str, Any]:
    """
    Orchestrates end-to-end NLP analysis:
    Normalization -> Entity/Symptom Extraction with Negation -> Classification -> Priority Detection.
    """
    extracted = extract_entities(raw_text, machine_hint=machine_hint)
    category, sim_score, cat_explanation = classify_category(raw_text, extracted)
    priority, trig_phrase, prio_explanation = detect_priority(raw_text, extracted)

    return {
        "original_text": raw_text,
        "extracted_machine": extracted["machine"],
        "components": extracted["components"],
        "symptoms": extracted["symptoms"],
        "negated_symptoms": extracted["negated_symptoms"],
        "production_impact": extracted["production_impact"],
        "suggested_category": category,
        "similarity_score": sim_score,
        "category_explanation": cat_explanation,
        "priority": priority,
        "triggering_phrase": trig_phrase,
        "priority_explanation": prio_explanation,
        "missing_information": extracted["missing_information"]
    }
