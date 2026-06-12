"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { Building, Plus, Search, Menu, Eye, Edit, Trash, X, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function UnitsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<any | null>(null);
  const toast = useToast();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const data = await api.get("/units/all");
      setUnits(data || []);
    } catch (err) {
      console.error("Failed to load units from backend", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const totalPages = Math.ceil(units.length / perPage);
  const paginatedUnits = useMemo(() => {
    return units.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [units, currentPage, perPage]);

  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/units", {
        name: newName,
        number: newNumber || `UNT-${Math.floor(100 + Math.random() * 900)}`
      });
      setNewName("");
      setNewNumber("");
      setCreateModal(false);
      toast.success("Unit kerja berhasil ditambahkan!");
      fetchUnits();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat unit");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/units/${editModal.id}`, {
        name: editModal.name,
        number: editModal.number
      });
      setEditModal(null);
      toast.success("Unit kerja berhasil diperbarui!");
      fetchUnits();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui unit");
    }
  };

  const handleDelete = (id: number) => {
    toast.confirm("Apakah Anda yakin ingin menghapus unit kerja ini?", async () => {
      try {
        await api.delete(`/units/${id}`);
        toast.success("Unit kerja berhasil dihapus!");
        fetchUnits();
      } catch (err: any) {
        toast.error(err.message || "Gagal menghapus unit");
      }
    });
  };

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
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Daftar Unit Kerja</h2>
              <p className="text-xs text-foreground/50 font-medium mt-1">Kelola data unit kerja yayasan yang terafiliasi dengan kepemilikan aset.</p>
            </div>
          </div>
          <button 
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs shadow-md shadow-primary/10 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Unit Kerja</span>
          </button>
        </header>

        {/* Data Table */}
        <section className="bg-white border border-border-peach rounded-3xl overflow-hidden shadow-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-primary-light/40 border-b border-border-peach">
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Nomor Unit</th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Nama Unit</th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Tanggal Dibuat</th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-peach/50">
                {paginatedUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-primary-light/10 transition-colors">
                    <td className="p-5 text-xs font-bold text-primary">{unit.number}</td>
                    <td className="p-5 text-xs font-extrabold text-foreground">{unit.name}</td>
                    <td className="p-5 text-xs font-semibold text-foreground/60">{unit.created_at}</td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => setEditModal(unit)}
                          className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-primary transition-colors shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(unit.id)}
                          className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-red-500 transition-colors shadow-sm"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedUnits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs font-semibold text-foreground/40">
                      Tidak ada data unit kerja.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={units.length}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
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
            <h3 className="text-base font-extrabold text-foreground font-serif">Tambah Unit Kerja</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nama Unit</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Unit SD Islam..." 
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nomor Unit (Kode)</label>
                <input 
                  type="text" 
                  value={newNumber} 
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="Contoh: UNT-005" 
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors">
                Simpan Unit
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
            <h3 className="text-base font-extrabold text-foreground font-serif">Ubah Unit Kerja</h3>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nama Unit</label>
                <input 
                  type="text" 
                  value={editModal.name} 
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nomor Unit (Kode)</label>
                <input 
                  type="text" 
                  value={editModal.number} 
                  onChange={(e) => setEditModal({ ...editModal, number: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors">
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
