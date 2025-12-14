import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docs = [
  { slug: 'manual', title: 'Dogalog Manual' },
  { slug: 'cheatsheet', title: 'Dogalog Cheatsheet' },
  { slug: 'tutorial', title: 'Dogalog Tutorial' },
  { slug: 'references', title: 'Dogalog References' }
];

const docsDir = path.resolve(__dirname, '..', 'docs');
const outputDir = path.resolve(__dirname, '..', 'public', 'docs');

const template = (title, body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="docs.css" />
</head>
<body>
${body}
</body>
</html>
`;

await mkdir(outputDir, { recursive: true });
await copyFile(path.join(docsDir, 'docs.css'), path.join(outputDir, 'docs.css'));

for (const { slug, title } of docs) {
  const markdown = await readFile(path.join(docsDir, `${slug}.md`), 'utf8');
  const html = marked.parse(markdown);
  const page = template(title, html);
  await writeFile(path.join(outputDir, `${slug}.html`), page, 'utf8');
}
