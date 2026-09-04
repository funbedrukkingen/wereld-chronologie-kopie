'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Era, Lane, LaneId, TimelineEvent } from '@/lib/timeline-data'
import { CARD_WIDTH, layoutAll, placeEras, yearToX } from '@/lib/timeline-layout'
import { DetailPanel } from './detail-panel'
import { EraNav } from './era-nav'
import { TimelineCanvas } from './timeline-canvas'

interface TimelineAppProps {
  eras: Era[]
  lanes: Lane[]
  events: TimelineEvent[]
}

export function TimelineApp({ eras, lanes, events }: TimelineAppProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [hiddenLanes, setHiddenLanes] = useState<Set<LaneId>>(new Set())
  const [activeEraId, setActiveEraId] = useState(eras[0]?.id ?? '')

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events])
  const visibleLanes = useMemo(() => lanes.filter((l) => !hiddenLanes.has(l.id)), [lanes, hiddenLanes])
  const layouts = useMemo(
    () =>
      layoutAll(
        visibleLanes.map((l) => l.id),
        events,
        eras,
      ),
    [visibleLanes, events, eras],
  )
  const eraPlacements = useMemo(() => placeEras(eras), [eras])

  const scrollToX = useCallback((x: number, center = true) => {
    const el = scrollRef.current
    if (!el) return
    const left = center ? x - el.clientWidth / 2 + CARD_WIDTH / 2 : x
    el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [])

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id)
      const event = eventsById.get(id)
      if (event) scrollToX(yearToX(event.year, eras))
    },
    [eventsById, eras, scrollToX],
  )

  const handleJumpEra = useCallback(
    (eraId: string) => {
      const p = eraPlacements.find((e) => e.era.id === eraId)
      if (p) scrollToX(p.x, false)
    },
    [eraPlacements, scrollToX],
  )

  // Track which era sits under the viewport centre
  const updateActiveEra = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const centre = el.scrollLeft + el.clientWidth / 2
    const current = eraPlacements.find((p) => centre >= p.x && centre < p.x + p.width) ?? eraPlacements.at(-1)
    if (current && current.era.id !== activeEraId) setActiveEraId(current.era.id)
  }, [eraPlacements, activeEraId])

  // Vertical wheel → horizontal travel; drag to pan; arrow keys
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || e.shiftKey) return
      const canScrollVertically = el.scrollHeight > el.clientHeight
      // Alt/Option + wheel keeps native vertical scrolling for tall lanes
      if (canScrollVertically && e.altKey) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    let dragging = false
    let startX = 0
    let startY = 0
    let startLeft = 0
    let startTop = 0
    let moved = 0

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.pointerType === 'touch') return
      dragging = true
      moved = 0
      startX = e.clientX
      startY = e.clientY
      startLeft = el.scrollLeft
      startTop = el.scrollTop
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      moved = Math.max(moved, Math.abs(dx), Math.abs(dy))
      el.scrollLeft = startLeft - dx
      el.scrollTop = startTop - dy
    }
    const onPointerUp = () => {
      dragging = false
    }
    // Suppress the click that ends a drag
    const onClickCapture = (e: MouseEvent) => {
      if (moved > 6) {
        e.stopPropagation()
        e.preventDefault()
        moved = 0
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target !== el) return
      if (e.key === 'ArrowRight') el.scrollBy({ left: 400, behavior: 'smooth' })
      if (e.key === 'ArrowLeft') el.scrollBy({ left: -400, behavior: 'smooth' })
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    el.addEventListener('click', onClickCapture, true)
    el.addEventListener('keydown', onKeyDown)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('click', onClickCapture, true)
      el.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleLane = (id: LaneId) => {
    setHiddenLanes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < lanes.length - 1) next.add(id)
      return next
    })
  }

  const selected = selectedId ? eventsById.get(selectedId) : undefined
  const selectedLane = selected ? lanes.find((l) => l.id === selected.lane) : undefined
  const selectedEra = selected ? eras.find((e) => selected.year >= e.start && selected.year < e.end) ?? eras.at(-1) : undefined
  const relatedItems = useMemo(() => {
    if (!selected) return []
    const ids = new Set<string>(selected.related ?? [])
    for (const e of events) if (e.related?.includes(selected.id)) ids.add(e.id)
    return [...ids]
      .map((id) => eventsById.get(id))
      .filter((e): e is TimelineEvent => Boolean(e))
      .sort((a, b) => a.year - b.year)
      .map((e) => ({ event: e, lane: lanes.find((l) => l.id === e.lane)! }))
  }, [selected, events, eventsById, lanes])

  const activeIndex = eras.findIndex((e) => e.id === activeEraId)

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border bg-background px-4 py-3 md:px-6">
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Strata</h1>
          <p className="hidden text-sm text-muted-foreground sm:block text-pretty">
            Mesopotamia, the Bible and the Church on one ruler — 450,000 years to today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ul className="flex flex-wrap items-center gap-1" aria-label="Lanes (click to hide or show)">
            {lanes.map((lane) => {
              const hidden = hiddenLanes.has(lane.id)
              return (
                <li key={lane.id}>
                  <button
                    type="button"
                    onClick={() => toggleLane(lane.id)}
                    aria-pressed={!hidden}
                    style={{ '--lane': `var(--lane-${lane.id})` } as CSSProperties}
                    className={cn(
                      'flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent',
                      hidden ? 'border-border text-muted-foreground line-through' : 'border-(--lane)/40 text-foreground',
                    )}
                  >
                    <span aria-hidden className={cn('size-2 rounded-full bg-(--lane)', hidden && 'opacity-30')} />
                    {lane.name}
                  </button>
                </li>
              )
            })}
          </ul>
          <div
            className="flex items-center gap-3 text-[11px] text-muted-foreground"
            aria-label="Divided monarchy colour key"
          >
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full" style={{ background: 'var(--lane-israel)' }} />
              Israel · 10 tribes
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full" style={{ background: 'var(--lane-judah)' }} />
              Judah · 2 tribes
            </span>
          </div>
        </div>
      </header>

      <EraNav eras={eras} activeEraId={activeEraId} onJump={handleJumpEra} />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <TimelineCanvas
            ref={scrollRef}
            eras={eras}
            lanes={visibleLanes}
            layouts={layouts}
            eventsById={eventsById}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={handleSelect}
            onHover={setHoveredId}
            onScroll={updateActiveEra}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-between px-3">
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto shadow-lg"
              aria-label="Previous era"
              disabled={activeIndex <= 0}
              onClick={() => handleJumpEra(eras[activeIndex - 1].id)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="pointer-events-none self-center rounded-full bg-background/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
              Scroll or drag to travel · click a card for details
            </p>
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto shadow-lg"
              aria-label="Next era"
              disabled={activeIndex >= eras.length - 1}
              onClick={() => handleJumpEra(eras[activeIndex + 1].id)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {selected && selectedLane && (
          <DetailPanel
            event={selected}
            lane={selectedLane}
            era={selectedEra}
            related={relatedItems}
            onClose={() => setSelectedId(null)}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  )
}
