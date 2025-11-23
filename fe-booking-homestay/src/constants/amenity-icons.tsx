import {
  AirVent,
  Bath,
  Bed,
  BedDouble,
  BedSingle,
  Building2,
  Coffee,
  Columns2,
  Dumbbell,
  Fan,
  Flame,
  Heater,
  House,
  Microwave,
  ParkingCircle,
  Refrigerator,
  ShowerHead,
  SoapDispenserDroplet,
  Sofa,
  StickyNote,
  Sun,
  Table,
  Tv,
  Utensils,
  WashingMachine,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";

export function getAmenityIcon(name: string) {
  switch (name.toLowerCase()) {
    case "wifi":
      return <Wifi className="h-4 w-4" />;
    case "air conditioner":
      return <AirVent className="h-4 w-4" />;
    case "heating":
      return <Heater className="h-4 w-4" />;
    case "television":
      return <Tv className="h-4 w-4" />;
    case "refrigerator":
      return <Refrigerator className="h-4 w-4" />;
    case "microwave":
      return <Microwave className="h-4 w-4" />;
     case "washing machine":
      return <WashingMachine className="h-4 w-4" />;
    case "iron":
      return <Flame className="h-4 w-4" />;
    case "bath tub":
      return <Bath className="h-4 w-4" />;
    case "hair dryer":
      return <Wind className="h-4 w-4" />;
    case "shower":
      return <ShowerHead className="h-4 w-4" />;
    case "bath tub":
      return <Bath className="h-4 w-4" />;
    case "toiletries":
      return <SoapDispenserDroplet className="h-4 w-4" />;
    case "toilet paper":
      return <StickyNote className="h-4 w-4" />;
    case "wardrobe":
      return <Columns2 className="h-4 w-4" />;
    case "desk":
      return <Table className="h-4 w-4" />;
    case "parking":
      return <ParkingCircle className="h-4 w-4" />;
    case "elevator":
      return <Building2 className="h-4 w-4" />;
    case "swimming pool":
      return <Waves className="h-4 w-4" />;
    case "gym":
      return <Dumbbell className="h-4 w-4" />;
    case "bed":
      return <Bed className="h-4 w-4" />;
    case "double bed":
      return <BedDouble className="h-4 w-4" />;
    case "single bed":
      return <BedSingle className="h-4 w-4" />;
    case "sofa bed":
      return <Sofa className="h-4 w-4" />;
    case "balcony":
      return <Sun className="h-4 w-4" />;
    case "breakfast":
      return <Utensils className="h-4 w-4" />;
    case "fan":
      return <Fan className="h-4 w-4" />;
    case "coffee maker":
      return <Coffee className="h-4 w-4" />;
    default:
      return <House className="h-4 w-4" />;
  }
}
