"use client"
import { useState, useEffect } from "react"

export default function RotatingText({ items = ["Taking Bookings Now", "Premium Hair Styling", "Elevate Your Style"] }: { items?: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [items.length])

  return (
    <div className="flex items-center justify-center text-primary text-[14px] font-bold uppercase tracking-[0.2em] overflow-hidden h-10 w-full pt-6">
      <div className="relative w-auto min-w-[260px] h-full overflow-hidden flex justify-center">
        {items.map((text, i) => {
          let yOffset = (i - index) * 100
          
          if (index === 0 && i === items.length - 1) {
            yOffset = -100
          } else if (index === items.length - 1 && i === 0) {
            yOffset = 100
          }

          return (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center w-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] whitespace-nowrap"
              style={{
                transform: `translateY(${yOffset}%)`,
                opacity: i === index ? 1 : 0,
                pointerEvents: i === index ? "auto" : "none"
              }}
            >
              {text}
            </div>
          )
        })}
      </div>
    </div>
  )
}
