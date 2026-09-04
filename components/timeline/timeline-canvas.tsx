'use client'

import { forwardRef, useMemo, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import type { Era, Lane, TimelineEvent } from '@/lib/timeline-data'
import {
  RULER_HEIGHT,
  formatYear,
  markerPoint,
  placeEras,
  type LaneLayout,
} from '@/lib/timeline-layout'
import { EventCard } from './event-card'

interface TimelineCanvasProps {
  eras: Era[]
  lanes: Lane[]
  layouts: LaneLayout[]
  eventsById: Map<string, TimelineEvent>
  selectedId: string | null
  hoveredId: string | null
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  onScroll: () => void
}

interface Thread {
  key: string
  from: string
  to: string
  d: string
  laneId: string
}

export const TimelineCanvas = forwardRef<HTMLDivElement, TimelineCanvasProps>(function TimelineCanvas(
  { eras, lanes, layouts, eventsById, selectedId, hoveredId, onSelect, onHover, onScroll },
  ref,
) {
  const eraPlacements = useMemo(() => placeEras(eras), [eras])
  const width = eraPlacements.reduce((sum, p) => sum + p.width, 0)
  const height = layouts.reduce((sum, l) => sum + l.height, RULER_HEIGHT)

  // Map every visible event to its marker position
  const points = useMemo(() => {
    const map = new Map<string, { x: number; y: number; laneId: string }>()
    for (const layout of layouts) {
      for (const placed of layout.placed) {
        const p = markerPoint(placed, layout.top)
        map.set(placed.event.id, { ...p, laneId: layout.lane })
      }
    }
    return map
  }, [layouts])

  // Build comparison threads once (deduped by pair)
  const threads = useMemo<Thread[]>(() => {
    const seen = new Set<string>()
    const list: Thread[] = []
    for (const [id, from] of points) {
      const event = eventsById.get(id)
      for (const relId of event?.related ?? []) {
        const to = points.get(relId)
        if (!to) continue
        const key = [id, relId].sort().join('|')
        if (seen.has(key)) continue
        seen.add(key)
        const midY = (from.y + to.y) / 2
        list.push({
          key,
          from: id,
          to: relId,
          laneId: from.laneId,
          d: `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`,
        })
      }
    }
    return list
  }, [points, eventsById])

  const focusId = hoveredId ?? selectedId
  const focusEvent = focusId ? eventsById.get(focusId) : undefined
  const focusSet = useMemo(() => {
    if (!focusEvent) return null
    const set = new Set<string>([focusEvent.id, ...(focusEvent.related ?? [])])
    // include reverse links
    for (const t of threads) {
      if (t.from === focusEvent.id) set.add(t.to)
      if (t.to === focusEvent.id) set.add(t.from)
    }
    return set
  }, [focusEvent, threads])

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      tabIndex={0}
      aria-label="Timeline canvas. Scroll horizontally to move through time."
      className="timeline-scroll relative flex-1 cursor-grab overflow-auto outline-none select-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <div className="relative strata" style={{ width, height }}>
        {/* Era column backgrounds + dividers */}
        {eraPlacements.map(({ era, x, width: w }, i) => (
          <div
            key={era.id}
            aria-hidden
            className={cn('absolute inset-y-0 border-l border-border/60', i % 2 === 1 && 'bg-foreground/[0.015]')}
            style={{ left: x, width: w }}
          />
        ))}

        {/* Ruler */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur" style={{ height: RULER_HEIGHT }}>
          {eraPlacements.map(({ era, x, width: w }) => {
            const ticks: number[] = []
            for (let y = era.start; y < era.end; y += era.tick) ticks.push(y)
            return (
              <div key={era.id} className="absolute inset-y-0" style={{ left: x, width: w }}>
                <div className="sticky left-0 z-10 flex w-fit max-w-full items-baseline gap-2 px-3 pt-2">
                  <span className="font-serif text-sm text-foreground whitespace-nowrap">{era.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap">
                    {formatYear(era.start)} – {formatYear(era.end)} · 1 px ≈ {Math.round(1 / era.pxPerYear).toLocaleString('en-US')} yr
                  </span>
                </div>
                {ticks.map((y) => {
                  const tx = (y - era.start) * era.pxPerYear
                  return (
                    <div key={y} className="absolute bottom-0 flex flex-col items-start" style={{ left: tx }}>
                      <span className="mb-1 -translate-x-px pl-1 text-[10px] tabular-nums text-muted-foreground">
                        {formatYear(y)}
                      </span>
                      <span aria-hidden className="h-2 w-px bg-muted-foreground/60" />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Comparison threads */}
        <svg
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10"
          width={width}
          height={height}
          style={{ overflow: 'visible' }}
        >
          {threads.map((t) => {
            const lit = focusSet ? focusSet.has(t.from) && focusSet.has(t.to) : false
            const muted = focusSet !== null && !lit
            return (
              <path
                key={t.key}
                d={t.d}
                fill="none"
                stroke={`var(--lane-${t.laneId})`}
                strokeWidth={lit ? 2 : 1}
                strokeDasharray={lit ? undefined : '3 4'}
                className="transition-opacity duration-300"
                style={{ opacity: lit ? 0.95 : muted ? 0.08 : 0.32 }}
              />
            )
          })}
        </svg>

        {/* Lanes */}
        {layouts.map((layout) => {
          const lane = lanes.find((l) => l.id === layout.lane)!
          return (
            <section
              key={layout.lane}
              aria-label={lane.name}
              style={{ top: layout.top, height: layout.height, '--lane': `var(--lane-${lane.id})` } as CSSProperties}
              className="absolute left-0 w-full border-b border-border"
            >
              <div className="sticky left-0 z-20 flex w-fit items-center gap-2 px-3 py-1.5">
                <span aria-hidden className="h-4 w-1 rounded-full bg-(--lane)" />
                <h2 className="font-serif text-sm text-foreground whitespace-nowrap">{lane.name}</h2>
              </div>
              {layout.placed.map((placed) => (
                <EventCard
                  key={placed.event.id}
                  placed={placed}
                  selected={selectedId === placed.event.id}
                  dimmed={focusSet !== null && !focusSet.has(placed.event.id)}
                  onSelect={onSelect}
                  onHover={onHover}
                />
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
})
