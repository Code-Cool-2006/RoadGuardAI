import { ArrowRight, BadgeCheck, Scale, ShieldCheck, Sparkles, Star } from 'lucide-react';

const stats = [
  { value: '15+', label: 'Years of legal excellence' },
  { value: '500+', label: 'Successful cases resolved' },
  { value: '98%', label: 'Client satisfaction rate' },
];

const practiceAreas = [
  { title: 'Criminal defense', description: 'Skilled representation for complex investigations and courtroom advocacy.' },
  { title: 'Family law', description: 'Compassionate support for sensitive matters involving custody and disputes.' },
  { title: 'Business law', description: 'Practical legal guidance for contracts, growth, and governance.' },
  { title: 'Civil litigation', description: 'Strategic dispute resolution backed by rigorous preparation.' },
];

const team = [
  { name: 'Amelia Hart', title: 'Managing Partner', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80' },
  { name: 'David Chen', title: 'Senior Counsel', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sofia Alvarez', title: 'Family Law Specialist', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80' },
];

const testimonials = [
  {
    quote: 'LawAxis handled our matter with clarity, precision, and calm confidence from day one.',
    name: 'Rachel Kim',
    case: 'Business dispute',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    quote: 'Their team made a difficult family matter feel manageable and respectful.',
    name: 'Marcus Ford',
    case: 'Family law',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  },
  {
    quote: 'We felt protected and informed throughout every step of our litigation strategy.',
    name: 'Nina Lopez',
    case: 'Civil litigation',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
];

export default function LawAxis() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C1C1C]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#2B2653]/15 bg-white/80 shadow-sm">
            <Scale className="h-5 w-5 text-[#2B2653]" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">LawAxis</p>
            <p className="text-sm text-[#5A5A5A]">Trusted counsel</p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#1C1C1C] md:flex">
          {['Home', 'About us', 'Practice areas', 'Blog', 'Contact'].map((item) => (
            <a key={item} href="#" className="transition hover:text-[#2B2653]">{item}</a>
          ))}
        </nav>
        <a href="#" className="rounded-md bg-[#2B2653] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
          Free consultation →
        </a>
      </header>

      <main>
        <section className="px-6 pb-20 pt-10 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2B2653]/10 bg-white/70 px-3 py-1 text-sm text-[#2B2653]">
              <BadgeCheck className="h-4 w-4" /> Strategic legal guidance with integrity
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
              Smart legal strategies
            </h1>
            <p className="mt-4 font-serif text-2xl italic text-[#2B2653] sm:text-3xl">proven success</p>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#5A5A5A]">
              We provide expert legal services with integrity and dedication, our team is committed to delivering reliable and proven results.
            </p>
            <div className="mt-8 flex justify-center">
              <a href="#" className="rounded-md bg-[#2B2653] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                Free consultation →
              </a>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-7xl overflow-hidden rounded-[24px] border border-[#2B2653]/10 bg-white p-3 shadow-[0_20px_80px_rgba(43,38,83,0.08)]">
            <img
              src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1800&q=80"
              alt="Attorneys in a law office"
              className="h-[420px] w-full rounded-[20px] object-cover lg:h-[560px]"
            />
          </div>
        </section>

        <section className="px-6 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Experience you can trust / results you deserve
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#5A5A5A]">
              Our mission is to stand by our clients with integrity.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[18px] border border-[#2B2653]/10 bg-[#EFECE4] p-8 text-center shadow-sm">
                <p className="text-4xl font-semibold text-[#1C1C1C]">{stat.value}</p>
                <p className="mt-3 text-sm font-medium text-[#5A5A5A]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#2B2653] px-6 py-20 text-white lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Expert legal services you can trust</h2>
              <p className="max-w-xl text-lg leading-8 text-[#D1CFE2]">
                We combine thoughtful strategy with deep experience so every client receives focused, dependable counsel.
              </p>
              <img
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f337?auto=format&fit=crop&w=1200&q=80"
                alt="Attorneys reviewing legal documents"
                className="h-[320px] w-full rounded-[18px] object-cover"
              />
              <a href="#" className="inline-flex items-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#2B2653]">
                View all services →
              </a>
            </div>
            <div className="rounded-[20px] border border-white/15 bg-white/10 p-6 backdrop-blur">
              {practiceAreas.map((area, index) => (
                <div key={area.title} className={`py-5 ${index !== practiceAreas.length - 1 ? 'border-b border-white/10' : ''}`}>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D1CFE2]">0{index + 1} | {area.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#F8F6F0]">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Meet our legal experts</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#5A5A5A]">Our team is made up of highly qualified and dedicated lawyers.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
            {team.map((person) => (
              <div key={person.name} className="overflow-hidden rounded-[20px] border border-[#2B2653]/10 bg-white shadow-sm">
                <img src={person.image} alt={person.name} className="h-80 w-full object-cover" />
                <div className="p-6 text-center">
                  <p className="text-lg font-semibold text-[#1C1C1C]">{person.name}</p>
                  <p className="mt-2 text-sm text-[#5A5A5A]">{person.title}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <a href="#" className="rounded-md bg-[#2B2653] px-4 py-2.5 text-sm font-semibold text-white">
              View all team →
            </a>
          </div>
        </section>

        <section className="bg-[#2B2653] px-6 py-20 text-white lg:px-8 lg:py-28">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What our clients say about us</h2>
              <p className="mt-3 max-w-xl text-lg text-[#D1CFE2]">Trusted by individuals and businesses seeking calm, dependable legal direction.</p>
            </div>
            <a href="#" className="inline-flex items-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#2B2653]">
              View all reviews →
            </a>
          </div>
          <div className="mx-auto mt-12 grid max-w-7xl gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-[20px] bg-white p-7 text-[#1C1C1C] shadow-sm">
                <div className="flex gap-1 text-[#2B2653]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-lg leading-8">“{item.quote}”</p>
                <div className="mt-7 flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-[#5A5A5A]">{item.case}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
