'use client';

import { useState } from 'react';

type BrandItem = {
  name: string;
  slug: string;
  badge: string;
  src: string;
  tint: string;
};

const SUPPORTING_BRANDS: BrandItem[] = [
  { name: 'Jupiter', slug: 'jupiter', badge: 'J', src: '/brand/ecosystem/jupiter.png', tint: 'from-[#5eead4]/18 to-[#0f766e]/18' },
  { name: 'Pyth', slug: 'pyth', badge: 'P', src: '/brand/ecosystem/pyth.png', tint: 'from-[#ffffff]/14 to-[#6b7280]/14' },
  { name: 'Supabase', slug: 'supabase', badge: 'S', src: '/brand/ecosystem/supabase.png', tint: 'from-[#4ade80]/18 to-[#166534]/18' },
  { name: 'Superteamind', slug: 'superteamind', badge: 'ST', src: '/brand/ecosystem/superteamind.png', tint: 'from-[#d8b4fe]/18 to-[#7c3aed]/18' },
  { name: 'Helius', slug: 'helius', badge: 'H', src: '/brand/ecosystem/helius.png', tint: 'from-[#fdba74]/18 to-[#ea580c]/18' },
  { name: 'Solana', slug: 'solana', badge: '◎', src: '/brand/ecosystem/solana.png', tint: 'from-[#14f195]/18 to-[#9945ff]/18' },
  { name: 'Birdeye', slug: 'birdeye', badge: 'B', src: '/brand/ecosystem/birdeye.png', tint: 'from-[#10b981]/18 to-[#047857]/18' },
];

function BrandTile({ brand }: { brand: BrandItem }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className="group flex shrink-0 h-[38px] w-[38px] md:h-[42px] md:w-[42px] items-center justify-center"
      aria-label={brand.name}
      title={brand.name}
    >
      {!imageFailed ? (
        <img
          src={brand.src}
          alt={brand.name}
          className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
          <span className="font-sans text-[22px] font-semibold tracking-tight text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)]">
            {brand.badge}
          </span>
        </div>
      )}
    </div>
  );
}

export default function BrandEcosystemStrip() {
  return (
    <div className="flex w-full justify-end pt-8 mt-auto pb-6">
      <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
        <div className="text-right">
          <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.34em] text-white/50">
            Ecosystem
          </div>
          <div className="mt-1 font-sans text-sm font-medium text-white/90 uppercase tracking-[0.2em]">
            Stack
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          {SUPPORTING_BRANDS.map((brand) => (
            <BrandTile key={brand.slug} brand={brand} />
          ))}
        </div>
      </div>
    </div>
  );
}
