import DOMPurify from 'dompurify';

export function sanitizeHtml(rawHtml) {
  if (!rawHtml) return '';
  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
}

export function buildIframeSrcDoc(sanitizedHtml, theme = 'dark') {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#0f172a';
  const linkColor = isDark ? '#38bdf8' : '#0284c7';
  const bgColor = isDark ? '#0f172a' : '#ffffff';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <base target="_blank" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: ${textColor};
            background-color: ${bgColor};
            margin: 0;
            padding: 16px;
            word-break: break-word;
          }
          a {
            color: ${linkColor};
            text-decoration: underline;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          table {
            max-width: 100% !important;
          }
        </style>
      </head>
      <body>
        ${sanitizedHtml}
      </body>
    </html>
  `;
}
