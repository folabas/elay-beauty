export default function RotatingBadge({ text }: { text: string }) {
  // Ensure the text is long enough to wrap around by repeating it
  const displayText = `${text} • ${text} • `

  return (
    <div 
      className="relative flex items-center justify-center text-primary hero-text"
      style={{ width: "120px", height: "120px" }}
    >
      <div 
        className="absolute inset-0"
        style={{ animation: "spin 12s linear infinite" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <path 
            id="circlePath" 
            d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" 
            fill="none" 
          />
          <text className="text-[11px] uppercase font-bold tracking-[0.2em] font-mono fill-current">
            <textPath href="#circlePath" startOffset="0%">{displayText}</textPath>
          </text>
        </svg>
      </div>
      {/* Inner dot */}
      <div className="w-2 h-2 rounded-full bg-accent absolute shadow-glow" />
    </div>
  )
}
