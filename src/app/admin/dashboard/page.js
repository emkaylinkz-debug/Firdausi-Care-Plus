"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import styles from "./dashboard.module.css";
import {
  Trash2,
  Edit3,
  Search,
  Store,
  Package,
  DollarSign,
  Save,
  LogOut,
  RefreshCcw,
  Image as ImageIcon,
  AlertTriangle,
  User,
} from "lucide-react";

// Updated professional categories
const PHARMA_CATEGORIES = [
  "Daily Health & Pain Relief",
  "Vitamins & Supplements",
  "Sexual Wellness & Family Planning",
  "Mother & Child",
  "Personal Care & Toiletries",
  "Chronic Disease Management",
  "Infectious Diseases",
  "Healthcare Devices & Accessories",
  "First Aid",
];

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");

  const [storeStatus, setStoreStatus] = useState({
    is_open: true,
    close_reason: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    generic_name: "", // NEW
    price: "",
    quantity: "",
    category: PHARMA_CATEGORIES[0], // Default to first professional category
    description: "",
    image_url: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  /* ===============================
      DATA LOADER
  ================================ */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, salesRes, statusRes] = await Promise.all([
        supabase.from("products").select("*").order("name"),
        supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("store_settings").select("*").eq("id", 1).single(),
      ]);

      setProducts(prodRes.data || []);
      setSales(salesRes.data || []);
      if (statusRes.data) setStoreStatus(statusRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ===============================
      SALE & REFUND LOGIC
  ================================ */
  const handleResetSales = async () => {
    const confirmation = confirm(
      "CRITICAL: Delete ALL sales records? This cannot be undone."
    );
    if (confirmation) {
      setLoading(true);
      const { error } = await supabase
        .from("sales")
        .delete()
        .not("id", "is", null);
      if (!error) {
        alert("Records cleared.");
        await loadData();
      }
      setLoading(false);
    }
  };

  /* ===============================
      PRODUCT ACTIONS
  ================================ */
  const handleEditProduct = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      generic_name: product.generic_name || "", // NEW
      price: product.price,
      quantity: product.quantity,
      category: product.category || PHARMA_CATEGORIES[0],
      description: product.description || "",
      image_url: product.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (confirm("Delete this product?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) loadData();
    }
  };

  async function handleSaveProduct(e) {
    e.preventDefault();
    let imageUrl = formData.image_url;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: upError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      if (!upError) {
        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }

    const payload = {
      ...formData,
      image_url: imageUrl,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
    };

    if (editingId) {
      await supabase.from("products").update(payload).eq("id", editingId);
    } else {
      await supabase.from("products").insert([payload]);
    }

    setEditingId(null);
    setImageFile(null);
    setFormData({
      name: "",
      generic_name: "",
      price: "",
      quantity: "",
      category: PHARMA_CATEGORIES[0],
      description: "",
      image_url: "",
    });
    loadData();
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  // NEW: Search both Brand Name and Generic Name
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.generic_name &&
        p.generic_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.price * p.quantity,
    0
  );
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total_price, 0);

  if (loading)
    return <div className={styles.loader}>Loading Admin Panel...</div>;

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Firdausi Admin</div>
        <nav className={styles.adminNav}>
          <button
            onClick={() => setActiveTab("inventory")}
            className={
              activeTab === "inventory" ? styles.navBtnActive : styles.navBtn
            }
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={
              activeTab === "sales" ? styles.navBtnActive : styles.navBtn
            }
          >
            Sales History
          </button>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} /> Logout
        </button>

        <div className={styles.storeToggleCard}>
          <div className={styles.statusHeader}>
            <Store size={18} />{" "}
            {storeStatus.is_open ? "Store Open" : "Store Closed"}
          </div>
          <textarea
            placeholder="Reason for closing..."
            value={storeStatus.close_reason}
            onChange={(e) =>
              setStoreStatus({ ...storeStatus, close_reason: e.target.value })
            }
          />
          <button
            onClick={async () => {
              await supabase
                .from("store_settings")
                .update({
                  is_open: !storeStatus.is_open,
                  close_reason: storeStatus.close_reason,
                })
                .eq("id", 1);
              loadData();
            }}
            className={storeStatus.is_open ? styles.closeBtn : styles.openBtn}
          >
            {storeStatus.is_open ? "Close Store" : "Open Store"}
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <header className={styles.stats}>
          <div className={styles.statItem}>
            <Package color="#10b981" />
            <div>
              <span>Total Stock Value</span>
              <h3>₦{totalInventoryValue.toLocaleString()}</h3>
            </div>
          </div>
          <div className={styles.statItem}>
            <DollarSign color="#10b981" />
            <div>
              <span>Total Revenue</span>
              <h3>₦{totalSalesRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </header>

        {activeTab === "inventory" ? (
          <>
            <section
              className={styles.listSection}
              style={{ marginBottom: "30px" }}
            >
              <h3>{editingId ? "Update Medicine" : "Register New Medicine"}</h3>
              <form onSubmit={handleSaveProduct} className={styles.prodForm}>
                <input
                  placeholder="Brand Name (e.g. Panadol)"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <input
                  placeholder="Generic Name (e.g. Paracetamol)"
                  value={formData.generic_name}
                  onChange={(e) =>
                    setFormData({ ...formData, generic_name: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Stock Level"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />

                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  {PHARMA_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <label className={styles.fileLabel}>
                  <ImageIcon size={18} />{" "}
                  {imageFile ? imageFile.name : "Upload Product Image"}
                  <input
                    type="file"
                    className={styles.fileInput}
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </label>
                <textarea
                  placeholder="Usage description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <div className={styles.formButtons}>
                  <button type="submit" className={styles.saveBtn}>
                    <Save size={18} />{" "}
                    {editingId ? "Update Product" : "Save Product"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className={styles.listSection}>
              <div className={styles.listHeader}>
                <h3>Inventory Records</h3>
                <div className={styles.searchBox}>
                  <Search size={18} />
                  <input
                    placeholder="Search Brand or Generic..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Medicine Detail</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Image
                            src={p.image_url || "/placeholder.png"}
                            alt={p.name}
                            width={40}
                            height={40}
                            className={styles.productThumb}
                          />
                        </td>
                        <td>
                          <div className={styles.boldText}>{p.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                            {p.generic_name}
                          </div>
                        </td>
                        <td>
                          <small>{p.category}</small>
                        </td>
                        <td>₦{p.price.toLocaleString()}</td>
                        <td>
                          {/* NEW: Stock Alert Threshold of 5 */}
                          <span
                            className={p.quantity <= 5 ? styles.lowStock : ""}
                          >
                            {p.quantity}{" "}
                            {p.quantity <= 5 && (
                              <AlertTriangle
                                size={14}
                                style={{ marginLeft: 5 }}
                              />
                            )}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            <button
                              onClick={() => handleEditProduct(p)}
                              className={styles.editBtn}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className={styles.delBtn}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className={styles.listSection}>
            <div className={styles.listHeader}>
              <div>
                <h3>Sales History</h3>
                <p className={styles.subtitle}>
                  Audit logs of every customer transaction
                </p>
              </div>
              <button onClick={handleResetSales} className={styles.resetBtn}>
                <RefreshCcw size={16} /> Clear Logs
              </button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Receipt #</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id} style={{ opacity: s.is_refunded ? 0.5 : 1 }}>
                      <td>{new Date(s.created_at).toLocaleDateString()}</td>
                      <td>
                        <code
                          style={{ background: "#f1f5f9", padding: "2px 5px" }}
                        >
                          {s.receipt_no || "N/A"}
                        </code>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.85rem" }}>
                          <User size={12} /> {s.customer_name || "Walk-in"}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                          {s.customer_phone || "No Phone"}
                        </div>
                      </td>
                      <td className={styles.boldText}>
                        {s.product_name}
                        {s.is_refunded && (
                          <span style={{ color: "red", marginLeft: 10 }}>
                            (REFUNDED)
                          </span>
                        )}
                      </td>
                      <td>{s.quantity}</td>
                      <td className={styles.priceText}>
                        ₦{s.total_price.toLocaleString()} ({s.payment_method})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
