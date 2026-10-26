import { createContext, useContext, useState, useEffect } from 'react';

// =============================================================================
// 1. CONTEXT API: Global State Management for Shopping Cart
// =============================================================================
export const CartContext = createContext(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// =============================================================================
// 2. CUSTOM HOOK: useLocalStorage (Persistent Browser Storage)
// =============================================================================
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

const INITIAL_CATALOG = [
  { id: 'item-1', name: 'DevStudio Cloud Sync License', price: 29, category: 'Subscription', icon: '☁️', desc: 'Real-time multi-device sync for resumes and form responses.' },
  { id: 'item-2', name: 'Custom Domain SSL Bundle', price: 15, category: 'Add-on', icon: '🔒', desc: 'Automated HTTPS certs with custom apex domain routing.' },
  { id: 'item-3', name: 'API Gateway Quota Booster', price: 49, category: 'Compute', icon: '⚡', desc: '1,000,000 extra monthly API requests with 99.99% SLA.' },
  { id: 'item-4', name: 'Premium Resume PDF Themes Pack', price: 19, category: 'Design', icon: '🎨', desc: '12 executive LaTeX & Figma-style resume templates.' }
];

export default function StateCart() {
  // Global State accessed via Context API (CartContext)
  const { cart, addToCart, updateQuantity, clearCart } = useCart();

  const [promoCode, setPromoCode] = useState('DEVSTUDIO20');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [promoMessage, setPromoMessage] = useState(null);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'DEVSTUDIO20') {
      setDiscountPercent(20);
      setPromoMessage('✅ 20% Discount code applied!');
    } else if (cleanCode === 'DEV50') {
      setDiscountPercent(50);
      setPromoMessage('🎉 50% Super discount applied!');
    } else {
      setPromoMessage('❌ Invalid promo code. Try DEVSTUDIO20 or DEV50');
    }
    setTimeout(() => setPromoMessage(null), 3000);
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>🛒 Interactive Global State &amp; Cart Sandbox</h2>
          <p>Demonstrates React Context API global state, persistent LocalStorage sync, discount vouchers, and quantity reducers.</p>
        </div>
      </div>

      <div className="split-grid">
        {/* Catalog */}
        <div className="card">
          <h3>📦 Developer Tools Catalog</h3>
          <p className="card-description" style={{ marginTop: '0.25rem', marginBottom: '1rem' }}>
            Click Add to dispatch items into the global <code>CartContext</code>.
          </p>

          <div className="catalog-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {INITIAL_CATALOG.map((item) => (
              <div key={item.id} className="card" style={{ background: 'var(--bg-input)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{item.icon}</span> {item.name}
                  </h4>
                  <p className="card-description" style={{ fontSize: '0.85rem' }}>{item.desc}</p>
                  <span className="badge-small" style={{ marginTop: '0.4rem', display: 'inline-block' }}>${item.price} / unit</span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => addToCart(item)}
                >
                  ➕ Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Checkout */}
        <div className="card">
          <div className="flex-between">
            <h3>🛍️ Global Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)</h3>
            {cart.length > 0 && (
              <button type="button" className="btn btn-sm btn-outline" onClick={clearCart}>
                Clear
              </button>
            )}
          </div>

          {promoMessage && (
            <div style={{ marginTop: '1rem', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--accent-cyan)', fontSize: '0.88rem' }}>
              {promoMessage}
            </div>
          )}

          {checkoutComplete ? (
            <div className="alert-success" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              🎉 Mock Order Processed Successfully! Cart synced across browser via Context API.
            </div>
          ) : cart.length === 0 ? (
            <p className="card-description" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              Your cart is empty. Add developer tools from the catalog on the left!
            </p>
          ) : (
            <div style={{ marginTop: '1.25rem' }}>
              {cart.map((item) => (
                <div key={item.id} className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong>{item.name}</strong>
                    <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                      ${item.price} × {item.quantity} = ${item.price * item.quantity}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => updateQuantity(item.id, -1)}
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span style={{ minWidth: '1.2rem', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => updateQuantity(item.id, 1)}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <form onSubmit={handleApplyPromo} className="grid-2-compact" style={{ marginTop: '1.5rem' }}>
                <input
                  className="form-input"
                  value={promoCode}
                  placeholder="Promo Code (e.g. DEVSTUDIO20)"
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary">
                  Apply Voucher
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
                  <span className="text-secondary">Subtotal:</span>
                  <strong>${subtotal}</strong>
                </div>
                {discountAmount > 0 && (
                  <div className="flex-between" style={{ marginBottom: '0.4rem', color: '#4ade80' }}>
                    <span>Discount ({discountPercent}%):</span>
                    <span>-${discountAmount}</span>
                  </div>
                )}
                <div className="flex-between" style={{ fontSize: '1.2rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <strong>Total:</strong>
                  <strong className="gradient-text">${total}</strong>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.25rem' }}
                onClick={() => {
                  setCheckoutComplete(true);
                  clearCart();
                  setTimeout(() => setCheckoutComplete(false), 4000);
                }}
              >
                Complete Mock Checkout 💳
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
