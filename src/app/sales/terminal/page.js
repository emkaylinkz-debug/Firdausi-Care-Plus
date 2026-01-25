"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./terminal.module.css";
import {
  Search,
  RotateCcw,
  User,
  Phone,
  CreditCard,
  Banknote,
  CheckCircle2,
  Loader2,
  ShoppingCart,
} from "lucide-react";

export default function SalesTerminal() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(0);

  const [sellQuantities, setSellQuantities] = useState({});
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    payment: "Cash",
  });
  const [pendingSale, setPendingSale] = useState(null);
  const [stats, setStats] = useState({ daily: 0, monthly: 0 });

  // 1. DATA FETCHING (Unified & Optimized)
  useEffect(() => {
    let isMounted = true;
    async function loadAllData() {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).toISOString();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();

      const [prodRes, salesRes, dailyRes, monthlyRes] = await Promise.all([
        supabase.from("products").select("*").order("name"),
        supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("sales")
          .select("total_price")
          .gte("created_at", startOfDay)
          .eq("is_refunded", false),
        supabase
          .from("sales")
          .select("total_price")
          .gte("created_at", startOfMonth)
          .eq("is_refunded", false),
      ]);

      if (!isMounted) return;
      const calc = (arr) =>
        arr?.reduce((sum, row) => sum + Number(row.total_price), 0) || 0;

      setStats({ daily: calc(dailyRes.data), monthly: calc(monthlyRes.data) });
      setProducts(prodRes.data || []);
      setSales(salesRes.data || []);
      setLoading(false);
    }
    loadAllData();
    return () => {
      isMounted = false;
    };
  }, [refreshToggle]);

  const triggerRefresh = () => setRefreshToggle((p) => p + 1);

  // 2. CONFIRM SALE
  const handleConfirmSale = async () => {
    if (!customer.name.trim() && !customer.phone.trim()) {
      alert("⚠️ Mandatory: Please enter Customer Name or Phone Number.");
      return;
    }

    const qty = sellQuantities[pendingSale.id] || 1;
    const receiptNo = `RCP-${Math.floor(10000 + Math.random() * 90000)}`;

    const { error: saleError } = await supabase.from("sales").insert([
      {
        product_id: pendingSale.id,
        product_name: pendingSale.name,
        quantity: qty,
        total_price: pendingSale.price * qty,
        receipt_no: receiptNo,
        customer_name: customer.name || "N/A",
        customer_phone: customer.phone || "N/A",
        payment_method: customer.payment,
        status: "completed",
        is_refunded: false,
      },
    ]);

    if (!saleError) {
      await supabase
        .from("products")
        .update({ quantity: pendingSale.quantity - qty })
        .eq("id", pendingSale.id);
      alert("✅ Sale Completed!");
      setPendingSale(null);
      setCustomer({ name: "", phone: "", payment: "Cash" });
      triggerRefresh();
    }
  };

  // 3. REFUND LOGIC (Restored & Fixed)
  const handleRefund = async (sale) => {
    if (!confirm(`Are you sure you want to refund ${sale.product_name}?`))
      return;

    const { error } = await supabase
      .from("sales")
      .update({ is_refunded: true, status: "refunded" })
      .eq("id", sale.id);

    if (!error) {
      const { data: p } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", sale.product_id)
        .single();
      if (p) {
        await supabase
          .from("products")
          .update({ quantity: p.quantity + sale.quantity })
          .eq("id", sale.product_id);
      }
      alert("Refund Successful. Stock restored.");
      triggerRefresh();
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className={styles.loading}>
        <Loader2 className="spin" /> Syncing...
      </div>
    );

  return (
    <div className={styles.container}>
      {/* MODAL */}
      {pendingSale && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <CheckCircle2 size={40} color="#10b981" />
            <h3>Complete Checkout</h3>
            <div className={styles.modalDetails}>
              <p>
                <strong>{pendingSale.name}</strong>
              </p>
              <p className={styles.modalPrice}>
                ₦
                {(
                  pendingSale.price * (sellQuantities[pendingSale.id] || 1)
                ).toLocaleString()}
              </p>
            </div>

            <div className={styles.payToggle}>
              <button
                className={customer.payment === "Cash" ? styles.activePay : ""}
                onClick={() => setCustomer({ ...customer, payment: "Cash" })}
              >
                <Banknote size={16} /> Cash
              </button>
              <button
                className={
                  customer.payment === "Transfer" ? styles.activePay : ""
                }
                onClick={() =>
                  setCustomer({ ...customer, payment: "Transfer" })
                }
              >
                <CreditCard size={16} /> Transfer
              </button>
            </div>

            <div className={styles.modalBtns}>
              <button onClick={handleConfirmSale} className={styles.confirmBtn}>
                Process Sale
              </button>
              <button
                onClick={() => setPendingSale(null)}
                className={styles.cancelBtn}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1>Firdausi Terminal</h1>
          <div className={styles.search}>
            <Search size={18} />
            <input
              placeholder="Search products..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span>Today</span>
            <strong>₦{stats.daily.toLocaleString()}</strong>
          </div>
          <div className={styles.statBox}>
            <span>Monthly</span>
            <strong>₦{stats.monthly.toLocaleString()}</strong>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        {/* INVENTORY */}
        <section className={styles.main}>
          <div className={styles.customerBar}>
            <div className={styles.inputGroup}>
              <User size={16} />
              <input
                placeholder="Customer Name *"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <Phone size={16} />
              <input
                placeholder="Phone Number *"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className={styles.scrollArea}>
            <table className={styles.desktopTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Stock</th>
                  <th>Qty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className={p.quantity < 10 ? styles.low : ""}>
                      {p.quantity}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className={styles.qty}
                        defaultValue="1"
                        onChange={(e) =>
                          setSellQuantities({
                            ...sellQuantities,
                            [p.id]: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => setPendingSale(p)}
                        className={styles.sellBtn}
                      >
                        <ShoppingCart size={14} /> SELL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.mobileList}>
              {filteredProducts.map((p) => (
                <div key={p.id} className={styles.mobileCard}>
                  <div className={styles.mLeft}>
                    <strong>{p.name}</strong>
                    <span className={p.quantity < 10 ? styles.low : ""}>
                      Stock: {p.quantity}
                    </span>
                  </div>
                  <div className={styles.mRight}>
                    <input
                      type="number"
                      defaultValue="1"
                      onChange={(e) =>
                        setSellQuantities({
                          ...sellQuantities,
                          [p.id]: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                    <button onClick={() => setPendingSale(p)}>SELL</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HISTORY (Refund Button is here!) */}
        <aside className={styles.sidebar}>
          <h3>Recent Sales</h3>
          <div className={styles.historyList}>
            {sales.map((s) => (
              <div
                key={s.id}
                className={`${styles.hItem} ${s.is_refunded ? styles.refunded : ""}`}
              >
                <div className={styles.hInfo}>
                  <strong>{s.product_name}</strong>
                  <div className={styles.hBadges}>
                    <span
                      className={
                        s.payment_method === "Cash"
                          ? styles.cash
                          : styles.transfer
                      }
                    >
                      {s.payment_method}
                    </span>
                    <span className={styles.receipt}>{s.receipt_no}</span>
                  </div>
                </div>
                <div className={styles.hAction}>
                  <strong>₦{s.total_price.toLocaleString()}</strong>
                  {s.is_refunded ? (
                    <span className={styles.refundTag}>REFUNDED</span>
                  ) : (
                    <button
                      onClick={() => handleRefund(s)}
                      title="Refund Sale"
                      className={styles.refundBtn}
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
