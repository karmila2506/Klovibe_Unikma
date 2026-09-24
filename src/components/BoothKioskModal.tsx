import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  QrCode,
  ArrowRight,
  Heart,
  ShoppingBag,
  Printer,
  Share2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Guest, Product, StandConfig } from '../types';
import { UnikmaLogo, KlovibeLogo } from './Logos';
import { formatRupiah, getAudioSettings } from '../utils/storage';
import { playWelcomeGreeting, stopAnyAudio } from '../utils/audio';

interface BoothKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: Guest[];
  products: Product[];
  nextQueueNumber: number;
  config: StandConfig;
  justRegisteredGuest?: Guest | null;
  onOpenCatalog: () => void;
  onRegisterAnother?: () => void;
}

export const BoothKioskModal: React.FC<BoothKioskModalProps> = ({
  isOpen,
  onClose,
  guests,
  products,
  nextQueueNumber,
  config,
  justRegisteredGuest,
  onOpenCatalog,
  onRegisterAnother,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Auto rotate showcase slides every 5 seconds
  useEffect(() => {
    if (!isOpen || products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, products.length]);

  if (!isOpen) return null;

  // The featured guest is either the newly registered guest or the latest visitor
  const displayGuest = justRegisteredGuest || guests[0];
  const activeProduct = products[currentSlideIndex] || products[0];

  const handlePlayKioskAudio = () => {
    if (!displayGuest) return;
    if (isPlayingAudio) {
      stopAnyAudio();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    const audioSettings = getAudioSettings();
    playWelcomeGreeting(displayGuest.queueNumber, audioSettings, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSharePassWhatsApp = () => {
    if (!displayGuest) return;
    const msg = `Halo! Saya baru saja berkunjung ke Stand KLOVIBE GIFT x ${config.unikmaBrandName}. Saya mendapatkan Nomor Urut Pengunjung: #${String(
      displayGuest.queueNumber
    ).padStart(3, '0')} 🌸. Stan-nya sangat estetik dan buket bunganya indah sekali! Hubungi ${config.whatsappNumber}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14181b]/95 text-white flex flex-col justify-between overflow-y-auto backdrop-blur-md animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4 sm:gap-6">
          <UnikmaLogo size={46} showText={false} customLogoUrl={config.customUnikmaLogoUrl} />
          <div className="h-8 w-px bg-white/20"></div>
          <KlovibeLogo size={46} showSlogan={true} customLogoUrl={config.customKlovibeLogoUrl} />
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Greeting Play Button */}
          {displayGuest && (
            <button
              onClick={handlePlayKioskAudio}
              className={`px-3 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-[#c07a50] border-[#c07a50] text-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
              title="Putar Sambutan Suara Tamu Stand"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isPlayingAudio ? 'Memutar Suara...' : 'Putar Suara Stand'}
              </span>
            </button>
          )}

          {/* Main Call to Action: Buka Katalog Buket */}
          <button
            onClick={onOpenCatalog}
            className="px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#c07a50] to-[#e67e22] hover:from-[#b06f47] hover:to-[#d35400] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Lihat Katalog Buket Stand</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup Layar Kios"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Big Queue & Welcoming Notice */}
        <div className="lg:col-span-6 space-y-6">
          {justRegisteredGuest ? (
            /* Special banner if visitor just finished registration */
            <div className="p-4 rounded-2xl bg-[#1b5e20]/40 border border-emerald-400/40 backdrop-blur-md animate-pulse">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4" />
                Registrasi Tamu Berhasil!
              </div>
              <p className="text-sm text-white font-medium">
                Selamat datang, <strong className="text-[#e67e22]">{justRegisteredGuest.name}</strong>! Nomor antrean Anda siap dipanggil di booth stand.
              </p>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b5e20]/40 border border-[#e67e22]/50 text-xs font-bold tracking-wider text-[#e67e22] uppercase">
              <Sparkles className="w-4 h-4" />
              Official Stand Partner {config.unikmaBrandName}
            </div>
          )}

          <div className="space-y-2">
            <h1 className="font-serif-brand text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
              Selamat Datang di Stand <span className="text-[#c07a50]">{config.klovibeBrandName}</span>
            </h1>
            {config.kioskWelcomeNotice && (
              <p className="text-xs sm:text-sm font-semibold text-[#e67e22] bg-white/10 px-3 py-1.5 rounded-xl inline-block">
                ✨ {config.kioskWelcomeNotice}
              </p>
            )}
            <p className="text-xs sm:text-sm text-slate-300">
              "{config.tagline}" · Melayani buket wisuda custom, bunga segar, snack, & hadiah spesial.
            </p>
          </div>

          {/* Visitor Counter & Queue Board */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Total Tamu Terdaftar
              </span>
              <div className="font-serif-brand text-4xl sm:text-5xl font-black text-[#e67e22]">
                {guests.length}
              </div>
              <span className="text-[11px] text-slate-400">Pengunjung stan hari ini</span>
            </div>

            <div className="bg-gradient-to-br from-[#c07a50]/20 to-[#1b5e20]/20 border border-[#c07a50]/50 rounded-2xl p-5 backdrop-blur-xs">
              <span className="text-xs uppercase tracking-wider text-[#f4efe6] font-bold block mb-1">
                {justRegisteredGuest ? 'Nomor Antrean Anda (Resmi)' : 'Nomor Antrean Tamu'}
              </span>
              <div className="font-serif-brand text-3xl sm:text-5xl font-black text-[#f4efe6]">
                {justRegisteredGuest ? `#${String(justRegisteredGuest.queueNumber).padStart(3, '0')}` : '🎁 Kejutan!'}
              </div>
              <span className="text-[11px] text-[#f4efe6]/80">
                {justRegisteredGuest ? 'Tunjukkan nomor ini ke tim stand / florist' : 'Daftar sekarang untuk dapat nomor Anda!'}
              </span>
            </div>
          </div>

          {/* Display Guest Card */}
          {displayGuest && (
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  {justRegisteredGuest ? 'Data Registrasi Anda' : 'Pengunjung Terakhir Terdaftar'}
                </span>
                <div className="text-base font-bold text-white">
                  #{String(displayGuest.queueNumber).padStart(3, '0')} — {displayGuest.name}
                </div>
                <div className="text-xs text-slate-300 truncate max-w-sm">
                  {displayGuest.addressInstansi}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayKioskAudio}
                  className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    isPlayingAudio ? 'bg-[#c07a50] animate-pulse' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title="Putar Sambutan Suara Tamu"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio ? 'Ulangi' : 'Suara'}</span>
                </button>
                <button
                  onClick={handleSharePassWhatsApp}
                  className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Share2 className="w-3 h-3" />
                  Bagikan
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3 h-3" />
                  Cetak
                </button>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenCatalog}
              className="px-6 py-3 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Buka Katalog Produk Stand Sekarang
            </button>

            {onRegisterAnother && (
              <button
                onClick={onRegisterAnother}
                className="px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Daftarkan Tamu Berikutnya
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Bouquet Slideshow */}
        {activeProduct && (
          <div className="lg:col-span-6">
            <div className="bg-white/5 border border-white/15 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl relative overflow-hidden group">
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden mb-4 bg-black/40">
                <img
                  src={activeProduct.imageUrl}
                  alt={activeProduct.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-[#1b5e20] text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                  Koleksi Pilihan Stand
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white text-sm font-bold px-3.5 py-1.5 rounded-xl border border-white/10">
                  {formatRupiah(activeProduct.price)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-[#e67e22] font-semibold mb-1">
                  <span>{activeProduct.category}</span>
                  <span>·</span>
                  <span>Ready & Custom Order</span>
                </div>
                <h3 className="font-serif-brand text-xl sm:text-2xl font-bold text-white mb-1">
                  {activeProduct.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                  {activeProduct.description}
                </p>
              </div>

              {/* Progress indicator and button */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {products.slice(0, 6).map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentSlideIndex % 6
                          ? 'w-7 bg-[#e67e22]'
                          : 'w-2 bg-white/20'
                      }`}
                    ></span>
                  ))}
                </div>

                <button
                  onClick={onOpenCatalog}
                  className="text-xs text-[#e67e22] hover:text-[#f39c12] font-bold flex items-center gap-1 cursor-pointer"
                >
                  Lihat Semua Buket ({products.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar / Marquee */}
      <div className="p-3.5 bg-black/70 border-t border-white/10 text-center text-xs text-slate-400 flex flex-wrap items-center justify-center gap-4 shrink-0">
        <span>🌸 Stand {config.klovibeBrandName} x {config.unikmaBrandName}</span>
        <span>•</span>
        <span>Silakan berkunjung & daftarkan diri Anda di meja booth</span>
        <span>•</span>
        <span className="font-mono text-[#f4efe6]">WhatsApp Hotline: {config.whatsappNumber}</span>
      </div>
    </div>
  );
};
