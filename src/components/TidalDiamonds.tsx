import React from 'react';

interface TidalDiamondsProps {
  className?: string;
  size?: number;
}

export const TidalDiamonds: React.FC<TidalDiamondsProps> = ({ className = 'text-[#00e5ff]', size = 18 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="Tidal Logo"
    >
      {/* 3 Top Diamonds, 1 Bottom Center Diamond */}
      <polygon points="6,4 10,8 6,12 2,8" />
      <polygon points="14,4 18,8 14,12 10,8" />
      <polygon points="22,4 26,8 22,12 18,8" />
      <polygon points="10,12 14,16 10,20 6,16" />
    </svg>
  );
};
