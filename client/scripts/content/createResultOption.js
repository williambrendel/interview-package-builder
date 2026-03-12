"use strict";

const templates = {};

/**
 * @function createResultOption
 * @description
 * Creates and returns a single action button for the result options bar,
 * rendered at the bottom of a query answer card. Each button can carry a
 * text label, an icon image, a tooltip, a CSS class, and a click handler.
 *
 * Implements a keyed template cache (`templates`) to avoid rebuilding the
 * button's static DOM structure on every call. The cache key is derived
 * from the combination of `text`, `title`, `src`, and `cl` — all the
 * properties that determine the button's static appearance. On a cache
 * hit, the existing template is cloned; on a miss, a new `<template>`
 * element is built, stored, and then cloned.
 *
 * The `onclick` handler is applied to the cloned button *after* cloning,
 * since event listeners and `.onclick` assignments are not preserved by
 * `cloneNode`. This means handlers are always fresh and closure-safe for
 * each button instance.
 *
 * @param {Object} options
 * Configuration object for the button.
 *
 * @param {string} options.name
 * The canonical identifier for this option. Used as the default value for
 * `text` and `title` if those properties are not provided.
 *
 * @param {string} [options.text=name]
 * The visible label text rendered inside a `<span>` within the button.
 * If falsy or not a string, no `<span>` is appended (icon-only button).
 *
 * @param {string} [options.icon]
 * Alias for `src`. Allows callers to use the more semantic `icon` key when
 * constructing option configs.
 *
 * @param {string} [options.src=icon]
 * URL or path of the icon image rendered inside the button via an `<img>`
 * element. If falsy or not a string, no `<img>` is appended (text-only button).
 *
 * @param {Function} [options.onclick]
 * Click event handler attached directly to the button element as
 * `button.onclick`. Applied after cloning so each instance has its own
 * independent handler. If not a function, no handler is assigned.
 *
 * @param {string} [options.cl="qa-result-option-button"]
 * The CSS class string assigned to the button element. Defaults to the
 * standard result option button class.
 *
 * @param {string} [options.title=text]
 * The tooltip string assigned to the button's `title` attribute. Defaults
 * to the `text` value if not provided.
 *
 * @returns {DocumentFragment}
 * A cloned document fragment containing the configured `<button>` element,
 * ready to be appended to a container.
 *
 * @example
 * container.appendChild(createResultOption({
 *   src: "./assets/icons/copy.svg",
 *   title: "Copy this question to clipboard",
 *   onclick: async event => {
 *     event.stopPropagation();
 *     await navigator.clipboard.writeText(question);
 *   }
 * }));
 *
 * @notes
 * - The cache key uses `|` as a delimiter between fields. If any field
 *   value legitimately contains `|`, cache collisions could theoretically
 *   occur. In practice, icon paths, titles, and class names don't include
 *   pipes, so this is safe for the current usage.
 * - Because `onclick` is set post-clone, it is intentionally excluded from
 *   the cache key — two buttons that look identical but have different
 *   handlers will share the same cached template, which is correct.
 */
export const createResultOption = ({
  name,
  text = name,
  icon,
  src = icon,
  onclick,
  cl = "qa-result-option-button",
  title = text,
  checkSrc,
  useCheck = src && checkSrc && typeof checkSrc === "string"
}) => {
  const key = `${text}|${title}|${src}|${cl}`;
  let template = templates[key], button, img;

  button = template && template.content.cloneNode(true) || (
    template = templates[key] = document.createElement("template"),
    button = template.content.appendChild(document.createElement("button")),
    cl && button.setAttribute("class", cl),
    title && button.setAttribute("title", title),
    text && typeof text === "string" && (button.appendChild(document.createElement("span")).textContent = text),
    src && typeof src === "string" && button.appendChild(document.createElement("img")).setAttribute("src", src),
    template.content.cloneNode(true)
  );
  button = button.firstElementChild; // Button was the fragment.
  img = button.lastElementChild; // Button was cloned.
  typeof onclick === "function" && (button.onclick = useCheck && img && img.tagName.toLowerCase() === "img" && (
    event => {
      onclick(event);
      img.setAttribute("src", checkSrc);
      requestAnimationFrame(() => {
        setTimeout(() => {
          img.setAttribute("src", src);
        }, 2000);
      })
    }
  ) || onclick);
  return button;
};