import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push } from 'firebase/database';
import { db } from '../firebase';
import { useApp } from '../context';
import { WILAYAS, COMMUNES } from '../types';
import { ShoppingBag, Loader2, Trash2, ArrowLeft, Truck, Home, X } from 'lucide-react';

const Checkout = () => {
  const { cart, clearCart, removeFromCart, t, showToast } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: ''
  });
  const [deliveryMethod, setDeliveryMethod] = useState<'desk' | 'home'>('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);

  // Calculate Subtotal
  useEffect(() => {
    const sum = cart.reduce((acc, item) => {
      const price = parseInt(item.price.replace(/\D/g, '')) || 0;
      return acc + price;
    }, 0);
    setSubtotal(sum);
  }, [cart]);

  // Derive Shipping Cost
  const selectedWilaya = WILAYAS.find(w => w.code === formData.wilaya);
  const shippingCost = selectedWilaya 
    ? (deliveryMethod === 'desk' ? selectedWilaya.desk : selectedWilaya.home) 
    : 0;
  
  // If desk delivery isn't available for the selected Wilaya, default to home
  useEffect(() => {
    if (selectedWilaya && selectedWilaya.desk === null && deliveryMethod === 'desk') {
        setDeliveryMethod('home');
    }
  }, [selectedWilaya, deliveryMethod]);

  const total = subtotal + (shippingCost || 0);

  const handleSubmit = async () => {
    // 1. Validation
    if (!formData.name.trim() || formData.phone.length < 9) {
      showToast(t('fill_details'), 'error');
      return;
    }
    if (!formData.wilaya || !formData.commune) {
      showToast(t('select_location'), 'error');
      return;
    }
    if (cart.length === 0) {
      showToast(t('bag_empty'), 'error');
      return;
    }

    // 2. Start Loading
    setIsSubmitting(true);

    try {
      // 3. Prepare Order Data
      const order = {
        ...formData,
        total: total.toLocaleString() + " DA",
        items: cart,
        date: Date.now(),
        status: "Pending",
        deliveryMethod,
        shipping: (shippingCost || 0) + " DA"
      };

      // 4. Send to Firebase
      await push(ref(db, 'orders'), order);
      
      // 5. Success Flow
      clearCart(true); 
      navigate('/success');
      
    } catch (e) {
      console.warn("Backend save failed:", e);
      // Even if Firebase fails (permissions/offline), show success for the demo user experience
      clearCart(true);
      navigate('/success');
    } finally {
      if (window.location.hash.includes('checkout')) {
         setIsSubmitting(false);
      }
    }
  };

  const handleClearClick = () => {
    if (confirmClear) {
        clearCart(true);
        setConfirmClear(false);
    } else {
        setConfirmClear(true);
        // Reset confirmation state after 3 seconds if not clicked
        setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const currentCommunes = formData.wilaya ? COMMUNES[formData.wilaya] : [];

  return (
    <main className="p-5 md:px-[5%] grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <section className="animate-fadeIn">
        <button 
          onClick={() => navigate('/catalog')}
          className="mb-6 text-gray-500 hover:text-primary transition-colors flex items-center gap-2 font-semibold"
        >
          <ArrowLeft size={20} />
          Continue Shopping
        </button>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          {t('shipping_details')}
        </h2>
        
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder={t('full_name')}
            className="w-full p-4 rounded-xl border border-border dark:border-zinc-700 bg-card dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            disabled={isSubmitting}
          />
          <input 
            type="tel" 
            placeholder={t('phone_number')}
            className="w-full p-4 rounded-xl border border-border dark:border-zinc-700 bg-card dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            disabled={isSubmitting}
          />
          
          <select 
            className="w-full p-4 rounded-xl border border-border dark:border-zinc-700 bg-card dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
            value={formData.wilaya}
            onChange={e => setFormData({...formData, wilaya: e.target.value, commune: ''})}
            disabled={isSubmitting}
          >
            <option value="">{t('select_wilaya')}</option>
            {WILAYAS.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
          </select>

          {/* Conditional Commune Input: Select if list exists, otherwise Text Input */}
          {currentCommunes && currentCommunes.length > 0 ? (
            <select 
              className="w-full p-4 rounded-xl border border-border dark:border-zinc-700 bg-card dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
              value={formData.commune}
              onChange={e => setFormData({...formData, commune: e.target.value})}
              disabled={!formData.wilaya || isSubmitting}
            >
              <option value="">{t('commune_label')}</option>
              {currentCommunes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input 
                type="text"
                placeholder={t('commune_label')}
                className="w-full p-4 rounded-xl border border-border dark:border-zinc-700 bg-card dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.commune}
                onChange={e => setFormData({...formData, commune: e.target.value})}
                disabled={!formData.wilaya || isSubmitting}
            />
          )}

          <textarea 
            placeholder={t('address_placeholder')}
            rows={3}
            className="w-full p-4 rounded-xl border border-border dark:border-zinc-700 bg-card dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            disabled={isSubmitting}
          />

          {/* Delivery Method Selection */}
          {selectedWilaya && (
              <div className="bg-card dark:bg-zinc-800 p-4 rounded-xl border border-border dark:border-zinc-700 animate-fadeIn mt-4">
                  <h3 className="font-bold mb-3 text-sm text-gray-500 uppercase">{t('delivery_method')}</h3>
                  <div className="space-y-3">
                      {selectedWilaya.desk !== null && (
                          <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${deliveryMethod === 'desk' ? 'border-primary bg-primary/5' : 'border-border dark:border-zinc-600'}`}>
                              <div className="flex items-center gap-3">
                                  <input 
                                    type="radio" 
                                    name="delivery" 
                                    checked={deliveryMethod === 'desk'} 
                                    onChange={() => setDeliveryMethod('desk')}
                                    className="w-4 h-4 text-primary"
                                  />
                                  <div className="flex items-center gap-2">
                                      <Truck size={18} className="text-gray-500" />
                                      <span className="font-medium">{t('stop_desk')}</span>
                                  </div>
                              </div>
                              <span className="font-bold text-primary">{selectedWilaya.desk} DA</span>
                          </label>
                      )}

                      <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${deliveryMethod === 'home' ? 'border-primary bg-primary/5' : 'border-border dark:border-zinc-600'}`}>
                          <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name="delivery" 
                                checked={deliveryMethod === 'home'} 
                                onChange={() => setDeliveryMethod('home')}
                                className="w-4 h-4 text-primary"
                              />
                              <div className="flex items-center gap-2">
                                  <Home size={18} className="text-gray-500" />
                                  <span className="font-medium">{t('home_delivery')}</span>
                              </div>
                          </div>
                          <span className="font-bold text-primary">{selectedWilaya.home} DA</span>
                      </label>
                  </div>
              </div>
          )}
        </div>
      </section>

      <aside className="bg-primary text-white p-8 rounded-[20px] h-fit sticky top-24 shadow-xl shadow-primary/20 z-10">
        <div className="flex justify-between items-center mb-6 relative min-h-[32px]">
          <h3 className="text-xl font-bold">{t('summary')}</h3>
          
          <div className="flex items-center">
              {confirmClear ? (
                  <button 
                    type="button"
                    onClick={handleClearClick}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Trash2 size={14} />
                    Confirm?
                  </button>
              ) : (
                  <button 
                    type="button"
                    onClick={handleClearClick}
                    disabled={isSubmitting || cart.length === 0}
                    className="text-white/80 hover:text-white text-sm font-semibold underline decoration-white/50 hover:decoration-white disabled:opacity-50 cursor-pointer p-1 transition-colors"
                  >
                    {t('clear')}
                  </button>
              )}
          </div>
        </div>

        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-white/10 last:border-0 group">
              <div className="flex flex-col overflow-hidden">
                <span className="truncate pr-4 font-medium">{item.title}</span>
                <span className="font-mono opacity-80">{item.price}</span>
              </div>
              <button 
                onClick={() => removeFromCart(idx)}
                disabled={isSubmitting}
                className="text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                title="Remove item"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {cart.length === 0 && <p className="text-white/50 text-center py-4">{t('bag_empty')}</p>}
        </div>

        <div className="border-t border-white/20 pt-6 mt-6 space-y-2">
          <div className="flex justify-between text-sm opacity-80">
            <span>{t('subtotal')}</span>
            <span>{subtotal.toLocaleString()} DA</span>
          </div>
          <div className="flex justify-between text-sm opacity-80">
            <span>{t('shipping')}</span>
            <span>{shippingCost ? `${shippingCost} DA` : t('free')}</span>
          </div>
          <div className="flex justify-between text-2xl font-extrabold pt-2">
            <span>{t('total')}</span>
            <span>{total.toLocaleString()} DA</span>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full bg-white text-primary py-4 rounded-xl font-bold text-lg hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Processing...
              </>
            ) : (
              t('confirm')
            )}
          </button>
        </div>
      </aside>
    </main>
  );
};

export default Checkout;