"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { Tag, Plus, Menu, Edit, Trash, Loader2, Search } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

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
      
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 w-full min-h-screen pb-16">
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Daftar Kategori</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Kelola data pembagian kategori klasifikasi aset yayasan.</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setCreateModal(true)}
            className="rounded-2xl gap-2 h-11 px-5 shadow-md shadow-primary/20 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </Button>
        </header>

        {/* Filter / Search Bar */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Cari kategori berdasarkan kode atau nama..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-11 rounded-xl text-xs bg-muted/30"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-semibold">Memuat data kategori...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Kategori</TableHead>
                      <TableHead>Nama Kategori</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-bold text-primary font-mono">{c.code}</TableCell>
                        <TableCell className="font-extrabold text-foreground">{c.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditModal(c)}
                              className="h-8 w-8 rounded-lg border border-border"
                              title="Ubah Kategori"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(c.id)}
                              className="h-8 w-8 rounded-lg border border-border text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Hapus Kategori"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="p-12 text-center text-xs font-semibold text-muted-foreground">
                          Tidak ada data kategori ditemukan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
          </CardContent>
        </Card>
      </main>

      {/* Create Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Tambah Kategori</DialogTitle>
            <DialogDescription className="text-xs">
              Tambahkan kategori klasifikasi aset baru.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-name">Nama Kategori</Label>
              <Input 
                id="cat-name"
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Komputer & IT..." 
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-code">Kode Kategori</Label>
              <Input 
                id="cat-code"
                type="text" 
                value={newCode} 
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Contoh: KOMP" 
                required
              />
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModal(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="rounded-xl">
                Simpan Kategori
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={(open) => !open && setEditModal(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Ubah Kategori</DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui data kategori aset.
            </DialogDescription>
          </DialogHeader>
          {editModal && (
            <form onSubmit={handleEdit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-cat-name">Nama Kategori</Label>
                <Input 
                  id="edit-cat-name"
                  type="text" 
                  value={editModal.name} 
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-cat-code">Kode Kategori</Label>
                <Input 
                  id="edit-cat-code"
                  type="text" 
                  value={editModal.code} 
                  onChange={(e) => setEditModal({ ...editModal, code: e.target.value })}
                  required
                />
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
    </div>
  );
}
