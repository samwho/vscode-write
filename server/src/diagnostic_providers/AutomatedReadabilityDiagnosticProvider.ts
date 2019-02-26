import { MarkdownScanner } from '../MarkdownScanner';
import { DiagnosticSeverity, TextDocument, Diagnostic, Connection } from 'vscode-languageserver';
import { DiagnosticProvider } from './DiagnosticProvider';

var automatedReadability = require('automated-readability');
var wink = require('wink-tokenizer')();

export class AutomatedReadabilityDiagnosticProvider implements DiagnosticProvider {
  connection: Connection;
  scanner: MarkdownScanner;

  constructor(connection: Connection) {
     this.connection = connection;
     this.scanner = new MarkdownScanner(connection);
  }

  provideDiagnostics(document: TextDocument): Diagnostic[] {
    var diagnostics: Diagnostic[] = [];

    this.scanner.sentences(document, (sentence, range) => {
      var words = 0;
      var characters = 0;
      for (const token of wink.tokenize(sentence)) {
        if (token.tag !== "word") {
          continue;
        }

        words += 1;
        characters += token.value.length;
      }

      var grade = automatedReadability({
        sentence: 1,
        word: words,
        character: characters,
      });

      if (grade > 20) {
        diagnostics.push(
          Diagnostic.create(
            range,
            "Very high Automated Readability grade level: " + grade,
            DiagnosticSeverity.Error));
      } else if (grade > 15) {
        diagnostics.push(
          Diagnostic.create(
            range,
            "High Automated Readability grade level: " + grade,
            DiagnosticSeverity.Warning));
      }
    });

    return diagnostics;
  }
}