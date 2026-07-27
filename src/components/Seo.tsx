import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "product" | "article";
}

const upsertMeta = (key: string, content: string, attr: "name" | "property" = "name") => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const Seo = ({ title, description, image, type = "website" }: SeoProps) => {
  const location = useLocation();
  useEffect(() => {
    const t = title.length > 60 ? title.slice(0, 57) + "..." : title;
    const d = description.length > 160 ? description.slice(0, 157) + "..." : description;
    document.title = t;
    upsertMeta("description", d);
    upsertMeta("og:title", t, "property");
    upsertMeta("og:description", d, "property");
    upsertMeta("og:type", type, "property");
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", t);
    upsertMeta("twitter:description", d);
    const url = window.location.origin + location.pathname;
    upsertMeta("og:url", url, "property");
    upsertCanonical(url);
    if (image) {
      const absoluteImg = image.startsWith("http") ? image : window.location.origin + image;
      upsertMeta("og:image", absoluteImg, "property");
      upsertMeta("twitter:image", absoluteImg);
    }
  }, [title, description, image, type, location.pathname]);
  return null;
};

export default Seo;
