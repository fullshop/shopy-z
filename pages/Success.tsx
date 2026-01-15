import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { Check } from 'lucide-react';

const Success = () => {
  const { t } = useApp();

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-5 animate-fadeIn">
      <div className="w-[80px] h-[80px] bg-primary text-white rounded-full flex items-center justify-center mb-5 text-4xl shadow-lg shadow-primary/30">
        <Check size={32} strokeWidth={3} />
      </div>
      <h1 className="text-4xl font-extrabold mb-4">{t('order_success')}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-[30px] text-lg">{t('thank_you')}</p>
      <Link 
        to="/" 
        className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:scale-105 transition-transform"
      >
        {t('return_home')}
      </Link>
    </div>
  );
};

export default Success;