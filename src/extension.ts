// Copyright 2013-present Facebook. All Rights Reserved.
"use strict";

import * as vscode from "vscode";
import {
  WorkspaceFolder,
  DebugConfiguration,
  ProviderResult,
  CancellationToken
} from "vscode";
import { MiddlewareDap } from "./MiddlewareDap";

/*
 * Set the following compile time flag to true if the
 * debug adapter should run inside the extension host.
 * Please note: the test suite does not (yet) work in this mode.
 */
const EMBED_DEBUG_ADAPTER = true;

export function activate(context: vscode.ExtensionContext) {
  const provider = new LLDBDebugConfigurationProvider();
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider("lldb-vscode", provider)
  );

  if (EMBED_DEBUG_ADAPTER) {
    const factory = new LLDBDebugAdapterDescriptorFactory();
    context.subscriptions.push(
      vscode.debug.registerDebugAdapterDescriptorFactory("lldb-vscode", factory)
    );
    context.subscriptions.push(factory);
  }

  const command = "LLDBVSCode.freeLaunch";
  context.subscriptions.push(
    vscode.commands.registerCommand(command, freeLaunch)
  );
}

function freeLaunch() {
  const dc = { type: "lldb-vscode", name: "Free Launch", request: "attach" };
  vscode.debug.startDebugging(undefined, dc);
}

export function deactivate() {
  // nothing to do
}

class LLDBDebugConfigurationProvider
  implements vscode.DebugConfigurationProvider {
  /**
   * Massage a debug configuration just before a debug session is being launched,
   * e.g. add all missing attributes to the debug configuration.
   */
  resolveDebugConfiguration(
    folder: WorkspaceFolder | undefined,
    config: DebugConfiguration,
    token?: CancellationToken
  ): ProviderResult<DebugConfiguration> {
    if (!config.program) {
      if (config.name !== "Free Launch") {
        return vscode.window
          .showInformationMessage("Cannot find a program to debug")
          .then(_ => {
            return undefined; // abort launch
          });
      }
    }
    return config;
  }
}

class LLDBDebugAdapterDescriptorFactory
  implements vscode.DebugAdapterDescriptorFactory {
  private logger: vscode.OutputChannel;
  private middlewareDap?: MiddlewareDap = undefined;

  constructor() {
    this.logger = vscode.window.createOutputChannel("lldb-vscode");
  }

  createDebugAdapterDescriptor(
    session: vscode.DebugSession,
    executable: vscode.DebugAdapterExecutable | undefined
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    this.logger.show();
    this.dispose();

    this.middlewareDap = new MiddlewareDap(this.logger);
    // make VS Code connect to debug server
    return new vscode.DebugAdapterServer(this.middlewareDap.getVSCodePort());
  }

  dispose() {
    if (this.middlewareDap) {
      this.middlewareDap.dispose();
      this.middlewareDap = undefined;
    }
  }
}
