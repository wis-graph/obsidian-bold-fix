import { Plugin } from "obsidian";
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";

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

const boldDecoration = Decoration.mark({ class: "cm-strong bold-fix-strong" });
const hiddenDecoration = Decoration.mark({ class: "bold-fix-hidden" });

function getBoldDecorations(view: EditorView): DecorationSet {
	const decorations: { from: number; to: number; decoration: Decoration }[] = [];
	const doc = view.state.doc;
	const text = doc.toString();
	const sel = view.state.selection.main;
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

	return Decoration.set(
		decorations.sort((a, b) => a.from - b.from).map((d) => d.decoration.range(d.from, d.to))
	);
}

const boldViewPlugin = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;
		constructor(view: EditorView) {
			this.decorations = getBoldDecorations(view);
		}
		update(update: ViewUpdate) {
			this.decorations = getBoldDecorations(update.view);
		}
	},
	{
		decorations: (v) => v.decorations,
	}
);

export default class BoldFixPlugin extends Plugin {
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

	private processTextNode(element: HTMLElement) {
		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
		const textNodes: Text[] = [];

		let node;
		while ((node = walker.nextNode())) {
			textNodes.push(node as Text);
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
