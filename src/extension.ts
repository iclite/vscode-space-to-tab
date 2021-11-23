// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Get string length
function getLen(str :string) :number {
    let length = 0;
    for(let i=0; i<str.length; i++) {
        let chr = str.charCodeAt(i);
        if( (chr >= 0x00 && chr <= 0x80) ||
            (chr >= 0xa0 && chr <= 0xff) ||
            (chr === 0xf8f0) ||
            (chr >= 0xff61 && chr <= 0xff9f) ||
            (chr >= 0xf8f1 && chr <= 0xf8f3)){
            // Half-angle character
            length += 1;
        }else{
            // Full-angle character
            length += 2;
        }
    }

    return length;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "markdowntable" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    function registerCommandNice(commandId: string, run: (...args: any[]) => void): void {
        let command = vscode.commands.registerCommand(commandId, run);
        context.subscriptions.push(command);
    }

    registerCommandNice('spacetab.convert', () => {
        const editor = vscode.window.activeTextEditor as vscode.TextEditor;
        const doc = editor.document;
        const all_selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(doc.lineCount - 1, 10000));

        let tabSize = editor.options.tabSize as number;

        editor.edit(edit => {
            for (let i = 0; i < doc.lineCount; i++) {
                let text = doc.lineAt(i).text;
                
                // First, tab to space
                while (text.indexOf('\t') != -1) {
                    let position = text.indexOf('\t');
                    let before = text.substring(0, position);
                    let beforeLen = getLen(before);
                    let spacenum = tabSize - (beforeLen % tabSize);
                    let texttemp = before + ' '.repeat(spacenum) + text.substring(position + 1);
                    text = texttemp;
                }
                
                let reString = `.{1,${tabSize}}`;
                let re = new RegExp(reString, 'g');
                let textSplit = text.match(re);
                let textNew = "";

                // Second, space to tab
                while (textSplit !== null && textSplit.length > 0) {
                    let chars = textSplit.shift();
                    if (chars !== undefined) {
                        let charsTrim = chars.trim();
                        if (charsTrim.length < chars.length) {
                            if (charsTrim === "") {
                                textNew += "\t";
                            } else if (chars[0] === " ") {
                                textNew += charsTrim;
                            } else if (chars[3] === " ") {
                                textNew += charsTrim + '\t';
                            }
                        } else {
                            textNew += chars;
                        }
                    }
                }

                let selection = new vscode.Selection(new vscode.Position(i, 0), new vscode.Position(i, 10000));
                edit.replace(selection, textNew);
            }
        });
    });
}

// this method is called when your extension is deactivated
export function deactivate() { }
