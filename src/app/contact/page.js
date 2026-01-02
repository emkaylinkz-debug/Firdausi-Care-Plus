import styles from "./contact.module.css";
import Header from "@/components/Header/Header";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const isOpen = true;
  const closeReason = "Closed for Prayer";

  return (
    <div className={styles.main}>
      <Header isOpen={isOpen} closeReason={closeReason} />

      <div className={styles.container}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ color: "#065f46", fontSize: "2.5rem" }}>Get in Touch</h1>
          <p style={{ color: "#64748b" }}>
            Have a question about a medication? We&apos;re here to help.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Left Side: Contact Information */}
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <h4>
                <MapPin size={20} /> Our Location
              </h4>
              <p>
                Community Market Road, Block B, Suite 4<br />
                Your City, State
              </p>
            </div>

            <div className={styles.infoCard}>
              <h4>
                <Phone size={20} /> Phone & WhatsApp
              </h4>
              <p>
                Main: +234 800 000 0000
                <br />
                WhatsApp: +234 800 000 0000
              </p>
            </div>

            <div className={styles.infoCard}>
              <h4>
                <Mail size={20} /> Email Us
              </h4>
              <p>
                info@firdausipharmacy.com
                <br />
                support@firdausipharmacy.com
              </p>
            </div>

            <a
              href="https://wa.me/2348000000000"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                backgroundColor: "#25D366",
                color: "white",
                padding: "15px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              <MessageCircle size={20} /> Chat on WhatsApp
            </a>
          </div>

          {/* Right Side: Contact Form */}
          <div className={styles.formCard}>
            <form>
              <div className={styles.formGroup}>
                <label>Your Full Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Your Message</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Ask about a drug, price, or availability..."
                  required
                ></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                <Send
                  size={18}
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
