import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

/**
 * Рендерит Markdown в БЕЗОПАСНЫЙ HTML.
 *
 * `marked` НЕ санитизирует вывод — сырой HTML (в т.ч. <script>, onerror и пр.)
 * из тела статьи проходит насквозь. Тело новости приходит из бэка/CMS, поэтому
 * прогоняем результат через sanitize-html с белым списком тегов/атрибутов:
 * скрипты, inline-обработчики и опасные схемы (javascript:, data:) вырезаются.
 */
export async function renderMarkdown(md: string | null | undefined): Promise<string> {
  const rawHtml = await marked.parse(md || '')
  return sanitizeHtml(rawHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'a', 'ul', 'ol', 'li', 'blockquote',
      'strong', 'em', 'b', 'i', 'code', 'pre',
      'hr', 'br', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // href/src только http(s)/mailto — режем javascript:, data: и пр.
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  })
}
