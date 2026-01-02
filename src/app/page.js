"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldAlert,
  MapPin,
  MessageCircle,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeStatus, setStoreStatus] = useState({
    is_open: true,
    close_reason: "",
  });

  useEffect(() => {
    async function fetchData() {
      const { data: status } = await supabase
        .from("store_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (status) setStoreStatus(status);

      const { data: items } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (items) setProducts(items);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className={styles.main}>
      <Header
        isOpen={storeStatus.is_open}
        closeReason={storeStatus.close_reason}
      />

      {/* HERO SECTION - Now Full Impact */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1>
            Firdausi Care Plus
            <br />
            Live Inventory.
          </h1>
          <p>
            Know your budget before you leave home. We provide real-time updates
            on medicine availability in store.
          </p>
          <Link href="/catalog" className={styles.btnPrimary}>
            Browse Full Catalog
          </Link>
        </div>
      </section>

      {/* HEALTH AWARENESS */}
      <div className={styles.container}>
        <div className={styles.awarenessCard}>
          <ShieldAlert size={48} color="#f43f5e" />
          <div>
            <h3>Critical Health Awareness</h3>
            <p>
              Experiencing chest pain or shortness of breath?
              <strong> Please see a doctor immediately.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* RECENT PRODUCTS - Full Image Cards */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Recently Restocked</h2>
            <Link
              href="/catalog"
              style={{
                color: "#059669",
                fontWeight: "bold",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              View All <ChevronRight size={18} />
            </Link>
          </div>

          <div className={styles.grid}>
            {loading ? (
              <div className={styles.loaderCenter}>
                <Loader2 className="animate-spin" size={50} color="#059669" />
              </div>
            ) : (
              products.map((product) => (
                <Link
                  href={`/product/${product.id}`}
                  key={product.id}
                  className={styles.card}
                >
                  <div className={styles.cardImage}>
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          color: "#cbd5e1",
                        }}
                      >
                        <ImageIcon size={48} />
                        <span>No Photo Available</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.categoryBadge}>{product.category}</p>
                    <h4>{product.name}</h4>
                    <div className={styles.cardFooter}>
                      <span className={styles.priceTag}>
                        ₦{product.price.toLocaleString()}
                      </span>
                      <span className={styles.stockBadge}>
                        {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div>
              <h4 className={styles.footerTitle}>Firdausi Care Plus</h4>
              <p style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <MapPin size={20} /> Malali New Layout, Kaduna.
              </p>
              <p style={{ display: "flex", gap: "10px" }}>
                <MessageCircle size={20} /> WhatsApp Enquiry
              </p>
            </div>

            <div>
              <h4 className={styles.footerTitle}>Quick Links</h4>
              <ul style={{ listStyle: "none", padding: 0, lineHeight: "2" }}>
                <li>
                  <Link
                    href="/catalog"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    All Medicines
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin"
                    style={{
                      color: "#059669",
                      textDecoration: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Staff Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div className={styles.transportNote}>
              <h4 style={{ color: "#6ee7b7", marginBottom: "10px" }}>
                💡 Transport Savings
              </h4>
              <p>
                Verify stock online before traveling to ensure your medication
                is ready for pickup.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
