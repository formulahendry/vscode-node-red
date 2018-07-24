"use strict";
import * as vscode from "vscode";
import { NodeRed } from "./nodeRed";

export async function activate(context: vscode.ExtensionContext) {
    const nodeRed = new NodeRed();
    await nodeRed.start();

    context.subscriptions.push(vscode.commands.registerCommand("node-red.open", () => {
        nodeRed.open(false);
    }));

    context.subscriptions.push(vscode.commands.registerCommand("node-red.openToSide", () => {
        nodeRed.open(true);
    }));

    context.subscriptions.push(vscode.commands.registerCommand("node-red.deploy", (fileUri: vscode.Uri) => {
        nodeRed.deployFlow(fileUri);
    }));
}

export function deactivate() {
}
