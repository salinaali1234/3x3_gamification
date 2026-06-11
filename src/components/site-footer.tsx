import Link from "next/link";
import { Logo3x3 } from "./logo";
import type { Locale } from "@/lib/i18n/config";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-white/10 bg-brand-black mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-6 md:grid-cols-3 text-sm">
        <div>
          <Logo3x3 />
          <p className="mt-3 text-white/50 max-w-xs">
            {locale === "nl"
              ? "Een gamification platform voor 3X3 Unites events. Mockup met dummy data."
              : "A gamification platform for 3X3 Unites events. Mockup with dummy data."}
          </p>
        </div>
        <div>
          <div className="brand-section-label mb-2">
            {locale === "nl" ? "Quick links" : "Quick links"}
          </div>
          <ul className="space-y-1 text-white/70">
            <li><Link href="/challenges" className="hover:text-brand-green">{locale === "nl" ? "Challenges" : "Challenges"}</Link></li>
            <li><Link href="/leaderboard" className="hover:text-brand-green">Leaderboard</Link></li>
            <li><Link href="/rewards" className="hover:text-brand-green">Street Pass</Link></li>
            <li><Link href="/faq" className="hover:text-brand-green">{locale === "nl" ? "FAQ & Regels" : "FAQ & Rules"}</Link></li>
          </ul>
        </div>
        <div>
          <div className="brand-section-label mb-2">3X3 UNITES</div>
          <p className="text-white/60">
            {locale === "nl"
              ? "Ontwikkeld als mockup. Gegevens zijn fictief."
              : "Built as a mockup. Data is fictional."}
          </p>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-white/40 font-mono uppercase tracking-widest flex justify-between">
          <span>3X3 UNITES // WORLD TOUR WEEKEND</span>
          <span>v0.1 mockup</span>
        </div>
      </div>
    </footer>
  );
}
