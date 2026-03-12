'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBar } from '../components/StatusBar';
import { Popup } from '../components/Popup';
import { ListItem } from '../components/ListItem';
import { TEKNISYENLER, formatDateTR, type Servis, STORAGE_KEY, type Teknisyen } from '../lib/types';

export default function TeknisyenYonlendirmePage() {
  const router = useRouter();
  const [servis, setServis] = useState<Servis | null>(null);
  const [selectedTeknisyen, setSelectedTeknisyen] = useState<Teknisyen | null>(null);
  const [teknisyenPopupOpen, setTeknisyenPopupOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const currentServis = sessionStorage.getItem('current_servis');
    if (currentServis) {
      setServis(JSON.parse(currentServis));
    } else {
      router.push('/yeni-servis');
    }
  }, [router]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleYonlendir = () => {
    if (!selectedTeknisyen || !servis) {
      showToast('Lütfen teknisyen seçiniz');
      return;
    }

    const updatedServis: Servis = {
      ...servis,
      teknisyen: selectedTeknisyen,
      islemler: [
        ...servis.islemler,
        {
          id: `islem_${Date.now()}`,
          tarih: new Date().toISOString(),
          islemiYapan: 'Bayi Kullanıcı',
          islemAdi: 'Teknisyen Yönlendir',
          aciklama: `Teknisyen : ${selectedTeknisyen.ad}\nGidiş Tarihi : ${formatDateTR(new Date().toISOString())}`
        }
      ],
      updatedAt: new Date().toISOString(),
    };

    // LocalStorage güncelle
    const allServisler = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedList = allServisler.map((s: Servis) => 
      s.id === updatedServis.id ? updatedServis : s
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    sessionStorage.setItem('current_servis', JSON.stringify(updatedServis));

    showToast(`${selectedTeknisyen.ad} yönlendirildi`);
    
    setTimeout(() => {
      router.push('/servis-detay');
    }, 1000);
  };

  if (!servis) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <StatusBar title="Teknisyen Yönlendirme" onClose={() => router.push('/yeni-servis')} />

      <div className="p-4 space-y-4">
        {/* Müşteri ve Cihaz Özeti */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="bg-blue-50 px-4 py-3 border-b">
            <h2 className="font-semibold text-blue-800 text-sm">Servis Özeti #{servis.servisNo}</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Müşteri</p>
                <p className="font-medium text-gray-800">{servis.musteri.ad}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Telefon</p>
                <p className="font-medium text-gray-800">{servis.musteri.telefon1}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Cihaz</p>
                <p className="font-medium text-gray-800">{servis.cihaz.marka} {servis.cihaz.tur}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Model</p>
                <p className="font-medium text-gray-800">{servis.cihaz.model}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs mb-1">Adres</p>
                <p className="font-medium text-gray-800 text-xs">{servis.musteri.adres}, {servis.musteri.ilce}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs mb-1">Arıza</p>
                <p className="font-medium text-gray-800 text-xs text-red-600">{servis.cihaz.arıza}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teknisyen Seçimi */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-700 text-sm">Teknisyen Seçimi</h2>
          </div>
          <div className="p-4">
            <button
              onClick={() => setTeknisyenPopupOpen(true)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
            >
              <div>
                <span className={selectedTeknisyen ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                  {selectedTeknisyen ? selectedTeknisyen.ad : 'Teknisyen Seçiniz'}
                </span>
                {selectedTeknisyen?.telefon && (
                  <p className="text-xs text-gray-500 mt-1">{selectedTeknisyen.telefon}</p>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Müsait Zamanı */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-700 text-sm">Ziyaret Zamanı</h2>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {formatDateTR(servis.musteri.musaitOlmaZamani.tarih)}
                </p>
                <p className="text-sm text-gray-500">
                  {servis.musteri.musaitOlmaZamani.baslangic} - {servis.musteri.musaitOlmaZamani.bitis}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Yönlendir Butonu */}
        <button
          onClick={handleYonlendir}
          disabled={!selectedTeknisyen}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg mt-6"
        >
          Teknisyene Yönlendir
        </button>
      </div>

      {/* Teknisyen Popup */}
      <Popup isOpen={teknisyenPopupOpen} onClose={() => setTeknisyenPopupOpen(false)} title="Teknisyen Seçiniz" height="50%">
        <div className="divide-y divide-gray-600">
          {TEKNISYENLER.map((teknisyen) => (
            <button
              key={teknisyen.id}
              onClick={() => {
                setSelectedTeknisyen(teknisyen);
                setTeknisyenPopupOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-white ${
                selectedTeknisyen?.id === teknisyen.id ? 'bg-blue-600/30' : ''
              }`}
            >
              <p className="font-medium">{teknisyen.ad}</p>
              {teknisyen.telefon && <p className="text-xs text-gray-400 mt-1">{teknisyen.telefon}</p>}
            </button>
          ))}
        </div>
      </Popup>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 bg-green-600 text-white">
          {toast}
        </div>
      )}
    </div>
  );
}
