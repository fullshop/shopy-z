import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang, TRANSLATIONS, CartItem } from './types';
import { Truck, CheckCircle, ShoppingBag, Heart, Info, AlertTriangle } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';

interface ToastMessage {
  id: number;
  message: string;
  icon: 'success' | 'info' | 'error' | 'bag' | 'heart';
}

interface AppContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: keyof typeof TRANSLATIONS['en'], params?: Record<string, string | number>) => string;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: (silent?: boolean) => void;
  showToast: (msg: string, icon?: ToastMessage['icon']) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('shopyz_lang') as Lang) || 'en');
  // Safer cart initialization to prevent "map of undefined" crash if local storage is corrupt
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
        const stored = localStorage.getItem('shopyz_cart');
        return stored ? (JSON.parse(stored) || []) : [];
    } catch {
        return [];
    }
  });
  
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
        const stored = localStorage.getItem('shopyz_wishlist');
        return stored ? (JSON.parse(stored) || []) : [];
    } catch {
        return [];
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Authenticate anonymously on load to ensure database access if rules require auth
  useEffect(() => {
    signInAnonymously(auth).catch((error) => {
      console.warn("Anonymous auth failed:", error);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('shopyz_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('shopyz_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('shopyz_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: keyof typeof TRANSLATIONS['en'], params?: Record<string, string | number>) => {
    let text = TRANSLATIONS[lang][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
    showToast(t('added_to_bag'), 'bag');
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = (silent: boolean = false) => {
    if (silent) {
      setCart([]);
    } else if (window.confirm("Clear bag?")) {
      setCart([]);
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
        const exists = prev.includes(id);
        if (exists) {
            showToast(t('removed'), 'info');
            return prev.filter(i => i !== id);
        } else {
            showToast(t('liked'), 'heart');
            return [...prev, id];
        }
    });
  };

  const showToast = (message: string, icon: ToastMessage['icon'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  return (
    <AppContext.Provider value={{ lang, toggleLang, t, cart, addToCart, removeFromCart, clearCart, showToast, wishlist, toggleWishlist }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="pointer-events-auto bg-white dark:bg-zinc-800 text-dark dark:text-white px-6 py-4 rounded-2xl shadow-2xl border-l-4 border-primary flex items-center gap-3 animate-[slideIn_0.3s_ease-out] shadow-primary/10"
          >
            {toast.icon === 'success' && <CheckCircle className="text-green-500 w-5 h-5" />}
            {toast.icon === 'bag' && <ShoppingBag className="text-primary w-5 h-5" />}
            {toast.icon === 'heart' && <Heart className="text-red-500 w-5 h-5 fill-current" />}
            {toast.icon === 'info' && <Info className="text-blue-500 w-5 h-5" />}
            {toast.icon === 'error' && <AlertTriangle className="text-yellow-500 w-5 h-5" />}
            <span className="font-semibold">{toast.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};