"use strict";
import * as vscode from "vscode";
import { NodeRed } from "./nodeRed";
import { Utility } from "./utility";

export async function activate(context: vscode.ExtensionContext) {
    const nodeRed = new NodeRed();
    await nodeRed.start();

    Utility.initialize(context);

    context.subscriptions.push(vscode.commands.registerCommand("node-red.open", () => {
        nodeRed.open(false);
    }));

    context.subscriptions.push(vscode.commands.registerCommand("node-red.openToSide", () => {
        nodeRed.open(true);
    }));

    context.subscriptions.push(vscode.commands.registerCommand("node-red.deploy", (fileUri: vscode.Uri) => {
        nodeRed.deployFunction(fileUri);
    }));
}

export function deactivate() {
}
