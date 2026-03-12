"use strict";

/**
 * @function createContactUs
 * @description
 * Creates and returns a styled button element that renders an HR expert
 * upsell banner, prompting the user to contact a human expert after
 * receiving their AI-generated interview package.
 *
 * The button displays a randomly selected (or explicitly specified) expert
 * avatar alongside a two-line call-to-action. It is intended to be injected
 * into the results view as a post-generation upsell prompt.
 *
 * **Element structure:**
 * ```
 * button.liquid-glass.contact-us
 * ├── img[src="../assets/expert-{id}.png"]
 * └── div
 *     ├── span  "You've got the package. Let's get you the offer."
 *     └── span  "Talk to one of our HR experts"
 * ```
 *
 * @param {number} [id]
 * Index of the expert avatar image to display (0–6). If omitted or
 * `undefined`, a random integer in the range [0, 6] is selected.
 * Corresponds to the filename `expert-{id}.png` in the assets directory.
 *
 * @returns {HTMLButtonElement}
 * A button element with class `"liquid-glass contact-us"` containing the
 * expert avatar and upsell copy. Ready to be appended directly to any
 * container.
 *
 * @example
 * // Random expert avatar
 * content.appendChild(createContactUs());
 *
 * @example
 * // Specific expert avatar
 * content.appendChild(createContactUs(3));
 */
export const createContactUs = id => {
  id === undefined && (id = Math.round(Math.random() * 7));
  const html = document.createElement("button");
  html.setAttribute("class", "liquid-glass contact-us");
  html.appendChild(document.createElement("img")).setAttribute("src", `../assets/expert-${id}.png`);
  const elmt = html.appendChild(document.createElement("div"));
  elmt.appendChild(document.createElement("span")).textContent = "You've got the package. Let's get you the offer.";
  elmt.appendChild(document.createElement("span")).textContent = "Talk to one of our HR experts";
  return html;
}