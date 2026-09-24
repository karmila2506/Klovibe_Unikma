import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  Send,
  Eye,
  X,
  Tag,
  Sparkles,
  Check,
  Heart,
  MessageCircle,
  MessageSquareHeart,
} from 'lucide-react';
import { Product, Category, StandConfig } from '../types';
import { formatRupiah } from '../utils/storage';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  config: StandConfig;
  onNavigateFeedback?: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  config,
  onNavigateFeedback,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  // Format WhatsApp number
  const cleanPhone = config.whatsappNumber.replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  // Filter products: category and query search
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleOrderWhatsApp = (product: Product) => {
    const text = `Halo Tim ${config.klovibeBrandName} x Stand ${config.unikmaBrandName}! 🌸\n\nSaya tertarik untuk memesan produk berikut:\n- *${product.title}*\n- Kategori: ${product.category}\n- Harga: ${formatRupiah(product.price)}\n\nMohon info ketersediaan stok atau estimasi pengerjaannya di stand booth. Terima kasih banyak!`;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleGeneralCustomRequest = () => {
    const text = `Halo Tim ${config.klovibeBrandName}! 🌸\n\nSaya ingin berkonsultasi mengenai request kustom buket wisuda (warna wrapping, kombinasi bunga/snack/uang) untuk wisudawan Universitas Komputama. Mohon arahannya. Terima kasih!`;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-6">
      {/* Search & Header Section */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-[#ebd9c8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#c07a50] tracking-wider uppercase">
                Katalog Produk Resmi Stand
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-medium text-[#4a5d4e]">
                Tersedia Ready Stock & Pre-Order Stand
              </span>
            </div>
            <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#2c2a29]">
              Koleksi Rangkaian Buket & Hadiah {config.klovibeBrandName}
            </h2>
            <p className="text-xs sm:text-sm text-[#4a5d4e] mt-1 max-w-2xl">
              Pilihan buket eksklusif bertema Wisuda {config.unikmaBrandName}, buket bunga mawar segar, snack lezat, buket uang estetik, hingga plakat akrilik berkesan.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari buket, mawar, snack..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#c07a50] focus:ring-2 focus:ring-[#c07a50]/20 bg-[#faf8f5]/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="mt-6 pt-5 border-t border-[#ebd9c8] flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1b5e20] text-white shadow-sm'
                : 'bg-[#faf8f5] hover:bg-slate-200 text-slate-700'
            }`}
          >
            Semua Buket ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#c07a50] text-white shadow-sm'
                  : 'bg-[#faf8f5] hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white/90 rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
          <p className="font-serif-brand text-lg font-bold text-slate-600">
            Tidak ada buket yang sesuai pencarian
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Coba ketik kata kunci lain atau pilih kategori Semua Buket.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden border border-[#ebd9c8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Product Image */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {product.isFeatured && (
                    <div className="absolute top-3 left-3 bg-[#1b5e20] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#e67e22]" />
                      Favorit Wisuda
                    </div>
                  )}
                  <button
                    onClick={() => setActiveModalProduct(product)}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
                    title="Lihat Detail Foto & Deskripsi"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Content */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {product.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-[#faf8f5] text-[#4a5d4e] px-2 py-0.5 rounded-md border border-[#ebd9c8]/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-serif-brand text-lg font-bold text-[#2c2a29] line-clamp-1 group-hover:text-[#c07a50] transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Price & Order Action */}
              <div className="p-5 pt-0 mt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Harga Stand
                  </span>
                  <span className="font-serif-brand text-lg font-bold text-[#c07a50]">
                    {formatRupiah(product.price)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveModalProduct(product)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Detail
                  </button>

                  <button
                    onClick={() => handleOrderWhatsApp(product)}
                    className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1fa851] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Pesan WA
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner CTA for Custom Bouquet Request & Feedback */}
      <div className="bg-gradient-to-r from-[#1b5e20] via-[#2d5231] to-[#1a237e] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-bold text-[#e67e22] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Custom Bouquet & Pesanan Khusus
          </span>
          <h3 className="font-serif-brand text-2xl font-bold">
            Punya Konsep Buket Impian Sendiri?
          </h3>
          <p className="text-xs sm:text-sm text-[#f4efe6]/80 max-w-xl">
            Konsultasikan langsung request warna wrapping khusus toga {config.unikmaBrandName}, nominal buket uang, buket boneka, atau kombinasi snack favorit ke florist kami via WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleGeneralCustomRequest}
            className="px-5 py-3 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs tracking-wide uppercase shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Chat Florist via WhatsApp
          </button>

          <button
            onClick={() => {
              if (onNavigateFeedback) {
                onNavigateFeedback();
              } else {
                const el = document.getElementById('kesan-tamu');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-4 py-3 rounded-xl border border-white/25 hover:bg-white/10 text-white font-semibold text-xs tracking-wide cursor-pointer transition-all flex items-center gap-1.5"
          >
            <MessageSquareHeart className="w-4 h-4" />
            Kesan & Pesan Tamu
          </button>
        </div>
      </div>

      {/* Product Detail Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#ebd9c8] flex flex-col max-h-[90vh]">
            <div className="relative aspect-16/9 bg-slate-100 shrink-0">
              <img
                src={activeModalProduct.imageUrl}
                alt={activeModalProduct.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c07a50] bg-[#f4efe6] px-3 py-1 rounded-full">
                  {activeModalProduct.category}
                </span>
                <span className="font-serif-brand text-2xl font-bold text-[#c07a50]">
                  {formatRupiah(activeModalProduct.price)}
                </span>
              </div>

              <h2 className="font-serif-brand text-xl font-bold text-[#2c2a29]">
                {activeModalProduct.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activeModalProduct.description}
              </p>

              <div className="bg-[#fcfbf9] rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-[#4a5d4e]">Spesifikasi & Keunggulan Produk:</div>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>Wrapping kertas premium anti-kusut & pita satin berkilau</li>
                  <li>Free Greeting Card Custom (Bisa kami cetakkan ucapan selamat wisuda)</li>
                  <li>Tersedia opsi boneka wisuda dengan selempang nama lulusan</li>
                  <li>Dibuat langsung dengan cinta oleh tim florist {config.klovibeBrandName}</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveModalProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    handleOrderWhatsApp(activeModalProduct);
                    setActiveModalProduct(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1fa851] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Pesan via WhatsApp Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
