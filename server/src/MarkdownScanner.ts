import {
  TextDocument,
  Range,
  Position,
  Connection,
} from 'vscode-languageserver';

var commonmark = require('commonmark');
var parser = new commonmark.Parser();
var sbd = require('sbd');

export class MarkdownScanner {
  connection: Connection;
  constructor(connection: Connection) {
    this.connection = connection;
  }

  paragraphs(document: TextDocument, cb: (node: any) => void) {
    var ast = parser.parse(document.getText());
    var walker = ast.walker();
    var event;
    while ((event = walker.next())) {
      if (!event.entering) {
        continue;
      }

      if (event.node.type !== "paragraph") {
        continue;
      }

      cb(event.node);
    }
  }

  sentences(document: TextDocument, cb: (text: string, range: Range) => void) {
    this.paragraphs(document, p => {
      var range = this.nodeRange(p);
      var text = document.getText(range);
      var sentences = sbd.sentences(text, {
        preserve_whitespace: true,
      });

      var start = range.start;
      for (const sentence of sentences) {
        var lines = start.line;
        var chars = start.character;

        for (const char of sentence) {
          if (char === '\n') {
            lines += 1;
            chars = 0;
          } else {
            chars += 1;
          }
        }

        var end = Position.create(lines, chars);
        cb(sentence, Range.create(start, end));
        start = end;
      }
    });
  }

  nodeRange(node: any): Range {
    return this.range(node.sourcepos);
  }

  range(sourcepos: number[][]): Range {
    return Range.create(
      sourcepos[0][0] - 1,
      sourcepos[0][1] - 1,
      sourcepos[1][0] - 1,
      sourcepos[1][1]
    );
  }
}
