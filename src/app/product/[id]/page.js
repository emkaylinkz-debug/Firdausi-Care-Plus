"use client";

import { useEffect, useState, use } from "react"; // Added 'use' for params
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header/Header";
import styles from "../product.module.css";
import Image from "next/image";
import {
  MessageCircle,
  ArrowLeft,
  Package,
  Loader2,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function ProductDetail({ params: paramsPromise }) {
  // In Next.js 15+, params is a Promise that must be unwrapped
  const params = use(paramsPromise);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProduct() {
      if (!params?.id) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error) {
        setProduct(data);
      }
      setLoading(false);
    }
    getProduct();
  }, [params?.id]);

  if (loading)
    return (
      <div className={styles.loader}>
        <Loader2 className="animate-spin" size={40} color="#059669" />
      </div>
    );

  if (!product) return <div className={styles.error}>Product not found.</div>;

  return (
    <div className={styles.main}>
      <Header isOpen={true} />
      <div className={styles.container}>
        <Link href="/catalog" className={styles.backBtn}>
          <ArrowLeft size={18} /> Back to Catalog
        </Link>

        <div className={styles.productWrapper}>
          {/* LEFT SIDE: IMAGE */}
          <div className={styles.imageSection}>
            <div className={styles.imageRelativeContainer}>
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className={styles.mainImg}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className={styles.noImg}>
                  <ImageIcon size={64} color="#cbd5e1" />
                  <p>No Image Available</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: DETAILS */}
          <div className={styles.details}>
            <span className={styles.categoryBadge}>{product.category}</span>
            <h1 className={styles.title}>{product.name}</h1>

            <div
              className={
                product.quantity > 0 ? styles.stockIn : styles.stockOut
              }
            >
              <Package size={20} />
              <span>
                {product.quantity > 0
                  ? `${product.quantity} units available`
                  : "Out of Stock"}
              </span>
            </div>

            <p className={styles.price}>₦{product.price.toLocaleString()}</p>

            {/* DESCRIPTION SECTION */}
            <div className={styles.descriptionBox}>
              <h3 className={styles.descTitle}>
                <FileText size={18} /> Product Description
              </h3>
              <p className={styles.descText}>
                {product.description ||
                  "No specific instructions provided. Please consult our pharmacist for usage details."}
              </p>
            </div>

            <div className={styles.actionArea}>
              <a
                href={`https://wa.me/2348032275203?text=I am interested in buying ${product.name}`}
                className={styles.waBtn}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={24} /> Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
