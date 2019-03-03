import * as AhoCorasick from "ahocorasick";
import { Range, TextDocument, Position, DocumentColorRequest } from 'vscode-languageserver';

export interface Options {
	checkWordBoundaries: boolean;
}

let defaultOptions: Options = {
	checkWordBoundaries: true
};

export class MultimatchScanner {
	static regex = /[^\w'-]/;

	ac: AhoCorasick;
	options: Options;
	constructor(words: Iterable<string>, options: Options = defaultOptions) {
		this.ac = new AhoCorasick(Array.from(words));
		this.options = options;
	}

	match(document: TextDocument, cb: (match: string, range: Range) => void) {
		this.ac.search(document.getText()).forEach(([index, match]) => {
			let start = document.positionAt(index - match[0].length + 1);
			let end = document.positionAt(index + 1);
			let range = Range.create(start, end);

			if (this.options.checkWordBoundaries && !this.isSurroundedByWordBoundaries(document, range)) {
				return;
			}

			cb(match[0], range);
		});
	}

	isSurroundedByWordBoundaries(document: TextDocument, range: Range): boolean {
		let text = document.getText();

		let boff = document.offsetAt(range.start) - 1;
		if (boff >= 0 && !MultimatchScanner.regex.test(text[boff])) {
			return false;
		}

		let aoff = document.offsetAt(range.end);
		if (aoff < text.length && !MultimatchScanner.regex.test(text[aoff])) {
			return false;
		}

		return true;
	}
}