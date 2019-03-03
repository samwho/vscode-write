import * as fs from "fs";
import * as path from "path";

export class Words implements Iterable<string> {
	static default(): Words {
		return defaultWords;
	}

	words: Map<string, boolean>;
	constructor(path: string) {
		this.words = new Map();

		fs.readFileSync(path).toString().split("\n").forEach(word => {
			this.words.set(word.toLowerCase(), true);
		});
	}

	contains(word: string): boolean {
		return this.words.has(word.toLowerCase());
	}

	[Symbol.iterator](): Iterator<string> {
		return this.words.keys();
	}
}

let defaultWords = new Words(path.join(__dirname, "..", "..", "data", "words"));