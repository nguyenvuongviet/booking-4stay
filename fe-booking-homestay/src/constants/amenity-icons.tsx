import {
  AirVent,
  Bath,
  Building2,
  Coffee,
  CoffeeIcon,
  Droplets,
  Dumbbell,
  Fan,
  Flame,
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
import type { JSX } from "react";

export const AMENITY_ICONS: Record<string, JSX.Element> = {
  Wifi: <Wifi className="w-4 h-4 text-blue-500" />,
  "Air Conditioner": <AirVent className="w-4 h-4 text-sky-500" />,
  Heating: <Heater className="w-4 h-4 text-orange-500" />,
  Television: <Tv className="w-4 h-4 text-purple-500" />,
  Refrigerator: <Refrigerator className="w-4 h-4 text-cyan-600" />,
  Microwave: <Microwave className="w-4 h-4 text-amber-500" />,
  Kitchen: <Utensils className="w-4 h-4 text-amber-600" />,
  "Washing Machine": <WashingMachine className="w-4 h-4 text-green-600" />,
  Iron: <Hammer className="w-4 h-4 text-slate-600" />,
  "Hair Dryer": <Wind className="w-4 h-4 text-pink-500" />,

  Shower: <ShowerHead className="w-4 h-4 text-blue-400" />,
  "Bath Tub": <Bath className="w-4 h-4 text-blue-500" />,
  Toiletries: <Droplets className="w-4 h-4 text-rose-500" />,
  "Toilet Paper": <Toilet className="w-4 h-4 text-gray-500" />,

  Wardrobe: <Shirt className="w-4 h-4 text-slate-700" />,
  Desk: <Notebook className="w-4 h-4 text-slate-600" />,
  "Sofa Bed": <Sofa className="w-4 h-4 text-amber-500" />,

  Balcony: <Trees className="w-4 h-4 text-green-600" />,
  Parking: <ParkingCircle className="w-4 h-4 text-gray-600" />,
  Elevator: <Building2 className="w-4 h-4 text-slate-500" />,
  "Swimming Pool": <Waves className="w-4 h-4 text-cyan-500" />,
  Gym: <Dumbbell className="w-4 h-4 text-red-500" />,
  Breakfast: <Coffee className="w-4 h-4 text-amber-700" />,
  "Coffee Maker": <CoffeeIcon className="w-4 h-4 text-brown-600" />,
  Fan: <Fan className="w-4 h-4 text-sky-500" />,

  default: <Home className="w-4 h-4 text-muted-foreground" />,
};

export function getAmenityIcon(name: string): JSX.Element {
  return AMENITY_ICONS[name] ?? AMENITY_ICONS["default"];
}
