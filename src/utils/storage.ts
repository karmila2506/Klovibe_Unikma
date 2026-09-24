/**
 * Storage management for KLOVIBE GIFT x UNIKMA Stand
 * Uses localStorage for fast, zero-credential client-side persistence
 */

import { Guest, Product, Category, AudioSettings, StandConfig } from '../types';

const STORAGE_KEYS = {
  GUESTS: 'klovibe_guests_v1',
  NEXT_QUEUE_NUM: 'klovibe_next_queue_num_v1',
  PRODUCTS: 'klovibe_products_v1',
  CATEGORIES: 'klovibe_categories_v1',
  AUDIO_SETTINGS: 'klovibe_audio_settings_v1',
  ADMIN_PASSWORD: 'klovibe_admin_pwd_v1',
  VISITOR_SESSION_ID: 'klovibe_visitor_sid_v1',
  STAND_CONFIG: 'klovibe_stand_config_v2',
};

export const DEFAULT_STAND_CONFIG: StandConfig = {
  whatsappNumber: '083111701845',
  unikmaBrandName: 'Universitas Komputama (UNIKMA)',
  klovibeBrandName: 'KLOVIBE GIFT',
  tagline: 'Crafted Moments, Enduring Love',
  heroTitle: 'Rayakan Momen Wisuda & Kenangan Indah Bersama Kami',
  heroSubtitle:
    'Selamat datang di booth KLOVIBE GIFT x Universitas Komputama (UNIKMA). Silakan registrasi buku tamu untuk mendapatkan Nomor Urut Resmi dan sambutan audio hangat di stand kami.',
  boothLocation: 'Gedung Utama Kampus UNIKMA · Area Stand Expo & Bazar Wisuda',
  operationalHours: '08.00 - 17.00 WIB (Sesuai Rangkaian Acara Wisuda)',
  customUnikmaLogoUrl: '',
  customKlovibeLogoUrl: '',
  backgroundTheme: 'floral-kraft',
  customBackgroundImageUrl: '',
  customBannerImageUrl: '',
  backgroundBlur: false,
  aboutMeTitle: 'About Me — KLOVIBE GIFT',
  aboutMeStory:
    'KLOVIBE GIFT bermula dari ketulusan merangkai momen penuh cinta lewat buket handmade bernilai estetika tinggi. Dalam kolaborasi resmi bersama Universitas Komputama (UNIKMA), setiap helai bunga, pita oranye-hijau UNIKMA, dan kartu ucapan dirangkai dengan presisi dan kehangatan hati untuk mengapresiasi perjuangan wisudawan/wisudawati kebanggaan keluarga.',
  aboutMeOwnerName: 'Owner & Artisan Florist KLOVIBE',
  aboutMeRole: 'Founder & Florist Designer',
  aboutMePhotoUrl:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  registrationNotice:
    'Buku Tamu Digital Stand — Dapatkan Nomor Urut Antrean Resmi & sambutan audio spesial saat mendaftar di booth.',
  successNotice: 'Registrasi Berhasil! Selamat Datang di Stand Kami',
  queueInstruction: 'Tunjukkan nomor ini saat berkonsultasi & memesan buket di meja booth stand',
  footerNotice: '🌸 Registrasi gratis. Setelah mendaftar, Layar Kios Stand otomatis ditampilkan.',
  kioskWelcomeNotice: 'Selamat Datang Wisudawan & Keluarga di Booth Kami!',
};

// Initial Categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'wisuda-unikma', name: 'Buket Wisuda Spesial UNIKMA' },
  { id: 'bunga-segar', name: 'Bunga Segar & Artificial' },
  { id: 'buket-snack', name: 'Buket Snack & Cokelat' },
  { id: 'buket-uang', name: 'Buket Uang & Balon Estetik' },
  { id: 'gift-box', name: 'Gift Box, Hampers & Souvenir' },
  { id: 'akrilik-plakat', name: 'Plakat & Akrilik Wisuda' },
];

// Initial Products with high-fidelity imagery and realistic Indonesian bouquet designs
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-unikma-01',
    title: 'Buket Wisuda Exclusive UNIKMA Green & Gold',
    category: 'wisuda-unikma',
    price: 135000,
    description: 'Edisi Resmi Wisuda Universitas Komputama! Menampilkan mawar satin emerald premium, pita oranye emas UNIKMA, boneka wisuda toga mini dengan logo UNIKMA, serta kartu ucapan elegan bertuliskan "Congratulations Graduate".',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    tags: ['Edisi UNIKMA', 'Best Seller', 'Boneka Toga'],
    isFeatured: true,
    createdBy: 'admin',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-unikma-02',
    title: 'Buket Mawar Terracotta "Enduring Love"',
    category: 'bunga-segar',
    price: 95000,
    description: 'Signature KLOVIBE GIFT. Paduan 7 tangkai mawar beludru warna terracotta rose, daun eucalyptus sage green, dan wrapping paper korea beige rustic. Sangat harum dan tahan lama.',
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    tags: ['Signature KLOVIBE', 'Aesthetic', 'Rustic'],
    isFeatured: true,
    createdBy: 'admin',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-unikma-03',
    title: 'Buket Snack Beng-Beng & SilverQueen Royal',
    category: 'buket-snack',
    price: 75000,
    description: 'Favorit mahasiswa & pengunjung stand! Komposisi cokelat SilverQueen chunky bar, 8 pcs Beng-Beng max, permen lolipop, dirangkai dengan wrapping bernuansa sage green & beige.',
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    tags: ['Favorit Stand', 'Manis', 'Ready Stock'],
    isFeatured: false,
    createdBy: 'admin',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-unikma-04',
    title: 'Buket Uang Kipas Aesthetic "Tower of Fortune"',
    category: 'buket-uang',
    price: 150000,
    description: 'Buket uang asli / tiruan berbentuk kipas melingkar bertingkat dengan aksen balon transparan LED kelap-kelip dan bunga baby breath kering. (Jasa rangkai belum termasuk nominal isi uang tunai).',
    imageUrl: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=800&q=80',
    tags: ['Uang Kipas', 'LED Mewah', 'Custom Nominal'],
    isFeatured: true,
    createdBy: 'admin',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-unikma-05',
    title: 'Hampers Gift Box Kayu Estetik KLOVIBE',
    category: 'gift-box',
    price: 120000,
    description: 'Kotak hadiah kayu pinus berpita terracotta, berisi lilin aromaterapi lavender, buket mawar mini kering, notebook hard-cover UNIKMA, dan greeting card custom.',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    tags: ['Aromaterapi', 'Gift Box Kayu', 'Souvenir'],
    isFeatured: false,
    createdBy: 'admin',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-unikma-06',
    title: 'Plakat Akrilik Grafir Kaligrafi & Foto Wisuda',
    category: 'akrilik-plakat',
    price: 85000,
    description: 'Plakat akrilik bening tebal 5mm dengan stand kayu jati belanda berlampu LED warm white. Bisa custom foto wisudawan dan ucapan selamat dari sahabat/keluarga.',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    tags: ['Custom Foto', 'Lampu LED', 'Kenang-kenangan'],
    isFeatured: true,
    createdBy: 'admin',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
];

// Seed Guests
export const DEFAULT_GUESTS: Guest[] = [
  {
    id: 'guest-001',
    queueNumber: 1,
    name: 'Dr. H. Ahmad Fauzi, M.Kom',
    phone: '081234567890',
    addressInstansi: 'Dosen Teknik Informatika UNIKMA',
    feedbackMessage: 'Keren sekali booth KLOVIBE! Rangkaian buket warna hijau emas UNIKMA sangat pas untuk suvenir wisuda fakultas.',
    rating: 5,
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'guest-002',
    queueNumber: 2,
    name: 'Siti Nurhaliza',
    phone: '085712349876',
    addressInstansi: 'BEM Universitas Komputama',
    feedbackMessage: 'Sangat ramah pelayanannya, pesan buket snack langsung jadi cepat. Sukses terus KLOVIBE GIFT!',
    rating: 5,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'guest-003',
    queueNumber: 3,
    name: 'Bagus Pratama & Tim',
    phone: '087899881122',
    addressInstansi: 'Alumni UNIKMA Angkatan 2022',
    feedbackMessage: 'Desain buket mawar terracotta rustic-nya juara, cocok buat kado wisuda pacar.',
    rating: 5,
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  mode: 'tts',
  hasCustomRecording: false,
  ttsTemplate: 'Hai, selamat datang! 🌸 Anda adalah pengunjung ke-[NOMOR_URUT_TAMU] di Stand KLOVIBE Bouquet, Universitas Komputama.',
  pitch: 1.05,
  rate: 1.0,
};

// --- Storage Operations ---

export function getVisitorSessionId(): string {
  if (typeof window === 'undefined') return 'session-default';
  let sid = localStorage.getItem(STORAGE_KEYS.VISITOR_SESSION_ID);
  if (!sid) {
    sid = 'visitor_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.VISITOR_SESSION_ID, sid);
  }
  return sid;
}

export function getStoredGuests(): Guest[] {
  if (typeof window === 'undefined') return DEFAULT_GUESTS;
  const raw = localStorage.getItem(STORAGE_KEYS.GUESTS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(DEFAULT_GUESTS));
    return DEFAULT_GUESTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GUESTS;
  }
}

export function getNextQueueNumber(): number {
  if (typeof window === 'undefined') return 4;
  const raw = localStorage.getItem(STORAGE_KEYS.NEXT_QUEUE_NUM);
  if (!raw) {
    const guests = getStoredGuests();
    const maxNum = guests.reduce((max, g) => Math.max(max, g.queueNumber), 0);
    const next = maxNum + 1;
    localStorage.setItem(STORAGE_KEYS.NEXT_QUEUE_NUM, String(next));
    return next;
  }
  return parseInt(raw, 10) || 1;
}

export function addGuest(data: Omit<Guest, 'id' | 'queueNumber' | 'timestamp'>): Guest {
  const guests = getStoredGuests();
  const queueNum = getNextQueueNumber();
  const newGuest: Guest = {
    ...data,
    id: 'guest_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    queueNumber: queueNum,
    timestamp: new Date().toISOString(),
  };

  const updatedGuests = [newGuest, ...guests];
  localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(updatedGuests));
  localStorage.setItem(STORAGE_KEYS.NEXT_QUEUE_NUM, String(queueNum + 1));
  return newGuest;
}

export function updateGuest(guest: Guest): void {
  const guests = getStoredGuests();
  const idx = guests.findIndex((g) => g.id === guest.id);
  if (idx !== -1) {
    guests[idx] = guest;
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
  }
}

export function deleteGuest(id: string): void {
  const guests = getStoredGuests().filter((g) => g.id !== id);
  localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
}

export function resetAllGuestsAndQueue(): void {
  localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.NEXT_QUEUE_NUM, '1');
}

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS;
  const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function compressImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File bukan gambar valid'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG 0.8 for drastic size reduction from 5MB -> ~40KB
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function saveProduct(product: Product): boolean {
  try {
    const products = getStoredProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      products[idx] = product;
    } else {
      products.unshift(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return true;
  } catch (err) {
    console.error('Failed to save product to localStorage:', err);
    return false;
  }
}

export function deleteProduct(id: string): void {
  const products = getStoredProducts().filter((p) => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to delete product from localStorage:', err);
  }
}

export function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function getAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  const raw = localStorage.getItem(STORAGE_KEYS.AUDIO_SETTINGS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.AUDIO_SETTINGS, JSON.stringify(DEFAULT_AUDIO_SETTINGS));
    return DEFAULT_AUDIO_SETTINGS;
  }
  try {
    return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  localStorage.setItem(STORAGE_KEYS.AUDIO_SETTINGS, JSON.stringify(settings));
}

export function getStandConfig(): StandConfig {
  if (typeof window === 'undefined') return DEFAULT_STAND_CONFIG;
  const raw = localStorage.getItem(STORAGE_KEYS.STAND_CONFIG);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.STAND_CONFIG, JSON.stringify(DEFAULT_STAND_CONFIG));
    return DEFAULT_STAND_CONFIG;
  }
  try {
    const parsed: StandConfig = { ...DEFAULT_STAND_CONFIG, ...JSON.parse(raw) };
    // Automatically update to user's new phone number if old default was stored
    if (parsed.whatsappNumber === '085798203612') {
      parsed.whatsappNumber = '083111701845';
      localStorage.setItem(STORAGE_KEYS.STAND_CONFIG, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_STAND_CONFIG;
  }
}

export function saveStandConfig(config: StandConfig): void {
  localStorage.setItem(STORAGE_KEYS.STAND_CONFIG, JSON.stringify(config));
}

export function checkAdminPassword(password: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
  const activePassword = stored ? stored.trim() : 'klovibe2026';
  return password.trim() === activePassword;
}

export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword.trim());
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

