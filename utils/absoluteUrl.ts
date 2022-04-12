export default function absoluteUrl(url: string) {
  return new URL(url, import.meta.url).href
}
