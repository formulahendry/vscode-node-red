"use strict";
import * as fs from "fs";
import * as path from "path";
import * as request from "request-promise";
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

    public async deployFlow(fileUri: vscode.Uri) {
        const fileName: string = path.basename(fileUri.fsPath);
        const fileContent: string = fs.readFileSync(fileUri.fsPath, "utf-8");

        const flowId: string = fileName.split("_")[0];
        const nodeId: string = fileName.split("_")[1];

        const flow: any = await this.getFlow(flowId);

        flow.nodes.forEach((node) => {
            if (node.id === nodeId) {
                node.func = fileContent;
            }
        });

        await this.updateFunctionNodeJS(flowId, flow);
    }

    // please call this function to load js to file
    private async loadFunctionNodeJS(fileUri: vscode.Uri, flowId: string, nodeId: string) {
        const node: any = await this.getFunctionNode(flowId, nodeId);
        fs.writeFileSync(fileUri.fsPath, node.func, "utf-8");
    }

    private async getFunctionNode(flowId: string, nodeId: string): Promise<any> {
        const flow: any = await this.getFlow(flowId);
        let functionNode: any = null;
        flow.nodes.forEach((node) => {
            if (node.id === nodeId) {
                functionNode = node;
            }
        });
        return functionNode;
    }

    private async getFlow(flowId: string): Promise<any> {
        const url: string = `http://localhost:${this.nodeRedServer.Port}/red/flow/${flowId}`;
        const flow: any = JSON.parse(await request.get(url));
        return flow;
    }

    private async updateFunctionNodeJS(flowId: string, flow: object) {
        const url: string = `http://localhost:${this.nodeRedServer.Port}/red/flow/${flowId}`;
        await request.put(url, {json: flow});
    }
}
