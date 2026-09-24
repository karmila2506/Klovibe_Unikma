import React, { useState, useMemo } from 'react';
import {
  MessageSquareHeart,
  Star,
  Search,
  Filter,
  Heart,
  Sparkles,
  Award,
  ArrowRight,
  Smile,
  Quote,
} from 'lucide-react';
import { Guest, StandConfig } from '../types';
import { RATING_LABELS } from './GuestRegistration';

interface GuestFeedbackWallProps {
  guests: Guest[];
  config?: StandConfig;
  onNavigateRegister: () => void;
}

export const GuestFeedbackWall: React.FC<GuestFeedbackWallProps> = ({
  guests,
  config,
  onNavigateRegister,
}) => {
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate statistics
  const totalReviews = guests.length;
  const averageRating = useMemo(() => {
    if (totalReviews === 0) return 5.0;
    const sum = guests.reduce((acc, g) => acc + (g.rating || 5), 0);
    return (sum / totalReviews).toFixed(1);
  }, [guests, totalReviews]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    guests.forEach((g) => {
      const r = Math.min(5, Math.max(1, g.rating || 5)) as 1 | 2 | 3 | 4 | 5;
      counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [guests]);

  // Filtered feedback entries
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (ratingFilter !== 'all' && g.rating !== ratingFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.addressInstansi.toLowerCase().includes(q) ||
        g.feedbackMessage.toLowerCase().includes(q)
      );
    });
  }, [guests, ratingFilter, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-[#ebd9c8]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b5e20]/10 text-[#1b5e20] text-xs font-bold uppercase tracking-wider">
              <MessageSquareHeart className="w-3.5 h-3.5" />
              Pojok Suara & Kesan Pengunjung
            </div>
            <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#2c2a29]">
              Kritik, Saran & Ulasan Tamu Stand
            </h2>
            <p className="text-xs sm:text-sm text-[#4a5d4e] leading-relaxed">
              Terima kasih atas setiap apresiasi, saran, dan masukan membangun dari sivitas akademika Universitas Komputama (UNIKMA) serta seluruh pengunjung stand booth KLOVIBE GIFT.
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="bg-linear-to-br from-[#f4efe6] to-[#faf8f5] rounded-2xl p-5 border border-[#c07a50]/30 shadow-xs flex items-center gap-5 shrink-0">
            <div className="text-center">
              <div className="text-4xl font-black font-serif-brand text-[#c07a50]">
                {averageRating}
              </div>
              <div className="flex items-center justify-center text-amber-500 my-1">
                {'★'.repeat(Math.round(Number(averageRating)))}
              </div>
              <span className="text-[11px] font-bold text-[#4a5d4e]">
                {totalReviews} Total Ulasan Tamu
              </span>
            </div>

            <div className="h-16 w-px bg-slate-300/80"></div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#1b5e20]">
                <Award className="w-4 h-4" />
                <span>Kepuasan Stand</span>
              </div>
              <p className="text-[11px] text-slate-600 max-w-[140px] leading-tight">
                99% tamu menyatakan puas dengan keramahan dan buket wisuda KLOVIBE.
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-6 pt-6 border-t border-[#ebd9c8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setRatingFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ratingFilter === 'all'
                  ? 'bg-[#1b5e20] text-white shadow-xs'
                  : 'bg-[#faf8f5] hover:bg-slate-200 text-slate-700'
              }`}
            >
              Semua Bintang ({totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setRatingFilter(star)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  ratingFilter === star
                    ? 'bg-[#c07a50] text-white shadow-xs'
                    : 'bg-[#faf8f5] hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
                title={`${star} Bintang: ${RATING_LABELS[star]}`}
              >
                <span>{star}</span>
                <Star className="w-3 h-3 fill-current text-amber-400" />
                <span className="hidden sm:inline text-[10.5px]">({RATING_LABELS[star]})</span>
                <span className="text-[10px] opacity-80">({ratingCounts[star as 1 | 2 | 3 | 4 | 5] || 0})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kritik, nama, instansi..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20] bg-[#faf8f5]/60"
            />
          </div>
        </div>
      </div>

      {/* Testimonial & Feedback Grid */}
      {filteredGuests.length === 0 ? (
        <div className="bg-white/90 rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          <Smile className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
          <p className="font-serif-brand text-lg font-bold text-slate-600">
            Belum ada ulasan untuk filter ini
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Silakan pilih filter bintang lain atau daftarkan diri di meja registrasi tamu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-[#ebd9c8] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#c07a50]/15 text-[#c07a50] font-serif-brand font-bold flex items-center justify-center text-sm shadow-xs">
                      #{String(guest.queueNumber).padStart(2, '0')}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#2c2a29] line-clamp-1">
                        {guest.name}
                      </h4>
                      <p className="text-[11px] text-[#4a5d4e] line-clamp-1">
                        {guest.addressInstansi}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <div className="flex items-center text-amber-400 text-xs">
                      {'★'.repeat(guest.rating || 5)}
                    </div>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {RATING_LABELS[guest.rating || 5] || `${guest.rating || 5} Bintang`}
                    </span>
                  </div>
                </div>

                {/* Feedback Quote */}
                <div className="relative p-3.5 rounded-xl bg-[#faf8f5] border border-slate-100 text-xs text-slate-700 italic leading-relaxed my-2">
                  <Quote className="w-3.5 h-3.5 text-[#c07a50]/40 absolute top-2 right-2" />
                  "{guest.feedbackMessage || 'Pelayanan ramah dan buketnya sangat bagus!'}"
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Sparkles className="w-3 h-3 text-[#e67e22]" />
                  Tamu Terverifikasi Stand
                </span>
                <span>
                  {new Date(guest.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA to add feedback via registration */}
      <div className="bg-linear-to-r from-[#1b5e20] to-[#1a237e] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif-brand text-lg sm:text-xl font-bold">
            Ingin Memberikan Kritik & Saran Anda?
          </h3>
          <p className="text-xs text-[#f4efe6]/85">
            Daftarkan nama Anda di Buku Tamu Stand untuk mendapatkan Nomor Urut Antrean dan menyampaikan pesan kesan Anda langsung kepada kami.
          </p>
        </div>

        <button
          onClick={onNavigateRegister}
          className="px-5 py-3 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-bold shrink-0 shadow-md cursor-pointer transition-all flex items-center gap-2"
        >
          Isi Buku Tamu & Beri Saran
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
