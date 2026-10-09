
import Link from "next/link";
import NotFoundActions from "@/app/components/NotFoundActions";
import { Search } from "lucide-react";

import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main
      className={styles.page}
      data-page-status="404"
      aria-labelledby="not-found-title"
    >
      <div className={styles.ambient} aria-hidden="true">
        <div className={styles.orb} />
        <div className={styles.grid} />
      </div>

      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label="Goaliq home">
            <span className={styles.brandMark}>G</span>
            <span>GOALIQ</span>
          </Link>

          <span className={styles.headerLabel}>
            <span className={styles.liveDot} />
            THE BEAUTIFUL GAME
          </span>
        </header>

        <section className={styles.content}>
          <div className={styles.visual} aria-hidden="true">
            <div className={styles.visualGlow} />
            <div className={styles.ballOrbit}>
              <div className={styles.ball}>
                <svg viewBox="0 0 100 100" fill="none">
                  <circle
                    cx="50"
                    cy="50"
                    r="43"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M50 31 67 43 61 63H39L33 43 50 31Z"
                    fill="currentColor"
                  />
                  <path
                    d="m50 31 5-18M67 43l17-5M61 63l10 15M39 63 29 78M33 43 16 38M33 43l-17-5M39 63l-10 15M61 63l10 15M67 43l17-5M50 31l-5-18M50 31l17 12M33 43l17-12M39 63l-6-20M61 63l6-20M39 63h22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className={styles.orbitRing} />
              <span className={styles.orbitRingSecondary} />
            </div>

            <div className={styles.errorCode}>404</div>
            <span className={styles.visualCaption}>
              OUT OF PLAY <span>•</span> NO ROUTE FOUND
            </span>
          </div>

          <div className={styles.copy}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              WRONG TURN
            </div>

            <h1 id="not-found-title" className={styles.title}>
              Looks like
              <br />
              you&apos;re <span>offside.</span>
            </h1>

            <p className={styles.description}>
              This page has left the pitch. The link may be outdated, or the
              address might have a typo. Let&apos;s get you back in the game.
            </p>

            <NotFoundActions />

            <div className={styles.help}>
              <span className={styles.helpIcon}>
                <Search size={15} />
              </span>
              <p>
                Looking for a match? Head home and explore the latest fixtures
                and scores.
              </p>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>GOALIQ</span>
          <span className={styles.footerDivider} />
          <span>Every match. Every moment.</span>
          <span className={styles.footerStatus}>
            <span /> HTTP 404
          </span>
        </footer>
      </div>
    </main>
  );
}