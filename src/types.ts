import * as Misskey from 'misskey-js';

export interface Command {
    execute: (note: Misskey.entities.Note, args: string[], stream: Misskey.Stream, client: Misskey.api.APIClient) => Promise<void> | void;
    name: string;
}