"use strict";
import appInsights = require("applicationinsights");
import * as vscode from "vscode";

export class AppInsightsClient {
    public static sendEvent(eventName: string, properties?: { [key: string]: string; }): void {
        if (this._enableTelemetry) {
            this._client.trackEvent({ name: eventName, properties });
        }
    }

    private static _client = new appInsights.TelemetryClient("67c87754-5df2-4f1c-b112-0ed62406abbf");
    private static _enableTelemetry = vscode.workspace.getConfiguration("telemetry").get<boolean>("enableTelemetry");
}
