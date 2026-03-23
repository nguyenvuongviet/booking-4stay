"use client";

import { Search, Star, Users } from "lucide-react";
import ScrollScale from "@/styles/animations/ScrollScale";
import ScrollFade from "@/styles/animations/ScrollFade";
import BlurInScroll from "@/styles/animations/BlurInScroll";
import { useLang } from "@/context/lang-context";

export default function FeaturesSection() {
  const { t } = useLang();

  return (
    <section className="py-26">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <ScrollScale>
            <h2 className="elegant-heading text-4xl text-foreground mb-6">
              {t("Why Choose 4Stay?")}
            </h2>
          </ScrollScale>

          <ScrollFade delay={100}>
            <p className="elegant-subheading text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("Experience the difference with our premium booking platform")}
            </p>
          </ScrollFade>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BlurInScroll delay={0}>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-2xl elegant-heading text-foreground mb-2">
                {t("Easy Searching")}
              </h3>
              <p className="text-muted-foreground elegant-subheading text-sm">
                {t("Find the perfect accommodation with our intuitive search and filtering system.")}
              </p>
            </div>
          </BlurInScroll>

          <BlurInScroll delay={120}>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={24} />
              </div>
              <h3 className="text-2xl elegant-heading text-foreground mb-2">
                {t("Best Prices")}
              </h3>
              <p className="text-muted-foreground elegant-subheading text-sm">
                {t("Get the best deals and exclusive offers on premium hotels")}
              </p>
            </div>
          </BlurInScroll>

          <BlurInScroll delay={240}>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-2xl elegant-heading text-foreground mb-2">
                {t("24/7 Support")}
              </h3>
              <p className="text-muted-foreground elegant-subheading text-sm">
                {t("Our dedicated support team is available around the clock to assist you")}
              </p>
            </div>
          </BlurInScroll>
        </div>
      </div>
    </section>
  );
}
