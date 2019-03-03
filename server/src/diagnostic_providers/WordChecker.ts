import { DiagnosticProvider } from './DiagnosticProvider';
import { TextDocument, Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { MultimatchScanner, Options as MultimatchScannerOptions } from '../scanners/MultimatchScanner';

interface Options {
	severity: DiagnosticSeverity;
	multimatchScannerOptions: MultimatchScannerOptions;
}

let defaultOptions = {
	severity: DiagnosticSeverity.Warning,
	multimatchScannerOptions: {
		checkWordBoundaries: true
	}
};

export class WordChecker implements DiagnosticProvider {
	matcher: MultimatchScanner;
	messageFunc: (match: string) => string;
	options: Options;
	constructor(words: Iterable<string>, messageFunc: (match: string) => string, options: Options = defaultOptions) {
		this.matcher = new MultimatchScanner(words, options.multimatchScannerOptions);
		this.messageFunc = messageFunc;
		this.options = options;
	}

	async provideDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
		var diagnostics: Diagnostic[] = [];
		this.matcher.match(document, (match, range) => {
			diagnostics.push(Diagnostic.create(range, this.messageFunc(match), this.options.severity));
		});
		return diagnostics;
	}
}