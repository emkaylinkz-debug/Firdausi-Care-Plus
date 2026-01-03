"use client";
import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { supabase } from "@/lib/supabase";
import styles from "./manager.module.css";
import { Search, ShoppingCart, RotateCcw, Printer, LogOut } from "lucide-react";

export default function SalesManager() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sellQuantities, setSellQuantities] = useState({});

  // FIX: Define loadData BEFORE useEffect
  // Use useCallback to prevent unnecessary re-renders
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, salesRes] = await Promise.all([
        supabase.from("products").select("*").order("name"),
        supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      setProducts(prodRes.data || []);
      setSales(salesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]); // This is now safe and error-free

  const handleQtyChange = (productId, val) => {
    setSellQuantities({ ...sellQuantities, [productId]: parseInt(val) || 1 });
  };

  const handleSell = async (product) => {
    const qty = sellQuantities[product.id] || 1;
    if (product.quantity < qty) return alert("Not enough stock!");

    const { error: saleError } = await supabase.from("sales").insert([
      {
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        total_price: product.price * qty,
      },
    ]);

    if (!saleError) {
      await supabase
        .from("products")
        .update({ quantity: product.quantity - qty })
        .eq("id", product.id);
      loadData();
      alert("Sold successfully!");
    }
  };

  const handleRefund = async (sale) => {
    if (!confirm("Process refund?")) return;
    const { data: prod } = await supabase
      .from("products")
      .select("quantity")
      .eq("id", sale.product_id)
      .single();
    if (prod) {
      await supabase
        .from("products")
        .update({ quantity: prod.quantity + sale.quantity })
        .eq("id", sale.product_id);
      await supabase.from("sales").delete().eq("id", sale.id);
      loadData();
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Sales Manager</h2>
        <button onClick={() => window.print()} className={styles.printBtn}>
          <Printer size={18} /> Print (PDF)
        </button>
      </header>

      <main className={styles.mainGrid}>
        <section className={styles.card}>
          <h3>Inventory</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th> {/* Row Number Header */}
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Qty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, index) => (
                  <tr key={p.id}>
                    <td>{index + 1}</td> {/* This gives you the row number */}
                    <td>{p.name}</td>
                    <td>{p.quantity}</td>
                    <td>
                      <input
                        type="number"
                        className={styles.qtyInput}
                        value={sellQuantities[p.id] || 1}
                        onChange={(e) => handleQtyChange(p.id, e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleSell(p)}
                        className={styles.sellBtn}
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.card}>
          <h3>Sales History</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s, index) => (
                  <tr key={s.id}>
                    <td>{index + 1}</td>
                    <td>{s.product_name}</td>
                    <td>₦{s.total_price.toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => handleRefund(s)}
                        className={styles.refundBtn}
                      >
                        <RotateCcw size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
