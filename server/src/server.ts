import {
	createConnection,
	TextDocuments,
	TextDocument,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
} from 'vscode-languageserver';

import { DiagnosticProvider } from './diagnostic_providers/DiagnosticProvider';
import { AutomatedReadability } from './diagnostic_providers/AutomatedReadability';
import { SpellChecker } from './diagnostic_providers/SpellChecker';
import { WriteGood } from './diagnostic_providers/WriteGood';

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;
	hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);

	return {
		capabilities: {
			textDocumentSync: documents.syncKind
		}
	};
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(
			DidChangeConfigurationNotification.type,
			undefined
		);
	}
});

connection.onDidChangeConfiguration(change => {
	documents.all().forEach(document => runDiagnostics(document));
});

documents.onDidOpen(open => {
	runDiagnostics(open.document);
});

documents.onDidChangeContent(change => {
	runDiagnostics(change.document);
});

async function runDiagnostics(document: TextDocument): Promise<void> {
	let providers: DiagnosticProvider[] = [
		new AutomatedReadability(connection),
		new SpellChecker(connection),
		new WriteGood(connection)
	];

	Promise.all(
		providers.map(p => p.provideDiagnostics(document))
	).then(diagnostics => {
		connection.sendDiagnostics({
			uri: document.uri,
			diagnostics: [].concat(...diagnostics)
		});
	});
}

documents.listen(connection);
connection.listen();
