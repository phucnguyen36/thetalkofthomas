import { MetadataRoute } from "next";

const DEFAULT_SLUGS = [
  "ve-su-im-lang-trong-nhung-cuoc-dam-phan-quan-trong",
  "nguyen-tac-ra-quyet-dinh-khi-khong-co-du-du-lieu",
  "ky-luat-tu-than-trong-moi-truong-qua-tai-thong-tin",
  "ghi-chep-ve-cach-xay-dung-vi-the-doc-lap",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thetalkofthomas.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = DEFAULT_SLUGS.map((slug) => ({
    url: `${baseUrl}/#${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...postRoutes];
}
