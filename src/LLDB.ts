import * as vscode from "vscode";
import * as paths from "./paths";
import * as Net from "net";

const LLDBVSCODE_CONNECTION_RETRY_TIME_MS = 100;
const LLDBVSCODE_CONNECTION_TIMEOUT_MS = 2000;
const LLDBVSCODE_CONNECTION_MAX_ATTEMPS =
  LLDBVSCODE_CONNECTION_TIMEOUT_MS / LLDBVSCODE_CONNECTION_RETRY_TIME_MS;

export class LLDB {
  port: number;
  terminal: vscode.Terminal;
  logger: vscode.OutputChannel;

  constructor(
    port: number,
    terminal: vscode.Terminal,
    logger: vscode.OutputChannel
  ) {
    this.port = port;
    this.terminal = terminal;
    this.logger = logger;
  }
  public dispose(): void {
    this.terminal.dispose();
  }
  connect(): Promise<Net.Socket> {
    return new Promise((resolve, reject) => {
      const tryConnect = (attempt: number) => {
        setTimeout(() => {
          const socket = new Net.Socket();
          socket.on("connect", () => {
            this.logger.appendLine("[lldb-socket] Connection established");
            resolve(socket);
          });
          socket.on("error", err => {
            this.logger.appendLine(
              "[lldb-socket] Connection attempt failed with error " +
                (err && err.message)
            );
            if (attempt === LLDBVSCODE_CONNECTION_MAX_ATTEMPS) {
              reject(err);
            }
            tryConnect(attempt + 1);
          });
          socket.connect({ port: this.port, host: "127.0.0.1" });
        }, LLDBVSCODE_CONNECTION_RETRY_TIME_MS);
      };
      tryConnect(1);
    });
  }
}

export function spawnLLDBVSCode(logger: vscode.OutputChannel): LLDB {
  const lldbPort = Math.floor(Math.random() * 45000) + 20000;
  const lldbVSCodeTerminal = vscode.window.createTerminal(
    "lldb-vscode",
    paths.getLLDBPath(),
    [lldbPort.toString()]
  );
  lldbVSCodeTerminal.show();
  return new LLDB(lldbPort, lldbVSCodeTerminal, logger);
}
