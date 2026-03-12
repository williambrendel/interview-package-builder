"use strict"

import { progressiveDisplay } from "../progressiveDisplay.js";
import { DOM } from "../cachedDomReferences.js";
import { GLOBALS } from "../globals.js";
import { resetForm } from "./resetForm.js";
import { isThinking } from "./isThinking.js";
import { stopThinking } from "./stopThinking.js";
import { onContentChange } from "../content/onContentChange.js";

// Destructure DOM elements.
const { content } = DOM;

/**
 * @function simulateQuery
 * @async
 * @description
 * Simulates a server query with a configurable artificial delay, then
 * progressively renders a response into the content area. Intended for
 * development and UI testing purposes as a drop-in stand-in for the real
 * `query` function — allowing the full thinking/response lifecycle to be
 * exercised without a running backend.
 *
 * After the delay elapses, the function mirrors the production query flow:
 * it resets the form, checks whether the thinking state is still active
 * (guarding against cancellations that may have occurred during the
 * simulated wait), stops the thinking indicator, and then initiates a
 * `progressiveDisplay` render with either the provided message or a
 * built-in dummy text.
 *
 * The promise resolves with the text string that was rendered, making the
 * simulated response inspectable in tests or calling code.
 *
 * @param {string} [message]
 * The response text to display. If omitted or falsy, a hardcoded dummy
 * story about a product decision at Snap is used as placeholder content.
 *
 * @param {number} [delay=3000]
 * The number of milliseconds to wait before resolving, simulating server
 * round-trip latency. Defaults to 3000ms (3 seconds).
 *
 * @returns {Promise<string>}
 * Resolves with the text string that was passed to `progressiveDisplay`.
 * Resolves early (with the text value) even if `isThinking()` returns
 * `false` at callback time — the `resolve` call precedes the guard check
 * so the promise always settles after the delay.
 *
 * @example
 * // Use default dummy content with default 3s delay:
 * simulateQuery();
 *
 * @example
 * // Inject specific content with a shorter delay for faster testing:
 * simulateQuery("Here is the simulated answer.", 500);
 *
 * @notes
 * - `GLOBALS.stopDisplay` is set to the `cancel` handle returned by
 *   `progressiveDisplay`, allowing the stop button to interrupt rendering
 *   mid-sequence, consistent with the production `query` flow.
 * - Unlike `query`, there is no error path — the simulated response always
 *   "succeeds". Add a rejection branch if error-state UI testing is needed.
 * - The `resolve(text)` call is placed before the `isThinking()` guard
 *   intentionally, ensuring the returned promise always resolves after the
 *   delay regardless of UI state at that moment.
 */
export const simulateQuery = async (message, delay = 1000, progressive) => new Promise(resolve => {
  // Simulate query time with setTimeout.
  setTimeout(() => {
    // Reset form.
    resetForm();

    if (!isThinking()) return;

    // Stop thinking.
    stopThinking();

    // Fill content.
    const text = message || md;

    resolve(text);

    progressive && (
      GLOBALS.stopDisplay = progressiveDisplay(
        `<div class="chat-qa">${mdToHtml(text)}</div>`,
        content,
        { onDone: GLOBALS.endDisplay, onChange: onContentChange }
      )
    ) || (
      content.innerHTML = `<div class="chat-qa">${mdToHtml(text)}</div>`
    );
    
  }, delay);
});

const md = `
Welcome to the **v12.0.0** markdown parser demo! This showcases all supported features including the new extended syntax.

## Table of Contents

1. [Text Formatting](#text-formatting)
2. [Headings](#headings)
3. [Lists](#lists)
4. [Code](#code)
5. [Tables](#tables)
6. [Links & Images](#links-images)
7. [Extended Features](#extended)

---

## Text Formatting

**Bold text** using double asterisks.
*Italic text* using single asterisks.
***Bold and italic*** using triple asterisks.
~~Strikethrough~~ using double tildes.

You can also combine them: **bold with *italic* inside**.

## Headings

There are two heading styles supported:

### ATX Style (with #)

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

### Setext Style (underline)

Heading 1
=========

Heading 2
---------

## Lists

### Unordered Lists

- Item one
- Item two
  - Nested item 2.1
  - Nested item 2.2
    - Deep nested item
- Item three

### Ordered Lists

1. First item
2. Second item
   1. Nested 2.1
   2. Nested 2.2
3. Third item

### Task Lists (GFM)

- [x] Completed task
- [ ] Pending task
- [x] Another completed task with **bold** text

## Code

Inline code: \`const x = 42;\`

Code block with syntax highlighting:

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

Indented code block:

    // This is indented with 4 spaces
    function add(a, b) {
      return a + b;
    }

## Tables

| Feature | Status | Version |
|---------|--------|---------|
| Headings | ✅ Ready | v11 |
| Tables | ✅ Ready | v11 |
| Footnotes | ✅ NEW | v12 |
| Definition Lists | ✅ NEW | v12 |
| Abbreviations | ✅ NEW | v12 |

## Links & Images

### Regular Links

Visit [Google](https://google.com) or [GitHub](https://github.com).

### Reference Links

Check out [Google] and [Wikipedia].

[Google]: https://google.com
[Wikipedia]: https://wikipedia.org

### Autolinks

<https://example.com>
<user@example.com>

### Images

![Placeholder](../assets/icons/logo.svg)

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> And contain multiple paragraphs.

## Horizontal Rules

You can create horizontal rules with:

---

## Extended Features ✨

### 1. Footnotes

This paragraph has a footnote[^1] about something interesting.

Here's another paragraph with a second footnote[^2] and a reference back to the first one[^1].

[^1]: This is the first footnote with **formatted** text.
[^2]: This is the second footnote explaining something else.

### 2. Definition Lists

HTML
: Hypertext Markup Language
: The standard markup language for web pages

CSS
: Cascading Style Sheets
: Used for styling HTML documents

JavaScript
: A programming language
: Adds interactivity to web pages

### 3. Abbreviations

The HTML specification is maintained by W3C. Both HTML and CSS are fundamental web technologies. The W3C also standardizes XML and other protocols.

*[HTML]: Hypertext Markup Language
*[CSS]: Cascading Style Sheets
*[W3C]: World Wide Web Consortium
*[XML]: Extensible Markup Language

## LaTeX Math Support ✨

The parser now supports both inline and display math using standard LaTeX notation.

### Chemical Equations
Your parser is specifically optimized for chemical notation:
[ 2 \\text{Cl}_2 + 2 \\text{H}_2\\text{O} \\longrightarrow 4 \\text{HCl} + \\text{O}_2 ]

### Physics & Mathematics
Standard display math using double dollar signs:
$$E = mc^2$$

Or the standard LaTeX display delimiters:
\\[ \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\]

### Inline Math
You can also embed equations like $\\pi r^2$ directly within a sentence for technical documentation.

---

## Complete Example

Combining all features together:

### API Documentation

The REST API uses standard HTTP methods as defined by W3C[^api].

#### HTTP Methods

GET
: Retrieve a resource
: Safe and idempotent operation

POST
: Create a new resource
: Not idempotent

PUT
: Update existing resource
: Idempotent operation

DELETE
: Remove a resource
: Idempotent operation

#### Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

#### Example Request

\`\`\`bash
curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John","email":"john@example.com"}'
\`\`\`

[^api]: See the official HTTP specification at IETF.

*[REST]: Representational State Transfer
*[API]: Application Programming Interface
*[HTTP]: Hypertext Transfer Protocol
*[IETF]: Internet Engineering Task Force
*[JSON]: JavaScript Object Notation
`;