'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StatusBar } from '../components/StatusBar';
import { Popup } from '../components/Popup';
import { ListItem } from '../components/ListItem';
import { 
  formatDateTR, 
  formatDateTimeTR, 
  type Servis, 
  STORAGE_KEY,
  SERVIS_DURUMLARI,
  ODEME_SEKILLERI,
  TEKNISYENLER,
  type ParaHareketi,
  type Islem
} from '../lib/types';

export default function ServisDetayPage() {
  const router = useRouter();
  const [servis, setServis] = useState<Servis | null>(null);
  const [durumPopupOpen, setDurumPopupOpen] = useState(false);
  const [odemePopupOpen, setOdemePopupOpen] = useState(false);
  const [imzaPopupOpen, setImzaPopupOpen] = useState(false);
  const [imzaTipi, setImzaTipi] = useState<'musteri' | 'teknisyen'>('musteri');
  const [toast, setToast] = useState<string | null>(null);
  
  // Form states
  const [arizaTespiti, setArizaTespiti] = useState('');
  const [yapilanIslemler, setYapilanIslemler] = useState('');
  const [kullanilanParca, setKullanilanParca] = useState('');
  const [toplamTutar, setToplamTutar] = useState('');
  const [odemeSekli, setOdemeSekli] = useState('Nakit');
  const [odemeTutar, setOdemeTutar] = useState('');
  
  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const currentServis = sessionStorage.getItem('current_servis');
    if (currentServis) {
      const parsed = JSON.parse(currentServis);
      setServis(parsed);
      setArizaTespiti(parsed.arizaTespiti || '');
      setYapilanIslemler(parsed.yapilanIslemler || '');
      setKullanilanParca(parsed.kullanilanParca || '');
      setToplamTutar(parsed.toplamTutar?.toString() || '');
    } else {
      router.push('/yeni-servis');
    }
  }, [router]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const updateServis = (updates: Partial<Servis>) => {
    if (!servis) return;
    
    const updatedServis = { 
      ...servis, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    setServis(updatedServis);
    
    // LocalStorage güncelle
    const allServisler = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedList = allServisler.map((s: Servis) => 
      s.id === updatedServis.id ? updatedServis : s
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    sessionStorage.setItem('current_servis', JSON.stringify(updatedServis));
  };

  const handleDurumDegistir = (yeniDurum: string) => {
    const yeniIslem: Islem = {
      id: `islem_${Date.now()}`,
      tarih: new Date().toISOString(),
      islemiYapan: servis?.teknisyen?.ad || 'Sistem',
      islemAdi: yeniDurum,
      aciklama: `Durum değiştirildi: ${yeniDurum}`
    };
    
    updateServis({ 
      durum: yeniDurum as Servis['durum'],
      islemler: [...(servis?.islemler || []), yeniIslem]
    });
    setDurumPopupOpen(false);
    showToast(`Durum: ${yeniDurum}`);
  };

  const handleParaEkle = () => {
    if (!odemeTutar || parseFloat(odemeTutar) <= 0) {
      showToast('Geçerli tutar giriniz');
      return;
    }
    
    const yeniHareket: ParaHareketi = {
      id: `para_${Date.now()}`,
      tarih: new Date().toISOString(),
      tahsilEden: servis?.teknisyen?.ad || 'Teknisyen',
      odemeSekli: odemeSekli,
      odemeDurumu: 'Tamamlandı',
      tutar: parseFloat(odemeTutar)
    };
    
    updateServis({
      paraHareketleri: [...(servis?.paraHareketleri || []), yeniHareket]
    });
    setOdemePopupOpen(false);
    setOdemeTutar('');
    showToast('Ödeme eklendi');
  };

  const handleGuncelle = () => {
    updateServis({
      arizaTespiti,
      yapilanIslemler,
      kullanilanParca,
      toplamTutar: parseFloat(toplamTutar) || 0
    });
    showToast('Servis güncellendi');
  };

  const generatePDF = async () => {
    if (!servis) return;
    
    const element = document.getElementById('servis-formu-pdf');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`KARACA-Servis-${servis.servisNo}.pdf`);
      
      showToast('PDF indirildi');
    } catch (error) {
      showToast('PDF oluşturulamadı');
    }
  };

  const whatsappPDF = async () => {
    if (!servis) return;
    
    const element = document.getElementById('servis-formu-pdf');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const message = `KARACA Servis Formu - #${servis.servisNo}\nMüşteri: ${servis.musteri.ad}\nCihaz: ${servis.cihaz.marka} ${servis.cihaz.tur}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      showToast('WhatsApp paylaşımı başarısız');
    }
  };

  // Canvas imza fonksiyonları
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveImza = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imzaData = canvas.toDataURL('image/png');
    
    if (imzaTipi === 'musteri') {
      updateServis({ musteriImza: imzaData });
    } else {
      updateServis({ teknisyenImza: imzaData });
    }
    
    setImzaPopupOpen(false);
    showToast(`${imzaTipi === 'musteri' ? 'Müşteri' : 'Teknisyen'} imzası kaydedildi`);
  };

  const whatsappImza = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imzaData = canvas.toDataURL('image/png');
    
    if (imzaTipi === 'musteri') {
      updateServis({ musteriImza: imzaData });
    } else {
      updateServis({ teknisyenImza: imzaData });
    }
    
    // WhatsApp'a yönlendir
    const message = `KARACA Servis - İmza gerekiyor\nServis No: ${servis?.servisNo}\nLütfen imzalayın: [imza linki]`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    setImzaPopupOpen(false);
  };

  if (!servis) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const toplamOdeme = servis.paraHareketleri.reduce((acc, h) => acc + h.tutar, 0);
  const kalanGun = servis.cihaz.garantiBitis 
    ? Math.ceil((new Date(servis.cihaz.garantiBitis).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <StatusBar title={`SERVİS DETAY (${servis.servisNo})`} onClose={() => router.push('/yeni-servis')} />

      {/* Info Bar */}
      <div className="bg-white px-3 py-2 border-b flex justify-between items-center text-xs">
        <div>
          <span className="text-gray-500">Kayıt Tarihi: </span>
          <span className="font-medium">{formatDateTR(servis.kayitTarihi)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Servis Kaynağı: </span>
          <span className="font-medium">{servis.servisKaynagi}</span>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Müşteri ve Cihaz Bilgisi */}
        <div className="grid grid-cols-2 gap-3">
          {/* Müşteri Bilgisi */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h3 className="font-semibold text-gray-700 text-xs mb-2 pb-1 border-b">MÜŞTERİ BİLGİSİ</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Ad</span>
                <span className="font-medium">{servis.musteri.ad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Telefon</span>
                <span className="font-medium">{servis.musteri.telefon1}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Adres</span>
                <span className="font-medium text-[10px] leading-tight">{servis.musteri.adres}, {servis.musteri.ilce}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Müsait Zaman</span>
                <span className="font-medium">{formatDateTR(servis.musteri.musaitOlmaZamani.tarih)} {servis.musteri.musaitOlmaZamani.baslangic}</span>
              </div>
            </div>
          </div>

          {/* Cihaz Bilgisi */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h3 className="font-semibold text-gray-700 text-xs mb-2 pb-1 border-b">CİHAZ BİLGİSİ</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Cihaz Markası</span>
                <span className="font-medium">{servis.cihaz.marka}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cihaz Türü</span>
                <span className="font-medium">{servis.cihaz.tur}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cihaz Modeli</span>
                <span className="font-medium">{servis.cihaz.model}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Cihaz Arızası</span>
                <span className="font-medium text-red-600 text-[10px]">{servis.cihaz.arıza}</span>
              </div>
              {servis.cihaz.garantiBitis && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Garanti Bitiş T.</span>
                  <span className="font-medium">{formatDateTR(servis.cihaz.garantiBitis)} ({kalanGun} Gün Kaldı)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Servis Durumu */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Servis Durumu:</span>
            <button
              onClick={() => setDurumPopupOpen(true)}
              className="text-red-600 font-semibold text-sm hover:underline"
            >
              {servis.durum}
            </button>
          </div>
        </div>

        {/* Serviste Yapılan İşlemler */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-100 px-3 py-2 border-b">
            <h3 className="font-semibold text-gray-700 text-xs">SERVİSTE YAPILAN İŞLEMLER</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-gray-600">TARİH</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-600">İŞLEM ADI</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-600">AÇIKLAMA</th>
                </tr>
              </thead>
              <tbody>
                {servis.islemler.slice().reverse().map((islem) => (
                  <tr key={islem.id} className="border-b last:border-b-0">
                    <td className="px-2 py-2 text-gray-600">{formatDateTimeTR(islem.tarih)}</td>
                    <td className="px-2 py-2 font-medium">{islem.islemAdi}</td>
                    <td className="px-2 py-2 text-gray-600 whitespace-pre-line">{islem.aciklama}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Para Hareketleri */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-100 px-3 py-2 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-700 text-xs">PARA HAREKETLERİ</h3>
            <button
              onClick={() => setOdemePopupOpen(true)}
              className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600"
            >
              Ekle
            </button>
          </div>
          {servis.paraHareketleri.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">TARİH</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">TAHSİL EDEN</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">ÖDEME ŞEKLİ</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">DURUM</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-600">TUTAR</th>
                  </tr>
                </thead>
                <tbody>
                  {servis.paraHareketleri.map((hareket) => (
                    <tr key={hareket.id} className="border-b last:border-b-0">
                      <td className="px-2 py-2 text-gray-600">{formatDateTR(hareket.tarih)}</td>
                      <td className="px-2 py-2">{hareket.tahsilEden}</td>
                      <td className="px-2 py-2">{hareket.odemeSekli}</td>
                      <td className="px-2 py-2 text-green-600">{hareket.odemeDurumu}</td>
                      <td className="px-2 py-2 text-right font-medium">{hareket.tutar.toLocaleString('tr-TR')} TL</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              Henüz bir para tahsilatı yapmadınız.
            </div>
          )}
          {toplamOdeme > 0 && (
            <div className="bg-gray-50 px-3 py-2 border-t flex justify-between">
              <span className="font-semibold text-sm">Toplam:</span>
              <span className="font-bold text-sm text-blue-600">{toplamOdeme.toLocaleString('tr-TR')} TL</span>
            </div>
          )}
        </div>

        {/* Teknisyen Form Alanları */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-100 px-3 py-2 border-b">
            <h3 className="font-semibold text-gray-700 text-sm">Teknisyen Formu</h3>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Arıza Tespiti</label>
              <textarea
                value={arizaTespiti}
                onChange={(e) => setArizaTespiti(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Arıza tespiti detayları..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Yapılan İşlemler</label>
              <textarea
                value={yapilanIslemler}
                onChange={(e) => setYapilanIslemler(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Yapılan işlemler..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Kullanılan Parça</label>
              <input
                type="text"
                value={kullanilanParca}
                onChange={(e) => setKullanilanParca(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Parça adı ve kodu"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Toplam Tutar</label>
              <input
                type="number"
                value={toplamTutar}
                onChange={(e) => setToplamTutar(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* İmza Alanları */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setImzaTipi('musteri'); setImzaPopupOpen(true); }}
            className="bg-white rounded-lg p-3 shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
          >
            <p className="text-xs text-gray-500 mb-2">Müşteri İmzası</p>
            {servis.musteriImza ? (
              <img src={servis.musteriImza} alt="Müşteri imzası" className="w-full h-16 object-contain" />
            ) : (
              <p className="text-xs text-gray-400">İmza almak için tıklayın</p>
            )}
          </button>
          <button
            onClick={() => { setImzaTipi('teknisyen'); setImzaPopupOpen(true); }}
            className="bg-white rounded-lg p-3 shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
          >
            <p className="text-xs text-gray-500 mb-2">Teknisyen İmzası</p>
            {servis.teknisyenImza ? (
              <img src={servis.teknisyenImza} alt="Teknisyen imzası" className="w-full h-16 object-contain" />
            ) : (
              <p className="text-xs text-gray-400">İmza almak için tıklayın</p>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={generatePDF}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            PDF Fiş
          </button>
          <button
            onClick={whatsappPDF}
            className="bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            SMS Gönder
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            Yazdır
          </button>
          <button
            onClick={handleGuncelle}
            className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-medium transition-colors"
          >
            Servisi Güncelle
          </button>
        </div>
      </div>

      {/* PDF Template (Hidden) */}
      <div id="servis-formu-pdf" className="hidden">
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
          <h1 style={{ textAlign: 'center', fontSize: '18px', marginBottom: '20px' }}>- SERVİS FORMU -</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ width: '48%', border: '1px solid #000', padding: '10px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>MÜŞTERİ BİLGİLERİ</h3>
              <p><strong>Ad:</strong> {servis.musteri.ad}</p>
              <p><strong>Telefon:</strong> {servis.musteri.telefon1}</p>
              <p><strong>Adres:</strong> {servis.musteri.adres}, {servis.musteri.ilce}</p>
            </div>
            <div style={{ width: '48%', border: '1px solid #000', padding: '10px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>CİHAZ BİLGİSİ</h3>
              <p><strong>Cihaz Markası:</strong> {servis.cihaz.marka}</p>
              <p><strong>Cihaz Türü:</strong> {servis.cihaz.tur}</p>
              <p><strong>Cihaz Modeli:</strong> {servis.cihaz.model}</p>
              <p><strong>Cihaz Arızası:</strong> {servis.cihaz.arıza}</p>
            </div>
          </div>
          <p><strong>Servis No:</strong> {servis.servisNo}</p>
          <p><strong>Servis Kayıt Tarihi:</strong> {formatDateTR(servis.kayitTarihi)}</p>
          <hr style={{ margin: '20px 0' }} />
          <h3 style={{ fontWeight: 'bold' }}>Yapılan İşlemler</h3>
          <p>{yapilanIslemler || '-'}</p>
          <h3 style={{ fontWeight: 'bold', marginTop: '20px' }}>Kullanılan Parça</h3>
          <p>{kullanilanParca || '-'}</p>
          <h3 style={{ fontWeight: 'bold', marginTop: '20px' }}>Toplam Tutar</h3>
          <p>{toplamTutar || '0'} TL</p>
        </div>
      </div>

      {/* Durum Popup */}
      <Popup isOpen={durumPopupOpen} onClose={() => setDurumPopupOpen(false)} title="Servis Durumu" height="50%">
        <div className="divide-y divide-gray-600">
          {SERVIS_DURUMLARI.map((durum) => (
            <ListItem
              key={durum}
              label={durum}
              isSelected={servis.durum === durum}
              onClick={() => handleDurumDegistir(durum)}
            />
          ))}
        </div>
      </Popup>

      {/* Ödeme Ekle Popup */}
      <Popup isOpen={odemePopupOpen} onClose={() => setOdemePopupOpen(false)} title="Ödeme Ekle" height="45%">
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-300 block mb-1">Ödeme Şekli</label>
            <select
              value={odemeSekli}
              onChange={(e) => setOdemeSekli(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              {ODEME_SEKILLERI.map((sekli) => (
                <option key={sekli} value={sekli}>{sekli}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-300 block mb-1">Tutar (TL)</label>
            <input
              type="number"
              value={odemeTutar}
              onChange={(e) => setOdemeTutar(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
              placeholder="0.00"
            />
          </div>
          <button
            onClick={handleParaEkle}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mt-4"
          >
            Ekle
          </button>
        </div>
      </Popup>

      {/* İmza Popup */}
      <Popup isOpen={imzaPopupOpen} onClose={() => setImzaPopupOpen(false)} title={`${imzaTipi === 'musteri' ? 'Müşteri' : 'Teknisyen'} İmzası`} height="55%">
        <div className="p-4">
          <div className="bg-white rounded-lg mb-4">
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-40 border-2 border-dashed border-gray-400 rounded-lg cursor-crosshair touch-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearCanvas}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-sm"
            >
              Temizle
            </button>
            <button
              onClick={saveImza}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm"
            >
              Kaydet
            </button>
          </div>
          {imzaTipi === 'musteri' && (
            <button
              onClick={whatsappImza}
              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm mt-2"
            >
              WhatsApp ile İmza Al
            </button>
          )}
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
