import { commands, ExtensionContext, workspace, window, languages } from "vscode";
import { C4DPanel } from "./panels/C4DPanel";
import { C4DCodeLensProvider } from './providers/c4dCodeLenseProvider';


export function activate(context: ExtensionContext) {
  const codelensProvider = new C4DCodeLensProvider();
  languages.registerCodeLensProvider("plantuml", codelensProvider);

  commands.registerCommand("c4dcollection.enableValidationCodeLens", () => {
    workspace.getConfiguration("c4dcollection").update("enableValidationCodeLens", true, true);
  });

  commands.registerCommand("c4dcollection.codelensAction", (args: any) => {
    C4DCodeLensProvider._doShowNotification(args);
  });

  commands.registerCommand("c4dcollection.disableCodeLens", () => {
    workspace.getConfiguration("c4dcollection").update("enableValidationCodeLens", false, true);
  });

  // Create the searchPanel command
  const searchCommand = commands.registerCommand("c4dcollection.searchPanel", () => {
    C4DPanel.render(context.extensionUri);
  });

  const pumlC4InitCommand = commands.registerCommand("c4dcollection.initC4PUML", () => {
    C4DPanel.initC4PUML(context.extensionUri);
  });

  workspace.onDidChangeConfiguration(event => {
    C4DPanel.c4dOutput.appendLine("Configuration is changed");
    C4DPanel.updateConfig();
  });

  // Add command to the extension context
  context.subscriptions.push(searchCommand);
}
