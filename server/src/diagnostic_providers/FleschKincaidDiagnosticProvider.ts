import { MarkdownScanner } from '../MarkdownScanner';
import { DiagnosticSeverity, TextDocument, Diagnostic, Connection } from 'vscode-languageserver';
import { DiagnosticProvider } from './DiagnosticProvider';

var fleschKincaid = require('flesch-kincaid');
var wink = require('wink-tokenizer')();
var syllable = require('syllable');

export class FleschKincaidDiagnosticProvider implements DiagnosticProvider {
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
      var syllables = 0;
      for (const token of wink.tokenize(sentence)) {
        if (token.tag !== "word") {
          continue;
        }

        words += 1;
        syllables += syllable(token.value);
      }

      var grade = fleschKincaid({
        sentence: 1,
        word: words,
        syllable: syllables,
      });

      if (grade > 20) {
        diagnostics.push(
          Diagnostic.create(
            range,
            "Very high Flesch-Kincaid grade level: " + grade,
            DiagnosticSeverity.Error));
      } else if (grade > 15) {
        diagnostics.push(
          Diagnostic.create(
            range,
            "High Flesch-Kincaid grade level: " + grade,
            DiagnosticSeverity.Warning));
      }
    });

    return diagnostics;
  }
}