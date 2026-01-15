import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useApp } from '../context';
import { Product } from '../types';
import { DUMMY_PRODUCTS } from '../data';
import { ArrowRight, Sparkles } from 'lucide-react';

const Home = () => {
  const { t } = useApp();
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch last 4 items for "New Arrivals"
    const recentProductsRef = query(ref(db, 'products'), limitToLast(4));
    
    const unsubscribe = onValue(recentProductsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list = Object.entries(data).map(([key, val]) => ({
                id: key,
                ...(val as any)
            })).reverse(); // Reverse to show newest first
            setNewArrivals(list);
        } else {
            // Fallback to dummy if empty
            setNewArrivals(DUMMY_PRODUCTS.slice(0, 4));
        }
        setLoading(false);
    }, (err) => {
        console.warn("Fetch home error", err);
        setNewArrivals(DUMMY_PRODUCTS.slice(0, 4));
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="pb-20">
      <main className="mx-[15px] mt-[15px] bg-primary rounded-[20px] min-h-[480px] flex flex-col md:flex-row text-white overflow-hidden animate-fadeIn shadow-lg shadow-primary/20 mb-12">
        <div className="flex-1 p-10 flex flex-col justify-center items-start z-10">
          <h1 
            className="text-[clamp(32px,8vw,52px)] font-extrabold leading-[1.1] mb-6 drop-shadow-sm"
            dangerouslySetInnerHTML={{ __html: t('find_style') }}
          />
          <Link 
            to="/catalog" 
            className="bg-white text-primary px-8 py-3.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
          >
            {t('shop_now')}
          </Link>
        </div>
        <div 
          className="flex-[1.2] min-h-[250px] bg-center bg-cover transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=40&w=800')" }}
        />
      </main>

      <section className="px-[5%] max-w-[1600px] mx-auto animate-fadeIn delay-100">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold flex items-center gap-2">
                <Sparkles className="text-yellow-500 fill-current" size={24} />
                {t('new_arrivals')}
            </h2>
            <Link to="/catalog" className="text-primary font-bold hover:underline flex items-center gap-1">
                {t('view_all')} <ArrowRight size={16} />
            </Link>
        </div>

        {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-[4/5] bg-gray-100 dark:bg-zinc-800 rounded-[20px] animate-pulse" />
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {newArrivals.map(p => (
                    <Link to={`/product/${p.id}`} key={p.id} className="group block">
                        <div className="aspect-[4/5] bg-white dark:bg-zinc-900 rounded-[20px] overflow-hidden mb-3 border border-border dark:border-zinc-800 relative">
                            <img 
                                src={p.images?.[0] || 'https://placehold.co/400?text=No+Image'} 
                                alt={p.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {p.stock < 5 && p.stock > 0 && (
                                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Last {p.stock}
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-dark dark:text-gray-100 truncate">{p.title}</h3>
                        <p className="text-primary font-extrabold">{p.price}</p>
                    </Link>
                ))}
            </div>
        )}
      </section>
    </div>
  );
};

export default Home;