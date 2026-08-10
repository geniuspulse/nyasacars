'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, RotateCcw, ChevronDown, ChevronUp, Check } from 'lucide-react';

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Filter States
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>(
    searchParams.get('bodyType') ? searchParams.get('bodyType')!.split(',') : []
  );
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>(
    searchParams.get('transmission') ? searchParams.get('transmission')!.split(',') : []
  );
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>(
    searchParams.get('fuelType') ? searchParams.get('fuelType')!.split(',') : []
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');

  // Sync state when searchParams change externally
  useEffect(() => {
    setMake(searchParams.get('make') || '');
    setSelectedBodyTypes(searchParams.get('bodyType') ? searchParams.get('bodyType')!.split(',') : []);
    setSelectedTransmissions(searchParams.get('transmission') ? searchParams.get('transmission')!.split(',') : []);
    setSelectedFuelTypes(searchParams.get('fuelType') ? searchParams.get('fuelType')!.split(',') : []);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setCondition(searchParams.get('condition') || '');
  }, [searchParams]);

  const makes = ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Ford', 'BMW', 'Mercedes-Benz', 'Subaru', 'Volkswagen'];
  const bodyTypes = ['SUV', 'Sedan', 'Hatchback', 'Truck', 'Van', 'Coupe', 'Station Wagon'];
  const transmissions = ['Automatic', 'Manual'];
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];

  const toggleCheckbox = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (make) params.set('make', make);
    else params.delete('make');

    if (selectedBodyTypes.length > 0) params.set('bodyType', selectedBodyTypes.join(','));
    else params.delete('bodyType');

    if (selectedTransmissions.length > 0) params.set('transmission', selectedTransmissions.join(','));
    else params.delete('transmission');

    if (selectedFuelTypes.length > 0) params.set('fuelType', selectedFuelTypes.join(','));
    else params.delete('fuelType');

    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');

    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');

    if (condition) params.set('condition', condition);
    else params.delete('condition');

    params.set('page', '1'); // Reset to page 1 on filter change

    router.push(`${pathname}?${params.toString()}`);
    setIsOpenMobile(false);
  };

  const handleReset = () => {
    setMake('');
    setSelectedBodyTypes([]);
    setSelectedTransmissions([]);
    setSelectedFuelTypes([]);
    setMinPrice('');
    setMaxPrice('');
    setCondition('');
    router.push(pathname);
    setIsOpenMobile(false);
  };

  const activeCount = [
    make,
    selectedBodyTypes.length > 0,
    selectedTransmissions.length > 0,
    selectedFuelTypes.length > 0,
    minPrice,
    maxPrice,
    condition,
  ].filter(Boolean).length;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
      
      {/* Mobile Toggle Button */}
      <div className="flex lg:hidden items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="flex items-center justify-between w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold text-sm"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-nyasa-700" />
            <span>Filter Results</span>
            {activeCount > 0 && (
              <span className="bg-nyasa-700 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                {activeCount}
              </span>
            )}
          </div>
          {isOpenMobile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Filter Content (Always visible on lg, Collapsible on mobile) */}
      <div className={`mt-4 lg:mt-0 ${isOpenMobile ? 'block' : 'hidden lg:block'} space-y-6`}>
        
        {/* Header */}
        <div className="hidden lg:flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <Filter className="h-4 w-4 text-nyasa-700" />
            <span>Refine Search</span>
          </div>
          {activeCount > 0 && (
            <button
              onClick={handleReset}
              className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* 1. Make Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Vehicle Make
          </label>
          <select
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 font-medium focus:border-nyasa-700 focus:bg-white focus:outline-none"
          >
            <option value="">All Makes</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Condition Radio */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Condition
          </label>
          <div className="space-y-1.5 text-sm text-slate-700 font-medium">
            {[
              { label: 'All Conditions', value: '' },
              { label: 'Pre-Owned / Used', value: 'USED' },
              { label: 'Brand New', value: 'NEW' },
              { label: 'Certified Import', value: 'CERTIFIED' },
            ].map((cond) => (
              <label key={cond.value} className="flex items-center gap-2 cursor-pointer hover:text-nyasa-700">
                <input
                  type="radio"
                  name="condition"
                  value={cond.value}
                  checked={condition === cond.value}
                  onChange={(e) => setCondition(e.target.value)}
                  className="h-4 w-4 text-nyasa-700 focus:ring-nyasa-700 border-slate-300"
                />
                <span>{cond.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Body Type Checkboxes */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Body Type
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-sm text-slate-700">
            {bodyTypes.map((type) => {
              const checked = selectedBodyTypes.includes(type);
              return (
                <label key={type} className="flex items-center gap-2 cursor-pointer hover:text-nyasa-700 font-medium">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCheckbox(selectedBodyTypes, setSelectedBodyTypes, type)}
                    className="h-4 w-4 rounded text-nyasa-700 focus:ring-nyasa-700 border-slate-300"
                  />
                  <span>{type}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 4. Transmission Checkboxes */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Transmission
          </label>
          <div className="space-y-1.5 text-sm text-slate-700">
            {transmissions.map((trans) => {
              const checked = selectedTransmissions.includes(trans);
              return (
                <label key={trans} className="flex items-center gap-2 cursor-pointer hover:text-nyasa-700 font-medium">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCheckbox(selectedTransmissions, setSelectedTransmissions, trans)}
                    className="h-4 w-4 rounded text-nyasa-700 focus:ring-nyasa-700 border-slate-300"
                  />
                  <span>{trans}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 5. Fuel Type Checkboxes */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Fuel Type
          </label>
          <div className="space-y-1.5 text-sm text-slate-700">
            {fuelTypes.map((fuel) => {
              const checked = selectedFuelTypes.includes(fuel);
              return (
                <label key={fuel} className="flex items-center gap-2 cursor-pointer hover:text-nyasa-700 font-medium">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCheckbox(selectedFuelTypes, setSelectedFuelTypes, fuel)}
                    className="h-4 w-4 rounded text-nyasa-700 focus:ring-nyasa-700 border-slate-300"
                  />
                  <span>{fuel}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 6. Price Range */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Price Range (MWK)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-medium focus:border-nyasa-700 focus:bg-white focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-medium focus:border-nyasa-700 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleApply}
            className="w-full rounded-lg bg-nyasa-700 py-2.5 px-4 text-center text-sm font-bold text-white shadow hover:bg-nyasa-800 transition"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-4 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Reset All Filters
          </button>
        </div>

      </div>
    </div>
  );
}
