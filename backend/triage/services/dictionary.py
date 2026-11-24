"""
Industrial maintenance domain dictionaries and keyword taxonomies for RepairRadar.
"""

MACHINE_TAXONOMY = {
    "CNC": ["cnc", "cnc machine", "cnc milling", "cnc lathe", "machining center", "vnc", "cnc router"],
    "Lathe": ["lathe", "manual lathe", "turning machine", "engine lathe"],
    "Milling": ["milling machine", "mill", "vertical mill", "horizontal mill"],
    "Press": ["press", "hydraulic press", "stamping press", "mechanical press", "punch press", "power press"],
    "Conveyor": ["conveyor", "conveyor belt", "roller conveyor", "assembly conveyor", "belt conveyor"],
    "Boiler": ["boiler", "industrial boiler", "steam boiler", "heating boiler"],
    "Compressor": ["compressor", "air compressor", "screw compressor", "reciprocating compressor"],
    "Injection Molding": ["injection molding", "molding machine", "plastic injection"],
    "Robot Arm": ["robot arm", "industrial robot", "articulated robot", "pick and place robot"],
    "Welder": ["welder", "welding machine", "robotic welder", "mig welder", "tig welder"],
    "Grinder": ["grinder", "surface grinder", "cylindrical grinder", "tool grinder"],
    "Packaging": ["packaging machine", "palletizer", "wrapper", "cartoner", "sealer"],
}

COMPONENT_KEYWORDS = [
    "spindle", "bearing", "bearings", "ball bearing", "roller bearing",
    "motor", "drive motor", "servo motor", "electric motor", "stepper motor",
    "gearbox", "gears", "planetary gear", "pinion",
    "pump", "hydraulic pump", "coolant pump", "oil pump", "water pump",
    "valve", "solenoid valve", "relief valve", "check valve", "proportional valve",
    "coolant line", "coolant hose", "coolant nozzle",
    "hose", "hydraulic hose", "pneumatic line", "air line",
    "cylinder", "hydraulic cylinder", "pneumatic cylinder", "ram",
    "belt", "conveyor belt", "drive belt", "timing belt", "v-belt",
    "fuse", "relay", "breaker", "circuit breaker", "contactor",
    "vfd", "inverter", "variable frequency drive", "servo drive",
    "sensor", "proximity sensor", "optical sensor", "limit switch", "thermocouple",
    "encoder", "rotary encoder", "linear scale",
    "transformer", "power supply", "wiring", "cable harness",
    "heat exchanger", "radiator", "cooling tower",
    "filter", "oil filter", "air filter", "suction filter",
    "seal", "oil seal", "o-ring", "gasket", "mechanical seal",
    "piston", "manifold", "chuck", "collet", "tool holder",
    "lead screw", "ball screw", "linear guide", "way cover",
    "lubrication system", "grease line", "lube pump"
]

SYMPTOM_KEYWORDS = [
    "grinding noise", "grinding sound", "abnormal vibration", "heavy vibration", "excessive vibration",
    "overheating", "hot to touch", "running hot", "thermal fault", "high temperature",
    "smoke", "burning smell", "charred smell", "electrical smell",
    "oil leak", "fluid leak", "hydraulic leak", "coolant leak", "water leak", "dripping",
    "pressure drop", "low pressure", "loss of pressure", "zero pressure", "pressure surge",
    "no power", "will not start", "fails to start", "dead", "power loss",
    "erratic movement", "stuck", "jammed", "stalled", "seized", "binding",
    "tripping", "tripped breaker", "blown fuse", "overload trip",
    "clicking noise", "squealing", "whining", "rattling", "knocking", "chattering",
    "cavitation", "foaming fluid", "spongy response",
    "misaligned", "wobble", "runout", "slack", "loose",
    "sparks", "arcing", "voltage fluctuation", "unresponsive", "position error"
]

IMPACT_PATTERNS = {
    "High": [
        "production stopped", "production halted", "line stopped", "line down", "line halted",
        "assembly line halted", "emergency stop", "e-stop activated", "safety risk",
        "hazardous", "smoking heavily", "fire hazard", "complete stoppage", "stalled line",
        "plant halted", "operations suspended", "spindle seized completely", "breaker repeatedly tripping",
        "massive oil leak", "dangerous vibration", "immediate danger"
    ],
    "Medium": [
        "intermittent", "slow cycle time", "running hot", "reduced speed", "quality defects",
        "unusual noise", "pressure fluctuating", "leaking slowly", "frequent tripping",
        "partially seized", "rough finish", "position deviation", "temperature rising",
        "operator noted smell", "excessive noise", "inconsistent pressure"
    ],
    "Low": [
        "minor noise", "inspection needed", "routine check", "cosmetic", "paint peeling",
        "filter dirty", "scheduled maintenance", "small drip", "slight vibration",
        "preventive inspection", "indicator light flickers", "dust buildup", "wear warning",
        "oil level slightly low", "minor slack in belt"
    ]
}

CATEGORY_DESCRIPTIONS = {
    "Mechanical": (
        "Mechanical failure involving physical parts such as spindle, bearings, gearbox, gears, "
        "belts, lead screws, chucks, grinding noise, abnormal vibration, mechanical seizure, "
        "slack, misalignment, physical jamming, and mechanical friction."
    ),
    "Electrical": (
        "Electrical failure involving drive motors, servo motors, inverters, VFD drives, circuit breakers, "
        "blown fuses, relays, contactors, power supply, sensors, encoders, transformers, wiring, "
        "sparks, electrical burning smell, and sudden loss of electrical power."
    ),
    "Hydraulic": (
        "Hydraulic and fluid power failure involving hydraulic pumps, oil leaks, hydraulic cylinders, "
        "pressure drops, burst hydraulic hoses, relief valves, cavitation, fluid foaming, manifolds, "
        "and pneumatic fluid pressure loss."
    )
}

COMMON_SPELLING_CORRECTIONS = {
    "griding": "grinding",
    "spindl": "spindle",
    "overhiting": "overheating",
    "overheeting": "overheating",
    "leek": "leak",
    "leking": "leaking",
    "vibrashun": "vibration",
    "viberation": "vibration",
    "hydralic": "hydraulic",
    "hydrualic": "hydraulic",
    "presure": "pressure",
    "motar": "motor",
    "pumpe": "pump",
    "cylender": "cylinder",
    "beering": "bearing",
    "baring": "bearing",
    "braker": "breaker",
    "senser": "sensor"
}
