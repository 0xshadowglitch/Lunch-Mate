"use client"

import { cn } from "@/lib/utils"

interface UserLabelProps {
  name: string
  userId?: string
  currentUserId?: string
  className?: string
  marquee?: boolean
  isMe?: boolean
}

export function UserLabel({ name, userId, currentUserId, className, marquee = true, isMe }: UserLabelProps) {
  const isCurrentlyMe = isMe || (userId && currentUserId && userId === currentUserId)
  const displayName = isCurrentlyMe ? `${name} (Me)` : name

  return (
    <div className={cn("overflow-hidden whitespace-nowrap max-w-full", className)}>
      <span className={cn(
        "inline-block font-bold uppercase tracking-tight transition-all",
        isCurrentlyMe && "text-primary",
        marquee && name.length > 12 && "animate-marquee-slow hover:pause"
      )}>
        {displayName}
        {marquee && name.length > 12 && <span className="ml-8">{displayName}</span>}
      </span>
    </div>
  )
}
