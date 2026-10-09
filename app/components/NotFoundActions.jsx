
"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, House } from "lucide-react";

import styles from "@/app/not-found.module.css";

export default function NotFoundActions() {
  return (
    <div className={styles.actions}>
      <Link href="/" className={styles.primaryButton}>
        <House size={17} strokeWidth={2} />
        Back to home
        <ArrowUpRight size={16} className={styles.buttonArrow} />
      </Link>

      <button
        type="button"
        className={styles.secondaryButton}
        onClick={() => window.history.back()}
      >
        <ArrowLeft size={16} />
        Go back
      </button>
    </div>
  );
}