"use strict";
import { LocalSettings } from "@node-red/runtime";
import * as express from "express";
import * as getPort from "get-port";
import * as http from "http";
import * as RED from "node-red";
import * as embeddedStart from "node-red-embedded-start";
import { resolve } from "path";
import * as vscode from "vscode";

export class NodeRedServer {
    private isStarted = false;
    private port;

    get Port() {
        return this.port;
    }

    public async start() {
        if (this.isStarted) {
            return;
        }

        this.isStarted = true;

        // Create an Express app
        const app = express();

        // Add a simple route for static content served from 'public'
        app.use("/", express.static("public"));

        // Create a server
        const server = http.createServer(app);

        // Create the settings object - see default settings.js file for other options
        const userSettings = vscode.workspace.getConfiguration("vscode-node-red").get("settings.js");

        let settings: LocalSettings = {
            userDir: resolve(__dirname, "..", ".node-red"),
            httpAdminRoot: "/red",
            httpNodeRoot: "/api",
            functionGlobalContext: {},    // enables global context
            ...userSettings as any
        };

        // Initialise the runtime with a server and settings
        RED.init(server, settings);

        // Serve the editor UI from /red
        app.use(settings.httpAdminRoot as string, RED.httpAdmin);

        // Serve the http nodes UI from /api
        app.use(settings.httpNodeRoot as string, RED.httpNode);

        this.port = await getPort({port: 8008});
        server.listen(this.port);
        // tslint:disable-next-line:no-console
        console.log("port:" + this.port);

        // Start the runtime
        await RED.start();
        await embeddedStart(RED);
    }
}
