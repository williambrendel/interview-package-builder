import { attachFiles } from "./filePicker.js";
import { DOM } from "../cachedDomReferences.js";

// Destructure DOM elements.
const { dropOverlay } = DOM;

// --------------------------------------------------------------------------
// Drag & drop file handling
// Uses a counter to avoid flicker from nested dragenter/dragleave
// --------------------------------------------------------------------------

let dragCounter = 0;

window.addEventListener("dragenter", event => {
  event.preventDefault();
  dragCounter++;
  dragCounter === 1 && dropOverlay.setAttribute("active", "");
});

window.addEventListener("dragleave", event => {
  event.preventDefault();
  dragCounter--;
  dragCounter === 0 && dropOverlay.removeAttribute("active");
});

window.addEventListener("dragover", event => {
  event.preventDefault();
  event.stopPropagation();
});

window.addEventListener("drop", event => {
  event.preventDefault();
  event.stopPropagation();

  dragCounter = 0;
  dropOverlay.removeAttribute("active");

  const files = Array.from(event.dataTransfer.files);
  files.length && attachFiles(files);
});