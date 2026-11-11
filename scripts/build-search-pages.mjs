import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [output, configuredOrigin] = process.argv.slice(2);
const origin = configuredOrigin ? new URL(configuredOrigin).origin : '';
const index = join(output, 'index.html');
const template = await readFile(index, 'utf8');
const content = JSON.parse(await readFile(new URL('../src/app/search-content.json', import.meta.url), 'utf8'));
const names = { es: 'Español', en: 'English', fr: 'Français', de: 'Deutsch' };
const languages = Object.keys(names);
const footerCopy = {
  "es": {
    "label": "Idioma",
    "developed": "Desarrollado con",
    "by": "por Pablo Otalora"
  },
  "en": {
    "label": "Language",
    "developed": "Built with",
    "by": "by Pablo Otalora"
  },
  "fr": {
    "label": "Langue",
    "developed": "Développé avec",
    "by": "par Pablo Otalora"
  },
  "de": {
    "label": "Sprache",
    "developed": "Entwickelt mit",
    "by": "von Pablo Otalora"
  }
};
const pathFor = language => language === 'es' ? '/' : `/${language}/`;
const urlFor = language => origin + pathFor(language);
const escape = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const alternates = [...languages, 'x-default'].map(language => ({
  language, url: urlFor(language === 'x-default' ? 'es' : language)
}));
const alternateLinks = alternates.map(({ language, url }) =>
  `<link rel="alternate" hreflang="${language}" href="${url}">`
).join('\n  ');
const baseHead = template
  .replace(/<title>[\s\S]*?<\/title>/i, '<!-- page-search-head -->')
  .replace(/\s*<(?:meta\s+(?:name="(?:description|twitter:(?:title|description))"|property="og:(?:url|title|description|locale|type)")|link\s+rel="canonical")[^>]*>/gi, '');

for (const language of languages) {
  const page = content[language];
  const url = urlFor(language);
  const canonical = origin ? `<link rel="canonical" href="${url}">\n  ${alternateLinks}` : '';
  const head = `<title>${escape(page.title)}</title>
  <meta name="description" content="${escape(page.description)}">
  ${canonical}
  <meta property="og:type" content="website">
  ${origin ? `<meta property="og:url" content="${url}">` : ''}
  <meta property="og:title" content="${escape(page.title)}">
  <meta property="og:description" content="${escape(page.description)}">
  <meta name="twitter:title" content="${escape(page.title)}">
  <meta name="twitter:description" content="${escape(page.description)}">`;

  const links = languages.map(code =>
    `<a href="${pathFor(code)}" lang="${code}" hreflang="${code}"${code === language ? ' aria-current="page"' : ''}>${names[code]}</a>`
  ).join(' ');
  const projects = page.projects?.map(({ name, url }) => `<li><a href="${url}">${escape(name)}</a></li>`).join('');
  const body = `<main class="search-fallback">
    <h1>${escape(page.title)}</h1>
    <p>${escape(page.description)}</p>
    <section class="search-guide">
      <h2>${escape(page.heading)}</h2>
      ${page.paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('\n')}
      ${projects ? `<ul>${projects}</ul>` : ''}
    </section>
  </main>
  <footer class="site-footer">
    <nav class="idiomas" aria-label="${footerCopy[language].label}">${links}</nav>
    <p>${footerCopy[language].developed} <a href="https://angular.dev/">Angular</a> ${footerCopy[language].by}</p>
  </footer>`;

  const html = baseHead
    .replace('<html lang="es"', `<html lang="${language}" data-page-language="${language}"`)
    .replace('<!-- page-search-head -->', () => head)
    .replace(/<app-root>[\s\S]*?<\/app-root>/, () => `<app-root>${body}</app-root>`)
    .replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (_, json) => {
      const profile = JSON.parse(json);
      return `<script type="application/ld+json">${JSON.stringify({ ...profile, url, inLanguage: language })}</script>`;
    });

  const directory = join(output, pathFor(language));
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), html);
}

if (origin) {
  const entries = languages.map(language => `  <url>
    <loc>${urlFor(language)}</loc>
${alternates.map(alternate => `    <xhtml:link rel="alternate" hreflang="${alternate.language}" href="${alternate.url}" />`).join('\n')}
  </url>`).join('\n');

  await writeFile(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`);
}
const sitemap = origin ? `\nSitemap: ${origin}/sitemap.xml\n` : '';
await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\n${sitemap}`);
