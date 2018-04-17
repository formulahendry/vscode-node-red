"use strict";
import * as vscode from "vscode";
import { AppInsightsClient } from "./appInsightsClient";
import { NodeRedServer } from "./nodeRedServer";
import { NodeRedWebview } from "./nodeRedWebview";

export class NodeRed {
    private nodeRedServer: NodeRedServer;

    constructor() {
        this.nodeRedServer = new NodeRedServer();
    }

    public async start() {
        await this.nodeRedServer.start();
    }

    public async open() {
        const webview = new NodeRedWebview(this.nodeRedServer.Port);
        const previewUri: vscode.Uri = vscode.Uri.parse("extension-leaderboard://authority/show-extension-leaderboard");
        vscode.workspace.registerTextDocumentContentProvider("extension-leaderboard", webview);
        webview.update(previewUri);
        vscode.commands.executeCommand("vscode.previewHtml", previewUri, vscode.ViewColumn.One, "Node-RED");
        AppInsightsClient.sendEvent("open");
    }
}
