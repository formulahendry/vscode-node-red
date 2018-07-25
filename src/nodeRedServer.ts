"use strict";
import * as express from "express";
import * as getPort from "get-port";
import * as http from "http";
import * as RED from "node-red";
import * as embeddedStart from "node-red-embedded-start";
import * as vscode from "vscode";
import { Utility } from "./utility";

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
        let settings = {
            httpAdminRoot: "/red",
            httpNodeRoot: "/api",
            vscodeInvokeRoot: "/vscode-invoke",
            functionGlobalContext: {},    // enables global context
        };
        settings = Object.assign(settings, userSettings);

        // Initialize the runtime with a server and settings
        (RED as any).init(server, settings);

        this.port = await getPort({ port: 10086 });

        // Serve the editor UI from /red
        app.use(settings.httpAdminRoot, (RED as any).httpAdmin);

        // Serve the http nodes UI from /api
        app.use(settings.httpNodeRoot, (RED as any).httpNode);

        // Listening for VS Code edit request from /vscode-invoke
        app.use(settings.vscodeInvokeRoot, async (req, res) => {
            res.end();
            const flowId = req.query.flow;
            const nodeId = req.query.node;
            await Utility.openFunction(this.port, flowId, nodeId);
        });

        server.listen(this.port);
        // tslint:disable-next-line:no-console
        console.log("port:" + this.port);

        // Start the runtime
        await (RED as any).start();
        await embeddedStart(RED);
    }
}
