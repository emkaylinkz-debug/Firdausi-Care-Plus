import styles from "./about.module.css";
import Header from "@/components/Header/Header";
import Image from "next/image";
import { UserCheck, Store, Award } from "lucide-react";

export default function AboutPage() {
  const isOpen = true;
  const closeReason = "Closed for Prayer";

  return (
    <div className={styles.main}>
      <Header isOpen={isOpen} closeReason={closeReason} />

      <div className={styles.container}>
        {/* Title Section */}
        <div className={styles.headerTitle}>
          <h1>About Firdausi Pharmacy</h1>
          <p>Dedicated to health, integrity, and community service.</p>
        </div>

        {/* Section 1: The Pharmacist */}
        <section className={styles.section}>
          <div className={styles.textContent}>
            <h2>
              <UserCheck color="#059669" /> Meet Our Pharmacist
            </h2>
            <p>
              Pharm. Firdausi is a dedicated healthcare professional with a
              passion for patient well-being. With years of experience in
              pharmaceutical care, she founded{" "}
              <strong>Firdausi Pharmacy Enterprise</strong>
              to bridge the gap between quality medication and community
              accessibility.
            </p>
            <p style={{ marginTop: "15px" }}>
              She believes that a pharmacist is not just a dispenser of
              medicine, but a trusted counselor and a vital part of the
              healthcare journey.
            </p>
          </div>

          <div className={styles.imageCard}>
            <Image
              src="/firdausi.png"
              alt="Pharm. Firdausi"
              width={400}
              height={400}
              className={styles.displayImage}
              priority
            />
            <div className={styles.caption}>
              Pharm. Firdausi - Lead Pharmacist
            </div>
          </div>
        </section>

        {/* Section 2: The Store */}
        <section className={`${styles.section} ${styles.reverse}`}>
          <div className={styles.imageCard}>
            <Image
              src="/store.jpg"
              alt="Firdausi Pharmacy Interior"
              width={500}
              height={350}
              className={styles.displayImage}
            />
            <div className={styles.caption}>Our Modern Facility</div>
          </div>

          <div className={styles.textContent}>
            <h2>
              <Store color="#059669" /> Our Local Mission
            </h2>
            <p>
              Located in the heart of our community, Firdausi Pharmacy is more
              than just a shop. We are a technology-forward health hub.
            </p>
            <p style={{ marginTop: "15px" }}>
              We maintain a wide range of essential medications, supplements,
              and personal care items in a temperature-controlled environment.
            </p>
          </div>
        </section>

        {/* Section 3: License */}
        <section className={styles.licenseSection}>
          <div className={styles.textContent} style={{ textAlign: "center" }}>
            <h2 style={{ justifyContent: "center" }}>
              <Award color="#059669" /> Fully Licensed & Regulated
            </h2>
            <p>
              Your safety is our priority. Firdausi Pharmacy operates under
              strict regulatory guidelines.
            </p>
          </div>

          <div className={`${styles.imageCard} ${styles.licenseCard}`}>
            <Image
              src="/license.jpg"
              alt="Pharmacist License"
              width={350}
              height={450}
              className={styles.displayImage}
            />
            <div className={styles.caption}>Official Practice License</div>
          </div>

          <p
            style={{ marginTop: "20px", fontSize: "0.8rem", color: "#64748b" }}
          >
            License issued for the current calendar year.
          </p>
        </section>
      </div>
    </div>
  );
}
