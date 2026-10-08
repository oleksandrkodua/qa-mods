export interface Img {
  ext: string
  b64: string
}

const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }

/** Find base64 image blocks: {type:'image', source:{data,media_type}} or {data, mimeType}. */
export function findImages(v: unknown, out: Img[] = []): Img[] {
  if (Array.isArray(v)) v.forEach(x => findImages(x, out))
  else if (v && typeof v === 'object') {
    const o = v as Record<string, any>
    const src = o.source && typeof o.source === 'object' ? o.source : o
    const data = src.data
    const mime = src.media_type ?? src.mimeType ?? src.mime_type

    if (typeof data === 'string' && data.length > 100 && typeof mime === 'string' && EXT[mime]) {
      out.push({ ext: EXT[mime]!, b64: data })
    } else Object.values(o).forEach(x => findImages(x, out))
  }

  return out
}
