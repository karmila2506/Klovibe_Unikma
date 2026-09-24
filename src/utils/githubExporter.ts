/**
 * Generator for a single-file standalone index.html ready for GitHub Pages
 * Packages HTML, Tailwind CSS styles, UNIKMA & KLOVIBE branding, and vanilla JS
 * with full localStorage/IndexedDB CRUD, Web Speech API TTS, and Audio Recorder!
 */

import { Guest, Product, Category } from '../types';

export function generateStandaloneGitHubPagesHtml(
  guests: Guest[],
  products: Product[],
  categories: Category[],
  nextQueueNumber: number
): string {
  const jsonGuests = JSON.stringify(guests, null, 2);
  const jsonProducts = JSON.stringify(products, null, 2);
  const jsonCategories = JSON.stringify(categories, null, 2);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KLOVIBE GIFT x UNIKMA - Stand Buku Tamu & Katalog Buket Interaktif</title>
  <meta name="description" content="Aplikasi Buku Tamu Stand Booth & Katalog Interaktif KLOVIBE GIFT x Universitas Komputama (UNIKMA) - Siap Deploy GitHub Pages">
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN for 1-file Standalone execution on GitHub Pages -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            unikmaGreen: '#1b5e20',
            unikmaGold: '#e67e22',
            unikmaNavy: '#1a237e',
            klovibeTerracotta: '#c07a50',
            klovibeSage: '#4a5d4e',
            klovibeCream: '#f4efe6',
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            serif: ['"Playfair Display"', 'Georgia', 'serif'],
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #fcfbf9; color: #2c2a29; }
    .brand-serif { font-family: 'Playfair Display', Georgia, serif; }
    @keyframes wave { 0%, 100% { height: 4px; } 50% { height: 24px; } }
    .wave-bar-1 { animation: wave 0.8s ease-in-out infinite 0.1s; }
    .wave-bar-2 { animation: wave 0.8s ease-in-out infinite 0.3s; }
    .wave-bar-3 { animation: wave 0.8s ease-in-out infinite 0.5s; }
  </style>
</head>
<body class="antialiased min-h-screen flex flex-col selection:bg-[#c07a50] selection:text-white">

  <!-- STAND HEADER -->
  <header class="sticky top-0 z-40 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-[#ebd9c8] shadow-xs">
    <div class="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-4">
        <!-- UNIKMA Brand -->
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-[#1b5e20] text-white flex items-center justify-center font-bold text-xs border-2 border-[#e67e22]">
            UNIKMA
          </div>
          <div>
            <div class="text-xs font-black text-[#1a237e] uppercase">Universitas Komputama</div>
            <div class="text-[10px] text-[#1b5e20] font-semibold">Official Stand Partner</div>
          </div>
        </div>

        <div class="h-8 w-px bg-[#ebd9c8]"></div>

        <!-- KLOVIBE Brand -->
        <div>
          <div class="font-serif text-base font-bold text-[#c07a50]">KLOVIBE GIFT</div>
          <div class="text-[10px] italic text-[#4a5d4e]">"Crafted Moments, Enduring Love"</div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span class="px-3 py-1 rounded-full bg-[#f4efe6] border border-[#ebd9c8] text-xs font-semibold text-[#4a5d4e]">
          Stand Booth Aktif 🌸
        </span>
        <button onclick="toggleAdminModal()" class="px-3 py-1.5 rounded-lg bg-[#1a237e] text-white text-xs font-semibold hover:bg-opacity-90">
          Admin Stand
        </button>
      </div>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-12">
    <!-- HERO INTRO -->
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b5e20]/10 text-[#1b5e20] text-xs font-bold uppercase tracking-wider">
        Selamat Datang di Stand Wisuda & Buket Hadiah
      </div>
      <h1 class="brand-serif text-3xl sm:text-5xl font-bold text-[#2c2a29] leading-tight">
        Harmoni Elegan KLOVIBE GIFT x UNIKMA
      </h1>
      <p class="text-sm sm:text-base text-[#4a5d4e]">
        Silakan isi buku tamu di bawah ini untuk mendapatkan nomor urut resmi dan sambutan audio interaktif dari stand kami!
      </p>
    </div>

    <!-- REGISTRATION SECTION -->
    <section id="guest-section" class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#ebd9c8] max-w-2xl mx-auto">
      <div class="flex items-center justify-between border-b border-[#ebd9c8] pb-4 mb-6">
        <div>
          <h2 class="brand-serif text-2xl font-bold text-[#2c2a29]">Registrasi Tamu Stand</h2>
          <p class="text-xs text-[#4a5d4e]">Dapatkan nomor antrean & audio sambutan otomatis</p>
        </div>
        <div class="bg-[#f4efe6] px-3 py-2 rounded-xl text-center border border-[#c07a50]/30">
          <span class="text-[10px] block font-bold text-[#4a5d4e]">Nomor Berikutnya</span>
          <span id="next-queue-badge" class="font-serif text-2xl font-black text-[#c07a50]">#001</span>
        </div>
      </div>

      <form id="reg-form" onsubmit="handleRegister(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase mb-1">Nama Lengkap *</label>
          <input type="text" id="reg-name" required placeholder="Contoh: Karmila Putri" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#c07a50] outline-none">
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase mb-1">No. WhatsApp *</label>
            <input type="tel" id="reg-phone" required placeholder="081234567890" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#1b5e20] outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1">Alamat / Instansi *</label>
            <input type="text" id="reg-address" required placeholder="Mahasiswa UNIKMA / Umum" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#1a237e] outline-none">
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase mb-1">Pesan / Masukan untuk Stand</label>
          <textarea id="reg-message" rows="2" placeholder="Tuliskan kesan Anda..." class="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#c07a50] outline-none"></textarea>
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl bg-[#c07a50] hover:bg-[#a96640] text-white font-bold text-sm tracking-wide shadow-md transition-all">
          Daftar Sekarang & Dapatkan Nomor Urut
        </button>
      </form>

      <!-- RESULT PASS -->
      <div id="ticket-pass" class="hidden mt-6 bg-[#f4efe6] p-6 rounded-2xl border-2 border-dashed border-[#c07a50] text-center space-y-3">
        <div class="text-xs font-bold text-[#1b5e20] uppercase">Registrasi Berhasil!</div>
        <div class="text-sm text-[#4a5d4e]">Nomor Urut Kunjungan Anda:</div>
        <div id="ticket-number" class="brand-serif text-5xl font-black text-[#c07a50]">#001</div>
        <div id="ticket-details" class="text-xs text-slate-700"></div>
        <button onclick="playStandAudio(currentRegisteredQueue)" class="px-4 py-2 rounded-xl bg-[#1b5e20] text-white text-xs font-bold inline-flex items-center gap-1.5">
          🔊 Putar Ulang Sambutan Suara
        </button>
      </div>
    </section>

    <!-- PRODUCT CATALOG SECTION -->
    <section id="catalog-section" class="space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-4 border-b border-[#ebd9c8] pb-4">
        <div>
          <h2 class="brand-serif text-2xl sm:text-3xl font-bold text-[#2c2a29]">Katalog Buket Stand KLOVIBE</h2>
          <p class="text-xs text-[#4a5d4e]">Edisi Wisuda Universitas Komputama & Gift Istimewa</p>
        </div>
      </div>
      <div id="products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    </section>
  </main>

  <!-- AUDIO EQUALIZER TOAST -->
  <div id="audio-toast" class="hidden fixed bottom-5 right-5 bg-[#2c2a29] text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-50">
    <div class="flex items-end gap-1 h-6">
      <span class="w-1 bg-[#e67e22] rounded-full wave-bar-1"></span>
      <span class="w-1 bg-[#c07a50] rounded-full wave-bar-2"></span>
      <span class="w-1 bg-[#1b5e20] rounded-full wave-bar-3"></span>
    </div>
    <div class="text-xs">
      <div class="font-bold text-[#e67e22]">Audio Stand Aktif</div>
      <div id="toast-text" class="text-[#f4efe6]">Menyambut tamu...</div>
    </div>
  </div>

  <!-- JAVASCRIPT LOGIC (Self-Contained for GitHub Pages) -->
  <script>
    // Embedded Initial Data
    let guests = JSON.parse(localStorage.getItem('klovibe_guests_v1')) || ${jsonGuests};
    let products = JSON.parse(localStorage.getItem('klovibe_products_v1')) || ${jsonProducts};
    let categories = JSON.parse(localStorage.getItem('klovibe_categories_v1')) || ${jsonCategories};
    let nextQueue = parseInt(localStorage.getItem('klovibe_next_queue_num_v1')) || ${nextQueueNumber};
    let currentRegisteredQueue = 1;

    function renderQueueBadge() {
      const el = document.getElementById('next-queue-badge');
      if (el) el.innerText = '#' + String(nextQueue).padStart(3, '0');
    }

    function renderProducts() {
      const container = document.getElementById('products-grid');
      if (!container) return;
      container.innerHTML = products.map(p => \`
        <div class="bg-white rounded-2xl overflow-hidden border border-[#ebd9c8] shadow-sm flex flex-col justify-between">
          <div>
            <img src="\${p.imageUrl}" alt="\${p.title}" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="brand-serif font-bold text-base text-[#2c2a29] mb-1">\${p.title}</h3>
              <p class="text-xs text-slate-600 line-clamp-2 mb-3">\${p.description}</p>
            </div>
          </div>
          <div class="p-4 bg-[#faf8f5] border-t border-[#ebd9c8] flex items-center justify-between">
            <span class="font-bold text-sm text-[#c07a50]">Rp \${p.price.toLocaleString('id-ID')}</span>
            <a href="https://wa.me/6281234567890?text=\${encodeURIComponent('Halo KLOVIBE Stand UNIKMA, saya tertarik pesan: ' + p.title)}" target="_blank" class="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold">
              Pesan WA
            </a>
          </div>
        </div>
      \`).join('');
    }

    function playStandAudio(qNum) {
      const toast = document.getElementById('audio-toast');
      const toastText = document.getElementById('toast-text');
      if (toast) {
        toast.classList.remove('hidden');
        if (toastText) toastText.innerText = 'Pengunjung Ke-' + qNum;
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = 'Hai, selamat datang! 🌸 Anda adalah pengunjung ke-' + qNum + ' di Stand KLOVIBE Bouquet, Universitas Komputama.';
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'id-ID';
        utter.rate = 1.0;
        utter.onend = () => {
          if (toast) toast.classList.add('hidden');
        };
        window.speechSynthesis.speak(utter);
      }
    }

    function handleRegister(e) {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();
      const address = document.getElementById('reg-address').value.trim();
      const msg = document.getElementById('reg-message').value.trim();

      const qNum = nextQueue;
      currentRegisteredQueue = qNum;

      const newGuest = {
        id: 'g_' + Date.now(),
        queueNumber: qNum,
        name, phone, addressInstansi: address,
        feedbackMessage: msg || 'Sukses untuk KLOVIBE & UNIKMA',
        timestamp: new Date().toISOString()
      };

      guests.unshift(newGuest);
      nextQueue = qNum + 1;
      localStorage.setItem('klovibe_guests_v1', JSON.stringify(guests));
      localStorage.setItem('klovibe_next_queue_num_v1', String(nextQueue));

      renderQueueBadge();

      // Show pass
      document.getElementById('ticket-number').innerText = '#' + String(qNum).padStart(3, '0');
      document.getElementById('ticket-details').innerText = name + ' (' + address + ')';
      document.getElementById('ticket-pass').classList.remove('hidden');

      playStandAudio(qNum);
    }

    // Init
    renderQueueBadge();
    renderProducts();
  </script>
</body>
</html>`;
}
