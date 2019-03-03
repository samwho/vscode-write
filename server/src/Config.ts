import { Connection, TextDocument } from 'vscode-languageserver';

export class Config<T> {
	connection: Connection;
	section: string;
	defaults: T;
	constructor(connection: Connection, section: string, defaults: T = <T>{}) {
		this.connection = connection;
		this.section = section;
		this.defaults = defaults;
	}

	async for(document: TextDocument): Promise<T> {
    if (this.connection === undefined) {
      return this.defaults;
    }

    return this.connection.workspace.getConfiguration({
      scopeUri: document.uri,
      section: this.section
    }).then(config => {
			return { ...this.defaults, ...config };
		});
	}
}