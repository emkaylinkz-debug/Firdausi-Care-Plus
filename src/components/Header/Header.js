import Link from "next/link";
import styles from "./Header.module.css";
import { Pill } from "lucide-react";

export default function Header({ isOpen, closeReason }) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo Section */}
        <Link href="/" className={styles.logoArea}>
          <Pill className={styles.icon} color="#059669" size={28} />
          <span className={styles.logoText}>Firdausi Care Plus</span>
        </Link>

        {/* Navigation Links */}
        <nav className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/catalog">Products</Link>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* Live Status Indicator */}
        <div
          className={`${styles.statusBadge} ${
            isOpen ? styles.open : styles.closed
          }`}
        >
          <span
            className={`${styles.dot} ${
              isOpen ? styles.dotOpen : styles.dotClosed
            }`}
          ></span>
          {isOpen ? "OPEN NOW" : `CLOSED: ${closeReason}`}
        </div>
      </div>
    </header>
  );
}
