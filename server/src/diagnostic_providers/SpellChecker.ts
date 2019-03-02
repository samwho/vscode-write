import { DiagnosticSeverity, TextDocument, Diagnostic, Connection } from 'vscode-languageserver';
import { DiagnosticProvider } from './DiagnosticProvider';
import { TextScanner } from '../scanners/TextScanner';
import { Words } from '../data/Words';

var wink = require('wink-tokenizer')();
var bs = require('binary-search');

export class SpellChecker implements DiagnosticProvider {
	connection: Connection;
	scanner: TextScanner;
	words: Words;

  constructor(connection: Connection) {
		 this.connection = connection;
		 this.scanner = new TextScanner(connection);
		 this.words = Words.default();
  }

  provideDiagnostics(document: TextDocument): Diagnostic[] {
		var diagnostics: Diagnostic[] = [];

		this.scanner.words(document.getText(), (word, range) => {
			if (!this.words.contains(word)) {
				diagnostics.push(
					Diagnostic.create(
						range,
						word + " is not a known English word",
						DiagnosticSeverity.Warning));
			}
		});

    return diagnostics;
	}

	log(message: string): void {
		if (this.connection) {
			this.connection.console.log(message);
		}
	}
}