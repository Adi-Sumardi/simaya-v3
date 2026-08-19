"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
  User, 
  Printer, 
  ChevronRight, 
  ArrowRight, 
  PlusCircle, 
  Trash, 
  Loader2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TransfersPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null);
  const [rejectionModal, setRejectionModal] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

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
      setRejectionReason("");
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
      toast.error("Mohon lengkapi seluruh field dan tambahkan minimal 1 aset!");
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
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 w-full min-h-screen pb-16">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-2xl shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Transfer & Mutasi Aset</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Kelola permohonan mutasi aset antar unit/lokasi yayasan.</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="h-11 rounded-2xl p-1 bg-muted/60">
              <TabsTrigger value="list" className="rounded-xl px-4 text-xs font-bold">
                Daftar Transfer
              </TabsTrigger>
              <TabsTrigger value="create" className="rounded-xl px-4 text-xs font-bold gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Ajukan Mutasi</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {activeTab === "list" ? (
          /* LIST VIEW */
          <Card className="rounded-3xl shadow-sm overflow-hidden">
            <CardHeader className="p-5 border-b border-border flex flex-row justify-between items-center bg-muted/20">
              <CardTitle className="text-xs font-black text-primary uppercase tracking-wider">Mutasi Aktif</CardTitle>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchAllData}
                className="h-8 w-8 rounded-xl text-primary"
                title="Refresh data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {paginatedTransfers.map((item) => (
                  <div key={item.id} className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary border border-primary/20 flex items-center justify-center shrink-0">
                        <GitCompare className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-foreground font-serif">{item.transfer_number}</h4>
                          <Badge variant="outline" className="text-[10px] font-bold bg-muted/60">
                            {item.items?.length || 0} Aset
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-semibold mt-1">
                          {item.from_unit || item.from_unit_name} ({item.from_location || item.from_location_name}) &rarr; <span className="text-primary font-bold">{item.to_location || item.to_location_name}</span>
                        </p>
                        <span className="text-[10px] font-semibold text-muted-foreground mt-1 inline-block">
                          Diajukan: {item.requested_at || new Date(item.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between md:justify-start shrink-0">
                      <Badge
                        variant={
                          item.status === "pending" 
                            ? "warning" 
                            : item.status === "approved"
                            ? "info"
                            : item.status === "rejected"
                            ? "destructive"
                            : "success"
                        }
                        className="text-[10px] font-bold uppercase tracking-wider"
                      >
                        {item.status === "pending" ? "Menunggu Approval" : item.status === "approved" ? "Disetujui" : item.status === "rejected" ? "Ditolak" : "Selesai"}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary-light"
                        >
                          <Link href={`/transfers/berita-acara/${item.id}`} target="_blank">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Berita Acara</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTransfer(item)}
                          className="bg-primary-light text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold gap-1"
                        >
                          <span>Detail</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {paginatedTransfers.length === 0 && (
                  <div className="p-12 text-center text-xs font-semibold text-muted-foreground">
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
            </CardContent>
          </Card>
        ) : (
          /* CREATE VIEW REPEATER FORM */
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
            
            {/* General Fields */}
            <Card className="rounded-3xl shadow-sm">
              <CardHeader className="p-6 pb-4 border-b border-border">
                <CardTitle className="text-sm font-black text-primary uppercase tracking-wider">Informasi Transfer</CardTitle>
                <CardDescription className="text-xs">Tentukan asal unit dan lokasi tujuan mutasi aset.</CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="from-unit">Dari Unit</Label>
                    <select 
                      id="from-unit"
                      value={fromUnit}
                      onChange={(e) => {
                        setFromUnit(e.target.value);
                        setFromLocation("");
                        setRepeaterItems([]);
                      }}
                      className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      required
                    >
                      <option value="">Pilih Unit...</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="from-loc">Dari Lokasi</Label>
                    <select 
                      id="from-loc"
                      value={fromLocation}
                      onChange={(e) => {
                        setFromLocation(e.target.value);
                        setRepeaterItems([]);
                      }}
                      disabled={!fromUnit}
                      className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                      required
                    >
                      <option value="">Pilih Lokasi...</option>
                      {locations.filter(l => !fromUnit || String(l.unit_id) === String(fromUnit)).map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="to-loc">Ke Lokasi (Tujuan)</Label>
                    <select 
                      id="to-loc"
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      required
                    >
                      <option value="">Pilih Lokasi Tujuan...</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.unit?.name ? `${l.unit.name} - ` : ""}{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="transfer-reason">Alasan Transfer</Label>
                    <Textarea 
                      id="transfer-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      placeholder="Contoh: AC rusak berat, dipindahkan untuk perbaikan..."
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="transfer-notes">Catatan Tambahan</Label>
                    <Textarea 
                      id="transfer-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Catatan tambahan lainnya (opsional)..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assets Repeater Section */}
            {fromLocation && (
              <Card className="rounded-3xl shadow-sm">
                <CardHeader className="p-6 pb-4 border-b border-border flex flex-row justify-between items-center flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-sm font-black text-primary uppercase tracking-wider">Pilih Aset untuk Transfer</CardTitle>
                    <CardDescription className="text-xs">Tersedia: {availableAssets.length} Aset di lokasi terpilih</CardDescription>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllAssets}
                      className="text-secondary border-secondary/30 hover:bg-secondary-light/40 rounded-xl text-xs"
                    >
                      Pilih Semua Aset
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllAssets}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl text-xs"
                    >
                      Hapus Semua
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 flex flex-col gap-4">
                  {/* Repeater Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repeaterItems.map((item, idx) => (
                      <div key={idx} className="p-4 bg-muted/30 border border-border rounded-2xl relative flex flex-col gap-3 group">
                        <Button 
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRepeaterItem(idx)}
                          className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>

                        <div className="flex flex-col gap-1.5">
                          <Label className="text-[10px]">Pilih Aset</Label>
                          <select 
                            value={item.asset_id}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRepeaterItems(repeaterItems.map((it, i) => i === idx ? { ...it, asset_id: val } : it));
                            }}
                            className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                          <Label className="text-[10px]">Catatan Kondisi</Label>
                          <Input 
                            type="text"
                            value={item.condition_notes}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRepeaterItems(repeaterItems.map((it, i) => i === idx ? { ...it, condition_notes: val } : it));
                            }}
                            placeholder="Catatan kondisi (opsional)..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleAddRepeaterItem}
                    className="border-dashed border-2 rounded-2xl h-12 gap-2 text-xs font-bold"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Tambah Aset ke Daftar</span>
                  </Button>

                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground border-t border-border pt-3 mt-1">
                    <span>{repeaterItems.length} Aset Terpilih</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form Footer */}
            <div className="flex justify-end gap-3 shrink-0">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setActiveTab("list")}
                className="rounded-xl px-6"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="rounded-xl px-6 shadow-md shadow-primary/20"
              >
                Ajukan Transfer Aset
              </Button>
            </div>
          </form>
        )}

      </main>

      {/* Detail view Modal */}
      <Dialog open={!!selectedTransfer} onOpenChange={(open) => !open && setSelectedTransfer(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] rounded-3xl p-6 overflow-hidden flex flex-col gap-4">
          {selectedTransfer && (
            <>
              {/* Modal Header */}
              <div className="flex gap-4 items-start pb-2 border-b border-border">
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary border border-primary/20 flex items-center justify-center shrink-0">
                  <GitCompare className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-extrabold text-foreground font-serif leading-none">{selectedTransfer.transfer_number}</h3>
                    <Badge
                      variant={
                        selectedTransfer.status === "pending" 
                          ? "warning" 
                          : selectedTransfer.status === "approved"
                          ? "info"
                          : selectedTransfer.status === "rejected"
                          ? "destructive"
                          : "success"
                      }
                      className="text-[9px] font-bold uppercase tracking-wider"
                    >
                      {selectedTransfer.status === "pending" ? "Pending" : selectedTransfer.status === "approved" ? "Disetujui" : selectedTransfer.status === "rejected" ? "Ditolak" : "Selesai"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    Mutasi perpindahan fisik inventaris aset.
                  </p>
                </div>
              </div>

              {/* Details Panel */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1">
                
                {/* Route Info */}
                <div className="bg-muted/30 border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-evenly gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Dari Lokasi</span>
                    <span className="text-xs font-black text-foreground mt-0.5">{selectedTransfer.from_unit || selectedTransfer.from_unit_name}</span>
                    <span className="text-[10px] text-muted-foreground">{selectedTransfer.from_location || selectedTransfer.from_location_name}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Ke Lokasi</span>
                    <span className="text-xs font-black text-foreground mt-0.5">Yayasan</span>
                    <span className="text-[10px] text-muted-foreground">{selectedTransfer.to_location || selectedTransfer.to_location_name}</span>
                  </div>
                </div>

                {/* Reason Description */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Alasan & Catatan</h4>
                  <div className="p-4 bg-muted/20 border border-border rounded-2xl flex flex-col gap-2">
                    <p className="text-xs font-semibold text-foreground/85 leading-relaxed">
                      <strong>Alasan:</strong> {selectedTransfer.reason}
                    </p>
                    {selectedTransfer.notes && (
                      <p className="text-xs font-semibold text-foreground/85 leading-relaxed">
                        <strong>Catatan:</strong> {selectedTransfer.notes}
                      </p>
                    )}
                    {selectedTransfer.rejection_reason && (
                      <p className="text-xs font-black text-destructive leading-relaxed border-t border-destructive/20 pt-2 mt-1">
                        ❌ <strong>Alasan Penolakan:</strong> {selectedTransfer.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timeline Log */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Timeline Proses</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center gap-2.5">
                      <User className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Diajukan Oleh</span>
                        <span className="text-xs font-black text-foreground">{selectedTransfer.requested_by || "User Unit"}</span>
                        <span className="text-[9px] text-muted-foreground">{selectedTransfer.requested_at || "—"}</span>
                      </div>
                    </div>
                    {selectedTransfer.approved_by && (
                      <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-secondary shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Diproses Oleh</span>
                          <span className="text-xs font-black text-foreground">{selectedTransfer.approved_by}</span>
                          <span className="text-[9px] text-muted-foreground">{selectedTransfer.completed_at || "Telah disetujui"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Aset yang Ditransfer ({selectedTransfer.items?.length || 0})
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Aset</TableHead>
                        <TableHead>No. Aset</TableHead>
                        <TableHead>Merk</TableHead>
                        <TableHead>Kondisi</TableHead>
                        <TableHead>Catatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransfer.items?.map((it: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-extrabold text-foreground">{it.name}</TableCell>
                          <TableCell className="font-bold text-primary font-mono">{it.entries_number}</TableCell>
                          <TableCell className="text-muted-foreground">{it.brand || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[9px] font-black uppercase">
                              {it.condition || "Bagus"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{it.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Modal Footer / Manager Control Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border shrink-0">
                <div className="flex gap-2">
                  {selectedTransfer.status === "pending" && (
                    <>
                      <Button 
                        onClick={() => handleApprove(selectedTransfer.id)}
                        className="bg-secondary hover:bg-secondary/90 text-white rounded-xl gap-1.5 text-xs font-bold"
                      >
                        <Check className="w-4 h-4" />
                        <span>Setujui</span>
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          setRejectionModal(selectedTransfer.id);
                          setRejectionReason("");
                        }}
                        className="rounded-xl gap-1.5 text-xs font-bold"
                      >
                        <X className="w-4 h-4" />
                        <span>Tolak</span>
                      </Button>
                    </>
                  )}

                  {selectedTransfer.status === "approved" && (
                    <Button 
                      onClick={() => handleComplete(selectedTransfer.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 text-xs font-bold"
                    >
                      <Check className="w-4 h-4" />
                      <span>Selesaikan</span>
                    </Button>
                  )}

                  <Button 
                    variant="outline"
                    onClick={() => window.open(`/transfers/berita-acara/${selectedTransfer.id}`, '_blank')}
                    className="rounded-xl gap-1.5 text-xs font-bold border-primary/40 text-primary hover:bg-primary-light"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Berita Acara (A4)</span>
                  </Button>
                </div>

                <Button 
                  variant="outline"
                  onClick={() => setSelectedTransfer(null)}
                  className="rounded-xl px-5"
                >
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={!!rejectionModal} onOpenChange={(open) => !open && setRejectionModal(null)}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-extrabold font-serif">Alasan Penolakan</DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan alasan mengapa permohonan mutasi aset ini ditolak.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <Textarea 
              rows={3} 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
            />
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setRejectionModal(null)} className="rounded-xl">
              Batal
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleReject(rejectionModal, rejectionReason || "Tidak ada alasan spesifik.")}
              className="rounded-xl"
            >
              Kirim Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
