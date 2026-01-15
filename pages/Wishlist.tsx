import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { Product } from '../types';
import { useApp } from '../context';
import { Heart, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { DUMMY_PRODUCTS } from '../data';

const Wishlist = () => {
  const { wishlist, t, toggleWishlist } = useApp();
  const navigate = useNavigate();
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
        if (wishlist.length === 0) {
            setLikedProducts([]);
            setLoading(false);
            return;
        }

        try {
            const promises = wishlist.map(async (id) => {
                try {
                    const snapshot = await get(ref(db, `products/${id}`));
                    if (snapshot.exists()) {
                        return { id, ...snapshot.val() } as Product;
                    }
                } catch {
                    // Ignore individual fetch errors
                }
                const dummy = DUMMY_PRODUCTS.find(p => p.id === id);
                return dummy || null;
            });

            const results = await Promise.all(promises);
            setLikedProducts(results.filter((p): p is Product => p !== null));
        } catch (error) {
            console.error("Wishlist sync error", error);
        } finally {
            setLoading(false);
        }
    };

    fetchWishlist();
  }, [wishlist]);

  const clearAll = () => {
      if(window.confirm("Remove all items from wishlist?")) {
          // We can't clear array directly as context manages it via toggles
          // But we can iterate and remove (or better, add a clearWishlist to context, but for now simple iteration is fine)
          wishlist.forEach(id => toggleWishlist(id));
      }
  };

  return (
    <div className="min-h-[70vh] p-5 md:px-[5%] animate-fadeIn pb-20">
        <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={() => navigate('/')}
                    className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2 font-semibold"
                >
                    <ArrowLeft size={20} />
                    {t('home')}
                </button>
                
                {likedProducts.length > 0 && (
                    <button 
                        onClick={clearAll}
                        className="text-red-500 hover:text-red-600 text-sm font-bold flex items-center gap-1 bg-red-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Trash2 size={14} />
                        Clear All
                    </button>
                )}
            </div>

            <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
                <Heart className="fill-red-500 text-red-500" />
                {t('wishlist')}
            </h1>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                </div>
            ) : likedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-zinc-900 rounded-[30px] border-2 border-dashed border-gray-200 dark:border-zinc-800">
                    <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                         <Heart className="w-8 h-8 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">{t('empty_wishlist')}</h2>
                    <p className="text-gray-400 mb-6 max-w-xs">Start browsing and add items you love to your wishlist.</p>
                    <Link to="/catalog" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20">
                        {t('shop_now')}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                    {likedProducts.map(p => (
                        <div key={p.id} className="group relative">
                             <Link to={`/product/${p.id}`} className="block">
                                <div className="relative aspect-[4/5] bg-white dark:bg-zinc-900 rounded-[20px] overflow-hidden mb-3 border border-border dark:border-zinc-800 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:shadow-primary/5">
                                    <img 
                                        src={p.images?.[0]} 
                                        alt={p.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Quick remove button */}
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleWishlist(p.id);
                                        }}
                                        className="absolute top-2 right-2 bg-white/90 dark:bg-black/60 text-gray-500 hover:text-red-500 p-2 rounded-full shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-dark dark:text-gray-100 truncate mb-1">{p.title}</h3>
                                <p className="text-primary font-extrabold">{p.price}</p>
                             </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default Wishlist;