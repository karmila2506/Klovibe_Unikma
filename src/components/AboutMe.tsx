import React from 'react';
import {
  Heart,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  Flower2,
  ExternalLink,
  X,
} from 'lucide-react';
import { StandConfig } from '../types';
import { UnikmaLogo, KlovibeLogo } from './Logos';

interface AboutMeProps {
  config: StandConfig;
  onOpenCatalog: () => void;
  onClose?: () => void;
}

export const AboutMe: React.FC<AboutMeProps> = ({ config, onOpenCatalog, onClose }) => {
  const cleanPhone = config.whatsappNumber.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  const handleChatWhatsApp = () => {
    const text = `Halo ${config.aboutMeOwnerName}! 🌸\n\nSaya mengunjungi booth stand KLOVIBE GIFT x UNIKMA dan ingin berkonsultasi mengenai pemesanan buket wisuda / merchandise kustom. Terima kasih!`;
    const url = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-8 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 shadow-md cursor-pointer transition-all"
          title="Tutup Halaman Tentang Kami"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Hero Profile Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-lg border border-[#ebd9c8] relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Artisan & Florist Profile Story */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c07a50]/10 text-[#c07a50] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Cerita di Balik Karya & Florist
            </div>

            <h1 className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#2c2a29] leading-tight">
              {config.aboutMeTitle}
            </h1>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {config.aboutMeStory}
            </p>

            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ebd9c8] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1b5e20] uppercase tracking-wider">
                <Flower2 className="w-4 h-4 text-[#c07a50]" />
                Filosofi Rangkaian: "{config.tagline}"
              </div>
              <p className="text-xs text-[#4a5d4e] leading-relaxed">
                Setiap helai mawar, lembaran kertas wrapping korea, dan pita satin dipilih secara teliti untuk mengabadikan pencapaian akademik terbaik di Universitas Komputama.
              </p>
            </div>

            {/* Direct Contact Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleChatWhatsApp}
                className="px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Chat WhatsApp: {config.whatsappNumber}
              </button>

              <button
                onClick={onOpenCatalog}
                className="px-5 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer transition-all"
              >
                Lihat Koleksi Buket Stand
              </button>
            </div>
          </div>

          {/* Right: Dual Identity & Badges */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-linear-to-br from-[#f4efe6] via-[#faf8f5] to-[#fbf7f2] rounded-3xl p-6 border border-[#c07a50]/30 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#ebd9c8] pb-4">
                <div className="flex items-center gap-3">
                  <KlovibeLogo size={48} showSlogan={false} />
                  <div>
                    <h3 className="font-serif-brand font-bold text-[#c07a50] text-base">
                      {config.klovibeBrandName}
                    </h3>
                    <p className="text-[11px] text-[#4a5d4e] font-serif-brand italic">
                      "{config.tagline}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1b5e20] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#2c2a29] block">Mitra Stand Resmi Wisuda</span>
                    <span>Kolaborasi bersama Universitas Komputama (UNIKMA).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1b5e20] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#2c2a29]">Handmade Artisan Florist</span>
                    <span> Rangkaian rapi, tahan lama, dan personal request kartu ucapan.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1b5e20] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#2c2a29]">Respon Cepat & Ramah</span>
                    <span> Konsultasi langsung di booth stand atau via WhatsApp hotline.</span>
                  </div>
                </div>
              </div>

              {/* Founder/Artisan Identity Tag */}
              <div className="pt-3 border-t border-[#ebd9c8] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#4a5d4e] tracking-wider block">
                    Penanggung Jawab Stand
                  </span>
                  <div className="text-xs font-bold text-[#2c2a29]">
                    {config.aboutMeOwnerName}
                  </div>
                  <div className="text-[11px] text-[#c07a50] font-medium">
                    {config.aboutMeRole}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#1b5e20] text-white">
                  UNIKMA Stand
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stand Location & Operational Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-6 border border-[#ebd9c8] shadow-xs text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#1b5e20]/10 text-[#1b5e20] flex items-center justify-center mx-auto">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#2c2a29]">
            Lokasi Meja Stand Booth
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {config.boothLocation}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-6 border border-[#ebd9c8] shadow-xs text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#e67e22]/10 text-[#e67e22] flex items-center justify-center mx-auto">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#2c2a29]">
            Jam Pelayanan Stand
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {config.operationalHours}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-6 border border-[#ebd9c8] shadow-xs text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mx-auto">
            <Phone className="w-5 h-5 text-[#25D366]" />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#2c2a29]">
            Kontak WhatsApp Stand
          </h4>
          <p className="text-xs font-mono font-bold text-slate-800">
            {config.whatsappNumber}
          </p>
          <button
            onClick={handleChatWhatsApp}
            className="text-[11px] font-bold text-[#1b5e20] hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            Kirim Pesan Langsung
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
