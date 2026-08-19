"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle,
  FileText,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  User,
  Boxes
} from "lucide-react";

export default function BeritaAcaraTransferPage() {
  const params = useParams();
  const router = useRouter();
  const transferId = params?.id;

  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrBaseUrl, setQrBaseUrl] = useState("");

  useEffect(() => {
    setQrBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (!transferId) return;

    const fetchTransfer = async () => {
      try {
        setLoading(true);
        // Try public endpoint first so anyone with QR code can view, or fallback to regular transfer view
        let data;
        try {
          data = await api.get(`/public/transfers/${transferId}`);
        } catch {
          data = await api.get(`/transfers/${transferId}/print-ba`);
        }
        setTransfer(data);
      } catch (err: any) {
        setError(err.message || "Gagal memuat dokumen Berita Acara");
      } finally {
        setLoading(false);
      }
    };

    fetchTransfer();
  }, [transferId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold font-serif">Memuat Berita Acara Serah Terima...</h2>
        <p className="text-xs text-muted-foreground mt-1">Menyiapkan dokumen resmi inventaris yayasan</p>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md p-8 rounded-3xl border-destructive/30 bg-destructive/5 text-center flex flex-col items-center gap-4">
          <XCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-lg font-extrabold text-foreground font-serif">Dokumen Tidak Ditemukan</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{error || "Data Berita Acara tidak ditemukan atau telah dihapus."}</p>
          <Button asChild variant="outline" className="rounded-2xl mt-2 text-xs font-bold">
            <Link href="/transfers">Kembali ke Daftar Transfer</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const status = transfer.status || "completed";
  const dateFormatted = new Date(transfer.completed_at || transfer.approved_at || transfer.created_at || Date.now()).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const qrUrl = typeof window !== "undefined" ? window.location.href : `https://simaya.yapi.web.id/transfers/berita-acara/${transferId}`;

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
              status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400" :
              status === "approved" ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400" :
              status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/30 dark:text-rose-400" :
              "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400"
            }`}
          >
            {status === "completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
            {status === "approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
            {status === "rejected" && <XCircle className="w-3.5 h-3.5" />}
            {status === "pending" && <Clock className="w-3.5 h-3.5" />}
            <span>STATUS: {status.toUpperCase()}</span>
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
                    BERITA ACARA SERAH TERIMA ASET
                  </h2>
                  <p className="text-xs font-serif text-black font-normal">
                    Nomor: {transfer.transfer_number || transfer.number || `TRF-${transferId}`}
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
          Pada hari ini, <strong>{dateFormatted}</strong>, telah dilaksanakan serah terima aset dengan rincian sebagai berikut:
        </p>

        {/* Section I: Informasi Transfer */}
        <div className="flex flex-col gap-1 font-serif text-xs sm:text-sm">
          <h3 className="font-bold text-black uppercase tracking-wide">I. INFORMASI TRANSFER</h3>
          <table className="w-full text-xs sm:text-sm ml-3">
            <tbody>
              <tr>
                <td className="w-40 py-0.5 text-black">Nomor Transfer</td>
                <td className="w-4 py-0.5 text-center">:</td>
                <td className="py-0.5 text-black font-bold font-mono">{transfer.transfer_number || `TRF-${transferId}`}</td>
              </tr>
              <tr>
                <td className="py-0.5 text-black">Status</td>
                <td className="py-0.5 text-center">:</td>
                <td className="py-0.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                    status === "completed" ? "bg-emerald-100 text-emerald-900 border border-emerald-300" :
                    status === "approved" ? "bg-blue-100 text-blue-900 border border-blue-300" :
                    status === "rejected" ? "bg-rose-100 text-rose-900 border border-rose-300" :
                    "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}>
                    {status.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-0.5 text-black">Tanggal Pengajuan</td>
                <td className="py-0.5 text-center">:</td>
                <td className="py-0.5 text-black">{new Date(transfer.created_at || Date.now()).toLocaleString("id-ID")}</td>
              </tr>
              {transfer.approved_at && (
                <tr>
                  <td className="py-0.5 text-black">Tanggal Persetujuan</td>
                  <td className="py-0.5 text-center">:</td>
                  <td className="py-0.5 text-black">{new Date(transfer.approved_at).toLocaleString("id-ID")}</td>
                </tr>
              )}
              {transfer.completed_at && (
                <tr>
                  <td className="py-0.5 text-black">Tanggal Selesai</td>
                  <td className="py-0.5 text-center">:</td>
                  <td className="py-0.5 text-black">{new Date(transfer.completed_at).toLocaleString("id-ID")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section II: Pihak yang Menyerahkan */}
        <div className="flex flex-col gap-1 font-serif text-xs sm:text-sm">
          <h3 className="font-bold text-black uppercase tracking-wide">II. PIHAK YANG MENYERAHKAN</h3>
          <table className="w-full text-xs sm:text-sm ml-3">
            <tbody>
              <tr>
                <td className="w-40 py-0.5 text-black">Unit</td>
                <td className="w-4 py-0.5 text-center">:</td>
                <td className="py-0.5 text-black font-bold">
                  {transfer.fromUnit?.name || (typeof transfer.from_unit === "string" ? transfer.from_unit : transfer.from_unit?.name) || "—"}
                </td>
              </tr>
              <tr>
                <td className="py-0.5 text-black">Lokasi Asal</td>
                <td className="py-0.5 text-center">:</td>
                <td className="py-0.5 text-black font-bold">
                  {transfer.fromLocation?.name || (typeof transfer.from_location === "string" ? transfer.from_location : transfer.from_location?.name) || "—"}
                </td>
              </tr>
              <tr>
                <td className="py-0.5 text-black">Diajukan Oleh</td>
                <td className="py-0.5 text-center">:</td>
                <td className="py-0.5 text-black font-semibold">
                  {transfer.requested_by?.name || transfer.requestedBy?.name || (typeof transfer.requested_by === "string" ? transfer.requested_by : null) || (typeof transfer.requester === "string" ? transfer.requester : transfer.requester?.name) || "TU Sarpras"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section III: Pihak yang Menerima */}
        <div className="flex flex-col gap-1 font-serif text-xs sm:text-sm">
          <h3 className="font-bold text-black uppercase tracking-wide">III. PIHAK YANG MENERIMA</h3>
          <table className="w-full text-xs sm:text-sm ml-3">
            <tbody>
              <tr>
                <td className="w-40 py-0.5 text-black">Lokasi Tujuan</td>
                <td className="w-4 py-0.5 text-center">:</td>
                <td className="py-0.5 text-black font-bold">
                  {transfer.toLocation?.name || (typeof transfer.to_location === "string" ? transfer.to_location : transfer.to_location?.name) || "—"}{" "}
                  ({transfer.toLocation?.unit?.name || transfer.fromUnit?.name || (typeof transfer.to_unit === "string" ? transfer.to_unit : transfer.to_unit?.name) || "Unit Terkait"})
                </td>
              </tr>
              <tr>
                <td className="py-0.5 text-black">Diterima Oleh</td>
                <td className="py-0.5 text-center">:</td>
                <td className="py-0.5 text-black font-semibold">
                  {transfer.approved_by?.name || transfer.approvedBy?.name || (typeof transfer.approved_by === "string" ? transfer.approved_by : null) || (typeof transfer.approver === "string" ? transfer.approver : transfer.approver?.name) || "Bagian Umum YAPI"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section IV: Alasan Transfer */}
        <div className="flex flex-col gap-1 font-serif text-xs sm:text-sm">
          <h3 className="font-bold text-black uppercase tracking-wide">IV. ALASAN TRANSFER</h3>
          <p className="ml-3 text-justify italic text-black">
            {transfer.reason || "Mutasi inventaris operasional antar ruangan/unit yayasan."}
            {transfer.notes && <span className="block not-italic text-black/80 mt-0.5">Catatan Tambahan: {transfer.notes}</span>}
          </p>
        </div>

        {/* Section V: Daftar Aset yang Diserahterimakan */}
        <div className="flex flex-col gap-1.5 font-serif text-xs sm:text-sm">
          <h3 className="font-bold text-black uppercase tracking-wide">
            V. DAFTAR ASET YANG DISERAHTERIMAKAN
          </h3>

          <table className="w-full border-collapse border border-black text-left text-xs">
            <thead>
              <tr className="bg-black/5 font-bold border-b border-black">
                <th className="border border-black p-2 w-8 text-center">No</th>
                <th className="border border-black p-2">Nama Aset</th>
                <th className="border border-black p-2 w-24 text-center">Nomor Aset</th>
                <th className="border border-black p-2 w-20 text-center">Kondisi</th>
                <th className="border border-black p-2">Catatan</th>
                <th className="border border-black p-1.5 w-20 text-center">QR Code</th>
                <th className="border border-black p-2 w-16 text-center">Foto</th>
              </tr>
            </thead>
            <tbody>
              {(transfer.items || []).map((item: any, idx: number) => {
                const asset = item.asset || item;
                const photoUrl = item.photo_before || asset.image;
                const assetQrUrl = qrBaseUrl && asset.id ? `${qrBaseUrl}/guest-detail-asset/${asset.id}` : "";
                return (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-2 font-bold text-black">
                      {asset.name || asset.asset_name || "Aset Inventaris"}
                      {asset.brand && <span className="block text-[10px] font-normal text-black/70">Merk: {asset.brand}</span>}
                    </td>
                    <td className="border border-black p-2 text-center font-mono font-bold">
                      {asset.entries_number || "—"}
                    </td>
                    <td className="border border-black p-2 text-center uppercase font-bold">
                      {asset.condition || "Bagus"}
                    </td>
                    <td className="border border-black p-2 italic text-black/80">
                      {item.condition_notes || "Kondisi saat transfer diajukan"}
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
                    <td className="border border-black p-1 text-center">
                      {photoUrl ? (
                        <img 
                          src={photoUrl.startsWith("http") ? photoUrl : `/storage/${photoUrl}`} 
                          alt="Foto Aset" 
                          className="w-12 h-12 object-cover mx-auto border border-black/20 rounded"
                        />
                      ) : (
                        <span className="text-[9px] text-black/40 italic">No Photo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="font-bold text-xs mt-1">Total Aset: {transfer.items?.length || 0} item</p>
        </div>

        {/* Section VI: Tanda Tangan */}
        <div className="mt-6 pt-2 font-serif text-xs sm:text-sm print:break-inside-avoid">
          <h3 className="font-bold text-black uppercase tracking-wide mb-4">VI. TANDA TANGAN</h3>
          
          <table className="w-full border-collapse text-center">
            <tbody>
              <tr>
                <td className="w-1/2 p-2 align-top">
                  <p className="font-bold text-black mb-20">Yang Menyerahkan,</p>
                  <p className="font-bold underline text-black">
                    {transfer.requested_by?.name || transfer.requestedBy?.name || (typeof transfer.requested_by === "string" ? transfer.requested_by : null) || (typeof transfer.requester === "string" ? transfer.requester : transfer.requester?.name) || "TU Sarpras"}
                  </p>
                  <p className="text-[11px] text-black/80 font-bold mt-0.5">
                    TU Unit ({transfer.fromUnit?.name || (typeof transfer.from_unit === "string" ? transfer.from_unit : transfer.from_unit?.name) || "Unit Terkait"})
                  </p>
                </td>
                <td className="w-1/2 p-2 align-top">
                  <p className="font-bold text-black mb-20">Yang Menerima,</p>
                  <p className="font-bold underline text-black">
                    {transfer.approved_by?.name || transfer.approvedBy?.name || (typeof transfer.approved_by === "string" ? transfer.approved_by : null) || (typeof transfer.approver === "string" ? transfer.approver : transfer.approver?.name) || "Bagian Umum YAPI"}
                  </p>
                  <p className="text-[11px] text-black/80 font-bold mt-0.5">Bagian Umum YAPI</p>
                </td>
              </tr>
            </tbody>
          </table>
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
