"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Trash2, 
  Gift, 
  HeartHandshake,
  Clock, 
  XCircle,
  FileText
} from "lucide-react";

export default function BeritaAcaraDispositionPage() {
  const params = useParams();
  const router = useRouter();
  const dispositionId = params?.id;

  const [disposition, setDisposition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrBaseUrl, setQrBaseUrl] = useState("");

  useEffect(() => {
    setQrBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (!dispositionId) return;

    const fetchDisposition = async () => {
      try {
        setLoading(true);
        let data;
        try {
          data = await api.get(`/public/dispositions/${dispositionId}`);
        } catch {
          data = await api.get(`/dispositions/${dispositionId}`);
        }
        setDisposition(data);
      } catch (err: any) {
        setError(err.message || "Gagal memuat dokumen Berita Acara");
      } finally {
        setLoading(false);
      }
    };

    fetchDisposition();
  }, [dispositionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold font-serif">Memuat Berita Acara Disposisi...</h2>
        <p className="text-xs text-muted-foreground mt-1">Menyiapkan dokumen resmi penghapusan/hibah yayasan</p>
      </div>
    );
  }

  if (error || !disposition) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md p-8 rounded-3xl border-destructive/30 bg-destructive/5 text-center flex flex-col items-center gap-4">
          <XCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-lg font-extrabold text-foreground font-serif">Dokumen Tidak Ditemukan</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{error || "Data Berita Acara tidak ditemukan atau telah dihapus."}</p>
          <Button asChild variant="outline" className="rounded-2xl mt-2 text-xs font-bold">
            <Link href="/dispositions">Kembali ke Daftar Disposisi</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const type = disposition.type || "penghapusan";
  const titleText = 
    type === "penghapusan" ? "BERITA ACARA PENGHAPUSAN ASET" :
    type === "hibah" ? "BERITA ACARA HIBAH ASET" : "BERITA ACARA SUMBANGAN ASET";

  const dateFormatted = new Date(disposition.document_date || disposition.created_at || Date.now()).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const totalEstimatedValue = (disposition.items || []).reduce((acc: number, item: any) => acc + Number(item.estimated_value || 0), 0);
  const qrUrl = typeof window !== "undefined" ? window.location.href : `https://simaya.yapi.web.id/dispositions/berita-acara/${dispositionId}`;

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white text-foreground p-4 sm:p-8 flex flex-col items-center justify-start">
      
      {/* Top Action Bar - Hidden in Print */}
      <div className="max-w-4xl w-full flex items-center justify-between gap-4 mb-6 print:hidden">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-2xl gap-2 text-xs font-bold bg-card"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Button>

        <div className="flex items-center gap-3">
          <Badge 
            variant="outline"
            className={`text-xs font-bold uppercase px-3 py-1 gap-1.5 ${
              type === "penghapusan" ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/30 dark:text-rose-400" :
              type === "hibah" ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400" :
              "bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/30 dark:text-sky-400"
            }`}
          >
            {type === "penghapusan" && <Trash2 className="w-3.5 h-3.5" />}
            {type === "hibah" && <Gift className="w-3.5 h-3.5" />}
            {type === "sumbangan" && <HeartHandshake className="w-3.5 h-3.5" />}
            <span>TIPE: {type.toUpperCase()}</span>
          </Badge>

          <Button 
            onClick={() => window.print()}
            className="rounded-2xl gap-2 text-xs font-bold shadow-md shadow-primary/25"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (A4)</span>
          </Button>
        </div>
      </div>

      {/* Printable Document Container (Exact Filament PDF Replica Layout) */}
      <div className="max-w-4xl w-full bg-white text-black font-serif rounded-none sm:rounded-2xl border border-black/20 sm:shadow-xl p-8 sm:p-14 flex flex-col gap-5 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:text-black">
        
        {/* Formal Header / Kop Surat Double Line */}
        <div className="border-b-[3px] border-double border-black pb-4">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-20 align-middle">
                  <img 
                    src="/images/yapi.png" 
                    alt="Logo YAPI" 
                    className="w-16 h-16 object-contain shrink-0" 
                  />
                </td>
                <td className="text-center align-middle px-3">
                  <h1 className="text-sm sm:text-base font-bold uppercase tracking-tight text-black font-serif">
                    YAYASAN ASRAMA PELAJAR ISLAM (YAPI)
                  </h1>
                  <h2 className="text-base sm:text-lg font-bold text-black font-serif uppercase underline underline-offset-2 my-0.5">
                    {titleText}
                  </h2>
                  <p className="text-xs font-serif text-black font-normal">
                    Nomor Dokumen: {disposition.document_number || disposition.disposition_number}
                  </p>
                </td>
                <td className="w-20 align-middle text-right">
                  <div className="inline-flex flex-col items-center">
                    <QRCodeSVG 
                      value={qrUrl}
                      size={65}
                      fgColor="#000000"
                      bgColor="#ffffff"
                      level="M"
                    />
                    <span className="text-[7px] font-sans font-bold text-black/70 mt-0.5 tracking-wider">VERIFIKASI</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Introduction Paragraph */}
        <p className="text-xs sm:text-sm leading-relaxed text-justify text-black font-serif">
          Pada hari ini, <strong>{dateFormatted}</strong>, berdasarkan hasil pemeriksaan fisik inventaris dan Surat Keputusan/Dokumen Pendukung Nomor <strong>{disposition.document_number || disposition.disposition_number}</strong>, telah ditetapkan pelaksanaan <strong>{type.toUpperCase()}</strong> terhadap aset-aset inventaris yayasan sebagai berikut:
        </p>

        {/* Section I: Informasi Disposisi */}
        <div className="flex flex-col gap-1 font-serif text-xs sm:text-sm">
          <h3 className="font-bold text-black uppercase tracking-wide">I. INFORMASI DISPOSISI</h3>
          <table className="w-full text-xs sm:text-sm ml-3">
            <tbody>
              <tr>
                <td className="w-44 py-0.5 text-black">Nomor Disposisi</td>
                <td className="w-4 py-0.5 text-center">:</td>
                <td className="py-0.5 text-black font-bold font-mono">{disposition.disposition_number}</td>
              </tr>
              <tr>
                <td className="py-0.5 text-black">Nomor Dokumen/SK</td>
                <td className="py-0.5 text-center">:</td>
                <td className="py-0.5 text-black font-bold">{disposition.document_number || "-"}</td>
              </tr>
              <tr>
                <td className="py-0.5 text-black">Tipe Disposisi</td>
                <td className="py-0.5 text-center">:</td>
                <td className="py-0.5 uppercase font-bold text-black">{disposition.type}</td>
              </tr>
              <tr>
                <td className="py-0.5 text-black">Status</td>
                <td className="py-0.5 text-center">:</td>
                <td className="py-0.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                    disposition.status === "completed" ? "bg-emerald-100 text-emerald-900 border border-emerald-300" :
                    disposition.status === "cancelled" ? "bg-rose-100 text-rose-900 border border-rose-300" :
                    "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}>
                    {disposition.status?.toUpperCase() || "DRAFT"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-0.5 text-black">Petugas Pemroses</td>
                <td className="py-0.5 text-center">:</td>
                <td className="py-0.5 text-black">
                  {disposition.processedBy?.name || disposition.processed_by?.name || (typeof disposition.processed_by === "string" ? disposition.processed_by : "Petugas Sarpras")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section II: Data Penerima (if hibah / sumbangan) */}
        {inArray(type, ["hibah", "sumbangan"]) && (
          <div className="flex flex-col gap-1 font-serif text-xs sm:text-sm">
            <h3 className="font-bold text-black uppercase tracking-wide">II. DATA PENERIMA {type.toUpperCase()}</h3>
            <table className="w-full text-xs sm:text-sm ml-3">
              <tbody>
                <tr>
                  <td className="w-44 py-0.5 text-black">Nama Penerima</td>
                  <td className="w-4 py-0.5 text-center">:</td>
                  <td className="py-0.5 text-black font-bold">{disposition.recipient_name || "—"}</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-black">Lembaga / Organisasi</td>
                  <td className="py-0.5 text-center">:</td>
                  <td className="py-0.5 text-black font-bold">{disposition.recipient_organization || "—"}</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-black">Alamat Penerima</td>
                  <td className="py-0.5 text-center">:</td>
                  <td className="py-0.5 text-black">{disposition.recipient_address || "—"}</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-black">No. Telepon / Kontak</td>
                  <td className="py-0.5 text-center">:</td>
                  <td className="py-0.5 text-black font-mono">{disposition.recipient_phone || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Section: Alasan Penetapan */}
        <div className="flex flex-col gap-1 font-serif text-xs sm:text-sm">
          <h3 className="font-bold text-black uppercase tracking-wide">
            {inArray(type, ["hibah", "sumbangan"]) ? "III" : "II"}. ALASAN DISPOSISI
          </h3>
          <p className="ml-3 text-justify italic text-black">
            "{disposition.reason || "Penghapusan/hibah aset inventaris non-produktif sesuai ketentuan yayasan."}"
            {disposition.notes && <span className="block not-italic text-black/80 mt-0.5">Catatan Tambahan: {disposition.notes}</span>}
          </p>
        </div>

        {/* Section: Daftar Aset */}
        <div className="flex flex-col gap-1.5 font-serif text-xs sm:text-sm">
          <h3 className="font-bold text-black uppercase tracking-wide">
            {inArray(type, ["hibah", "sumbangan"]) ? "IV" : "III"}. DAFTAR ASET YANG DIDISPOSISI
          </h3>

          <table className="w-full border-collapse border border-black text-left text-xs">
            <thead>
              <tr className="bg-black/5 font-bold border-b border-black">
                <th className="border border-black p-2 w-8 text-center">No</th>
                <th className="border border-black p-2">Nama Aset</th>
                <th className="border border-black p-2 w-24 text-center">Nomor Aset</th>
                <th className="border border-black p-2 w-20 text-center">Kondisi</th>
                <th className="border border-black p-2 w-28 text-right">Estimasi Nilai</th>
                <th className="border border-black p-2">Catatan</th>
                <th className="border border-black p-1.5 w-20 text-center">QR Code</th>
              </tr>
            </thead>
            <tbody>
              {(disposition.items || []).map((item: any, idx: number) => {
                const asset = item.asset || {};
                const assetQrUrl = qrBaseUrl && asset.id ? `${qrBaseUrl}/guest-detail-asset/${asset.id}` : "";
                return (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-2 font-bold text-black">
                      {asset.name || "Aset Inventaris"}
                      {asset.brand && <span className="block text-[10px] font-normal text-black/70">Merk: {asset.brand}</span>}
                    </td>
                    <td className="border border-black p-2 text-center font-mono font-bold">
                      {asset.entries_number || "—"}
                    </td>
                    <td className="border border-black p-2 text-center uppercase font-bold">
                      {asset.condition || "Rusak"}
                    </td>
                    <td className="border border-black p-2 text-right font-mono font-bold text-black">
                      Rp {Number(item.estimated_value || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="border border-black p-2 italic text-black/80">
                      {item.condition_notes || "Rusak Berat / Non-Aktif"}
                    </td>
                    <td className="border border-black p-1 text-center bg-white">
                      {assetQrUrl ? (
                        <div className="flex flex-col items-center justify-center">
                          <QRCodeSVG
                            value={assetQrUrl}
                            size={44}
                            level="M"
                            className="mx-auto"
                          />
                          <span className="text-[8px] font-mono text-black/60 mt-0.5">Scan Detail</span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-black/40 italic">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-black/5 font-bold border-t border-black">
                <td colSpan={4} className="border border-black p-2 text-right uppercase">Total Estimasi Nilai:</td>
                <td className="border border-black p-2 text-right font-mono font-black text-black">
                  Rp {totalEstimatedValue.toLocaleString("id-ID")}
                </td>
                <td colSpan={2} className="border border-black p-2"></td>
              </tr>
            </tfoot>
          </table>
          <p className="font-bold text-xs mt-1">Total Aset: {disposition.items?.length || 0} item</p>
        </div>

        {/* Section: Tanda Tangan */}
        <div className="mt-6 pt-2 font-serif text-xs sm:text-sm print:break-inside-avoid">
          <h3 className="font-bold text-black uppercase tracking-wide mb-4">
            {inArray(type, ["hibah", "sumbangan"]) ? "V" : "IV"}. TANDA TANGAN
          </h3>
          
          <table className="w-full border-collapse text-center">
            <tbody>
              <tr>
                <td className="w-1/3 p-2 align-top">
                  <p className="font-bold text-black mb-20">Yang Mengajukan,</p>
                  <p className="font-bold underline text-black">
                    {disposition.processedBy?.name || disposition.processed_by?.name || (typeof disposition.processed_by === "string" ? disposition.processed_by : "....................................")}
                  </p>
                  <p className="text-[11px] text-black/80 font-bold mt-0.5">Bagian Umum YAPI</p>
                </td>
                <td className="w-1/3 p-2 align-top">
                  <p className="font-bold text-black mb-20">Mengetahui,</p>
                  <p className="font-bold underline text-black">....................................</p>
                  <p className="text-[11px] text-black/80 font-bold mt-0.5">Kabag SDM dan Umum</p>
                </td>
                <td className="w-1/3 p-2 align-top">
                  <p className="font-bold text-black mb-20">Menyetujui,</p>
                  <p className="font-bold underline text-black">....................................</p>
                  <p className="text-[11px] text-black/80 font-bold mt-0.5">Pengurus YAPI</p>
                </td>
              </tr>
            </tbody>
          </table>

          {inArray(type, ["hibah", "sumbangan"]) && disposition.recipient_name && (
            <div className="mt-6 pt-4 border-t border-dashed border-black/30">
              <table className="w-full border-collapse text-center">
                <tbody>
                  <tr>
                    <td className="w-1/2 p-2 align-top mx-auto">
                      <p className="font-bold text-black mb-20">Yang Menerima {type === "hibah" ? "Hibah" : "Sumbangan"},</p>
                      <p className="font-bold underline text-black">{disposition.recipient_name}</p>
                      <p className="text-[11px] text-black/80 font-bold mt-0.5">{disposition.recipient_organization || "Pihak Penerima"}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="border-t border-black/30 pt-3 mt-4 text-center text-[10px] text-black/60 font-serif">
          <p>Dokumen ini dicetak pada {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          <p className="font-bold mt-0.5">SIMAYA - Sistem Informasi Manajemen Aset Yayasan Asrama Pelajar Islam</p>
        </div>

      </div>
    </div>
  );
}

function inArray(needle: string, haystack: string[]): boolean {
  return haystack.includes(needle);
}
