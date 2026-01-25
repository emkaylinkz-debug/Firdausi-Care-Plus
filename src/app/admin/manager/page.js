"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./manager.module.css";
import {
  Search,
  RotateCcw,
  Printer,
  LogOut,
  User,
  Phone,
  AlertCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function SalesManager() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sellQuantities, setSellQuantities] = useState({});
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    payment: "Cash",
  });
  const [pendingSale, setPendingSale] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        supabase.from("products").select("*").order("name"),
        supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      setProducts(pRes.data || []);
      setSales(sRes.data || []);
    } catch (e) {
      console.error("Load Error:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: sRes } = await supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false });
        setSales(sRes.data || []);
      } catch (e) {
        console.error("Load Error:", e);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleSell = async () => {
    if (!pendingSale) return;
    const qty = sellQuantities[pendingSale.id] || 1;
    const receiptNo = `RCP-${Math.floor(1000 + Math.random() * 9000)}`;

    // MATCHES YOUR SCHEMA EXACTLY: Removed unit_price
    const { error } = await supabase.from("sales").insert([
      {
        product_id: pendingSale.id,
        product_name: pendingSale.name,
        quantity: qty,
        total_price: pendingSale.price * qty, // Uses price from product
        receipt_no: receiptNo,
        customer_name: customer.name,
        customer_phone: customer.phone,
        payment_method: customer.payment,
        status: "completed",
      },
    ]);

    if (error) {
      alert("DATABASE ERROR: " + error.message);
      console.error(error);
    } else {
      // Update stock
      await supabase
        .from("products")
        .update({ quantity: pendingSale.quantity - qty })
        .eq("id", pendingSale.id);

      alert("Sale Successful! Receipt #" + receiptNo);
      setPendingSale(null);
      loadData();
    }
  };

  const handleRefund = async (sale) => {
    if (!confirm("Proceed with refund?")) return;

    // 1. Update Sale Status
    const { error } = await supabase
      .from("sales")
      .update({ is_refunded: true })
      .eq("id", sale.id);

    if (error) {
      alert("Refund Failed: " + error.message);
    } else {
      // 2. Put stock back
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
      }
      alert("Refund Processed.");
      loadData();
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Connecting to Firdausi Database...</div>;

  return (
    <div className={styles.container}>
      {/* CONFIRMATION MODAL */}
      {pendingSale && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <AlertCircle size={40} color="#3b82f6" />
            <h3>Confirm Sale?</h3>
            <p>
              Sell {sellQuantities[pendingSale.id] || 1} of {pendingSale.name}?
            </p>
            <div className={styles.modalBtns}>
              <button onClick={handleSell} className={styles.confirmBtn}>
                Confirm
              </button>
              <button
                onClick={() => setPendingSale(null)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <h2>Sales Terminal</h2>
        <div className={styles.customerBox}>
          <input
            placeholder="Customer Name"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={customer.phone}
            onChange={(e) =>
              setCustomer({ ...customer, phone: e.target.value })
            }
          />
        </div>
      </header>

      <div className={styles.mainGrid}>
        <section className={styles.card}>
          <div className={styles.searchBox}>
            <input
              placeholder="Search products..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Stock</th>
                <th>Qty</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <input
                      type="number"
                      className={styles.qtyInput}
                      defaultValue="1"
                      onChange={(e) =>
                        setSellQuantities({
                          ...sellQuantities,
                          [p.id]: parseInt(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => setPendingSale(p)}
                      className={styles.sellBtn}
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.card}>
          <h3>History (Refunds)</h3>
          {sales.map((s) => (
            <div
              key={s.id}
              className={styles.historyItem}
              style={{ opacity: s.is_refunded ? 0.5 : 1 }}
            >
              <div>
                <strong>{s.product_name}</strong>
                <br />
                <small>{s.receipt_no}</small>
              </div>
              <div>
                <span>₦{s.total_price.toLocaleString()}</span>
                {!s.is_refunded && (
                  <button
                    onClick={() => handleRefund(s)}
                    className={styles.refundBtn}
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
