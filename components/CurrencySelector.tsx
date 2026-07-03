
import React, { useState, useMemo } from 'react';
import { Search, Check, X } from 'lucide-react';
import { CURRENCY_DATA } from '../utils/currency';

interface CurrencySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onSelect: (code: string) => void;
}

export default function CurrencySelector({ isOpen, onClose, selectedCurrency, onSelect }: CurrencySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const currencies = useMemo(() => {
    return Object.values(CURRENCY_DATA).filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] sm:max-h-[600px] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Currency</h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search currency (e.g. USD, Euro)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3">
          {currencies.length > 0 ? (
            <div className="space-y-1">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => { onSelect(currency.code); onClose(); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    selectedCurrency === currency.code
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl shadow-sm rounded-md overflow-hidden">{currency.flag}</span>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${selectedCurrency === currency.code ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-white'}`}>
                        {currency.code}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currency.name}
                      </p>
                    </div>
                  </div>
                  {selectedCurrency === currency.code && (
                    <div className="text-indigo-600 dark:text-indigo-400">
                      <Check size={20} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
              No currencies found matching "{searchTerm}"
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
