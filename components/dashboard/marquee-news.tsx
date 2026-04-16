"use client"

import { Zap } from "lucide-react"

export function MarqueeNews() {
  return (
    <div className="relative flex overflow-x-hidden bg-primary/10 border-y border-primary/20 backdrop-blur-md py-2 group">
      <div className="flex animate-marquee whitespace-nowrap py-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-8 mx-4">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <Zap className="h-3 w-3 fill-primary" />
              LATEST UPDATE: Team Balance optimized
            </span>
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
              <Zap className="h-3 w-3" />
              TIP: Don't forget to tracking your Friday Lunch
            </span>
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
              <Zap className="h-3 w-3 fill-primary/50" />
              SYSTEM: RLS Recursion Resolved successfully
            </span>
          </div>
        ))}
      </div>

      <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-8 mx-4 pb-1">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <Zap className="h-3 w-3 fill-primary" />
              LATEST UPDATE: Team Balance optimized
            </span>
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
              <Zap className="h-3 w-3" />
              TIP: Don't forget to tracking your Friday Lunch
            </span>
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
              <Zap className="h-3 w-3 fill-primary/50" />
              SYSTEM: RLS Recursion Resolved successfully
            </span>
          </div>
        ))}
      </div>
      
      {/* Gradient Overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}
