/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {
	createConnection,
	TextDocuments,
	TextDocument,
	Diagnostic,
	ProposedFeatures,
} from 'vscode-languageserver';
import { FleschKincaidDiagnosticProvider } from './FleschKincaidDiagnosticProvider';
import { DiagnosticProvider } from './DiagnosticProvider';
import { AutomatedReadabilityDiagnosticProvider } from './AutomatedReadabilityDiagnosticProvider';

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
	validateTextDocument(open.document);
});

documents.onDidChangeContent(change => {
	connection.console.log("changed");
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
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
