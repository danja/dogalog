// Sticky regex that walks the source left-to-right.
// % comments are line-based; we consume everything until a newline.
const tokenPattern = /\s+|([A-Za-z_][A-Za-z0-9_]*)|(\d+\.?\d*)|(=:=|=\\=|=<|>=|:-|\\\+)|([()\[\],.;|+\-*/<>=])|(%[^\n]*)/gy;

export function tokenize(src) {
  tokenPattern.lastIndex = 0; // reset sticky regex between calls
  const tokens = [];
  let match;
  while ((match = tokenPattern.exec(src)) !== null) {
    if (match[0].trim() === '') continue;
    if (match[5]) continue; // comment
    if (match[1]) tokens.push({ type: 'atom_or_var', value: match[1] });
    else if (match[2]) tokens.push({ type: 'number', value: parseFloat(match[2]) });
    else if (match[3]) tokens.push({ type: 'sym', value: match[3] });
    else if (match[4]) tokens.push({ type: 'sym', value: match[4] });
  }
  return tokens;
}
