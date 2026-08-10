'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('');

  const makesList = [
    'Toyota',
    'Nissan',
    'Honda',
    'Mazda',
    'Mitsubishi',
    'Ford',
    'BMW',
    'Mercedes-Benz',
    'Hyundai',
    'Kia',
    'Subaru',
    'Land Rover',
    'Volkswagen',
    'Suzuki',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (condition) params.set('condition', condition);

    router.push(`/cars${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6 text-slate-900">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Top Header Label */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-nyasa-700 uppercase tracking-wider">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Search Cars in Malawi</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Over 5,000+ Verified Listings</span>
        </div>

        {/* Form Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Make Select */}
          <div>
            <label htmlFor="search-make" className="block text-xs font-semibold text-slate-700 mb-1">
              Make
            </label>
            <select
              id="search-make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-nyasa-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nyasa-700/20"
            >
              <option value="">All Makes</option>
              {makesList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Model Input */}
          <div>
            <label htmlFor="search-model" className="block text-xs font-semibold text-slate-700 mb-1">
              Model
            </label>
            <input
              id="search-model"
              type="text"
              placeholder="e.g. Prado, Hilux, RAV4"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-nyasa-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nyasa-700/20"
            />
          </div>

          {/* Condition Select */}
          <div>
            <label htmlFor="search-condition" className="block text-xs font-semibold text-slate-700 mb-1">
              Condition
            </label>
            <select
              id="search-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-nyasa-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nyasa-700/20"
            >
              <option value="">Any Condition</option>
              <option value="USED">Pre-Owned / Used</option>
              <option value="NEW">Brand New</option>
              <option value="CERTIFIED">Certified Import</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label htmlFor="search-minprice" className="block text-xs font-semibold text-slate-700 mb-1">
              Min Price (MWK)
            </label>
            <input
              id="search-minprice"
              type="number"
              placeholder="e.g. 5,000,000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-nyasa-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nyasa-700/20"
            />
          </div>

          {/* Max Price */}
          <div>
            <label htmlFor="search-maxprice" className="block text-xs font-semibold text-slate-700 mb-1">
              Max Price (MWK)
            </label>
            <input
              id="search-maxprice"
              type="number"
              placeholder="e.g. 50,000,000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-nyasa-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nyasa-700/20"
            />
          </div>

        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-nyasa-700 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-nyasa-700/25 hover:bg-nyasa-800 focus:outline-none focus:ring-2 focus:ring-nyasa-700 focus:ring-offset-2 transition duration-200"
          >
            <Search className="h-5 w-5" />
            <span>Search Inventory</span>
          </button>
        </div>

      </form>
    </div>
  );
}
