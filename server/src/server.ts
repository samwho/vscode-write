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
	connection.console.log("open");
	runDiagnostics(open.document);
});

documents.onDidChangeContent(change => {
	connection.console.log("changed");
	runDiagnostics(change.document);
});

async function runDiagnostics(textDocument: TextDocument): Promise<void> {
	let diagnostics: Diagnostic[] = [];

	let providers: DiagnosticProvider[] = [
		new FleschKincaidDiagnosticProvider(connection),
		new AutomatedReadabilityDiagnosticProvider(connection)
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
