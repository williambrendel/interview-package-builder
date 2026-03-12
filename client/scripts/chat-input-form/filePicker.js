import { GLOBALS } from "../globals.js";
import { DOM } from "../cachedDomReferences.js";

// Destructure DOM elements.
const { chatFiles, form, input } = DOM;

// --------------------------------------------------------------------------
// File pill UI helpers
// --------------------------------------------------------------------------

const createFilePill = file => {
  const pill = document.createElement("button");
  pill.type = "button";
  pill.className = "file-pill";
  pill.title = file.name; // Full filename on hover

  // Filename span allows proper ellipsis via CSS
  const textSpan = document.createElement("span");
  textSpan.textContent = file.name;
  textSpan.className = "file-pill-name";
  pill.appendChild(textSpan);

  // Clicking a pill removes the associated file
  pill.onclick = event => {
    event.stopPropagation();
    pill.remove();
    GLOBALS.attachedFiles.delete(getFileSignature(file));

    // Restore empty state if nothing remains
    input.value || GLOBALS.attachedFiles.size || form.setAttribute("empty", "");
  };

  chatFiles.appendChild(pill);
  form.removeAttribute("empty");
};

// Generates a stable identifier for file deduplication
const getFileSignature = file =>
  `${file.name}-${file.size}-${file.lastModified}`;

const MAX_SIZE = 5 * 1024 * 1024, MAX_NUM_FILES = 5;
export const attachFiles = files => {
  for (const file of files) {

    // File too big.
    if (file.size > MAX_SIZE) {
      alert(`${file.name} is a bit too chunky! Please keep it under 5MB.`);
      continue;
    }

    if (GLOBALS.attachedFiles >= MAX_NUM_FILES) {
      alert(`A maximum of ${MAX_NUM_FILES} files is allowed. Delete some files first before adding more.`);
      return;
    }

    const sig = getFileSignature(file);

    // Ignore duplicates
    GLOBALS.attachedFiles.has(sig) || (
      GLOBALS.attachedFiles.set(sig, file),
      createFilePill(file),
      console.log("File attached:", file.name)
    );
  }
};

// --------------------------------------------------------------------------
// File picker logic
// --------------------------------------------------------------------------

export const filePicker = done => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.multiple = true;

  fileInput.onchange = event => {
    event.target.files.length &&
      attachFiles(Array.from(event.target.files));

    typeof done === "function" && done();
  };

  fileInput.click();
};