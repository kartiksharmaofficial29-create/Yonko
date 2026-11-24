from django.db import models


class Machine(models.Model):
    name = models.CharField(max_length=150)
    machine_type = models.CharField(max_length=100)
    location = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.machine_type}) - {self.location}"


class Technician(models.Model):
    name = models.CharField(max_length=150)
    skills = models.JSONField(default=list, help_text="List of skills/specializations")
    expertise_description = models.TextField(blank=True, default='')
    availability = models.BooleanField(default=True)
    contact_information = models.CharField(max_length=200, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        status = "Available" if self.availability else "Busy"
        return f"{self.name} [{status}]"


class FaultTicket(models.Model):
    CATEGORY_CHOICES = [
        ('Mechanical', 'Mechanical'),
        ('Electrical', 'Electrical'),
        ('Hydraulic', 'Hydraulic'),
        ('Unknown', 'Unknown'),
    ]

    PRIORITY_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]

    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Assigned', 'Assigned'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]

    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='tickets')
    original_text = models.TextField(help_text="Unmodified user report text")
    reporter = models.CharField(max_length=150, default='Operator')
    extracted_fields = models.JSONField(default=dict, blank=True)
    suggested_category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Unknown')
    similarity_score = models.FloatField(default=0.0)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Open')
    assigned_technician = models.ForeignKey(
        Technician,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tickets'
    )
    resolution_note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Ticket #{self.id} - {self.machine.name} [{self.status}]"


class TicketEvent(models.Model):
    EVENT_TYPES = [
        ('TICKET_CREATED', 'Ticket Created'),
        ('NLP_ANALYZED', 'NLP Analyzed'),
        ('TECHNICIAN_ASSIGNED', 'Technician Assigned'),
        ('STATUS_CHANGED', 'Status Changed'),
        ('FIELDS_EDITED', 'Fields Edited'),
        ('RESOLUTION_ADDED', 'Resolution Added'),
    ]

    ticket = models.ForeignKey(FaultTicket, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    note = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Event {self.event_type} on Ticket #{self.ticket_id} at {self.timestamp}"
