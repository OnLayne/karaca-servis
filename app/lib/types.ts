// Tip tanımlamaları

export interface Musteri {
  id: string;
  ad: string;
  telefon1: string;
  telefon2?: string;
  il: string;
  ilce: string;
  adres: string;
  kimlikNo?: string;
  musteriTipi: 'Bireysel' | 'Kurumsal';
  musaitOlmaZamani: {
    tarih: string;
    baslangic: string;
    bitis: string;
  };
}

export interface Cihaz {
  marka: string;
  tur: string;
  model: string;
  arıza: string;
  seriNo?: string;
  garantiBitis?: string;
}

export interface Servis {
  id: string;
  servisNo: number;
  kayitTarihi: string;
  servisKaynagi: string;
  operator: string;
  musteri: Musteri;
  cihaz: Cihaz;
  operatorNotu: string;
  garantiSuresi: number;
  durum: 'Teknisyen Yönlendir' | 'Atölyede' | 'Bakım Yapıldı' | 'Fiyatta Anlaşılamadı' | 'Parça Atölyeye Alındı' | 'Tamamlandı';
  teknisyen?: Teknisyen;
  islemler: Islem[];
  paraHareketleri: ParaHareketi[];
  arizaTespiti?: string;
  yapilanIslemler?: string;
  kullanilanParca?: string;
  toplamTutar?: number;
  musteriImza?: string;
  teknisyenImza?: string;
  updatedAt: string;
}

export interface Teknisyen {
  id: string;
  ad: string;
  telefon?: string;
}

export interface Islem {
  id: string;
  tarih: string;
  islemiYapan: string;
  islemAdi: string;
  aciklama: string;
}

export interface ParaHareketi {
  id: string;
  tarih: string;
  tahsilEden: string;
  odemeSekli: string;
  odemeDurumu: string;
  tutar: number;
}

// Veriler
export const ILCELER = [
  'Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 
  'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar',
  'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes',
  'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'
];

export const CIHAZ_MARKALARI = [
  'Aeg', 'Airfel', 'Alarko', 'Altus', 'Arçelik', 'Ariston', 'Beko', 'Bosch', 
  'Buderus', 'Dakin', 'Demirdöküm', 'Electrolux', 'Ferroli', 'Hoover', 'Hotpoint',
  'LG', 'Profilo', 'Samsung', 'Siemens', 'Vestel', 'Whirlpool'
];

export const CIHAZ_TURLERI = [
  'Bulaşık Makinesi', 'Çamaşır Makinesi', 'Buzdolabı', 'Derin Dondurucu',
  'Fırın', 'Ocak', 'Aspiratör/Davlumbaz', 'Klima', 'Kombi', 'Termosifon',
  'Elektrikli Süpürge', 'Ütü', 'Mikrodalga Fırın', 'Set Üstü Ocak',
  'Ankastre Set', 'Su Arıtma Cihazı', 'Bulaşık Makinesi (Ankastre)'
];

export const GARANTI_SURELERI = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
];

export const TEKNISYENLER: Teknisyen[] = [
  { id: '1', ad: 'Can Karaca', telefon: '0533 123 4567' },
  { id: '2', ad: 'Melike Yaralı', telefon: '0532 234 5678' },
  { id: '3', ad: 'Burak Korkmaz', telefon: '0531 345 6789' },
  { id: '4', ad: 'Serkan Demir', telefon: '0530 456 7890' },
];

export const SERVIS_DURUMLARI = [
  'Teknisyen Yönlendir',
  'Atölyede',
  'Bakım Yapıldı',
  'Fiyatta Anlaşılamadı',
  'Parça Atölyeye Alındı',
  'Tamamlandı'
];

export const ODEME_SEKILLERI = ['Nakit', 'Kredi Kartı', 'Havale/EFT', 'Çek'];

// LocalStorage key
export const STORAGE_KEY = 'karaca_servisler';
export const SERVIS_NO_KEY = 'karaca_son_servis_no';

// Helper fonksiyonlar
export const generateServisNo = (): number => {
  const lastNo = localStorage.getItem(SERVIS_NO_KEY);
  const newNo = lastNo ? parseInt(lastNo) + 1 : 253000;
  localStorage.setItem(SERVIS_NO_KEY, newNo.toString());
  return newNo;
};

export const formatDateTR = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTimeTR = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleString('tr-TR', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const calculateGarantiBitis = (kayitTarihi: string, yil: number): string => {
  const d = new Date(kayitTarihi);
  d.setFullYear(d.getFullYear() + yil);
  return d.toISOString().split('T')[0];
};
