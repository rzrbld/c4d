import {CodeLensProvider, window, EventEmitter, Event, CodeLens, workspace, TextDocument, CancellationToken, Position} from 'vscode';
import fetch from 'cross-fetch';
import { C4DPanel } from '../panels/C4DPanel';

export class C4DCodeLensProvider implements CodeLensProvider {
    private codeLenses: CodeLens[] = [];
    private validateData: any;
    private regex: RegExp;
    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.regex = /(.+)/g;

        workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {
        this.codeLenses = [];
        C4DPanel.c4dOutput.appendLine("Current state of validation: "+workspace.getConfiguration("c4dcollection").get("enableValidationCodeLens"));
        if (workspace.getConfiguration("c4dcollection").get("enableValidationCodeLens")) {
            
            const text = document.getText();
            return this._doValidateCall(text, document);

        }
        return [];
    }

    private _doParseResults(data: Response, document: TextDocument): CodeLens[]{
        let jsonResult = JSON.parse(JSON.stringify(data));
        this.validateData = jsonResult;
        C4DPanel.c4dOutput.appendLine("RESULT as JSON: "+JSON.stringify(data));
        for (var key in jsonResult) {
            C4DPanel.c4dOutput.appendLine("KEY: "+key);
            C4DPanel.c4dOutput.appendLine("Text: "+ document.lineAt(Number(key)).text);
            C4DPanel.c4dOutput.appendLine("Substring: "+ jsonResult[key]["alias"]);
            C4DPanel.c4dOutput.appendLine("IndexOf: "+ document.lineAt(Number(key)).text.indexOf(jsonResult[key]["alias"]));

            const line = document.lineAt(Number(key));
            const indexOf = document.lineAt(Number(key)).text.indexOf(jsonResult[key]["alias"]);
            const position = new Position(line.lineNumber, indexOf);
            const range = document.getWordRangeAtPosition(position);
            if (range) {
                this.codeLenses.push(new CodeLens(range));
            }
        }
        return this.codeLenses;
    }

    private async _doValidateCall(text: string, document: TextDocument): Promise<CodeLens[]>{
        C4DPanel.c4dOutput.appendLine("Validate engaged with text: "+text);
        let apiURL = C4DPanel.c4dConfig.get("c4dcollection.collectionAPIURL");
        let finalURL = apiURL+'/validate';

        const response = await fetch(finalURL, {
            method: "post",
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Accept': 'application/json',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Content-Type': 'application/json'
            },
          
            body: text
          });
        const data = await response.json(); 
        return this._doParseResults(data, document);
        // C4DPanel.c4dOutput.appendLine("Validate results: "+JSON.stringify(data));
    }

    private static _doPrepareMessage(data: any):string{
        var msgStr = "";
        for (const [key, value] of Object.entries(data)) {
            if(typeof(value) !== undefined){
                msgStr = msgStr + `${key}: ${value} \n\r`;
            }
        }
        return msgStr;
    }

    public static _doShowNotification(data: any){
        C4DPanel.c4dOutput.appendLine("Message object: "+JSON.stringify(data[0]) +" Data length: "+data.length);
        let text = "Unpredictable error";
        
        if(data.length > 0){
            let propsText = this._doPrepareMessage(data[0].Props);
            if(data[0].Type){
                
                text = `Relation entry: \n ${data[0].Type} \n ${propsText}` ;
            } else {
                text = `Node entry: \n ${data[0].Labels[0]} \n ${propsText}`;
            }
           
        } 
        
        window.showInformationMessage(text);
    }

    public resolveCodeLens(codeLens: CodeLens, token: CancellationToken) {
        if (workspace.getConfiguration("c4dcollection").get("enableValidationCodeLens", true)) {
            C4DPanel.c4dOutput.appendLine("Resolve CodeLense: "+JSON.stringify(codeLens));
                C4DPanel.c4dOutput.appendLine("Resolve Data for CodeLense: "+JSON.stringify(codeLens.range)+" start:"+JSON.stringify(codeLens.range.start.line));
                let obj: any;
                let text = "Unknown object";
                if(this.validateData.hasOwnProperty(codeLens.range.start.line+"")){
                    obj = this.validateData[codeLens.range.start.line+""];
                    C4DPanel.c4dOutput.appendLine("Resolve Data for CodeLense: "+JSON.stringify(obj)+" EXIST:"+obj.exist);

                    switch (obj.relation) {
                        case true:
                            if(obj.exist === true){
                                text = "Relation already exist";
                            }else{
                                text = "Relation does not exist ";
                            }
                            break;

                        case false:
                            if(obj.exist === true){
                                text = "Object `"+ obj.alias +"` already exist";
                            }else{
                                text = "Object `"+ obj.alias +"` does not exist ";
                            }
                            break;
                        
                    
                        default:
                            text = "Unknown object or relation";
                            break;
                    }                    
                }
            codeLens.command = {
                title: text,
                tooltip: "Tooltip provided by C4D extension",
                command: "c4dcollection.codelensAction",
                arguments: [obj.object]
            };
            return codeLens;
        }
        return null;
    }
}