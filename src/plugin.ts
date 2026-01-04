import * as Misskey from 'misskey-js';

export interface Command {
    name: string;
    execute: (note: Misskey.entities.Note, args: string[], stream: Misskey.Stream, client: Misskey.api.APIClient) => Promise<void> | void;
}

export interface PluginEvent {
    eventName: string;
    callback: (...args: any[]) => void | Promise<void>;
}

export default abstract class Plugin {
    name: string;
    commands: Command[] = [];
    events: PluginEvent[] = [];

    constructor(plugin_name: string) {
        this.name = plugin_name;
    }

    async init(): Promise<void> {
    }

    async emit(eventName: string, ...args: any[]) {
        const targets = this.events.filter(e => e.eventName === eventName);
        
        for (const target of targets) {
            await target.callback(...args);
        }
    }

    addCommand(command: Command) {
        this.commands.push(command);
    }

    addEvent(event: PluginEvent) {
        this.events.push(event);
    }
}