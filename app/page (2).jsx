'use client'
import { useState, useMemo, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CATEGORIES = [
  { id: "all", label: "All", icon: "🛒" },
  { id: "vegetables", label: "Vegetables & Fruits", icon: "🥦" },
  { id: "dairy", label: "Dairy & Eggs", icon: "🥛" },
  { id: "grocery", label: "Grocery & Staples", icon: "🌾" },
  { id: "snacks", label: "Snacks", icon: "🍿" },
  { id: "beverages", label: "Beverages", icon: "🧃" },
  { id: "bakery", label: "Bakery", icon: "🍞" },
];

const BANNERS = [
  { id: 1, title: "Veggies at Market Price", subtitle: "Fresh from farm - updated daily", color: "#16a34a", emoji: "🌿" },
  { id: 2, title: "Up to 22% OFF on Grocery", subtitle: "Stock up on daily essentials", color: "#ea580c", emoji: "🛒" },
  { id: 3, title: "Free Delivery above Rs 299", subtitle: "Delivered in 10-30 mins", color: "#7c3aed", emoji: "⚡" },
];

function sp(p) { return Math.round(p.mrp * (1 - p.discount / 100)); }
function savep(p) { return p.mrp - sp(p); }

function ProductCard({ product, cartQty, onAdd, onInc, onDec }) {
  const isVeg = product.category === "vegetables";
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", opacity: product.stock ? 1 : 0.55 }}>
      <div style={{ background: "#f8fafc", height: 110, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, borderRadius: "16px 16px 0 0", position: "relative" }}>
        {product.image}
        {isVeg && <span style={{ position: "absolute", top: 6, left: 6, fontSize: 9, background: "#16a34a", color: "#fff", padding: "2px 6px", borderRadius: 99, fontWeight: 700 }}>Today rate</span>}
        {!isVeg && product.discount > 0 && <span style={{ position: "absolute", top: 6, right: 6, fontSize: 10, background: "#ea580c", color: "#fff", padding: "2px 5px", borderRadius: 4, fontWeight: 700 }}>{product.discount}% OFF</span>}
        {!product.stock && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px 16px 0 0" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", background: "#fff", padding: "3px 10px", borderRadius: 99, border: "1px solid #e2e8f0" }}>Out of stock</span>
          </div>
        )}
      </div>
      <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{product.brand}</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.3 }}>{product.name}</p>
        <p style={{ fontSize: 11, color: "#94a3b8" }}>{product.weight}</p>
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          {isVeg ? (
            <>
              <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>Market Price</p>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Rs {product.market_price}</p>
            </>
          ) : product.discount > 0 ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Rs {sp(product)}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>Rs {product.mrp}</p>
              </div>
              <p style={{ fontSize: 10, color: "#16a34a", fontWeight: 700 }}>Save Rs {savep(product)}</p>
            </>
          ) : (
            <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Rs {product.mrp}</p>
          )}
        </div>
        {product.stock && (
          cartQty > 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#22c55e", borderRadius: 12, padding: "5px 10px", marginTop: 8 }}>
              <button onClick={onDec} style={{ color: "#fff", fontWeight: 800, fontSize: 18, background: "none", border: "none", cursor: "pointer", lineHeight: 1, width: 24, textAlign: "center" }}>-</button>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{cartQty}</span>
              <button onClick={onInc} style={{ color: "#fff", fontWeight: 800, fontSize: 18, background: "none", border: "none", cursor: "pointer", lineHeight: 1, width: 24, textAlign: "center" }}>+</button>
            </div>
          ) : (
            <button onClick={onAdd} style={{ marginTop: 8, width: "100%", background: "#fff", border: "2px solid #22c55e", color: "#16a34a", fontWeight: 800, fontSize: 13, borderRadius: 12, padding: "7px 0", cursor: "pointer" }}>ADD</button>
          )
        )}
      </div>
    </div>
  );
}

function HomePage({ products, loading, cart, onAdd, onInc, onDec, setPage, activeCategory, setActiveCategory, search, setSearch }) {
  const [bannerIdx, setBannerIdx] = useState(0);
  const banner = BANNERS[bannerIdx];
  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== "all") list = list.filter(function(p) { return p.category === activeCategory; });
    if (search) list = list.filter(function(p) { return p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()); });
    return list;
  }, [products, activeCategory, search]);

  return (
    <div>
      <div style={{ position: "sticky", top: 56, zIndex: 15, background: "#fff", padding: "10px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", borderRadius: 14, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: 16, color: "#94a3b8" }}>🔍</span>
          <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Search products..."
            style={{ flex: 1, fontSize: 13, background: "transparent", border: "none", outline: "none", color: "#334155" }} />
          {search && <button onClick={function() { setSearch(""); }} style={{ color: "#94a3b8", background: "none", border: "none", fontSize: 16, cursor: "pointer" }}>X</button>}
        </div>
      </div>

      <div style={{ padding: "14px 16px 100px", display: "flex", flexDirection: "column", gap: 16 }}>
        {!search && (
          <div onClick={function() { setBannerIdx((bannerIdx + 1) % BANNERS.length); }}
            style={{ background: banner.color, borderRadius: 18, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 16, margin: 0 }}>{banner.title}</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 3, marginBottom: 0 }}>{banner.subtitle}</p>
              <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                {BANNERS.map(function(_, i) { return <span key={i} style={{ height: 6, borderRadius: 99, background: i === bannerIdx ? "#fff" : "rgba(255,255,255,0.35)", width: i === bannerIdx ? 20 : 6, display: "inline-block" }} />; })}
              </div>
            </div>
            <span style={{ fontSize: 48 }}>{banner.emoji}</span>
          </div>
        )}

        {!search && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "10px 14px" }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <div>
              <p style={{ color: "#15803d", fontWeight: 700, fontSize: 13, margin: 0 }}>Delivery in 10-30 mins</p>
              <p style={{ color: "#16a34a", fontSize: 11, margin: 0 }}>For orders placed before 9 PM</p>
            </div>
          </div>
        )}

        {!search && (
          <>
            <p style={{ fontWeight: 800, color: "#1e293b", fontSize: 15, margin: 0 }}>Shop by Category</p>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {CATEGORIES.map(function(cat) {
                return (
                  <button key={cat.id} onClick={function() { setActiveCategory(cat.id); }}
                    style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 14, fontSize: 11, fontWeight: 700, cursor: "pointer", border: activeCategory === cat.id ? "2px solid #22c55e" : "2px solid #e2e8f0", background: activeCategory === cat.id ? "#22c55e" : "#fff", color: activeCategory === cat.id ? "#fff" : "#475569" }}>
                    <span style={{ fontSize: 20 }}>{cat.icon}</span>
                    <span style={{ whiteSpace: "nowrap" }}>{cat.label.split(" & ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontWeight: 800, color: "#1e293b", fontSize: 15, margin: 0 }}>
              {search ? ("Results for " + search) : activeCategory === "all" ? "All Products" : (CATEGORIES.find(function(c) { return c.id === activeCategory; }) || {}).label}
            </p>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{filtered.length} items</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
              <p style={{ fontSize: 30 }}>⏳</p>
              <p style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>Loading products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
              <p style={{ fontSize: 40 }}>🔍</p>
              <p style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>No products found</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {filtered.map(function(p) {
                return <ProductCard key={p.id} product={p} cartQty={cart[p.id] || 0} onAdd={function() { onAdd(p); }} onInc={function() { onInc(p.id); }} onDec={function() { onDec(p.id); }} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartPage({ products, cart, onInc, onDec, setPage, setCart }) {
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("upi");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [placing, setPlacing] = useState(false);

  const items = Object.entries(cart).filter(function(entry) { return entry[1] > 0; })
    .map(function(entry) { return { product: products.find(function(p) { return p.id === Number(entry[0]); }), qty: entry[1] }; })
    .filter(function(i) { return i.product; });

  const subtotal = items.reduce(function(s, item) { return s + (item.product.category === "vegetables" ? item.product.market_price : sp(item.product)) * item.qty; }, 0);
  const deliveryFee = subtotal >= 299 ? 0 : 25;
  const couponDiscount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + deliveryFee - couponDiscount;

  async function placeOrder() {
    if (!address.trim()) { alert("Please enter delivery address"); return; }
    setPlacing(true);
    try {
      await supabase.from("orders").insert([{
        items: JSON.stringify(items.map(function(i) { return { name: i.product.name, qty: i.qty, price: i.product.category === "vegetables" ? i.product.market_price : sp(i.product) }; })),
        total: total,
        address: address,
        payment: payment,
        status: "placed"
      }]);
    } catch(e) { console.log(e); }
    setCart({});
    setOrdered(true);
    setPlacing(false);
  }

  if (ordered) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "0 24px 80px", textAlign: "center", gap: 16 }}>
      <div style={{ fontSize: 64 }}>🎉</div>
      <p style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>Order Placed!</p>
      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>Your order of Rs {total} is confirmed. Arriving in 10-28 mins.</p>
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: 14, width: "100%", maxWidth: 280 }}>
        <p style={{ color: "#15803d", fontSize: 13, fontWeight: 700, margin: 0 }}>⚡ Our delivery partner is on the way!</p>
      </div>
      <button onClick={function() { setPage("home"); }} style={{ background: "#22c55e", color: "#fff", fontWeight: 800, padding: "14px 32px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 15 }}>Continue Shopping</button>
    </div>
  );

  if (items.length === 0) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "0 24px 80px", textAlign: "center", gap: 12 }}>
      <span style={{ fontSize: 56 }}>🛒</span>
      <p style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>Your cart is empty</p>
      <p style={{ fontSize: 13, color: "#94a3b8" }}>Add items to get started</p>
      <button onClick={function() { setPage("home"); }} style={{ background: "#22c55e", color: "#fff", fontWeight: 800, padding: "14px 32px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 15 }}>Browse Products</button>
    </div>
  );

  return (
    <div style={{ padding: "16px 16px 140px", display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontWeight: 800, color: "#1e293b", fontSize: 17, margin: 0 }}>Your Cart ({items.length} items)</p>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9" }}>
        {items.map(function(item, i) {
          const price = item.product.category === "vegetables" ? item.product.market_price : sp(item.product);
          return (
            <div key={item.product.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: i < items.length - 1 ? "1px solid #f8fafc" : "none" }}>
              <span style={{ fontSize: 30 }}>{item.product.image}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{item.product.name}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{item.product.weight}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", marginTop: 2 }}>Rs {price} x {item.qty} = Rs {price * item.qty}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#22c55e", borderRadius: 12, padding: "5px 10px" }}>
                <button onClick={function() { onDec(item.product.id); }} style={{ color: "#fff", fontWeight: 800, fontSize: 16, background: "none", border: "none", cursor: "pointer" }}>-</button>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{item.qty}</span>
                <button onClick={function() { onInc(item.product.id); }} style={{ color: "#fff", fontWeight: 800, fontSize: 16, background: "none", border: "none", cursor: "pointer" }}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 8, marginTop: 0 }}>Apply Coupon</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={coupon} onChange={function(e) { setCoupon(e.target.value.toUpperCase()); }} placeholder="Try SAVE10"
            style={{ flex: 1, fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 12px", outline: "none" }} />
          <button onClick={function() { if (coupon === "SAVE10") setCouponApplied(true); }}
            style={{ background: "#22c55e", color: "#fff", fontSize: 13, fontWeight: 800, padding: "0 16px", borderRadius: 12, border: "none", cursor: "pointer" }}>Apply</button>
        </div>
        {couponApplied && <p style={{ color: "#16a34a", fontSize: 11, fontWeight: 700, marginTop: 6, marginBottom: 0 }}>SAVE10 applied - 10% off!</p>}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 8, marginTop: 0 }}>Delivery Address</p>
        <textarea value={address} onChange={function(e) { setAddress(e.target.value); }} placeholder="Enter your full delivery address..." rows={3}
          style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 12px", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 10, marginTop: 0 }}>Payment Method</p>
        {[{ id: "upi", label: "UPI / Scan QR Code", icon: "📱" }, { id: "cod", label: "Cash on Delivery", icon: "💵" }].map(function(opt) {
          return (
            <div key={opt.id} onClick={function() { setPayment(opt.id); }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, cursor: "pointer", border: payment === opt.id ? "2px solid #22c55e" : "2px solid #f1f5f9", background: payment === opt.id ? "#f0fdf4" : "#fff", marginBottom: 6 }}>
              <span style={{ width: 16, height: 16, borderRadius: "50%", border: payment === opt.id ? "5px solid #22c55e" : "2px solid #cbd5e1", flexShrink: 0 }} />
              <span style={{ fontSize: 18 }}>{opt.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{opt.label}</span>
            </div>
          );
        })}
        {payment === "upi" && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 12, marginTop: 8, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#15803d", fontWeight: 700, margin: 0 }}>📲 Scan our QR code at delivery</p>
            <p style={{ fontSize: 11, color: "#16a34a", margin: "4px 0 0" }}>Our delivery person will show you the QR</p>
          </div>
        )}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 10, marginTop: 0 }}>Bill Summary</p>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 6 }}><span>Item Total</span><span>Rs {subtotal}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: deliveryFee === 0 ? "#16a34a" : "#64748b", fontWeight: deliveryFee === 0 ? 700 : 400, marginBottom: 6 }}><span>Delivery Fee</span><span>{deliveryFee === 0 ? "FREE" : ("Rs " + deliveryFee)}</span></div>
        {couponApplied && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#16a34a", fontWeight: 700, marginBottom: 6 }}><span>Coupon</span><span>-Rs {couponDiscount}</span></div>}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "#1e293b" }}><span>Total</span><span>Rs {total}</span></div>
        {subtotal < 299 && <p style={{ fontSize: 11, color: "#f97316", marginTop: 6, marginBottom: 0 }}>Add Rs {299 - subtotal} more for free delivery</p>}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 448, background: "#fff", borderTop: "1px solid #f1f5f9", padding: "12px 16px", zIndex: 50 }}>
        <button onClick={placeOrder} disabled={placing}
          style={{ width: "100%", background: placing ? "#86efac" : "#22c55e", color: "#fff", fontWeight: 800, fontSize: 16, padding: "16px 0", borderRadius: 18, border: "none", cursor: placing ? "not-allowed" : "pointer" }}>
          {placing ? "Placing Order..." : ("Place Order - Rs " + total)}
        </button>
      </div>
    </div>
  );
}

function AdminPage({ products, setProducts }) {
  const [tab, setTab] = useState("list");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);

  function startEdit(p) { setEditId(p.id); setForm(Object.assign({}, p)); setTab("edit"); }
  function startNew() { setEditId(null); setForm({ name: "", brand: "", weight: "", category: "grocery", image: "📦", mrp: 0, discount: 0, market_price: 0, stock: true }); setTab("edit"); }

  async function handleSave() {
    setSaving(true);
    if (editId) {
      await supabase.from("products").update({
        name: form.name, brand: form.brand, weight: form.weight,
        image: form.image, category: form.category, mrp: form.mrp,
        discount: form.discount, market_price: form.market_price, stock: form.stock
      }).eq("id", editId);
      setProducts(function(ps) { return ps.map(function(p) { return p.id === editId ? Object.assign({}, p, form) : p; }); });
    } else {
      const result = await supabase.from("products").insert([{
        name: form.name, brand: form.brand, weight: form.weight,
        image: form.image, category: form.category, mrp: form.mrp,
        discount: form.discount, market_price: form.market_price, stock: form.stock
      }]).select();
      if (result.data) setProducts(function(ps) { return ps.concat(result.data); });
    }
    setSaving(false);
    setSaved(editId ? "Updated!" : "Added!");
    setTimeout(function() { setSaved(null); setTab("list"); }, 1200);
  }

  const isVeg = form.category === "vegetables";

  return (
    <div style={{ padding: "16px 16px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontWeight: 800, color: "#1e293b", fontSize: 17, margin: 0 }}>Admin Panel</p>
        <button onClick={startNew} style={{ background: "#22c55e", color: "#fff", fontSize: 13, fontWeight: 800, padding: "8px 14px", borderRadius: 12, border: "none", cursor: "pointer" }}>+ Add Product</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {["list", "edit"].map(function(t) {
          return <button key={t} onClick={function() { setTab(t); }} style={{ flex: 1, fontSize: 13, fontWeight: 700, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer", background: tab === t ? "#22c55e" : "#f1f5f9", color: tab === t ? "#fff" : "#64748b" }}>{t === "list" ? "Products" : "Edit / Add"}</button>;
        })}
      </div>
      {tab === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {products.map(function(p) {
            return (
              <div key={p.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
                <span style={{ fontSize: 28 }}>{p.image}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.brand} - {p.weight}</p>
                  {p.category === "vegetables"
                    ? <p style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, margin: 0 }}>Market Price: Rs {p.market_price}</p>
                    : <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>MRP Rs {p.mrp} - Rs {sp(p)} ({p.discount}% off)</p>}
                </div>
                <button onClick={function() { startEdit(p); }} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 10, cursor: "pointer" }}>Edit</button>
              </div>
            );
          })}
        </div>
      )}
      {tab === "edit" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {saved && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: 14, fontWeight: 800, padding: 12, borderRadius: 12, textAlign: "center" }}>{saved}</div>}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {[["name", "Product Name"], ["brand", "Brand"], ["weight", "Weight"], ["image", "Emoji Icon"]].map(function(field) {
              return (
                <div key={field[0]}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, marginTop: 0 }}>{field[1]}</p>
                  <input value={form[field[0]] || ""} onChange={function(e) { const v = e.target.value; setForm(function(f) { const n = Object.assign({}, f); n[field[0]] = v; return n; }); }}
                    style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              );
            })}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, marginTop: 0 }}>Category</p>
              <select value={form.category} onChange={function(e) { const v = e.target.value; setForm(function(f) { return Object.assign({}, f, { category: v }); }); }}
                style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 12px", fontSize: 13, outline: "none", background: "#fff" }}>
                {CATEGORIES.filter(function(c) { return c.id !== "all"; }).map(function(c) { return <option key={c.id} value={c.id}>{c.label}</option>; })}
              </select>
            </div>
            {isVeg ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#15803d", marginBottom: 8, marginTop: 0 }}>Market Price Mode</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, marginTop: 0 }}>Today Market Price (Rs)</p>
                <input type="number" value={form.market_price || ""} onChange={function(e) { const v = Number(e.target.value); setForm(function(f) { return Object.assign({}, f, { market_price: v }); }); }}
                  style={{ width: "100%", border: "1px solid #86efac", borderRadius: 12, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} placeholder="e.g. 38" />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, marginTop: 0 }}>MRP (Rs)</p>
                  <input type="number" value={form.mrp || ""} onChange={function(e) { const v = Number(e.target.value); setForm(function(f) { return Object.assign({}, f, { mrp: v }); }); }}
                    style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, marginTop: 0 }}>Discount %</p>
                  <input type="number" min="0" max="90" value={form.discount || 0} onChange={function(e) { const v = Number(e.target.value); setForm(function(f) { return Object.assign({}, f, { discount: v }); }); }}
                    style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                {form.mrp > 0 && <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, background: "#f0fdf4", padding: "8px 12px", borderRadius: 10, margin: 0 }}>Preview: MRP Rs {form.mrp} - Rs {sp(form)} ({form.discount}% off) - Save Rs {savep(form)}</p>}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.stock || false} onChange={function(e) { const v = e.target.checked; setForm(function(f) { return Object.assign({}, f, { stock: v }); }); }} style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>In Stock</span>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ width: "100%", background: saving ? "#86efac" : "#22c55e", color: "#fff", fontWeight: 800, fontSize: 15, padding: "16px 0", borderRadius: 18, border: "none", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : (editId ? "Save Changes" : "Add Product")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(function() {
    async function loadProducts() {
      setLoading(true);
      const result = await supabase.from("products").select("*");
      if (result.data) setProducts(result.data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const cartCount = Object.values(cart).reduce(function(s, q) { return s + q; }, 0);
  function onAdd(p) { setCart(function(c) { const n = Object.assign({}, c); n[p.id] = 1; return n; }); }
  function onInc(id) { setCart(function(c) { const n = Object.assign({}, c); n[id] = (c[id] || 0) + 1; return n; }); }
  function onDec(id) {
    setCart(function(c) {
      const qty = (c[id] || 1) - 1;
      if (qty <= 0) { const n = Object.assign({}, c); delete n[id]; return n; }
      const n = Object.assign({}, c); n[id] = qty; return n;
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", maxWidth: 448, margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 30, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24, color: "#22c55e" }}>⚡</span>
            <div>
              <p style={{ fontWeight: 900, color: "#1e293b", fontSize: 16, lineHeight: 1.1, margin: 0 }}>QuickBasket</p>
              <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.1, margin: 0 }}>Delivery in 10-30 mins</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={function() { setPage("admin"); }}
              style={{ fontSize: 12, fontWeight: 700, padding: "7px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: page === "admin" ? "#1e293b" : "#f1f5f9", color: page === "admin" ? "#fff" : "#64748b" }}>
              Admin
            </button>
            <button onClick={function() { setPage("cart"); }}
              style={{ background: "#22c55e", color: "#fff", padding: "7px 12px", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 14 }}>
              🛒
              {cartCount > 0 && <span style={{ background: "#fff", color: "#16a34a", fontSize: 11, fontWeight: 900, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
            </button>
          </div>
        </div>
        {page !== "admin" && (
          <div style={{ display: "flex", borderTop: "1px solid #f1f5f9" }}>
            {[{ id: "home", label: "Home" }, { id: "cart", label: "Cart" + (cartCount > 0 ? " (" + cartCount + ")" : "") }].map(function(t) {
              return (
                <button key={t.id} onClick={function() { setPage(t.id); }}
                  style={{ flex: 1, padding: "10px 0", fontSize: 12, fontWeight: 700, border: "none", borderBottom: page === t.id ? "2.5px solid #22c55e" : "2.5px solid transparent", background: "none", cursor: "pointer", color: page === t.id ? "#16a34a" : "#94a3b8" }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {page === "home" && <HomePage products={products} loading={loading} cart={cart} onAdd={onAdd} onInc={onInc} onDec={onDec} setPage={setPage} activeCategory={activeCategory} setActiveCategory={setActiveCategory} search={search} setSearch={setSearch} />}
      {page === "cart" && <CartPage products={products} cart={cart} onInc={onInc} onDec={onDec} setPage={setPage} setCart={setCart} />}
      {page === "admin" && <AdminPage products={products} setProducts={setProducts} />}
    </div>
  );
}
