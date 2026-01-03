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
  AlertCircle,
} from "lucide-react";

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
    price: "",
    quantity: "",
    category: "",
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
      SALE & STOCK LOGIC
  ================================ */
  // Function to reset all sales records
  const handleResetSales = async () => {
    const confirmation = confirm(
      "CRITICAL: This will permanently delete ALL sales records. This cannot be undone. Continue?"
    );

    if (confirmation) {
      setLoading(true);
      try {
        // Use .not("id", "is", null) to target every row in a UUID-based table
        const { error } = await supabase
          .from("sales")
          .delete()
          .not("id", "is", null);

        if (error) throw error;

        alert("Sales records cleared successfully.");
        await loadData(); // Refresh the UI
      } catch (error) {
        console.error("Delete error:", error.message);
        alert("Failed to clear sales: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Logic to handle a sale and reduce quantity
  const handleManualSale = async (product, qtySold) => {
    if (product.quantity < qtySold) return alert("Not enough stock!");

    // 1. Record the Sale
    const { error: saleError } = await supabase.from("sales").insert([
      {
        product_id: product.id,
        product_name: product.name,
        quantity: qtySold,
        total_price: product.price * qtySold,
      },
    ]);

    if (!saleError) {
      // 2. Reduce Product Quantity
      await supabase
        .from("products")
        .update({ quantity: product.quantity - qtySold })
        .eq("id", product.id);

      loadData();
    }
  };

  /* ===============================
      PRODUCT ACTIONS
  ================================ */
  const handleEditProduct = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
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
      price: "",
      quantity: "",
      category: "",
      description: "",
      image_url: "",
    });
    loadData();
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Reason..."
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
              <h3>{editingId ? "Update Product" : "Create New Product"}</h3>
              <form onSubmit={handleSaveProduct} className={styles.prodForm}>
                <input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                  placeholder="Stock"
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
                  <option value="">Category</option>
                  <option value="Painkillers">Painkillers</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Supplements">Supplements</option>
                </select>
                <label className={styles.fileLabel}>
                  <ImageIcon size={18} />{" "}
                  {imageFile ? imageFile.name : "Upload Image"}
                  <input
                    type="file"
                    className={styles.fileInput}
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </label>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <div className={styles.formButtons}>
                  <button type="submit" className={styles.saveBtn}>
                    <Save size={18} /> {editingId ? "Update" : "Save"}
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
                <h3>Product Records</h3>
                <div className={styles.searchBox}>
                  <Search size={18} />
                  <input
                    placeholder="Search..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
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
                        <td className={styles.boldText}>{p.name}</td>
                        <td>{p.category}</td>
                        <td>₦{p.price.toLocaleString()}</td>
                        <td>
                          <span
                            className={p.quantity < 10 ? styles.lowStock : ""}
                          >
                            {p.quantity}
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
                <h3>Sales Records</h3>
                <p className={styles.subtitle}>
                  Historical data of all items sold
                </p>
              </div>
              <button onClick={handleResetSales} className={styles.resetBtn}>
                <RefreshCcw size={16} /> Reset All Sales
              </button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td>{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className={styles.boldText}>{s.product_name}</td>
                      <td>{s.quantity}</td>
                      <td className={styles.priceText}>
                        ₦{s.total_price.toLocaleString()}
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
