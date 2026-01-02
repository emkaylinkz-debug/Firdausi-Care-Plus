"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import { Lock, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    // 2. Fetch the user's role from your 'profiles' table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      setError("Account found, but no role assigned. Contact Admin.");
      setLoading(false);
      return;
    }

    // 3. Smart Redirect Logic
    if (profile.role === "admin") {
      router.push("/admin/dashboard");
    } else if (profile.role === "sales_manager") {
      router.push("/sales/terminal");
    } else {
      setError("Access Denied: Role not recognized.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <ShieldCheck
            color="#059669"
            size={40}
            style={{ marginBottom: "10px" }}
          />
          <h2>Staff Portal</h2>
          <p>Login for Admin or Sales Manager</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>Staff Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="e.g. staff@firdausi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Login to Workspace"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
