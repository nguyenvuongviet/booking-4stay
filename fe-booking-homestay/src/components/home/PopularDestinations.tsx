"use client";

import BlurInScroll from "@/styles/animations/BlurInScroll";
import HoverScale from "@/styles/animations/HoverScale";
import { Location } from "@/models/Location";
import { Card } from "@/components/ui/card";
import ScrollFade from "@/styles/animations/ScrollFade";
import ScrollScale from "@/styles/animations/ScrollScale";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";

export default function PopularDestinations({
  locations,
}: {
  locations: Location[];
}) {
  const router = useRouter();
  const {t} = useLang();

  return (
    <section className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <ScrollScale className="elegant-heading text-5xl text-foreground mb-6">
            {t("Popular Destinations")}
          </ScrollScale>
          <ScrollFade className="elegant-subheading text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("Explore the most sought-after travel destinations")}
          </ScrollFade>
        </div>

        {locations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((loc, index) => (
              <BlurInScroll key={loc.id} delay={index * 120}>
                <HoverScale>
                  <Card
                    onClick={() =>
                      router.push(
                        `/room-list?location=${encodeURIComponent(loc.name)}`
                      )
                    }
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={loc.imageUrl || "/default.jpg"}
                        alt={loc.name}
                        className="w-full h-72 object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-6 text-accent">
                        <h3 className="text-2xl elegant-sans mb-1">
                          {loc.name}
                        </h3>
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
