import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { DATASET, TEAM } from "@/lib/credits";

type Copy = Dictionary["footer"] & { designSystem: string };

const heading =
  "font-mono text-xs font-bold tracking-[0.25em] text-ink uppercase";
const link =
  "rounded-sm underline decoration-2 underline-offset-4 transition-colors hover:bg-highlight";

/**
 * The footer on every page: who made Legoin, the dataset credit that CC BY 4.0
 * asks for, and the notes on AI-made sample photos and the LEGO trademark.
 */
export function SiteFooter({ copy, locale }: { copy: Copy; locale: Locale }) {
  return (
    <footer className="border-t-[2.5px] border-ink bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 text-sm sm:px-6 md:grid-cols-3">
        <section aria-labelledby="footer-team">
          <Logo />
          <h2 id="footer-team" className={`${heading} mt-6`}>
            {copy.team.title}
          </h2>
          <p className="mt-2">
            {fill(copy.team.body, { team: TEAM.name, course: TEAM.course })}
          </p>
          <ul className="mt-3 space-y-1 text-ink-secondary">
            {TEAM.members.map((member) => (
              <li key={member}>{member}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="footer-dataset">
          <h2 id="footer-dataset" className={heading}>
            {copy.dataset.title}
          </h2>
          <p className="mt-2">{copy.dataset.body}</p>
          <p className="mt-2 text-ink-secondary">
            {DATASET.authors} ({DATASET.year}). <cite>{DATASET.title}</cite>.{" "}
            {DATASET.publisher}.{" "}
            <a href={DATASET.url} className={`${link} break-words text-ink`}>
              {DATASET.url}
            </a>
          </p>
          <p className="mt-2">
            {copy.dataset.license}{" "}
            <a href={DATASET.licenseUrl} rel="license" className={link}>
              {DATASET.license}
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="footer-notes">
          <h2 id="footer-notes" className={heading}>
            {copy.notes.title}
          </h2>
          <p className="mt-2">{copy.notes.photos}</p>
          <p className="mt-2">{copy.notes.trademark}</p>
          <p className="mt-6">
            <Link href={`/${locale}/desain`} className={link}>
              {copy.designSystem}
            </Link>
          </p>
        </section>
      </div>
    </footer>
  );
}
