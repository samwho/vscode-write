import { expect } from 'chai';
import { MultimatchScanner } from '../../scanners/MultimatchScanner';
import { TextDocument, Range } from 'vscode-languageserver';

describe('MultimatchScanner', () => {
	it('works', () => {
		let scanner = new MultimatchScanner(["cat", "mat"]);
		let content = `The cat sat on the mat`;

		let document = TextDocument.create("", "", 0, content);
		let matches: { match: string, range: Range }[] = [];
		scanner.match(document, (match, range) => {
			matches.push({ match, range });
		});

		expect(matches[0].match).to.equal("cat");
		expect(matches[1].match).to.equal("mat");
	});
});