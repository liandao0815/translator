import * as vscode from 'vscode';
import LanguagesHoverProvider from './HoverProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.languages.registerHoverProvider('*', new LanguagesHoverProvider()));
}

export function deactivate() {}
