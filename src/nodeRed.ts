"use strict";
import * as fs from "fs";
import * as path from "path";
import * as request from "request-promise";
import * as vscode from "vscode";
import { AppInsightsClient } from "./appInsightsClient";
import { NodeRedServer } from "./nodeRedServer";
import { NodeRedWebview } from "./nodeRedWebview";
import { Utility } from "./utility";

export class NodeRed {
    private nodeRedServer: NodeRedServer;

    constructor() {
        this.nodeRedServer = new NodeRedServer();
    }

    public async start() {
        await this.nodeRedServer.start();
    }

    public async open(toSide: boolean) {
        const webview = new NodeRedWebview(this.nodeRedServer.Port);
        const previewUri: vscode.Uri = vscode.Uri.parse("extension-leaderboard://authority/show-extension-leaderboard");
        vscode.workspace.registerTextDocumentContentProvider("extension-leaderboard", webview);
        webview.update(previewUri);
        vscode.commands.executeCommand("vscode.previewHtml",
            previewUri,
            toSide ? vscode.ViewColumn.Two : vscode.ViewColumn.One,
            "Node-RED");
        AppInsightsClient.sendEvent("open", { toSide: toSide.toString() });
    }

    public async deployFunction(fileUri: vscode.Uri) {
        const fileName: string = path.basename(fileUri.fsPath, path.extname(fileUri.fsPath));
        const fileContent: string = fs.readFileSync(fileUri.fsPath, "utf-8");

        const flowId: string = fileName.split("_")[0];
        const nodeId: string = fileName.split("_")[1];

        const flow: any = await Utility.getFlow(this.nodeRedServer.Port, flowId);

        flow.nodes.forEach((node) => {
            if (node.id === nodeId) {
                node.func = fileContent;
            }
        });

        await this.updateFunctionNodeJS(flowId, flow);
        vscode.window.showInformationMessage("Function is successfully deployed.");
    }

    private async updateFunctionNodeJS(flowId: string, flow: object) {
        const url: string = `http://localhost:${this.nodeRedServer.Port}/red/flow/${flowId}`;
        await request.put(url, { json: flow });
    }
}
