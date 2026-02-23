export function StickerCard({ s }: { s: { id:string; url:string; name?:string|null } }) {
  return (
    <div className="relative flex-shrink-0 w-40 h-40 landscape:w-36 landscape:h-36
                    flex items-center justify-center p-2">
      {s.url ? (
        <img
          src={s.url}
          alt={s.name ?? "sticker"}
          className="max-w-full max-h-full object-contain pointer-events-none select-none"
          loading="lazy"
          onError={(e) => {
            console.error('Image failed to load:', s.url);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : (
        <span className="text-gray-500 text-sm text-center">{s.name ?? "No image"}</span>
      )}
    </div>
  );
}
