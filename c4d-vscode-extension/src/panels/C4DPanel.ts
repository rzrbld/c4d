import { Disposable, Webview, WebviewView, WebviewPanel, window, Uri, ViewColumn, workspace, SnippetString, TextEditor, TextEdit } from "vscode";
import { getUri } from "../utilities/getUri";
import fetch from 'cross-fetch';

/**
 * This class manages the state and behavior of Hello World webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering Hello World webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class C4DPanel {
  public static currentPanel: C4DPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  public static c4dOutput = window.createOutputChannel("C4DCollection");
  public static c4dConfig = workspace.getConfiguration();
  public static curretActiveTextEd: TextEditor;
  

  /**
   * The HelloWorldPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;
    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(this.dispose, null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);

    window.onDidChangeActiveTextEditor(function (editor) { //dirty hack for stealing focus
      // C4DPanel.c4dOutput.appendLine("Current active: "+JSON.stringify(window.activeTextEditor?.document));
      if(editor){
        C4DPanel.curretActiveTextEd = editor;
      }
    });

    C4DPanel.c4dOutput.appendLine(`

    ▄████▄       █████▒▒█████   █    ██  ██▀███     ▓█████▄ 
    ▒██▀ ▀█     ▓██   ▒▒██▒  ██▒ ██  ▓██▒▓██ ▒ ██▒   ▒██▀ ██▌
    ▒▓█    ▄    ▒████ ░▒██░  ██▒▓██  ▒██░▓██ ░▄█ ▒   ░██   █▌
    ▒▓▓▄ ▄██▒   ░▓█▒  ░▒██   ██░▓▓█  ░██░▒██▀▀█▄     ░▓█▄   ▌
    ▒ ▓███▀ ░   ░▒█░   ░ ████▓▒░▒▒█████▓ ░██▓ ▒██▒   ░▒████▓ 
    ░ ░▒ ▒  ░    ▒ ░   ░ ▒░▒░▒░ ░▒▓▒ ▒ ▒ ░ ▒▓ ░▒▓░    ▒▒▓  ▒ 
      ░  ▒       ░       ░ ▒ ▒░ ░░▒░ ░ ░   ░▒ ░ ▒░    ░ ▒  ▒ 
    ░            ░ ░   ░ ░ ░ ▒   ░░░ ░ ░   ░░   ░     ░ ░  ░ 
    ░ ░                    ░ ░     ░        ░           ░    
    ░                                                 ░      

    VSCode plugin

    Authors    : rzrbld
    License    : MIT

    `);

  }

  public static updateConfig(){
    C4DPanel.c4dConfig = workspace.getConfiguration();
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri) {
    if (C4DPanel.currentPanel) {
      // If the webview panel already exists reveal it
      C4DPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "c4dcollection",
        // Panel title
        "C4D-Collection",
        // The editor column the panel should be displayed in
        { preserveFocus: true, viewColumn: ViewColumn.One},
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // retainContextWhenHidden: true,
          // enableCommandUris: true
        }
      );

      C4DPanel.currentPanel = new C4DPanel(panel, extensionUri);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    C4DPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to CSS and JavaScript files/packages
   * (such as the Webview UI Toolkit) are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const toolkitUri = getUri(webview, extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js",
    ]);
    const mainUri = getUri(webview, extensionUri, ["media", "main.js"]);
    const stylesUri = getUri(webview, extensionUri, ["media", "styles.css"]);

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="module" src="${toolkitUri}"></script>
          <script type="module" src="${mainUri}"></script>
          <link rel="stylesheet" href="${stylesUri}">
          <title>C4D-Collection</title>
        </head>
        <body>
          <vscode-text-field id="searchField" autofocus size="40">Search over collection</vscode-text-field>
          <vscode-divider></vscode-divider>
          <vscode-tag id="resultTag">Start typing ^</vscode-tag>
          <vscode-divider></vscode-divider>
          <div id="search-results"></div>
        </body>
      </html>
    `;
  }


  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */  
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const payload = message.payload;
        let searchTreshold = Number(C4DPanel.c4dConfig.get("c4dcollection.seachLengthTreshold"));

        switch (command) {
          case "search":
            C4DPanel.c4dOutput.appendLine("Seach in :" + C4DPanel.c4dConfig.get("c4dcollection.collectionAPIURL"));
            C4DPanel.c4dOutput.appendLine(payload);
            if(payload.length > searchTreshold){
              // Code that should run in response to the hello message command
              // window.showInformationMessage(text);
              this._doNodeSearch(payload);
            }
            return;
          case "paste":
            C4DPanel.c4dOutput.appendLine("Paste Engaged!"+payload);
            const editor = C4DPanel.curretActiveTextEd; //dirty hack for stealing focus
            if(editor){
              this.enterText(payload, editor);
            }
            return;
          case "searchOrigin":
            C4DPanel.c4dOutput.appendLine("SearchOrigin Engaged! Query: "+payload);
            C4DPanel.c4dOutput.appendLine("Seach in :" + C4DPanel.c4dConfig.get("c4dcollection.collectionAPIURL"));
            this._doOriginSearch(payload);

            return;
          // Add more switch case statements here as more webview message commands
          // are created within the webview context (i.e. inside media/main.js)
        }
      },
      undefined,
      this._disposables
    );
  }

  private enterText(text: string, editor: TextEditor) {
    C4DPanel.c4dOutput.appendLine("Saved Active Document"+JSON.stringify(C4DPanel.curretActiveTextEd));
    window.showTextDocument(editor.document.uri, { preview: false, viewColumn: editor.viewColumn, });
    var snippet = new SnippetString(text+'\n');
    if (editor) {
        editor.insertSnippet(snippet);
        
    }
  }

  private async _doNodeSearch(qs: String){
    let apiURL = C4DPanel.c4dConfig.get("c4dcollection.collectionAPIURL");
    let finalURL = apiURL+'/nodes?qstring='+qs;
    const response = await fetch(finalURL);
    const data = await response.json(); 
    C4DPanel.c4dOutput.appendLine(""+JSON.stringify(data));
    this._panel.webview.postMessage({
      command: "results",
      payload: data,
    });
  }

  private async _doOriginSearch(qs: String){
    let apiURL = C4DPanel.c4dConfig.get("c4dcollection.collectionAPIURL");
    let finalURL = apiURL+'/repo?qstring='+qs;
    const response = await fetch(finalURL);
    const data = await response.json(); 
    C4DPanel.c4dOutput.appendLine("Origin search results: "+JSON.stringify(data));
    this._panel.webview.postMessage({
      command: "origin-results",
      payload: data,
    });
  }

}
