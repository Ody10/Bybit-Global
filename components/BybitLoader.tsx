'use client';

import React from 'react';

interface BybitLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const BybitLoader: React.FC<BybitLoaderProps> = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} font-bold bybit-loader`}>
        <span className="text-white">BYB</span>
        <span className="text-bybit-yellow">I</span>
        <span className="text-white">T</span>
      </div>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-bybit-yellow rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-bybit-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-bybit-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-bybit-dark z-50 flex items-center justify-center">
        {loader}
      </div>
    );
  }

  return loader;
};

export default BybitLoader;