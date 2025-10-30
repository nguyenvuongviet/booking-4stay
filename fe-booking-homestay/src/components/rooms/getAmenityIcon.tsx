import { Amenity } from "@/models/Amenity";
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  Check,
  Coffee,
  CookingPot,
  Dumbbell,
  Refrigerator,
  Snowflake,
  Sofa,
  Sun,
  Tv,
  Waves,
  Wifi,
} from "lucide-react";

export function getAmenityIcon(amenity: Amenity) {
  switch (amenity.name?.toLowerCase()) {
    case "wifi":
      return <Wifi className="h-4 w-4" />;
    case "air conditioner":
      return <Snowflake className="h-4 w-4" />;
    case "television":
      return <Tv className="h-4 w-4" />;
    case "refrigerator":
      return <Refrigerator className="h-4 w-4" />;
    case "kitchen":
      return <CookingPot className="h-4 w-4" />;
    case "bath tub":
      return <Bath className="h-4 w-4" />;
    case "parking":
      return <Car className="h-4 w-4" />;
    case "elevator":
      return <Building2 className="h-4 w-4" />;
    case "swimming pool":
      return <Waves className="h-4 w-4" />;
    case "gym":
      return <Dumbbell className="h-4 w-4" />;
    case "bed":
    case "double bed":
    case "single bed":
      return <BedDouble className="h-4 w-4" />;
    case "sofa":
      return <Sofa className="h-4 w-4" />;
    case "balcony":
      return <Sun className="h-4 w-4" />;
    case "coffee maker":
      return <Coffee className="h-4 w-4" />;
    default:
      return <Check className="h-4 w-4" />;
  }
}
