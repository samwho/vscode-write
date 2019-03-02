import { MarkdownScanner } from '../scanners/MarkdownScanner';
import { DiagnosticSeverity, TextDocument, Diagnostic, Connection } from 'vscode-languageserver';
import { DiagnosticProvider } from './DiagnosticProvider';
import { TextScanner } from '../scanners/TextScanner';

var automatedReadability = require('automated-readability');

export class AutomatedReadability implements DiagnosticProvider {
  connection: Connection;
  scanner: MarkdownScanner;
  textScanner: TextScanner;

  constructor(connection: Connection) {
    this.connection = connection;
    this.scanner = new MarkdownScanner(connection);
    this.textScanner = new TextScanner(connection);
  }

  provideDiagnostics(document: TextDocument): Diagnostic[] {
    var diagnostics: Diagnostic[] = [];

    this.scanner.sentences(document, (sentence, range) => {
      var words = 0;
      var characters = 0;

      this.textScanner.words(sentence, (word, range) => {
        words += 1;
        characters += word.length;
      });

      let score = automatedReadability({
        sentence: 1,
        word: words,
        character: characters,
      });

      if (score > 14) {
        diagnostics.push(
          Diagnostic.create(
            range,
            "This sentence is difficult to read, according to the automated readability index. It has a score of " + score.toFixed(1) + ". This means the reader would need to be " + this.scoreToAge(score) + " to understand it.",
            DiagnosticSeverity.Warning));
      }
    });

    return diagnostics;
  }

  // https://en.wikipedia.org/wiki/Automated_readability_index
  scoreToGradeLevel(score: number): string {
    if (score >= 0 && score < 2) {
      return "Kindergarten";
    } else if (score >= 2 && score < 3) {
      return "First/Second Grade";
    } else if (score >= 3 && score < 4) {
      return "Third Grade";
    } else if (score >= 4 && score < 5) {
      return "Fourth Grade";
    } else if (score >= 5 && score < 6) {
      return "Fifth Grade";
    } else if (score >= 6 && score < 7) {
      return "Sixth Grade";
    } else if (score >= 7 && score < 8) {
      return "Seventh Grade";
    } else if (score >= 8 && score < 9) {
      return "Eighth Grade";
    } else if (score >= 9 && score < 10) {
      return "Ninth Grade";
    } else if (score >= 10 && score < 11) {
      return "Tenth Grade";
    } else if (score >= 11 && score < 12) {
      return "Eleventh Grade";
    } else if (score >= 12 && score < 13) {
      return "Twelfth Grade";
    } else if (score >= 13 && score < 14) {
      return "College student";
    } else {
      return "Professor";
    }
  }

  // https://en.wikipedia.org/wiki/Automated_readability_index
  scoreToAge(score: number): string {
    if (score >= 0 && score < 2) {
      return "5-6";
    } else if (score >= 2 && score < 3) {
      return "6-7";
    } else if (score >= 3 && score < 4) {
      return "7-9";
    } else if (score >= 4 && score < 5) {
      return "9-10";
    } else if (score >= 5 && score < 6) {
      return "10-11";
    } else if (score >= 6 && score < 7) {
      return "11-12";
    } else if (score >= 7 && score < 8) {
      return "12-13";
    } else if (score >= 8 && score < 9) {
      return "13-14";
    } else if (score >= 9 && score < 10) {
      return "14-15";
    } else if (score >= 10 && score < 11) {
      return "15-16";
    } else if (score >= 11 && score < 12) {
      return "16-17";
    } else if (score >= 12 && score < 13) {
      return "17-18";
    } else if (score >= 13 && score < 14) {
      return "18-24";
    } else {
      return "24+";
    }
  }
}