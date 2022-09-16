import * as vscode from 'vscode';

const enum LocCopyOptions {
    WITH_FULL_PATH = 1,
    WITH_RELATIVE_PATH = 2,
    WITH_CURSOR_POS = 3
}

export class Loc {
    static copy(options: Array<LocCopyOptions>) {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            const document = activeTextEditor.document;
            const selection = activeTextEditor.selection;

            if (document.isUntitled || !selection.isSingleLine) {
                return;
            }

            let path = "";
            let cursorPos = "";
            const line = selection.active.line + 1;

            if (options.includes(LocCopyOptions.WITH_FULL_PATH)) {
                path = document.fileName;
            }
            else {
                if (options.includes(LocCopyOptions.WITH_RELATIVE_PATH)) {
                    path = vscode.workspace.asRelativePath(document.fileName);
                }
                else {
                    const segments = document.fileName.split(/[\\/]/);
                    if (segments.length === 0) {
                        return;
                    }
                    path = segments[segments.length - 1];
                }
            }

            const appendCursorPos = vscode.workspace.getConfiguration().get('copy-loc.appendCursorPos');
            if (appendCursorPos === 'always') {
                cursorPos = `:${selection.active.character}`;
            } else if (appendCursorPos != 'never' && options.includes(LocCopyOptions.WITH_CURSOR_POS)) {
                cursorPos = `:${selection.active.character}`;
            }

            const text = `${path}:${line}${cursorPos}`;

            vscode.env.clipboard.writeText(text);
            vscode.window.showInformationMessage('`' + text + '` is copied to clipboard');
        }
    }

    static newCommand(name: string, options: Array<LocCopyOptions>): vscode.Disposable {
        const fullName = `copy-loc.${name}`;
        return vscode.commands.registerCommand(fullName, () => {
            Loc.copy(options);
        });
    }

    static registerCommands(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            Loc.newCommand("copyShortLoc", []));
        context.subscriptions.push(
            Loc.newCommand("copyFullLoc", [LocCopyOptions.WITH_FULL_PATH, LocCopyOptions.WITH_CURSOR_POS]));
        context.subscriptions.push(
            Loc.newCommand("copyLoc", [LocCopyOptions.WITH_RELATIVE_PATH]));
    }
}