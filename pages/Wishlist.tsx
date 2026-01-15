import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { Product } from '../types';
import { useApp } from '../context';
import { Heart, Loader2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { DUMMY_PRODUCTS } from '../data';

const Wishlist = () => {
  const { wishlist, t } = useApp();
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
            // In a real large scale app, you'd probably store "liked" products fully in local storage or 
            // user profile to avoid N network requests. Here we fetch them one by one.
            const promises = wishlist.map(async (id) => {
                const snapshot = await get(ref(db, `products/${id}`));
                if (snapshot.exists()) {
                    return { id, ...snapshot.val() } as Product;
                }
                // Check dummy if not in DB
                const dummy = DUMMY_PRODUCTS.find(p => p.id === id);
                return dummy || null;
            });

            const results = await Promise.all(promises);
            setLikedProducts(results.filter((p): p is Product => p !== null));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    fetchWishlist();
  }, [wishlist]);

  return (
    <div className="min-h-[70vh] p-5 md:px-[5%] animate-fadeIn">
        <div className="max-w-[1600px] mx-auto">
            <button 
                onClick={() => navigate('/')}
                className="mb-6 text-gray-500 hover:text-primary transition-colors flex items-center gap-2 font-semibold"
            >
                <ArrowLeft size={20} />
                {t('home')}
            </button>

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
                        <Link to={`/product/${p.id}`} key={p.id} className="group block">
                             <div className="relative aspect-[4/5] bg-white dark:bg-zinc-900 rounded-[20px] overflow-hidden mb-3 border border-border dark:border-zinc-800 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:shadow-primary/5">
                                <img 
                                    src={p.images?.[0]} 
                                    alt={p.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                             </div>
                             <h3 className="font-bold text-dark dark:text-gray-100 truncate mb-1">{p.title}</h3>
                             <p className="text-primary font-extrabold">{p.price}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default Wishlist;