import React, { useEffect, useState } from 'react';
import { ref, onValue, update, remove, push } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { useApp } from '../context';
import { Order, Product, CATEGORIES } from '../types';
import { Trash2, Download, Save, CheckSquare, Square, Database, Plus, X, Lock, Upload, Image as ImageIcon, Loader2, Package, ShoppingBag } from 'lucide-react';
import { DUMMY_PRODUCTS } from '../data';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
        } else {
            canvas.width = img.width;
            canvas.height = img.height;
        }
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const Admin = () => {
  const { t, showToast } = useApp();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  // Data State
  const [products, setProducts] = useState<(Product & { id: string })[]>([]);
  const [orders, setOrders] = useState<(Order & { id: string })[]>([]);
  const [revenue, setRevenue] = useState(0);
  
  // Product Management State
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    stock: 10,
    description: '',
    category: 'Men'
  });
  const [productImages, setProductImages] = useState<string[]>([]);

  useEffect(() => {
    // 1. Session Check (Client Side Security)
    const isAuth = sessionStorage.getItem('shopyz_admin') === 'true';
    if (!isAuth) {
      const pass = prompt("Admin Session Required. Enter Password:");
      if (pass === "12346") {
        sessionStorage.setItem('shopyz_admin', 'true');
        setIsAuthenticated(true);
      } else {
        navigate('/');
        return;
      }
    } else {
      setIsAuthenticated(true);
    }

    // 2. Firebase Auth (Silent) - Ensure we are authenticated if rules require it
    const ensureAuth = async () => {
        if (!auth.currentUser) {
            try {
                await signInAnonymously(auth);
            } catch (err) {
                console.warn("Anonymous auth failed. If DB Rules require auth, operations will fail.", err);
            }
        }
    };
    ensureAuth();

    // 3. Listeners
    const unsubProducts = onValue(ref(db, 'products'), (s) => {
      const data = s.val();
      if (data) {
        setProducts(Object.entries(data).map(([k, v]) => ({ ...(v as any), id: k })));
      } else {
        setProducts([]);
      }
    });

    const unsubOrders = onValue(ref(db, 'orders'), (s) => {
      const data = s.val();
      if (data) {
        const orderList = Object.entries(data).map(([key, val]) => ({
            ...(val as Order),
            id: key
        })).reverse();
        
        setOrders(orderList);
        
        const rev = orderList.reduce((acc, o) => {
          if (o.status === 'Delivered' && o.total) {
             const num = parseInt(o.total.toString().replace(/\D/g, '')) || 0;
             return acc + num;
          }
          return acc;
        }, 0);
        setRevenue(rev);
      }
    });

    return () => {
        unsubProducts();
        unsubOrders();
    };
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('shopyz_admin');
    setIsAuthenticated(false);
    navigate('/');
  };

  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-black"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  // --- Product Logic ---

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Delete product?")) {
      // Optimistic Update: Remove locally first
      const prevProducts = [...products];
      setProducts(prev => prev.filter(p => p.id !== id));

      try {
        await remove(ref(db, `products/${id}`));
        showToast("Product deleted", "info");
      } catch (e: any) {
         if (e.code === 'PERMISSION_DENIED' || e.message?.toLowerCase().includes('permission')) {
             // Keep local change (Admin Mode)
             showToast("Deleted locally (Server Permission Denied)", "error");
         } else {
             // Revert on real errors
             setProducts(prevProducts);
             showToast("Delete failed", "error");
         }
      }
    }
  };

  const handleBulkUpdate = async () => {
    const updates: Record<string, any> = {};
    selected.forEach(id => {
      if (bulkPrice) updates[`products/${id}/price`] = bulkPrice + " DA";
      if (bulkStock) updates[`products/${id}/stock`] = parseInt(bulkStock);
    });
    
    try {
        await update(ref(db), updates);
        setSelected([]);
        setBulkPrice("");
        setBulkStock("");
        showToast("Products updated", "success");
    } catch (e: any) {
         if (e.code === 'PERMISSION_DENIED' || e.message?.toLowerCase().includes('permission')) {
             showToast("Permission Denied: Enable Rules in Console", "error");
         } else {
             showToast("Update failed", "error");
         }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      Promise.all(files.map(file => compressImage(file as File)))
        .then(base64Images => {
          setProductImages(prev => [...prev, ...base64Images]);
        }).catch(() => {
          showToast("Failed to process images", "error");
        });
    }
  };

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.price) {
      showToast("Title and Price are required", "error");
      return;
    }

    setIsSubmitting(true);
    let formattedPrice = newProduct.price;
    if (!formattedPrice.toLowerCase().includes('da') && !formattedPrice.toLowerCase().includes('د.ج')) {
        formattedPrice = `${formattedPrice} DA`;
    }

    const productData = {
      title: newProduct.title,
      price: formattedPrice,
      stock: Number(newProduct.stock),
      description: newProduct.description,
      category: newProduct.category || 'Men',
      images: productImages.length > 0 ? productImages : ['https://placehold.co/600?text=No+Image']
    };

    try {
      await push(ref(db, 'products'), productData);
      setNewProduct({ title: '', price: '', stock: 10, description: '', category: 'Men' });
      setProductImages([]);
      setShowAddForm(false);
      showToast("Product saved!", "success");
    } catch (error: any) {
        if (error.code === 'PERMISSION_DENIED' || error.message?.toLowerCase().includes('permission')) {
             // Simulate Add
             const fakeId = "local_" + Date.now();
             setProducts(prev => [{ ...productData, id: fakeId } as any, ...prev]);
             setNewProduct({ title: '', price: '', stock: 10, description: '', category: 'Men' });
             setProductImages([]);
             setShowAddForm(false);
             showToast("Added locally (Server Permission Denied)", "error");
        } else {
             showToast("Failed to save: " + error.message, "error");
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm("Add sample products?")) return;
    try {
        const updates: Record<string, any> = {};
        DUMMY_PRODUCTS.forEach(p => { updates[p.id] = p; });
        await update(ref(db, 'products'), updates);
        showToast("Demo data loaded!", "success");
    } catch (e: any) {
         if (e.code === 'PERMISSION_DENIED') {
             // Simulate Seed
             setProducts(DUMMY_PRODUCTS as any);
             showToast("Loaded locally (Server Permission Denied)", "error");
         } else {
             showToast("Failed to load demo data", "error");
         }
    }
  };

  // --- Order Logic ---

  const exportCSV = () => {
    let csv = "ID,Name,Phone,Items,Total,Status,Date\n";
    orders.forEach(o => {
      const itemString = (o.items || []).map(i => i.title).join(' | ');
      const date = new Date(o.date).toLocaleDateString();
      csv += `${o.id},"${o.name}",${o.phone},"${itemString}",${o.total},${o.status},${date}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-5 md:px-[5%] bg-bg dark:bg-black min-h-screen pb-20">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-primary flex items-center gap-2">
          <Lock size={24} /> {t('admin_title')}
        </h1>
        <button onClick={handleLogout} className="text-red-500 font-bold text-sm hover:underline">Logout</button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card dark:bg-zinc-900 p-6 rounded-[20px] border-l-[6px] border-primary shadow-sm">
          <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">{t('delivered_revenue')}</h4>
          <h2 className="text-3xl font-extrabold">{revenue.toLocaleString()} DA</h2>
        </div>
        <div className="bg-card dark:bg-zinc-900 p-6 rounded-[20px] border-l-[6px] border-emerald-500 shadow-sm">
          <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">{t('all_orders')}</h4>
          <h2 className="text-3xl font-extrabold">{orders.length}</h2>
        </div>
        <button 
          onClick={exportCSV}
          className="bg-dark dark:bg-zinc-800 text-white p-6 rounded-[20px] font-bold flex flex-row justify-center items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Download size={20} />
          {t('csv')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border dark:border-zinc-800 pb-1">
        <button 
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-2 font-bold transition-colors relative ${activeTab === 'products' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <span className="flex items-center gap-2"><ShoppingBag size={18}/> Products</span>
            {activeTab === 'products' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-primary rounded-t-full" />}
        </button>
        <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-2 font-bold transition-colors relative ${activeTab === 'orders' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <span className="flex items-center gap-2"><Package size={18}/> Orders</span>
            {activeTab === 'orders' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-primary rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'products' ? (
          <>
            {/* Add Product Section */}
            <div className="mb-8">
                {!showAddForm ? (
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-primary text-white px-6 py-3 rounded-[20px] font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <Plus size={20} />
                    {t('add_product')}
                </button>
                ) : (
                <div className="bg-card dark:bg-zinc-900 p-6 rounded-[20px] border border-border dark:border-zinc-800 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{t('add_product')}</h3>
                    <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                        <X size={24} />
                    </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('title_label')}</label>
                            <input 
                            type="text" 
                            className="w-full p-3 rounded-xl border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50"
                            value={newProduct.title}
                            onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('price_label')}</label>
                            <input 
                            type="text" 
                            placeholder="e.g. 5,000 DA"
                            className="w-full p-3 rounded-xl border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50"
                            value={newProduct.price}
                            onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('stock')}</label>
                            <input 
                            type="number" 
                            className="w-full p-3 rounded-xl border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50"
                            value={newProduct.stock}
                            onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">{t('category')}</label>
                            <select 
                                className="w-full p-3 rounded-xl border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50"
                                value={newProduct.category}
                                onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-500 mb-1">{t('desc_label')}</label>
                    <textarea 
                        rows={3}
                        className="w-full p-3 rounded-xl border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                        value={newProduct.description}
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    />
                    </div>

                    <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-500 mb-2">{t('images_label')}</label>
                    
                    <div className="flex flex-col gap-4">
                        <label htmlFor="img-upload" className="cursor-pointer border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 rounded-xl p-8 flex flex-col items-center justify-center transition-colors gap-2 text-primary">
                        <Upload size={32} />
                        <span className="font-bold">{t('upload_images')}</span>
                        <input 
                            type="file" 
                            id="img-upload" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageSelect}
                        />
                        </label>

                        {productImages.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {productImages.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border dark:border-zinc-700">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                <X size={12} />
                                </button>
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                    </div>

                    <div className="flex gap-4">
                    <button 
                        onClick={handleAddProduct}
                        disabled={isSubmitting}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                        {t('save')}
                    </button>
                    <button 
                        onClick={() => setShowAddForm(false)}
                        className="bg-gray-100 dark:bg-zinc-800 text-dark dark:text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    </div>
                </div>
                )}
            </div>

            {selected.length > 0 && (
                <div className="bg-card dark:bg-zinc-900 p-6 rounded-[20px] border-2 border-primary mb-8 animate-fadeIn">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                    <input type="number" placeholder="New Price" className="p-3 rounded-lg border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} />
                    </div>
                    <div>
                    <input type="number" placeholder="New Stock" className="p-3 rounded-lg border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800" value={bulkStock} onChange={e => setBulkStock(e.target.value)} />
                    </div>
                    <button onClick={handleBulkUpdate} className="bg-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                    <Save size={18} /> {t('update')}
                    </button>
                </div>
                </div>
            )}

            <div className="bg-card dark:bg-zinc-900 rounded-[20px] shadow-sm overflow-hidden border border-border dark:border-zinc-800">
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-bg dark:bg-zinc-800 text-gray-500 text-xs uppercase">
                    <tr>
                        <th className="p-4">Select</th>
                        <th className="p-4">{t('product')}</th>
                        <th className="p-4">{t('category')}</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">{t('stock')}</th>
                        <th className="p-4 text-right">{t('action')}</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-zinc-800">
                    {products.map(p => (
                        <tr key={p.id} className="hover:bg-bg dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4">
                            <button onClick={() => toggleSelect(p.id)}>
                            {selected.includes(p.id) ? <CheckSquare className="text-primary" /> : <Square className="text-gray-400" />}
                            </button>
                        </td>
                        <td className="p-4 font-semibold">
                            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                                {p.images && p.images[0] ? (
                                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                    <ImageIcon size={16} />
                                    </div>
                                )}
                            </div>
                            {p.title}
                            </div>
                        </td>
                        <td className="p-4 text-sm text-gray-500">{p.category || '-'}</td>
                        <td className="p-4">{p.price}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {p.stock || 0}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
                            <Trash2 size={18} />
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            
            {products.length === 0 && (
                <div className="text-center py-12 animate-fadeIn">
                <p className="text-gray-500 mb-4">No products found. Start by adding one or loading the demo set.</p>
                <button 
                    onClick={handleSeed} 
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors"
                >
                    <Database size={18} />
                    Load Sample Products
                </button>
                <p className="text-xs text-gray-400 mt-2">Adds dummy data for testing.</p>
                </div>
            )}
          </>
      ) : (
        /* --- Orders Tab --- */
        <div className="bg-card dark:bg-zinc-900 rounded-[20px] shadow-sm overflow-hidden border border-border dark:border-zinc-800 animate-fadeIn">
            <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-bg dark:bg-zinc-800 text-gray-500 text-xs uppercase">
                <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-zinc-800">
                {orders.map(o => (
                    <tr key={o.id} className="hover:bg-bg dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-mono text-xs text-gray-500">#{o.id.slice(-6)}</td>
                    <td className="p-4">
                        <div className="font-bold">{o.name}</div>
                        <div className="text-xs text-gray-500">{o.phone}</div>
                        <div className="text-xs text-gray-400 mt-1">{o.wilaya} - {o.commune}</div>
                    </td>
                    <td className="p-4 max-w-[200px] truncate">
                        <div className="text-sm">
                            {(o.items || []).map(i => i.title).join(', ')}
                        </div>
                    </td>
                    <td className="p-4 font-bold text-primary">{o.total}</td>
                    <td className="p-4">
                        <div
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${
                                o.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900'
                                    : o.status === 'Shipped'
                                    ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900'
                                    : o.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900'
                            }`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    o.status === 'Delivered'
                                        ? 'bg-emerald-500'
                                        : o.status === 'Shipped'
                                        ? 'bg-sky-500'
                                        : o.status === 'Cancelled'
                                        ? 'bg-rose-500'
                                        : 'bg-amber-500'
                                }`}
                            />
                            <span>{o.status || 'Pending'}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">Read-only status</div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            {orders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No orders received yet.
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Admin;
