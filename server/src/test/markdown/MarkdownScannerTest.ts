import { expect } from 'chai';
import { MarkdownScanner } from '../../markdown/MarkdownScanner';
import { TextDocument, Range } from 'vscode-languageserver';

describe('MarkdownScanner', () => {
	it('can parse simple sentences', () => {
		let scanner = new MarkdownScanner(null);
		let content = `This is a test paragraph. This is a test sentence.`;

		let sentences: { sentence: string, range: Range }[] = [];
		let document = TextDocument.create("", "", 0, content);
		scanner.sentences(document, (sentence, range) => {
			sentences.push({ sentence: sentence, range: range });
		});

		expect(sentences[0].sentence).to.equal("This is a test paragraph. ");
		expect(sentences[1].sentence).to.equal("This is a test sentence.");
	});
});