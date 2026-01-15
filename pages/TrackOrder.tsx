import React, { useState } from 'react';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useApp } from '../context';
import { Order } from '../types';
import { Search, Package, AlertCircle, CheckCircle, Clock, Truck, XCircle, ArrowLeft } from 'lucide-react';

const TrackOrder = () => {
  const { t } = useApp();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // We fetch all orders and filter client-side to avoid "Index not defined" errors 
      // common in simple Firebase setups without checking firebase.json rules.
      const snapshot = await get(ref(db, 'orders'));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert object to array and search
        const orders = Object.values(data) as Order[];
        
        // precise match on phone
        const found = orders.find(o => o.phone.replace(/\D/g,'') === phone.replace(/\D/g,''));
        
        if (found) {
          setResult(found);
        } else {
          setError(t('not_found'));
        }
      } else {
        setError(t('not_found'));
      }
    } catch (e) {
      console.error(e);
      setError("Unable to connect to service.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Delivered': return <CheckCircle className="text-green-500 w-8 h-8" />;
      case 'Shipped': return <Truck className="text-blue-500 w-8 h-8" />;
      case 'Cancelled': return <XCircle className="text-red-500 w-8 h-8" />;
      default: return <Clock className="text-yellow-500 w-8 h-8" />;
    }
  };

  return (
    <main className="min-h-[70vh] flex flex-col items-center pt-20 px-[5%] text-center animate-fadeIn relative">
      <div className="w-full max-w-md flex justify-start mb-4 absolute top-4 left-[5%] md:relative md:top-0 md:left-0">
        <button 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2 font-semibold"
        >
            <ArrowLeft size={20} />
            {t('home')}
        </button>
      </div>

      <div className="bg-primary/5 p-4 rounded-full mb-6 mt-8 md:mt-0">
        <Package size={48} className="text-primary" />
      </div>
      
      <h1 className="text-3xl font-extrabold mb-4">{t('track')}</h1>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">Enter the phone number used during checkout to see your order status.</p>
      
      <div className="w-full max-w-md relative mb-8">
        <input 
          type="tel" 
          placeholder={t('phone_number_simple')}
          className="w-full p-4 pl-12 rounded-2xl border border-border dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none text-dark dark:text-white shadow-sm focus:ring-2 focus:ring-primary/50 transition-all"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>

      <button 
        onClick={handleTrack}
        disabled={loading}
        className="w-full max-w-md bg-primary text-white p-4 rounded-2xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
      >
        {loading ? 'Searching...' : t('find_order')}
      </button>

      {error && (
        <div className="mt-6 flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl animate-fadeIn">
          <AlertCircle size={20} />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-8 w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-border dark:border-zinc-800 text-left shadow-lg animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-purple-400" />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Customer</span>
              <h3 className="font-bold text-lg">{result.name}</h3>
            </div>
            <div className="flex flex-col items-end">
               {getStatusIcon(result.status)}
               <span className={`text-xs font-bold mt-1 uppercase ${
                 result.status === 'Delivered' ? 'text-green-500' :
                 result.status === 'Cancelled' ? 'text-red-500' :
                 result.status === 'Shipped' ? 'text-blue-500' : 'text-yellow-600'
               }`}>
                 {result.status}
               </span>
            </div>
          </div>

          <div className="space-y-3 mb-6 bg-bg dark:bg-zinc-800/50 p-4 rounded-xl">
             {(result.items || []).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                   <span className="text-gray-600 dark:text-gray-300 truncate pr-2">{item.title}</span>
                   <span className="font-mono font-bold">{item.price}</span>
                </div>
             ))}
             <div className="border-t border-border dark:border-zinc-700 mt-2 pt-2 flex justify-between font-extrabold">
                <span>{t('total')}</span>
                <span className="text-primary">{result.total}</span>
             </div>
          </div>
          
          <div className="text-xs text-center text-gray-400">
            Order placed on {new Date(result.date).toLocaleDateString()}
          </div>
        </div>
      )}
    </main>
  );
};

export default TrackOrder;