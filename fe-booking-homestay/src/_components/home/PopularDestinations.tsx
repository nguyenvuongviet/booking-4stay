"use client";

import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { PopularDestination } from "@/models/Destination";
import BlurInScroll from "@/styles/animations/BlurInScroll";
import HoverScale from "@/styles/animations/HoverScale";
import ScrollFade from "@/styles/animations/ScrollFade";
import ScrollScale from "@/styles/animations/ScrollScale";
import { Building } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PopularDestinations({
  locations,
}: {
  locations: PopularDestination[];
}) {
  const router = useRouter();
  const { t } = useLang();

  return (
    <section className="pt-16 pb-20 sm:pt-32 sm:pb-40 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6 sm:mb-12">
          <div>
            <ScrollScale className="elegant-heading text-2xl sm:text-3xl md:text-4xl text-foreground mb-1 md:mb-2">
              {t("Popular Destinations")}
            </ScrollScale>
            <ScrollFade className="elegant-subheading text-xs sm:text-sm md:text-lg text-muted-foreground">
              {t("Explore the most sought-after travel destinations")}
            </ScrollFade>
          </div>
        </div>

        {locations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {locations.slice(0, 3).map((loc, index) => (
              <BlurInScroll key={loc.id} delay={index * 120}>
                <HoverScale>
                  <Card
                    onClick={() =>
                      router.push(
                        `/room?location=${encodeURIComponent(loc.name)}`,
                      )
                    }
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={loc.imageUrl || "/default-location.jpg"}
                        alt={loc.name}
                        className="w-full h-52 sm:h-72 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/default-location.jpg";
                        }}
                      />

                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-80" />

                      <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{loc.name}</h3>

                        <div className="flex items-center gap-1 text-sm text-white/90">
                          <Building className="w-4 h-4" />
                          <span>{loc.roomCount} rooms</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </HoverScale>
              </BlurInScroll>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No destinations available.
          </p>
        )}
      </div>
    </section>
  );
}
