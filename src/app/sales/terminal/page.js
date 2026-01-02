"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./terminal.module.css";

export default function SalesTerminal() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // ✅ Sales statistics
  const [stats, setStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });

  // ✅ Declare FIRST
  async function fetchInitialData() {
    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();

    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    ).toISOString();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const [prodRes, salesRes, storeRes, dailyRes, weeklyRes, monthlyRes] =
      await Promise.all([
        supabase.from("products").select("*").order("name"),
        supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("store_settings").select("*").single(),

        supabase
          .from("sales")
          .select("total_price")
          .gte("created_at", startOfDay)
          .eq("status", "completed"),

        supabase
          .from("sales")
          .select("total_price")
          .gte("created_at", startOfWeek)
          .eq("status", "completed"),

        supabase
          .from("sales")
          .select("total_price")
          .gte("created_at", startOfMonth)
          .eq("status", "completed"),
      ]);

    const calc = (arr) =>
      arr?.reduce((sum, row) => sum + Number(row.total_price), 0) || 0;

    setStats({
      daily: calc(dailyRes.data),
      weekly: calc(weeklyRes.data),
      monthly: calc(monthlyRes.data),
    });

    setProducts(prodRes.data || []);
    setSales(salesRes.data || []);
    setIsStoreOpen(storeRes.data?.is_open ?? true);
    setLoading(false);
  }

  // ✅ Safe now
  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!ignore) {
        await fetchInitialData();
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSale = async (product) => {
    if (product.quantity <= 0) return alert("Out of stock!");

    const { error } = await supabase.from("sales").insert([
      {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        total_price: product.price,
        status: "completed",
      },
    ]);

    if (!error) {
      await supabase.rpc("decrement_inventory", {
        product_id_input: product.id,
        quantity_sold_input: 1,
      });
      fetchInitialData();
    }
  };

  const handleRedo = async (sale) => {
    if (sale.status === "voided") return;

    const { error } = await supabase
      .from("sales")
      .update({ status: "voided" })
      .eq("id", sale.id);

    if (!error) {
      await supabase.rpc("increment_inventory", {
        product_id_input: sale.product_id,
        quantity_sold_input: sale.quantity,
      });
      fetchInitialData();
    }
  };

  const toggleInStock = async (product) => {
    await supabase
      .from("products")
      .update({ in_stock: !product.in_stock })
      .eq("id", product.id);

    fetchInitialData();
  };

  const toggleStore = async () => {
    const newStatus = !isStoreOpen;
    const reason = newStatus ? "Open" : prompt("Reason for closure?");
    await supabase
      .from("store_settings")
      .update({ is_open: newStatus, close_reason: reason })
      .eq("id", 1);

    setIsStoreOpen(newStatus);
  };

  if (loading) return <div className={styles.loading}>Initializing POS...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <input
          type="text"
          placeholder="Search products..."
          className={styles.searchBar}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={toggleStore}
          className={isStoreOpen ? styles.btnOpen : styles.btnClose}
        >
          Store: {isStoreOpen ? "OPEN" : "CLOSED"}
        </button>
      </header>

      {/* ✅ Sales summary */}
      <div className={styles.statsBar}>
        <span>Today: ₦{stats.daily}</span>
        <span>This Week: ₦{stats.weekly}</span>
        <span>This Month: ₦{stats.monthly}</span>
      </div>

      <div className={styles.mainGrid}>
        <section>
          <h2>Inventory Management</h2>
          <div className={styles.productGrid}>
            {filteredProducts.map((p) => (
              <div key={p.id} className={styles.card}>
                <strong>{p.name}</strong>
                <span>
                  ₦{p.price} | Stock: {p.quantity}
                </span>
                <button onClick={() => handleSale(p)}>SOLD</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
