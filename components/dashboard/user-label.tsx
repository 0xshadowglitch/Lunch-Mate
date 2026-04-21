"use client"

import { cn } from "@/lib/utils"

interface UserLabelProps {
  name: string
  userId?: string
  currentUserId?: string
  className?: string
  marquee?: boolean
  isMe?: boolean
  suffix?: string
}

export function UserLabel({ name, userId, currentUserId, className, marquee = true, isMe, suffix }: UserLabelProps) {
  const isCurrentlyMe = isMe || (userId && currentUserId && userId === currentUserId)
  const baseLabel = isCurrentlyMe ? `${name} (Me)` : name
  const fullLabel = suffix ? `${baseLabel} ${suffix}` : baseLabel
  const shouldMarquee = marquee && fullLabel.length > 12

  return (
    <div className={cn("overflow-hidden whitespace-nowrap max-w-full", className)}>
      <span className={cn(
        "inline-block font-bold uppercase tracking-tight transition-all",
        isCurrentlyMe && "text-primary",
        shouldMarquee && "animate-marquee-slow hover:pause"
      )}>
        {fullLabel}
      </span>
    </div>
  )
}
