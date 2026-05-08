import Navbar from "@/components/ui/Navbar";
import Hero3D from "@/components/three/Hero3D";
import { locales, siteConfig } from "@/lib/i18n/content";

const content = locales.en;

export default function HomePage() {
  return (
    <>
      <Navbar
        locale="en"
        nav={content.nav as Record<string, string>}
        navIds={locales.shared.navIds as string[]}
        logoText={content.logoText}
        langSwitchLabel={content.langSwitchLabel}
        langSwitchHref={content.langSwitchHref}
      />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Hero3D />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
          <p className="text-brand-300 text-sm md:text-base font-medium tracking-widest uppercase mb-4">
            {content.hero.kicker}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4">
            {content.hero.titlePrefix}{" "}
            <span className="text-brand-400">{content.hero.titleAccent}</span>{" "}
            {content.hero.titleSuffix}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-2">{content.hero.subtitleLocation}</p>
          <p className="text-gray-400 text-base mb-8">{content.hero.subtitleLanguages}</p>
          <p className="text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {content.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-brand-900/40"
            >
              {content.hero.ctaPrimary}
            </a>
            <a
              href="#portfolio"
              className="px-8 py-3 border border-white/20 hover:border-brand-400 text-white font-semibold rounded-full transition-all hover:bg-white/5"
            >
              {content.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-surface-elevated">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{content.about.title}</h2>
            <p className="text-brand-300 text-lg">{content.about.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5 text-gray-300 leading-relaxed">
              {content.about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-6">
              {content.about.stats.map((s) => (
                <div key={s.label} className="bg-black/30 border border-white/5 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-brand-400 mb-1">{s.value}</div>
                  <div className="text-sm text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">{content.services.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.services.items.map((item) => (
              <div
                key={item.title}
                className="bg-surface-elevated border border-white/5 rounded-2xl p-6 hover:border-brand-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-900/40 flex items-center justify-center mb-4 group-hover:bg-brand-800/40 transition-colors">
                  <svg className="w-5 h-5 text-brand-300" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24 px-4 bg-surface-elevated">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">{content.experience.title}</h2>
          <div className="space-y-10">
            {content.experience.items.map((item) => (
              <div key={item.role} className="relative pl-8 border-l-2 border-brand-700/40">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-600 border-4 border-surface-elevated" />
                <h3 className="text-xl font-semibold text-white">{item.role}</h3>
                <p className="text-brand-300 text-sm mb-1">{item.company}</p>
                <p className="text-gray-500 text-sm mb-3">{item.period}</p>
                <ul className="space-y-1.5">
                  {item.bullets.map((b, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                      <span className="text-brand-500 mt-1.5">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">{content.testimonials.title}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {content.testimonials.items.map((t) => (
              <div key={t.author} className="bg-surface-elevated border border-white/5 rounded-2xl p-6">
                <p className="text-gray-300 text-sm italic mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{t.author}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-24 px-4 bg-surface-elevated">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">{content.portfolio.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.portfolio.items.map((item) => (
              <div
                key={item.doc}
                className="bg-black/30 border border-white/5 rounded-2xl p-6 hover:border-brand-500/30 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-900/40 flex items-center justify-center mb-4 group-hover:bg-brand-800/40 transition-colors">
                  <svg className="w-6 h-6 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{item.subtitle}</p>
                <span className="text-brand-400 text-sm font-medium">{content.portfolio.actionText} →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{content.contact.title}</h2>
            <p className="text-brand-300 text-lg">{content.contact.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-gray-300 leading-relaxed mb-6">{content.contact.description}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {content.contact.location}
                </div>
                <a
                  href={content.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.839c-2.775 0-5.032 2.257-5.032 5.032 0 2.775 2.257 5.032 5.032 5.032 2.775 0 5.032-2.257 5.032-5.032 0-2.775-2.257-5.032-5.032-5.032zm0 9.34c-2.374 0-4.308-1.934-4.308-4.308 0-2.374 1.934-4.308 4.308-4.308 2.374 0 4.308 1.934 4.308 4.308 0 2.374-1.934 4.308-4.308 4.308z" />
                  </svg>
                  {content.contact.whatsappText}
                </a>
              </div>
            </div>
            <form className="space-y-4">
              <input
                type="text"
                placeholder={content.contact.form.namePlaceholder}
                className="w-full px-4 py-3 bg-surface-elevated border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <input
                type="email"
                placeholder={content.contact.form.emailPlaceholder}
                className="w-full px-4 py-3 bg-surface-elevated border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <select className="w-full px-4 py-3 bg-surface-elevated border border-white/10 rounded-lg text-gray-300 focus:outline-none focus:border-brand-500 transition-colors">
                {locales.shared.inquiryOptions.map((opt: {value: string, key: string}) => (
                  <option key={opt.value} value={opt.value}>
                    {content.contact.form.inquiryLabels[opt.value as keyof typeof content.contact.form.inquiryLabels]}
                  </option>
                ))}
              </select>
              <textarea
                rows={4}
                placeholder={content.contact.form.messagePlaceholder}
                className="w-full px-4 py-3 bg-surface-elevated border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-all"
              >
                {content.contact.form.submitLabel}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-xl font-bold text-white mb-2">
              <span className="text-brand-400">{content.logoText}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{content.footer.description}</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{content.footer.quickLinks}</h4>
            <div className="space-y-2">
              {locales.shared.navIds.map((id) => (
                <a key={id} href={`#${id}`} className="block text-gray-400 text-sm hover:text-brand-300 transition-colors">
                  {(content.nav as Record<string, string>)[id]}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{content.footer.connect}</h4>
            <a
              href={siteConfig.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-400 text-sm hover:text-brand-300 transition-colors"
            >
              LinkedIn
            </a>
            <p className="text-gray-500 text-sm mt-4">{content.footer.tagline}</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/5 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} {siteConfig.siteName}. {content.footer.rights}
        </div>
      </footer>
    </>
  );
}
