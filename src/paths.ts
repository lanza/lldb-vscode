import * as vscode from "vscode";
import * as process from "process";
import { fail } from "assert";

export function getLLDBPath(): string {
  const root = vscode.extensions.getExtension("lanza.lldb-vscode")!
    .extensionPath;
  switch (process.platform) {
    case "win32":
      return root + "/bin/windows/lldb-vscode.exe";
    case "darwin":
      return root + "/bin/darwin/bin/lldb-vscode";
    case "linux":
      return root + "/bin/linux/bin/lldb-vscode";
    default:
      fail("Invalid operating system");
      return "";
  }
}
