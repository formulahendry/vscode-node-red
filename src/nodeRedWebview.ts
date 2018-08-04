"use strict";
import * as vscode from "vscode";

export class NodeRedWebview implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    constructor(private port: number) {
    }

    public provideTextDocumentContent(uri: vscode.Uri): string {
        let url = vscode.workspace.getConfiguration("vscode-node-red").get("url");
        if (!url) {
            url = `http://localhost:${this.port}/red`;
        }
        return `
<body style="margin:0px;padding:0px;overflow:hidden">
    <iframe src="${url}" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"></iframe>
</body>`;
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }
}
