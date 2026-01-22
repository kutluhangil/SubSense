import React from 'react';
import { ArrowRight } from 'lucide-react';
import BrandIcon from './BrandIcon';

export default function Hero() {
  return (
    <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Floating Icons Background Layer - Absolute positioned specifically for visual decoration */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 hidden lg:block">
           {/* Left Side */}
           <div className="absolute top-1/4 left-10 xl:left-20 animate-float opacity-80">
              <BrandIcon type="netflix" className="w-12 h-12 shadow-lg rounded-xl" />
           </div>
           <div className="absolute bottom-1/3 left-24 xl:left-40 animate-float-delayed opacity-60">
              <BrandIcon type="spotify" className="w-10 h-10 shadow-md rounded-lg" />
           </div>
           <div className="absolute top-2/3 left-10 xl:left-16 animate-float opacity-40">
              <BrandIcon type="adobe" className="w-8 h-8 shadow-sm rounded-md" />
           </div>

           {/* Right Side */}
           <div className="absolute top-1/3 right-10 xl:right-20 animate-float-delayed opacity-80">
              <BrandIcon type="youtube" className="w-12 h-12 shadow-lg rounded-xl" />
           </div>
           <div className="absolute bottom-1/4 right-24 xl:right-32 animate-float opacity-60">
              <BrandIcon type="amazon" className="w-10 h-10 shadow-md rounded-lg" />
           </div>
           <div className="absolute top-20 right-32 xl:right-48 animate-float-delayed opacity-50">
             <BrandIcon type="apple" className="w-9 h-9 shadow-sm rounded-lg" />
           </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm leading-6 text-gray-600 mb-8 hover:bg-gray-100 transition-colors cursor-default">
            <span>Global currency support is here</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Master your recurring <br className="hidden sm:block" />
            <span className="text-gray-500">expenses effortlessly.</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop losing money on forgotten subscriptions. Track, manage, and optimize your global spending in one minimalist dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
              Start Tracking Free
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
              View Demo
            </button>
          </div>
        </div>

        {/* Mobile-only static icon row to ensure visibility without cluttering */}
        <div className="lg:hidden mt-12 flex justify-center gap-6 opacity-70">
           <BrandIcon type="netflix" className="w-10 h-10 shadow-sm rounded-xl" />
           <BrandIcon type="spotify" className="w-10 h-10 shadow-sm rounded-xl" />
           <BrandIcon type="youtube" className="w-10 h-10 shadow-sm rounded-xl" />
           <BrandIcon type="amazon" className="w-10 h-10 shadow-sm rounded-xl" />
        </div>
      </div>
    </div>
  );
}