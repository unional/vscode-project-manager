// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

interface ProjectEntry {
  name: string;
  path: string;
}
interface State {
  projects: ProjectEntry[];
}
let x: State;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.saveProject', () => {
    let projects = context.globalState.get<ProjectEntry[]>('projects', []);
    let rootPath = vscode.workspace.rootPath;
    let existingProjectName = undefined;
    for (var i = 0; i < projects.length; i++) {
      var entry = projects[i];
      if (path.relative(rootPath, entry.path) === '') {
        existingProjectName = entry.name;
        break;
      }
    }

    if (existingProjectName) {
      vscode.window.showWarningMessage(`Current folder is already saved as "${existingProjectName}"`);
      return;
    }

    let value = path.basename(rootPath);
    vscode.window.showInputBox({
      prompt: 'Enter the name of this project',
      value
    }).then((projectName) => {
      projects.push({
        name: value,
        path: rootPath
      });
      context.globalState.update('projects', projects);
    });
  });

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('extension.openProject', () => {
    let projects = context.globalState.get('projects', []);
    let items = projects.map((p) => {
      return { label: p.name, description: p.path };
    });

    // TODO: Show a "QuickPick" that has a remove icon like the one in `> ext install`
    // so that user can remove projects.
    vscode.window.showQuickPick<vscode.QuickPickItem>(items).then((item) => {
      if (item) {
        let path = item.description;
        // TODO: Need to be able to create a new instance of vscode.
        // Can I use child process or cmd?
        vscode.commands.executeCommand('workbench.action.files.openFolder', [item.description]);
      }
    });
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
