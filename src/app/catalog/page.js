"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header/Header";
import styles from "./catalog.module.css";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  Loader2,
  Image as ImageIcon,
  ChevronRight,
  Database,
} from "lucide-react";

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [storeStatus, setStoreStatus] = useState({
    is_open: true,
    close_reason: "",
  });

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Store Status for the Header
      const { data: status } = await supabase
        .from("store_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (status) setStoreStatus(status);

      // 2. Fetch All Products
      const { data: items } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (items) setProducts(items);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter Logic: Search + Category
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for the filter buttons
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  return (
    <div className={styles.main}>
      <Header
        isOpen={storeStatus.is_open}
        closeReason={storeStatus.close_reason}
      />

      <section className={styles.catalogHero}>
        <div className={styles.container}>
          <h1>Medicine Catalog</h1>
          <p>Browse our current inventory in store.</p>

          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search for Paracetamol, Amoxicillin, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className={styles.container}>
        {/* Category Filters */}
        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>
            <Filter size={18} /> <span>Filter by Category:</span>
          </div>
          <div className={styles.categoryList}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={
                  selectedCategory === cat ? styles.catBtnActive : styles.catBtn
                }
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className={styles.grid}>
          {loading ? (
            <div className={styles.loaderCenter}>
              <Loader2 className="animate-spin" size={50} color="#059669" />
              <p>Loading Inventory...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
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
                    <div className={styles.placeholderImg}>
                      <ImageIcon size={40} />
                      <span>No Photo</span>
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
                    <span
                      className={
                        product.quantity > 0 ? styles.inStock : styles.outStock
                      }
                    >
                      {product.quantity > 0
                        ? `${product.quantity} Left`
                        : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.noResults}>
              <Database size={48} />
              <h3>No matching medicines found.</h3>
              <p>
                Try searching for something else or contact us via WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
