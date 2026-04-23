export function Logo() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center text-app-highlight">
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="absolute inset-0 w-full h-full text-app-highlight"
        >
          <path fillRule="evenodd" clipRule="evenodd" d="M4 0H44V4H48V44H44V48H4V44H0V4H4V0ZM4 4V44H44V4H4Z" fill="currentColor"/>
        </svg>
        <span className="font-highlight text-3xl leading-none relative z-10 flex items-center justify-center h-full pb-0.5">Bp</span>
      </div>
      <span className="font-highlight text-4xl tracking-wide text-app-highlight">BitPath</span>
    </div>
  );
}
