import {
	createConnection,
	TextDocuments,
	TextDocument,
	Diagnostic,
	ProposedFeatures,
} from 'vscode-languageserver';

import { FleschKincaidDiagnosticProvider } from './diagnostic_providers/FleschKincaidDiagnosticProvider';
import { DiagnosticProvider } from './diagnostic_providers/DiagnosticProvider';
import { AutomatedReadabilityDiagnosticProvider } from './diagnostic_providers/AutomatedReadabilityDiagnosticProvider';
import { SpellChecker } from './diagnostic_providers/SpellChecker';

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

connection.onInitialize(() => {
	return {
		capabilities: {
			textDocumentSync: documents.syncKind
		}
	};
});

documents.onDidOpen(open => {
	runDiagnostics(open.document);
});

documents.onDidChangeContent(change => {
	runDiagnostics(change.document);
});

async function runDiagnostics(textDocument: TextDocument): Promise<void> {
	let diagnostics: Diagnostic[] = [];

	let providers: DiagnosticProvider[] = [
		new FleschKincaidDiagnosticProvider(connection),
		new AutomatedReadabilityDiagnosticProvider(connection),
		new SpellChecker(connection)
	];

	for (const provider of providers) {
		for (const diagnostic of provider.provideDiagnostics(textDocument)) {
			diagnostics.push(diagnostic);
		}
	}

	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.listen(connection);
connection.listen();
