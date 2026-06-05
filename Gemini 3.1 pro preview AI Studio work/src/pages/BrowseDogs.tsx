import React, { useEffect, useState } from "react";
import { DogFilters, DogListResponse } from "@/lib/types";
import { getDogs } from "@/lib/api";
import { DogCard } from "@/components/DogCard";
import { Section } from "@/components/ui";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export function BrowseDogs() {
  const [data, setData] = useState<DogListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DogFilters>({
    sort: "days_waiting",
  });

  useEffect(() => {
    setLoading(true);
    getDogs(filters).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [filters]);

  const handleFilterChange = (key: keyof DogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Browse Dogs</h1>
          <p className="text-gray-500 text-lg">Sorted by longest wait time by default.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
          <div className="flex items-center gap-2 font-bold text-gray-900 pb-4 border-b border-gray-100">
            <SlidersHorizontal className="w-5 h-5"/>
            Filters
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="days_waiting">Longest Waiting (Default)</option>
                  <option value="newest">Newest Additions</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
              <div className="space-y-2">
                {['small', 'medium', 'large', 'xlarge'].map(size => (
                  <label key={size} className="flex items-center gap-2 text-sm text-gray-600 capitalize cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      onChange={(e) => {
                        const currentSize = filters.size || [];
                        if (e.target.checked) handleFilterChange('size', [...currentSize, size]);
                        else handleFilterChange('size', currentSize.filter(s => s !== size));
                      }}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
              <div className="space-y-2">
                 <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                   <input 
                     type="radio" 
                     name="age" 
                     className="text-teal-600 focus:ring-teal-500"
                     onChange={() => handleFilterChange('age_group', 'puppy')}
                   />
                   Puppy (&lt; 1 yr)
                 </label>
                 <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                   <input 
                     type="radio" 
                     name="age" 
                     className="text-teal-600 focus:ring-teal-500"
                     onChange={() => handleFilterChange('age_group', 'adult')}
                   />
                   Adult
                 </label>
              </div>
            </div>

            <button 
              className="w-full py-2 mt-4 text-sm font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setFilters({ sort: 'days_waiting' })}
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
                <p>Loading dogs...</p>
             </div>
          ) : data && data.items.length > 0 ? (
            <div>
              <div className="mb-6 text-gray-500">
                Found <span className="font-bold text-gray-900">{data.total_count}</span> dogs waiting for a home.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {data.items.map(dog => (
                  <DogCard key={dog.id} dog={dog} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No dogs found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters to see more results.</p>
              <button 
                onClick={() => setFilters({ sort: 'days_waiting' })}
                className="text-teal-600 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
