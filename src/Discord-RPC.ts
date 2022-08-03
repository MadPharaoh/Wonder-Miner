import { Client } from "discord-rpc";

export class RPCClient extends Client {
	clientReady: boolean = false;

	constructor() {
        super({ transport: 'ipc' });

		this.once("ready", () => {
			this.clientReady = true;
			this.setActivity({
                details:"wonderminer.net",
                state: "Madencilik yapıyor",
                largeImageKey: "wonderminerapp",
                smallImageKey: "Wonder Miner",
                largeImageText: "None",
                smallImageText: "None",
                buttons: [{label : "Discord" , url : "https://discord.gg/dUzp6Z8"},{label : "Wonder Miner",url : "https://wonderminer.net"}],
                startTimestamp: Date.now(),
            });
		});

	}

}
