import * as writeGood from "write-good";
import { DiagnosticProvider } from './DiagnosticProvider';
import { TextDocument, Diagnostic, Range, DiagnosticSeverity, Connection } from 'vscode-languageserver';
import { Config } from '../Config';

export interface Options {
	passive: boolean;
	illusion: boolean;
	so: boolean;
	thereIs: boolean;
	weasel: boolean;
	adverb: boolean;
	tooWordy: boolean;
	cliches: boolean;
	eprime: boolean;
}

let defaultOptions = {
	passive: true,
	illusion: true,
	so: true,
	thereIs: true,
	weasel: true,
	adverb: true,
	tooWordy: true,
	cliches: true,
	eprime: false
};

interface Suggestion {
	index: number;
	offset: number;
	reason: string;
}

// https://github.com/btford/write-good
export class WriteGood implements DiagnosticProvider {
	connection: Connection;
	config: Config<Options>;
	constructor(connection: Connection, options: Options = defaultOptions) {
		this.connection = connection;
		this.config = new Config(connection, 'write.write-good', options);
	}

	async provideDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
		return this.config.for(document)
			.then(options => {
				return writeGood(document.getText(), options)
					.map((suggestion: Suggestion) =>
						this.suggestionToDiagnostic(document, suggestion));
			});
	}

	suggestionToDiagnostic(document: TextDocument, suggestion: Suggestion): Diagnostic {
		let start = document.positionAt(suggestion.index);
		let end = document.positionAt(suggestion.index + suggestion.offset);
		let range = Range.create(start, end);
		return Diagnostic.create(range, suggestion.reason, DiagnosticSeverity.Warning);
	}
}