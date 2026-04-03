export const config = { runtime: 'edge' }

const RSS_FEEDS = [
  { url: 'https://telex.hu/rss', source: 'Telex' },
  { url: 'https://444.hu/feed', source: '444' },
  { url: 'https://hvg.hu/rss', source: 'HVG' },
]

export default async function handler(req) {
  const results = []

  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KozeletiMozaik/1.0)' }
      })
      const xml = await res.text()
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 3)

      for (const [, item] of items) {
        const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim()
        const link = item.match(/<link>(.*?)<\/link>/)?.[1]?.trim() ||
                     item.match(/<link href="(.*?)"/)?.[1]?.trim()
        const description = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]
          ?.replace(/<[^>]+>/g, '')?.trim()?.slice(0, 200)
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim()
        const image = item.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ||
                      item.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] ||
                      item.match(/<media:content[^>]+url="([^"]+)"/)?.[1]

        if (title && link) {
          results.push({
            id: btoa(encodeURIComponent(link)).slice(0, 12),
            title,
            description: description || '',
            link,
            image: image || null,
            source: feed.source,
            pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
          })
        }
      }
    } catch (err) {
      console.error(`RSS fetch error for ${feed.source}:`, err)
    }
  }

  results.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

  return new Response(JSON.stringify(results.slice(0, 12)), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=900, stale-while-revalidate=1800',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
