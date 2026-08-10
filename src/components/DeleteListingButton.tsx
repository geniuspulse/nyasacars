'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react';

interface DeleteListingButtonProps {
  listingId: string;
  listingTitle?: string;
}

export default function DeleteListingButton({ listingId, listingTitle }: DeleteListingButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete listing.');
      }

      setShowConfirm(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error deleting listing');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        title="Delete Listing"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Delete Listing</h3>
              <p className="text-sm text-slate-400">
                Are you sure you want to delete{' '}
                <span className="text-slate-200 font-semibold">&ldquo;{listingTitle || 'this vehicle listing'}&rdquo;</span>?
                This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
