"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { 
  MapPin, 
  Plus, 
  Building, 
  Menu, 
  X, 
  Info, 
  Search, 
  Edit, 
  Trash, 
  QrCode, 
  FileText, 
  Loader2,
  Printer,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function LocationsPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(9); // 9 matches 3-column grid nicely

  // Print modals state
  const [locationQrModal, setLocationQrModal] = useState<any | null>(null);
  const [assetsQrModal, setAssetsQrModal] = useState<any | null>(null);

  // States loaded from backend
  const [mockUnits, setMockUnits] = useState<any[]>([]);
  const [mockCategories, setMockCategories] = useState<any[]>([]);
  const [mockTools, setMockTools] = useState<any[]>([]);
  const [mockYears, setMockYears] = useState<any[]>([]);
  const [mockAktiva, setMockAktiva] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [u, l, c, t, y, a, usrs] = await Promise.all([
        api.get("/units/all"),
        api.get("/locations/all"),
        api.get("/categories/all"),
        api.get("/tools/all"),
        api.get("/years/all"),
        api.get("/aktivas/all"),
        api.get("/users/all"),
      ]);
      setMockUnits(u || []);
      setRooms(l || []);
      setMockCategories(c || []);
      setMockTools(t || []);
      setMockYears(y || []);
      setMockAktiva(a || []);
      setUsers(usrs || []);
    } catch (err) {
      console.error("Failed to load locations from backend", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Create Form State
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newFloor, setNewFloor] = useState("");
  const [newUnitId, setNewUnitId] = useState("");

  // Select first unit once metadata is loaded
  useEffect(() => {
    if (mockUnits.length > 0 && !newUnitId) {
      setNewUnitId(String(mockUnits[0]?.id || "1"));
    }
  }, [mockUnits]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedUser = localStorage.getItem("auth_user");
      const loggedUserId = loggedUser ? JSON.parse(loggedUser).id : (users[0]?.id || 1);

      await api.post("/locations", {
        name: newName,
        number: newNumber || `LOK-${Math.floor(100 + Math.random() * 900)}`,
        floor: newFloor || "Lantai 1",
        unit_id: Number(newUnitId),
        user_id: Number(loggedUserId)
      });

      setNewName("");
      setNewNumber("");
      setNewFloor("");
      setNewUnitId(mockUnits[0]?.id ? String(mockUnits[0].id) : "");
      setCreateModal(false);
      toast.success("Lokasi berhasil ditambahkan!");
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan lokasi");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedUser = localStorage.getItem("auth_user");
      const loggedUserId = loggedUser ? JSON.parse(loggedUser).id : (users[0]?.id || 1);

      await api.put(`/locations/${editModal.id}`, {
        name: editModal.name,
        number: editModal.number,
        floor: editModal.floor,
        unit_id: Number(editModal.unit_id),
        user_id: Number(editModal.user_id || loggedUserId)
      });

      setEditModal(null);
      toast.success("Lokasi berhasil diperbarui!");
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui lokasi");
    }
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.confirm("Apakah Anda yakin ingin menghapus lokasi/ruangan ini?", async () => {
      try {
        await api.delete(`/locations/${id}`);
        toast.success("Lokasi berhasil dihapus!");
        fetchAllData();
      } catch (err: any) {
        toast.error(err.message || "Gagal menghapus lokasi");
      }
    });
  };

  const handleOpenDetail = async (room: any) => {
    try {
      setLoadingAssets(true);
      setSelectedLocation({ ...room, assets: [] });
      const resp = await api.get(`/assets?location_id=${room.id}&per_page=9999`);
      setSelectedLocation({ ...room, assets: resp.data || [] });
    } catch (err) {
      console.error("Failed to load location assets dynamically", err);
    } finally {
      setLoadingAssets(false);
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(
      r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.unit?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  const totalPages = Math.ceil(filteredRooms.length / perPage);
  const paginatedRooms = useMemo(() => {
    return filteredRooms.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [filteredRooms, currentPage, perPage]);

  return (
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-screen w-full">
        
        {/* Header Section */}
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
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Lokasi & Ruangan</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Kelola pembagian ruangan dan lokasi aset di yayasan.</p>
            </div>
          </div>
          <Button 
            onClick={() => setCreateModal(true)}
            className="rounded-2xl gap-2 h-11 px-5 shadow-md shadow-primary/20 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lokasi</span>
          </Button>
        </header>

        {/* Filter and Search */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari lokasi, nomor lokasi, atau unit kerja..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 h-11 rounded-xl text-xs bg-muted/30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Locations Grid */}
        <section className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {paginatedRooms.map((room) => (
              <Card 
                key={room.id} 
                onClick={() => handleOpenDetail(room)}
                className="rounded-3xl hover:shadow-md hover:border-primary/40 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="primaryLight" className="text-xs font-bold rounded-full px-2.5 py-1">
                        {room.assets_count || 0} Aset
                      </Badge>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg border border-border text-emerald-600 hover:bg-emerald-500/10"
                        title="Buka / Cetak QR Ruangan"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/guest-data-asset-ruangan/${room.id}`}>
                          <QrCode className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModal(room);
                        }}
                        className="h-8 w-8 rounded-lg border border-border"
                        title="Ubah Ruangan"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(room.id, e)}
                        className="h-8 w-8 rounded-lg border border-border text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Hapus Ruangan"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-foreground font-serif group-hover:text-primary transition-colors">{room.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono font-bold bg-muted/60 text-primary border-primary/20">
                      {room.number}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-2">
                    <Building className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    <span>{room.unit_name} &bull; {room.floor}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 border-t border-border pt-3 mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    <span>Klik untuk Detail & Relasi Aset</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {paginatedRooms.length === 0 && (
              <Card className="col-span-full rounded-3xl p-12 text-center text-xs font-bold text-muted-foreground">
                Tidak ada lokasi ruangan ditemukan.
              </Card>
            )}
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRooms.length}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
            perPageOptions={[9, 18, 36, 99]}
          />
        </section>

      </main>

      {/* Create Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Tambah Lokasi / Ruangan</DialogTitle>
            <DialogDescription className="text-xs">Isi formulir untuk menambahkan ruangan aset baru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loc-name">Nama Lokasi</Label>
              <Input 
                id="loc-name"
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Ruang Humas..." 
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loc-num">Nomor Lokasi</Label>
              <Input 
                id="loc-num"
                type="text" 
                value={newNumber} 
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="Contoh: LOK-006" 
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loc-floor">Lantai</Label>
              <Input 
                id="loc-floor"
                type="text" 
                value={newFloor} 
                onChange={(e) => setNewFloor(e.target.value)}
                placeholder="Contoh: Lantai 1 atau Lantai Ground..." 
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loc-unit">Unit Kerja Terkait</Label>
              <select
                id="loc-unit"
                value={newUnitId}
                onChange={(e) => setNewUnitId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                {mockUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModal(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="rounded-xl">
                Simpan Lokasi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={(open) => !open && setEditModal(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Ubah Lokasi / Ruangan</DialogTitle>
            <DialogDescription className="text-xs">Perbarui informasi lokasi ruangan aset.</DialogDescription>
          </DialogHeader>
          {editModal && (
            <form onSubmit={handleEdit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-name">Nama Lokasi</Label>
                <Input 
                  id="edit-name"
                  type="text" 
                  value={editModal.name} 
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-num">Nomor Lokasi</Label>
                <Input 
                  id="edit-num"
                  type="text" 
                  value={editModal.number} 
                  onChange={(e) => setEditModal({ ...editModal, number: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-floor">Lantai</Label>
                <Input 
                  id="edit-floor"
                  type="text" 
                  value={editModal.floor} 
                  onChange={(e) => setEditModal({ ...editModal, floor: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-unit">Unit Kerja Terkait</Label>
                <select
                  id="edit-unit"
                  value={editModal.unit_id}
                  onChange={(e) => setEditModal({ ...editModal, unit_id: Number(e.target.value) })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {mockUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <DialogFooter className="mt-2">
                <Button type="button" variant="outline" onClick={() => setEditModal(null)} className="rounded-xl">
                  Batal
                </Button>
                <Button type="submit" className="rounded-xl">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Relational Assets Detail Modal */}
      <Dialog open={!!selectedLocation} onOpenChange={(open) => !open && setSelectedLocation(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] rounded-3xl p-6 overflow-hidden flex flex-col gap-4">
          {selectedLocation && (
            <>
              {/* Room Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-extrabold text-foreground font-serif leading-none">{selectedLocation.name}</h3>
                      <Badge variant="primaryLight" className="text-xs font-bold">
                        {selectedLocation.number}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                      {selectedLocation.building || selectedLocation.unit_name} &bull; {selectedLocation.floor}
                    </p>
                  </div>
                </div>

                <Button asChild variant="outline" className="rounded-2xl gap-2 text-xs font-bold shrink-0">
                  <Link href={`/guest-data-asset-ruangan/${selectedLocation.id}`} target="_blank">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Buka / Cetak QR Ruangan</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                </Button>
              </div>

              {/* AssetsRelationManager Table */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3">
                <div>
                  <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-0.5">Daftar Relasi Aset</h4>
                  <p className="text-[10px] text-muted-foreground font-medium">Aset yang saat ini ditempatkan di {selectedLocation.name}</p>
                </div>

                {loadingAssets ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">Memuat data aset...</span>
                  </div>
                ) : selectedLocation.assets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl gap-3">
                    <Building className="w-10 h-10 text-muted-foreground/30" />
                    <span className="text-xs font-bold text-muted-foreground">Tidak ada aset terdaftar di ruangan ini.</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Foto</TableHead>
                        <TableHead>Nama Aset</TableHead>
                        <TableHead>No. Aset</TableHead>
                        <TableHead>Merk</TableHead>
                        <TableHead>Kondisi</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedLocation.assets.map((asset: any) => (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <div className="w-9 h-9 rounded-xl bg-primary-light/40 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary font-serif">
                              {asset.name.substring(0, 2).toUpperCase()}
                            </div>
                          </TableCell>
                          <TableCell className="font-extrabold text-foreground">{asset.name}</TableCell>
                          <TableCell className="font-bold text-primary font-mono">{asset.entries_number}</TableCell>
                          <TableCell className="text-muted-foreground">{asset.brand || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={asset.condition === "bagus" ? "success" : "destructive"} className="text-[10px] font-bold">
                              {asset.condition === "bagus" ? "Bagus" : "Rusak"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                asset.status === "active" 
                                  ? "success" 
                                  : asset.status === "repaired" 
                                  ? "warning" 
                                  : "destructive"
                              } 
                              className="text-[10px] font-bold uppercase"
                            >
                              {asset.status === "active" ? "Aktif" : asset.status === "repaired" ? "Diperbaiki" : "Tidak Aktif"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between items-center flex-wrap gap-2 pt-3 border-t border-border shrink-0">
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Unduhan Aset-${selectedLocation.name.replace(/\s+/g, '-')}-2026-06-12.xlsx dimulai...`)}
                    className="gap-1.5 rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export Aset</span>
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setLocationQrModal(selectedLocation)}
                    className="gap-1.5 rounded-xl text-sky-600 border-sky-200 hover:bg-sky-50"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Lokasi QR Code</span>
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedLocation.assets.length === 0) {
                        alert("Tidak ada aset di lokasi ini untuk dicetak!");
                        return;
                      }
                      setAssetsQrModal(selectedLocation);
                    }}
                    className="gap-1.5 rounded-xl"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Assets Lokasi QR Code</span>
                  </Button>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedLocation(null)}
                  className="rounded-xl px-5"
                >
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Printable Single Location QR Code Modal */}
      <Dialog open={!!locationQrModal} onOpenChange={(open) => !open && setLocationQrModal(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-base font-extrabold font-serif">Cetak Barcode QR Code Lokasi</DialogTitle>
          </DialogHeader>
          
          {locationQrModal && (
            <div className="flex justify-center items-center p-6 bg-muted/30 border border-border rounded-2xl print:bg-white print:border-none">
              <div 
                style={{ 
                  width: "180px", 
                  height: "110px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  border: "1px solid black",
                  backgroundColor: "white",
                  padding: "5px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <div style={{ width: "60px", height: "60px", border: "1px solid #e2e8f0", padding: "2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="45" height="45" viewBox="0 0 29 29" className="text-[#048025]">
                      <path fill="currentColor" d="M0 0h7v7H0zm1 1v5h5V1zm21 0h7v7h-7zm1 1v5h5V1zM0 22h7v7H0zm1 1v5h5V23zm10-22h7v2h-7zm0 3h2v4h-2zm4 0h3v1h-3zm0 2h1v2h-1zm5 0h1v1h-1zm-9 3h2v2h-2zm6 0h2v1h-2zm-3 2h2v2h-2zm6 0h1v1h-1zm-9 3h3v1h-3zm5 0h2v2h-2zm4 0h2v1h-2zm-9 2h2v2h-2zm3 0h1v1h-1zm5 0h2v2h-2zm-6 2h3v1h-3zm6 0h1v1h-1z" />
                      <rect x="3" y="3" width="1" height="1" fill="currentColor" />
                      <rect x="25" y="3" width="1" height="1" fill="currentColor" />
                      <rect x="3" y="25" width="1" height="1" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[8px] border border-amber-400 text-center leading-none">
                    <span>YAPI<br />LOKASI</span>
                  </div>
                </div>
                <div className="text-center font-bold font-mono" style={{ fontSize: "8px", letterSpacing: "-0.2px", lineHeight: "1.2" }}>
                  {locationQrModal.number} &bull; {locationQrModal.name}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setLocationQrModal(null)} className="rounded-xl">
              Tutup
            </Button>
            <Button onClick={() => window.print()} className="rounded-xl">
              Cetak Label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Printable Grid Location Assets QR Code Modal */}
      <Dialog open={!!assetsQrModal} onOpenChange={(open) => !open && setAssetsQrModal(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] rounded-3xl p-6 overflow-hidden flex flex-col gap-4 print:bg-white print:border-none print:w-full print:h-full print:max-h-full">
          {assetsQrModal && (
            <>
              <div className="flex justify-between items-center border-b border-border pb-3 print:hidden shrink-0">
                <div>
                  <DialogTitle className="text-base font-extrabold font-serif">
                    Preview Cetak QR Code Aset - {assetsQrModal.name}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">Total {assetsQrModal.assets.length} label aset siap cetak.</p>
                </div>
                <Button onClick={() => window.print()} className="rounded-xl">
                  Cetak Halaman (Print)
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-muted/30 border border-border rounded-2xl print:bg-white print:border-none print:p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center print:grid-cols-3 print:gap-4 print:p-0">
                  {assetsQrModal.assets.map((item: any) => {
                    const unitCode = mockUnits.find(u => u.id === item.unit_id)?.number || "--";
                    const locationCode = rooms.find(l => l.id === item.location_id)?.number || "--";
                    const categoryCode = mockCategories.find(c => c.id === item.category_id)?.code || "--";
                    const toolCode = mockTools.find(t => t.id === item.tool_id)?.code_name || "--";
                    const yearCode = mockYears.find(y => y.id === item.year_id)?.code || "--";
                    const aktivaCode = mockAktiva.find(a => a.id === item.aktiva_id)?.code || "--";
                    
                    const labelCode = `${unitCode}/${aktivaCode}/${locationCode}/${toolCode}/${categoryCode}/${yearCode}/${item.entries_number}`;

                    return (
                      <div 
                        key={item.id} 
                        className="bg-white" 
                        style={{ 
                          width: "180px", 
                          height: "110px", 
                          display: "flex", 
                          flexDirection: "column", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          border: "1px solid black",
                          padding: "5px",
                          boxSizing: "border-box"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
                          <div style={{ width: "60px", height: "60px", border: "1px solid #e2e8f0", padding: "2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div className="w-full h-full bg-[#048025]/5 p-0.5 flex flex-wrap gap-0.5 justify-center items-center">
                              <svg width="45" height="45" viewBox="0 0 29 29" className="text-[#048025]">
                                <path fill="currentColor" d="M0 0h7v7H0zm1 1v5h5V1zm21 0h7v7h-7zm1 1v5h5V1zM0 22h7v7H0zm1 1v5h5V23zm10-22h7v2h-7zm0 3h2v4h-2zm4 0h3v1h-3zm0 2h1v2h-1zm5 0h1v1h-1zm-9 3h2v2h-2zm6 0h2v1h-2zm-3 2h2v2h-2zm6 0h1v1h-1zm-9 3h3v1h-3zm5 0h2v2h-2zm4 0h2v1h-2zm-9 2h2v2h-2zm3 0h1v1h-1zm5 0h2v2h-2zm-6 2h3v1h-3zm6 0h1v1h-1z" />
                                <rect x="3" y="3" width="1" height="1" fill="currentColor" />
                                <rect x="25" y="3" width="1" height="1" fill="currentColor" />
                                <rect x="3" y="25" width="1" height="1" fill="currentColor" />
                              </svg>
                            </div>
                          </div>
                          <div className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[8px] border-2 border-amber-400 text-center leading-none shadow">
                            <span>YAPI<br />SCHOOL</span>
                          </div>
                        </div>
                        <div className="text-center font-bold font-mono" style={{ fontSize: "7.5px", letterSpacing: "-0.2px", lineHeight: "1.2", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          {labelCode}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="print:hidden">
                <Button variant="outline" onClick={() => setAssetsQrModal(null)} className="rounded-xl">
                  Tutup Preview
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
