"use client";

import { useState, useMemo, useEffect } from "react";
import Pagination from "@/components/ui/Pagination";
import Sidebar from "@/components/layout/Sidebar";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { 
  Trash2, 
  Plus, 
  Menu, 
  Calendar, 
  User, 
  AlertTriangle, 
  X, 
  Check, 
  Info,
  ChevronRight,
  ClipboardList,
  FileText,
  Loader2
} from "lucide-react";

export default function DispositionsPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [selectedDisposition, setSelectedDisposition] = useState<any | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Form State
  const [type, setType] = useState("penghapusan");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientOrg, setRecipientOrg] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<any[]>([]);

  // States loaded from backend
  const [dispositions, setDispositions] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const dispResp = await api.get("/dispositions?per_page=9999");
      setDispositions(dispResp.data || []);
    } catch (err) {
      console.error("Failed to load disposition data from backend", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch available assets dynamically when the user goes to the "create" tab
  useEffect(() => {
    if (activeTab !== "create") return;
    const loadAssets = async () => {
      try {
        setLoadingAssets(true);
        const resp = await api.get("/assets?status=active,transferred&per_page=999");
        setAssets(resp.data || []);
      } catch (err) {
        console.error("Failed to load assets for disposition selection", err);
      } finally {
        setLoadingAssets(false);
      }
    };
    loadAssets();
  }, [activeTab]);

  // Transferred Assets available in Gudang Yayasan for disposition
  const availableTransferredAssets = useMemo(() => {
    return assets.filter(a => a.status === 'transferred' || a.status === 'active');
  }, [assets]);

  // Pagination derived values
  const totalPages = Math.ceil(dispositions.length / perPage);
  const paginatedDispositions = useMemo(() => {
    return dispositions.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [dispositions, currentPage, perPage]);

  // Actions
  const handleComplete = async (id: number) => {
    try {
      await api.post(`/dispositions/${id}/complete`);
      toast.success("Disposisi berhasil diselesaikan!");
      fetchAllData();
      setSelectedDisposition(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyelesaikan disposisi");
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.post(`/dispositions/${id}/cancel`);
      toast.success("Disposisi berhasil dibatalkan!");
      fetchAllData();
      setSelectedDisposition(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal membatalkan disposisi");
    }
  };

  const handleSelectAsset = (assetId: string) => {
    const matching = availableTransferredAssets.find(a => a.id.toString() === assetId);
    if (!matching) return;
    
    // Check if already selected
    if (selectedAssets.some(a => a.id === matching.id)) return;

    setSelectedAssets([...selectedAssets, {
      ...matching,
      estimated_value: matching.price || 0,
      condition_notes: ""
    }]);
  };

  const handleRemoveAsset = (id: number) => {
    setSelectedAssets(selectedAssets.filter(a => a.id !== id));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssets.length === 0) {
      toast.warning("Mohon pilih minimal 1 aset untuk didisposisi!");
      return;
    }

    try {
      const payload: any = {
        type,
        reason,
        notes,
        document_number: documentNumber,
        document_date: documentDate || new Date().toISOString().split("T")[0],
        items: selectedAssets.map(a => ({
          asset_id: a.id,
          condition_notes: a.condition_notes || "Disposisi aset",
          estimated_value: Number(a.estimated_value || 0),
        })),
      };

      if (["hibah", "sumbangan"].includes(type)) {
        payload.recipient_name = recipientName;
        payload.recipient_organization = recipientOrg;
        payload.recipient_phone = recipientPhone;
        payload.recipient_address = recipientAddress;
      }

      await api.post("/dispositions", payload);
      toast.success("Disposisi berhasil diajukan!");
      
      // Reset form
      setType("penghapusan");
      setReason("");
      setNotes("");
      setDocumentNumber("");
      setDocumentDate("");
      setRecipientName("");
      setRecipientOrg("");
      setRecipientPhone("");
      setRecipientAddress("");
      setSelectedAssets([]);
      setActiveTab("list");
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengajukan disposisi");
    }
  };



  return (
    <div className="flex bg-background h-screen overflow-hidden relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto h-full w-full">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white border border-border-peach/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-2xl bg-background border border-border-peach hover:text-primary flex lg:hidden items-center justify-center transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Disposisi Aset</h2>
              <p className="text-xs text-foreground/50 font-medium mt-1">Kelola pencatatan aset yang dihapuskan, dihibahkan, atau disumbangkan.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "list" ? "bg-primary text-white" : "bg-background border border-border-peach text-foreground/70"
              }`}
            >
              Daftar Disposisi
            </button>
            <button 
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "create" ? "bg-primary text-white" : "bg-background border border-border-peach text-foreground/70"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Disposisi</span>
            </button>
          </div>
        </header>

        {activeTab === "list" ? (
          /* LIST TABLE */
          <section className="bg-white border border-border-peach rounded-3xl overflow-hidden shadow-card">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-primary-light/40 border-b border-border-peach">
                    <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">No. Disposisi</th>
                    <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Tipe</th>
                    <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Jml Aset</th>
                    <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Penerima</th>
                    <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Tanggal Dibuat</th>
                    <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Status</th>
                    <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-peach/50">
                  {paginatedDispositions.map((item) => (
                    <tr key={item.id} className="hover:bg-primary-light/10 transition-colors">
                      <td className="p-5 text-xs font-bold text-primary">{item.disposition_number}</td>
                      <td className="p-5 text-xs font-extrabold">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black ${
                          item.type === "penghapusan" 
                            ? "bg-red-50 text-red-600 border border-red-100" 
                            : item.type === "hibah"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-sky-50 text-sky-600 border border-sky-100"
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-5 text-xs font-semibold">{item.items.length} Aset</td>
                      <td className="p-5 text-xs font-semibold text-foreground/60">{item.recipient_name || "-"}</td>
                      <td className="p-5 text-xs font-semibold text-foreground/60">{item.created_at}</td>
                      <td className="p-5 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === "draft" ? "bg-amber-100 text-amber-800" : item.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}>
                          {item.status === "draft" ? "Draft" : item.status === "completed" ? "Selesai" : "Dibatalkan"}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <button 
                          onClick={() => setSelectedDisposition(item)}
                          className="px-3 py-1.5 bg-primary-light hover:bg-primary-light/80 text-primary text-xs font-bold rounded-xl transition-all"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedDispositions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs font-semibold text-foreground/40">
                        Tidak ada data disposisi/penghapusan aset.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={dispositions.length}
              perPage={perPage}
              onPageChange={setCurrentPage}
              onPerPageChange={setPerPage}
            />
          </section>
        ) : (
          /* CREATE DISPOSITION FORM */
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
            
            <div className="bg-white border border-border-peach rounded-3xl p-6 sm:p-8 shadow-card flex flex-col gap-6">
              <h3 className="text-sm font-black text-primary uppercase tracking-wider border-b border-border-peach/50 pb-3">Informasi Disposisi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground/75">Tipe Disposisi</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
                    required
                  >
                    <option value="penghapusan">Penghapusan Aset (Dimusnahkan)</option>
                    <option value="hibah">Hibah Aset (Diberikan Resmi)</option>
                    <option value="sumbangan">Sumbangan Aset</option>
                  </select>
                  <span className="text-[10px] text-foreground/45 italic font-medium px-1">
                    {type === "penghapusan" && "Aset akan dihapus/dimusnahkan dari inventaris aktif."}
                    {type === "hibah" && "Aset akan dihibahkan ke pihak luar secara resmi menggunakan dokumen."}
                    {type === "sumbangan" && "Aset disumbangkan secara sosial ke lembaga lain."}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground/75">Alasan Disposisi</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    placeholder="Alasan detail penghapusan aset..."
                    className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground/75">Catatan Tambahan</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Catatan tambahan (opsional)..."
                  className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Recipient Details - Conditional rendering */}
            {["hibah", "sumbangan"].includes(type) && (
              <div className="bg-white border border-border-peach rounded-3xl p-6 sm:p-8 shadow-card flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-sm font-black text-primary uppercase tracking-wider border-b border-border-peach/50 pb-3">Informasi Penerima</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-foreground/75">Nama Penerima</label>
                    <input 
                      type="text" 
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nama lengkap penerima..."
                      className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-foreground/75">Organisasi / Lembaga</label>
                    <input 
                      type="text" 
                      value={recipientOrg}
                      onChange={(e) => setRecipientOrg(e.target.value)}
                      placeholder="Nama sekolah, panti asuhan, dll..."
                      className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-foreground/75">No. Telepon</label>
                    <input 
                      type="tel" 
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="08xxxxxxxx..."
                      className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground/75">Alamat Penerima</label>
                  <textarea 
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    rows={2}
                    placeholder="Alamat lengkap lokasi penerima hibah/sumbangan..."
                    className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Supporting Document Section */}
            <div className="bg-white border border-border-peach rounded-3xl p-6 sm:p-8 shadow-card flex flex-col gap-6">
              <h3 className="text-sm font-black text-primary uppercase tracking-wider border-b border-border-peach/50 pb-3">Dokumen Pendukung (SK/Berita Acara)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground/75">Nomor Surat Keputusan / Dokumen</label>
                  <input 
                    type="text" 
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Contoh: SK/HB/2026/001"
                    className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground/75">Tanggal Surat</label>
                  <input 
                    type="date" 
                    value={documentDate}
                    onChange={(e) => setDocumentDate(e.target.value)}
                    className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Asset Selection Section */}
            <div className="bg-white border border-border-peach rounded-3xl p-6 sm:p-8 shadow-card flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border-peach/50 pb-3 flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-black text-primary uppercase tracking-wider">Pilih Aset untuk Disposisi</h3>
                  <p className="text-[10px] text-foreground/45 mt-0.5">Daftar aset yang telah ditransfer ke Gudang Yayasan</p>
                </div>
                
                <select 
                  onChange={(e) => handleSelectAsset(e.target.value)}
                  className="px-4 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="">{loadingAssets ? "Memuat aset..." : "Pilih Aset untuk Ditambahkan..."}</option>
                  {availableTransferredAssets.map(a => (
                    <option key={a.id} value={a.id.toString()}>
                      {a.name} ({a.entries_number}) - {a.brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Assets Grid */}
              {selectedAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border-peach rounded-2xl gap-2">
                  <ClipboardList className="w-10 h-10 text-foreground/20" />
                  <span className="text-xs font-bold text-foreground/45">Belum ada aset dipilih.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAssets.map((asset) => (
                    <div key={asset.id} className="p-4 bg-background border border-border-peach rounded-2xl relative flex flex-col gap-3">
                      <button 
                        type="button"
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="absolute top-3 right-3 text-foreground/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex justify-between items-start pr-6">
                        <div>
                          <h4 className="text-xs font-black text-foreground">{asset.name}</h4>
                          <span className="text-[9px] font-bold text-primary">{asset.entries_number}</span>
                        </div>
                        <span className="text-xs font-extrabold text-foreground/60">Rp {asset.price.toLocaleString("id-ID")}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-foreground/50 uppercase">Estimasi Nilai</label>
                          <input 
                            type="number" 
                            value={asset.estimated_value}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setSelectedAssets(selectedAssets.map(a => a.id === asset.id ? { ...a, estimated_value: val } : a));
                            }}
                            className="px-3 py-1.5 bg-white border border-border-peach rounded-xl text-xs font-semibold focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-foreground/50 uppercase">Catatan Kondisi</label>
                          <input 
                            type="text" 
                            value={asset.condition_notes}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedAssets(selectedAssets.map(a => a.id === asset.id ? { ...a, condition_notes: val } : a));
                            }}
                            placeholder="Catatan..."
                            className="px-3 py-1.5 bg-white border border-border-peach rounded-xl text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-6 py-3 bg-white border border-border-peach text-foreground/75 hover:text-primary rounded-xl font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs transition-colors shadow-md shadow-primary/15"
              >
                Simpan Draft Disposisi
              </button>
            </div>

          </form>
        )}

      </main>

      {/* Detail View Modal */}
      {selectedDisposition && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-3xl max-h-[85vh] p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-300 overflow-hidden">
            <button 
              onClick={() => setSelectedDisposition(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-extrabold text-foreground font-serif leading-none">{selectedDisposition.disposition_number}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    selectedDisposition.type === "penghapusan" 
                      ? "bg-red-50 text-red-600 border border-red-100" 
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}>
                    {selectedDisposition.type}
                  </span>
                </div>
                <p className="text-xs text-foreground/50 font-semibold mt-2">
                  Penghapusan atau penyerahan fisik aset inventaris yayasan.
                </p>
              </div>
            </div>

            <hr className="border-border-peach/50" />

            {/* Detail Panel */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-1">
              
              {/* Document Reference Info */}
              <div className="bg-background border border-border-peach rounded-2xl p-4 flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-2.5 flex-1">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-foreground/45 uppercase leading-none">Nomor Surat Keputusan (SK)</span>
                    <span className="text-xs font-black text-foreground mt-1">{selectedDisposition.document_number}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 flex-1">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-foreground/45 uppercase leading-none">Tanggal SK</span>
                    <span className="text-xs font-black text-foreground mt-1">{selectedDisposition.document_date}</span>
                  </div>
                </div>
              </div>

              {/* Recipient Details - Conditional rendering */}
              {["hibah", "sumbangan"].includes(selectedDisposition.type) && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Informasi Penerima</h4>
                  <div className="p-4 bg-zinc-50 border border-border-peach/50 rounded-2xl grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-foreground/45 uppercase">Nama Lengkap</span>
                      <span className="text-xs font-black text-foreground">{selectedDisposition.recipient_name}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-foreground/45 uppercase">Organisasi</span>
                      <span className="text-xs font-black text-foreground">{selectedDisposition.recipient_org || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-foreground/45 uppercase">Kontak Telepon</span>
                      <span className="text-xs font-black text-foreground">{selectedDisposition.recipient_phone || "-"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <span className="text-[9px] font-bold text-foreground/45 uppercase">Alamat Pengiriman</span>
                      <span className="text-xs font-semibold text-foreground/75">{selectedDisposition.recipient_address || "-"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason Details */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Alasan & Catatan</h4>
                <div className="p-4 bg-primary-light/10 border border-border-peach/50 rounded-2xl flex flex-col gap-2">
                  <p className="text-xs font-semibold text-foreground/85 leading-relaxed">
                    <strong>Alasan:</strong> {selectedDisposition.reason}
                  </p>
                  {selectedDisposition.notes && (
                    <p className="text-xs font-semibold text-foreground/85 leading-relaxed">
                      <strong>Catatan:</strong> {selectedDisposition.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Process History */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Riwayat Proses</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-zinc-50 rounded-xl flex items-center gap-2.5">
                    <User className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase">Diajukan Oleh</span>
                      <span className="text-xs font-black text-foreground">{selectedDisposition.processed_by}</span>
                      <span className="text-[9px] text-foreground/50">{selectedDisposition.created_at}</span>
                    </div>
                  </div>
                  {selectedDisposition.completed_at && (
                    <div className="p-3 bg-zinc-50 rounded-xl flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-secondary" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-foreground/40 uppercase">Selesai Pada</span>
                        <span className="text-xs font-black text-foreground">{selectedDisposition.completed_at}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Aset yang Didisposisi ({selectedDisposition.items.length})</h4>
                <div className="border border-border-peach rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary-light/20 border-b border-border-peach">
                        <th className="p-3.5 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Nama Aset</th>
                        <th className="p-3.5 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">No. Aset</th>
                        <th className="p-3.5 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Kondisi</th>
                        <th className="p-3.5 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Estimasi Nilai</th>
                        <th className="p-3.5 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-peach/40">
                      {selectedDisposition.items.map((it: any, i: number) => (
                        <tr key={i} className="hover:bg-primary-light/5 transition-colors">
                          <td className="p-3.5 text-xs font-extrabold text-foreground">{it.name}</td>
                          <td className="p-3.5 text-xs font-bold text-primary">{it.entries_number}</td>
                          <td className="p-3.5 text-xs">
                            <span className="px-2 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded-full text-[9px] font-black uppercase">
                              {it.condition}
                            </span>
                          </td>
                          <td className="p-3.5 text-xs font-extrabold text-foreground/70">
                            Rp {it.estimated_value.toLocaleString("id-ID")}
                          </td>
                          <td className="p-3.5 text-xs font-semibold text-foreground/50">{it.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border-peach/50 flex-shrink-0">
              <div className="flex gap-2">
                {selectedDisposition.status === "draft" && (
                  <>
                    <button 
                      onClick={() => handleComplete(selectedDisposition.id)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Selesaikan</span>
                    </button>
                    <button 
                      onClick={() => handleCancel(selectedDisposition.id)}
                      className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Batalkan</span>
                    </button>
                  </>
                )}
              </div>

              <button 
                onClick={() => setSelectedDisposition(null)}
                className="px-6 py-2.5 bg-background border border-border-peach text-foreground/75 hover:text-primary rounded-xl font-bold text-xs transition-colors w-full sm:w-auto"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
