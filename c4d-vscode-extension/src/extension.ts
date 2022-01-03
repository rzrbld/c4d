import { commands, ExtensionContext, workspace, window } from "vscode";
import { C4DPanel } from "./panels/C4DPanel";

export function activate(context: ExtensionContext) {
  // Create the searchPanel command
  const helloCommand = commands.registerCommand("c4dcollection.searchPanel", () => {
    C4DPanel.render(context.extensionUri);
  });

  workspace.onDidChangeConfiguration(event => {
    C4DPanel.c4dOutput.appendLine("Configuration is changed");
    C4DPanel.updateConfig();
  });

  // Add command to the extension context
  context.subscriptions.push(helloCommand);
}
