import * as Net from "net";
import * as vscode from "vscode";
import { spawnLLDBVSCode, LLDB } from "./LLDB";
import { createVSCodeServer } from "./VSCodeServer";
import { startCommunication } from "./MiddlewareProtocol";

export class MiddlewareDap {
  private vscodeServer: Net.Server;
  private lldbVSCode: LLDB;
  private logger: vscode.OutputChannel;

  constructor(logger: vscode.OutputChannel) {
    this.logger = logger;
    this.lldbVSCode = spawnLLDBVSCode(this.logger);
    this.vscodeServer = createVSCodeServer(
      this.logger,
      () => this.dispose(),
      async (vscodeSocket: Net.Socket) => {
        const lldbSocket = await this.lldbVSCode.connect();
        startCommunication(this.logger, lldbSocket, vscodeSocket);
      }
    );
  }

  getVSCodePort(): number {
    return this.vscodeServer.address().port;
  }

  dispose() {
    this.vscodeServer.close();
    this.lldbVSCode.dispose();
  }
}
