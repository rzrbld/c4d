# c4d Extension

## Example workspace

![screenshot1](https://raw.githubusercontent.com/rzrbld/c4d/main/c4d-vscode-extension/screenshot/example_workspace.png)

## Install extension

```bash
cd c4d-vscode-extension

code --install-extension c4dcollection-0.6.0.vsix

```

## Run develop

```bash
# Navigate into extension directory
cd c4d-vscode-extension

# Install dependencies
npm install

# Open extension in VS Code
code .
```

Once is open inside VS Code you can run the extension by doing the following:

1. Press `F5` to open a new Extension Development Host window
2. Inside the host window, open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and type `C4D-Collection`

## Package extension

```bash
npm install -g vsce

cd c4d-vscode-extension

vsce package

```