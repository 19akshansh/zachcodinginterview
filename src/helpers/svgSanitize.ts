import DOMPurify from "isomorphic-dompurify";

export function sanitizeSvg(rawSvg: string): string | null {
  const clean = DOMPurify.sanitize(rawSvg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "foreignObject", "use"],
    FORBID_ATTR: [
      "onload",
      "onerror",
      "onclick",
      "onmouseover",
      "href",
      "xlink:href",
    ],
    ALLOW_DATA_ATTR: false,
  }).trim();

  if (!clean || !/<svg[\s>]/i.test(clean)) {
    return null;
  }

  return clean;
}
