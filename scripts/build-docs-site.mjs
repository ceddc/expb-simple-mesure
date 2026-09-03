import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = path.join(projectRoot, 'docs', 'site')
const outputRoot = path.join(projectRoot, 'dist', 'docs-site')

function escapeHtml (value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function slugify (value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function pageHref (slug) {
  return slug === 'overview' ? 'index.html' : `${slug}.html`
}

function parsePage (fileName, source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) throw new Error(`Missing front matter in ${fileName}`)

  const metadata = {}
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':')
    if (separator < 0) continue
    metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
  }

  if (!metadata.title || !metadata.description || !metadata.order) {
    throw new Error(`Incomplete front matter in ${fileName}`)
  }

  return {
    slug: path.basename(fileName, '.md'),
    title: metadata.title,
    description: metadata.description,
    order: Number(metadata.order),
    markdown: match[2].trim()
  }
}

function inlineMarkdown (value) {
  const code = []
  let output = escapeHtml(value).replace(/`([^`]+)`/g, (_match, contents) => {
    const token = `@@CODE${code.length}@@`
    code.push(`<code>${contents}</code>`)
    return token
  })

  output = output
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label, href) => {
      const external = /^https?:\/\//.test(href)
      const attributes = external ? ' target="_blank" rel="noreferrer"' : ''
      return `<a href="${href}"${attributes}>${label}</a>`
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  code.forEach((snippet, index) => {
    output = output.replace(`@@CODE${index}@@`, snippet)
  })
  return output
}

function markdownToHtml (markdown) {
  const lines = markdown.split(/\r?\n/)
  const html = []
  let paragraph = []
  let listType = null
  let inCode = false
  let codeLanguage = ''
  let codeLines = []

  const closeParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`)
      paragraph = []
    }
  }

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`)
      listType = null
    }
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      closeParagraph()
      closeList()
      if (inCode) {
        html.push(`<pre><code data-language="${escapeHtml(codeLanguage)}">${escapeHtml(codeLines.join('\n'))}</code></pre>`)
        inCode = false
        codeLanguage = ''
        codeLines = []
      } else {
        inCode = true
        codeLanguage = line.slice(3).trim()
      }
      continue
    }

    if (inCode) {
      codeLines.push(line)
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      closeParagraph()
      closeList()
      const level = heading[1].length
      const title = heading[2]
      html.push(`<h${level} id="${slugify(title)}">${inlineMarkdown(title)}</h${level}>`)
      continue
    }

    const unordered = line.match(/^[-*]\s+(.+)$/)
    const ordered = line.match(/^\d+\.\s+(.+)$/)
    if (unordered || ordered) {
      closeParagraph()
      const nextListType = unordered ? 'ul' : 'ol'
      if (listType !== nextListType) {
        closeList()
        listType = nextListType
        html.push(`<${listType}>`)
      }
      html.push(`<li>${inlineMarkdown((unordered ?? ordered)[1])}</li>`)
      continue
    }

    if (line.trim() === '') {
      closeParagraph()
      closeList()
      continue
    }

    paragraph.push(line.trim())
  }

  closeParagraph()
  closeList()
  if (inCode) throw new Error('Unclosed Markdown code fence.')
  return html.join('\n')
}

function renderPage (page, pages) {
  const navigation = pages.map(item => {
    const current = item.slug === page.slug ? ' aria-current="page"' : ''
    const searchText = escapeHtml(`${item.title} ${item.description}`.toLowerCase())
    return `<a class="nav-link" href="${pageHref(item.slug)}" data-search="${searchText}"${current}><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.description)}</small></a>`
  }).join('\n')

  return `<!doctype html>
<html lang="en" data-theme="small-measure-docs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="theme-color" content="#11111b">
  <title>${escapeHtml(page.title)} · Small Measure</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/site.css">
</head>
<body>
  <a class="skip-link" href="#content">Skip to content</a>
  <header class="topbar">
    <a class="brand" href="index.html" aria-label="Small Measure documentation home">
      <span class="brand-mark" aria-hidden="true">↔</span>
      <span><strong>Small Measure</strong><small>Documentation</small></span>
    </a>
    <button class="menu-button" type="button" aria-expanded="false" aria-controls="docs-sidebar">Menu</button>
    <a class="source-link" href="https://github.com/ceddc/expb-simple-mesure" target="_blank" rel="noreferrer">Source</a>
  </header>
  <div class="layout">
    <aside class="sidebar" id="docs-sidebar">
      <label for="docs-search">Search the guides</label>
      <input id="docs-search" type="search" placeholder="Install, settings, delete…" autocomplete="off">
      <nav aria-label="Documentation">${navigation}</nav>
      <p class="search-empty" hidden>No guide matches that search.</p>
    </aside>
    <main id="content" tabindex="-1">
      <article>
        <p class="eyebrow">ArcGIS Experience Builder 1.17</p>
        ${markdownToHtml(page.markdown)}
      </article>
      <footer>
        <span>MIT</span>
        <a href="https://developers.arcgis.com/experience-builder/" target="_blank" rel="noreferrer">ArcGIS Experience Builder documentation</a>
      </footer>
    </main>
  </div>
  <script src="assets/site.js"></script>
</body>
</html>`
}

const css = `:root {
  color-scheme: dark;
  --bg: #11111b;
  --paper: #181825;
  --panel: #1e1e2e;
  --panel-2: #313244;
  --text: #cdd6f4;
  --muted: #a6adc8;
  --line: #45475a;
  --brand: #89b4fa;
  --brand-2: #94e2d5;
  --brand-3: #fab387;
  --code-bg: #0b0b12;
  --code-text: #cdd6f4;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }
html { background: var(--bg); scroll-behavior: smooth; }
body { margin: 0; color: var(--text); background: radial-gradient(circle at 85% -10%, rgb(137 180 250 / 12%), transparent 28rem), var(--bg); line-height: 1.65; }
a { color: var(--brand); text-underline-offset: 0.18em; }
a:hover { color: var(--brand-2); }
.skip-link { position: fixed; left: 1rem; top: -5rem; z-index: 20; padding: .65rem 1rem; color: var(--bg); background: var(--brand-2); border-radius: .5rem; font-weight: 700; }
.skip-link:focus { top: 1rem; }
.topbar { position: sticky; top: 0; z-index: 10; height: 4.5rem; display: flex; align-items: center; gap: 1rem; padding: 0 1.5rem; background: rgb(17 17 27 / 92%); border-bottom: 1px solid var(--line); backdrop-filter: blur(14px); }
.brand { display: inline-flex; align-items: center; gap: .7rem; color: var(--text); text-decoration: none; }
.brand:hover { color: var(--text); }
.brand-mark { display: grid; place-items: center; width: 2.35rem; height: 2.35rem; color: var(--bg); background: linear-gradient(135deg, var(--brand), var(--brand-2)); border-radius: .65rem; font-size: 1.25rem; font-weight: 900; }
.brand strong, .brand small { display: block; line-height: 1.15; }
.brand small { margin-top: .18rem; color: var(--muted); font-size: .74rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
.source-link { margin-left: auto; padding: .45rem .8rem; border: 1px solid var(--line); border-radius: .5rem; text-decoration: none; font-weight: 700; }
.menu-button { display: none; margin-left: auto; padding: .45rem .75rem; color: var(--text); background: var(--panel); border: 1px solid var(--line); border-radius: .5rem; font: inherit; font-weight: 700; }
.layout { display: grid; grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr); min-height: calc(100vh - 4.5rem); }
.sidebar { position: sticky; top: 4.5rem; height: calc(100vh - 4.5rem); padding: 1.4rem; overflow-y: auto; background: rgb(24 24 37 / 72%); border-right: 1px solid var(--line); }
.sidebar label { display: block; margin-bottom: .45rem; color: var(--muted); font-size: .8rem; font-weight: 700; }
.sidebar input { width: 100%; margin-bottom: 1rem; padding: .7rem .8rem; color: var(--text); background: var(--code-bg); border: 1px solid var(--line); border-radius: .55rem; font: inherit; }
.sidebar input:focus { outline: 2px solid var(--brand); outline-offset: 2px; }
.sidebar nav { display: grid; gap: .45rem; }
.nav-link { display: block; padding: .7rem .8rem; color: var(--text); border: 1px solid transparent; border-radius: .55rem; text-decoration: none; }
.nav-link:hover { color: var(--text); background: var(--panel); border-color: var(--line); }
.nav-link[aria-current="page"] { background: linear-gradient(90deg, rgb(137 180 250 / 16%), rgb(148 226 213 / 8%)); border-color: rgb(137 180 250 / 45%); }
.nav-link span, .nav-link small { display: block; }
.nav-link span { font-weight: 750; }
.nav-link small { margin-top: .18rem; color: var(--muted); line-height: 1.35; }
.search-empty { color: var(--brand-3); font-size: .9rem; }
main { width: 100%; max-width: 62rem; min-width: 0; padding: clamp(2rem, 6vw, 5rem) clamp(1.25rem, 7vw, 6rem) 2rem; }
article { min-height: 65vh; }
.eyebrow { margin: 0 0 .4rem; color: var(--brand-2); font-size: .76rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
h1, h2, h3 { color: #f5f7ff; line-height: 1.2; text-wrap: balance; }
h1 { margin: 0 0 1.2rem; font-size: clamp(2.25rem, 6vw, 4.2rem); letter-spacing: -.045em; }
h2 { margin: 2.8rem 0 .8rem; padding-top: .25rem; font-size: clamp(1.4rem, 3vw, 2rem); }
h3 { margin-top: 2rem; font-size: 1.18rem; }
p, li { max-width: 48rem; }
ul, ol { padding-left: 1.4rem; }
li { margin: .35rem 0; }
li::marker { color: var(--brand-2); font-weight: 800; }
code { padding: .12rem .32rem; color: var(--brand-3); background: var(--code-bg); border: 1px solid rgb(69 71 90 / 70%); border-radius: .3rem; font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace; font-size: .9em; }
pre { position: relative; max-width: 100%; padding: 1.1rem; overflow-x: auto; color: var(--code-text); background: var(--code-bg); border: 1px solid var(--line); border-radius: .7rem; box-shadow: inset 3px 0 var(--brand); }
pre code { padding: 0; color: inherit; background: transparent; border: 0; }
.copy-button { position: absolute; top: .55rem; right: .55rem; padding: .35rem .55rem; color: var(--text); background: var(--panel-2); border: 1px solid var(--line); border-radius: .4rem; font: inherit; font-size: .78rem; font-weight: 700; cursor: pointer; }
.copy-button:hover { border-color: var(--brand-2); }
footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; margin-top: 4rem; padding-top: 1.2rem; color: var(--muted); border-top: 1px solid var(--line); font-size: .85rem; }

@media (max-width: 760px) {
  .topbar { padding: 0 1rem; }
  .source-link { display: none; }
  .menu-button { display: block; }
  .layout { display: block; }
  .sidebar { position: fixed; top: 4.5rem; right: 0; bottom: 0; left: 0; z-index: 9; height: auto; display: none; background: var(--paper); border-right: 0; }
  .sidebar.is-open { display: block; }
  main { padding-top: 2.8rem; }
  h1 { font-size: 2.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
`

const browserScript = `const search = document.querySelector('#docs-search');
const navLinks = [...document.querySelectorAll('.nav-link')];
const empty = document.querySelector('.search-empty');
const sidebar = document.querySelector('#docs-sidebar');
const menu = document.querySelector('.menu-button');

search?.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  navLinks.forEach(link => {
    const matches = link.dataset.search.includes(query);
    link.hidden = !matches;
    if (matches) visible += 1;
  });
  empty.hidden = visible !== 0;
});

menu?.addEventListener('click', () => {
  const open = sidebar.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('pre').forEach(block => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy-button';
  button.textContent = 'Copy';
  button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(block.querySelector('code').innerText);
    button.textContent = 'Copied';
    window.setTimeout(() => { button.textContent = 'Copy'; }, 1200);
  });
  block.append(button);
});
`

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#89b4fa"/><stop offset="1" stop-color="#94e2d5"/></linearGradient></defs>
  <rect width="64" height="64" rx="16" fill="url(#g)"/>
  <path d="M14 32h36M14 32l8-8M14 32l8 8M50 32l-8-8M50 32l-8 8" fill="none" stroke="#11111b" stroke-linecap="round" stroke-linejoin="round" stroke-width="5"/>
</svg>`

const files = (await readdir(sourceRoot))
  .filter(fileName => fileName.endsWith('.md'))
const pages = await Promise.all(files.map(async fileName => {
  const source = await readFile(path.join(sourceRoot, fileName), 'utf8')
  return parsePage(fileName, source)
}))
pages.sort((a, b) => a.order - b.order)

if (pages.length < 3 || pages.length > 5) {
  throw new Error(`Lite documentation must contain 3 to 5 pages; found ${pages.length}.`)
}
if (!pages.some(page => page.slug === 'overview')) {
  throw new Error('The documentation requires an overview page.')
}

await rm(outputRoot, { recursive: true, force: true })
await mkdir(path.join(outputRoot, 'assets'), { recursive: true })

for (const page of pages) {
  await writeFile(path.join(outputRoot, pageHref(page.slug)), renderPage(page, pages), 'utf8')
}
await writeFile(path.join(outputRoot, 'assets', 'site.css'), css, 'utf8')
await writeFile(path.join(outputRoot, 'assets', 'site.js'), browserScript, 'utf8')
await writeFile(path.join(outputRoot, 'assets', 'favicon.svg'), favicon, 'utf8')

const llmsText = [
  '# Small Measure',
  '',
  '> Compact distance-measurement widget for ArcGIS Experience Builder 1.17.',
  '',
  ...pages.flatMap(page => [
    `## ${page.title}`,
    '',
    page.description,
    '',
    page.markdown,
    ''
  ])
].join('\n')
await writeFile(path.join(outputRoot, 'llms.txt'), llmsText, 'utf8')

console.log(`Built ${pages.length} documentation pages in ${path.relative(projectRoot, outputRoot)}.`)
