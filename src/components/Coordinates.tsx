interface CoordinatesProps {
  lat: number;
  lon: number;
}
export function Coordinates({ lat, lon }: CoordinatesProps) {
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
      target='_blank'
      rel='noopener noreferrer'
      className='absolute bottom-4 right-4 text-white text-sm sm:text-base font-mono opacity-90 text-right no-underline cursor-pointer transition-opacity duration-200 hover:opacity-100 active:opacity-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] px-2 py-1 z-10 min-h-[44px] min-w-[44px] flex items-center justify-end'
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
        right: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      {lat.toFixed(6)}, {lon.toFixed(6)}
    </a>
  );
}
