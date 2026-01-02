"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./manager.module.css";
import {
  TrendingUp,
  PlusCircle,
  FileText,
  Loader2,
  CheckCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function StaffManager() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  // FIX 1: Start loading as 'true' so we don't call setLoading(true) in the effect
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [saleQty, setSaleQty] = useState(1);

  // FIX 2: Define and call the fetcher inside the useEffect
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: prodData } = await supabase.from("products").select("*");
        const { data: salesData } = await supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false });

        setProducts(prodData || []);
        setSales(salesData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false); // Turn off loading only after data arrives
      }
    }

    loadDashboardData();
  }, []);

  // RECORD A SALE
  async function handleSale(e) {
    e.preventDefault();
    const product = products.find((p) => p.id === parseInt(selectedProduct));

    if (!product || product.quantity < saleQty) {
      alert("Insufficient Stock!");
      return;
    }

    const totalPrice = product.price * saleQty;

    const { error: saleError } = await supabase.from("sales").insert([
      {
        product_name: product.name,
        quantity: saleQty,
        total_price: totalPrice,
      },
    ]);

    const { error: updateError } = await supabase
      .from("products")
      .update({ quantity: product.quantity - saleQty })
      .eq("id", product.id);

    if (!saleError && !updateError) {
      alert("Sale Recorded!");
      // Refresh the page data
      const { data: prodData } = await supabase.from("products").select("*");
      const { data: salesData } = await supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false });
      setProducts(prodData || []);
      setSales(salesData || []);
    }
  }

  // PDF GENERATION
  function generatePDF() {
    const doc = new jsPDF();
    doc.text("Firdausi Care Plus - Daily Sales Report", 14, 15);
    const tableRows = sales.map((s) => [
      new Date(s.created_at).toLocaleDateString(),
      s.product_name,
      s.quantity,
      `N${s.total_price.toLocaleString()}`,
    ]);
    doc.autoTable({
      head: [["Date", "Product", "Qty", "Total"]],
      body: tableRows,
      startY: 25,
    });
    doc.save(`sales_report.pdf`);
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.total_price, 0);

  if (loading)
    return (
      <div className={styles.loader}>
        <Loader2 className="animate-spin" size={40} color="#059669" />
      </div>
    );

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Staff Manager Dashboard</h1>
        <button onClick={generatePDF} className={styles.pdfBtn}>
          <FileText size={18} /> Download Sales PDF
        </button>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <TrendingUp color="#059669" />
          <div>
            <p>Total Revenue</p>
            <h3>₦{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <CheckCircle color="#0284c7" />
          <div>
            <p>Total Sales</p>
            <h3>{sales.length} Transactions</h3>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <h3>
            <PlusCircle size={20} /> Record New Sale
          </h3>
          <form onSubmit={handleSale} className={styles.form}>
            <label>Select Medicine</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
            >
              <option value="">Choose item...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
            </select>
            <label>Quantity Sold</label>
            <input
              type="number"
              value={saleQty}
              onChange={(e) => setSaleQty(e.target.value)}
              min="1"
              required
            />
            <button type="submit" className={styles.submitBtn}>
              Complete Sale
            </button>
          </form>
        </div>

        <div className={styles.card}>
          <h3>Recent Sales History</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td>{s.product_name}</td>
                    <td>{s.quantity}</td>
                    <td>₦{s.total_price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
