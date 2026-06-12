"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { Tag, Plus, Menu, Edit, Trash, X, Loader2, Search } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function CategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [categories, setCategories] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const url = `/categories?page=${currentPage}&per_page=${perPage}${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
      }`;
      const res = await api.get(url);
      setCategories(res.data || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.last_page || 0);
    } catch (err: any) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, perPage, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/categories", {
        name: newName,
        code: newCode.toUpperCase(),
      });
      setNewName("");
      setNewCode("");
      setCreateModal(false);
      toast.success("Kategori berhasil ditambahkan!");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat kategori");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      await api.put(`/categories/${editModal.id}`, {
        name: editModal.name,
        code: editModal.code.toUpperCase(),
      });
      setEditModal(null);
      toast.success("Kategori berhasil diperbarui!");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate kategori");
    }
  };

  const handleDelete = (id: number) => {
    toast.confirm("Apakah Anda yakin ingin menghapus kategori aset ini?", async () => {
      try {
        await api.delete(`/categories/${id}`);
        toast.success("Kategori berhasil dihapus!");
        fetchCategories();
      } catch (err: any) {
        toast.error(err.message || "Gagal menghapus kategori");
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
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Daftar Kategori</h2>
                <p className="text-xs text-foreground/50 font-medium mt-1">Kelola data pembagian kategori klasifikasi aset yayasan.</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs shadow-md shadow-primary/10 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </header>

        {/* Filter / Search Bar */}
        <section className="bg-white border border-border-peach rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45" />
            <input 
              type="text" 
              placeholder="Cari kategori berdasarkan kode atau nama..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-background border border-border-peach rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
            />
          </div>
        </section>

        <section className="bg-white border border-border-peach rounded-3xl overflow-hidden shadow-card relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-foreground/60 font-semibold">Memuat data kategori...</p>
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-primary-light/40 border-b border-border-peach">
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Kode Kategori</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Nama Kategori</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Tanggal Dibuat</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-peach/50">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-primary-light/10 transition-colors">
                        <td className="p-5 text-xs font-bold text-primary">{c.code}</td>
                        <td className="p-5 text-xs font-extrabold text-foreground">{c.name}</td>
                        <td className="p-5 text-xs font-semibold text-foreground/60">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) : "-"}
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => setEditModal(c)}
                              className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-primary transition-colors shadow-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(c.id)}
                              className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-red-500 transition-colors shadow-sm"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-xs font-semibold text-foreground/40">
                          Tidak ada data kategori ditemukan.
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
            <h3 className="text-base font-extrabold text-foreground font-serif">Tambah Kategori</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nama Kategori</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Komputer & IT..." 
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Kode Kategori</label>
                <input 
                  type="text" 
                  value={newCode} 
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Contoh: KOMP" 
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors">
                Simpan Kategori
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
            <h3 className="text-base font-extrabold text-foreground font-serif">Ubah Kategori</h3>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nama Kategori</label>
                <input 
                  type="text" 
                  value={editModal.name} 
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Kode Kategori</label>
                <input 
                  type="text" 
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
