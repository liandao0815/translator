import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let ZH_DICT_FILE_KEYS: Array<string> = [];
let EN_DICT_FILE_KEYS: Array<string> = [];

function generateZhNames() {
  const MIN = 19968;
  const MAX = 40869;
  const STEP = 500;

  let result = [];
  let current = MIN;

  while (current <= MAX) {
    const value = current + STEP > MAX ? `${current}_${MAX}` : `${current}_${current + STEP}`;
    result.push(value.replace(/(\d+)/g, (_match, $1) => Number($1).toString(16)));
    current += STEP;
  }

  return result;
}

function generateEnNames() {
  const SUFFIXES = ['97_99', '100_102', '103_105', '106_108', '109_111', '112_114', '115_117', '118_120', '121_122'];
  const result = [];

  for (let i = 97, len = 122; i <= len; i++) {
    for (const suffix of SUFFIXES) {
      result.push(`${i}_${suffix}`.replace(/(\d+)/g, (_match, $1) => Number($1).toString(16)));
    }
  }

  return result;
}

function getUnicodeKey(key: string) {
  if (/^[\u4e00-\u9fa5]/.test(key)) {
    if (ZH_DICT_FILE_KEYS.length === 0) {
      ZH_DICT_FILE_KEYS = generateZhNames();
    }

    const unicode = key.codePointAt(0)!;

    for (const name of ZH_DICT_FILE_KEYS) {
      const nameKeys = name.split('_').map(item => parseInt(item, 16));
      if (unicode >= nameKeys[0] && unicode <= nameKeys[1]) {
        return name;
      }
    }
  }

  if (/^[a-zA-Z]+/.test(key)) {
    if (EN_DICT_FILE_KEYS.length === 0) {
      EN_DICT_FILE_KEYS = generateEnNames();
    }

    const sKey = (key.length === 1 ? key.padEnd(2, key) : key).toLowerCase();
    const unicode1 = sKey.codePointAt(0)!;
    const unicode2 = sKey.codePointAt(1)!;

    for (const name of EN_DICT_FILE_KEYS) {
      const nameKeys = name.split('_').map(item => parseInt(item, 16));
      if (unicode1 === nameKeys[0] && unicode2 >= nameKeys[1] && unicode2 <= nameKeys[2]) {
        return name;
      }
    }
  }

  return '';
}

function queryTranslateValue(text: string): string[] {
  const unicodeKey = getUnicodeKey(text);

  if (unicodeKey) {
    const jsonUrl = path.join(__dirname, `./dictionary/${unicodeKey}.json`);
    const stat = fs.statSync(jsonUrl);

    if (stat.isFile()) {
      const dict = require(`./dictionary/${unicodeKey}.json`);
      return dict[text.toLowerCase()] || [];
    }
  }
  return [];
}

export function getHighlightedText(editor: vscode.TextEditor) {
  const { selection } = editor;
  const highlightRange = new vscode.Range(editor.selection.start, editor.selection.end);
  const highlighted = editor.document.getText(highlightRange);

  return { selection, highlighted };
}

export function getMarkdownString(text: string) {
  const translateValue = queryTranslateValue(text);
  const translateText = translateValue.length ? `${translateValue.join('<br />')}<br />` : '查询无果&nbsp;&nbsp;';
  const markdownText = `${translateText}[ ➡️ Google 翻译](https://translate.google.cn?text=${text})`;

  const markdownString = new vscode.MarkdownString(markdownText, true);
  markdownString.supportHtml = true;
  markdownString.isTrusted = true;

  return markdownString;
}
