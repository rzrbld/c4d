import { commands, ExtensionContext, workspace, window } from "vscode";
import { C4DPanel } from "./panels/C4DPanel";

export function activate(context: ExtensionContext) {
  // Create the helloworld command
  const helloCommand = commands.registerCommand("c4dcollection.helloWorld", () => {
    C4DPanel.render(context.extensionUri);
  });

  workspace.onDidChangeConfiguration(event => {
    C4DPanel.c4dOutput.appendLine("Configuration is changed");
    C4DPanel.updateConfig();
  });

  // Add command to the extension context
  context.subscriptions.push(helloCommand);
}
