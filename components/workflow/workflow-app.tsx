'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  FileText,
  Flag,
  FolderKanban,
  LayoutGrid,
  Menu,
  Network,
  PanelLeftClose,
  Search,
  Settings2,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Task = { title: string; detail?: string; icon: 'task' | 'doc' | 'contact' | 'check'; done?: boolean }
type Phase = { name: string; short: string; status: string; owner: string; due: string; accent: string; summary: string; tasks: Task[] }

const phases: Phase[] = [
  {
    name: 'Discovery & Alignment', short: 'Discovery', status: 'Complete', owner: 'Maya Chen', due: 'Aug 04', accent: 'teal',
    summary: 'Establish the shared brief, decision makers, and a clear definition of success before the work begins.',
    tasks: [
      { title: 'Stakeholder interviews', detail: '6 conversations captured', icon: 'contact', done: true },
      { title: 'Project brief', detail: 'Vision, scope and constraints', icon: 'doc', done: true },
      { title: 'Success criteria', detail: 'North-star metrics agreed', icon: 'check', done: true },
      { title: 'Kickoff notes', detail: 'Workspace reference document', icon: 'doc' },
    ],
  },
  {
    name: 'Research & Validation', short: 'Validation', status: 'In progress', owner: 'Alex Morgan', due: 'Aug 12', accent: 'gold',
    summary: 'Turn signals into confidence with focused research, a validated direction, and a prioritized opportunity map.',
    tasks: [
      { title: 'Research plan', detail: 'Methods and participant mix', icon: 'doc', done: true },
      { title: 'Customer interviews', detail: '12 of 18 completed', icon: 'contact' },
      { title: 'Opportunity map', detail: 'Cluster insights into themes', icon: 'task' },
      { title: 'Validation readout', detail: 'Decision meeting · Aug 14', icon: 'check' },
    ],
  },
  {
    name: 'Concept & Strategy', short: 'Strategy', status: 'Next up', owner: 'Jordan Lee', due: 'Aug 22', accent: 'teal',
    summary: 'Shape the strongest opportunity into a strategic concept the whole team can align behind.',
    tasks: [
      { title: 'Concept directions', detail: 'Explore three routes forward', icon: 'task' },
      { title: 'Positioning narrative', detail: 'Problem, promise and proof', icon: 'doc' },
      { title: 'Prioritization workshop', detail: 'Score impact against effort', icon: 'contact' },
      { title: 'Strategy sign-off', detail: 'Leadership review', icon: 'check' },
    ],
  },
  {
    name: 'Design & Build', short: 'Build', status: 'Not started', owner: 'Sam Rivera', due: 'Sep 09', accent: 'teal',
    summary: 'Bring the approved direction to life through a tight design system and a production-ready build.',
    tasks: [
      { title: 'Experience architecture', detail: 'Flows and key screens', icon: 'task' },
      { title: 'Design system', detail: 'Tokens, components and states', icon: 'doc' },
      { title: 'Prototype review', detail: 'Usability pass with team', icon: 'contact' },
      { title: 'Build handoff', detail: 'Specs ready for engineering', icon: 'check' },
    ],
  },
  {
    name: 'Launch & Learn', short: 'Launch', status: 'Not started', owner: 'Maya Chen', due: 'Sep 26', accent: 'gold',
    summary: 'Launch with intention, watch the right signals, and turn early learning into the next cycle of work.',
    tasks: [
      { title: 'Launch checklist', detail: 'Owners and dependencies', icon: 'task' },
      { title: 'Go-to-market brief', detail: 'Channels, messaging and timing', icon: 'doc' },
      { title: 'Launch readiness', detail: 'Final cross-functional review', icon: 'contact' },
      { title: 'Post-launch readout', detail: 'Measure, learn, iterate', icon: 'check' },
    ],
  },
]

const navItems = [
  { label: 'Overview', icon: LayoutGrid },
  { label: 'Workflows', icon: Network, active: true },
  { label: 'Tasks', icon: CheckCircle2 },
  { label: 'Documents', icon: FileText },
  { label: 'People', icon: Users },
]

function TaskIcon({ type }: { type: Task['icon'] }) {
  const Icon = type === 'doc' ? FileText : type === 'contact' ? Users : type === 'check' ? CheckCircle2 : CircleDot
  return <Icon className="size-4" aria-hidden="true" />
}

export function WorkflowApp() {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const pageCount = phases.length
  const desktopPageCount = Math.ceil(phases.length / 3)
  const desktopPage = Math.ceil(page / 3)
  const visiblePhases = useMemo(() => {
    const start = (desktopPage - 1) * 3
    return phases.slice(start, start + 3)
  }, [desktopPage])
  const filteredTasks = (phase: Phase) => phase.tasks.filter((task) => `${task.title} ${task.detail}`.toLowerCase().includes(query.toLowerCase()))

  const go = (next: number) => setPage(Math.min(pageCount, Math.max(1, next)))
  const displayPhases = query ? phases.filter((phase) => phase.name.toLowerCase().includes(query.toLowerCase()) || filteredTasks(phase).length > 0) : visiblePhases

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar p-5 transition-transform lg:translate-x-0', mobileNav ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Network className="size-5" /></span>
            <div><p className="text-sm font-semibold tracking-tight">Flowstate</p><p className="text-xs text-muted-foreground">Workspaces</p></div>
          </div>
          <button className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close navigation"><PanelLeftClose className="size-4" /></button>
        </div>
        <div className="relative mt-8"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search workflow" className="h-10 w-full rounded-lg border border-input bg-background/60 pl-9 pr-3 text-sm outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2" /></div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Primary navigation">
          {navItems.map(({ label, icon: Icon, active }) => <button key={label} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground', active && 'bg-primary/10 text-primary')}><Icon className="size-4" />{label}{active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}</button>)}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4"><button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><Settings2 className="size-4" />Settings</button><div className="mt-3 flex items-center gap-3 rounded-lg bg-accent/50 p-3"><span className="grid size-8 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">MC</span><div className="min-w-0"><p className="truncate text-xs font-medium">Maya Chen</p><p className="truncate text-[11px] text-muted-foreground">Product lead</p></div><ChevronDown className="ml-auto size-4 text-muted-foreground" /></div></div>
      </aside>

      <main className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-8 lg:px-10"><div className="flex items-center gap-3"><button className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu className="size-5" /></button><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Workspace / Product launch</p><h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Workflow overview</h1></div></div><button className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent sm:flex"><BriefcaseBusiness className="size-4" /> Q3 Launch <ChevronDown className="size-3.5" /></button></header>
        <section className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"><div className="max-w-2xl"><div className="flex items-center gap-3"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Active workflow</span><span className="text-xs text-muted-foreground">Last updated 4 min ago</span></div><h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">From first signal to launch day.</h2><p className="mt-3 max-w-xl text-pretty leading-6 text-muted-foreground">A shared view of the work, decisions, and people moving the Northstar product forward.</p></div><div className="flex items-center gap-6 rounded-xl border border-border bg-card px-5 py-4"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Overall progress</p><p className="mt-1 text-2xl font-semibold">32%</p></div><div className="h-10 w-px bg-border" /><div className="flex items-center gap-2 text-sm"><span className="size-2 rounded-full bg-primary" /> 1 complete <span className="size-2 rounded-full bg-chart-2" /> 1 active</div></div></div>
          <div className="mt-10 flex items-center justify-between"><div><p className="text-sm font-medium">Project timeline</p><p className="mt-1 text-xs text-muted-foreground">Showing {desktopPage === 1 ? 'phases 1–3' : 'phases 4–5'} of {pageCount}</p></div><div className="flex items-center gap-2"><button onClick={() => go(page - (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : 1))} disabled={page === 1} className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent disabled:opacity-30" aria-label="Previous phase"><ArrowLeft className="size-4" /></button><button onClick={() => go(page + (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : 1))} disabled={page === pageCount} className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent disabled:opacity-30" aria-label="Next phase"><ArrowRight className="size-4" /></button></div></div>
          <div className="relative mt-5"><div className="absolute left-6 right-6 top-7 hidden h-px bg-border lg:block" /><div className="grid gap-4 lg:grid-cols-3">{displayPhases.map((phase, index) => { const actualIndex = phases.indexOf(phase); return <article key={phase.name} className={cn('relative min-h-[430px] flex-col rounded-2xl border bg-card p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,.8)] transition-colors sm:p-6 lg:flex', actualIndex + 1 === page ? 'flex border-primary/80 ring-1 ring-primary/20' : 'hidden border-border lg:flex')}><div className="flex items-start justify-between"><div className={cn('grid size-12 place-items-center rounded-xl border', phase.accent === 'gold' ? 'border-chart-2/30 bg-chart-2/10 text-chart-2' : 'border-primary/30 bg-primary/10 text-primary')}><span className="text-lg font-semibold">{String(actualIndex + 1).padStart(2, '0')}</span></div><span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', phase.status === 'Complete' ? 'bg-primary/10 text-primary' : phase.status === 'In progress' ? 'bg-chart-2/10 text-chart-2' : 'bg-muted text-muted-foreground')}>{phase.status}</span></div><div className="mt-5"><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Phase {actualIndex + 1} · Page {actualIndex + 1}/{pageCount}</p><h3 className="mt-2 text-xl font-semibold tracking-tight">{phase.name}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{phase.summary}</p></div><div className="mt-6 flex flex-wrap gap-2 text-xs"><span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-muted-foreground"><Users className="size-3.5" /> {phase.owner}</span><span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-muted-foreground"><CalendarDays className="size-3.5" /> Due {phase.due}</span></div><div className="my-5 h-px bg-border" /><ul className="flex flex-col gap-3">{filteredTasks(phase).map((task) => <li key={task.title} className="flex items-start gap-3"><span className={cn('mt-0.5 text-muted-foreground', task.done && 'text-primary')}><TaskIcon type={task.done ? 'check' : task.icon} /></span><div className="min-w-0"><p className={cn('text-sm font-medium', task.done && 'text-muted-foreground line-through decoration-primary/50')}>{task.title}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{task.detail}</p></div>{task.done && <Check className="ml-auto mt-0.5 size-3.5 text-primary" />}</li>)}</ul><div className="mt-auto pt-6"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{phase.tasks.filter((task) => task.done).length} of {phase.tasks.length} tasks</span><Flag className={cn('size-3.5', phase.accent === 'gold' ? 'text-chart-2' : 'text-primary')} /></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn('h-full rounded-full', phase.accent === 'gold' ? 'bg-chart-2' : 'bg-primary')} style={{ width: `${(phase.tasks.filter((task) => task.done).length / phase.tasks.length) * 100}%` }} /></div></div></article>})}</div></div>
          <div className="mt-6 flex items-center justify-center gap-2" aria-label="Timeline pages">{phases.map((phase, index) => <button key={phase.name} onClick={() => go(index + 1)} aria-label={`Go to phase ${index + 1}`} className={cn('size-2 rounded-full transition-all', page === index + 1 ? 'w-6 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60')} />)}</div>
          <div className="mt-10 flex items-center justify-between rounded-xl border border-border bg-card/50 px-4 py-3 text-xs text-muted-foreground sm:px-5"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /> Timeline is on track</span><span className="hidden sm:inline">Use the arrows to move between phases · {desktopPage}/{desktopPageCount} views</span><span className="sm:hidden">Swipe or use arrows to navigate</span></div>
        </section>
      </main>
    </div>
  )
}
