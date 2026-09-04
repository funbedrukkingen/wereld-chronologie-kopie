'use client'

import { cn } from '@/lib/utils'
import type { Era } from '@/lib/timeline-data'
import { formatYear } from '@/lib/timeline-layout'

interface EraNavProps {
  eras: Era[]
  activeEraId: string
  onJump: (eraId: string) => void
}

export function EraNav({ eras, activeEraId, onJump }: EraNavProps) {
  return (
    <nav aria-label="Eras" className="border-b border-border">
      <ol className="flex overflow-x-auto timeline-scroll">
        {eras.map((era, i) => {
          const active = era.id === activeEraId
          return (
            <li key={era.id} className="flex shrink-0 grow basis-0">
              <button
                type="button"
                onClick={() => onJump(era.id)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'flex w-full min-w-40 flex-col gap-0.5 border-r border-border px-3 py-2 text-left transition-colors',
                  'hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                  active ? 'bg-accent' : 'bg-background',
                  i === eras.length - 1 && 'border-r-0',
                )}
              >
                <span
                  className={cn(
                    'text-[10px] uppercase tracking-[0.14em]',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {formatYear(era.start)} – {formatYear(era.end)}
                </span>
                <span className={cn('font-serif text-sm leading-5', active ? 'text-foreground' : 'text-muted-foreground')}>
                  {era.name}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
