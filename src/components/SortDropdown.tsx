'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface SortDropdownProps {
  currentSort: string;
}

export default function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={handleSortChange}
      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-nyasa-700 focus:bg-white focus:outline-none"
    >
      <option value="newest">Newest First</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="mileage_asc">Lowest Mileage</option>
    </select>
  );
}
