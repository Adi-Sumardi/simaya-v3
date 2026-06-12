"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { MapPin, Plus, Building, Menu, X, Info, Search, Edit, Trash, Eye, QrCode, FileText, Loader2 } from "lucide-react";

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
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto max-h-screen w-full">
        
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white border border-border-peach/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-2xl bg-background border border-border-peach hover:text-primary flex lg:hidden items-center justify-center transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Lokasi & Ruangan</h2>
              <p className="text-xs text-foreground/50 font-medium mt-1">Kelola pembagian ruangan dan lokasi aset di yayasan.</p>
            </div>
          </div>
          <button 
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs shadow-md shadow-primary/10 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lokasi</span>
          </button>
        </header>

        {/* Filter and Search */}
        <section className="bg-white border border-border-peach rounded-3xl p-4 flex gap-4 items-center shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-foreground/40 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Cari lokasi, nomor lokasi, atau unit kerja..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </section>

        {/* Locations Grid */}
        <section className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {paginatedRooms.map((room) => (
              <div 
                key={room.id} 
                onClick={() => handleOpenDetail(room)}
                className="bg-white border border-border-peach rounded-3xl p-6 shadow-card hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-primary px-3 py-1 bg-primary-light rounded-full">
                        {room.assets_count || 0} Aset
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModal(room);
                        }}
                        className="p-2 bg-background border border-border-peach rounded-lg text-foreground/50 hover:text-primary transition-colors"
                        title="Ubah Ruangan"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(room.id, e)}
                        className="p-2 bg-background border border-border-peach rounded-lg text-foreground/50 hover:text-red-500 transition-colors"
                        title="Hapus Ruangan"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-foreground font-serif group-hover:text-primary transition-colors">{room.name}</h3>
                    <span className="text-[9px] font-black text-primary bg-primary-light/40 px-2 py-0.5 rounded">{room.number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/50 font-medium mt-2">
                    <Building className="w-3.5 h-3.5 text-foreground/30" />
                    <span>{room.unit_name} &bull; {room.floor}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 border-t border-border-peach/50 pt-3 mt-4 text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  <span>Klik untuk Detail & Relasi Aset</span>
                </div>
              </div>
            ))}
            {paginatedRooms.length === 0 && (
              <div className="col-span-full bg-white border border-border-peach rounded-3xl p-12 text-center text-xs font-bold text-foreground/45">
                Tidak ada lokasi ruangan ditemukan.
              </div>
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
      {createModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setCreateModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-extrabold text-foreground font-serif">Tambah Lokasi / Ruangan</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nama Lokasi</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Ruang Humas..." 
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nomor Lokasi</label>
                <input 
                  type="text" 
                  value={newNumber} 
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="Contoh: LOK-006" 
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Lantai</label>
                <input 
                  type="text" 
                  value={newFloor} 
                  onChange={(e) => setNewFloor(e.target.value)}
                  placeholder="Contoh: Lantai 1 atau Lantai Ground..." 
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Unit Kerja Terkait</label>
                <select
                  value={newUnitId}
                  onChange={(e) => setNewUnitId(e.target.value)}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                >
                  {mockUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors">
                Simpan Lokasi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setEditModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-extrabold text-foreground font-serif">Ubah Lokasi / Ruangan</h3>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nama Lokasi</label>
                <input 
                  type="text" 
                  value={editModal.name} 
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nomor Lokasi</label>
                <input 
                  type="text" 
                  value={editModal.number} 
                  onChange={(e) => setEditModal({ ...editModal, number: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Lantai</label>
                <input 
                  type="text" 
                  value={editModal.floor} 
                  onChange={(e) => setEditModal({ ...editModal, floor: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Unit Kerja Terkait</label>
                <select
                  value={editModal.unit_id}
                  onChange={(e) => setEditModal({ ...editModal, unit_id: Number(e.target.value) })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                >
                  {mockUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors">
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Relational Assets Detail Drawer / Modal (Matching ViewLocation.php actions) */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-4xl max-h-[85vh] p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-300 overflow-hidden">
            <button 
              onClick={() => setSelectedLocation(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Room Header Info */}
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-extrabold text-foreground font-serif leading-none">{selectedLocation.name}</h3>
                  <span className="text-[10px] font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-full">{selectedLocation.number}</span>
                </div>
                <p className="text-xs text-foreground/50 font-semibold mt-1.5">
                  {selectedLocation.building} &bull; {selectedLocation.floor}
                </p>
              </div>
            </div>

            <hr className="border-border-peach/50" />

            {/* AssetsRelationManager Table */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-1">Daftar Relasi Aset</h4>
                <p className="text-[10px] text-foreground/45 font-medium">Aset yang saat ini ditempatkan di {selectedLocation.name}</p>
              </div>

              {loadingAssets ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border-peach rounded-2xl gap-3">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <span className="text-xs font-bold text-foreground/45">Memuat data aset...</span>
                </div>
              ) : selectedLocation.assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border-peach rounded-2xl gap-3">
                  <Building className="w-12 h-12 text-foreground/25" />
                  <span className="text-xs font-bold text-foreground/45">Tidak ada aset terdaftar di ruangan ini.</span>
                </div>
              ) : (
                <div className="border border-border-peach rounded-2xl overflow-hidden">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="bg-primary-light/30 border-b border-border-peach">
                          <th className="p-4 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Foto</th>
                          <th className="p-4 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Nama Aset</th>
                          <th className="p-4 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">No. Aset</th>
                          <th className="p-4 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Merk</th>
                          <th className="p-4 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Kondisi</th>
                          <th className="p-4 text-[10px] font-extrabold text-foreground/75 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-peach/30">
                        {selectedLocation.assets.map((asset: any) => (
                          <tr key={asset.id} className="hover:bg-primary-light/5 transition-colors">
                            <td className="p-4">
                              <div className="w-10 h-10 rounded-lg bg-border-peach/50 flex items-center justify-center font-bold text-primary font-serif">
                                {asset.name.substring(0, 2).toUpperCase()}
                              </div>
                            </td>
                            <td className="p-4 text-xs font-extrabold text-foreground">{asset.name}</td>
                            <td className="p-4 text-xs font-bold text-primary">{asset.entries_number}</td>
                            <td className="p-4 text-xs font-semibold text-foreground/60">{asset.brand}</td>
                            <td className="p-4 text-xs">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                asset.condition === "bagus" 
                                  ? "bg-secondary-light text-secondary border border-secondary/20"
                                  : "bg-red-50 text-red-500 border border-red-100"
                              }`}>
                                {asset.condition === "bagus" ? "Bagus" : "Rusak"}
                              </span>
                            </td>
                            <td className="p-4 text-xs">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                asset.status === "active" 
                                  ? "bg-emerald-100 text-emerald-800" 
                                  : asset.status === "repaired" 
                                  ? "bg-zinc-100 text-zinc-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {asset.status === "active" ? "Aktif" : asset.status === "repaired" ? "Diperbaiki" : "Tidak Aktif"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons mapped to ViewLocation.php headerActions */}
            <div className="flex justify-between items-center flex-wrap gap-2 pt-4 border-t border-border-peach/50 flex-shrink-0">
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => alert(`Unduhan Aset-${selectedLocation.name.replace(/\s+/g, '-')}-2026-06-12.xlsx dimulai...`)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export Aset</span>
                </button>
                <button 
                  onClick={() => setLocationQrModal(selectedLocation)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Lokasi QR Code</span>
                </button>
                <button 
                  onClick={() => {
                    if (selectedLocation.assets.length === 0) {
                      alert("Tidak ada aset di lokasi ini untuk dicetak!");
                      return;
                    }
                    setAssetsQrModal(selectedLocation);
                  }}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Assets Lokasi QR Code</span>
                </button>
              </div>
              <button 
                onClick={() => setSelectedLocation(null)}
                className="px-6 py-2.5 bg-background hover:bg-primary-light/40 border border-border-peach text-foreground/75 hover:text-primary rounded-xl font-bold text-xs transition-colors w-full sm:w-auto"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Single Location QR Code Label Modal (qrcodeLokasi action) */}
      {locationQrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-6 relative">
            <button 
              onClick={() => setLocationQrModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors print:hidden"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-sm font-extrabold text-foreground font-serif border-b border-border-peach/50 pb-2 print:hidden">
              Cetak Barcode QR Code Lokasi
            </h4>
            
            <div className="flex justify-center items-center p-6 bg-zinc-50 border border-border-peach/50 rounded-2xl print:bg-white print:border-none">
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
                    {/* SVG green QR pattern */}
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

            <div className="flex gap-2 justify-end print:hidden">
              <button 
                onClick={() => setLocationQrModal(null)}
                className="px-4 py-2 bg-background border border-border-peach rounded-lg text-xs font-bold"
              >
                Tutup
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover shadow-sm"
              >
                Cetak Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Grid Location Assets QR Code Labels Modal (qrcodeAset action) */}
      {assetsQrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4 print:p-0">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-5xl max-h-[90vh] p-6 shadow-2xl flex flex-col gap-6 relative overflow-hidden animate-in fade-in zoom-in duration-200 print:bg-white print:border-none print:w-full print:h-full print:max-h-full">
            <button 
              onClick={() => setAssetsQrModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors print:hidden"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex justify-between items-center border-b border-border-peach/50 pb-2 print:hidden flex-shrink-0">
              <div>
                <h4 className="text-sm font-extrabold text-foreground font-serif">
                  Preview Cetak QR Code Aset - {assetsQrModal.name}
                </h4>
                <p className="text-[10px] text-foreground/45">Total {assetsQrModal.assets.length} label aset siap cetak.</p>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md shadow-primary/10 transition-colors"
              >
                Cetak Halaman (Print)
              </button>
            </div>

            {/* Printable Grid layout matching qrcode.blade.php layout exactly */}
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 border border-border-peach/50 rounded-2xl print:bg-white print:border-none print:p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center print:grid-cols-3 print:gap-4 print:p-0">
                {assetsQrModal.assets.map((item: any) => {
                  const unitCode = mockUnits.find(u => u.id === item.unit_id)?.number || "--";
                  const locationCode = rooms.find(l => l.id === item.location_id)?.number || "--";
                  const categoryCode = mockCategories.find(c => c.id === item.category_id)?.code || "--";
                  const toolCode = mockTools.find(t => t.id === item.tool_id)?.code_name || "--";
                  const yearCode = mockYears.find(y => y.id === item.year_id)?.code || "--";
                  const aktivaCode = mockAktiva.find(a => a.id === item.aktiva_id)?.code || "--";
                  
                  // label code format
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

            <div className="flex justify-end gap-3 pt-4 border-t border-border-peach/50 print:hidden flex-shrink-0">
              <button 
                onClick={() => setAssetsQrModal(null)}
                className="px-6 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-bold hover:bg-primary-light/40"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
