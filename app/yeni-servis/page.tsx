'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { StatusBar } from '../components/StatusBar';
import { Popup } from '../components/Popup';
import { ListItem } from '../components/ListItem';
import { 
  ILCELER, 
  CIHAZ_MARKALARI, 
  CIHAZ_TURLERI, 
  GARANTI_SURELERI,
  generateServisNo,
  formatDateTR,
  calculateGarantiBitis,
  STORAGE_KEY,
  type Servis
} from '../lib/types';

const formSchema = z.object({
  musteriTipi: z.enum(['Bireysel', 'Kurumsal']),
  musteriAdi: z.string().min(2, 'Müşteri adı en az 2 karakter olmalı'),
  telefon1: z.string().min(10, 'Geçerli telefon numarası girin'),
  telefon2: z.string().optional(),
  il: z.string().default('İzmir'),
  ilce: z.string().min(1, 'İlçe seçiniz'),
  adres: z.string().min(5, 'Adres en az 5 karakter olmalı'),
  kimlikNo: z.string().optional(),
  musaitTarih: z.string(),
  musaitBaslangic: z.string(),
  musaitBitis: z.string(),
  cihazMarka: z.string().min(1, 'Marka seçiniz'),
  cihazTuru: z.string().min(1, 'Cihaz türü seçiniz'),
  cihazModeli: z.string().min(1, 'Model giriniz'),
  cihazArizasi: z.string().min(3, 'Arıza açıklaması giriniz'),
  operatorNotu: z.string().optional(),
  garantiSuresi: z.number().min(1),
});

type FormData = z.infer<typeof formSchema>;

export default function YeniServisPage() {
  const router = useRouter();
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime] = useState(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
  
  // Popup states
  const [ilcePopupOpen, setIlcePopupOpen] = useState(false);
  const [baslangicPopupOpen, setBaslangicPopupOpen] = useState(false);
  const [bitisPopupOpen, setBitisPopupOpen] = useState(false);
  const [markaPopupOpen, setMarkaPopupOpen] = useState(false);
  const [turPopupOpen, setTurPopupOpen] = useState(false);
  const [garantiPopupOpen, setGarantiPopupOpen] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      musteriTipi: 'Bireysel',
      il: 'İzmir',
      musaitTarih: currentDate,
      musaitBaslangic: '09:00',
      musaitBitis: '18:00',
      garantiSuresi: 1,
    }
  });

  const watchedValues = watch();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = (data: FormData) => {
    const servisNo = generateServisNo();
    const kayitTarihi = new Date().toISOString();
    
    const yeniServis: Servis = {
      id: `servis_${Date.now()}`,
      servisNo,
      kayitTarihi,
      servisKaynagi: '0531 565 0635',
      operator: 'Bayi Kullanıcı',
      musteri: {
        id: `musteri_${Date.now()}`,
        ad: data.musteriAdi,
        telefon1: data.telefon1,
        telefon2: data.telefon2 || '',
        il: data.il,
        ilce: data.ilce,
        adres: data.adres,
        kimlikNo: data.kimlikNo || '',
        musteriTipi: data.musteriTipi,
        musaitOlmaZamani: {
          tarih: data.musaitTarih,
          baslangic: data.musaitBaslangic,
          bitis: data.musaitBitis,
        }
      },
      cihaz: {
        marka: data.cihazMarka,
        tur: data.cihazTuru,
        model: data.cihazModeli,
        arıza: data.cihazArizasi,
        garantiBitis: calculateGarantiBitis(kayitTarihi, data.garantiSuresi),
      },
      operatorNotu: data.operatorNotu || '',
      garantiSuresi: data.garantiSuresi,
      durum: 'Teknisyen Yönlendir',
      islemler: [{
        id: `islem_${Date.now()}`,
        tarih: kayitTarihi,
        islemiYapan: 'Bayi Kullanıcı',
        islemAdi: 'Teknisyen Yönlendir',
        aciklama: `Teknisyen : Henüz atanmadı\nGidiş Tarihi : ${formatDateTR(data.musaitTarih)}`
      }],
      paraHareketleri: [],
      updatedAt: kayitTarihi,
    };

    // LocalStorage'a kaydet
    const existingServisler = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existingServisler, yeniServis]));
    
    // Yeni servisi session storage'a geçici olarak kaydet (teknisyen yönlendirme için)
    sessionStorage.setItem('current_servis', JSON.stringify(yeniServis));
    
    showToast(`Servis #${servisNo} oluşturuldu`);
    
    setTimeout(() => {
      router.push('/teknisyen-yonlendir');
    }, 1000);
  };

  const saatler = Array.from({ length: 24 }, (_, i) => {
    const saat = i.toString().padStart(2, '0');
    return [`${saat}:00`, `${saat}:30`];
  }).flat();

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Status Bar */}
      <StatusBar 
        title="Yeni Servis" 
        onClose={() => router.push('/')}
      />

      {/* Tarih ve Saat - Servis Kaynağı */}
      <div className="bg-white p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Tarih :</span>
          <span className="text-sm text-gray-600">{formatDateTR(currentDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{currentTime}</span>
        </div>
      </div>
      
      <div className="bg-white px-3 py-2 border-b flex items-center justify-end">
        <span className="text-xs text-gray-500 mr-2">Servis Kaynağı :</span>
        <span className="text-sm font-medium text-blue-600">0531 565 0635</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Müşteri Bilgisi Section */}
        <div className="bg-white mx-2 mt-2 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-100 px-3 py-2 border-b">
            <h2 className="font-semibold text-gray-700 text-sm">Müşteri Bilgisi</h2>
          </div>
          
          <div className="p-3 space-y-3">
            {/* Müşteri Tipi */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Müşteri Tipi</label>
              <select 
                {...register('musteriTipi')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bireysel">Bireysel</option>
                <option value="Kurumsal">Kurumsal</option>
              </select>
            </div>

            {/* Müşteri Adı */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Müşteri Adı</label>
              <input 
                {...register('musteriAdi')}
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Müşteri adı"
              />
              {errors.musteriAdi && (
                <span className="text-xs text-red-500 mt-1">{errors.musteriAdi.message}</span>
              )}
            </div>

            {/* Telefonlar */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">Telefon 1</label>
                <input 
                  {...register('telefon1')}
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0(5XX) XXX XXXX"
                />
                {errors.telefon1 && (
                  <span className="text-xs text-red-500 mt-1">{errors.telefon1.message}</span>
                )}
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">Telefon 2</label>
                <input 
                  {...register('telefon2')}
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0(5XX) XXX XXXX"
                />
              </div>
            </div>

            {/* İl ve İlçe */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">İl</label>
                <div className="relative">
                  <select 
                    {...register('il')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="İzmir">İzmir</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">İlçe</label>
                <button
                  type="button"
                  onClick={() => setIlcePopupOpen(true)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {watchedValues.ilce || 'İlçe Seçiniz'}
                </button>
                {errors.ilce && (
                  <span className="text-xs text-red-500 mt-1">{errors.ilce.message}</span>
                )}
              </div>
            </div>

            {/* Adres */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Adres</label>
              <textarea 
                {...register('adres')}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Adres"
              />
              {errors.adres && (
                <span className="text-xs text-red-500 mt-1">{errors.adres.message}</span>
              )}
            </div>

            {/* Kimlik No */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Kimlik No</label>
              <input 
                {...register('kimlikNo')}
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="TCKN / Vergi No"
              />
            </div>

            {/* Müşteri Müsait Olma Zamanı */}
            <div>
              <label className="text-xs text-gray-600 block mb-1 font-medium">Müşteri Müsait Olma Zamanı :</label>
              <div className="flex gap-2 mt-1">
                <input 
                  {...register('musaitTarih')}
                  type="date"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setBaslangicPopupOpen(true)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {watchedValues.musaitBaslangic || '09:00'}
                </button>
                <button
                  type="button"
                  onClick={() => setBitisPopupOpen(true)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {watchedValues.musaitBitis || '18:00'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cihaz Bilgisi Section */}
        <div className="bg-white mx-2 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-100 px-3 py-2 border-b">
            <h2 className="font-semibold text-gray-700 text-sm">Cihaz Bilgisi</h2>
          </div>
          
          <div className="p-3 space-y-3">
            {/* Cihaz Markası */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Cihaz Markası</label>
              <button
                type="button"
                onClick={() => setMarkaPopupOpen(true)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
              >
                <span>{watchedValues.cihazMarka || 'Seçiniz'}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {errors.cihazMarka && (
                <span className="text-xs text-red-500 mt-1">{errors.cihazMarka.message}</span>
              )}
            </div>

            {/* Cihaz Türü */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Cihaz Türü</label>
              <button
                type="button"
                onClick={() => setTurPopupOpen(true)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
              >
                <span>{watchedValues.cihazTuru || 'Seçiniz'}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {errors.cihazTuru && (
                <span className="text-xs text-red-500 mt-1">{errors.cihazTuru.message}</span>
              )}
            </div>

            {/* Cihaz Modeli */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Cihaz Modeli</label>
              <input 
                {...register('cihazModeli')}
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Model"
              />
              {errors.cihazModeli && (
                <span className="text-xs text-red-500 mt-1">{errors.cihazModeli.message}</span>
              )}
            </div>

            {/* Cihaz Arızası */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Cihaz Arızası</label>
              <input 
                {...register('cihazArizasi')}
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Arıza açıklaması"
              />
              {errors.cihazArizasi && (
                <span className="text-xs text-red-500 mt-1">{errors.cihazArizasi.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Operatör Notu */}
        <div className="bg-white mx-2 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-100 px-3 py-2 border-b">
            <h2 className="font-semibold text-gray-700 text-sm">Operatör Notu</h2>
          </div>
          <div className="p-3">
            <input 
              {...register('operatorNotu')}
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Not"
            />
          </div>
        </div>

        {/* Garanti Süresi */}
        <div className="bg-white mx-2 rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 flex items-center gap-3">
            <label className="text-sm text-gray-600 flex-1">Servis Sonrası Sizin Vereceğiniz Garanti</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGarantiPopupOpen(true)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <span>{watchedValues.garantiSuresi}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-600">Yıl</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Kaydet
          </button>
        </div>
      </form>

      {/* Popups */}
      <Popup isOpen={ilcePopupOpen} onClose={() => setIlcePopupOpen(false)} title="İlçe Seçiniz" height="60%">
        <div className="divide-y divide-gray-600">
          {ILCELER.map((ilce) => (
            <ListItem
              key={ilce}
              label={ilce}
              isSelected={watchedValues.ilce === ilce}
              onClick={() => {
                setValue('ilce', ilce);
                setIlcePopupOpen(false);
              }}
            />
          ))}
        </div>
      </Popup>

      <Popup isOpen={baslangicPopupOpen} onClose={() => setBaslangicPopupOpen(false)} title="Başlangıç Saati" height="50%">
        <div className="divide-y divide-gray-600">
          {saatler.map((saat) => (
            <ListItem
              key={saat}
              label={saat}
              isSelected={watchedValues.musaitBaslangic === saat}
              onClick={() => {
                setValue('musaitBaslangic', saat);
                setBaslangicPopupOpen(false);
              }}
            />
          ))}
        </div>
      </Popup>

      <Popup isOpen={bitisPopupOpen} onClose={() => setBitisPopupOpen(false)} title="Bitiş Saati" height="50%">
        <div className="divide-y divide-gray-600">
          {saatler.map((saat) => (
            <ListItem
              key={saat}
              label={saat}
              isSelected={watchedValues.musaitBitis === saat}
              onClick={() => {
                setValue('musaitBitis', saat);
                setBitisPopupOpen(false);
              }}
            />
          ))}
        </div>
      </Popup>

      <Popup isOpen={markaPopupOpen} onClose={() => setMarkaPopupOpen(false)} title="Marka Seçiniz" height="60%">
        <div className="divide-y divide-gray-600">
          {CIHAZ_MARKALARI.map((marka) => (
            <ListItem
              key={marka}
              label={marka}
              isSelected={watchedValues.cihazMarka === marka}
              onClick={() => {
                setValue('cihazMarka', marka);
                setMarkaPopupOpen(false);
              }}
            />
          ))}
        </div>
      </Popup>

      <Popup isOpen={turPopupOpen} onClose={() => setTurPopupOpen(false)} title="Cihaz Türü Seçiniz" height="60%">
        <div className="divide-y divide-gray-600">
          {CIHAZ_TURLERI.map((tur) => (
            <ListItem
              key={tur}
              label={tur}
              isSelected={watchedValues.cihazTuru === tur}
              onClick={() => {
                setValue('cihazTuru', tur);
                setTurPopupOpen(false);
              }}
            />
          ))}
        </div>
      </Popup>

      <Popup isOpen={garantiPopupOpen} onClose={() => setGarantiPopupOpen(false)} title="Garanti Süresi" height="40%">
        <div className="divide-y divide-gray-600">
          {GARANTI_SURELERI.map((garanti) => (
            <ListItem
              key={garanti.value}
              label={garanti.label}
              isSelected={watchedValues.garantiSuresi === garanti.value}
              onClick={() => {
                setValue('garantiSuresi', garanti.value);
                setGarantiPopupOpen(false);
              }}
            />
          ))}
        </div>
      </Popup>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
