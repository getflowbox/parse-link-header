const PARSE_LINK_HEADER_MAXLEN =
  parseInt(process.env.PARSE_LINK_HEADER_MAXLEN, 10) || 2000
const PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED =
  process.env.PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED != null

export interface Link {
  url: string
  rel: string
  [queryParam: string]: string
}

export interface Links {
  [rel: string]: Link
}

function intoRels(acc: Record<string, any>, x: { rel: string }) {
  function splitRel(rel: string) {
    acc[rel] = {
      ...x,
      rel,
    }
  }

  x.rel.split(/\s+/).forEach(splitRel)

  return acc
}

function createObjects(acc: Record<string, any>, p: string) {
  // rel="next" => 1: rel 2: next
  const m = p.match(/\s*(.+)\s*=\s*"?([^"]+)"?/)
  if (m) {
    const [, second, third] = m
    acc[second] = third
  }
  return acc
}

function parseLink(link: string) {
  try {
    const m = link.match(/<?([^>]*)>(.*)/)
    const linkUrl = m[1]
    const parts = m[2].split(';')
    const u = new URL(
      linkUrl,
      typeof window !== 'undefined' ? window?.location?.href : undefined,
    )

    const qry = {}
    u.searchParams.forEach((value, key) => {
      qry[key] = value
    })

    parts.shift()

    return {
      ...qry,
      ...parts.reduce(createObjects, {}),
      url: linkUrl,
    }
  } catch (e) {
    return null
  }
}

function checkHeader(linkHeader) {
  if (!linkHeader) return false

  if (linkHeader.length > PARSE_LINK_HEADER_MAXLEN) {
    if (PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED) {
      throw new Error(
        `Input string too long, it should be under ${PARSE_LINK_HEADER_MAXLEN} characters.`,
      )
    } else {
      return false
    }
  }
  return true
}

const parseLinkHeader = (linkHeader): Links | null => {
  if (!checkHeader(linkHeader)) return null

  return linkHeader
    .split(/,\s*</)
    .map(parseLink)
    .filter((x: Record<string, string>) => x?.rel)
    .reduce(intoRels, {})
}

export default parseLinkHeader
