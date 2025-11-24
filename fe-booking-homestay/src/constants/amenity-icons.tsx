import {
  AirVent,
  Bath,
  Building2,
  Coffee,
  CoffeeIcon,
  Droplets,
  Dumbbell,
  Fan,
  Hammer,
  Heater,
  Home,
  Microwave,
  Notebook,
  ParkingCircle,
  Refrigerator,
  Shirt,
  ShowerHead,
  Sofa,
  Toilet,
  Trees,
  Tv,
  Utensils,
  WashingMachine,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";
import { JSX } from "react";

export const AMENITY_ICONS: Record<string, JSX.Element> = {
  Wifi: <Wifi className="w-4 h-4" />,
  "Air Conditioner": <AirVent className="w-4 h-4" />,
  Heating: <Heater className="w-4 h-4" />,
  Television: <Tv className="w-4 h-4" />,
  Refrigerator: <Refrigerator className="w-4 h-4" />,
  Microwave: <Microwave className="w-4 h-4" />,
  Kitchen: <Utensils className="w-4 h-4" />,
  "Washing Machine": <WashingMachine className="w-4 h-4" />,
  Iron: <Hammer className="w-4 h-4" />,
  "Hair Dryer": <Wind className="w-4 h-4" />,

  Shower: <ShowerHead className="w-4 h-4" />,
  "Bath Tub": <Bath className="w-4 h-4" />,
  Toiletries: <Droplets className="w-4 h-4" />,
  "Toilet Paper": <Toilet className="w-4 h-4" />,

  Wardrobe: <Shirt className="w-4 h-4" />,
  Desk: <Notebook className="w-4 h-4" />,
  "Sofa Bed": <Sofa className="w-4 h-4" />,

  Balcony: <Trees className="w-4 h-4" />,
  Parking: <ParkingCircle className="w-4 h-4" />,
  Elevator: <Building2 className="w-4 h-4" />,
  "Swimming Pool": <Waves className="w-4 h-4" />,
  Gym: <Dumbbell className="w-4 h-4" />,
  Breakfast: <Coffee className="w-4 h-4" />,
  "Coffee Maker": <CoffeeIcon className="w-4 h-4" />,
  Fan: <Fan className="w-4 h-4" />,

  default: <Home className="w-4 h-4 text-muted-foreground" />,
};

export function getAmenityIcon(name: string) {
  return AMENITY_ICONS[name] ?? AMENITY_ICONS.default;
}
