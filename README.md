# RepairRadar: Industrial Maintenance Triage & Technician Recommendation Platform

**RepairRadar** is an enterprise-grade NLP-based maintenance request triage and explainable technician recommendation platform. It transforms unstructured, conversational fault descriptions from factory floor operators into structured, actionable maintenance tickets, predicts failure categories, flags operational priorities based on downtime impact, and recommends available specialists with plain-language decision explainability.

---

## System Architecture

```text
               +-------------------------------------------------------+
               |        React 18 + Vite + Tailwind CSS + GSAP          |
               |     Three.js / React Three Fiber (Digital Twin)       |
               +---------------------------+---------------------------+
                                           |  RTK Query (REST APIs)
                                           v
               +-------------------------------------------------------+
               |                 Django REST Framework                 |
               |           (Triage & Dispatch API Controller)          |
               +---------------------------+---------------------------+
                                           |
               +---------------------------+---------------------------+
               |                           |                           |
               v                           v                           v
+-------------------------------+  +-------------------+  +-----------------------+
|      NLP Processing Engine    |  | Priority Engine   |  | Recommendation Engine |
| - Text Normalization          |  | - Operational     |  | - Skill Overlap (0-50)|
| - Negation Detection Layer    |  |   impact parsing  |  | - Semantic Match(0-30)|
| - spaCy Industrial Matcher    |  | - High/Med/Low    |  | - Shift Availability  |
| - Sentence Transformers (SBERT)|  | - Trigger phrases |  | - Explainable Bullets |
+-------------------------------+  +-------------------+  +-----------------------+
                                           |
                                           v
               +-------------------------------------------------------+
               |             PostgreSQL Database (psycopg)             |
               |    (Machines, Technicians, FaultTickets, Events)      |
               +-------------------------------------------------------+
```

---

## Key Capabilities & Scope Boundaries

### In-Scope Core Capabilities
1. **Unstructured Report Ingestion**: Operators report faults in natural language (e.g., *"CNC milling center making grinding noise near spindle chuck. Production stopped on line 2."*).
2. **Deterministic & Semantic NLP Triage**:
   - **Industrial Entity Extraction**: spaCy `PhraseMatcher` targeting 400+ industrial machines, sub-components, and symptoms.
   - **Negation Awareness**: Contextual negation boundary detection (e.g., *"no smoke or fire detected"* marks smoke as explicitly negated/ruled out, avoiding false-positive electrical alerts).
   - **Semantic Category Classification**: Dense vector cosine similarity across **Mechanical**, **Electrical**, **Hydraulic**, and **Unknown**. Scores below threshold trigger "Unknown" flag for human supervisor review.
   - **Operational Priority Suggestion**: Separate operational impact detection (e.g., *"production stopped"*, *"line halted"*) generates High/Medium/Low priority flags alongside triggering excerpts.
3. **Explainable Technician Recommendations**:
   - Internal certified technician database.
   - Strict availability filtering (only available shift technicians are recommended).
   - Multi-factor composite ranking:
     $$\text{Score} = \text{Skill Overlap (50 pts)} + \text{Semantic Expertise (30 pts)} + \text{Availability/Workload (20 pts)}$$
   - Bulleted, transparent justifications explaining *why* a technician was recommended.
4. **Human-in-the-Loop Workflow**: Supervisors retain full control to edit NLP extractions, override categories/priorities, and confirm all technician assignments.
5. **Interactive 3D Digital Twin**: Built with Three.js and React Three Fiber featuring real-time signal beacons (Green/Amber/Red) synced with ticket priorities and component inspection highlights.

### Strict Scope Boundaries
- **NOT** an automatic machine diagnosis system.
- **NOT** a predictive maintenance or IoT sensor telemetry platform.
- **NOT** an external freelancer marketplace.
- **NOT** an automatic repair instruction generator.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, shadcn-inspired UI components, Redux Toolkit, RTK Query, React Router DOM v6, Three.js, React Three Fiber, Drei, Lucide React, GSAP |
| **Backend** | Python 3.10+, Django 5+, Django REST Framework, django-cors-headers, python-dotenv |
| **Database** | PostgreSQL 14+ (tested on PostgreSQL 18 with `psycopg` 3.3.9 binary driver) |
| **NLP & ML** | spaCy 3.8+ with `PhraseMatcher`, Sentence Transformers (`all-MiniLM-L6-v2`), scikit-learn cosine similarity |

---

## Local Setup & Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL 14+ running locally (default: `127.0.0.1:5432`)

### 1. Database Setup
Create the PostgreSQL database using `psql` or pgAdmin:
```sql
CREATE DATABASE repairradar;
```

Configure `backend/.env`:
```ini
DEBUG=True
SECRET_KEY=repairradar-super-secret-key-production-ready
DB_NAME=repairradar
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
OFFLINE_NLP=0
```

### 2. Backend Installation & Migrations
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r ../requirements.txt

# Run migrations
python manage.py migrate

# Seed 12 industrial machines, 10 technicians, 65 realistic maintenance reports, and 200+ event logs
python manage.py seed_demo

# Run automated backend test suite
python manage.py test triage

# Start Django development server (http://127.0.0.1:8000)
python manage.py runserver 8000
```

### 3. Frontend Installation & Execution
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (already packaged in package.json)
npm install

# Build production bundle
npm run build

# Start Vite dev server with proxy to backend (http://localhost:5173)
npm run dev
```

---

## REST API Specification

### Fault Tickets API
- `GET /api/tickets/`: Filter tickets by `status`, `priority`, `category`, `machine_id`, and `search`.
- `POST /api/tickets/`: Submit unstructured maintenance report. Automatically triggers initial NLP triage.
- `GET /api/tickets/{id}/`: Retrieve detailed ticket lifecycle data and extractions.
- `PATCH /api/tickets/{id}/`: Update supervisor edits, category, or priority overrides.
- `POST /api/tickets/{id}/analyze/`: Re-run NLP entity extraction and semantic classification.
- `GET /api/tickets/{id}/matches/`: Get ranked, explainable technician recommendations.
- `POST /api/tickets/{id}/assign/`: Assign technician with supervisor notes.
- `POST /api/tickets/{id}/status_update/`: Transition lifecycle status (`open` -> `in_triage` -> `assigned` -> `in_progress` -> `resolved` -> `closed`).
- `GET /api/tickets/{id}/events/`: Retrieve full immutable audit history.

### Machines & Technicians API
- `GET /api/machines/`: Monitored assets catalog.
- `POST /api/machines/`: Register new machine asset.
- `GET /api/technicians/`: Technician skill directory with active ticket counts.
- `POST /api/technicians/{id}/toggle_availability/`: Toggle on-shift / off-shift availability.
- `GET /api/dashboard/`: Executive summary KPIs, category distributions, and recent audit events.

---

## Automated Test Verification

The backend includes a comprehensive unit and integration test suite in `backend/triage/tests.py`:
- `test_nlp_normalization_and_extraction`: Validates extraction of components and symptoms from raw text.
- `test_negation_detection`: Validates that *"no smoke detected"* is ruled out and not flagged as electrical failure.
- `test_category_classification_mechanical`: Validates classification of spindle grinding faults.
- `test_operational_priority_detection`: Validates high-impact downtime phrase detection (*"production stopped"*).
- `test_technician_matching_and_explainability`: Validates availability filtering, composite ranking, and plain-English explainability bullets.
- `test_create_ticket_triggers_nlp`: Validates end-to-end API pipeline from raw submission to structured ticket creation.
- `test_assign_technician_lifecycle`: Validates assignment, availability status update, and audit event recording.
- `test_toggle_technician_availability`: Validates technician availability toggling endpoint.

Run tests:
```bash
cd backend
python manage.py test triage
# Result: Ran 12 tests in 15.3s -- OK
```

---

## License & Credits
Developed as an enterprise-grade industrial software architecture project. Built with React, Redux Toolkit, Three.js, Django REST Framework, and spaCy.
