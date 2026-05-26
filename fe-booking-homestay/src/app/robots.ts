import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://4stay.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/auth/", "/profile/", "/checkout/", "/booking/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
