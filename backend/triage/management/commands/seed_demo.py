import random
from django.core.management.base import BaseCommand
from triage.models import Machine, Technician, FaultTicket, TicketEvent
from triage.services.nlp_service import analyze_report


class Command(BaseCommand):
    help = "Seeds database with fictional industrial machines, technicians, and 60+ maintenance tickets."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Clearing existing demonstration data..."))
        TicketEvent.objects.all().delete()
        FaultTicket.objects.all().delete()
        Technician.objects.all().delete()
        Machine.objects.all().delete()

        self.stdout.write("Seeding Machines...")
        machines_data = [
            {"name": "CNC Lathe A1", "machine_type": "CNC", "location": "Bay 1 - Precision Machining", "description": "5-axis high precision CNC lathe for aerospace components."},
            {"name": "Vertical Machining Center VMC-02", "machine_type": "CNC", "location": "Bay 1 - Precision Machining", "description": "High-speed vertical milling center with automatic tool changer."},
            {"name": "Hydraulic Stamping Press 500T", "machine_type": "Press", "location": "Bay 2 - Heavy Forming", "description": "500-ton hydraulic sheet metal forming press."},
            {"name": "Mechanical Punch Press MP-10", "machine_type": "Press", "location": "Bay 2 - Heavy Forming", "description": "High speed mechanical blanking press."},
            {"name": "Conveyor Line Main Assembly", "machine_type": "Conveyor", "location": "Assembly Hall B", "description": "Continuous powered roller conveyor linking line 1 and packaging."},
            {"name": "Sub-Assembly Belt Conveyor C-04", "machine_type": "Conveyor", "location": "Assembly Hall B", "description": "Modular belt feeder conveyor for component staging."},
            {"name": "Industrial Boiler Steam-X", "machine_type": "Boiler", "location": "Utilities & Boiler Room", "description": "High pressure natural gas steam generation boiler."},
            {"name": "Rotary Screw Compressor RC-01", "machine_type": "Compressor", "location": "Pneumatic Plant Room", "description": "Continuous duty 120 PSI rotary screw air compressor."},
            {"name": "Plastic Injection Molding IM-08", "machine_type": "Injection Molding", "location": "Polymer Bay 4", "description": "Electric servo-driven injection molding machine."},
            {"name": "Robotic Welding Cell KUKA-4", "machine_type": "Robot Arm", "location": "Fabrication Bay 3", "description": "6-axis robotic welding arm with water-cooled MIG torch."},
            {"name": "Heavy Surface Grinder SG-12", "machine_type": "Grinder", "location": "Toolroom West", "description": "Hydraulic reciprocating table surface grinding machine."},
            {"name": "Automated Palletizer P-01", "machine_type": "Packaging", "location": "Dispatch Warehouse", "description": "High speed packaging and pallet wrapping system."}
        ]

        machines = []
        for m in machines_data:
            obj = Machine.objects.create(**m)
            machines.append(obj)
        self.stdout.write(self.style.SUCCESS(f"Created {len(machines)} industrial machines."))

        self.stdout.write("Seeding Technicians...")
        technicians_data = [
            {
                "name": "Rahul Sharma",
                "skills": ["Mechanical", "CNC maintenance", "spindle repair", "bearing replacement", "gearbox", "alignment"],
                "expertise_description": "Over 12 years specializing in high-speed CNC spindle rebuilds, precision bearings, and mechanical drive systems.",
                "availability": True,
                "contact_information": "Ext 401 | rahul.s@plant.internal"
            },
            {
                "name": "Vikram Patel",
                "skills": ["Mechanical", "Press maintenance", "punch press", "gearbox", "clutch", "lubrication"],
                "expertise_description": "Senior mechanical fitter with extensive background in stamping presses, mechanical blanking tools, and heavy flywheel drives.",
                "availability": True,
                "contact_information": "Ext 402 | vikram.p@plant.internal"
            },
            {
                "name": "Ananya Sen",
                "skills": ["Electrical", "VFD drives", "servo motor", "PLC troubleshooting", "wiring", "encoders"],
                "expertise_description": "Industrial electrical engineer specialized in Siemens and Fanuc servo drives, variable frequency controllers, and motion control.",
                "availability": True,
                "contact_information": "Ext 403 | ananya.s@plant.internal"
            },
            {
                "name": "David Martinez",
                "skills": ["Electrical", "high voltage", "circuit breakers", "transformers", "relays", "power supply"],
                "expertise_description": "Certified plant electrician handling main distribution panels, industrial contactors, switchgear, and safety interlocks.",
                "availability": False,  # Busy on planned maintenance
                "contact_information": "Ext 404 | david.m@plant.internal"
            },
            {
                "name": "Marcus Weber",
                "skills": ["Hydraulic", "hydraulic pump", "valves", "hydraulic cylinder", "pressure regulation", "fluid seals"],
                "expertise_description": "Hydraulic systems expert focusing on high-pressure proportional valves, Rexroth pump overhauls, and hydraulic manifold leaks.",
                "availability": True,
                "contact_information": "Ext 405 | marcus.w@plant.internal"
            },
            {
                "name": "Priya Nair",
                "skills": ["Hydraulic", "pneumatics", "hydraulic hoses", "actuators", "cavitation", "filter systems"],
                "expertise_description": "Fluid power technician with 8 years in hydraulic troubleshooting, cylinder seal kit replacements, and fluid contamination analysis.",
                "availability": True,
                "contact_information": "Ext 406 | priya.n@plant.internal"
            },
            {
                "name": "Siddharth Rao",
                "skills": ["Mechanical", "Electrical", "Robotics", "robot arm", "welding machine", "cable harness"],
                "expertise_description": "Mechatronics specialist managing KUKA and Fanuc robotic cells, robotic welders, and automated material handling.",
                "availability": True,
                "contact_information": "Ext 407 | siddharth.r@plant.internal"
            },
            {
                "name": "Carlos Gomez",
                "skills": ["Mechanical", "Conveyor maintenance", "roller bearings", "timing belt", "chain drives"],
                "expertise_description": "Plant maintenance technician specializing in continuous production conveyors, drive chain tensioning, and roller bearing replacements.",
                "availability": True,
                "contact_information": "Ext 408 | carlos.g@plant.internal"
            },
            {
                "name": "Elena Rostova",
                "skills": ["Electrical", "sensors", "proximity sensor", "optical sensor", "thermal fault", "limit switch"],
                "expertise_description": "Instrumentation technician focused on field sensors, safety light curtains, optical limit switches, and thermocouples.",
                "availability": False,  # Off-shift
                "contact_information": "Ext 409 | elena.r@plant.internal"
            },
            {
                "name": "Amit Deshmukh",
                "skills": ["Mechanical", "Compressor maintenance", "screw compressor", "valves", "boiler piping", "seals"],
                "expertise_description": "Facility utilities technician handling industrial air compressors, steam boilers, pressure relief valves, and cooling towers.",
                "availability": True,
                "contact_information": "Ext 410 | amit.d@plant.internal"
            }
        ]

        technicians = []
        for t in technicians_data:
            tech_obj = Technician.objects.create(**t)
            technicians.append(tech_obj)
        self.stdout.write(self.style.SUCCESS(f"Created {len(technicians)} technicians."))

        self.stdout.write("Generating 65 realistic maintenance reports and NLP triage analysis...")

        reports_seed = [
            # Mechanical Cases
            ("CNC Lathe A1", "CNC machine making grinding noise near spindle. Production stopped this morning.", "Rajesh Operator"),
            ("Vertical Machining Center VMC-02", "Spindle vibration is very high during rough cut. Bearings feel rough when rotated by hand.", "Arun Line 1"),
            ("CNC Lathe A1", "Cnc spindl making griding sound at high rpm. Heavy vibration felt on chuck.", "Amit Turn"),
            ("Conveyor Line Main Assembly", "Conveyor belt slipping on drive roller. Loud squealing sound and line halted.", "Sunil Packing"),
            ("Sub-Assembly Belt Conveyor C-04", "Drive belt snapped on conveyor feed. Assembly line halted completely.", "Kavita Staging"),
            ("Mechanical Punch Press MP-10", "Punch press flywheel makes clicking noise. Gears have backlash and binding.", "Devraj MP"),
            ("Heavy Surface Grinder SG-12", "Grinder table guide way has heavy chatter. Bearings in spindle motor making whining noise.", "Toolroom Tech"),
            ("CNC Lathe A1", "Spindle seized completely. Burning smell from belt, line stopped immediately.", "Deepak CNC"),
            ("Vertical Machining Center VMC-02", "Ball screw on Z-axis making rattling noise. Position error during rapid traverse.", "CNC Lead"),
            ("Automated Palletizer P-01", "Palletizer roller bearings seized on discharge section. Boxes jamming on belt.", "Warehouse Lead"),
            ("Sub-Assembly Belt Conveyor C-04", "Excessive slack in drive belt. Routine adjustment needed before night shift.", "Shift Supervisor"),
            ("Mechanical Punch Press MP-10", "Flywheel bearing has slight vibration. Minor play noted during morning inspection.", "Toolroom Lead"),
            ("Vertical Machining Center VMC-02", "Chipping sound inside gearbox when changing tool speeds. Intermittent grinding noise.", "Machinist"),
            ("CNC Lathe A1", "Tailstock lead screw binding when hand cranked. Jammed near end of stroke.", "Operator 4"),
            ("Conveyor Line Main Assembly", "Conveyor roller making squeaking noise, slight cosmetic belt wear noticed.", "Operator 2"),

            # Electrical Cases
            ("Vertical Machining Center VMC-02", "Drive motor tripped breaker on main panel. Burning smell detected near VFD cabinet.", "Kiran Electric"),
            ("CNC Lathe A1", "Servo motor throwing error code E-402 on X-axis. Machine will not start.", "Pooja Line 2"),
            ("Robotic Welding Cell KUKA-4", "Robot arm stopped moving mid weld. Sparks seen near wiring harness connector.", "Welding Super"),
            ("Plastic Injection Molding IM-08", "Heating bands not turning on. Tripped breaker in electrical enclosure, smoke detected.", "Molding Lead"),
            ("Industrial Boiler Steam-X", "Control panel completely dead. Blown fuse on main transformer input, no power to pumps.", "Boiler Tech"),
            ("Rotary Screw Compressor RC-01", "Compressor motor running hot and tripping thermal overload after 10 minutes.", "Facility Tech"),
            ("Automated Palletizer P-01", "Proximity sensor on pallet lift failing intermittently. Pallet stopped lifting.", "Warehouse Tech"),
            ("Vertical Machining Center VMC-02", "VFD inverter cooling fan stopped. High temperature alarm, machine halted.", "Maintenance 1"),
            ("Robotic Welding Cell KUKA-4", "Optical sensor misaligned on safety cage. Intermittent tripping of emergency stop.", "Safety Officer"),
            ("Plastic Injection Molding IM-08", "Limit switch on mold clamp loose. Tripped breaker when clamp closed.", "Tech Ajay"),
            ("CNC Lathe A1", "Encoder cable damaged by hot chips. Position error on Z-axis.", "CNC Tech"),
            ("Rotary Screw Compressor RC-01", "Pressure transducer signal fluctuating. Relay clicking rapidly in cabinet.", "Plant Mech"),
            ("Industrial Boiler Steam-X", "Thermocouple wire loose on burner tube. Small voltage fluctuation noted on meter.", "Operator 7"),
            ("Conveyor Line Main Assembly", "Emergency stop push button stuck down. Control relay not energizing.", "Line Lead"),
            ("Sub-Assembly Belt Conveyor C-04", "Motor terminal box has loose connection. Minor hum, needs electrician to check.", "Operator 9"),

            # Hydraulic Cases
            ("Hydraulic Stamping Press 500T", "Hydraulic press cylinder losing pressure. Major oil leak pooling on floor. Production stopped.", "Press Operator"),
            ("Heavy Surface Grinder SG-12", "Hydraulic pump making loud cavitation whining. Hydraulic leak under reservoir tank.", "Grinder Operator"),
            ("Plastic Injection Molding IM-08", "Clamp cylinder pressure drop during injection phase. Hydraulic hose bulging.", "Molding Tech"),
            ("Hydraulic Stamping Press 500T", "Presure dropping fast on hydralic line. Relief valve chattering violently.", "Bay 2 Super"),
            ("Heavy Surface Grinder SG-12", "Hydraulic manifold leaking oil onto bed. Low pressure alarm triggered.", "Machinist 3"),
            ("Plastic Injection Molding IM-08", "Hydraulic fluid temperature rising rapidly. Foaming fluid in sight glass.", "Polymer Tech"),
            ("Hydraulic Stamping Press 500T", "Solenoid valve stuck on return stroke. Ram not returning to top position.", "Press Lead"),
            ("Heavy Surface Grinder SG-12", "Hydraulic leak from fitting near table piston. Small puddle noticed.", "Shop Hand"),
            ("Plastic Injection Molding IM-08", "Hydraulic pump vibrating heavily with spongy response on ram.", "Operator Vinod"),
            ("Hydraulic Stamping Press 500T", "Hydraulic hose ruptured near main valve. Complete stoppage of line 2.", "Emergency Call"),
            ("Heavy Surface Grinder SG-12", "Filter dirty indicator light on hydraulic return line. Minor drip from seal.", "Inspector"),
            ("Hydraulic Stamping Press 500T", "Slight oil drip from piston gland seal. Machine operational but needs seal replacement.", "Bay 2 Inspector"),
            ("Plastic Injection Molding IM-08", "Hydraulic pressure fluctuating slightly between cycles. Oil level slightly low.", "Operator 11"),
            ("Hydraulic Stamping Press 500T", "Cavitation noise from suction strainer. Fluid level low in main reservoir.", "Shift Tech"),
            ("Heavy Surface Grinder SG-12", "Table traverse speed slow due to hydraulic valve sticking intermittently.", "Toolroom Lead"),

            # Negation Cases (Critical for Testing Negation Handling)
            ("CNC Lathe A1", "No smoke detected near the motor, but loud grinding noise from spindle.", "Operator Gaurav"),
            ("Vertical Machining Center VMC-02", "Loud vibration in headstock, but no oil leak seen under machine.", "Machinist Ramesh"),
            ("Industrial Boiler Steam-X", "Pressure drop noticed in steam line, without any burning smell or fire hazard.", "Boiler Lead"),
            ("Robotic Welding Cell KUKA-4", "Robot axis 3 jerking during rotation. No sparks or smoke observed.", "Automation Tech"),
            ("Hydraulic Stamping Press 500T", "Hydraulic pump whining loudly. Checked for leaks, no fluid leak found.", "Bay 2 Mech"),
            ("Rotary Screw Compressor RC-01", "Compressor motor running hot. No tripped breaker yet, production continuing.", "Facilities"),
            ("Plastic Injection Molding IM-08", "Clamp movement sluggish. No hydraulic leak detected around valves.", "Molding Operator"),
            ("Sub-Assembly Belt Conveyor C-04", "Conveyor belt tracking off-center. No bearing noise heard.", "Line 1 Operator"),
            ("Mechanical Punch Press MP-10", "Knocking sound from crank. No gear teeth broken upon visual inspection.", "Press Tech"),
            ("Heavy Surface Grinder SG-12", "Table speed uneven. No pressure drop on hydraulic gauge.", "Grinder Hand"),

            # Ambiguous / Unknown Cases (Essential for Testing 'Unknown' Classification & Fallbacks)
            ("CNC Lathe A1", "Machine making weird sound since morning. Operator requested supervisor check.", "Operator 1"),
            ("Conveyor Line Main Assembly", "General check requested for shift change. Machine feels different.", "Shift Super"),
            ("Automated Palletizer P-01", "Inspection needed on packaging area. Please send maintenance when free.", "Warehouse Shift"),
            ("Robotic Welding Cell KUKA-4", "Robot stopped suddenly yesterday afternoon. Unclear reason.", "Fab Lead"),
            ("Industrial Boiler Steam-X", "Routine check requested before winter production run.", "Plant Admin"),
            ("Vertical Machining Center VMC-02", "Something sounds unusual near back of machine. Need advice.", "Apprentice"),
            ("Plastic Injection Molding IM-08", "Part dimensions out of tolerance today. Not sure which section.", "QC Inspector"),
            ("Rotary Screw Compressor RC-01", "Scheduled preventive check for pneumatic air supply.", "Maintenance Desk"),
            ("Heavy Surface Grinder SG-12", "Surface finish on sample part not meeting specs.", "QC Tech"),
            ("Mechanical Punch Press MP-10", "Machine operator reported strange feeling during high speed stroke.", "Safety Rep")
        ]

        created_count = 0
        statuses_cycle = ["Open", "Open", "Assigned", "In Progress", "Resolved"]

        for i, (m_name, raw_text, reporter) in enumerate(reports_seed):
            machine_obj = next((m for m in machines if m.name == m_name), machines[0])
            nlp_res = analyze_report(raw_text, machine_hint=machine_obj.machine_type)

            ticket_status = statuses_cycle[i % len(statuses_cycle)]
            assigned_tech = None

            # If Assigned, In Progress or Resolved, assign suitable available technician
            if ticket_status in ["Assigned", "In Progress", "Resolved"]:
                cat = nlp_res["suggested_category"]
                matching_techs = [t for t in technicians if any(cat.lower() in s.lower() for s in t.skills)]
                if matching_techs:
                    assigned_tech = random.choice(matching_techs)

            resolution_note = ""
            if ticket_status == "Resolved":
                resolution_note = "Component inspected, worn part replaced, tested under full operational load. Cleared for production."

            ticket = FaultTicket.objects.create(
                machine=machine_obj,
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
                status=ticket_status,
                assigned_technician=assigned_tech,
                resolution_note=resolution_note
            )

            # Create event history
            TicketEvent.objects.create(
                ticket=ticket,
                event_type='TICKET_CREATED',
                note=f"Report submitted by {reporter} for {machine_obj.name}."
            )
            TicketEvent.objects.create(
                ticket=ticket,
                event_type='NLP_ANALYZED',
                note=f"NLP parsed as {ticket.suggested_category} ({ticket.priority} priority). {nlp_res['category_explanation']}"
            )

            if assigned_tech:
                TicketEvent.objects.create(
                    ticket=ticket,
                    event_type='TECHNICIAN_ASSIGNED',
                    note=f"Assigned technician {assigned_tech.name} based on matching skills."
                )

            if ticket_status == "In Progress":
                TicketEvent.objects.create(
                    ticket=ticket,
                    event_type='STATUS_CHANGED',
                    note=f"Technician {assigned_tech.name if assigned_tech else 'Assigned staff'} began diagnostics on site."
                )
            elif ticket_status == "Resolved":
                TicketEvent.objects.create(
                    ticket=ticket,
                    event_type='STATUS_CHANGED',
                    note="Status changed to Resolved."
                )
                TicketEvent.objects.create(
                    ticket=ticket,
                    event_type='RESOLUTION_ADDED',
                    note=f"Resolution note: {resolution_note}"
                )

            created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} maintenance tickets with full NLP analysis and event logs!"))
