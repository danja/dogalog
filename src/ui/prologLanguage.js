// Minimal Prolog-ish stream language for CodeMirror 6
// Highlights atoms, variables, numbers, punctuation, and % comments.
import { StreamLanguage } from '@codemirror/language';

export const prologLanguage = {
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match('%')) { stream.skipToEnd(); return 'comment'; }
    if (stream.match(':-')) return 'operator';
    if (stream.match(/[()\[\],\.]/)) return 'punctuation';
    if (stream.match(/\d+(?:\.\d+)?/)) return 'number';
    if (stream.match(/[A-Z_][A-Za-z0-9_]*/)) return 'variableName';
    if (stream.match(/[a-z][A-Za-z0-9_]*/)) return 'atom';
    stream.next();
    return null;
  }
};
