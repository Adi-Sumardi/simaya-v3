"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { Users, Plus, Search, Menu, Edit, Trash, Shield, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function UsersPage() {
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

  // Dynamic States
  const [users, setUsers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const roles = ["super_admin", "operator", "viewer"];

  // Form States
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("operator");
  const [newUnitId, setNewUnitId] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = `/users?page=${currentPage}&per_page=${perPage}${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
      }`;
      const [usersRes, unitsRes] = await Promise.all([
        api.get(url),
        api.get("/units/all"),
      ]);
      setUsers(usersRes.data || []);
      setTotalItems(usersRes.total || 0);
      setTotalPages(usersRes.last_page || 0);
      
      const allUnits = unitsRes || [];
      setUnits(allUnits);
      if (allUnits.length > 0 && !newUnitId) {
        setNewUnitId(allUnits[0].id.toString());
      }
    } catch (err: any) {
      console.error("Failed to load users data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, perPage, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users", {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        unit_id: Number(newUnitId),
      });
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("operator");
      if (units.length > 0) {
        setNewUnitId(units[0].id.toString());
      }
      setCreateModal(false);
      toast.success("Pengguna berhasil ditambahkan!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan pengguna");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      const payload: any = {
        name: editModal.name,
        email: editModal.email,
        role: editModal.role,
        unit_id: Number(editModal.unit_id),
      };
      if (editModal.password) {
        payload.password = editModal.password;
      }
      await api.put(`/users/${editModal.id}`, payload);
      setEditModal(null);
      toast.success("Pengguna berhasil diperbarui!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate pengguna");
    }
  };

  const handleDelete = (id: number) => {
    toast.confirm("Apakah Anda yakin ingin menghapus pengguna ini?", async () => {
      try {
        await api.delete(`/users/${id}`);
        toast.success("Pengguna berhasil dihapus!");
        fetchData();
      } catch (err: any) {
        toast.error(err.message || "Gagal menghapus pengguna");
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
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Kelola Pengguna</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Kelola data pengguna, penetapan peran (role), dan hak akses unit kerja.</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setCreateModal(true)}
            className="rounded-2xl gap-2 h-11 px-5 shadow-md shadow-primary/20 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </Button>
        </header>

        {/* Filter and Search */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari pengguna berdasarkan nama atau email..."
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

        {/* Data Table */}
        <Card className="rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-semibold">Memuat data pengguna...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Pengguna</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Unit Kerja</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-extrabold text-foreground">{user.name}</TableCell>
                        <TableCell className="font-semibold text-foreground/80">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "super_admin" 
                                ? "default" 
                                : user.role === "operator" 
                                ? "info"
                                : "success"
                            }
                            className="text-[10px] font-bold gap-1"
                          >
                            <Shield className="w-3 h-3" />
                            <span>{user.role}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-bold gap-1 bg-muted/50">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <span>{user.unit?.name || "Tidak ada unit"}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", {
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
                              onClick={() => setEditModal({
                                ...user,
                                password: "",
                                unit_id: user.unit_id?.toString() || ""
                              })}
                              className="h-8 w-8 rounded-lg border border-border"
                              title="Ubah Pengguna"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(user.id)}
                              className="h-8 w-8 rounded-lg border border-border text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Hapus Pengguna"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-12 text-center text-xs font-semibold text-muted-foreground">
                          Tidak ada data pengguna ditemukan.
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
            <DialogTitle className="text-base font-extrabold font-serif">Tambah Pengguna</DialogTitle>
            <DialogDescription className="text-xs">
              Buat akun pengguna baru dan tetapkan peran akses.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-name">Nama Pengguna</Label>
              <Input
                id="user-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Adi Sumardi..."
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Contoh: adi@simaya.org"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-pwd">Kata Sandi</Label>
              <Input
                id="user-pwd"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-role">Peran (Role)</Label>
              <select
                id="user-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-unit">Unit Kerja Afiliasi</Label>
              <select
                id="user-unit"
                value={newUnitId}
                onChange={(e) => setNewUnitId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModal(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="rounded-xl">
                Simpan Pengguna
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={(open) => !open && setEditModal(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Ubah Pengguna</DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui profil pengguna atau hak akses unit.
            </DialogDescription>
          </DialogHeader>
          {editModal && (
            <form onSubmit={handleEdit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-u-name">Nama Pengguna</Label>
                <Input
                  id="edit-u-name"
                  type="text"
                  value={editModal.name}
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-u-email">Email</Label>
                <Input
                  id="edit-u-email"
                  type="email"
                  value={editModal.email}
                  onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-u-pwd">Kata Sandi Baru (Kosongkan jika tidak diubah)</Label>
                <Input
                  id="edit-u-pwd"
                  type="password"
                  value={editModal.password || ""}
                  onChange={(e) => setEditModal({ ...editModal, password: e.target.value })}
                  placeholder="Isi jika ingin mengganti sandi"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-u-role">Peran (Role)</Label>
                <select
                  id="edit-u-role"
                  value={editModal.role}
                  onChange={(e) => setEditModal({ ...editModal, role: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-u-unit">Unit Kerja Afiliasi</Label>
                <select
                  id="edit-u-unit"
                  value={editModal.unit_id}
                  onChange={(e) => setEditModal({ ...editModal, unit_id: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
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
    </div>
  );
}
