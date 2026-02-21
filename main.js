"use strict";
const obsidian = require("obsidian");
const view = require("@codemirror/view");
const boldRegex = /\*\*([^*\n]+?)\*\*/g;
const boldFixCSS = `
.cm-line .cm-strong:not(.bold-fix-strong) {
	font-weight: normal !important;
	color: var(--text-normal) !important;
}
.bold-fix-hidden {
	font-size: 0 !important;
}
`;
const boldDecoration = view.Decoration.mark({ class: "cm-strong bold-fix-strong" });
const hiddenDecoration = view.Decoration.mark({ class: "bold-fix-hidden" });
function getBoldDecorations(view$1) {
  const decorations = [];
  const doc = view$1.state.doc;
  const text = doc.toString();
  const sel = view$1.state.selection.main;
  const selFrom = Math.min(sel.from, sel.to);
  const selTo = Math.max(sel.from, sel.to);
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    const startIndex = match.index;
    const contentStart = startIndex + 2;
    const contentEnd = startIndex + match[0].length - 2;
    const endIndex = startIndex + match[0].length;
    const overlaps = selFrom <= endIndex && selTo >= startIndex;
    if (overlaps) {
      decorations.push({ from: startIndex, to: contentStart, decoration: boldDecoration });
    } else {
      decorations.push({ from: startIndex, to: contentStart, decoration: hiddenDecoration });
    }
    decorations.push({ from: contentStart, to: contentEnd, decoration: boldDecoration });
    if (overlaps) {
      decorations.push({ from: contentEnd, to: endIndex, decoration: boldDecoration });
    } else {
      decorations.push({ from: contentEnd, to: endIndex, decoration: hiddenDecoration });
    }
  }
  return view.Decoration.set(
    decorations.sort((a, b) => a.from - b.from).map((d) => d.decoration.range(d.from, d.to))
  );
}
const boldViewPlugin = view.ViewPlugin.fromClass(
  class {
    constructor(view2) {
      this.decorations = getBoldDecorations(view2);
    }
    update(update) {
      this.decorations = getBoldDecorations(update.view);
    }
  },
  {
    decorations: (v) => v.decorations
  }
);
class BoldFixPlugin extends obsidian.Plugin {
  async onload() {
    this.registerEditorExtension(boldViewPlugin);
    this.registerMarkdownPostProcessor((el) => {
      this.processTextNode(el);
    });
    const styleEl = document.createElement("style");
    styleEl.id = "bold-fix-styles";
    styleEl.textContent = boldFixCSS;
    document.head.appendChild(styleEl);
  }
  onunload() {
    const styleEl = document.getElementById("bold-fix-styles");
    if (styleEl) styleEl.remove();
  }
  processTextNode(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    for (const textNode of textNodes) {
      if (!textNode.parentElement) continue;
      if (textNode.parentElement.tagName === "STRONG") continue;
      const text = textNode.textContent || "";
      boldRegex.lastIndex = 0;
      if (!boldRegex.test(text)) continue;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      boldRegex.lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        const strong = document.createElement("strong");
        strong.className = "bold-fix-strong";
        strong.textContent = match[1];
        fragment.appendChild(strong);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
      textNode.parentElement.replaceChild(fragment, textNode);
    }
  }
}
module.exports = BoldFixPlugin;
//# sourceMappingURL=main.js.map
