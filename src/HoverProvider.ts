import * as vscode from 'vscode';
import { getHighlightedText, getMarkdownString } from './helper';

export default class LanguagesHoverProvider implements vscode.HoverProvider {
  provideHover(): vscode.ProviderResult<vscode.Hover> {
    return new Promise(async resolve => {
      
      const editor = vscode.window.activeTextEditor;
      if (editor === null) {
        return resolve(null);
      }

      const { highlighted, selection } = getHighlightedText(editor!);
      if (!highlighted) {
        return resolve(null);
      }

      const selectionText = editor!.document.getText(selection);
      const markdownString = getMarkdownString(selectionText);
      
      return resolve(new vscode.Hover([markdownString]));
    });
  }
}
