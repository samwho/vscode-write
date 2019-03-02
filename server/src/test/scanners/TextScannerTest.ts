import { expect } from 'chai';
import { TextScanner } from '../../scanners/TextScanner';
import { Range, Position } from 'vscode-languageserver';

describe('WordScanner', () => {
	it('can parse simple sentences', () => {
		let scanner = new TextScanner(null);
		let content = `This is a test paragraph. This is a test sentence.`;

		let words: { word: string, range: Range }[] = [];
		scanner.words(content, (word, range) => {
			words.push({ word: word, range: range });
		});

		expect(words[0].word).to.equal("This");
		expect(words[1].word).to.equal("is");
		expect(words[2].word).to.equal("a");
		expect(words[3].word).to.equal("test");
		expect(words[4].word).to.equal("paragraph");
		expect(words[5].word).to.equal("This");
		expect(words[6].word).to.equal("is");
		expect(words[7].word).to.equal("a");
		expect(words[8].word).to.equal("test");
		expect(words[9].word).to.equal("sentence");
	});
});