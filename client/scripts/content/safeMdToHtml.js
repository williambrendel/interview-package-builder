export const safeMdToHtml = md => (
  mdToHtml((md || "").replace(/\$(?!\d[\d,]*(?:\.\d+)?(?:\s|$))/g, '\\$'))
);