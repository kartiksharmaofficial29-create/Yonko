import logging
from typing import List, Dict, Any
import numpy as np
from ..models import Technician, FaultTicket
from .nlp_service import get_sentence_transformer, normalize_text

logger = logging.getLogger(__name__)


def compute_skill_overlap(ticket_category: str, extracted_components: List[str], extracted_symptoms: List[str], technician_skills: List[str]) -> Tuple_Overlap:
    pass


class MatchingResult:
    def __init__(self, technician: Technician, ranking_score: int, matching_skills: List[str], explanation_points: List[str], semantic_score: float):
        self.technician = technician
        self.ranking_score = ranking_score
        self.matching_skills = matching_skills
        self.explanation_points = explanation_points
        self.semantic_score = semantic_score


def recommend_technicians(ticket: FaultTicket, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Ranks available technicians for a fault ticket based on:
    1. Explicit skill overlap with ticket category, machine, components, and symptoms.
    2. Semantic cosine similarity between fault report text and technician expertise description.
    3. Strict availability filtering (only available technicians can be recommended).
    """
    # Strict availability filtering
    available_techs = Technician.objects.filter(availability=True)
    if not available_techs.exists():
        return []

    extracted = ticket.extracted_fields or {}
    category = ticket.suggested_category or 'Unknown'
    components = [c.lower() for c in extracted.get('components', [])]
    symptoms = [s.lower() for s in extracted.get('symptoms', [])]
    machine_name = ticket.machine.name.lower()
    machine_type = ticket.machine.machine_type.lower()
    report_text = ticket.original_text

    model, _ = get_sentence_transformer()
    report_embedding = None
    if model != "FALLBACK":
        try:
            report_embedding = model.encode([report_text], convert_to_numpy=True)[0]
        except Exception as e:
            logger.error(f"Error computing report embedding: {e}")

    recommendations = []

    for tech in available_techs:
        tech_skills_lower = [s.lower() for s in tech.skills]
        matching_skills = []
        explanation_points = []

        # 1. Category alignment
        cat_match = False
        if category != 'Unknown' and any(category.lower() in s for s in tech_skills_lower):
            cat_match = True
            matching_skills.append(f"{category} Specialization")
            explanation_points.append(f"Certified in {category} industrial maintenance")

        # 2. Machine type alignment
        machine_match = False
        if any(machine_type in s or s in machine_type for s in tech_skills_lower):
            machine_match = True
            matched_s = next(s for s in tech_skills_lower if machine_type in s or s in machine_type)
            matching_skills.append(matched_s.title())
            explanation_points.append(f"Demonstrated {ticket.machine.machine_type} systems experience")

        # 3. Component skill overlap
        for comp in components:
            for s in tech_skills_lower:
                if comp in s or s in comp:
                    if s.title() not in matching_skills:
                        matching_skills.append(s.title())
                        explanation_points.append(f"Direct skill match for {comp} repair")

        # 4. Semantic similarity with expertise description
        semantic_sim = 0.0
        if report_embedding is not None and tech.expertise_description:
            try:
                tech_emb = model.encode([tech.expertise_description], convert_to_numpy=True)[0]
                dot = np.dot(report_embedding, tech_emb)
                norm = np.linalg.norm(report_embedding) * np.linalg.norm(tech_emb)
                semantic_sim = float(dot / (norm + 1e-9))
                semantic_sim = max(0.0, min(1.0, semantic_sim))
            except Exception as e:
                logger.error(f"Error in tech semantic similarity: {e}")
        else:
            # Fallback text term overlap
            exp_text = tech.expertise_description.lower()
            overlap_count = sum(1 for word in (components + [category.lower(), machine_type]) if word in exp_text)
            semantic_sim = min(0.9, overlap_count * 0.25)

        if semantic_sim > 0.45:
            explanation_points.append(f"Expertise profile aligns closely with reported issue ({int(semantic_sim * 100)}% relevance)")

        # 5. Composite Ranking Score Calculation (0-100 scale, non-probabilistic)
        # Base points: Availability gives baseline 30 pts
        # Skill matches give up to 40 pts
        # Semantic similarity gives up to 30 pts
        skill_score = min(40, len(matching_skills) * 15 + (10 if cat_match else 0) + (10 if machine_match else 0))
        semantic_score = int(semantic_sim * 30)
        availability_score = 30  # Confirmed available

        total_score = min(99, availability_score + skill_score + semantic_score)

        explanation_points.append("Currently active and available for immediate dispatch")

        recommendations.append({
            "technician_id": tech.id,
            "name": tech.name,
            "skills": tech.skills,
            "availability": tech.availability,
            "contact_information": tech.contact_information,
            "expertise_description": tech.expertise_description,
            "matching_skills": list(set(matching_skills)),
            "ranking_score": total_score,
            "semantic_score": round(semantic_sim, 2),
            "explanation": explanation_points
        })

    # Sort descending by ranking score
    recommendations.sort(key=lambda x: x["ranking_score"], reverse=True)
    return recommendations[:limit]
