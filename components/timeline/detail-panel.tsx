'use client'

import type { CSSProperties } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Era, Lane, TimelineEvent } from '@/lib/timeline-data'
import { formatEventDate } from '@/lib/timeline-layout'

interface DetailPanelProps {
  event: TimelineEvent
  lane: Lane
  era: Era | undefined
  related: { event: TimelineEvent; lane: Lane }[]
  onClose: () => void
  onSelect: (id: string) => void
}

export function DetailPanel({ event, lane, era, related, onClose, onSelect }: DetailPanelProps) {
  return (
    <aside
      aria-label="Event details"
      style={{ '--lane': `var(--lane-${lane.id})` } as CSSProperties}
      className="flex max-h-[45vh] flex-col border-t border-border bg-card md:absolute md:inset-y-0 md:right-0 md:max-h-none md:w-96 md:border-l md:border-t-0"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-(--lane)">
            <span aria-hidden className="size-2 rounded-full bg-(--lane)" />
            {lane.name}
            {era && <span className="text-muted-foreground">· {era.name}</span>}
          </span>
          <h2 className="font-serif text-xl leading-6 text-balance">{event.title}</h2>
          <p className="text-sm text-muted-foreground">{formatEventDate(event)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details" className="-mr-2 -mt-1 shrink-0">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto px-5 py-4 timeline-scroll">
        {event.description ? (
          <p className="text-sm leading-6 text-pretty">{event.description}</p>
        ) : (
          <p className="text-sm italic leading-6 text-muted-foreground">
            No description yet. Add one in <code className="font-mono text-xs">lib/timeline-data.ts</code>.
          </p>
        )}

        {event.source && (
          <dl className="flex flex-col gap-1 text-sm">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Source</dt>
            <dd className="font-serif italic">{event.source}</dd>
          </dl>
        )}

        {related.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Compare with</h3>
            <ul className="flex flex-col gap-1.5">
              {related.map(({ event: rel, lane: relLane }) => (
                <li key={rel.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(rel.id)}
                    style={{ '--rel': `var(--lane-${relLane.id})` } as CSSProperties}
                    className="flex w-full items-center gap-3 rounded-md border border-border px-3 py-2 text-left transition-colors hover:border-(--rel) hover:bg-accent"
                  >
                    <span aria-hidden className="size-2 shrink-0 rounded-full bg-(--rel)" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[11px] text-(--rel)">
                        {relLane.short} · {formatEventDate(rel)}
                      </span>
                      <span className="truncate text-sm">{rel.title}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  )
}
