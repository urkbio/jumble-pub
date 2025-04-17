export function EmbeddedNormalUrl({ url }: { url: string }) {
  return (
    <a
      className="text-primary hover:underline"
      href={url}
      target="_blank"
      onClick={(e) => e.stopPropagation()}
      rel="noreferrer"
    >
      {url}
    </a>
  )
}
