
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Product, CATEGORIES } from '../types';
import { useApp } from '../context';
import { Search, ShoppingBag, Loader2, ArrowLeft, SlidersHorizontal, X } from 'lucide-react';
import { DUMMY_PRODUCTS } from '../data';

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const { t } = useApp();
  const location = useLocation();

  useEffect(() => {
    // Check if category passed in state (from Home or other nav)
    if (location.state?.category) {
        setSelectedCategory(location.state.category);
    }
  }, [location]);

  useEffect(() => {
    const productRef = ref(db, 'products');
    const unsubscribe = onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Safe conversion of object to array with validation
        const productList = Object.entries(data).map(([key, value]) => {
          const val = value as any;
          return {
            id: key,
            title: val.title || 'Untitled Product',
            price: val.price || '0 DA',
            stock: typeof val.stock === 'number' ? val.stock : 0,
            description: val.description || '',
            images: Array.isArray(val.images) ? val.images : [],
            category: val.category || 'Uncategorized'
          };
        });
        // Initial load: Newest first (reverse order of insertion usually)
        setProducts(productList.reverse());
      } else {
        // Fallback only if DB is completely empty (first run)
        setProducts(DUMMY_PRODUCTS);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firebase read failed (using offline data):", error.message);
      setProducts(DUMMY_PRODUCTS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter & Sort Logic
  const getProcessedProducts = () => {
    let result = products.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== "All") {
        result = result.filter(p => p.category === selectedCategory);
    }

    if (sortBy === 'price_asc') {
        result.sort((a, b) => {
            const pa = parseInt(a.price.replace(/\D/g, '')) || 0;
            const pb = parseInt(b.price.replace(/\D/g, '')) || 0;
            return pa - pb;
        });
    } else if (sortBy === 'price_desc') {
        result.sort((a, b) => {
            const pa = parseInt(a.price.replace(/\D/g, '')) || 0;
            const pb = parseInt(b.price.replace(/\D/g, '')) || 0;
            return pb - pa;
        });
    } 
    // 'newest' is the default array order from Firebase (reversed above)
    
    return result;
  };

  const filteredProducts = getProcessedProducts();

  // Helper to safely handle image URLs
  const getImageUrl = (url?: string) => {
    if (!url) return 'https://placehold.co/400?text=No+Image';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (url.includes('images.unsplash.com')) {
       return `${url}&w=400&q=80`;
    }
    return url;
  };

  // Helper to translate category
  const getCategoryName = (cat: string) => {
     if (cat === "All") return t('all_categories');
     // Construct key dynamically e.g. cat_men
     const key = `cat_${cat.toLowerCase()}` as any;
     return t(key) !== key ? t(key) : cat;
  };

  return (
    <div className="min-h-screen bg-bg dark:bg-black pb-20">
      {/* Sticky Header with Search and Filter */}
      <div className="sticky top-[69px] z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-border dark:border-zinc-800 px-[5%] py-4 shadow-sm transition-all flex flex-col gap-4">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 rtl:right-4 rtl:left-auto" />
                <input 
                    type="text" 
                    placeholder={t('search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3.5 rounded-2xl border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-dark dark:text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none shadow-sm placeholder:text-gray-400"
                />
            </div>
            
            <div className="relative min-w-[180px]">
                <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 rtl:right-4 rtl:left-auto pointer-events-none" />
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full pl-10 pr-8 rtl:pr-10 rtl:pl-4 py-3.5 rounded-2xl border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-dark dark:text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none shadow-sm appearance-none cursor-pointer font-medium"
                >
                    <option value="newest">{t('newest')}</option>
                    <option value="price_asc">{t('price_low')}</option>
                    <option value="price_desc">{t('price_high')}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
            </div>
        </div>

        {/* Category Filter Pills */}
        <div className="max-w-[1600px] mx-auto w-full overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex gap-2 min-w-max px-1">
                <button
                    onClick={() => setSelectedCategory("All")}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                        selectedCategory === "All" 
                        ? 'bg-dark text-white border-dark dark:bg-white dark:text-black dark:border-white' 
                        : 'bg-white text-gray-600 border-border dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 hover:border-dark dark:hover:border-gray-500'
                    }`}
                >
                    {t('all_categories')}
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                            selectedCategory === cat 
                            ? 'bg-dark text-white border-dark dark:bg-white dark:text-black dark:border-white' 
                            : 'bg-white text-gray-600 border-border dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 hover:border-dark dark:hover:border-gray-500'
                        }`}
                    >
                        {getCategoryName(cat)}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <main className="p-5 md:px-[5%] max-w-[1600px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
             <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors">
                <ArrowLeft size={20} />
                {t('home')}
             </Link>
             {selectedCategory !== 'All' && (
                 <span className="text-sm text-gray-500 font-medium">
                    Showing: <span className="text-dark dark:text-white font-bold">{getCategoryName(selectedCategory)}</span>
                 </span>
             )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading collection...</p>
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-32 text-center animate-fadeIn">
                 <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">No products found</h2>
                 <p className="text-gray-400 max-w-xs mx-auto">
                    {searchTerm 
                        ? `No results for "${searchTerm}"`
                        : `No products found in ${getCategoryName(selectedCategory)}`
                    }
                 </p>
                 {selectedCategory !== 'All' && (
                    <button 
                        onClick={() => setSelectedCategory('All')} 
                        className="mt-4 text-primary font-bold hover:underline"
                    >
                        View All Products
                    </button>
                 )}
               </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 animate-fadeIn">
                {filteredProducts.map(p => (
                  <Link 
                    to={`/product/${p.id}`} 
                    key={p.id}
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-[4/5] bg-white dark:bg-zinc-900 rounded-[20px] overflow-hidden mb-3 border border-border dark:border-zinc-800 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:shadow-primary/5">
                      <img 
                        src={getImageUrl(p.images?.[0])} 
                        alt={p.title} 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {p.stock < 5 && p.stock > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          Low Stock
                        </div>
                      )}
                      {p.stock === 0 && (
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                Sold Out
                            </span>
                         </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="px-1">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">{p.category || 'General'}</div>
                      <h3 className="font-bold text-sm md:text-base text-dark dark:text-gray-100 line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                      <p className="font-extrabold text-primary text-base md:text-lg">
                        {p.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Catalog;
