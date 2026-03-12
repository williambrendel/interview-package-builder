/**
 * @file index.js
 * @description
 * Application entry point. Bootstraps the two primary feature modules and
 * removes the `loading` attribute from `<body>` on the first animation
 * frame, triggering any CSS transitions that should play on initial paint
 * (e.g., a fade-in or skeleton removal).
 *
 * Module imports are side-effect-only — neither `chat-input-form` nor
 * `content` export a public API at this level. Each module self-registers
 * its own event listeners and DOM bindings upon import.
 *
 * The `requestAnimationFrame` call defers the `loading` attribute removal
 * until the browser has completed its first layout and paint pass, ensuring
 * that the initial DOM state is fully rendered before any reveal animations
 * begin.
 */
import "./chat-input-form/index.js";
import "./content/index.js";

requestAnimationFrame(() => document.body.removeAttribute("loading"));