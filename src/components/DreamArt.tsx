interface Props {
  dreamId: string
  name: string
  className?: string
}

/** Картинка мечты из /public/dreams */
export function DreamArt({ dreamId, name, className = '' }: Props) {
  return (
    <div className={`dream-art ${className}`}>
      <img
        src={`/dreams/dream-${dreamId}.png`}
        alt={name}
        loading="eager"
        draggable={false}
      />
      <div className="dream-art-veil" aria-hidden="true" />
    </div>
  )
}
