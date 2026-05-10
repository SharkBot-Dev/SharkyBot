import * as Misskey from 'misskey-js';

export interface BaseCommand<T> {
    name: string;
    execute: (
        note: T, 
        args: string[], 
        stream: Misskey.Stream, 
        client: Misskey.api.APIClient
    ) => Promise<void> | void;
}

export type Command = BaseCommand<Misskey.entities.Note>;