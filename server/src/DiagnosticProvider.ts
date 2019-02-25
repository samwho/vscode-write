import { TextDocument, Diagnostic } from 'vscode-languageserver';

export interface DiagnosticProvider {
	provideDiagnostics(document: TextDocument): Diagnostic[];
}