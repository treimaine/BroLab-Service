/**
 * PixelTitle - ELECTRI-X style pixel/retro typography
 * 
 * Creates the distinctive pixelated text effect with glitch lines.
 * Uses CSS to simulate pixel font appearance.
 */

interface PixelTitleProps {
  children: string
  /** Additional CSS classes */
  className?: string
}

export function PixelTitle({ 
  children, 
  className = '' 
}: Readonly<PixelTitleProps>) {
  return (
    <div className={`relative ${className}`}>
      {/* Main title */}
      <h1 
        className="
          text-[clamp(60px,12vw,160px)] 
          font-black 
          tracking-[0.1em]
          text-white
          leading-none
          relative
          z-10
        "
        style={{
          fontFamily: '"Press Start 2P", "VT323", monospace',
          textShadow: `
            2px 2px 0 rgba(0,255,255,0.3),
            -2px -2px 0 rgba(255,0,255,0.2)
          `,
          // Pixel effect via text rendering
          WebkitFontSmoothing: 'none',
          imageRendering: 'pixelated',
        }}
      >
        {children}
      </h1>
      
      {/* Glitch lines overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
        aria-hidden="true"
      >
        {/* Horizontal glitch lines */}
        <div 
          className="absolute w-full h-[2px] bg-[rgb(var(--accent))] opacity-60"
          style={{ top: '30%' }}
        />
        <div 
          className="absolute w-full h-[1px] bg-white opacity-30"
          style={{ top: '45%' }}
        />
        <div 
          className="absolute w-full h-[2px] bg-[rgb(var(--accent))] opacity-40"
          style={{ top: '70%' }}
        />
      </div>
    </div>
  )
}

PixelTitle.displayName = 'PixelTitle'
