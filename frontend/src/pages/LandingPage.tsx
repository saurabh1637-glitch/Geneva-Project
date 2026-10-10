import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, ArrowRight, CheckCircle2, ShieldCheck, Brain, Zap, GitBranch,
  Database, FileText, Cpu, Eye, Activity, Sparkles,
} from 'lucide-react'
import { Button, Card, CardBody } from '../components/ui/FormComponents'
import { Container, Section, Grid, Flex } from '../components/ui/LayoutComponents'
import { cn } from '../utils/helpers'

const features = [
  { icon: Heart, title: 'CAD Prediction', description: 'Estimate coronary artery disease risk from clinical, laboratory, and echocardiographic features.', color: 'blue' },
  { icon: GitBranch, title: 'Vessel-Specific Analysis', description: 'Explore separate LAD, LCX, and RCA stenosis predictions when supported by configured models.', color: 'teal' },
  { icon: Brain, title: 'Explainable AI', description: 'Understand which input features influence model outputs through feature-contribution explanations.', color: 'violet' },
  { icon: Activity, title: '3D Visualization', description: 'Explore the cardiovascular visualization workspace with a clear placeholder when a 3D asset is unavailable.', color: 'sky' },
  { icon: ShieldCheck, title: 'Model Transparency', description: 'Review evaluation metrics and limitations instead of relying on opaque predictions.', color: 'amber' },
  { icon: Database, title: 'Dataset Explorer', description: 'Inspect dataset structure, feature descriptions, missing values, and target distributions.', color: 'emerald' },
]

const steps = [
  { step: '01', title: 'Input Patient Data', description: 'Enter clinical, demographic, laboratory, and echocardiographic measurements through the guided form.', icon: Cpu, tone: 'blue' },
  { step: '02', title: 'Run Prediction', description: 'Configured machine-learning models process eligible features to estimate CAD and vessel-specific risk.', icon: Brain, tone: 'teal' },
  { step: '03', title: 'Explore Results', description: 'Review prediction outputs, feature contributions, model limitations, and cardiovascular visualization.', icon: Eye, tone: 'violet' },
  { step: '04', title: 'Generate Report', description: 'Review or export an available report with results, explanations, and the research disclaimer.', icon: FileText, tone: 'amber' },
]

const featureTone: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  teal: 'bg-teal-50 text-teal-700 ring-teal-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
}
const stepTone: Record<string, string> = {
  blue: 'from-blue-600 to-blue-500 shadow-blue-200',
  teal: 'from-teal-600 to-teal-500 shadow-teal-200',
  violet: 'from-violet-600 to-violet-500 shadow-violet-200',
  amber: 'from-amber-600 to-amber-500 shadow-amber-200',
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) { setVisible(true); return }
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

function WorkflowSection() {
  const { ref, visible } = useInView<HTMLElement>()
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return (
    <section ref={ref} className="workflow-section relative overflow-hidden bg-slate-50 py-20 sm:py-24" aria-labelledby="workflow-title">
      <Container size="lg">
        <div className={cn('mb-12 max-w-2xl transition-all duration-700', visible || reduceMotion ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0')}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 shadow-sm"><Sparkles size={14} /> Simple four-step workflow</div>
          <h2 id="workflow-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How It Works</h2>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">Streamlined workflow from patient data to clinical insights.</p>
        </div>
        <div className="workflow-grid relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div aria-hidden="true" className={cn('workflow-rail hidden lg:block', visible || reduceMotion ? 'workflow-rail-visible' : '')} />
          {steps.map((step, index) => {
            const Icon = step.icon
            return <article key={step.step} className={cn('workflow-card group relative z-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl', visible || reduceMotion ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0')} style={{ transitionDelay: reduceMotion ? '0ms' : `${index * 140}ms` }}>
              <div className="mb-5 flex items-center justify-between">
                <div className={cn('workflow-icon flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110', stepTone[step.tone])}><Icon size={25} strokeWidth={1.9} /></div>
                <span className="text-3xl font-bold tracking-tight text-slate-200 transition-colors group-hover:text-blue-100">{step.step}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              <div className="mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-300 group-hover:w-20" />
            </article>
          })}
        </div>
      </Container>
    </section>
  )
}

export function LandingPage() {
  const { ref: heroRef, visible: heroVisible } = useInView<HTMLElement>()
  return (
    <div className="landing-page">
      <section ref={heroRef} className="hero-surface relative isolate overflow-hidden border-b border-blue-100/70">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.12fr_.88fr] lg:px-8 lg:py-24">
          <div className={cn('relative z-10 transition-all duration-700', heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0')}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-4 py-2 text-xs font-semibold text-blue-800 shadow-sm sm:text-sm"><span className="h-2 w-2 rounded-full bg-teal-500" /> IIT Mandi Multimodal AI Hackathon 2026 <span className="text-blue-300">/</span> Track A</div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.24em] text-slate-500">Research prototype</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">GENEVA <span className="block bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 bg-clip-text pb-1 text-transparent">AI Cardiovascular Risk Visualization &amp; Prediction</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Explore a research workflow for coronary artery disease and vessel-specific stenosis prediction using the Z-Alizadeh Sani dataset, with explainable AI and interactive cardiovascular visualization.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/patients/new"><Button size="lg" className="group gap-2 shadow-lg shadow-blue-200/70"><Heart size={19} /> Start Analysis <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Button></Link>
              <Link to="/dashboard"><Button variant="secondary" size="lg" className="gap-2"><Activity size={18} /> Explore Dashboard</Button></Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Research-focused</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Open source</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-amber-600" /> Not a diagnosis</span>
            </div>
          </div>
          <div className={cn('relative mx-auto w-full max-w-lg transition-all duration-1000', heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0')} style={{ transitionDelay: '160ms' }}>
            <div className="hero-panel relative overflow-hidden rounded-[2rem] border border-white bg-white/80 p-6 shadow-2xl shadow-blue-900/10 backdrop-blur sm:p-8">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-violet-500" />
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">GENEVA workspace</p><h2 className="mt-1 text-xl font-bold text-slate-900">Cardiovascular overview</h2></div><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Activity size={25} /></div></div>
              <div className="mt-7 rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-5 text-white">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm text-blue-200">Analysis workflow</p><p className="mt-1 text-2xl font-bold">Patient assessment</p></div><div className="rounded-full border border-white/15 bg-white/10 p-2"><Heart size={22} /></div></div>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[['01','Clinical data'],['02','ML inference'],['03','Insights']].map(([n,label]) => <div key={n} className="rounded-xl border border-white/10 bg-white/[0.07] p-3"><span className="text-xs font-bold text-teal-300">{n}</span><p className="mt-2 text-xs font-medium text-slate-100 sm:text-sm">{label}</p></div>)}
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs text-blue-100"><span className="h-2 w-2 rounded-full bg-teal-400" /> Research prototype · Results depend on configured models</div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="mb-2 flex items-center gap-2 text-blue-700"><Brain size={17} /><span className="text-xs font-semibold">Explainability</span></div><p className="text-sm font-semibold text-slate-800">Feature insights</p><p className="mt-1 text-xs leading-5 text-slate-500">Understand model contributions</p></div>
                <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="mb-2 flex items-center gap-2 text-teal-700"><Eye size={17} /><span className="text-xs font-semibold">Visualization</span></div><p className="text-sm font-semibold text-slate-800">Explore results</p><p className="mt-1 text-xs leading-5 text-slate-500">Review outputs and limitations</p></div>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900"><ShieldCheck size={16} className="mt-0.5 shrink-0" /> Research and educational use only. This interface is not a clinically validated diagnostic tool.</div>
            </div>
            <div className="absolute -right-3 -top-4 -z-10 h-24 w-24 rounded-full bg-teal-200/60 blur-2xl" aria-hidden="true" />
            <div className="absolute -bottom-5 -left-5 -z-10 h-28 w-28 rounded-full bg-blue-300/50 blur-2xl" aria-hidden="true" />
          </div>
        </div>
      </section>

      <Section title="Key Features" description="A transparent research workflow for exploring cardiovascular risk and model behavior." className="bg-white">
        <Container size="lg"><Grid cols={3} gap="lg">{features.map((feature) => <Card key={feature.title} className="feature-card h-full border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"><CardBody className="p-6 sm:p-7"><div className={cn('mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ring-1', featureTone[feature.color])}><feature.icon size={23} /></div><h3 className="text-lg font-bold text-slate-900">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p></CardBody></Card>)}</Grid></Container>
      </Section>

      <WorkflowSection />

      <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-20"><div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-slate-950 to-teal-950 opacity-90" aria-hidden="true" /><Container size="md"><div className="relative text-center"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-teal-300"><Zap size={27} /></div><h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Explore?</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Start with the guided patient form or explore the available dashboard, model metrics, and dataset documentation.</p><Flex justify="center" gap={3} wrap className="mt-8"><Link to="/patients/new"><Button size="lg" className="gap-2 bg-white text-slate-950 hover:bg-blue-50"><ArrowRight size={18} /> Begin Analysis</Button></Link><Link to="/dashboard"><Button variant="secondary" size="lg" className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15"><Activity size={18} /> Open Dashboard</Button></Link></Flex></div></Container></section>
    </div>
  )
}

export default LandingPage
