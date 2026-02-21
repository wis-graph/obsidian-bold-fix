import { Plugin } from "obsidian";
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";

const boldRegex = /\*\*([^*\n]+?)\*\*/g;
const italicRegex = /(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g;

const boldFixCSS = `
.cm-line .cm-strong:not(.bold-fix-strong) {
	font-weight: normal !important;
	color: var(--text-normal) !important;
}
.cm-line .cm-em:not(.bold-fix-em) {
	font-style: normal !important;
	color: var(--text-normal) !important;
}
.bold-fix-hidden {
	font-size: 0 !important;
}
`;

const boldDecoration = Decoration.mark({ class: "cm-strong bold-fix-strong" });
const italicDecoration = Decoration.mark({ class: "cm-em bold-fix-em" });
const hiddenDecoration = Decoration.mark({ class: "bold-fix-hidden" });

function getDecorations(view: EditorView, regex: RegExp, decoration: Decoration): { from: number; to: number; decoration: Decoration }[] {
	const decorations: { from: number; to: number; decoration: Decoration }[] = [];
	const doc = view.state.doc;
	const text = doc.toString();
	const sel = view.state.selection.main;
	const selFrom = Math.min(sel.from, sel.to);
	const selTo = Math.max(sel.from, sel.to);
	const markerLen = regex === boldRegex ? 2 : 1;

	let match;
	while ((match = regex.exec(text)) !== null) {
		const startIndex = match.index;
		const contentStart = startIndex + markerLen;
		const contentEnd = startIndex + match[0].length - markerLen;
		const endIndex = startIndex + match[0].length;

		const overlaps = selFrom <= endIndex && selTo >= startIndex;

		if (overlaps) {
			decorations.push({ from: startIndex, to: contentStart, decoration });
		} else {
			decorations.push({ from: startIndex, to: contentStart, decoration: hiddenDecoration });
		}
		decorations.push({ from: contentStart, to: contentEnd, decoration });
		if (overlaps) {
			decorations.push({ from: contentEnd, to: endIndex, decoration });
		} else {
			decorations.push({ from: contentEnd, to: endIndex, decoration: hiddenDecoration });
		}
	}

	return decorations;
}

function getAllDecorations(view: EditorView): DecorationSet {
	const decorations = [
		...getDecorations(view, boldRegex, boldDecoration),
		...getDecorations(view, italicRegex, italicDecoration)
	];

	return Decoration.set(
		decorations.sort((a, b) => a.from - b.from).map((d) => d.decoration.range(d.from, d.to))
	);
}

const formattingViewPlugin = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;
		constructor(view: EditorView) {
			this.decorations = getAllDecorations(view);
		}
		update(update: ViewUpdate) {
			this.decorations = getAllDecorations(update.view);
		}
	},
	{
		decorations: (v) => v.decorations,
	}
);

export default class BoldFixPlugin extends Plugin {
	async onload() {
		this.registerEditorExtension(formattingViewPlugin);

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
			const tag = textNode.parentElement.tagName;
			if (tag === "STRONG" || tag === "EM") continue;

			const text = textNode.textContent || "";
			
			boldRegex.lastIndex = 0;
			italicRegex.lastIndex = 0;
			
			const hasBold = boldRegex.test(text);
			italicRegex.lastIndex = 0;
			const hasItalic = italicRegex.test(text);

			if (!hasBold && !hasItalic) continue;

			const fragment = document.createDocumentFragment();
			let lastIndex = 0;

			const matches: { index: number; length: number; content: string; type: "bold" | "italic" }[] = [];

			boldRegex.lastIndex = 0;
			let match;
			while ((match = boldRegex.exec(text)) !== null) {
				matches.push({ index: match.index, length: match[0].length, content: match[1], type: "bold" });
			}

			italicRegex.lastIndex = 0;
			while ((match = italicRegex.exec(text)) !== null) {
				matches.push({ index: match.index, length: match[0].length, content: match[1], type: "italic" });
			}

			matches.sort((a, b) => a.index - b.index);

			for (const m of matches) {
				if (m.index >= lastIndex) {
					if (m.index > lastIndex) {
						fragment.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
					}

					const el = m.type === "bold" 
						? Object.assign(document.createElement("strong"), { className: "bold-fix-strong" })
						: Object.assign(document.createElement("em"), { className: "bold-fix-em" });
					el.textContent = m.content;
					fragment.appendChild(el);

					lastIndex = m.index + m.length;
				}
			}

			if (lastIndex < text.length) {
				fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
			}

			textNode.parentElement.replaceChild(fragment, textNode);
		}
	}
}
