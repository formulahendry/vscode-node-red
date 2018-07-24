import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as request from "request-promise";
import * as vscode from "vscode";

export class Utility {
    public static storagePath: string;

    public static initialize(context: vscode.ExtensionContext) {
        Utility.storagePath = context.storagePath ? context.storagePath : path.join(os.tmpdir(), "vscode-node-red");
    }

    public static async openFunction(port, flowId: string, nodeId: string) {
        const node: any = await this.getFunctionNode(port, flowId, nodeId);
        const functionPath: string = Utility.getFunctionPath(flowId, nodeId);
        await fs.ensureFile(functionPath);
        await fs.writeFile(functionPath, node.func, "utf-8");
        vscode.workspace.openTextDocument(functionPath).then((document: vscode.TextDocument) => {
            if (document.isDirty) {
                vscode.window.showWarningMessage(`Your function code has unsaved changes. \
                        Please close or save the file. Then try again.`);
            }
            vscode.window.showTextDocument(document);
        });
    }

    public static async getFunctionNode(port, flowId: string, nodeId: string): Promise<any> {
        const flow: any = await Utility.getFlow(port, flowId);
        let functionNode: any = null;
        flow.nodes.forEach((node) => {
            if (node.id === nodeId) {
                functionNode = node;
            }
        });
        return functionNode;
    }

    public static async getFlow(port, flowId: string): Promise<any> {
        const url: string = `http://localhost:${port}/red/flow/${flowId}`;
        const flow: any = JSON.parse(await request.get(url));
        return flow;
    }

    private static getFunctionPath(flowId: string, nodeId: string) {
        return path.join(Utility.storagePath, `${flowId}_${nodeId}.js`);
    }
}
