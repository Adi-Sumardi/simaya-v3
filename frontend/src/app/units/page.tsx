"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { Building, Plus, Menu, Edit, Trash, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

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
      
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-screen w-full">
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
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Daftar Unit Kerja</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Kelola data unit kerja yayasan yang terafiliasi dengan kepemilikan aset.</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setCreateModal(true)}
            className="rounded-2xl gap-2 h-11 px-5 shadow-md shadow-primary/20 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Unit Kerja</span>
          </Button>
        </header>

        {/* Data Table */}
        <Card className="rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-semibold">Memuat data unit...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Unit</TableHead>
                      <TableHead>Nama Unit</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUnits.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-bold text-primary font-mono">{unit.number}</TableCell>
                        <TableCell className="font-extrabold text-foreground">{unit.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {unit.created_at ? new Date(unit.created_at).toLocaleDateString("id-ID") : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditModal(unit)}
                              className="h-8 w-8 rounded-lg border border-border"
                              title="Ubah Unit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(unit.id)}
                              className="h-8 w-8 rounded-lg border border-border text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Hapus Unit"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedUnits.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="p-12 text-center text-xs font-semibold text-muted-foreground">
                          Tidak ada data unit kerja.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={units.length}
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
            <DialogTitle className="text-base font-extrabold font-serif">Tambah Unit Kerja</DialogTitle>
            <DialogDescription className="text-xs">
              Tambahkan entitas unit kerja baru di lingkungan yayasan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit-name">Nama Unit</Label>
              <Input 
                id="unit-name"
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Unit SD Islam..." 
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit-number">Nomor Unit (Kode)</Label>
              <Input 
                id="unit-number"
                type="text" 
                value={newNumber} 
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="Contoh: UNT-005" 
              />
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModal(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="rounded-xl">
                Simpan Unit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={(open) => !open && setEditModal(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Ubah Unit Kerja</DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui nama atau kode unit kerja.
            </DialogDescription>
          </DialogHeader>
          {editModal && (
            <form onSubmit={handleEdit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-unit-name">Nama Unit</Label>
                <Input 
                  id="edit-unit-name"
                  type="text" 
                  value={editModal.name} 
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-unit-number">Nomor Unit (Kode)</Label>
                <Input 
                  id="edit-unit-number"
                  type="text" 
                  value={editModal.number} 
                  onChange={(e) => setEditModal({ ...editModal, number: e.target.value })}
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
