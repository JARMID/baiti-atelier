import React, { useState } from 'react';
import type { TradeCategory } from '../../types/trades';
import { PaymentModal } from './PaymentModal';
import { useConfigStore } from '../../store/configStore';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  MessageCircle,
  CreditCard,
  PlusCircle,
  Tag,
  Clock,
  Layers,
  Axe,
  ShieldAlert,
  Palette,
} from 'lucide-react';
import { playTactileClick, playClampSound, playSwitchSound } from '../../utils/audioFeedback';

export interface CatalogProduct {
  id: string;
  title: string;
  trade: TradeCategory;
  workshopName: string;
  wilayaName: string;
  wilayaCode: string;
  phone: string;
  estimatedPriceDzd: number;
  leadTimeDays: string;
  rating: number;
  imageUrl: string;
  description: string;
  tags: string[];
}

let productCounter = 100;

const INITIAL_PRODUCTS: CatalogProduct[] = [
  {
    id: 'p1',
    title: 'Baie Coulissante 3 Rails Gamme 67 & Volet Motorisé',
    trade: 'aluminum',
    workshopName: 'Menuiserie Moderne Kouba',
    wilayaName: 'Alger',
    wilayaCode: '16',
    phone: '+213550123456',
    estimatedPriceDzd: 185000,
    leadTimeDays: '7 à 10 jours',
    rating: 4.9,
    imageUrl: '/branding/baiti_villa_panoramic.jpg',
    description: 'Profilé lourd thermolaqué gris anthracite RAL 7016, double vitrage isolant Stop-Sol 4/16/4, moteur tubulaire avec télécommande radio.',
    tags: ['Gamme 67', 'RPT', 'Stop-Sol', 'Coulissant'],
  },
  {
    id: 'p2',
    title: 'Cuisine Équipée Moderne MDF Hydrofuge & Chêne',
    trade: 'woodworking',
    workshopName: 'Atelier Djurdjura Agencement',
    wilayaName: 'Tizi Ouzou',
    wilayaCode: '15',
    phone: '+213662887766',
    estimatedPriceDzd: 420000,
    leadTimeDays: '15 à 20 jours',
    rating: 4.95,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    description: 'Caissons en MDF vert hydrofuge résistant à l\'eau, amortisseurs Blum soft-close, plan de travail stratifié haute pression noir marbré.',
    tags: ['MDF Hydrofuge', 'Blum Soft-Close', 'Sur-mesure', 'Cuisine'],
  },
  {
    id: 'p3',
    title: 'Portail Coulissant Forgé Thermolaqué Époxy',
    trade: 'metalwork',
    workshopName: 'Ferronnerie d\'Art El Bahia',
    wilayaName: 'Oran',
    wilayaCode: '31',
    phone: '+213661987654',
    estimatedPriceDzd: 240000,
    leadTimeDays: '10 à 14 jours',
    rating: 4.88,
    imageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80',
    description: 'Acier carré 16x16 mm forgé à chaud, traitement anticorrosion avec thermolaquage au four garanti 10 ans, rail de roulement inox.',
    tags: ['Acier 16x16', 'Thermolaqué', 'Motorisable', 'Portail'],
  },
  {
    id: 'p4',
    title: 'Rideaux Doubles Velours Déperlant & Voilage Organza',
    trade: 'tapestry',
    workshopName: 'Atelier Déco & Couture des Hauts Plateaux',
    wilayaName: 'Sétif',
    wilayaCode: '19',
    phone: '+213552345678',
    estimatedPriceDzd: 68000,
    leadTimeDays: '4 à 7 jours',
    rating: 4.85,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    description: 'Tissu velours antitache lavable en machine, taux de fronce 2.0x généreux, ruflette wave ondulée avec tringle argentée sur mesure.',
    tags: ['Velours Anti-tache', 'Ondulation Wave', 'Voilage', 'Salon'],
  },
  {
    id: 'p5',
    title: 'Fenêtre Oscillo-Battante Rupture Pont Thermique',
    trade: 'aluminum',
    workshopName: 'Cirta Profils & Façades',
    wilayaName: 'Constantine',
    wilayaCode: '25',
    phone: '+213770456789',
    estimatedPriceDzd: 52000,
    leadTimeDays: '5 à 8 jours',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=600&auto=format&fit=crop&q=80',
    description: 'Profilé Technal RPT 52mm avec barrette polyamide, étanchéité double joint EPDM, isolation phonique spéciale centre urbain.',
    tags: ['RPT 52', 'Oscillo-Battant', 'Isolation Phonique', 'Double Vitrage'],
  },
  {
    id: 'p6',
    title: 'Dressing Mural 4 Vantaux Miroir & Chêne Clair',
    trade: 'woodworking',
    workshopName: 'Mitidja Meubles & Bois',
    wilayaName: 'Blida',
    wilayaCode: '09',
    phone: '+213559456789',
    estimatedPriceDzd: 165000,
    leadTimeDays: '8 à 12 jours',
    rating: 4.89,
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80',
    description: 'Coulissement silencieux à suspension haute, amortisseurs de fin de course, penderies éclairées par LED intégrées.',
    tags: ['Dressing', 'Mélaminé Chêne', 'Coulissant', 'Chambre'],
  },
  {
    id: 'p7',
    title: 'Grille de Sécurité Fenêtre Barreaudage Volutes',
    trade: 'metalwork',
    workshopName: 'Atelier Aurès Métal',
    wilayaName: 'Batna',
    wilayaCode: '05',
    phone: '+213551345678',
    estimatedPriceDzd: 38000,
    leadTimeDays: '4 à 6 jours',
    rating: 4.82,
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?w=600&auto=format&fit=crop&q=80',
    description: 'Carré plein 14x14 mm avec volutes C forgées, scellement chimique haute résistance dans maçonnerie, peinture antirouille.',
    tags: ['Sécurité', 'Volutes', 'Carré 14', 'Fenêtre'],
  },
  {
    id: 'p8',
    title: 'Salon Marocain Moderne Seddari Velours & Mousse D30',
    trade: 'tapestry',
    workshopName: 'Tapisserie Royale Casbah',
    wilayaName: 'Alger',
    wilayaCode: '16',
    phone: '+213550123456',
    estimatedPriceDzd: 195000,
    leadTimeDays: '10 à 15 jours',
    rating: 4.92,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
    description: '4 banquettes de 2 mètres en bois rouge sculpté, matelas mousse orthopédique D30 haute résilience, coussins capitonnés assortis.',
    tags: ['Seddari', 'Mousse D30', 'Salon Marocain', 'Capitonné'],
  },
];

const FALLBACK_PRODUCT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23131722'/%3E%3Cpath d='M100 80h400v240H100z' fill='none' stroke='%23D4AF37' stroke-width='4'/%3E%3Cpath d='M300 80v240M100 200h400' stroke='%2338BDF8' stroke-width='2' stroke-dasharray='6 6'/%3E%3Ctext x='300' y='210' fill='%23FFFFFF' font-family='sans-serif' font-size='16' text-anchor='middle'%3EBaiti Atelier Alg%C3%A9rie%3C/text%3E%3C/svg%3E";

export const ProductsShowcase: React.FC = () => {
  const { language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [products, setProducts] = useState<CatalogProduct[]>(INITIAL_PRODUCTS);
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedProductForPayment, setSelectedProductForPayment] = useState<CatalogProduct | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newTrade, setNewTrade] = useState<TradeCategory>('aluminum');
  const [newWorkshop, setNewWorkshop] = useState('');
  const [newWilaya, setNewWilaya] = useState('Alger (16)');
  const [newPhone, setNewPhone] = useState('05 50 12 34 56');
  const [newPrice, setNewPrice] = useState(75000);
  const [newDescription, setNewDescription] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchTrade = selectedTrade === 'all' || p.trade === selectedTrade;
    const matchWilaya = selectedWilaya === 'all' || p.wilayaName.toLowerCase().includes(selectedWilaya.toLowerCase());
    const matchSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.workshopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTrade && matchWilaya && matchSearch;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    playClampSound();
    const created: CatalogProduct = {
      id: `p-${++productCounter}`,
      title: newTitle,
      trade: newTrade,
      workshopName: newWorkshop,
      wilayaName: newWilaya.split(' ')[0],
      wilayaCode: newWilaya.includes('(') ? newWilaya.split('(')[1].replace(')', '') : '16',
      phone: newPhone,
      estimatedPriceDzd: Number(newPrice),
      leadTimeDays: '7 à 12 jours',
      rating: 5.0,
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      description: newDescription,
      tags: [newTrade, 'Sur-mesure', 'Atelier'],
    };
    setProducts([created, ...products]);
    setIsUploadModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const tradeTabs = [
    {
      id: 'all',
      label: language === 'ar' ? 'جميع الحرف' : language === 'en' ? 'All Trades' : 'Tous les Métiers',
      icon: <Tag className="w-3.5 h-3.5" />,
    },
    {
      id: 'aluminum',
      label: language === 'ar' ? 'ألمنيوم و PVC' : language === 'en' ? 'Aluminum & PVC' : 'Aluminium & PVC',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'woodworking',
      label: language === 'ar' ? 'خشب ومطابخ' : language === 'en' ? 'Wood & Kitchens' : 'Bois & Cuisines',
      icon: <Axe className="w-3.5 h-3.5" />,
    },
    {
      id: 'metalwork',
      label: language === 'ar' ? 'حدادة فنية' : language === 'en' ? 'Metal & Gates' : 'Ferronnerie & Métal',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    {
      id: 'tapestry',
      label: language === 'ar' ? 'تنجيد وستائر' : language === 'en' ? 'Upholstery & Drapery' : 'Tapisserie & Rideaux',
      icon: <Palette className="w-3.5 h-3.5" />,
    },
  ];

  const sectionBadge =
    language === 'ar'
      ? 'دليل الإنجازات وأعمال الورشات'
      : language === 'en'
      ? 'Workshop Catalog & Custom Works'
      : 'Catalogue & Réalisations d’Ateliers';

  const sectionTitle =
    language === 'ar'
      ? 'منتجات وأعمال مصنوعة في الجزائر'
      : language === 'en'
      ? 'Custom Works Fabricated in Algeria'
      : 'Produits Façonnés en Algérie';

  const sectionDesc =
    language === 'ar'
      ? 'استعرض أعمالاً واقعية صُنعت بالطلب في ورشاتنا المعتمدة. احجز عربوناً موثقاً عبر بريدي موب أو بطاقة CIB، أو اتصل بالحرفي مباشرة.'
      : language === 'en'
      ? 'Explore real works made-to-order by verified artisans. Place a secure deposit via BaridiMob or CIB, or call the workshop directly.'
      : 'Explorez les ouvrages réels fabriqués sur mesure par nos artisans vérifiés. Commandez avec acompte sécurisé BaridiMob / CIB ou contactez directement l’atelier.';

  const publishBtnText =
    language === 'ar'
      ? 'نشر عمل ورشة جديد'
      : language === 'en'
      ? 'Post Workshop Work'
      : 'Publier un Ouvrage d’Atelier';

  const searchPlaceholder =
    language === 'ar'
      ? 'ابحث بالمنتج، المادة أو الكلمة المفتاحية (سحاب، مطبخ، دريسينغ، بوابة، صالون)...'
      : language === 'en'
      ? 'Search by product, material, keyword (e.g. sliding, dressing, gate, upholstery)...'
      : 'Rechercher par produit, matériau, mot-clé (ex: coulissant, dressing, portail, velours)...';

  const fromPriceText = language === 'ar' ? 'ابتداءً من:' : language === 'en' ? 'From:' : 'Dès :';
  const fabricationText = language === 'ar' ? 'مدة الإنجاز:' : language === 'en' ? 'Lead time:' : 'Fabrication :';
  const acompteBtnText = language === 'ar' ? 'حجز عربون' : language === 'en' ? 'Deposit' : 'Acompte';

  return (
    <section id="marketplace-products" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-2 ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-white/5 border-white/10 text-zinc-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span>{sectionBadge}</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {sectionTitle}
          </h2>
          <p
            className={`text-sm mt-1 max-w-2xl leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-zinc-400'
            }`}
          >
            {sectionDesc}
          </p>
        </div>

        {/* Post Product Button */}
        <button
          onClick={() => {
            playTactileClick();
            setIsUploadModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#D4AF37] hover:bg-[#C5A880] text-slate-950 font-bold text-xs transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{publishBtnText}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3">
        {/* Trade Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tradeTabs.map((t) => {
            const isSelected = selectedTrade === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  playTactileClick();
                  setSelectedTrade(t.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono transition-all shrink-0 cursor-pointer btn-press hover-lift ${
                  isSelected
                    ? 'bg-[#D4AF37] border-[#D4AF37] text-slate-950 font-bold shadow-md shadow-[#D4AF37]/25'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/8'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Wilaya row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search
              className={`w-4 h-4 absolute top-3 ${
                isRtl ? 'right-3.5' : 'left-3.5'
              } text-zinc-400`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              } py-2.5 rounded-2xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
              }`}
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedWilaya}
              onChange={(e) => {
                playSwitchSound();
                setSelectedWilaya(e.target.value);
              }}
              className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-mono cursor-pointer focus:outline-none focus:border-[#D4AF37] ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-[#12151C] border-white/10 text-zinc-200'
              }`}
            >
              <option value="all">
                {language === 'ar'
                  ? 'جميع الولايات (58 ولاية)'
                  : language === 'en'
                  ? 'All Wilayas (58 Wilayas)'
                  : 'Toutes les Wilayas (58 Wilayas)'}
              </option>
              <option value="Alger">16 - Alger (الجزائر)</option>
              <option value="Oran">31 - Oran (وهران)</option>
              <option value="Constantine">25 - Constantine (قسنطينة)</option>
              <option value="Sétif">19 - Sétif (سطيف)</option>
              <option value="Batna">05 - Batna (باتنة)</option>
              <option value="Blida">09 - Blida (البليدة)</option>
              <option value="Tizi Ouzou">15 - Tizi Ouzou (تيزي وزو)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className={`group rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between hover-lift spotlight-card ${
              isLight
                ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl'
                : 'bg-[#0F1420] border-white/10 hover:border-white/20 shadow-lg hover:shadow-2xl'
            }`}
          >
            <div>
              {/* Product Image */}
              <div className="relative h-44 overflow-hidden bg-black/40">
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className={`absolute inset-0 ${
                    isLight
                      ? 'bg-gradient-to-t from-white/80 via-transparent to-transparent'
                      : 'bg-gradient-to-t from-[#0F1420] via-transparent to-transparent'
                  }`}
                />

                {/* Wilaya Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  <span>
                    {p.wilayaName} ({p.wilayaCode})
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-400" />
                  <span>{p.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="truncate">{p.workshopName}</span>
                </div>

                <h3
                  className={`text-sm font-bold line-clamp-2 leading-snug ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {p.title}
                </h3>

                <p
                  className={`text-[11px] line-clamp-2 leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  {p.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-mono border ${
                        isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-600'
                          : 'bg-white/5 border-white/5 text-zinc-400'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer / Pricing & Actions */}
            <div
              className={`p-4 pt-2 border-t flex flex-col gap-3 ${
                isLight ? 'border-slate-100' : 'border-white/5'
              }`}
            >
              <div className="flex items-baseline justify-between font-mono">
                <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                  {fromPriceText}
                </span>
                <span className="text-base font-extrabold text-[#D4AF37]">
                  {p.estimatedPriceDzd.toLocaleString()} DZD
                </span>
              </div>

              <div
                className={`flex items-center gap-1.5 text-[10px] font-mono ${
                  isLight ? 'text-slate-500' : 'text-zinc-400'
                }`}
              >
                <Clock className="w-3 h-3 text-[#D4AF37]" />
                <span>
                  {fabricationText} {p.leadTimeDays}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    playClampSound();
                    setSelectedProductForPayment(p);
                  }}
                  className="py-2 px-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md btn-press hover-lift"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{acompteBtnText}</span>
                </button>

                <button
                  onClick={() => {
                    playClampSound();
                    const message =
                      language === 'ar'
                        ? `السلام عليكم ${p.workshopName}، أتصل بكم بخصوص "${p.title}" على منصة Baiti Atelier | بيتي. هل يمكن ضبط القياسات لمشروعي؟`
                        : language === 'en'
                        ? `Hello ${p.workshopName}, I am contacting you regarding "${p.title}" on Baiti Atelier | بيتي. Can we adjust dimensions for my site?`
                        : `Bonjour ${p.workshopName}, je vous contacte à propos de "${p.title}" vu sur Baiti Atelier | بيتي. Est-il possible d'ajuster les cotes pour mon chantier ?`;
                    const text = encodeURIComponent(message);
                    window.open(`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer btn-press hover-lift ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                      : 'bg-white/10 hover:bg-white/15 border-white/15 text-zinc-200'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Deposit Modal */}
      {selectedProductForPayment && (
        <PaymentModal
          isOpen={Boolean(selectedProductForPayment)}
          onClose={() => setSelectedProductForPayment(null)}
          productName={selectedProductForPayment.title}
          totalPriceDzd={selectedProductForPayment.estimatedPriceDzd}
          workshopName={selectedProductForPayment.workshopName}
          workshopPhone={selectedProductForPayment.phone}
        />
      )}

      {/* Upload Product Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            className={`relative w-full max-w-lg rounded-3xl p-6 border shadow-2xl ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-[#0D121D] border-white/15 text-white'
            }`}
          >
            <h3 className="text-xl font-bold mb-2">
              {publishBtnText}
            </h3>
            <p
              className={`text-xs mb-4 ${
                isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}
            >
              {language === 'ar'
                ? 'انشر أعمالك المنجزة لجذب زبائن جدد ومقاولين من ولايتك.'
                : language === 'en'
                ? 'Share custom bespoke works to attract local clients and developers.'
                : 'Partagez vos réalisations sur mesure pour attirer des clients particuliers et des promoteurs de votre wilaya.'}
            </p>

            <form onSubmit={handleCreateProduct} className="flex flex-col gap-3 text-xs">
              <div>
                <label className={`block mb-1 font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  {language === 'ar' ? 'عنوان الإنجاز' : language === 'en' ? 'Project Title' : 'Titre de la réalisation'}
                </label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex. Baie vitrée 4 vantaux avec rupture thermique"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    {language === 'ar' ? 'الحرفة / التخصص' : language === 'en' ? 'Craft Discipline' : 'Corps d’état / Métier'}
                  </label>
                  <select
                    value={newTrade}
                    onChange={(e) => setNewTrade(e.target.value as TradeCategory)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-[#12151C] border-white/10 text-white'
                    }`}
                  >
                    <option value="aluminum">Aluminium & PVC</option>
                    <option value="woodworking">Bois & Cuisines</option>
                    <option value="metalwork">Ferronnerie & Métal</option>
                    <option value="tapestry">Tapisserie & Rideaux</option>
                  </select>
                </div>

                <div>
                  <label className={`block mb-1 font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    {language === 'ar' ? 'السعر التقديري دج' : language === 'en' ? 'Price Estimate (DZD)' : 'Tarif indicatif en DZD'}
                  </label>
                  <input
                    required
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none focus:border-[#D4AF37] ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    {language === 'ar' ? 'اسم الورشة' : language === 'en' ? 'Workshop Name' : 'Nom de votre Atelier'}
                  </label>
                  <input
                    required
                    type="text"
                    value={newWorkshop}
                    onChange={(e) => setNewWorkshop(e.target.value)}
                    placeholder="ex. Atelier Menuiserie Blida"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    {language === 'ar' ? 'الولاية' : language === 'en' ? 'Wilaya' : 'Wilaya'}
                  </label>
                  <input
                    required
                    type="text"
                    value={newWilaya}
                    onChange={(e) => setNewWilaya(e.target.value)}
                    placeholder="ex. Blida (09)"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-1 font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  {language === 'ar' ? 'الهاتف / واتساب' : language === 'en' ? 'Phone / WhatsApp' : 'Téléphone Atelier / WhatsApp'}
                </label>
                <input
                  required
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="05 50 12 34 56"
                  className={`w-full px-3 py-2 rounded-xl border font-mono focus:outline-none focus:border-[#D4AF37] ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  {language === 'ar' ? 'الوصف والمواصفات التقنية' : language === 'en' ? 'Technical Specifications' : 'Description & Caractéristiques'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Profilés utilisés, type de vitrage, charnières, délai de fabrication..."
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#D4AF37] ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-slate-950 font-bold text-xs transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'تأكيد ونشر العمل' : language === 'en' ? 'Publish Work' : 'Publier l’Ouvrage au Catalogue'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setIsUploadModalOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                  }`}
                >
                  {language === 'ar' ? 'إلغاء' : language === 'en' ? 'Cancel' : 'Annuler'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
