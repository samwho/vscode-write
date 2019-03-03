import * as Tokenizr from "tokenizr";
import { Connection, Range, Position } from 'vscode-languageserver';

// This class is largely based on https://github.com/winkjs/wink-tokenizer.
export class TextScanner {
	connection: Connection;
	lexer: Tokenizr;
	constructor(connection: Connection) {
		this.connection = connection;
		this.lexer = new Tokenizr();

		this.lexer.rule(/(?:https?:\/\/)(?:[\da-z\.-]+)\.(?:[a-z\.]{2,6})(?:[\/\w\.\-\?#=]*)*\/?/, (ctx, match) => {
			ctx.accept("url");
		});
		this.lexer.rule(/[-!#$%&'*+\/=?^\w{|}~](?:\.?[-!#$%&'*+\/=?^\w`{|}~])*@[a-z0-9](?:-?\.?[a-z0-9])*(?:\.[a-z](?:-?[a-z0-9])*)+/, (ctx, match) => {
			ctx.accept("email");
		});
		this.lexer.rule(/\@\w+/, (ctx, match) => {
			ctx.accept("mention");
		});
		this.lexer.rule(/\#[a-z][a-z0-9]*/i, (ctx, match) => {
			ctx.accept("hashtag");
		});
		this.lexer.rule(/\#[\u0900-\u0963\u0970-\u097F][\u0900-\u0963\u0970-\u097F\u0966-\u096F0-9]*/i, (ctx, match) => {
			ctx.accept("hashtag");
		});
		this.lexer.rule(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u26FF]|[\u2700-\u27BF]/, (ctx, match) => {
			ctx.accept("emoji");
		});
		this.lexer.rule(/:-?[dps\*\/\[\]\{\}\(\)]|;-?[/(/)d]|<3/i, (ctx, match) => {
			ctx.accept("emoticon");
		});
		this.lexer.rule(/[a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF][a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\']*/i, (ctx, match) => {
			ctx.accept("word");
		});
		this.lexer.rule(/[\u0900-\u094F\u0951-\u0963\u0970-\u097F]+/i, (ctx, match) => {
			ctx.accept("word");
		});
		this.lexer.rule(/./, (ctx, match) => {
			ctx.ignore();
		});
		this.lexer.rule(/\s/, (ctx, match) => {
			ctx.ignore();
		});
	}

	tokens(content: string, cb: (token, range: Range) => void) {
		this.lexer.input(content);
		this.lexer.tokens().forEach((token) => {
			let start = Position.create(token.line - 1, token.column - 1);
			let end = Position.create(token.line - 1, token.column + token.text.length - 1);
			let range = Range.create(start, end);
			cb(token, range);
		});
	}

	words(content: string, cb: (word: string, range: Range) => void) {
		this.tokens(content, (token, range) => {
			if (token.type === "word") {
				cb(token.text, range);
			}
		});
	}
}