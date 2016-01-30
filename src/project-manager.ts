import * as vscode from 'vscode';
import * as path from 'path';
import * as childProcess from 'child_process';

interface Projects {
  [index: string]: {
    rootPath: string;
    // workingFileUris?: vscode.Uri[]
  }
}

const PROJECTS = 'projectManager.projects';

function showQuickPick(projects) {
  let items = [];

  for (let name in projects) {
    if (projects.hasOwnProperty(name)) {
      var project = projects[name];
      let description = project.rootPath;
      // if (!description) {
      //   let filenames = project.workingFiles.map(f => path.basename(f));
      //   if (filenames.length > 3) {
      //     filenames.splice(3);
      //   }

      //   description = filenames.join(' ');
      // }

      items.push({
        label: name,
        description
      });
    }
  }

  return vscode.window.showQuickPick<vscode.QuickPickItem>(items);
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('projectManager.saveProject', () => {
    if (!vscode.workspace.rootPath) {
      vscode.window.showErrorMessage('Cannot save project without an opened folder');
      return;
    }

    let projects = context.globalState.get<Projects>(PROJECTS, <Projects>{});
    let rootPath = vscode.workspace.rootPath;
    let projectName = undefined;

    for (let name in projects) {
      if (projects.hasOwnProperty(name)) {
        let project = projects[name];
        if (project.rootPath && path.relative(rootPath, project.rootPath) === '') {
          projectName = name;
          break;
        }
      }
    }

    if (projectName) {
      vscode.window.showInformationMessage(`Found existing project "${projectName}" with the same folder. You can use the same projec or save another project with different working files opened`);
    }

    let value = projectName || path.basename(rootPath);
    vscode.window.showInputBox({
      prompt: 'Enter the name of this project',
      value
    }).then((projectName) => {
      // let workingFileUris = [];
      // if (!rootPath) {
      //   vscode.workspace.textDocuments.forEach(file => {
      //     if (!file.isUntitled) {
      //       workingFileUris.push(file.uri);
      //     }
      //   });

      //   if (workingFileUris.length === 0) {
      //     workingFileUris = undefined;
      //   }
      // }

      // console.log(workingFileUris);
      projects[projectName] = {
        rootPath,
        // workingFileUris
      };
      context.globalState.update(PROJECTS, projects);

      vscode.window.showInformationMessage(`Saved project "${projectName}"`);
    });
  });

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('projectManager.openProject', () => {
    let projects = context.globalState.get<Projects>(PROJECTS);
    showQuickPick(projects).then((item) => {
      if (item) {
        let project = projects[item.label];
        // if (!vscode.workspace.rootPath) {
        //   // not supported yet
        //   vscode.workspace.openFolder(project.rootPath);
        // }
        // else {
        let cmd = 'code ' + project.rootPath; //|| project.workingFileUris.join(' ');
        childProcess.exec(cmd, function callback(error, stdout, stderr) {
          console.log(`opened project ${project.rootPath}`);
        });
        // }
      }
    });
  });

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('projectManager.removeProject', () => {
    let projects = context.globalState.get<Projects>(PROJECTS);
    showQuickPick(projects).then((item) => {
      if (item) {
        let name = item.label;
        delete projects[name];
        context.globalState.update(PROJECTS, projects);
        vscode.window.showInformationMessage(`Removed project "${name}"`);
      }
    });
  });
  context.subscriptions.push(disposable);

  // disposable = vscode.commands.registerCommand('projectManager.clearSettings', () => {
  //   context.globalState.update(PROJECTS, undefined);
  // });
}

// this method is called when your extension is deactivated
export function deactivate() {
}
