import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Trash2, Star, Search, ShieldAlert, MessageSquare, AlertCircle } from 'lucide-react';

interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    images?: Array<{ url: string; public_id: string }>;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllReviewsAdmin();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review? This will remove it from the product detail page.')) {
      return;
    }
    try {
      await adminService.deleteReviewAdmin(id);
      fetchReviews();
    } catch (err: any) {
      setError(err.message || 'Failed to delete review.');
    }
  };

  // Filter & Search Logic
  const filteredReviews = reviews.filter((review) => {
    // 1. Search filter
    const matchesSearch = 
      review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Rating filter
    const matchesRating = ratingFilter === 'ALL' || review.rating === ratingFilter;

    return matchesSearch && matchesRating;
  });

  // Analytics helper
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10 
    : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} size={12} className="text-accent-gold fill-accent-gold" />);
      } else {
        stars.push(<Star key={i} size={12} className="text-white/20" />);
      }
    }
    return <div className="flex space-x-0.5">{stars}</div>;
  };

  return (
    <div className="p-8 space-y-8 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <span className="text-[9px] font-mono tracking-[0.25em] text-accent-gold uppercase font-bold block">
            MODERATION QUEUE
          </span>
          <h2 className="font-display text-3xl uppercase tracking-wider text-white">
            Product Reviews
          </h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-sm flex items-center space-x-3 text-red-500 text-xs font-mono">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Total Reviews</span>
            <MessageSquare size={16} className="text-accent-gold" />
          </div>
          <p className="text-2xl font-mono text-white font-bold">{reviewCount}</p>
          <p className="text-[9px] font-mono text-white/30 uppercase">Submitted by verified customers</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Average Platform Rating</span>
            <div className="flex items-center space-x-1">
              <Star size={14} className="text-accent-gold fill-accent-gold" />
            </div>
          </div>
          <p className="text-2xl font-mono text-white font-bold">{averageRating} / 5.0</p>
          <p className="text-[9px] font-mono text-white/30 uppercase">Average score across catalog</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Moderation Required</span>
            <AlertCircle size={16} className="text-accent-gold" />
          </div>
          <p className="text-2xl font-mono text-white font-bold">0</p>
          <p className="text-[9px] font-mono text-white/30 uppercase">Flagged review logs</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-sm font-mono text-[10px] tracking-wider uppercase">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-sm pl-10 pr-4 py-2 text-[11px] text-white focus:outline-none focus:border-accent-gold/40 focus:bg-white/[0.04] transition-all font-mono"
            placeholder="Search by customer, email, product or comment..."
          />
        </div>

        {/* Filter rating */}
        <div className="flex items-center space-x-3 self-start md:self-auto shrink-0">
          <span className="text-white/40">Filter Rating:</span>
          <div className="flex border border-white/5 bg-white/[0.02] p-0.5 rounded-sm">
            {(['ALL', 5, 4, 3, 2, 1] as const).map((rating) => (
              <button
                key={rating}
                onClick={() => setRatingFilter(rating)}
                className={`px-3 py-1.5 font-bold uppercase rounded-xs transition-all duration-300 cursor-pointer ${
                  ratingFilter === rating
                    ? 'bg-white/5 text-accent-gold'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                {rating === 'ALL' ? 'ALL' : `${rating}★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-white/40 font-mono text-xs animate-pulse">
            Connecting to customer reviews database stream...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-16 text-center text-white/40 font-mono text-xs">
            No matching customer reviews found in archive.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 font-mono text-[10px] uppercase tracking-wider text-white/40">
                  <th className="py-4 px-6 font-bold">Product</th>
                  <th className="py-4 px-6 font-bold">Customer</th>
                  <th className="py-4 px-6 font-bold">Rating</th>
                  <th className="py-4 px-6 font-bold">Review Comment</th>
                  <th className="py-4 px-6 font-bold">Submission Date</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {filteredReviews.map((review) => {
                  const productImg = review.product.images?.[0]?.url || '/placeholder.png';
                  return (
                    <tr key={review._id} className="hover:bg-white/[0.01] transition-colors duration-200">
                      <td className="py-4 px-6 max-w-xs">
                        <div className="flex items-center space-x-3">
                          <img
                            src={productImg}
                            alt={review.product.name}
                            className="w-10 h-12 object-contain bg-bg-cream-2 border border-white/10 rounded-sm"
                          />
                          <div className="truncate">
                            <span className="text-white font-bold block truncate">{review.product.name}</span>
                            <span className="text-[9px] text-white/30 block font-mono truncate">slug: {review.product.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className="text-white font-bold block">{review.user.name}</span>
                          <span className="text-[10px] text-white/40 block font-mono">{review.user.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {renderStars(review.rating)}
                          <span className="text-[9px] text-white/30 block">Score: {review.rating} / 5.0</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-sm">
                        <p className="text-white/70 line-clamp-2 leading-relaxed text-[11px] whitespace-normal">
                          "{review.comment}"
                        </p>
                      </td>
                      <td className="py-4 px-6 text-white/60">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-2 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5 rounded-xs text-red-500/60 hover:text-red-500 transition-all duration-200 cursor-pointer"
                          title="Delete / Terminate Review"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
