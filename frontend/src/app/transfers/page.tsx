"use client";

import { useState, useMemo, useEffect } from "react";
import Pagination from "@/components/ui/Pagination";
import Sidebar from "@/components/layout/Sidebar";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { 
  GitCompare, 
  Plus, 
  Check, 
  X, 
  RefreshCw, 
  Menu, 
  Calendar, 
  Building, 
  MapPin, 
  User, 
  AlertTriangle, 
  FileText,
  Printer,
  ChevronRight,
  ArrowRight,
  PlusCircle,
  Trash,
  Loader2
} from "lucide-react";

export default function TransfersPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null);
  const [rejectionModal, setRejectionModal] = useState<any | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Form State
  const [fromUnit, setFromUnit] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [repeaterItems, setRepeaterItems] = useState<any[]>([]);

  // States loaded from backend
  const [transfers, setTransfers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [transfersResp, u, l] = await Promise.all([
        api.get("/transfers?per_page=9999"),
        api.get("/units/all"),
        api.get("/locations/all"),
      ]);
      setTransfers(transfersResp.data || []);
      setUnits(u || []);
      setLocations(l || []);
    } catch (err) {
      console.error("Failed to load mutation data from backend", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch selectable active assets dynamically when fromLocation changes
  useEffect(() => {
    if (!fromLocation) {
      setAvailableAssets([]);
      return;
    }
    const loadAssets = async () => {
      try {
        setLoadingAssets(true);
        const resp = await api.get(`/assets?location_id=${fromLocation}&status=active&per_page=999`);
        setAvailableAssets(resp.data || []);
      } catch (err) {
        console.error("Failed to fetch available assets for transfer", err);
      } finally {
        setLoadingAssets(false);
      }
    };
    loadAssets();
  }, [fromLocation]);

  // Pagination derived values
  const totalPages = Math.ceil(transfers.length / perPage);
  const paginatedTransfers = useMemo(() => {
    return transfers.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [transfers, currentPage, perPage]);

  // Managers action handlers
  const handleApprove = async (id: number) => {
    try {
      await api.post(`/transfers/${id}/approve`);
      toast.success("Mutasi berhasil disetujui!");
      fetchAllData();
      setSelectedTransfer(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyetujui mutasi");
    }
  };

  const handleReject = async (id: number, reasonText: string) => {
    try {
      await api.post(`/transfers/${id}/reject`, { reason: reasonText });
      toast.success("Mutasi berhasil ditolak!");
      fetchAllData();
      setSelectedTransfer(null);
      setRejectionModal(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal menolak mutasi");
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.post(`/transfers/${id}/complete`);
      toast.success("Mutasi berhasil diselesaikan!");
      fetchAllData();
      setSelectedTransfer(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyelesaikan mutasi");
    }
  };

  // Form actions
  const handleAddRepeaterItem = () => {
    setRepeaterItems([...repeaterItems, { asset_id: "", condition_notes: "" }]);
  };

  const handleRemoveRepeaterItem = (idx: number) => {
    setRepeaterItems(repeaterItems.filter((_, i) => i !== idx));
  };

  const handleSelectAllAssets = () => {
    setRepeaterItems(availableAssets.map(asset => ({
      asset_id: asset.id.toString(),
      condition_notes: "Kondisi bagus"
    })));
  };

  const handleClearAllAssets = () => {
    setRepeaterItems([]);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromUnit || !fromLocation || !toLocation || repeaterItems.length === 0) {
      toast.warning("Mohon lengkapi seluruh field dan tambahkan minimal 1 aset!");
      return;
    }

    try {
      const payload = {
        from_unit_id: Number(fromUnit),
        from_location_id: Number(fromLocation),
        to_location_id: Number(toLocation),
        reason,
        notes,
        asset_ids: repeaterItems.map(item => Number(item.asset_id)),
      };

      await api.post("/transfers", payload);
      toast.success("Mutasi berhasil diajukan!");
      
      // Clear form
      setFromUnit("");
      setFromLocation("");
      setToLocation("");
      setReason("");
      setNotes("");
      setRepeaterItems([]);
      setActiveTab("list");
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengajukan mutasi");
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
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Transfer & Mutasi Aset</h2>
              <p className="text-xs text-foreground/50 font-medium mt-1">Kelola permohonan mutasi aset antar unit/lokasi yayasan.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "list" ? "bg-primary text-white" : "bg-background border border-border-peach text-foreground/70"
              }`}
            >
              Daftar Transfer
            </button>
            <button 
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "create" ? "bg-primary text-white animate-pulse" : "bg-background border border-border-peach text-foreground/70"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Mutasi</span>
            </button>
          </div>
        </header>

        {activeTab === "list" ? (
          /* LIST VIEW */
          <section className="bg-white border border-border-peach rounded-3xl overflow-hidden shadow-card">
            <div className="p-5 border-b border-border-peach flex justify-between items-center bg-primary-light/10">
              <h3 className="text-xs font-black text-primary uppercase tracking-wider">Mutasi Aktif</h3>
              <span className="p-1 text-primary bg-white border border-border-peach rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </span>
            </div>

            <div className="divide-y divide-border-peach/50">
              {paginatedTransfers.map((item) => (
                <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-primary-light/5 transition-colors">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                      <GitCompare className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-foreground">{item.transfer_number}</h4>
                        <span className="text-[9px] font-bold text-foreground/45 bg-zinc-100 px-2 py-0.5 rounded-full">{item.items.length} Aset</span>
                      </div>
                      <p className="text-xs text-foreground/50 font-semibold mt-1">
                        {item.from_unit} ({item.from_location}) &rarr; <span className="text-primary">{item.to_location}</span>
                      </p>
                      <span className="text-[10px] font-bold text-foreground/40 mt-1.5 inline-block">Diajukan: {item.requested_at}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between md:justify-start">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "pending" 
                        ? "bg-amber-50 text-amber-600 border border-amber-100" 
                        : item.status === "approved"
                        ? "bg-sky-50 text-sky-600 border border-sky-100"
                        : item.status === "rejected"
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                      {item.status === "pending" ? "Menunggu Approval" : item.status === "approved" ? "Disetujui" : item.status === "rejected" ? "Ditolak" : "Selesai"}
                    </span>
                    
                    <button 
                      onClick={() => setSelectedTransfer(item)}
                      className="px-4 py-2 bg-primary-light hover:bg-primary-light/80 text-primary text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {paginatedTransfers.length === 0 && (
                <div className="p-8 text-center text-xs font-semibold text-foreground/40">
                  Tidak ada data mutasi aset ditemukan.
                </div>
              )}
            </div>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={transfers.length}
              perPage={perPage}
              onPageChange={setCurrentPage}
              onPerPageChange={setPerPage}
            />
          </section>
        ) : (
          /* CREATE VIEW REPEATER FORM */
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
            
            {/* General Fields */}
            <div className="bg-white border border-border-peach rounded-3xl p-6 sm:p-8 shadow-card flex flex-col gap-6">
              <h3 className="text-sm font-black text-primary uppercase tracking-wider border-b border-border-peach/50 pb-3">Informasi Transfer</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground/75">Dari Unit</label>
                  <select 
                    value={fromUnit}
                    onChange={(e) => {
                      setFromUnit(e.target.value);
                      setFromLocation("");
                      setRepeaterItems([]);
                    }}
                    className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
                    required
                  >
                    <option value="">Pilih Unit...</option>
                    <option value="Kantor Pusat">Kantor Pusat</option>
                    <option value="Unit Humas">Unit Humas</option>
                    <option value="Kelas VII-A">Kelas VII-A</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground/75">Dari Lokasi</label>
                  <select 
                    value={fromLocation}
                    onChange={(e) => {
                      setFromLocation(e.target.value);
                      setRepeaterItems([]);
                    }}
                    disabled={!fromUnit}
                    className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                    required
                  >
                    <option value="">Pilih Lokasi...</option>
                    {fromUnit === "Unit Humas" && <option value="Ruang Humas">Ruang Humas</option>}
                    {fromUnit === "Kantor Pusat" && <option value="Ruang Rapat Utama">Ruang Rapat Utama</option>}
                    {fromUnit === "Kelas VII-A" && <option value="Kelas VII-A">Kelas VII-A</option>}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground/75">Ke Lokasi (Tujuan)</label>
                  <select 
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
                    required
                  >
                    <option value="">Pilih Lokasi Gudang...</option>
                    <option value="Gudang Yayasan Utama">Gudang Yayasan Utama</option>
                    <option value="Gudang Sarpras Belakang">Gudang Sarpras Belakang</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground/75">Alasan Transfer</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Contoh: AC rusak berat, dipindahkan untuk perbaikan..."
                    className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-foreground/75">Catatan Tambahan</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Catatan tambahan lainnya (opsional)..."
                    className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Assets Repeater Section */}
            {fromLocation && (
              <div className="bg-white border border-border-peach rounded-3xl p-6 sm:p-8 shadow-card flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-border-peach/50 pb-3 flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-black text-primary uppercase tracking-wider">Pilih Aset untuk Transfer</h3>
                    <p className="text-[10px] text-foreground/45 mt-0.5">Lokasi: {fromLocation} | Tersedia: {availableAssets.length} Aset</p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={handleSelectAllAssets}
                      className="px-3.5 py-1.5 bg-secondary-light text-secondary border border-secondary/20 text-[10px] font-bold rounded-xl transition-all"
                    >
                      Pilih Semua Aset
                    </button>
                    <button 
                      type="button"
                      onClick={handleClearAllAssets}
                      className="px-3.5 py-1.5 bg-red-50 text-red-500 border border-red-100 text-[10px] font-bold rounded-xl transition-all"
                    >
                      Hapus Semua
                    </button>
                  </div>
                </div>

                {/* Repeater Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repeaterItems.map((item, idx) => (
                    <div key={idx} className="p-4 bg-background border border-border-peach rounded-2xl relative flex flex-col gap-3 group">
                      <button 
                        type="button"
                        onClick={() => handleRemoveRepeaterItem(idx)}
                        className="absolute top-3 right-3 text-foreground/40 hover:text-red-500 transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-foreground/60 uppercase">Pilih Aset</label>
                        <select 
                          value={item.asset_id}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRepeaterItems(repeaterItems.map((it, i) => i === idx ? { ...it, asset_id: val } : it));
                          }}
                          className="w-full px-3 py-2 bg-white border border-border-peach rounded-xl text-xs font-semibold focus:outline-none focus:border-primary transition-all"
                          required
                        >
                          <option value="">{loadingAssets ? "Memuat aset..." : "Pilih Aset..."}</option>
                          {availableAssets.map(asset => (
                            <option key={asset.id} value={asset.id.toString()}>
                              {asset.name} ({asset.entries_number})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-foreground/60 uppercase">Catatan Kondisi</label>
                        <input 
                          type="text"
                          value={item.condition_notes}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRepeaterItems(repeaterItems.map((it, i) => i === idx ? { ...it, condition_notes: val } : it));
                          }}
                          placeholder="Catatan kondisi (opsional)..."
                          className="w-full px-3 py-2 bg-white border border-border-peach rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  type="button"
                  onClick={handleAddRepeaterItem}
                  className="flex items-center justify-center gap-1.5 py-3 border-2 border-dashed border-border-peach hover:border-primary hover:text-primary text-foreground/45 rounded-2xl transition-all text-xs font-bold mt-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tambah Aset ke Daftar</span>
                </button>

                <div className="flex justify-between items-center text-xs font-bold text-foreground/50 border-t border-border-peach/50 pt-4">
                  <span>{repeaterItems.length} Aset Terpilih</span>
                </div>
              </div>
            )}

            {/* Form Footer */}
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
                Ajukan Transfer Aset
              </button>
            </div>
          </form>
        )}

      </main>

      {/* Detail view Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-3xl max-h-[85vh] p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-300 overflow-hidden">
            <button 
              onClick={() => setSelectedTransfer(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                <GitCompare className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-extrabold text-foreground font-serif leading-none">{selectedTransfer.transfer_number}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    selectedTransfer.status === "pending" 
                      ? "bg-amber-50 text-amber-600 border border-amber-100" 
                      : selectedTransfer.status === "approved"
                      ? "bg-sky-50 text-sky-600 border border-sky-100"
                      : selectedTransfer.status === "rejected"
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {selectedTransfer.status === "pending" ? "Pending" : selectedTransfer.status === "approved" ? "Disetujui" : selectedTransfer.status === "rejected" ? "Ditolak" : "Selesai"}
                  </span>
                </div>
                <p className="text-xs text-foreground/50 font-semibold mt-2">
                  Mutasi perpindahan fisik inventaris aset.
                </p>
              </div>
            </div>

            <hr className="border-border-peach/50" />

            {/* Details Panel */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-1">
              
              {/* Route Info */}
              <div className="bg-background border border-border-peach rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-evenly gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase">Dari Lokasi</span>
                  <span className="text-xs font-black text-foreground mt-1">{selectedTransfer.from_unit}</span>
                  <span className="text-[10px] text-foreground/50">{selectedTransfer.from_location}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase">Ke Lokasi</span>
                  <span className="text-xs font-black text-foreground mt-1">Yayasan</span>
                  <span className="text-[10px] text-foreground/50">{selectedTransfer.to_location}</span>
                </div>
              </div>

              {/* Reason Description */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Alasan & Catatan</h4>
                <div className="p-4 bg-primary-light/10 border border-border-peach/50 rounded-2xl flex flex-col gap-2">
                  <p className="text-xs font-semibold text-foreground/80 leading-relaxed">
                    <strong>Alasan:</strong> {selectedTransfer.reason}
                  </p>
                  {selectedTransfer.notes && (
                    <p className="text-xs font-semibold text-foreground/80 leading-relaxed">
                      <strong>Catatan:</strong> {selectedTransfer.notes}
                    </p>
                  )}
                  {selectedTransfer.rejection_reason && (
                    <p className="text-xs font-black text-red-500 leading-relaxed border-t border-red-100 pt-2 mt-1">
                      ❌ <strong>Alasan Penolakan:</strong> {selectedTransfer.rejection_reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline Log */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Timeline Proses</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-zinc-50 rounded-xl flex items-center gap-2.5">
                    <User className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase">Diajukan Oleh</span>
                      <span className="text-xs font-black text-foreground">{selectedTransfer.requested_by}</span>
                      <span className="text-[9px] text-foreground/50">{selectedTransfer.requested_at}</span>
                    </div>
                  </div>
                  {selectedTransfer.approved_by && (
                    <div className="p-3 bg-zinc-50 rounded-xl flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-secondary" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-foreground/40 uppercase">Diproses Oleh</span>
                        <span className="text-xs font-black text-foreground">{selectedTransfer.approved_by}</span>
                        <span className="text-[9px] text-foreground/50">{selectedTransfer.completed_at || "Telah disetujui"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Aset yang Ditransfer ({selectedTransfer.items.length})</h4>
                <div className="border border-border-peach rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary-light/20 border-b border-border-peach">
                        <th className="p-3.5 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Nama Aset</th>
                        <th className="p-3.5 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">No. Aset</th>
                        <th className="p-3.5 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Merk</th>
                        <th className="p-3.5 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Kondisi</th>
                        <th className="p-3.5 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-peach/40">
                      {selectedTransfer.items.map((it: any, i: number) => (
                        <tr key={i} className="hover:bg-primary-light/5 transition-colors">
                          <td className="p-3.5 text-xs font-extrabold text-foreground">{it.name}</td>
                          <td className="p-3.5 text-xs font-bold text-primary">{it.entries_number}</td>
                          <td className="p-3.5 text-xs font-semibold text-foreground/60">{it.brand}</td>
                          <td className="p-3.5 text-xs">
                            <span className="px-2 py-0.5 bg-secondary-light text-secondary border border-secondary/20 rounded-full text-[9px] font-black uppercase">
                              {it.condition}
                            </span>
                          </td>
                          <td className="p-3.5 text-xs font-semibold text-foreground/50">{it.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer / Manager Control Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border-peach/50 flex-shrink-0">
              <div className="flex gap-2">
                {selectedTransfer.status === "pending" && (
                  <>
                    <button 
                      onClick={() => handleApprove(selectedTransfer.id)}
                      className="px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui</span>
                    </button>
                    <button 
                      onClick={() => setRejectionModal(selectedTransfer.id)}
                      className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  </>
                )}

                {selectedTransfer.status === "approved" && (
                  <button 
                    onClick={() => handleComplete(selectedTransfer.id)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Selesaikan</span>
                  </button>
                )}

                {["approved", "completed"].includes(selectedTransfer.status) && (
                  <button 
                    onClick={() => {
                      toast.info("Membuka dialog cetak Berita Acara...");
                      window.print();
                    }}
                    className="px-4 py-2.5 bg-background border border-border-peach hover:border-primary/50 text-foreground/75 hover:text-primary rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak BA</span>
                  </button>
                )}
              </div>

              <button 
                onClick={() => setSelectedTransfer(null)}
                className="px-6 py-2.5 bg-background border border-border-peach text-foreground/75 hover:text-primary rounded-xl font-bold text-xs transition-colors w-full sm:w-auto"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal Reason Input */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border-peach rounded-2xl max-w-sm w-full p-5 shadow-xl flex flex-col gap-4">
            <h4 className="text-sm font-extrabold text-foreground font-serif">Alasan Penolakan</h4>
            <textarea 
              id="rejection-reason-input"
              rows={3} 
              placeholder="Masukkan alasan mengapa permohonan mutasi ditolak..."
              className="w-full p-3 bg-background border border-border-peach rounded-xl text-xs font-semibold"
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setRejectionModal(null)}
                className="px-4 py-2 bg-background border border-border-peach rounded-lg text-xs font-bold"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  const val = (document.getElementById("rejection-reason-input") as HTMLTextAreaElement).value;
                  handleReject(rejectionModal, val || "Tidak ada alasan spesifik.");
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold"
              >
                Kirim Penolakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
