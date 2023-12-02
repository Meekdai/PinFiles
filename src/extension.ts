import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const customViewProvider = new CustomViewProvider(context.globalState);
    vscode.window.registerTreeDataProvider('customView', customViewProvider);

    context.subscriptions.push(vscode.commands.registerCommand('customView.selectFile', async () => {
        const uris = await vscode.window.showOpenDialog({});
        if (uris && uris.length > 0) {
            customViewProvider.addItem(uris[0].fsPath);
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('customView.openFile', async (filePath: string) => {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('customView.deleteFile', async (filePath: string) => {
        customViewProvider.deleteItem(filePath);
    }));
}

class CustomViewProvider implements vscode.TreeDataProvider<string> {
    private _onDidChangeTreeData: vscode.EventEmitter<string | undefined> = new vscode.EventEmitter<string | undefined>();
    readonly onDidChangeTreeData: vscode.Event<string | undefined> = this._onDidChangeTreeData.event;

    data: string[];

    constructor(private globalState: vscode.Memento) {
        this.data = this.globalState.get('data', []);
    }

    addItem(item: string) {
        this.data.push(item);
        this._onDidChangeTreeData.fire(undefined);
        this.globalState.update('data', this.data);
    }

    deleteItem(item: string) {
        const index = this.data.indexOf(item);
        if (index > -1) {
            this.data.splice(index, 1);
            this._onDidChangeTreeData.fire(undefined);
            this.globalState.update('data', this.data);
        }
    }

    getTreeItem(element: string): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const fileName = path.basename(element);
        const treeItem = new vscode.TreeItem(fileName, vscode.TreeItemCollapsibleState.None);
        treeItem.command = {
            command: 'customView.openFile',
            title: 'Open File',
            arguments: [element]
        };

        // 添加图标
        treeItem.iconPath = vscode.ThemeIcon.File;
        treeItem.resourceUri = vscode.Uri.file(element);

        treeItem.contextValue = 'file';

        return treeItem;
    }

    getChildren(element?: string | undefined): vscode.ProviderResult<string[]> {
        if (element === undefined) {
            return this.data;
        }
        return [];
    }
}
