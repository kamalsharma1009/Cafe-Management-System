import { useState, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineSearch, 
  HiOutlinePlus, 
  HiOutlineMinus, 
  HiOutlineTrash, 
  HiOutlineX, 
  HiStar, 
  HiOutlineStar,
  HiOutlineClock
} from 'react-icons/hi';
import { usePOSProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCreateOrder } from '../hooks/useOrders';
import { useSettings } from '../hooks/useSettings';
import { useDebounce } from '../hooks/useDebounce';
import Receipt from '../components/receipt/Receipt';
import Button from '../components/ui/Button';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatToken } from '../utils/formatters';
import { PLACEHOLDER_IMAGE, PAYMENT_METHODS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function POS() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('recents');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const [recents, setRecents] = useState(() => {
    try {
      const saved = localStorage.getItem('cafeflow_recent_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favourites, setFavourites] = useState(() => {
    try {
      const saved = localStorage.getItem('cafeflow_favorite_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const debouncedSearch = useDebounce(search, 300);
  const receiptRef = useRef(null);

  const { data: products, isLoading: productsLoading } = usePOSProducts();
  const { data: categories } = useCategories();
  const { data: settings } = useSettings();
  const createOrder = useCreateOrder();

  const taxRate = parseFloat(settings?.taxPercentage || 5) / 100;
  const currency = settings?.currency || '₹';

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchSearch = !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      let matchCategory = true;
      if (selectedCategory === 'recents') {
        matchCategory = recents.includes(p.id);
      } else if (selectedCategory === 'favourites') {
        matchCategory = favourites.includes(p.id);
      } else if (selectedCategory) {
        matchCategory = p.categoryId === selectedCategory;
      }
      
      return matchSearch && matchCategory;
    });
  }, [products, debouncedSearch, selectedCategory, recents, favourites]);

  // Cart operations
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.productId === product.id);
      if (exists) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: parseFloat(product.price), quantity: 1, image: product.image }];
    });

    // Update recents list
    setRecents((prev) => {
      const next = [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 12);
      localStorage.setItem('cafeflow_recent_products', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleFavorite = (productId, e) => {
    e.stopPropagation();
    setFavourites((prev) => {
      const isFav = prev.includes(productId);
      const next = isFav ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem('cafeflow_favorite_products', JSON.stringify(next));
      return next;
    });
  };

  const updateQuantity = useCallback((productId, delta) => {
    setCart((prev) => prev.map((item) => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter((item) => item.quantity > 0));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setNotes('');
  }, []);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = parseFloat(discount) || 0;
  const gst = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + gst;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return toast.error('Add items to cart first');

    try {
      const orderData = {
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
        paymentMethod,
        subtotal: subtotal.toFixed(2),
        discount: discountAmount.toFixed(2),
        gst: gst.toFixed(2),
        total: total.toFixed(2),
        notes: notes || undefined,
      };

      const order = await createOrder.mutateAsync(orderData);
      setLastOrder(order);
      setShowReceipt(true);
      toast.success(`Order placed! Token #${formatToken(order.token)}`, { duration: 5000 });
      clearCart();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handlePrint = () => {
    document.body.classList.add('printing-receipt');
    window.print();
    document.body.classList.remove('printing-receipt');
  };

  const getImageSrc = (image) => {
    if (!image) return PLACEHOLDER_IMAGE;
    if (image.startsWith('http')) return image;
    return `${import.meta.env.VITE_API_URL || ''}${image}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:h-[calc(100vh-64px)] lg:overflow-hidden -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 -mb-4 lg:-mb-6">
      {/* Left Panel - Products */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto lg:h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 no-print">
          <h1 className="text-2xl font-bold text-cafe-text font-display">POS Billing</h1>
          {lastOrder && (
            <div className="bg-cafe-accent/10 px-4 py-2 rounded-xl">
              <span className="text-sm font-semibold text-cafe-accent">Token: #{formatToken(lastOrder.token)}</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4 no-print">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-cafe-bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-accent/30 focus:border-cafe-accent transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1 no-print">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              !selectedCategory ? 'bg-cafe-accent text-white shadow-soft' : 'bg-white text-cafe-text-light hover:bg-cafe-bg-secondary'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setSelectedCategory('recents')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === 'recents' ? 'bg-cafe-accent text-white shadow-soft' : 'bg-white text-cafe-text-light hover:bg-cafe-bg-secondary'
            }`}
          >
            <HiOutlineClock className="w-4 h-4" />
            Recents
          </button>

          <button
            onClick={() => setSelectedCategory('favourites')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === 'favourites' ? 'bg-cafe-accent text-white shadow-soft' : 'bg-white text-cafe-text-light hover:bg-cafe-bg-secondary'
            }`}
          >
            <HiOutlineStar className="w-4 h-4 text-amber-500" />
            Favourites
          </button>

          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.id ? 'bg-cafe-accent text-white shadow-soft' : 'bg-white text-cafe-text-light hover:bg-cafe-bg-secondary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => {
                  const inCart = cart.find((c) => c.productId === product.id);
                  const isFav = favourites.includes(product.id);
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => addToCart(product)}
                      className={`relative bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer transition-all border-2 ${
                        inCart ? 'border-cafe-accent' : 'border-transparent'
                      }`}
                    >
                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className="absolute top-2 left-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-cafe-accent shadow-sm transition-all z-10 hover:scale-110 no-print"
                      >
                        {isFav ? (
                          <HiStar className="w-4 h-4 text-cafe-accent" />
                        ) : (
                          <HiOutlineStar className="w-4 h-4 text-cafe-text-muted" />
                        )}
                      </button>

                      <div className="relative h-28 sm:h-32 overflow-hidden">
                        <img
                          src={getImageSrc(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {inCart && (
                          <div className="absolute top-2 right-2 bg-cafe-accent text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                            {inCart.quantity}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-cafe-text truncate">{product.name}</p>
                        <p className="text-sm font-bold text-cafe-accent tabular-nums">{formatCurrency(product.price, currency)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-cafe-text-muted">
                  {selectedCategory === 'recents' ? (
                    <p className="text-sm">No recently ordered items. Once you place orders, they will show up here! ☕</p>
                  ) : selectedCategory === 'favourites' ? (
                    <p className="text-sm">No favorite items. Tap the star icon on any product to bookmark it! ⭐</p>
                  ) : (
                    <p className="text-sm">No products found</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-full lg:w-[380px] bg-white border-l border-cafe-bg-secondary flex flex-col lg:h-full lg:overflow-hidden no-print">
        <div className="p-4 border-b border-cafe-bg-secondary flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cafe-text font-display">Cart</h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-danger hover:underline font-medium">Clear All</button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="flex items-center gap-3 bg-cafe-bg rounded-xl p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cafe-text truncate">{item.name}</p>
                  <p className="text-xs text-cafe-text-muted tabular-nums">{formatCurrency(item.price, currency)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-cafe-text-light hover:bg-cafe-bg-secondary transition-colors"
                  >
                    <HiOutlineMinus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center tabular-nums">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-cafe-text-light hover:bg-cafe-bg-secondary transition-colors"
                  >
                    <HiOutlinePlus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm font-semibold tabular-nums w-16 text-right">{formatCurrency(item.price * item.quantity, currency)}</p>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-cafe-text-muted hover:text-danger transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-cafe-text-muted">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs mt-1">Tap on products to build order</p>
            </div>
          )}
        </div>

        {/* Notes */}
        {cart.length > 0 && (
          <div className="px-4 pb-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Order notes..."
              rows={2}
              className="w-full px-3 py-2 bg-cafe-bg border border-cafe-bg-secondary rounded-xl text-xs resize-none focus:outline-none focus:ring-1 focus:ring-cafe-accent/30"
            />
          </div>
        )}

        {/* Totals & Payment */}
        <div className="p-4 border-t border-cafe-bg-secondary space-y-3 bg-white">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-cafe-text-light">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cafe-text-light text-sm">Discount</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                min="0"
                className="w-24 px-2 py-1 bg-cafe-bg border border-cafe-bg-secondary rounded-lg text-sm text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-cafe-accent/30"
              />
            </div>
            <div className="flex justify-between text-cafe-text-light">
              <span>GST ({settings?.taxPercentage || 5}%)</span>
              <span className="tabular-nums">{formatCurrency(gst, currency)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-cafe-text pt-2 border-t border-cafe-bg-secondary">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(total, currency)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  paymentMethod === method.value
                    ? 'bg-cafe-accent text-white shadow-soft'
                    : 'bg-cafe-bg text-cafe-text-light hover:bg-cafe-bg-secondary'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>

          {/* Place Order */}
          <Button
            className="w-full py-3.5 text-base"
            onClick={handlePlaceOrder}
            loading={createOrder.isPending}
            disabled={cart.length === 0}
          >
            Place Order & Print
          </Button>
        </div>
      </div>

      {/* Receipt (for print) */}
      {createPortal(
        <div className="receipt-container">
          <Receipt ref={receiptRef} order={lastOrder} settings={settings} />
        </div>,
        document.body
      )}

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && lastOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowReceipt(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-elevated p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold font-display">Order Placed ✅</h3>
                <button onClick={() => setShowReceipt(false)} className="p-1 rounded-lg hover:bg-cafe-bg-secondary"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <Receipt order={lastOrder} settings={settings} />
              <div className="flex gap-3 mt-4">
                <Button className="flex-1" onClick={handlePrint}>Print Receipt</Button>
                <Button variant="secondary" className="flex-1" onClick={() => setShowReceipt(false)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
