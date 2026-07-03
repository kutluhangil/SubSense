import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { trackError } from '../utils/analytics';

const ERROR_STRINGS: Record<string, { title: string; desc: string; reload: string }> = {
  tr: {
    title: "Bir şeyler yanlış gitti",
    desc: "Beklenmedik bir hatayla karşılaştık. Veri kaybını önlemek için uygulama duraklatıldı.",
    reload: "Uygulamayı Yenile",
  },
  en: {
    title: "Something went wrong",
    desc: "We encountered an unexpected error. The application has been paused to prevent data loss.",
    reload: "Reload Application",
  },
};

function getErrorStrings() {
  const lang = localStorage.getItem('userLanguagePreference') || 'en';
  return ERROR_STRINGS[lang] || ERROR_STRINGS.en;
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  // Explicitly declare props to avoid TS error
  declare props: Props;

  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for local debugging
    console.error("Uncaught error:", error, errorInfo);
    
    // Log to Analytics (Privacy-safe)
    trackError('ErrorBoundary', error.message || 'Unknown UI Crash');
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{getErrorStrings().title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              {getErrorStrings().desc}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={18} /> {getErrorStrings().reload}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}