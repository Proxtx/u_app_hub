import { clients, refreshClients } from "../../private/clients.js";

export class App {
  client;

  constructor(config) {
    this.config = config;
    this.findClient();
  }

  async updateDefinitions() {
    if (!this.client) await this.findClient();
    if (!this.client) return;
    let result = await this.client.request("http", "request", [
      "POST",
      this.config.url,
      JSON.stringify({
        arguments: [this.config.pwd],
        export: "getDevices",
        module: "public/devices.js",
      }),
      "application/json",
    ]);

    if (!result?.result?.success) return delete this.client;

    let clients;
    try {
      clients = JSON.parse(result.result.response).data;
    } catch {
      return delete this.client;
    }

    for (let method in this.definitions.methods) {
      this.definitions.methods[method].arguments[0].options = clients;
    }
  }

  async sleep(client) {
    await this.client.request("http", "request", [
      "POST",
      this.config.url,
      JSON.stringify({
        arguments: [this.config.pwd, client, true],
        export: "darken",
        module: "public/devices.js",
      }),
      "application/json",
    ]);
  }

  async wakeUp(client) {
    await this.client.request("http", "request", [
      "POST",
      this.config.url,
      JSON.stringify({
        arguments: [this.config.pwd, client, false],
        export: "darken",
        module: "public/devices.js",
      }),
      "application/json",
    ]);
  }

  async changeScene(client, scene) {
    await this.client.request("http", "request", [
      "POST",
      this.config.url,
      JSON.stringify({
        arguments: [this.config.pwd, client, scene],
        export: "switchScene",
        module: "public/devices.js",
      }),
      "application/json",
    ]);
  }

  async changeSceneJSON(client, scene) {
    await this.client.request("http", "request", [
      "POST",
      this.config.url,
      JSON.stringify({
        arguments: [this.config.pwd, client, JSON.parse(scene)],
        export: "switchScene",
        module: "public/devices.js",
      }),
      "application/json",
    ]);
  }

  async info(client) {
    return JSON.parse(
      (
        await this.client.request("http", "request", [
          "POST",
          this.config.url,
          JSON.stringify({
            arguments: [this.config.pwd, client],
            export: "info",
            module: "public/devices.js",
          }),
          "application/json",
        ])
      ).result.response
    );
  }

  async findClient() {
    await refreshClients();
    if (clients[this.config.client]) this.client = clients[this.config.client];
  }
}
