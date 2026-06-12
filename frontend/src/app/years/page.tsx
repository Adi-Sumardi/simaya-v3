"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { Calendar, Plus, Search, Menu, Edit, Trash, X, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function YearsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [years, setYears] = useState<any[]>([]);

  const [newYear, setNewYear] = useState("");
  const [newCode, setNewCode] = useState("");

  const fetchYears = async () => {
    try {
      setLoading(true);
      const url = `/years?page=${currentPage}&per_page=${perPage}${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
      }`;
      const res = await api.get(url);
      setYears(res.data || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.last_page || 0);
    } catch (err: any) {
      console.error("Failed to fetch years", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, [currentPage, perPage, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/years", {
        year: newYear,
        code: newCode,
      });
      setNewYear("");
      setNewCode("");
      setCreateModal(false);
      toast.success("Tahun pengadaan berhasil ditambahkan!");
      fetchYears();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan tahun pengadaan");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      await api.put(`/years/${editModal.id}`, {
        year: editModal.year,
        code: editModal.code,
      });
      setEditModal(null);
      toast.success("Tahun pengadaan berhasil diperbarui!");
      fetchYears();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate tahun pengadaan");
    }
  };

  const handleDelete = (id: number) => {
    toast.confirm("Apakah Anda yakin ingin menghapus data tahun pengadaan ini?", async () => {
      try {
        await api.delete(`/years/${id}`);
        toast.success("Tahun pengadaan berhasil dihapus!");
        fetchYears();
      } catch (err: any) {
        toast.error(err.message || "Gagal menghapus tahun pengadaan");
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-inner">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Daftar Tahun Pengadaan</h2>
                <p className="text-xs text-foreground/50 font-medium mt-1">Kelola data list tahun pengadaan dan kodenya untuk pembuatan barcode aset.</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs shadow-md shadow-primary/10 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tahun</span>
          </button>
        </header>

        {/* Filter and Search */}
        <section className="bg-white border border-border-peach rounded-3xl p-4 flex gap-4 items-center shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-foreground/45 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Cari tahun atau kode..."
              value={searchQuery}
              onChange={(e) => { 
                setSearchQuery(e.target.value); 
                setCurrentPage(1); 
              }}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground transition-colors"
            />
          </div>
        </section>

        {/* Data Table */}
        <section className="bg-white border border-border-peach rounded-3xl overflow-hidden shadow-card relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-foreground/60 font-semibold">Memuat data tahun pengadaan...</p>
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-primary-light/40 border-b border-border-peach">
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Tahun</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Kode Singkat</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Tanggal Dibuat</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-peach/50">
                    {years.map((y) => (
                      <tr key={y.id} className="hover:bg-primary-light/10 transition-colors">
                        <td className="p-5 text-xs font-extrabold text-foreground">{y.year}</td>
                        <td className="p-5 text-xs font-bold text-primary">{y.code}</td>
                        <td className="p-5 text-xs font-semibold text-foreground/60">
                          {y.created_at ? new Date(y.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) : "-"}
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setEditModal(y)}
                              className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-primary transition-colors shadow-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(y.id)}
                              className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-red-500 transition-colors shadow-sm"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {years.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-xs font-semibold text-foreground/40">
                          Tidak ada data tahun pengadaan ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                perPage={perPage}
                onPageChange={setCurrentPage}
                onPerPageChange={setPerPage}
              />
            </>
          )}
        </section>
      </main>

      {/* Create Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-6 relative animate-in zoom-in duration-200">
            <button
              onClick={() => setCreateModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-extrabold text-foreground font-serif">Tambah Tahun Pengadaan</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Tahun</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="Contoh: 2026"
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Kode Singkat (Max 4 Karakter)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Contoh: 26"
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors">
                Simpan Tahun
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-6 relative animate-in zoom-in duration-200">
            <button
              onClick={() => setEditModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-extrabold text-foreground font-serif">Ubah Tahun Pengadaan</h3>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Tahun</label>
                <input
                  type="text"
                  maxLength={4}
                  value={editModal.year}
                  onChange={(e) => setEditModal({ ...editModal, year: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Kode Singkat (Max 4 Karakter)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={editModal.code}
                  onChange={(e) => setEditModal({ ...editModal, code: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
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
