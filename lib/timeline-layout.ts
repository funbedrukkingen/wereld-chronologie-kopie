import type { Era, LaneId, TimelineEvent } from './timeline-data'

export const CARD_WIDTH = 176
export const CARD_GAP = 10
export const ROW_HEIGHT = 72
export const LANE_PAD_TOP = 34
export const LANE_PAD_BOTTOM = 14
export const RULER_HEIGHT = 64

export function eraWidth(era: Era) {
  return (era.end - era.start) * era.pxPerYear
}

export interface EraPlacement {
  era: Era
  x: number
  width: number
}

export function placeEras(eras: Era[]): EraPlacement[] {
  let x = 0
  return eras.map((era) => {
    const width = eraWidth(era)
    const placed = { era, x, width }
    x += width
    return placed
  })
}

export function totalWidth(eras: Era[]) {
  return eras.reduce((sum, era) => sum + eraWidth(era), 0)
}

/** Convert a year to an x-position across the segmented ruler. */
export function yearToX(year: number, eras: Era[]) {
  let x = 0
  for (let i = 0; i < eras.length; i++) {
    const era = eras[i]
    const isLast = i === eras.length - 1
    if (year < era.end || isLast) {
      const clamped = Math.min(Math.max(year, era.start), era.end)
      return x + (clamped - era.start) * era.pxPerYear
    }
    x += eraWidth(era)
  }
  return x
}

export function formatYear(year: number, approx?: boolean) {
  const abs = Math.abs(year)
  const num = abs.toLocaleString('en-US')
  const suffix = year < 0 ? 'BCE' : 'CE'
  return `${approx ? 'c. ' : ''}${num} ${suffix}`
}

export function formatEventDate(event: TimelineEvent) {
  if (event.endYear === undefined) return formatYear(event.year, event.approx)
  const sameEra = event.year < 0 === event.endYear < 0
  const start = sameEra
    ? `${event.approx ? 'c. ' : ''}${Math.abs(event.year).toLocaleString('en-US')}`
    : formatYear(event.year, event.approx)
  return `${start}–${formatYear(event.endYear)}`
}

export interface PlacedEvent {
  event: TimelineEvent
  x: number
  endX?: number
  level: number
}

export interface LaneLayout {
  lane: LaneId
  placed: PlacedEvent[]
  levels: number
  height: number
  top: number
}

/** Greedy stacking: place each card on the lowest row where it does not overlap. */
export function layoutLane(laneId: LaneId, laneEvents: TimelineEvent[], eras: Era[]): Omit<LaneLayout, 'top'> {
  const sorted = [...laneEvents].sort((a, b) => a.year - b.year)
  const rowEnds: number[] = []
  const placed: PlacedEvent[] = sorted.map((event) => {
    const x = yearToX(event.year, eras)
    const endX = event.endYear !== undefined ? yearToX(event.endYear, eras) : undefined
    let level = rowEnds.findIndex((end) => end + CARD_GAP <= x)
    if (level === -1) {
      level = rowEnds.length
      rowEnds.push(0)
    }
    rowEnds[level] = x + CARD_WIDTH
    return { event, x, endX, level }
  })
  const levels = Math.max(1, rowEnds.length)
  return {
    lane: laneId,
    placed,
    levels,
    height: LANE_PAD_TOP + levels * ROW_HEIGHT + LANE_PAD_BOTTOM,
  }
}

export function layoutAll(laneIds: LaneId[], events: TimelineEvent[], eras: Era[]): LaneLayout[] {
  let top = RULER_HEIGHT
  return laneIds.map((laneId) => {
    const base = layoutLane(
      laneId,
      events.filter((e) => e.lane === laneId),
      eras,
    )
    const layout = { ...base, top }
    top += base.height
    return layout
  })
}

/** Position of the marker dot for an event, in canvas coordinates. */
export function markerPoint(placed: PlacedEvent, laneTop: number) {
  return {
    x: placed.x,
    y: laneTop + LANE_PAD_TOP + placed.level * ROW_HEIGHT + 8,
  }
}
