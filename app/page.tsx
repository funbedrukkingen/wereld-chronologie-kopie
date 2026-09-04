import { TimelineApp } from '@/components/timeline/timeline-app'
import { eras, events, lanes } from '@/lib/timeline-data'

export default function Page() {
  return (
    <main className="h-dvh">
      <TimelineApp eras={eras} lanes={lanes} events={events} />
    </main>
  )
}
