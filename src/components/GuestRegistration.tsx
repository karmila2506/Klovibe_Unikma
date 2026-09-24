import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  User,
  Phone,
  Building2,
  MessageSquareHeart,
  Star,
  Volume2,
  Share2,
  Printer,
  CheckCircle2,
  RefreshCw,
  Gift,
  QrCode,
  ArrowRight,
  Tv,
  ShoppingBag,
} from 'lucide-react';
import { Guest, AudioSettings, StandConfig } from '../types';
import { addGuest } from '../utils/storage';
import { playWelcomeGreeting, stopAnyAudio, unlockMobileAudio } from '../utils/audio';
import { UnikmaLogo, KlovibeLogo } from './Logos';

export const RATING_LABELS: Record<number, string> = {
  1: 'Sangat Jelek',
  2: 'Jelek',
  3: 'Cukup Baik',
  4: 'Bagus',
  5: 'Sangat Bagus dan Memuaskan',
};

interface GuestRegistrationProps {
  onGuestRegistered: (guest: Guest) => void;
  nextQueueNumber: number;
  audioSettings: AudioSettings;
  onAudioPlayStateChange: (isPlaying: boolean, message?: string) => void;
  onExploreCatalog: () => void;
  onShowKioskPass: (guest: Guest) => void;
  config: StandConfig;
}

export const GuestRegistration: React.FC<GuestRegistrationProps> = ({
  onGuestRegistered,
  nextQueueNumber,
  audioSettings,
  onAudioPlayStateChange,
  onExploreCatalog,
  onShowKioskPass,
  config,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressInstansi, setAddressInstansi] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [rating, setRating] = useState<number>(5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredGuest, setRegisteredGuest] = useState<Guest | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#1b5e20', '#e67e22', '#1a237e', '#c07a50', '#4a5d4e', '#f4efe6'],
      });
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Immediately unlock mobile audio while user tap gesture is active on Android
    unlockMobileAudio();

    if (!name.trim() || !phone.trim() || !addressInstansi.trim()) {
      alert('Mohon lengkapi Nama, No. HP/WhatsApp, dan Alamat/Instansi/Prodi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newGuest = addGuest({
        name: name.trim(),
        phone: phone.trim(),
        addressInstansi: addressInstansi.trim(),
        feedbackMessage: feedbackMessage.trim() || 'Semoga sukses selalu untuk KLOVIBE x UNIKMA!',
        rating,
      });

      setRegisteredGuest(newGuest);
      onGuestRegistered(newGuest);
      triggerConfetti();

      // Trigger automatic welcome audio (Chime & Indonesian Speech)
      handlePlayGreetingAudio(newGuest.queueNumber);

      // Immediately launch the Layar Kios screen for the registered customer
      onShowKioskPass(newGuest);
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayGreetingAudio = (qNum: number) => {
    setIsAudioPlaying(true);
    onAudioPlayStateChange(
      true,
      `Menyambut Pengunjung Ke-${qNum} di Stand ${config.klovibeBrandName} x ${config.unikmaBrandName}`
    );

    playWelcomeGreeting(qNum, audioSettings, {
      onStart: () => {
        setIsAudioPlaying(true);
        onAudioPlayStateChange(
          true,
          `Menyambut Pengunjung Ke-${qNum} di Stand ${config.klovibeBrandName} x ${config.unikmaBrandName}`
        );
      },
      onEnd: () => {
        setIsAudioPlaying(false);
        onAudioPlayStateChange(false);
      },
      onError: () => {
        setIsAudioPlaying(false);
        onAudioPlayStateChange(false);
      },
    });
  };

  const handleResetForNextGuest = () => {
    stopAnyAudio();
    setIsAudioPlaying(false);
    onAudioPlayStateChange(false);
    setName('');
    setPhone('');
    setAddressInstansi('');
    setFeedbackMessage('');
    setRating(5);
    setRegisteredGuest(null);
  };

  const handlePrintPass = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!registeredGuest) return;
    const msg = `Halo! Saya baru saja berkunjung ke Stand ${config.klovibeBrandName} x ${config.unikmaBrandName}. Saya memperoleh Nomor Urut Pengunjung: #${String(
      registeredGuest.queueNumber
    ).padStart(3, '0')} 🌸. Stand-nya sangat estetik dan buket bunganya indah sekali! Hubungi ${config.whatsappNumber}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="w-full">
      {/* If newly registered, show the gorgeous digital pass */}
      {registeredGuest ? (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-[#c07a50]/30 transition-all space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b5e20]/10 text-[#1b5e20] text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              {config.successNotice || 'Registrasi Berhasil! Selamat Datang di Stand Kami'}
            </div>
            <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#2c2a29]">
              Tiket Kunjungan Digital Stand
            </h2>
            <p className="text-xs sm:text-sm text-[#4a5d4e] mt-1">
              {config.klovibeBrandName} x {config.unikmaBrandName}
            </p>
          </div>

          {/* Action Row right at the top for convenience */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onShowKioskPass(registeredGuest)}
              className="px-5 py-2.5 rounded-xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Tv className="w-4 h-4" />
              Buka Layar Kios Stand
            </button>

            <button
              onClick={onExploreCatalog}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c07a50] to-[#e67e22] hover:opacity-95 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Lihat Katalog Buket Stand
            </button>
          </div>

          {/* Digital Pass Card */}
          <div className="max-w-lg mx-auto bg-gradient-to-b from-[#fbf8f5] to-[#f4efe6] rounded-2xl p-6 border-2 border-dashed border-[#c07a50]/40 shadow-sm relative overflow-hidden">
            {/* Pass Header */}
            <div className="flex items-center justify-between border-b border-[#ebd9c8] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <UnikmaLogo size={36} customLogoUrl={config.customUnikmaLogoUrl} />
                <div className="h-6 w-px bg-[#c07a50]/30 mx-1"></div>
                <KlovibeLogo size={36} showSlogan={false} customLogoUrl={config.customKlovibeLogoUrl} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#4a5d4e] uppercase tracking-wider block">
                  STAND BOOTH
                </span>
                <span className="text-xs text-[#2c2a29] font-medium">
                  {new Date(registeredGuest.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Queue Number Showcase */}
            <div className="text-center py-4 bg-white/85 backdrop-blur-xs rounded-xl border border-[#ebd9c8] shadow-xs mb-5">
              <span className="text-xs uppercase tracking-widest font-bold text-[#4a5d4e]">
                Nomor Urut Antrean Anda
              </span>
              <div className="text-5xl sm:text-6xl font-black font-serif-brand text-[#c07a50] tracking-tight my-1">
                #{String(registeredGuest.queueNumber).padStart(3, '0')}
              </div>
              <p className="text-xs text-[#1b5e20] font-semibold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#e67e22]" />
                {config.queueInstruction || 'Tunjukkan nomor ini saat berkonsultasi & memesan buket di meja booth'}
              </p>
            </div>

            {/* Visitor info table */}
            <div className="space-y-2 text-xs text-[#2c2a29] mb-5">
              <div className="flex justify-between py-1 border-b border-[#ebd9c8]/50">
                <span className="text-[#4a5d4e]">Nama Pengunjung:</span>
                <span className="font-bold">{registeredGuest.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ebd9c8]/50">
                <span className="text-[#4a5d4e]">No. HP / WhatsApp:</span>
                <span className="font-medium font-mono">{registeredGuest.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ebd9c8]/50">
                <span className="text-[#4a5d4e]">Alamat / Instansi:</span>
                <span className="font-medium">{registeredGuest.addressInstansi}</span>
              </div>
              {registeredGuest.feedbackMessage && (
                <div className="py-1">
                  <span className="text-[#4a5d4e] block mb-0.5">Kritik & Saran:</span>
                  <span className="italic bg-white/70 p-2 rounded-lg block text-slate-700">
                    "{registeredGuest.feedbackMessage}"
                  </span>
                </div>
              )}
            </div>

            {/* Audio Greeting Control on Pass */}
            <div className="bg-[#1a237e]/5 rounded-xl p-3 sm:p-4 border border-[#1a237e]/15 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isAudioPlaying
                        ? 'bg-[#c07a50] text-white animate-pulse shadow-md'
                        : 'bg-white text-[#1a237e] border border-[#1a237e]/20'
                    }`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div className="text-left leading-tight min-w-0">
                    <p className="text-xs font-bold text-[#1a237e]">Sambutan Suara Tamu Stand</p>
                    <p className="text-[11px] text-[#4a5d4e] truncate">
                      {isAudioPlaying ? 'Sedang memutar suara sambutan...' : 'Dengarkan suara sambutan resmi booth'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayGreetingAudio(registeredGuest.queueNumber)}
                  className="px-3.5 py-2 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isAudioPlaying ? 'Ulangi Suara' : 'Putar Suara'}
                </button>
              </div>

              <div className="text-[10.5px] text-[#4a5d4e]/85 bg-white/70 px-2.5 py-1.5 rounded-lg border border-[#ebd9c8] flex items-center gap-1.5">
                <span>🔊</span>
                <span>
                  <strong>Khusus Pengguna HP Android:</strong> Pastikan Volume Media di HP dinaikkan dan mode Senyap/Hening dimatikan.
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons under pass */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Bagikan ke WhatsApp
            </button>

            <button
              onClick={handlePrintPass}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan Tiket
            </button>

            <button
              onClick={handleResetForNextGuest}
              className="px-4 py-2 rounded-xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Daftarkan Tamu Berikutnya
            </button>
          </div>
        </div>
      ) : (
        /* The Registration Form Card */
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-xl border border-[#ebd9c8]">
          <div className="max-w-2xl mx-auto">
            {/* Header Form */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c07a50]/10 text-[#c07a50] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Buku Tamu Digital Stand
              </div>
              <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#2c2a29]">
                Registrasi Kunjungan Stand
              </h2>
              {config.registrationNotice ? (
                <p className="text-xs sm:text-sm text-[#4a5d4e] mt-1">
                  {config.registrationNotice.replace(/\[NOMOR\]/g, 'Spesial').replace(/#\d+/g, 'Eksklusif')}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-[#4a5d4e] mt-1">
                  Daftarkan diri Anda untuk mendapatkan <strong>Tiket & Nomor Antrean Eksklusif Stand (Kejutan)</strong> serta sambutan audio resmi booth kami.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c2a29] mb-1.5">
                  Nama Lengkap Pengunjung <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rian Anggara / Siti Nurhaliza"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/20 bg-[#faf8f5]/60 transition-all"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c2a29] mb-1.5">
                  No. WhatsApp / HP Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/20 bg-[#faf8f5]/60 transition-all"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Digunakan untuk konfirmasi pesanan buket dan pengiriman tiket digital.
                </span>
              </div>

              {/* Address / Instansi */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c2a29] mb-1.5">
                  Alamat / Instansi / Prodi / Fakultas <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={addressInstansi}
                    onChange={(e) => setAddressInstansi(e.target.value)}
                    placeholder="Contoh: Prodi Teknik Informatika UNIKMA / Umum"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/20 bg-[#faf8f5]/60 transition-all"
                  />
                </div>
              </div>

              {/* Star Rating with explicit labels */}
              <div className="bg-[#faf8f5] p-4 rounded-2xl border border-[#ebd9c8]/70">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2c2a29]">
                    Penilaian Stand Booth ({rating} dari 5 Bintang)
                  </label>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs ${
                    rating === 5
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : rating === 4
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : rating === 3
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : rating === 2
                      ? 'bg-orange-50 text-orange-800 border-orange-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    {rating} Bintang: {RATING_LABELS[rating]}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 sm:p-1.5 rounded-xl hover:bg-amber-100/50 active:scale-95 transition-all cursor-pointer group"
                      title={`${star} Bintang: ${RATING_LABELS[star]}`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-all ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-xs'
                            : 'text-slate-300 group-hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#c07a50] ml-2 hidden sm:inline">
                    {rating === 5 ? '🌸 Sangat Memuaskan!' : rating >= 3 ? '✨ Terima kasih!' : 'Masukan Anda Berharga'}
                  </span>
                </div>

                {/* Rating Guide Cards */}
                <div className="grid grid-cols-5 gap-1 pt-2.5 text-[9px] sm:text-[10px] text-center font-medium">
                  <button
                    type="button"
                    onClick={() => setRating(1)}
                    className={`py-1 px-0.5 rounded-lg border transition-all cursor-pointer ${
                      rating === 1
                        ? 'bg-red-500 text-white font-bold border-red-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'
                    }`}
                  >
                    1★ Sangat Jelek
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating(2)}
                    className={`py-1 px-0.5 rounded-lg border transition-all cursor-pointer ${
                      rating === 2
                        ? 'bg-orange-500 text-white font-bold border-orange-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    2★ Jelek
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating(3)}
                    className={`py-1 px-0.5 rounded-lg border transition-all cursor-pointer ${
                      rating === 3
                        ? 'bg-amber-500 text-white font-bold border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    3★ Cukup Baik
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating(4)}
                    className={`py-1 px-0.5 rounded-lg border transition-all cursor-pointer ${
                      rating === 4
                        ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    4★ Bagus
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating(5)}
                    className={`py-1 px-0.5 rounded-lg border transition-all cursor-pointer ${
                      rating === 5
                        ? 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    5★ Sangat Bagus & Memuaskan
                  </button>
                </div>
              </div>

              {/* Feedback / Kritik & Saran */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c2a29] mb-1.5">
                  Kritik, Saran & Masukan untuk Stand KLOVIBE x UNIKMA
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Tuliskan kesan, kritik, atau ucapan selamat wisuda untuk stand kami..."
                    className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/20 bg-[#faf8f5]/60 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button (SURPRISE: No next queue number preview) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1b5e20] to-[#144719] hover:from-[#144719] hover:to-[#0f3413] text-white font-serif-brand font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5 text-[#e67e22]" />
                <span>
                  {isSubmitting
                    ? 'Mendaftarkan Kunjungan...'
                    : 'Daftar Kunjungan Stand Sekarang 🎁'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="text-center pt-1 text-xs text-[#4a5d4e]">
                <span>{config.footerNotice || '🌸 Registrasi gratis. Dapatkan nomor antrean & sambutan audio spesial di stand.'}</span>
              </div>

              {/* Direct Bypass to Catalog */}
              <div className="pt-2 border-t border-[#ebd9c8]/60 text-center">
                <button
                  type="button"
                  onClick={onExploreCatalog}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c07a50]/10 hover:bg-[#c07a50]/20 text-[#c07a50] text-xs font-bold transition-all cursor-pointer"
                >
                  <span>🌸 Langsung Lihat Katalog Buket Stand (Tanpa Antrean)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
