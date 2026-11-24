from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Machine, Technician, FaultTicket, TicketEvent
from .serializers import (
    MachineSerializer,
    TechnicianSerializer,
    FaultTicketSerializer,
    TicketEventSerializer,
    TicketCreateSerializer,
    TicketUpdateSerializer
)
from .services.nlp_service import analyze_report
from .services.matching_service import recommend_technicians


class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(machine_type__icontains=search) |
                Q(location__icontains=search)
            )
        return qs


class TechnicianViewSet(viewsets.ModelViewSet):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        available_only = self.request.query_params.get('available', None)
        if available_only is not None and available_only.lower() in ['true', '1']:
            qs = qs.filter(availability=True)
        search = self.request.query_params.get('search', None)
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(expertise_description__icontains=search)
            )
        return qs

    @action(detail=True, methods=['post'])
    def toggle_availability(self, request, pk=None):
        technician = self.get_object()
        technician.availability = not technician.availability
        technician.save()
        return Response({
            "id": technician.id,
            "name": technician.name,
            "availability": technician.availability,
            "message": f"Technician is now {'Available' if technician.availability else 'Busy'}."
        })


class FaultTicketViewSet(viewsets.ModelViewSet):
    queryset = FaultTicket.objects.select_related('machine', 'assigned_technician').prefetch_related('events').all()
    serializer_class = FaultTicketSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status', None)
        priority_param = self.request.query_params.get('priority', None)
        category_param = self.request.query_params.get('category', None)
        machine_id = self.request.query_params.get('machine_id', None)
        search = self.request.query_params.get('search', None)

        if status_param:
            qs = qs.filter(status=status_param)
        if priority_param:
            qs = qs.filter(priority=priority_param)
        if category_param:
            qs = qs.filter(suggested_category=category_param)
        if machine_id:
            qs = qs.filter(machine_id=machine_id)
        if search:
            qs = qs.filter(
                Q(original_text__icontains=search) |
                Q(reporter__icontains=search) |
                Q(machine__name__icontains=search)
            )
        return qs

    def create(self, request, *args, **kwargs):
        serializer = TicketCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        machine = Machine.objects.get(id=data['machine_id'])
        raw_text = data['original_text']
        reporter = data.get('reporter', 'Operator')

        # Run real NLP analysis
        nlp_res = analyze_report(raw_text, machine_hint=machine.machine_type)

        ticket = FaultTicket.objects.create(
            machine=machine,
            original_text=raw_text,
            reporter=reporter,
            extracted_fields={
                "machine": nlp_res["extracted_machine"],
                "components": nlp_res["components"],
                "symptoms": nlp_res["symptoms"],
                "negated_symptoms": nlp_res["negated_symptoms"],
                "production_impact": nlp_res["production_impact"],
                "triggering_phrase": nlp_res["triggering_phrase"],
                "category_explanation": nlp_res["category_explanation"],
                "priority_explanation": nlp_res["priority_explanation"],
                "missing_information": nlp_res["missing_information"],
            },
            suggested_category=nlp_res["suggested_category"],
            similarity_score=nlp_res["similarity_score"],
            priority=nlp_res["priority"],
            status='Open'
        )

        # Log Ticket Creation Event
        TicketEvent.objects.create(
            ticket=ticket,
            event_type='TICKET_CREATED',
            note=f"Maintenance request submitted for {machine.name} by {reporter}."
        )

        # Log NLP Analysis Event
        TicketEvent.objects.create(
            ticket=ticket,
            event_type='NLP_ANALYZED',
            note=f"NLP parsed: Category='{ticket.suggested_category}', Priority='{ticket.priority}'. {nlp_res['category_explanation']}"
        )

        return Response(FaultTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        ticket = self.get_object()
        nlp_res = analyze_report(ticket.original_text, machine_hint=ticket.machine.machine_type)

        ticket.extracted_fields = {
            "machine": nlp_res["extracted_machine"],
            "components": nlp_res["components"],
            "symptoms": nlp_res["symptoms"],
            "negated_symptoms": nlp_res["negated_symptoms"],
            "production_impact": nlp_res["production_impact"],
            "triggering_phrase": nlp_res["triggering_phrase"],
            "category_explanation": nlp_res["category_explanation"],
            "priority_explanation": nlp_res["priority_explanation"],
            "missing_information": nlp_res["missing_information"],
        }
        ticket.suggested_category = nlp_res["suggested_category"]
        ticket.similarity_score = nlp_res["similarity_score"]
        ticket.priority = nlp_res["priority"]
        ticket.save()

        TicketEvent.objects.create(
            ticket=ticket,
            event_type='NLP_ANALYZED',
            note=f"Re-analyzed report with updated NLP pipeline. Category set to {ticket.suggested_category}."
        )

        return Response(FaultTicketSerializer(ticket).data)

    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        ticket = self.get_object()
        limit = int(request.query_params.get('limit', 5))
        recommendations = recommend_technicians(ticket, limit=limit)
        return Response({
            "ticket_id": ticket.id,
            "machine": ticket.machine.name,
            "category": ticket.suggested_category,
            "priority": ticket.priority,
            "total_available_technicians": Technician.objects.filter(availability=True).count(),
            "recommendations": recommendations
        })

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        tech_id = request.data.get('technician_id')
        if not tech_id:
            return Response({"error": "technician_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        technician = get_object_or_404(Technician, id=tech_id)
        ticket.assigned_technician = technician
        if ticket.status == 'Open':
            ticket.status = 'Assigned'
        ticket.save()

        TicketEvent.objects.create(
            ticket=ticket,
            event_type='TECHNICIAN_ASSIGNED',
            note=f"Supervisor assigned technician {technician.name} to ticket #{ticket.id}."
        )

        return Response({
            "message": f"Technician {technician.name} successfully assigned to ticket #{ticket.id}.",
            "ticket": FaultTicketSerializer(ticket).data
        })

    @action(detail=True, methods=['post'])
    def status_update(self, request, pk=None):
        ticket = self.get_object()
        new_status = request.data.get('status')
        resolution_note = request.data.get('resolution_note', '')

        valid_statuses = [c[0] for c in FaultTicket.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({"error": f"Invalid status '{new_status}'. Allowed: {valid_statuses}"}, status=status.HTTP_400_BAD_REQUEST)

        old_status = ticket.status
        ticket.status = new_status
        if resolution_note:
            ticket.resolution_note = resolution_note
        ticket.save()

        note_msg = f"Status transitioned from '{old_status}' to '{new_status}'."
        if resolution_note:
            note_msg += f" Resolution note: {resolution_note}"

        TicketEvent.objects.create(
            ticket=ticket,
            event_type='STATUS_CHANGED' if not resolution_note else 'RESOLUTION_ADDED',
            note=note_msg
        )

        return Response(FaultTicketSerializer(ticket).data)

    @action(detail=True, methods=['get'])
    def events(self, request, pk=None):
        ticket = self.get_object()
        events = ticket.events.all()
        return Response(TicketEventSerializer(events, many=True).data)


class DashboardView(APIView):
    def get(self, request):
        total_tickets = FaultTicket.objects.count()
        open_tickets = FaultTicket.objects.filter(status='Open').count()
        assigned_tickets = FaultTicket.objects.filter(status='Assigned').count()
        in_progress_tickets = FaultTicket.objects.filter(status='In Progress').count()
        resolved_tickets = FaultTicket.objects.filter(status='Resolved').count()
        high_priority_tickets = FaultTicket.objects.filter(priority='High').count()

        status_distribution = list(
            FaultTicket.objects.values('status').annotate(count=Count('status'))
        )
        priority_distribution = list(
            FaultTicket.objects.values('priority').annotate(count=Count('priority'))
        )
        category_distribution = list(
            FaultTicket.objects.values('suggested_category').annotate(count=Count('suggested_category'))
        )

        recent_tickets = FaultTicket.objects.select_related('machine', 'assigned_technician')[:6]
        recent_events = TicketEvent.objects.select_related('ticket')[:8]

        return Response({
            "metrics": {
                "total_tickets": total_tickets,
                "open_tickets": open_tickets,
                "assigned_tickets": assigned_tickets,
                "in_progress_tickets": in_progress_tickets,
                "resolved_tickets": resolved_tickets,
                "high_priority_tickets": high_priority_tickets,
            },
            "status_distribution": status_distribution,
            "priority_distribution": priority_distribution,
            "category_distribution": category_distribution,
            "recent_tickets": FaultTicketSerializer(recent_tickets, many=True).data,
            "recent_events": TicketEventSerializer(recent_events, many=True).data,
            "technician_summary": {
                "total": Technician.objects.count(),
                "available": Technician.objects.filter(availability=True).count(),
                "busy": Technician.objects.filter(availability=False).count(),
            },
            "machine_count": Machine.objects.count()
        })


class AuthView(APIView):
    def post(self, request):
        username = request.data.get('username', 'supervisor').strip()
        password = request.data.get('password', 'demo1234')

        # Auto-create or login supervisor/admin for seamless local demo
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'is_staff': True, 'first_name': 'Maintenance', 'last_name': 'Supervisor'}
        )
        if created:
            user.set_password(password)
            user.save()

        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "role": "Supervisor" if not user.is_superuser else "Administrator",
                "name": f"{user.first_name} {user.last_name}".strip() or user.username
            },
            "token": f"repairradar-token-{user.id}-session",
            "message": "Authentication successful"
        })

    def get(self, request):
        return Response({
            "user": {
                "id": 1,
                "username": "supervisor",
                "role": "Supervisor",
                "name": "Maintenance Supervisor"
            }
        })
