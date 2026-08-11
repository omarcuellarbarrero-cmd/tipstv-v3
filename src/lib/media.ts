export type MediaType = "image" | "pdf" | "video" | "link"

export interface MediaMeta {
  label: string
  emoji: string
}

export const MEDIA_META: Record<MediaType, MediaMeta> = {
  image: { label: "Foto", emoji: "📷" },
  pdf: { label: "PDF", emoji: "📄" },
  video: { label: "Video", emoji: "🎥" },
  link: { label: "Enlace", emoji: "🔗" },
}

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif|avif)$/i
const PDF_EXT = /\.pdf$/i
const VIDEO_EXT = /\.(mp4|mov|avi|mkv|webm|m4v|3gp)$/i
const VIDEO_HOST = /(youtube\.com|youtu\.be|vimeo\.com|tiktok\.com|streamable\.com)/i

/**
 * Detecta el tipo de contenido de un enlace (foto, PDF, video o enlace genérico)
 * a partir de su extensión o dominio. No hace ninguna petición externa: es una
 * heurística local sobre el texto de la URL.
 */
export function getMediaType(url: string): MediaType {
  const clean = url.split("?")[0].split("#")[0].trim().toLowerCase()

  if (PDF_EXT.test(clean)) return "pdf"
  if (IMAGE_EXT.test(clean)) return "image"
  if (VIDEO_EXT.test(clean)) return "video"
  if (VIDEO_HOST.test(clean)) return "video"

  // Google Drive comparte archivos sin extensión visible en la URL.
  if (/drive\.google\.com\/file/i.test(clean)) return "link"

  return "link"
}

export function getMediaMeta(url: string): MediaMeta {
  return MEDIA_META[getMediaType(url)]
}
