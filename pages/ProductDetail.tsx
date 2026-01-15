import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ref, onValue, push } from 'firebase/database';
import { db } from '../firebase';
import { Product, Review } from '../types';
import { useApp } from '../context';
import { Heart, Share2, Send, HandCoins, Loader2, AlertCircle, ArrowLeft, Check, Link as LinkIcon, X, MessageCircle, Facebook, Twitter, Mail, Copy } from 'lucide-react';
import { DUMMY_PRODUCTS } from '../data';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, addToCart, showToast, wishlist, toggleWishlist } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isLiked = id ? wishlist.includes(id) : false;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    const pRef = ref(db, `products/${id}`);
    const unsubProduct = onValue(pRef, (s) => {
      const val = s.val();
      if (val) {
        setProduct(val);
      } else {
        const dummy = DUMMY_PRODUCTS.find(p => p.id === id);
        if (dummy) setProduct(dummy);
        else setProduct(null);
      }
      setLoading(false);
    }, (error) => {
        console.warn("Product read failed:", error.message);
        const dummy = DUMMY_PRODUCTS.find(p => p.id === id);
        if (dummy) setProduct(dummy);
        else setProduct(null);
        setLoading(false);
    });

    const rRef = ref(db, `comments/${id}`);
    const unsubComments = onValue(rRef, (s) => {
      const data = s.val();
      if (data) {
        setReviews(Object.values(data));
      } else {
        setReviews([]);
      }
    }, () => setReviews([]));

    return () => {
        unsubProduct();
        unsubComments();
    };
  }, [id]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-400">Loading product...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-5">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The product you are looking for might have been removed.</p>
        <Link to="/catalog" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
            Browse Catalog
        </Link>
    </div>
  );

  const copyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "0";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      if (navigator.clipboard) {
         navigator.clipboard.writeText(text).then(() => true).catch(() => false);
         return true; 
      }
      return false;
    }
  };

  const handleCopyLink = () => {
    const success = copyToClipboard(window.location.href);
    if (success) {
      setShareSuccess(true);
      showToast(t('link_copied'), 'info');
      setTimeout(() => setShareSuccess(false), 2000);
    }
    setShowShareModal(false);
  };

  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(product.title);
    
    let link = '';
    switch(platform) {
        case 'whatsapp': 
            link = `https://wa.me/?text=${title}%20${url}`; 
            break;
        case 'facebook': 
            link = `https://www.facebook.com/sharer/sharer.php?u=${url}`; 
            break;
        case 'twitter': 
            link = `https://twitter.com/intent/tweet?text=${title}&url=${url}`; 
            break;
        case 'email': 
            link = `mailto:?subject=${title}&body=${url}`; 
            break;
    }
    if (link) window.open(link, '_blank');
    setShowShareModal(false);
  };

  const handlePostComment = () => {
    if (!comment.trim() || !id) return;
    push(ref(db, `comments/${id}`), { text: comment })
      .catch(() => showToast("Could not post review (Offline)", "error"));
    setComment("");
    setReviews(prev => [...prev, { text: comment }]);
  };

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://placehold.co/600?text=No+Image'];

  return (
    <main className="p-5 md:px-[10%] animate-fadeIn relative">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-500 hover:text-primary transition-colors flex items-center gap-2 font-bold group"
      >
        <div className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-sm group-hover:shadow-md transition-all border border-border dark:border-zinc-700">
            <ArrowLeft size={20} />
        </div>
        <span>Back</span>
      </button>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
            <div className="bg-bg dark:bg-zinc-800 rounded-[20px] aspect-square overflow-hidden flex items-center justify-center border border-border dark:border-zinc-800 shadow-sm">
                <img 
                    src={images[currentImageIndex]} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-opacity duration-300" 
                />
            </div>
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                                currentImageIndex === idx 
                                ? 'border-primary opacity-100 scale-105' 
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
        
        <div className="flex flex-col justify-center">
          {product.stock <= 5 && product.stock > 0 && (
            <div className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-lg text-xs font-bold w-fit mb-4">
              {t('scarcity', { stock: product.stock })}
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">{product.title}</h1>
          <p className="text-3xl font-extrabold text-primary mb-6">{product.price}</p>
          
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => id && toggleWishlist(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isLiked ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-card border border-border dark:bg-zinc-800 dark:border-zinc-700'}`}
            >
              <Heart className={isLiked ? "fill-current" : ""} size={20} />
              {t('like')}
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border transition-all ${
                  shareSuccess 
                  ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20' 
                  : 'bg-card border-border dark:bg-zinc-800 dark:border-zinc-700 hover:bg-bg'
              }`}
            >
              {shareSuccess ? <Check size={20} /> : <Share2 size={20} />}
              {shareSuccess ? t('link_copied') : t('share')}
            </button>
          </div>

          <div className="mb-6 flex items-center gap-3 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200 dark:border-green-900 w-fit">
            <HandCoins size={20} />
            <span className="font-semibold">{t('pay_at_door')}</span>
          </div>

          <button 
            onClick={() => addToCart({ id: id!, title: product.title, price: product.price })}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/30"
          >
            {t('added_to_bag')}
          </button>
        </div>
      </div>

      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('comments')}</h2>
        
        <div className="space-y-4 mb-8">
          {reviews.length === 0 && <p className="text-gray-500 italic">No reviews yet.</p>}
          {reviews.map((r, idx) => (
            <div key={idx} className="bg-card dark:bg-zinc-900 p-4 rounded-xl border border-border dark:border-zinc-800">
              <strong className="block text-sm text-primary mb-1">Verified Buyer</strong>
              <p className="text-gray-700 dark:text-gray-300">{r.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-card dark:bg-zinc-900 p-4 rounded-2xl border border-border dark:border-zinc-800">
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a review..."
            className="w-full bg-bg dark:bg-zinc-800 rounded-xl p-3 min-h-[100px] outline-none border border-transparent focus:border-primary transition-colors resize-none mb-3"
          />
          <button 
            onClick={handlePostComment}
            className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 ml-auto hover:bg-primary/90"
          >
            <Send size={16} />
            {t('post')}
          </button>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
            onClick={() => setShowShareModal(false)}
        >
            <div 
                className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[24px] p-6 relative border border-border dark:border-zinc-800 shadow-2xl scale-100 animate-[fadeIn_0.2s_ease-out]"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={() => setShowShareModal(false)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-2 bg-gray-50 dark:bg-zinc-800 rounded-full"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold mb-6 text-center">Share this product</h3>
                
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <button onClick={() => handleSocialShare('whatsapp')} className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300">
                            <MessageCircle size={28} />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">WhatsApp</span>
                    </button>
                    
                    <button onClick={() => handleSocialShare('facebook')} className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1877F2] group-hover:text-white transition-all duration-300">
                            <Facebook size={28} />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Facebook</span>
                    </button>
                    
                    <button onClick={() => handleSocialShare('twitter')} className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/10 text-dark dark:text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
                            <Twitter size={28} />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Twitter</span>
                    </button>
                    
                    <button onClick={() => handleSocialShare('email')} className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                            <Mail size={28} />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Email</span>
                    </button>
                </div>

                <div className="bg-bg dark:bg-black/40 p-1.5 rounded-xl flex items-center gap-2 border border-border dark:border-zinc-800">
                    <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-lg text-gray-400">
                        <LinkIcon size={18} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-gray-500 mb-0.5 font-semibold">Page Link</p>
                        <p className="text-xs font-mono truncate text-dark dark:text-gray-300 opacity-80">{window.location.href}</p>
                    </div>
                    <button 
                        onClick={handleCopyLink} 
                        className="bg-dark dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <Copy size={14} />
                        Copy
                    </button>
                </div>
            </div>
        </div>
      )}
    </main>
  );
};

export default ProductDetail;