"use client";
import { useState } from "react"; // Added useState
import Link from "next/link";
import styles from "./Header.module.css";
import { Pill, Menu, X } from "lucide-react"; // Added Menu and X icons

export default function Header({ isOpen, closeReason }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo Section */}
        <Link href="/" className={styles.logoArea}>
          <Pill className={styles.icon} color="#059669" size={28} />
          <span className={styles.logoText}>Firdausi Care Plus</span>
        </Link>

        {/* Hamburger Button - Only visible on mobile */}
        <button
          className={styles.menuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation Links - Toggle active class on mobile */}
        <nav
          className={`${styles.navLinks} ${
            isMobileMenuOpen ? styles.navActive : ""
          }`}
        >
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="/catalog" onClick={() => setIsMobileMenuOpen(false)}>
            Products
          </Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
            About Us
          </Link>
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
            Contact
          </Link>
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
          <span className={styles.statusText}>
            {isOpen ? "OPEN NOW" : `CLOSED: ${closeReason}`}
          </span>
        </div>
      </div>
    </header>
  );
}
