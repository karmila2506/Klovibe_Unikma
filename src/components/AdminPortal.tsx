import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  X,
  Users,
  Volume2,
  Package,
  Download,
  Trash2,
  Plus,
  Edit2,
  Check,
  AlertTriangle,
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Settings,
  FileSpreadsheet,
  Palette,
  Phone,
  Image as ImageIcon,
  KeyRound,
  ExternalLink,
  Sparkles,
  Tv,
  CheckCircle2,
} from 'lucide-react';
import { Guest, Product, Category, AudioSettings, StandConfig, BackgroundThemeId } from '../types';
import {
  checkAdminPassword,
  setAdminPassword,
  deleteGuest,
  updateGuest,
  resetAllGuestsAndQueue,
  saveProduct,
  deleteProduct,
  saveCategories,
  saveAudioSettings,
  formatRupiah,
  saveStandConfig,
  DEFAULT_STAND_CONFIG,
  compressImageFile,
} from '../utils/storage';
import { saveAudioRecording, deleteAudioRecording, getAudioRecording } from '../utils/indexedDb';
import { playWelcomeGreeting, stopAnyAudio, speakWelcomeText, unlockMobileAudio } from '../utils/audio';
import { generateStandaloneGitHubPagesHtml } from '../utils/githubExporter';
import { UnikmaLogo, KlovibeLogo } from './Logos';
import { RATING_LABELS } from './GuestRegistration';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: Guest[];
  products: Product[];
  categories: Category[];
  audioSettings: AudioSettings;
  config: StandConfig;
  nextQueueNumber: number;
  onDataChanged: () => void;
  onSaveConfig: (newConfig: StandConfig) => void;
  onOpenKiosk: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  guests,
  products,
  categories,
  audioSettings,
  config,
  nextQueueNumber,
  onDataChanged,
  onSaveConfig,
  onOpenKiosk,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab: 'guests' | 'products' | 'audio' | 'settings' | 'export'
  const [activeTab, setActiveTab] = useState<'guests' | 'products' | 'audio' | 'settings' | 'export'>('guests');

  // Guestbook search & edit
  const [guestSearch, setGuestSearch] = useState('');
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Audio Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [currentRecordedBlob, setCurrentRecordedBlob] = useState<Blob | null>(null);
  const [audioSettingsLocal, setAudioSettingsLocal] = useState<AudioSettings>(audioSettings);
  const [audioError, setAudioError] = useState('');
  const [isPreviewAudioPlaying, setIsPreviewAudioPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const previewAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // Stand Customization Settings State
  const [configDraft, setConfigDraft] = useState<StandConfig>(config);
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState('');

  // Product CRUD state
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Product Form states
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.id || 'wisuda-unikma');
  const [prodPrice, setProdPrice] = useState(95000);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodTags, setProdTags] = useState('Edisi UNIKMA, Best Seller');

  // Change Password state
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdChangeMessage, setPwdChangeMessage] = useState('');

  // Standalone Export state
  const [copiedExport, setCopiedExport] = useState(false);
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  // Helper for direct image file upload with automatic compression (converts 5MB -> ~40KB)
  const handleFileToBase64 = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (base64: string) => void,
    maxDimension = 800
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WebP)');
      return;
    }
    try {
      setIsProcessingImg(true);
      const compressed = await compressImageFile(file, maxDimension, maxDimension, 0.82);
      onLoaded(compressed);
    } catch (err) {
      console.warn('Compress image failed, using fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onLoaded(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingImg(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    setAudioSettingsLocal(audioSettings);
    if (audioSettings.hasCustomRecording) {
      getAudioRecording().then((blob) => {
        if (blob) {
          setCurrentRecordedBlob(blob);
          setRecordedAudioUrl(URL.createObjectURL(blob));
        }
      });
    }
  }, [audioSettings]);

  useEffect(() => {
    setConfigDraft(config);
  }, [config]);

  // Clean up audio tracks & timers when unmounting or closing
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (previewAudioElementRef.current) {
        previewAudioElementRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  // 1. LOGIN MODAL FOR ADMIN
  if (!isAuthenticated) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (checkAdminPassword(passwordInput)) {
        setIsAuthenticated(true);
        setAuthError('');
        setPasswordInput('');
      } else {
        setAuthError('Kata sandi salah. Silakan periksa kembali sandi khusus admin Anda.');
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#ebd9c8] relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#1a237e]/10 text-[#1a237e] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-serif-brand text-2xl font-bold text-[#2c2a29]">
              Portal Admin Stand
            </h2>
            <p className="text-xs text-[#4a5d4e]">
              Akses khusus pengelola booth {config.klovibeBrandName} x {config.unikmaBrandName}.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2c2a29] mb-1.5">
                Kata Sandi Admin
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan kata sandi admin..."
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#1a237e] focus:ring-2 focus:ring-[#1a237e]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title={showLoginPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {authError && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {authError}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#f4efe6]/70 border border-[#ebd9c8] text-xs text-[#4a5d4e]">
              <span className="font-bold text-[#2c2a29]">Keamanan Terjamin:</span> Area ini terlindungi untuk mengelola buku tamu, rekaman suara sambutan, katalog produk, dan tampilan stan.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#1a237e] hover:bg-[#151c65] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Masuk Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. MAIN ADMIN DASHBOARD (AUTHENTICATED)
  // -------------------------------------------------------------

  // CSV Exporter for Guestbook
  const handleExportCSV = () => {
    if (guests.length === 0) {
      alert('Belum ada data tamu untuk diekspor.');
      return;
    }

    const headers = [
      'Nomor Urut',
      'Nama Tamu',
      'No. WhatsApp',
      'Alamat / Instansi',
      'Penilaian (1-5)',
      'Kritik & Saran',
      'Waktu Kunjungan',
    ];

    const rows = guests.map((g) => [
      `"#${String(g.queueNumber).padStart(3, '0')}"`,
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.phone}"`,
      `"${g.addressInstansi.replace(/"/g, '""')}"`,
      g.rating,
      `"${g.feedbackMessage.replace(/"/g, '""')}"`,
      `"${new Date(g.timestamp).toLocaleString('id-ID')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Buku_Tamu_KLOVIBE_UNIKMA_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Queue & Guests
  const handleConfirmReset = () => {
    resetAllGuestsAndQueue();
    setShowResetConfirmModal(false);
    onDataChanged();
    alert('Buku tamu berhasil dikosongkan dan nomor urut direset kembali ke angka 1.');
  };

  // -------------------------------------------------------------
  // MICROPHONE RECORDING & AUDIO MANAGEMENT (FIXED & ENHANCED)
  // -------------------------------------------------------------
  const handleStartRecording = async () => {
    setAudioError('');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setAudioError('Browser tidak mendukung perekaman audio langsung via getUserMedia.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      audioStreamRef.current = stream;

      // Check supported mime types
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg',
      ];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const options: MediaRecorderOptions = selectedMime ? { mimeType: selectedMime } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const finalMime = selectedMime || mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });
          setCurrentRecordedBlob(audioBlob);
          const url = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(url);

          // Stop all stream tracks
          stream.getTracks().forEach((track) => track.stop());

          // Automatically save to IndexedDB & base64
          await saveAudioRecording(audioBlob);
          const updatedSettings: AudioSettings = {
            ...audioSettingsLocal,
            hasCustomRecording: true,
            mode: 'custom',
            recordingDate: new Date().toISOString(),
          };
          setAudioSettingsLocal(updatedSettings);
          saveAudioSettings(updatedSettings);
          onDataChanged();
        } catch (err) {
          console.error('Error saving audio blob:', err);
          setAudioError('Gagal memproses hasil rekaman suara.');
        }
      };

      mediaRecorder.onerror = (err) => {
        console.error('MediaRecorder error:', err);
        setAudioError('Terjadi kesalahan pada recorder mikrofon.');
        handleStopRecording();
      };

      // Start recording with 250ms timeslice to ensure continuous chunk feed
      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      let msg = 'Tidak dapat mengakses mikrofon. ';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg += 'Izin mikrofon belum diberikan pada browser. Anda juga bisa mengunggah file rekaman (MP3/WAV) menggunakan tombol di bawah.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg += 'Perangkat mikrofon tidak terdeteksi. Silakan gunakan opsi "Unggah File Audio" di bawah.';
      } else {
        msg += 'Pastikan mikrofon aktif, atau unggah file rekaman langsung.';
      }
      setAudioError(msg);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    }
  };

  // Alternative audio file upload handler
  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const audioBlob = new Blob([buffer], { type: file.type || 'audio/mp3' });
      setCurrentRecordedBlob(audioBlob);
      const url = URL.createObjectURL(audioBlob);
      setRecordedAudioUrl(url);

      await saveAudioRecording(audioBlob);
      const updatedSettings: AudioSettings = {
        ...audioSettingsLocal,
        hasCustomRecording: true,
        mode: 'custom',
        recordingDate: new Date().toISOString(),
      };
      setAudioSettingsLocal(updatedSettings);
      saveAudioSettings(updatedSettings);
      onDataChanged();
      alert(`File audio "${file.name}" berhasil diunggah dan disimpan sebagai rekaman suara stan!`);
    } catch (err) {
      console.error('Audio upload error:', err);
      alert('Gagal mengunggah file audio.');
    }
  };

  const handleDeleteRecording = async () => {
    if (confirm('Hapus rekaman suara kustom ini?')) {
      await deleteAudioRecording();
      setRecordedAudioUrl(null);
      setCurrentRecordedBlob(null);
      const updatedSettings: AudioSettings = {
        ...audioSettingsLocal,
        hasCustomRecording: false,
        mode: 'tts',
      };
      setAudioSettingsLocal(updatedSettings);
      saveAudioSettings(updatedSettings);
      onDataChanged();
    }
  };

  const handleTogglePreviewAudio = () => {
    if (isPreviewAudioPlaying) {
      if (previewAudioElementRef.current) {
        previewAudioElementRef.current.pause();
      }
      setIsPreviewAudioPlaying(false);
    } else {
      if (recordedAudioUrl) {
        if (!previewAudioElementRef.current) {
          previewAudioElementRef.current = new Audio(recordedAudioUrl);
        } else {
          previewAudioElementRef.current.src = recordedAudioUrl;
        }

        previewAudioElementRef.current.onended = () => {
          setIsPreviewAudioPlaying(false);
        };
        previewAudioElementRef.current.onerror = () => {
          setIsPreviewAudioPlaying(false);
        };
        previewAudioElementRef.current.play();
        setIsPreviewAudioPlaying(true);
      }
    }
  };

  const handleTestTts = () => {
    unlockMobileAudio();
    setIsPreviewAudioPlaying(true);
    playWelcomeGreeting(1, audioSettingsLocal, {
      onStart: () => setIsPreviewAudioPlaying(true),
      onEnd: () => setIsPreviewAudioPlaying(false),
      onError: () => setIsPreviewAudioPlaying(false),
    });
  };

  const handleSaveAudioModeSettings = (newMode: 'tts' | 'custom') => {
    const updated = { ...audioSettingsLocal, mode: newMode };
    setAudioSettingsLocal(updated);
    saveAudioSettings(updated);
    onDataChanged();
  };

  // -------------------------------------------------------------
  // STAND SETTINGS HANDLER
  // -------------------------------------------------------------
  const handleSaveStandConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStandConfig(configDraft);
    onSaveConfig(configDraft);
    setSettingsSuccessMessage('Pengaturan stan berhasil disimpan dan langsung diterapkan!');
    setTimeout(() => setSettingsSuccessMessage(''), 3500);
  };

  const handleResetStandConfig = () => {
    if (confirm('Kembalikan semua teks, logo, nomor WhatsApp, dan tampilan stan ke default?')) {
      saveStandConfig(DEFAULT_STAND_CONFIG);
      setConfigDraft(DEFAULT_STAND_CONFIG);
      onSaveConfig(DEFAULT_STAND_CONFIG);
      setSettingsSuccessMessage('Pengaturan stan telah direset ke setelan awal.');
      setTimeout(() => setSettingsSuccessMessage(''), 3500);
    }
  };

  // Change password handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setPwdChangeMessage('Kata sandi baru tidak boleh kosong.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdChangeMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setAdminPassword(newPassword.trim());
    setPwdChangeMessage('Kata sandi admin berhasil diperbarui! Simpan sandi ini dengan aman.');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setShowChangePwdModal(false);
      setPwdChangeMessage('');
    }, 2000);
  };

  // -------------------------------------------------------------
  // PRODUCT CRUD HANDLERS
  // -------------------------------------------------------------
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim() || !prodDescription.trim()) {
      alert('Mohon lengkapi nama buket dan deskripsi bahan buket.');
      return;
    }

    const finalImageUrl =
      prodImageUrl.trim() ||
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80';

    const tagsArray = prodTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newProd: Product = {
      id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: prodTitle.trim(),
      category: prodCategory || categories[0]?.id || 'wisuda-unikma',
      price: Number(prodPrice) || 0,
      description: prodDescription.trim(),
      imageUrl: finalImageUrl,
      tags: tagsArray.length > 0 ? tagsArray : ['Buket Stand'],
      isFeatured: true,
      createdBy: 'admin',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    const saved = saveProduct(newProd);
    if (!saved) {
      alert('Gagal menyimpan produk karena kuota penyimpanan browser penuh. Silakan kurangi ukuran foto.');
      return;
    }

    onDataChanged();
    setIsNewProductModalOpen(false);

    // Reset form
    setProdTitle('');
    setProdDescription('');
    setProdImageUrl('');
    setProdPrice(95000);
    setProdTags('Edisi UNIKMA, Best Seller');
    alert('Buket baru berhasil disimpan dan tampil di katalog stand!');
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const saved = saveProduct(editingProduct);
    if (!saved) {
      alert('Gagal memperbarui produk karena kuota browser penuh.');
      return;
    }

    onDataChanged();
    setEditingProduct(null);
    alert('Data produk buket berhasil diperbarui!');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Hapus produk buket ini dari katalog?')) {
      deleteProduct(id);
      onDataChanged();
    }
  };

  // Filtered products for admin
  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase();
    return (
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  // Filtered guests
  const filteredGuests = guests.filter((g) => {
    const q = guestSearch.toLowerCase();
    return (
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      g.addressInstansi.toLowerCase().includes(q) ||
      g.feedbackMessage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#fcfbf9] rounded-3xl max-w-6xl w-full h-[94vh] shadow-2xl border border-[#ebd9c8] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#ebd9c8] bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <UnikmaLogo size={36} customLogoUrl={config.customUnikmaLogoUrl} />
            <div className="h-6 w-px bg-slate-300"></div>
            <KlovibeLogo size={36} showSlogan={false} customLogoUrl={config.customKlovibeLogoUrl} />
            <div className="ml-2">
              <h2 className="font-serif-brand text-base sm:text-lg font-bold text-[#2c2a29] flex items-center gap-2">
                <span>Dashboard Admin Stand Booth</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1b5e20] text-white">
                  Aktif
                </span>
              </h2>
              <p className="text-[11px] text-[#4a5d4e]">
                {config.klovibeBrandName} x {config.unikmaBrandName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenKiosk}
              className="px-3 py-1.5 rounded-xl border border-[#c07a50]/40 text-[#c07a50] hover:bg-[#c07a50] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buka Layar Kios</span>
            </button>

            <button
              onClick={() => setShowChangePwdModal(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Ganti Kata Sandi Admin"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ganti Sandi</span>
            </button>

            <button
              onClick={() => {
                setIsAuthenticated(false);
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Keluar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 bg-white border-b border-[#ebd9c8] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('guests')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'guests'
                ? 'border-[#1b5e20] text-[#1b5e20]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Buku Tamu Stand ({guests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#1b5e20] text-[#1b5e20]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Katalog Buket ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'audio'
                ? 'border-[#1b5e20] text-[#1b5e20]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Suara Sambutan Stan</span>
            {audioSettingsLocal.hasCustomRecording && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#1b5e20] text-[#1b5e20]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan Tampilan & Stand</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'export'
                ? 'border-[#1b5e20] text-[#1b5e20]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Deploy & Ekspor GitHub Pages</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#faf8f5]">
          {/* ========================================================================= */}
          {/* TAB 1: GUESTBOOK MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'guests' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#ebd9c8] shadow-xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Cari nama, nomor HP, kritik..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 rounded-xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Ekspor CSV
                  </button>

                  <button
                    onClick={() => setShowResetConfirmModal(true)}
                    className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset Nomor & Tamu
                  </button>
                </div>
              </div>

              {/* Guest Table */}
              <div className="bg-white rounded-2xl border border-[#ebd9c8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f4efe6] text-[#4a5d4e] uppercase font-bold border-b border-[#ebd9c8]">
                      <tr>
                        <th className="py-3 px-4">No. Antrean</th>
                        <th className="py-3 px-4">Nama Lengkap</th>
                        <th className="py-3 px-4">No. WhatsApp</th>
                        <th className="py-3 px-4">Alamat / Instansi</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4">Kritik & Saran</th>
                        <th className="py-3 px-4">Waktu</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredGuests.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            Tidak ada data tamu ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredGuests.map((g) => (
                          <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#c07a50]">
                              #{String(g.queueNumber).padStart(3, '0')}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800">{g.name}</td>
                            <td className="py-3 px-4 font-mono text-slate-600">{g.phone}</td>
                            <td className="py-3 px-4 text-slate-600">{g.addressInstansi}</td>
                            <td className="py-3 px-4 text-amber-500 font-bold whitespace-nowrap">
                              <div className="flex flex-col gap-0.5">
                                <span>{'⭐'.repeat(g.rating || 5)}</span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {RATING_LABELS[g.rating || 5] || `${g.rating} Bintang`}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-700 italic max-w-xs truncate">
                              "{g.feedbackMessage}"
                            </td>
                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                              {new Date(g.timestamp).toLocaleString('id-ID', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </td>
                            <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => setEditingGuest(g)}
                                className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                                title="Edit Tamu"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus tamu ${g.name}?`)) {
                                    deleteGuest(g.id);
                                    onDataChanged();
                                  }
                                }}
                                className="p-1 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                                title="Hapus Tamu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PRODUCT MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#ebd9c8] shadow-xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari judul buket, kategori..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                  />
                </div>

                <button
                  onClick={() => setIsNewProductModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Produk Buket Baru
                </button>
              </div>

              {/* Products Grid in Admin */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-[#ebd9c8] p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-[#1b5e20] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {p.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#2c2a29] line-clamp-1">{p.title}</h4>
                      <p className="font-serif-brand font-bold text-[#c07a50] text-base my-1">
                        {formatRupiah(p.price)}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-[#4a5d4e] font-semibold">
                        {p.tags.join(', ')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: AUDIO GREETING SETTINGS & MIC RECORDER */}
          {/* ========================================================================= */}
          {activeTab === 'audio' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Header explanation */}
              <div className="bg-white rounded-3xl p-6 border border-[#ebd9c8] shadow-xs space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a237e]/10 text-[#1a237e] text-xs font-bold uppercase tracking-wider">
                  <Volume2 className="w-3.5 h-3.5" />
                  Sistem Audio Sambutan Pengunjung
                </div>
                <h3 className="font-serif-brand text-2xl font-bold text-[#2c2a29]">
                  Atur Suara Sambutan Stand KLOVIBE x UNIKMA
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pilih cara stan menyapa tamu saat mereka menyelesaikan registrasi: gunakan <strong>Rekaman Suara Pribadi Florist/Booth</strong> atau <strong>Web Speech API (TTS Otomatis Berbahasa Indonesia)</strong>.
                </p>

                {/* Mode Switcher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleSaveAudioModeSettings('custom')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      audioSettingsLocal.mode === 'custom'
                        ? 'border-[#c07a50] bg-[#faf3ed] ring-2 ring-[#c07a50]/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#c07a50]">
                        Mode 1: Rekaman Suara Kustom
                      </span>
                      {audioSettingsLocal.mode === 'custom' && (
                        <CheckCircle2 className="w-4 h-4 text-[#c07a50]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      Suara asli pengelola stan via mikrofon atau file audio unggahan.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSaveAudioModeSettings('tts')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      audioSettingsLocal.mode === 'tts'
                        ? 'border-[#1b5e20] bg-[#eff7f0] ring-2 ring-[#1b5e20]/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#1b5e20]">
                        Mode 2: TTS Otomatis (Web Speech)
                      </span>
                      {audioSettingsLocal.mode === 'tts' && (
                        <CheckCircle2 className="w-4 h-4 text-[#1b5e20]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      Menyebutkan nomor urut otomatis (misal: "Pengunjung ke-4...").
                    </p>
                  </button>
                </div>
              </div>

              {/* Microphone Recorder Box */}
              <div className="bg-white rounded-3xl p-6 border border-[#ebd9c8] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-[#2c2a29] flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#c07a50]" />
                    Perekam Suara Stan via Mikrofon
                  </h4>
                  {audioSettingsLocal.hasCustomRecording && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Rekaman Tersedia
                    </span>
                  )}
                </div>

                {audioError && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>{audioError}</p>
                  </div>
                )}

                {/* Recording Controls */}
                <div className="p-6 rounded-2xl bg-linear-to-b from-[#fbf8f5] to-[#f4efe6] border border-[#ebd9c8] text-center space-y-4">
                  {isRecording ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto animate-pulse shadow-lg">
                        <Mic className="w-8 h-8 animate-bounce" />
                      </div>
                      <div>
                        <div className="text-xl font-mono font-black text-red-600">
                          00:{String(recordingSeconds).padStart(2, '0')}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Sedang merekam suara stan... Silakan bicara ke mikrofon.
                        </p>
                      </div>
                      <button
                        onClick={handleStopRecording}
                        className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-md flex items-center gap-2 mx-auto"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        Hentikan Rekaman & Simpan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-[#1b5e20]/10 text-[#1b5e20] flex items-center justify-center mx-auto">
                        <Mic className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 max-w-md mx-auto">
                          Contoh ucapan: <em>"Halo, selamat datang di stand KLOVIBE GIFT x Universitas Komputama! Selamat atas wisudanya, silakan lihat koleksi buket kami."</em>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={handleStartRecording}
                          className="px-6 py-3 rounded-xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs sm:text-sm font-bold cursor-pointer shadow-md flex items-center gap-2 transition-all hover:scale-105"
                        >
                          <Mic className="w-4 h-4" />
                          Mulai Rekam Suara Mikrofon
                        </button>

                        <label className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer flex items-center gap-2 transition-all">
                          <Upload className="w-4 h-4 text-slate-500" />
                          <span>Unggah File Audio (MP3/WAV/M4A)</span>
                          <input
                            ref={audioFileInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recorded Audio Player & Actions */}
                {recordedAudioUrl && (
                  <div className="p-4 rounded-2xl bg-white border border-[#ebd9c8] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleTogglePreviewAudio}
                        className="w-10 h-10 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white flex items-center justify-center cursor-pointer shadow-xs transition-colors"
                      >
                        {isPreviewAudioPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <div>
                        <span className="text-xs font-bold text-[#2c2a29] block">
                          Pratinjau Rekaman Suara Stand
                        </span>
                        <span className="text-[11px] text-[#4a5d4e]">
                          Tersimpan di IndexedDB & Storage lokal stan
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          playWelcomeGreeting(1, audioSettingsLocal);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#1b5e20] text-[#1b5e20] hover:bg-[#1b5e20] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Uji Suara Stand Penuh
                      </button>
                      <button
                        onClick={handleDeleteRecording}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus Rekaman"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TTS Template Customizer */}
              <div className="bg-white rounded-3xl p-6 border border-[#ebd9c8] shadow-xs space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-[#2c2a29]">
                  Template Teks-ke-Suara (TTS Otomatis)
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gunakan kode <code className="text-[#c07a50] font-mono font-bold">[NOMOR_URUT_TAMU]</code> untuk nomor antrean otomatis:
                  </label>
                  <textarea
                    rows={3}
                    value={audioSettingsLocal.ttsTemplate}
                    onChange={(e) => {
                      const updated = { ...audioSettingsLocal, ttsTemplate: e.target.value };
                      setAudioSettingsLocal(updated);
                      saveAudioSettings(updated);
                    }}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20] bg-[#faf8f5]/60 font-medium"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">
                    Otomatis disimpan saat Anda mengetik.
                  </span>
                  <button
                    onClick={handleTestTts}
                    className="px-4 py-2 rounded-xl bg-[#1a237e] hover:bg-[#151c65] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Uji Dengar Suara TTS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: STAND & UI CUSTOMIZATION SETTINGS */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <form onSubmit={handleSaveStandConfig} className="space-y-6">
                {/* Header card */}
                <div className="bg-white rounded-3xl p-6 border border-[#ebd9c8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b5e20]/10 text-[#1b5e20] text-xs font-bold uppercase tracking-wider mb-1">
                      <Settings className="w-3.5 h-3.5" />
                      Kustomisasi Teks, Logo, Nomor & Tampilan
                    </div>
                    <h3 className="font-serif-brand text-2xl font-bold text-[#2c2a29]">
                      Pengaturan Booth & Tampilan Stand
                    </h3>
                    <p className="text-xs text-[#4a5d4e] mt-0.5">
                      Atur semua tulisan, nomor WhatsApp, tema latar belakang, dan info About Me.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetStandConfig}
                      className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Reset Default
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Simpan Perubahan
                    </button>
                  </div>
                </div>

                {settingsSuccessMessage && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {settingsSuccessMessage}
                  </div>
                )}

                {/* Section 1: Kontak & Brand Identity */}
                <div className="bg-white rounded-3xl p-6 border border-[#ebd9c8] shadow-xs space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-[#2c2a29] flex items-center gap-2 border-b border-[#ebd9c8] pb-3">
                    <Phone className="w-4 h-4 text-[#25D366]" />
                    Nomor WhatsApp & Identitas Brand
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor WhatsApp Hotline Stand <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={configDraft.whatsappNumber}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, whatsappNumber: e.target.value })
                        }
                        placeholder="Contoh: 083111701845"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20] font-mono font-bold"
                      />
                      <span className="text-[10.5px] text-slate-500 mt-1 block">
                        Terhubung ke semua tombol "Pesan WA", "Chat Florist", dan About Me.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Slogan Brand KLOVIBE
                      </label>
                      <input
                        type="text"
                        value={configDraft.tagline}
                        onChange={(e) => setConfigDraft({ ...configDraft, tagline: e.target.value })}
                        placeholder="Contoh: Crafted Moments, Enduring Love"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Brand Utama 1
                      </label>
                      <input
                        type="text"
                        value={configDraft.unikmaBrandName}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, unikmaBrandName: e.target.value })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Brand Utama 2
                      </label>
                      <input
                        type="text"
                        value={configDraft.klovibeBrandName}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, klovibeBrandName: e.target.value })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Logo Kustom */}
                <div className="bg-white rounded-3xl p-6 border border-[#ebd9c8] shadow-xs space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-[#2c2a29] flex items-center gap-2 border-b border-[#ebd9c8] pb-3">
                    <ImageIcon className="w-4 h-4 text-[#c07a50]" />
                    Kustomisasi Gambar Logo (UNIKMA & KLOVIBE)
                  </h4>
                  <p className="text-xs text-slate-600">
                    Anda dapat mengunggah file gambar/logo langsung dari galeri HP atau laptop, atau memasukkan URL. Jika dikosongkan, sistem akan menampilkan logo vektor SVG resmi bawaan.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Logo UNIKMA */}
                    <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ebd9c8] space-y-3">
                      <label className="block text-xs font-bold text-[#1e2b82]">
                        Logo Universitas Komputama (UNIKMA)
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="px-3.5 py-2 rounded-xl bg-[#1e2b82] hover:bg-[#152065] text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Unggah File Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileToBase64(e, (dataUrl) =>
                                setConfigDraft({ ...configDraft, customUnikmaLogoUrl: dataUrl })
                              )
                            }
                          />
                        </label>
                        {configDraft.customUnikmaLogoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfigDraft({ ...configDraft, customUnikmaLogoUrl: '' })
                            }
                            className="text-xs text-red-600 hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={configDraft.customUnikmaLogoUrl || ''}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, customUnikmaLogoUrl: e.target.value })
                        }
                        placeholder="Atau tempel URL gambar..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20] bg-white"
                      />
                      {configDraft.customUnikmaLogoUrl && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] text-slate-500">Pratinjau:</span>
                          <img
                            src={configDraft.customUnikmaLogoUrl}
                            alt="Preview UNIKMA"
                            className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-1"
                          />
                        </div>
                      )}
                    </div>

                    {/* Logo KLOVIBE */}
                    <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ebd9c8] space-y-3">
                      <label className="block text-xs font-bold text-[#c07a50]">
                        Logo KLOVIBE GIFT
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="px-3.5 py-2 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Unggah File Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileToBase64(e, (dataUrl) =>
                                setConfigDraft({ ...configDraft, customKlovibeLogoUrl: dataUrl })
                              )
                            }
                          />
                        </label>
                        {configDraft.customKlovibeLogoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfigDraft({ ...configDraft, customKlovibeLogoUrl: '' })
                            }
                            className="text-xs text-red-600 hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={configDraft.customKlovibeLogoUrl || ''}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, customKlovibeLogoUrl: e.target.value })
                        }
                        placeholder="Atau tempel URL gambar..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20] bg-white"
                      />
                      {configDraft.customKlovibeLogoUrl && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] text-slate-500">Pratinjau:</span>
                          <img
                            src={configDraft.customKlovibeLogoUrl}
                            alt="Preview KLOVIBE"
                            className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Latar Belakang UI & Banner Stand */}
                <div className="bg-white rounded-3xl p-6 border border-[#ebd9c8] shadow-xs space-y-5">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-[#2c2a29] flex items-center gap-2 border-b border-[#ebd9c8] pb-3">
                    <Palette className="w-4 h-4 text-[#c07a50]" />
                    Pilihan Latar Belakang Tampilan UI & Banner Stand
                  </h4>
                  <p className="text-xs text-slate-600">
                    Sesuaikan suasana visual website booth. Anda dapat memilih tema warna bunga atau mengunggah foto wallpaper dan foto banner stand sendiri.
                  </p>

                  {/* Preset Themes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'floral-kraft' as BackgroundThemeId,
                        title: 'Floral Kraft Cream',
                        desc: 'Tekstur kertas hangat & aksen bunga estetik.',
                      },
                      {
                        id: 'sage-botanical' as BackgroundThemeId,
                        title: 'Soft Sage Botanical',
                        desc: 'Nuansa daun eucalyptus & hijau sage segar.',
                      },
                      {
                        id: 'emerald-gold' as BackgroundThemeId,
                        title: 'Emerald-Gold UNIKMA',
                        desc: 'Sentuhan resmi wisuda hijau zamrud & oranye emas.',
                      },
                      {
                        id: 'terracotta-rose' as BackgroundThemeId,
                        title: 'Terracotta Rose Bloom',
                        desc: 'Kehangatan mawar merah bata signature KLOVIBE.',
                      },
                      {
                        id: 'custom-image' as BackgroundThemeId,
                        title: 'Wallpaper Foto Kustom',
                        desc: 'Gunakan foto wallpaper yang diunggah.',
                      },
                    ].map((theme) => (
                      <button
                        type="button"
                        key={theme.id}
                        onClick={() =>
                          setConfigDraft({ ...configDraft, backgroundTheme: theme.id })
                        }
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          configDraft.backgroundTheme === theme.id
                            ? 'border-[#1b5e20] bg-[#eff7f0] ring-2 ring-[#1b5e20]/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className="font-bold text-xs text-[#2c2a29] block mb-1">
                          {theme.title}
                        </span>
                        <span className="text-[11px] text-slate-500 leading-tight block">
                          {theme.desc}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* 1. Unggah Foto Latar Belakang (Wallpaper) */}
                  <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ebd9c8] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#2c2a29]">
                        Unggah Foto Latar Belakang (Wallpaper Seluruh Layar)
                      </label>
                      {configDraft.customBackgroundImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfigDraft({
                              ...configDraft,
                              customBackgroundImageUrl: '',
                              backgroundTheme: 'floral-kraft',
                            })
                          }
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Hapus Foto Wallpaper
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="px-4 py-2.5 rounded-xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>Pilih Foto dari Galeri / Laptop</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileToBase64(e, (dataUrl) =>
                              setConfigDraft({
                                ...configDraft,
                                customBackgroundImageUrl: dataUrl,
                                backgroundTheme: 'custom-image',
                              })
                            )
                          }
                        />
                      </label>
                      <span className="text-xs text-slate-400">atau</span>
                      <input
                        type="url"
                        value={configDraft.customBackgroundImageUrl || ''}
                        onChange={(e) =>
                          setConfigDraft({
                            ...configDraft,
                            customBackgroundImageUrl: e.target.value,
                            backgroundTheme: e.target.value ? 'custom-image' : configDraft.backgroundTheme,
                          })
                        }
                        placeholder="Tempel URL gambar wallpaper..."
                        className="flex-1 min-w-[220px] p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20] bg-white"
                      />
                    </div>
                    {configDraft.customBackgroundImageUrl && (
                      <div className="flex items-center gap-3 pt-1">
                        <div
                          className="w-24 h-14 rounded-xl border border-slate-300 bg-cover bg-center shadow-xs"
                          style={{ backgroundImage: `url(${configDraft.customBackgroundImageUrl})` }}
                        />
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Foto wallpaper aktif
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="bgBlurCheck"
                        checked={configDraft.backgroundBlur}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, backgroundBlur: e.target.checked })
                        }
                        className="rounded text-[#1b5e20] focus:ring-[#1b5e20] cursor-pointer"
                      />
                      <label htmlFor="bgBlurCheck" className="text-xs text-slate-700 cursor-pointer font-medium">
                        Aktifkan efek blur halus pada wallpaper latar belakang agar teks tetap mudah dibaca
                      </label>
                    </div>
                  </div>

                  {/* 2. Unggah Foto Banner Stand */}
                  <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ebd9c8] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#c07a50]">
                        Unggah Foto / Banner Sambutan Stand (Hero Header)
                      </label>
                      {configDraft.customBannerImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfigDraft({ ...configDraft, customBannerImageUrl: '' })
                          }
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Hapus Foto Banner (Gunakan Gradasi Asli)
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Foto ini akan dijadikan latar belakang header banner sambutan di menu Buku Tamu & Registrasi.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="px-4 py-2.5 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>Pilih Banner dari File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileToBase64(e, (dataUrl) =>
                              setConfigDraft({ ...configDraft, customBannerImageUrl: dataUrl })
                            )
                          }
                        />
                      </label>
                      <span className="text-xs text-slate-400">atau</span>
                      <input
                        type="url"
                        value={configDraft.customBannerImageUrl || ''}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, customBannerImageUrl: e.target.value })
                        }
                        placeholder="Tempel URL foto banner..."
                        className="flex-1 min-w-[220px] p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20] bg-white"
                      />
                    </div>
                    {configDraft.customBannerImageUrl && (
                      <div className="flex items-center gap-3 pt-1">
                        <div
                          className="w-36 h-14 rounded-xl border border-slate-300 bg-cover bg-center shadow-xs"
                          style={{ backgroundImage: `url(${configDraft.customBannerImageUrl})` }}
                        />
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Banner stand aktif
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Pengaturan Semua Teks Pemberitahuan di Menu Tamu */}
                <div className="bg-white rounded-3xl p-6 border border-[#ebd9c8] shadow-xs space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-[#2c2a29] flex items-center gap-2 border-b border-[#ebd9c8] pb-3">
                    <Sparkles className="w-4 h-4 text-[#e67e22]" />
                    Atur Semua Pemberitahuan & Pesan di Menu Tamu
                  </h4>
                  <p className="text-xs text-slate-600">
                    Semua teks informasi, instruksi, dan sambutan yang dilihat pengunjung dapat Anda ubah secara bebas di bawah ini:
                  </p>

                  <div className="space-y-4">
                    {/* Judul & Subjudul Sambutan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Judul Utama Banner Stand
                        </label>
                        <input
                          type="text"
                          value={configDraft.heroTitle}
                          onChange={(e) =>
                            setConfigDraft({ ...configDraft, heroTitle: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20] font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Subjudul / Deskripsi Banner Stand
                        </label>
                        <input
                          type="text"
                          value={configDraft.heroSubtitle}
                          onChange={(e) =>
                            setConfigDraft({ ...configDraft, heroSubtitle: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                        />
                      </div>
                    </div>

                    {/* Pemberitahuan di Atas Form Buku Tamu */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teks Pemberitahuan di Atas Form Buku Tamu
                      </label>
                      <input
                        type="text"
                        value={configDraft.registrationNotice || ''}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, registrationNotice: e.target.value })
                        }
                        placeholder="Contoh: Buku Tamu Digital Stand — Dapatkan Nomor Urut Antrean Resmi [NOMOR] & sambutan audio spesial..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                      />
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Tips: Tuliskan <code>[NOMOR]</code> di tempat Anda ingin nomor antrean otomatis disisipkan.
                      </span>
                    </div>

                    {/* Pemberitahuan Sukses Registrasi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Pemberitahuan Berhasil Registrasi (Di Tiket Tamu)
                        </label>
                        <input
                          type="text"
                          value={configDraft.successNotice || ''}
                          onChange={(e) =>
                            setConfigDraft({ ...configDraft, successNotice: e.target.value })
                          }
                          placeholder="Registrasi Berhasil! Selamat Datang di Stand Kami"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Petunjuk / Instruksi Kartu Antrean
                        </label>
                        <input
                          type="text"
                          value={configDraft.queueInstruction || ''}
                          onChange={(e) =>
                            setConfigDraft({ ...configDraft, queueInstruction: e.target.value })
                          }
                          placeholder="Tunjukkan nomor ini saat berkonsultasi & memesan buket di meja booth"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                        />
                      </div>
                    </div>

                    {/* Pemberitahuan Catatan Form Bawah & Layar Kios */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Catatan di Bawah Tombol Registrasi
                        </label>
                        <input
                          type="text"
                          value={configDraft.footerNotice || ''}
                          onChange={(e) =>
                            setConfigDraft({ ...configDraft, footerNotice: e.target.value })
                          }
                          placeholder="🌸 Registrasi gratis. Setelah mendaftar, Layar Kios Stand otomatis ditampilkan."
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Pesan Sambutan di Layar Kios Stand (Kiosk TV)
                        </label>
                        <input
                          type="text"
                          value={configDraft.kioskWelcomeNotice || ''}
                          onChange={(e) =>
                            setConfigDraft({ ...configDraft, kioskWelcomeNotice: e.target.value })
                          }
                          placeholder="Selamat Datang Wisudawan & Keluarga di Booth Kami!"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                        />
                      </div>
                    </div>

                    {/* Lokasi & Jam Operasional Booth */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Lokasi Meja Stand Booth
                        </label>
                        <input
                          type="text"
                          value={configDraft.boothLocation}
                          onChange={(e) =>
                            setConfigDraft({ ...configDraft, boothLocation: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Jam Pelayanan Booth
                        </label>
                        <input
                          type="text"
                          value={configDraft.operationalHours}
                          onChange={(e) =>
                            setConfigDraft({ ...configDraft, operationalHours: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5: Info About Me */}
                <div className="bg-white rounded-3xl p-6 border border-[#ebd9c8] shadow-xs space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-[#2c2a29] flex items-center gap-2 border-b border-[#ebd9c8] pb-3">
                    <Users className="w-4 h-4 text-[#1a237e]" />
                    Halaman "About Me"
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Judul Bagian About Me
                      </label>
                      <input
                        type="text"
                        value={configDraft.aboutMeTitle}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, aboutMeTitle: e.target.value })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cerita & Filosofi Artisan / Florist
                      </label>
                      <textarea
                        rows={3}
                        value={configDraft.aboutMeStory}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, aboutMeStory: e.target.value })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Penanggung Jawab Stand
                        </label>
                        <input
                          type="text"
                          value={configDraft.aboutMeOwnerName}
                          onChange={(e) =>
                            setConfigDraft({ ...configDraft, aboutMeOwnerName: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Jabatan / Role
                        </label>
                        <input
                          type="text"
                          value={configDraft.aboutMeRole}
                          onChange={(e) =>
                            setConfigDraft({ ...configDraft, aboutMeRole: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit button bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-2xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Simpan Seluruh Pengaturan Stand
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: STANDALONE GITHUB PAGES EXPORT */}
          {/* ========================================================================= */}
          {activeTab === 'export' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebd9c8] shadow-xs space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b5e20]/10 text-[#1b5e20] text-xs font-bold uppercase tracking-wider">
                  <Download className="w-3.5 h-3.5" />
                  Siap Deploy Bebas Biaya Server
                </div>
                <h3 className="font-serif-brand text-2xl font-bold text-[#2c2a29]">
                  Ekspor File index.html Mandiri (GitHub Pages Ready)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Aplikasi ini dirancang 100% Client-Side menggunakan localStorage & IndexedDB. Anda dapat mengunduh seluruh aplikasi dalam satu file <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[#c07a50] font-bold">index.html</code> mandiri untuk langsung diunggah ke repositori GitHub Pages atau server hosting statis mana pun tanpa biaya server!
                </p>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-[#2c2a29]">Langkah Publikasi GitHub Pages:</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Klik tombol <strong>"Unduh File index.html Standalone"</strong> di bawah.</li>
                    <li>Buat repositori baru di GitHub (misalnya: <code>klovibe-unikma-stand</code>).</li>
                    <li>Unggah file tersebut sebagai <code>index.html</code> ke branch <code>main</code>.</li>
                    <li>Buka menu Settings &rarr; Pages &rarr; Source "Deploy from a branch".</li>
                    <li>Aplikasi Anda langsung aktif dapat diakses publik!</li>
                  </ol>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      const htmlContent = generateStandaloneGitHubPagesHtml(
                        guests,
                        products,
                        categories,
                        nextQueueNumber
                      );
                      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'index.html';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Unduh File index.html Standalone
                  </button>

                  <button
                    onClick={() => {
                      const htmlContent = generateStandaloneGitHubPagesHtml(
                        guests,
                        products,
                        categories,
                        nextQueueNumber
                      );
                      navigator.clipboard.writeText(htmlContent);
                      setCopiedExport(true);
                      setTimeout(() => setCopiedExport(false), 3000);
                    }}
                    className="px-5 py-3.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer transition-all"
                  >
                    {copiedExport ? 'Tersalin ke Clipboard!' : 'Salin Kode HTML'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: RESET GUESTS CONFIRMATION */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif-brand text-lg font-bold text-slate-900">
              Kosongkan Buku Tamu & Reset Antrean?
            </h3>
            <p className="text-xs text-slate-600">
              Tindakan ini akan menghapus semua riwayat pengunjung stand saat ini dan mereset nomor urut berikutnya kembali ke <strong>#001</strong>.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE ADMIN PASSWORD */}
      {showChangePwdModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#ebd9c8] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-brand text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#1a237e]" />
                Ganti Kata Sandi Admin
              </h3>
              <button
                onClick={() => setShowChangePwdModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Pastikan sandi ini hanya diketahui oleh pengelola stan resmi.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan sandi baru..."
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1a237e]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showNewPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi sandi baru..."
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1a237e]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showConfirmPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {pwdChangeMessage && (
                <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                  {pwdChangeMessage}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePwdModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1a237e] hover:bg-[#151c65] text-white text-xs font-bold cursor-pointer"
                >
                  Simpan Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#ebd9c8] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ebd9c8] pb-3">
              <h3 className="font-serif-brand text-lg font-bold text-slate-900">
                Tambah Buket Baru ke Katalog
              </h3>
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Buket / Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="Contoh: Buket Wisuda Mawar Terracotta UNIKMA"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20] bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={5000}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Foto Buket (Unggah File atau Tempel URL)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="px-3 py-1.5 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingImg ? 'Mengompres Foto...' : 'Pilih Foto dari Galeri / Laptop'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isProcessingImg}
                      className="hidden"
                      onChange={(e) => handleFileToBase64(e, (dataUrl) => setProdImageUrl(dataUrl))}
                    />
                  </label>
                  {prodImageUrl && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Foto siap disimpan
                    </span>
                  )}
                </div>
                {prodImageUrl && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 shadow-xs mb-2">
                    <img src={prodImageUrl} alt="Pratinjau Buket" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setProdImageUrl('')}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                      title="Hapus foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  placeholder="Atau tempel URL gambar (https://images.unsplash.com/...)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Foto otomatis dikompresi agar ringan, cepat, dan muat dalam penyimpanan. Kosongkan jika ingin memakai foto default.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Buket & Bahan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Jelaskan jenis bunga, pita, boneka wisuda, wrapping paper..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags / Label (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={prodTags}
                  onChange={(e) => setProdTags(e.target.value)}
                  placeholder="Contoh: Edisi UNIKMA, Best Seller, Boneka Wisuda"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Simpan Produk Buket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#ebd9c8] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ebd9c8] pb-3">
              <h3 className="font-serif-brand text-lg font-bold text-slate-900">
                Edit Buket Katalog
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Buket
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, title: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20] bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={5000}
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Foto Buket (Unggah File atau Tempel URL)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="px-3 py-1.5 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingImg ? 'Mengompres Foto...' : 'Ganti Foto dari File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isProcessingImg}
                      className="hidden"
                      onChange={(e) =>
                        handleFileToBase64(e, (dataUrl) =>
                          setEditingProduct({ ...editingProduct, imageUrl: dataUrl })
                        )
                      }
                    />
                  </label>
                  {editingProduct.imageUrl && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Foto aktif
                    </span>
                  )}
                </div>
                {editingProduct.imageUrl && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 shadow-xs mb-2">
                    <img
                      src={editingProduct.imageUrl}
                      alt="Pratinjau Buket"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                      title="Hapus foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={editingProduct.imageUrl}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                  }
                  placeholder="Atau tempel URL gambar..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Perbarui Buket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GUEST */}
      {editingGuest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#ebd9c8] space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebd9c8] pb-3">
              <h3 className="font-serif-brand text-lg font-bold text-slate-900">
                Edit Data Tamu #{String(editingGuest.queueNumber).padStart(3, '0')}
              </h3>
              <button
                onClick={() => setEditingGuest(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateGuest(editingGuest);
                onDataChanged();
                setEditingGuest(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Tamu
                </label>
                <input
                  type="text"
                  required
                  value={editingGuest.name}
                  onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={editingGuest.phone}
                  onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat / Instansi
                </label>
                <input
                  type="text"
                  required
                  value={editingGuest.addressInstansi}
                  onChange={(e) =>
                    setEditingGuest({ ...editingGuest, addressInstansi: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Penilaian Stand: {editingGuest.rating || 5} Bintang ({RATING_LABELS[editingGuest.rating || 5]})
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditingGuest({ ...editingGuest, rating: star })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        (editingGuest.rating || 5) === star
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {star}★ {RATING_LABELS[star]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kritik & Saran
                </label>
                <textarea
                  rows={2}
                  value={editingGuest.feedbackMessage}
                  onChange={(e) =>
                    setEditingGuest({ ...editingGuest, feedbackMessage: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#1b5e20]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1b5e20] hover:bg-[#144719] text-white text-xs font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
