import remark from 'remark'
import html from 'remark-html'
import { highlight } from './highlight'

/**
 * remark parser
 *
 * @param {string} content markdown content
 * @param {object} [opt={}] parser options
 * @returns
 */
export function parseMd(md) {
  const c = remark()
    .use(highlight)
    .use(html)
    .processSync(md)
  return c.contents
}
