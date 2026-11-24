from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from triage.models import Machine, Technician, FaultTicket, TicketEvent
from triage.services.nlp_service import analyze_report, is_negated, normalize_text
from triage.services.matching_service import recommend_technicians


class NLPServiceTests(TestCase):
    def test_text_normalization_and_spelling(self):
        raw = "cnc spindl making griding sound at high rpm."
        normalized = normalize_text(raw)
        self.assertIn("spindle", normalized)
        self.assertIn("grinding", normalized)

    def test_negation_handling(self):
        # "No smoke detected near the motor" must NOT classify smoke as confirmed symptom
        text = "No smoke detected near the motor, but loud grinding noise from spindle."
        res = analyze_report(text, machine_hint="CNC")
        self.assertIn("grinding noise", res["symptoms"])
        self.assertNotIn("smoke", res["symptoms"])
        self.assertIn("smoke", res["negated_symptoms"])

    def test_category_classification_mechanical(self):
        text = "CNC machine making grinding noise near spindle. Production stopped."
        res = analyze_report(text, machine_hint="CNC")
        self.assertEqual(res["suggested_category"], "Mechanical")
        self.assertEqual(res["priority"], "High")
        self.assertIn("production stopped", res["triggering_phrase"].lower())

    def test_category_classification_electrical(self):
        text = "Drive motor tripped breaker on main panel. VFD inverter error code."
        res = analyze_report(text, machine_hint="VMC")
        self.assertEqual(res["suggested_category"], "Electrical")

    def test_category_classification_hydraulic(self):
        text = "Hydraulic press cylinder losing pressure. Oil leak pooling on floor."
        res = analyze_report(text, machine_hint="Press")
        self.assertEqual(res["suggested_category"], "Hydraulic")

    def test_unknown_classification_for_weak_match(self):
        text = "General inspection requested for shift change. Please check machine."
        res = analyze_report(text, machine_hint="")
        self.assertEqual(res["suggested_category"], "Unknown")
        self.assertTrue(len(res["missing_information"]) > 0)


class TechnicianMatchingTests(TestCase):
    def setUp(self):
        self.machine = Machine.objects.create(
            name="CNC Lathe Test",
            machine_type="CNC",
            location="Bay 1"
        )
        self.tech_rahul = Technician.objects.create(
            name="Rahul Sharma",
            skills=["Mechanical", "CNC maintenance", "spindle repair", "bearing replacement"],
            expertise_description="Specialist in high speed CNC spindles and precision bearings.",
            availability=True
        )
        self.tech_marcus = Technician.objects.create(
            name="Marcus Weber",
            skills=["Hydraulic", "valves", "pumps"],
            expertise_description="Hydraulic specialist.",
            availability=True
        )
        self.tech_busy = Technician.objects.create(
            name="Busy Specialist",
            skills=["Mechanical", "spindle repair"],
            expertise_description="Senior spindle tech.",
            availability=False  # Busy
        )

    def test_recommend_available_only(self):
        ticket = FaultTicket.objects.create(
            machine=self.machine,
            original_text="CNC spindle making grinding noise.",
            extracted_fields={"components": ["spindle"], "symptoms": ["grinding noise"]},
            suggested_category="Mechanical"
        )
        recs = recommend_technicians(ticket)
        tech_ids = [r["technician_id"] for r in recs]
        self.assertIn(self.tech_rahul.id, tech_ids)
        # Busy technician must NOT be recommended
        self.assertNotIn(self.tech_busy.id, tech_ids)

    def test_matching_explanation_provided(self):
        ticket = FaultTicket.objects.create(
            machine=self.machine,
            original_text="CNC spindle making grinding noise.",
            extracted_fields={"components": ["spindle"], "symptoms": ["grinding noise"]},
            suggested_category="Mechanical"
        )
        recs = recommend_technicians(ticket)
        top_rec = recs[0]
        self.assertEqual(top_rec["name"], "Rahul Sharma")
        self.assertTrue(len(top_rec["explanation"]) >= 2)
        self.assertTrue(0 <= top_rec["ranking_score"] <= 100)


class APITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.machine = Machine.objects.create(
            name="Press 100T",
            machine_type="Press",
            location="Bay 2"
        )
        self.technician = Technician.objects.create(
            name="Vikram Patel",
            skills=["Mechanical", "Press maintenance"],
            expertise_description="Press specialist",
            availability=True
        )

    def test_create_ticket_triggers_nlp(self):
        payload = {
            "machine_id": self.machine.id,
            "original_text": "Punch press flywheel makes clicking noise. Line halted.",
            "reporter": "Test Operator"
        }
        response = self.client.post('/api/tickets/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["suggested_category"], "Mechanical")
        self.assertEqual(response.data["priority"], "High")
        self.assertEqual(response.data["status"], "Open")

    def test_dashboard_metrics(self):
        FaultTicket.objects.create(
            machine=self.machine,
            original_text="Testing ticket 1",
            status="Open",
            priority="High",
            suggested_category="Mechanical"
        )
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["metrics"]["total_tickets"], 1)
        self.assertEqual(response.data["metrics"]["open_tickets"], 1)
        self.assertEqual(response.data["metrics"]["high_priority_tickets"], 1)

    def test_assign_technician_workflow(self):
        ticket = FaultTicket.objects.create(
            machine=self.machine,
            original_text="Testing assign",
            status="Open"
        )
        payload = {"technician_id": self.technician.id}
        response = self.client.post(f'/api/tickets/{ticket.id}/assign/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.assigned_technician_id, self.technician.id)
        self.assertEqual(ticket.status, "Assigned")

    def test_status_update_workflow(self):
        ticket = FaultTicket.objects.create(
            machine=self.machine,
            original_text="Testing status",
            status="Assigned"
        )
        payload = {
            "status": "Resolved",
            "resolution_note": "Replaced faulty seal."
        }
        response = self.client.post(f'/api/tickets/{ticket.id}/status_update/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, "Resolved")
        self.assertEqual(ticket.resolution_note, "Replaced faulty seal.")
