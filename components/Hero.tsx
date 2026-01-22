import React from 'react';
import { ArrowRight } from 'lucide-react';
import BrandIcon from './BrandIcon';
import HeroTextRotator from './HeroTextRotator';

interface HeroProps {
  onOpenDemo?: () => void;
}

export default function Hero({ onOpenDemo }: HeroProps) {
  return (
    <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Floating Icons Background Layer */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 hidden lg:block">
           {/* Left Side */}
           <div className="absolute top-1/4 left-10 xl:left-20 animate-float opacity-100">
              <BrandIcon type="netflix" className="w-16 h-16 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 rounded-2xl" />
           </div>
           <div className="absolute bottom-1/3 left-24 xl:left-40 animate-float-delayed opacity-90">
              <BrandIcon type="spotify" className="w-14 h-14 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 rounded-2xl" />
           </div>
           <div className="absolute top-2/3 left-10 xl:left-16 animate-float opacity-80">
              <BrandIcon type="adobe" className="w-12 h-12 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 rounded-2xl" />
           </div>

           {/* Right Side */}
           <div className="absolute top-1/3 right-10 xl:right-20 animate-float-delayed opacity-100">
              <BrandIcon type="youtube" className="w-16 h-16 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 rounded-2xl" />
           </div>
           <div className="absolute bottom-1/4 right-24 xl:right-32 animate-float opacity-90">
              <BrandIcon type="amazon" className="w-14 h-14 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 rounded-2xl" />
           </div>
           <div className="absolute top-20 right-32 xl:right-48 animate-float-delayed opacity-80">
             <BrandIcon type="apple" className="w-12 h-12 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 rounded-2xl" />
           </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm leading-6 text-gray-600 mb-8 hover:bg-gray-100 transition-colors cursor-default">
            <span>Global currency support is here</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>

          {/* New Rotating Hero Text Component */}
          <HeroTextRotator />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-6">
            <button className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
              Start Tracking Free
            </button>
            <button 
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Mobile-only static icon row */}
        <div className="lg:hidden mt-12 flex justify-center gap-6 opacity-80">
           <BrandIcon type="netflix" className="w-12 h-12 bg-white/90 shadow-md rounded-2xl border border-gray-100" />
           <BrandIcon type="spotify" className="w-12 h-12 bg-white/90 shadow-md rounded-2xl border border-gray-100" />
           <BrandIcon type="youtube" className="w-12 h-12 bg-white/90 shadow-md rounded-2xl border border-gray-100" />
           <BrandIcon type="amazon" className="w-12 h-12 bg-white/90 shadow-md rounded-2xl border border-gray-100" />
        </div>
      </div>
    </div>
  );
}