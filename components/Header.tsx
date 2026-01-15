import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { ShoppingBag, Truck, Lock, X, Heart } from 'lucide-react';

const Header = () => {
  const { cart, lang, toggleLang, wishlist } = useApp();
  const navigate = useNavigate();
  const [isPressing, setIsPressing] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    isLongPressRef.current = false;
    setIsPressing(true);
    
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsPressing(false);
      setShowAdminModal(true);
    }, 7000); // 7 seconds
  };

  const handleEnd = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleLogoClick = () => {
    // If it was a long press, don't navigate home
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    navigate('/');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "12346") {
      sessionStorage.setItem('shopyz_admin', 'true');
      setShowAdminModal(false);
      setPasswordInput("");
      navigate('/admin');
    } else {
      alert("Incorrect Password");
    }
  };

  return (
    <>
      <header 
        className="sticky top-0 z-50 px-[5%] py-4 flex justify-between items-center backdrop-blur-md border-b border-border transition-colors duration-300"
        style={{ backgroundColor: 'rgba(var(--white-rgb), 0.8)' }}
      >
        <div 
          className={`text-2xl font-extrabold text-primary select-none cursor-pointer origin-left ${isPressing ? 'scale-75 transition-transform duration-[7000ms] ease-linear' : 'scale-100 transition-transform duration-200 ease-out'}`}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchEnd={handleEnd}
          onTouchCancel={handleEnd}
          onClick={handleLogoClick}
          onContextMenu={(e) => e.preventDefault()}
          title="Long press 7s for Admin"
          style={{ 
            userSelect: 'none', 
            WebkitUserSelect: 'none', 
            WebkitTouchCallout: 'none',
            touchAction: 'none' 
          }}
        >
          shopyz
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLang}
            className="bg-transparent border-none text-primary font-extrabold cursor-pointer hover:scale-105 transition-transform"
          >
            {lang === 'en' ? 'AR' : 'EN'}
          </button>
          
          <Link to="/wishlist" className="relative text-dark hover:text-primary transition-colors">
            <Heart size={24} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
          </Link>

          <Link to="/track" className="text-dark hover:text-primary transition-colors">
            <Truck size={24} />
          </Link>
          
          <Link to="/checkout" className="relative text-dark hover:text-primary transition-colors">
            <ShoppingBag size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-card min-w-[20px] text-center">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </header>

      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[20px] shadow-2xl w-full max-w-md p-6 border border-border dark:border-zinc-800 relative">
            <button 
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                <Lock size={24} />
              </div>
              <h2 className="text-xl font-bold">Admin Access</h2>
              <p className="text-sm text-gray-500">Enter security password to continue</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password" 
                autoFocus
                placeholder="Password" 
                className="w-full p-3 rounded-xl border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary/50 text-center font-mono text-lg"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
              />
              <button 
                type="submit"
                className="w-full bg-primary text-white p-3 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;