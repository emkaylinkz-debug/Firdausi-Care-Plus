"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import { Pill, Menu, X } from "lucide-react";

export default function Header({ isOpen, closeReason }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to close menu when a link is clicked
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo Section */}
        <Link href="/" className={styles.logoArea} onClick={closeMenu}>
          <Pill className={styles.icon} color="#059669" size={28} />
          <span className={styles.logoText}>Firdausi Care Plus</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className={styles.menuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>

        {/* Navigation Links */}
        <nav
          className={`${styles.navLinks} ${
            isMobileMenuOpen ? styles.navActive : ""
          }`}
        >
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>
          <Link href="/catalog" onClick={closeMenu}>
            Products
          </Link>
          <Link href="/about" onClick={closeMenu}>
            About Us
          </Link>
          <Link href="/contact" onClick={closeMenu}>
            Contact
          </Link>

          {/* Status visible inside mobile menu only when menu is open */}
          <div
            className={`${styles.mobileStatus} ${
              isOpen ? styles.open : styles.closed
            }`}
          >
            {isOpen ? "● STORE OPEN" : `● CLOSED: ${closeReason}`}
          </div>
        </nav>

        {/* Desktop Status Indicator */}
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
          <span className={styles.statusLabel}>
            {isOpen ? "OPEN NOW" : `CLOSED: ${closeReason}`}
          </span>
        </div>
      </div>
    </header>
  );
}
