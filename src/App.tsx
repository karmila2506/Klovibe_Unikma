/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  ShoppingBag,
  Sparkles,
  User,
  Heart,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  MessageSquareHeart,
  Tv,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Guest, Product, Category, AudioSettings, StandConfig } from './types';
import {
  getStoredGuests,
  getStoredProducts,
  getStoredCategories,
  getAudioSettings,
  getNextQueueNumber,
  getStandConfig,
  saveStandConfig,
} from './utils/storage';
import { HarmoniousBrandBar, UnikmaLogo, KlovibeLogo } from './components/Logos';
import { GuestRegistration } from './components/GuestRegistration';
import { ProductCatalog } from './components/ProductCatalog';
import { GuestFeedbackWall } from './components/GuestFeedbackWall';
import { AboutMe } from './components/AboutMe';
import { AudioEqualizer } from './components/AudioEqualizer';
import { AdminPortal } from './components/AdminPortal';
import { BoothKioskModal } from './components/BoothKioskModal';
import { stopAnyAudio } from './utils/audio';

export default function App() {
  // Application Data States
  const [guests, setGuests] = useState<Guest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    mode: 'tts',
    hasCustomRecording: false,
    ttsTemplate:
      'Hai, selamat datang! 🌸 Anda adalah pengunjung ke-[NOMOR_URUT_TAMU] di Stand KLOVIBE Bouquet, Universitas Komputama.',
    pitch: 1.05,
    rate: 1.0,
  });
  const [nextQueueNumber, setNextQueueNumber] = useState<number>(1);
  const [standConfig, setStandConfig] = useState<StandConfig>(getStandConfig());

  // Screen State: 'opener' (Halaman Pembuka / Registrasi Tamu) vs 'catalog' (Katalog Buket Stand)
  const [currentScreen, setCurrentScreen] = useState<'opener' | 'catalog'>('opener');

  // Modal States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [justRegisteredGuest, setJustRegisteredGuest] = useState<Guest | null>(null);

  // Audio Equalizer State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Load initial data from localStorage / IndexedDB
  const reloadData = useCallback(() => {
    const loadedGuests = getStoredGuests();
    const loadedProducts = getStoredProducts();
    const loadedCategories = getStoredCategories();
    const loadedAudioSettings = getAudioSettings();
    const qNum = getNextQueueNumber();
    const cfg = getStandConfig();

    setGuests(loadedGuests);
    setProducts(loadedProducts);
    setCategories(loadedCategories);
    setAudioSettings(loadedAudioSettings);
    setNextQueueNumber(qNum);
    setStandConfig(cfg);
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Handler when guest finishes registration:
  // "Layar kios itu ditampilkan setelah registrasi lalu tambahkan tombol katalog."
  const handleGuestRegistered = (newGuest: Guest) => {
    setJustRegisteredGuest(newGuest);
    reloadData();
    // Open Booth Kiosk Screen immediately after registration
    setIsKioskOpen(true);
  };

  const handleAudioStateChange = (playing: boolean, message?: string) => {
    setIsAudioPlaying(playing);
    if (message) setAudioMessage(message);
  };

  const handleStopAudio = () => {
    stopAnyAudio();
    setIsAudioPlaying(false);
  };

  const handleSaveConfig = (newCfg: StandConfig) => {
    setStandConfig(newCfg);
    saveStandConfig(newCfg);
    reloadData();
  };

  // Background Theme Styling (Anti-monotonous dynamic background)
  const getThemeBackgroundClass = () => {
    switch (standConfig.backgroundTheme) {
      case 'sage-botanical':
        return 'bg-gradient-to-b from-[#f2f7f3] via-[#e9f1eb] to-[#e1ede4]';
      case 'emerald-gold':
        return 'bg-gradient-to-b from-[#f0f6f2] via-[#e9f0eb] to-[#fbf8f2]';
      case 'terracotta-rose':
        return 'bg-gradient-to-b from-[#fcf7f4] via-[#f7eee8] to-[#f2e4dc]';
      case 'floral-kraft':
      default:
        return 'bg-gradient-to-b from-[#fdfbf8] via-[#f7f2ea] to-[#f2ebe0]';
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col text-[#2c2a29] relative transition-colors duration-500 ${getThemeBackgroundClass()}`}
    >
      {/* Optional Custom Wallpaper Image with Blur */}
      {standConfig.backgroundTheme === 'custom-image' && standConfig.customBackgroundImageUrl && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `url(${standConfig.customBackgroundImageUrl})`,
            filter: standConfig.backgroundBlur ? 'blur(8px)' : 'none',
            opacity: 0.18,
          }}
        />
      )}

      {/* Subtle Aesthetic Floral Pattern Watermark Background (Anti-Monoton) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <svg className="absolute -top-16 -left-16 w-96 h-96 text-[#c07a50]/15" viewBox="0 0 200 200" fill="currentColor">
          <path d="M45.7,-76.3C58.9,-69.3,69.1,-56.9,76.5,-43C83.9,-29.2,88.5,-14.6,86.6,-0.8C84.7,13,76.3,26,67.6,37.8C59,49.6,50,60.2,38.6,68.2C27.1,76.1,13.6,81.4,-0.4,82C-14.3,82.7,-28.7,78.7,-41.8,71.4C-54.8,64.2,-66.6,53.7,-74.6,40.7C-82.6,27.7,-86.8,12.2,-85.4,-2.8C-83.9,-17.8,-76.8,-32.4,-67.2,-44.7C-57.5,-57.1,-45.3,-67.2,-31.8,-74C-18.4,-80.8,-3.7,-84.3,10.6,-81.8C24.9,-79.3,32.6,-83.4,45.7,-76.3Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute -bottom-20 -right-20 w-[500px] h-[500px] text-[#1b5e20]/15" viewBox="0 0 200 200" fill="currentColor">
          <path d="M41.7,-68.8C53.9,-63.3,63.7,-51.7,70.9,-38.7C78,-25.7,82.6,-11.3,81.3,2.5C80,16.2,72.8,29.3,63.9,40.7C55,52,44.4,61.6,32.1,68C19.8,74.4,5.8,77.6,-8.7,77.1C-23.2,76.6,-38.2,72.4,-49.7,63.7C-61.1,55,-69.1,41.9,-74.5,27.7C-79.9,13.6,-82.7,-1.5,-79.7,-15.7C-76.7,-29.9,-68,-43.1,-56.3,-53C-44.6,-62.9,-29.9,-69.4,-15.4,-72.1C-0.8,-74.8,13.8,-73.6,29.5,-74.3Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Top Harmonious Brand Header */}
      <div className="relative z-10">
        <HarmoniousBrandBar
          visitorCount={guests.length}
          currentScreen={currentScreen}
          onNavigateScreen={(scr) => {
            setCurrentScreen(scr);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenKiosk={() => setIsKioskOpen(true)}
          customUnikmaLogoUrl={standConfig.customUnikmaLogoUrl}
          customKlovibeLogoUrl={standConfig.customKlovibeLogoUrl}
        />
      </div>

      {/* Main Content Area: Dedicated Opening Screen vs Catalog Screen */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentScreen === 'opener' ? (
          /* ========================================================= */
          /* SCREEN 1: HALAMAN PEMBUKA & REGISTRASI TAMU STAND         */
          /* ========================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Grand Hero Stand Banner */}
            <div
              className="relative rounded-3xl overflow-hidden text-white p-6 sm:p-10 shadow-xl border border-[#ebd9c8] bg-cover bg-center transition-all duration-500"
              style={{
                backgroundImage: standConfig.customBannerImageUrl
                  ? `linear-gradient(rgba(15, 35, 20, 0.78), rgba(26, 35, 126, 0.78)), url("${standConfig.customBannerImageUrl}")`
                  : undefined,
              }}
            >
              {!standConfig.customBannerImageUrl && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#1b5e20] via-[#244b29] to-[#1a237e] -z-10" />
              )}
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#f4efe6]">
                  <Sparkles className="w-3.5 h-3.5 text-[#e67e22]" />
                  Pintu Masuk Booth {standConfig.unikmaBrandName} x {standConfig.klovibeBrandName}
                </div>

                <h1 className="font-serif-brand text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {standConfig.heroTitle}
                </h1>

                <p className="text-xs sm:text-sm text-[#f4efe6]/85 leading-relaxed">
                  {standConfig.heroSubtitle}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#f4efe6]/90 font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#e67e22]" />
                    <span>Buket Asli Berkualitas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#e67e22]" />
                    <span>Edisi Khusus Wisuda {standConfig.unikmaBrandName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#e67e22]" />
                    <span>{standConfig.boothLocation}</span>
                  </div>
                </div>

                {/* Direct Action Bypass to Catalog */}
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentScreen('catalog');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c07a50] to-[#e67e22] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Buka & Lihat Katalog Buket Stand</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Decorative crest watermark in background */}
              <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none transform rotate-12 scale-125">
                <UnikmaLogo size={320} customLogoUrl={standConfig.customUnikmaLogoUrl} />
              </div>
            </div>

            {/* Registration Card (Buku Tamu Digital) */}
            <GuestRegistration
              onGuestRegistered={handleGuestRegistered}
              nextQueueNumber={nextQueueNumber}
              audioSettings={audioSettings}
              onAudioPlayStateChange={handleAudioStateChange}
              onExploreCatalog={() => {
                setCurrentScreen('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowKioskPass={(guest) => {
                setJustRegisteredGuest(guest);
                setIsKioskOpen(true);
              }}
              config={standConfig}
            />
          </div>
        ) : (
          /* ========================================================= */
          /* SCREEN 2: HALAMAN KATALOG BUKET & BOOTH STAND             */
          /* ========================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Navigation Bar / Banner for Catalog */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#ebd9c8] shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setCurrentScreen('opener');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Registrasi Stand</span>
                </button>
                <div>
                  <h2 className="font-serif-brand text-lg sm:text-xl font-bold text-[#2c2a29]">
                    Katalog Buket Stand {standConfig.klovibeBrandName}
                  </h2>
                  <p className="text-[11px] text-[#4a5d4e]">
                    Spesial Wisuda {standConfig.unikmaBrandName} · Ambil Langsung di Booth
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollToSection('kesan-tamu')}
                  className="px-3.5 py-2 rounded-xl border border-[#c07a50]/40 text-[#c07a50] hover:bg-[#c07a50]/10 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                  <span>Kesan & Pesan Tamu</span>
                </button>
              </div>
            </div>

            {/* Product Catalog Component */}
            <ProductCatalog
              products={products}
              categories={categories}
              config={standConfig}
              onNavigateFeedback={() => scrollToSection('kesan-tamu')}
            />

            {/* Guest Feedback Wall inside Catalog view */}
            <section id="kesan-tamu" className="scroll-mt-24 pt-4 border-t border-[#ebd9c8]">
              <GuestFeedbackWall
                guests={guests}
                config={standConfig}
                onNavigateRegister={() => {
                  setCurrentScreen('opener');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </section>
          </div>
        )}
      </main>

      {/* Floating Audio Equalizer Indicator */}
      <AudioEqualizer
        isPlaying={isAudioPlaying}
        onToggleMuteOrStop={handleStopAudio}
        messageText={audioMessage}
        isCustomVoice={audioSettings.mode === 'custom'}
      />

      {/* Admin Portal Modal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        guests={guests}
        products={products}
        categories={categories}
        audioSettings={audioSettings}
        config={standConfig}
        nextQueueNumber={nextQueueNumber}
        onDataChanged={reloadData}
        onSaveConfig={handleSaveConfig}
        onOpenKiosk={() => {
          setIsAdminOpen(false);
          setIsKioskOpen(true);
        }}
      />

      {/* Booth Kiosk Screen Modal */}
      <BoothKioskModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
        guests={guests}
        products={products}
        nextQueueNumber={nextQueueNumber}
        config={standConfig}
        justRegisteredGuest={justRegisteredGuest}
        onOpenCatalog={() => {
          setIsKioskOpen(false);
          setCurrentScreen('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRegisterAnother={() => {
          setIsKioskOpen(false);
          setCurrentScreen('opener');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* About Me Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="max-w-4xl w-full my-auto">
            <AboutMe
              config={standConfig}
              onOpenCatalog={() => {
                setIsAboutModalOpen(false);
                setCurrentScreen('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onClose={() => setIsAboutModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Footer with Dedicated About Me Feature Card */}
      <footer className="relative z-10 mt-auto bg-[#f4efe6]/95 backdrop-blur-md border-t border-[#ebd9c8] py-8 text-[#4a5d4e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          {/* About Me Feature Card in Footer */}
          <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#ebd9c8] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#c07a50]/15 text-[#c07a50] flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c07a50]">
                  Profil Florist & Cerita Kolaborasi
                </span>
                <h4 className="font-serif-brand font-bold text-base text-[#2c2a29]">
                  {standConfig.aboutMeTitle}
                </h4>
                <p className="text-xs text-[#4a5d4e] max-w-xl">
                  {standConfig.aboutMeStory ? standConfig.aboutMeStory.slice(0, 130) + '...' : 'Pelajari cerita karya dan filosofi di balik stand kolaborasi KLOVIBE GIFT x UNIKMA.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
            >
              <User className="w-4 h-4" />
              <span>Lihat Tentang Kami (About Me)</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs pt-2 border-t border-[#ebd9c8]/70">
            <div className="flex items-center gap-2">
              <UnikmaLogo size={28} customLogoUrl={standConfig.customUnikmaLogoUrl} />
              <span className="font-bold text-[#1a237e]">{standConfig.unikmaBrandName}</span>
              <span className="text-slate-300">×</span>
              <KlovibeLogo size={28} showSlogan={false} customLogoUrl={standConfig.customKlovibeLogoUrl} />
              <span className="font-serif-brand font-bold text-[#c07a50]">{standConfig.klovibeBrandName}</span>
            </div>

            <div className="text-center sm:text-right text-[11px] text-slate-600">
              <div>"{standConfig.tagline}" · Stand Expo Wisuda UNIKMA</div>
              <div className="text-slate-500 mt-0.5">
                Hotline Florist: {standConfig.whatsappNumber} · Lokasi: {standConfig.boothLocation}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
