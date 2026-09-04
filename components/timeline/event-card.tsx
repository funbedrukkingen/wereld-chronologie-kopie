'use client'

import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import type { PlacedEvent } from '@/lib/timeline-layout'
import { CARD_WIDTH, LANE_PAD_TOP, ROW_HEIGHT, formatEventDate } from '@/lib/timeline-layout'

interface EventCardProps {
  placed: PlacedEvent
  selected: boolean
  dimmed: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

export function EventCard({ placed, selected, dimmed, onSelect, onHover }: EventCardProps) {
  const { event, x, endX, level } = placed
  const top = LANE_PAD_TOP + level * ROW_HEIGHT
  const spanWidth = endX !== undefined ? Math.max(0, endX - x) : 0
  const hasRelated = (event.related?.length ?? 0) > 0

  return (
    <div
      className="absolute"
      style={
        {
          left: x,
          top,
          width: CARD_WIDTH,
          ...(event.color ? { '--lane': event.color } : {}),
        } as CSSProperties
      }
    >
      {/* Marker dot on the year */}
      <span
        aria-hidden
        className={cn(
          'absolute -left-1 top-[5px] size-2.5 rounded-full border-2 border-background bg-(--lane) transition-transform',
          selected && 'scale-150',
        )}
      />
      {/* Duration bar for periods */}
      {spanWidth > 0 && (
        <span
          aria-hidden
          className="absolute left-0 top-[9px] h-0.5 bg-(--lane) opacity-60"
          style={{ width: spanWidth }}
        />
      )}
      <button
        type="button"
        onClick={() => onSelect(event.id)}
        onMouseEnter={() => onHover(event.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(event.id)}
        onBlur={() => onHover(null)}
        aria-pressed={selected}
        className={cn(
          'group mt-4 flex w-full flex-col items-start gap-0.5 rounded-md border bg-card px-2.5 py-1.5 text-left transition-colors',
          'hover:border-(--lane) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--lane)',
          selected ? 'border-(--lane) bg-accent' : 'border-border',
          dimmed && 'opacity-40',
        )}
      >
        <span className="flex w-full items-center justify-between gap-2 text-[11px] leading-4 text-(--lane)">
          <span className="truncate">{formatEventDate(event)}</span>
          {hasRelated && (
            <span aria-label="Has comparison links" className="size-1.5 shrink-0 rounded-full bg-(--lane)" />
          )}
        </span>
        <span className="line-clamp-2 text-[13px] font-medium leading-4 text-card-foreground text-pretty">
          {event.title}
        </span>
      </button>
    </div>
  )
}
