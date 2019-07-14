import * as Net from "net";
import * as vscode from "vscode";

export function createVSCodeServer(
  logger: vscode.OutputChannel,
  onClose: () => void,
  onConnect: (vscodeSocket: Net.Socket) => void
): Net.Server {
  return Net.createServer({ pauseOnConnect: true }, async vscodeSocket => {
    logger.appendLine("[vscode-socket] connected established");
    vscodeSocket.on("close", onClose);
    vscodeSocket.on("error", error => {
      logger.appendLine("[vscode-socket] error: " + (error && error.message));
    });
    onConnect(vscodeSocket);
  }).listen(0);
}
