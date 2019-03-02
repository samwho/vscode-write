import {
	createConnection,
	TextDocuments,
	TextDocument,
	Diagnostic,
	ProposedFeatures,
} from 'vscode-languageserver';

import { DiagnosticProvider } from './diagnostic_providers/DiagnosticProvider';
import { AutomatedReadability } from './diagnostic_providers/AutomatedReadability';
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

async function runDiagnostics(document: TextDocument): Promise<void> {
	let diagnostics: Diagnostic[] = [];

	let providers: DiagnosticProvider[] = [
		new AutomatedReadability(connection),
		new SpellChecker(connection)
	];

	providers.forEach(provider => {
		provider.provideDiagnostics(document)
			.then(diagnostics => {
				connection.sendDiagnostics({ uri: document.uri, diagnostics });
			});
	});
}

documents.listen(connection);
connection.listen();
