import { DiagnosticSeverity, TextDocument, Diagnostic, Connection } from 'vscode-languageserver';
import { DiagnosticProvider } from './DiagnosticProvider';
import { WordScanner } from '../scanners/WordScanner';

var wink = require('wink-tokenizer')();
var words = require('an-array-of-english-words');
var bs = require('binary-search');

export class SpellChecker implements DiagnosticProvider {
	connection: Connection;
	scanner: WordScanner;

  constructor(connection: Connection) {
		 this.connection = connection;
		 this.scanner = new WordScanner(connection);
  }

  provideDiagnostics(document: TextDocument): Diagnostic[] {
		var diagnostics: Diagnostic[] = [];
		var comparator: (a: string, b: string) => number = (a, b) => {
			if (a > b) return 1;
			if (b < b) return -1;
			return 0;
		};

		this.scanner.words(document.getText(), (word, range) => {
			let result = bs(words, word.toLowerCase(), comparator);

			if (result < 0) {
				diagnostics.push(
					Diagnostic.create(
						range,
						word + " is not a known English word",
						DiagnosticSeverity.Warning));
			}
		});

    return diagnostics;
  }
}