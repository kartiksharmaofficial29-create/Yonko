from rest_framework import serializers
from .models import Machine, Technician, FaultTicket, TicketEvent


class MachineSerializer(serializers.ModelSerializer):
    ticket_count = serializers.SerializerMethodField()

    class Meta:
        model = Machine
        fields = ['id', 'name', 'machine_type', 'location', 'description', 'created_at', 'ticket_count']

    def get_ticket_count(self, obj):
        return obj.tickets.count()


class TechnicianSerializer(serializers.ModelSerializer):
    active_assignments_count = serializers.SerializerMethodField()

    class Meta:
        model = Technician
        fields = [
            'id', 'name', 'skills', 'expertise_description',
            'availability', 'contact_information', 'created_at',
            'active_assignments_count'
        ]

    def get_active_assignments_count(self, obj):
        return obj.assigned_tickets.exclude(status='Resolved').count()


class TicketEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketEvent
        fields = ['id', 'ticket', 'event_type', 'note', 'timestamp']


class FaultTicketSerializer(serializers.ModelSerializer):
    machine_details = MachineSerializer(source='machine', read_only=True)
    assigned_technician_details = TechnicianSerializer(source='assigned_technician', read_only=True)
    events = TicketEventSerializer(many=True, read_only=True)

    class Meta:
        model = FaultTicket
        fields = [
            'id', 'machine', 'machine_details', 'original_text', 'reporter',
            'extracted_fields', 'suggested_category', 'similarity_score',
            'priority', 'status', 'assigned_technician', 'assigned_technician_details',
            'resolution_note', 'created_at', 'updated_at', 'events'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TicketCreateSerializer(serializers.Serializer):
    machine_id = serializers.IntegerField(required=True)
    original_text = serializers.CharField(required=True, min_length=5)
    reporter = serializers.CharField(required=False, default='Operator')

    def validate_machine_id(self, value):
        if not Machine.objects.filter(id=value).exists():
            raise serializers.ValidationError(f"Machine with ID {value} does not exist.")
        return value


class TicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaultTicket
        fields = [
            'suggested_category', 'priority', 'status',
            'extracted_fields', 'resolution_note'
        ]
