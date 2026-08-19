"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
  Check, 
  X,
  ClipboardList, 
  FileText, 
  Loader2,
  ChevronRight,
  Printer
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

export default function DispositionsPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");
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
      toast.error("Mohon pilih minimal 1 aset untuk didisposisi!");
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
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Disposisi Aset</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Kelola pencatatan aset yang dihapuskan, dihibahkan, atau disumbangkan.</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="h-11 rounded-2xl p-1 bg-muted/60">
              <TabsTrigger value="list" className="rounded-xl px-4 text-xs font-bold">
                Daftar Disposisi
              </TabsTrigger>
              <TabsTrigger value="create" className="rounded-xl px-4 text-xs font-bold gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Disposisi</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {activeTab === "list" ? (
          /* LIST TABLE */
          <Card className="rounded-3xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Disposisi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jml Aset</TableHead>
                    <TableHead>Penerima</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDispositions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-bold text-primary">{item.disposition_number}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.type === "penghapusan" 
                              ? "destructive" 
                              : item.type === "hibah"
                              ? "warning"
                              : "info"
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{item.items?.length || 0} Aset</TableCell>
                      <TableCell className="text-muted-foreground">{item.recipient_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "draft" 
                              ? "warning" 
                              : item.status === "completed" 
                              ? "success" 
                              : "destructive"
                          }
                          className="text-[10px] font-bold"
                        >
                          {item.status === "draft" ? "Draft" : item.status === "completed" ? "Selesai" : "Dibatalkan"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary-light"
                          >
                            <Link href={`/dispositions/berita-acara/${item.id}`} target="_blank">
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Berita Acara</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDisposition(item)}
                            className="bg-primary-light text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold"
                          >
                            Detail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedDispositions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-12 text-center text-xs font-semibold text-muted-foreground">
                        Tidak ada data disposisi/penghapusan aset.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={dispositions.length}
                perPage={perPage}
                onPageChange={setCurrentPage}
                onPerPageChange={setPerPage}
              />
            </CardContent>
          </Card>
        ) : (
          /* CREATE DISPOSITION FORM */
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
            
            <Card className="rounded-3xl shadow-sm">
              <CardHeader className="p-6 pb-4 border-b border-border">
                <CardTitle className="text-sm font-black text-primary uppercase tracking-wider">Informasi Disposisi</CardTitle>
                <CardDescription className="text-xs">Tentukan jenis penghapusan atau penyaluran aset.</CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disp-type">Tipe Disposisi</Label>
                    <select 
                      id="disp-type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      required
                    >
                      <option value="penghapusan">Penghapusan Aset (Dimusnahkan)</option>
                      <option value="hibah">Hibah Aset (Diberikan Resmi)</option>
                      <option value="sumbangan">Sumbangan Aset</option>
                    </select>
                    <span className="text-[10px] text-muted-foreground italic font-medium px-1">
                      {type === "penghapusan" && "Aset akan dihapus/dimusnahkan dari inventaris aktif."}
                      {type === "hibah" && "Aset akan dihibahkan ke pihak luar secara resmi menggunakan dokumen."}
                      {type === "sumbangan" && "Aset disumbangkan secara sosial ke lembaga lain."}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disp-reason">Alasan Disposisi</Label>
                    <Textarea 
                      id="disp-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      placeholder="Alasan detail penghapusan aset..."
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="disp-notes">Catatan Tambahan</Label>
                  <Textarea 
                    id="disp-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Catatan tambahan (opsional)..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recipient Details */}
            {["hibah", "sumbangan"].includes(type) && (
              <Card className="rounded-3xl shadow-sm animate-in fade-in duration-300">
                <CardHeader className="p-6 pb-4 border-b border-border">
                  <CardTitle className="text-sm font-black text-primary uppercase tracking-wider">Informasi Penerima</CardTitle>
                  <CardDescription className="text-xs">Data identitas pihak penerima hibah / sumbangan.</CardDescription>
                </CardHeader>
                
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="rec-name">Nama Penerima</Label>
                      <Input 
                        id="rec-name"
                        type="text" 
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Nama lengkap penerima..."
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="rec-org">Organisasi / Lembaga</Label>
                      <Input 
                        id="rec-org"
                        type="text" 
                        value={recipientOrg}
                        onChange={(e) => setRecipientOrg(e.target.value)}
                        placeholder="Nama sekolah, panti asuhan, dll..."
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="rec-phone">No. Telepon</Label>
                      <Input 
                        id="rec-phone"
                        type="tel" 
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="08xxxxxxxx..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="rec-address">Alamat Penerima</Label>
                    <Textarea 
                      id="rec-address"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      rows={2}
                      placeholder="Alamat lengkap lokasi penerima hibah/sumbangan..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Supporting Document Section */}
            <Card className="rounded-3xl shadow-sm">
              <CardHeader className="p-6 pb-4 border-b border-border">
                <CardTitle className="text-sm font-black text-primary uppercase tracking-wider">Dokumen Pendukung (SK/Berita Acara)</CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="doc-num">Nomor Surat Keputusan / Dokumen</Label>
                    <Input 
                      id="doc-num"
                      type="text" 
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="Contoh: SK/HB/2026/001"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="doc-date">Tanggal Surat</Label>
                    <Input 
                      id="doc-date"
                      type="date" 
                      value={documentDate}
                      onChange={(e) => setDocumentDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Selection Section */}
            <Card className="rounded-3xl shadow-sm">
              <CardHeader className="p-6 pb-4 border-b border-border flex flex-row justify-between items-center flex-wrap gap-3">
                <div>
                  <CardTitle className="text-sm font-black text-primary uppercase tracking-wider">Pilih Aset untuk Disposisi</CardTitle>
                  <CardDescription className="text-xs">Daftar aset yang telah ditransfer ke Gudang Yayasan</CardDescription>
                </div>
                
                <select 
                  onChange={(e) => handleSelectAsset(e.target.value)}
                  className="flex h-10 w-full sm:w-72 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">{loadingAssets ? "Memuat aset..." : "Pilih Aset untuk Ditambahkan..."}</option>
                  {availableTransferredAssets.map(a => (
                    <option key={a.id} value={a.id.toString()}>
                      {a.name} ({a.entries_number}) - {a.brand}
                    </option>
                  ))}
                </select>
              </CardHeader>

              <CardContent className="p-6">
                {/* Selected Assets Grid */}
                {selectedAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl gap-2">
                    <ClipboardList className="w-10 h-10 text-muted-foreground/30" />
                    <span className="text-xs font-bold text-muted-foreground">Belum ada aset dipilih.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAssets.map((asset) => (
                      <div key={asset.id} className="p-4 bg-muted/30 border border-border rounded-2xl relative flex flex-col gap-3">
                        <Button 
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>

                        <div className="flex justify-between items-start pr-6">
                          <div>
                            <h4 className="text-xs font-black text-foreground">{asset.name}</h4>
                            <span className="text-[10px] font-bold text-primary">{asset.entries_number}</span>
                          </div>
                          <span className="text-xs font-extrabold text-muted-foreground">Rp {asset.price?.toLocaleString("id-ID") || 0}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <Label className="text-[9px]">Estimasi Nilai</Label>
                            <Input 
                              type="number" 
                              value={asset.estimated_value}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setSelectedAssets(selectedAssets.map(a => a.id === asset.id ? { ...a, estimated_value: val } : a));
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-[9px]">Catatan Kondisi</Label>
                            <Input 
                              type="text" 
                              value={asset.condition_notes}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSelectedAssets(selectedAssets.map(a => a.id === asset.id ? { ...a, condition_notes: val } : a));
                              }}
                              placeholder="Catatan..."
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
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
                Simpan Draft Disposisi
              </Button>
            </div>

          </form>
        )}

      </main>

      {/* Detail View Modal */}
      <Dialog open={!!selectedDisposition} onOpenChange={(open) => !open && setSelectedDisposition(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] rounded-3xl p-6 overflow-hidden flex flex-col gap-4">
          {selectedDisposition && (
            <>
              {/* Modal Header */}
              <div className="flex gap-4 items-start pb-2 border-b border-border">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-extrabold text-foreground font-serif leading-none">{selectedDisposition.disposition_number}</h3>
                    <Badge
                      variant={
                        selectedDisposition.type === "penghapusan" 
                          ? "destructive" 
                          : "warning"
                      }
                      className="text-[9px] font-bold uppercase tracking-wider"
                    >
                      {selectedDisposition.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    Penghapusan atau penyerahan fisik aset inventaris yayasan.
                  </p>
                </div>
              </div>

              {/* Detail Panel */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1">
                
                {/* Document Reference Info */}
                <div className="bg-muted/30 border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2.5 flex-1">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Nomor Surat Keputusan (SK)</span>
                      <span className="text-xs font-black text-foreground mt-0.5">{selectedDisposition.document_number}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-1">
                    <Calendar className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Tanggal SK</span>
                      <span className="text-xs font-black text-foreground mt-0.5">{selectedDisposition.document_date}</span>
                    </div>
                  </div>
                </div>

                {/* Recipient Details */}
                {["hibah", "sumbangan"].includes(selectedDisposition.type) && (
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Informasi Penerima</h4>
                    <div className="p-4 bg-muted/20 border border-border rounded-2xl grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Nama Lengkap</span>
                        <span className="text-xs font-black text-foreground">{selectedDisposition.recipient_name}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Organisasi</span>
                        <span className="text-xs font-black text-foreground">{selectedDisposition.recipient_org || "-"}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Kontak Telepon</span>
                        <span className="text-xs font-black text-foreground">{selectedDisposition.recipient_phone || "-"}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 col-span-2">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Alamat Pengiriman</span>
                        <span className="text-xs font-semibold text-foreground/80">{selectedDisposition.recipient_address || "-"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason Details */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Alasan & Catatan</h4>
                  <div className="p-4 bg-muted/20 border border-border rounded-2xl flex flex-col gap-2">
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
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Riwayat Proses</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center gap-2.5">
                      <User className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Diajukan Oleh</span>
                        <span className="text-xs font-black text-foreground">{selectedDisposition.processed_by || "User Unit"}</span>
                        <span className="text-[9px] text-muted-foreground">{selectedDisposition.created_at || "—"}</span>
                      </div>
                    </div>
                    {selectedDisposition.completed_at && (
                      <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-secondary shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Selesai Pada</span>
                          <span className="text-xs font-black text-foreground">{selectedDisposition.completed_at}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Aset yang Didisposisi ({selectedDisposition.items?.length || 0})
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Aset</TableHead>
                        <TableHead>No. Aset</TableHead>
                        <TableHead>Kondisi</TableHead>
                        <TableHead>Estimasi Nilai</TableHead>
                        <TableHead>Catatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDisposition.items?.map((it: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-extrabold text-foreground">{it.name}</TableCell>
                          <TableCell className="font-bold text-primary font-mono">{it.entries_number}</TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="text-[9px] font-black uppercase">
                              {it.condition || "Rusak"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-extrabold text-foreground/80">
                            Rp {it.estimated_value?.toLocaleString("id-ID") || 0}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{it.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

              </div>

              {/* Modal Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border shrink-0">
                <div className="flex flex-wrap gap-2">
                  {selectedDisposition.status === "draft" && (
                    <>
                      <Button 
                        onClick={() => handleComplete(selectedDisposition.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 text-xs font-bold"
                      >
                        <Check className="w-4 h-4" />
                        <span>Selesaikan</span>
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleCancel(selectedDisposition.id)}
                        className="rounded-xl gap-1.5 text-xs font-bold"
                      >
                        <X className="w-4 h-4" />
                        <span>Batalkan</span>
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`/dispositions/berita-acara/${selectedDisposition.id}`, '_blank')}
                    className="rounded-xl gap-1.5 text-xs font-bold border-primary/40 text-primary hover:bg-primary-light"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Berita Acara (A4)</span>
                  </Button>
                </div>

                <Button 
                  variant="outline"
                  onClick={() => setSelectedDisposition(null)}
                  className="rounded-xl px-5"
                >
                  Tutup
                </Button>
              </div>

            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
