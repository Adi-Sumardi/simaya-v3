"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { api } from "@/lib/api";
import { Users, Plus, Search, Menu, Edit, Trash, X, Shield, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

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
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Kelola Pengguna</h2>
                <p className="text-xs text-foreground/50 font-medium mt-1">Kelola data pengguna, penetapan peran (role), dan unit kerja yang berhak mengakses sistem.</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs shadow-md shadow-primary/10 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </header>

        {/* Filter and Search */}
        <section className="bg-white border border-border-peach rounded-3xl p-4 flex gap-4 items-center shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-foreground/45 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Cari pengguna berdasarkan nama atau email..."
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
              <p className="text-xs text-foreground/60 font-semibold">Memuat data pengguna...</p>
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-primary-light/40 border-b border-border-peach">
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Nama Pengguna</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Email</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Role</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Unit Kerja</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Tanggal Dibuat</th>
                      <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-peach/50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-primary-light/10 transition-colors">
                        <td className="p-5 text-xs font-extrabold text-foreground">{user.name}</td>
                        <td className="p-5 text-xs font-semibold text-foreground/75">{user.email}</td>
                        <td className="p-5 text-xs">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 w-fit ${
                            user.role === "super_admin" 
                              ? "bg-purple-100 text-purple-700 border border-purple-200" 
                              : user.role === "operator" 
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}>
                            <Shield className="w-3 h-3" />
                            {user.role}
                          </span>
                        </td>
                        <td className="p-5 text-xs">
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-fit">
                            <Building2 className="w-3 h-3" />
                            {user.unit?.name || "Tidak ada unit"}
                          </span>
                        </td>
                        <td className="p-5 text-xs font-semibold text-foreground/60">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) : "-"}
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setEditModal({
                                ...user,
                                password: "",
                                unit_id: user.unit_id?.toString() || ""
                              })}
                              className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-primary transition-colors shadow-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-red-500 transition-colors shadow-sm"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs font-semibold text-foreground/40">
                          Tidak ada data pengguna ditemukan.
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
            <h3 className="text-base font-extrabold text-foreground font-serif">Tambah Pengguna</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nama Pengguna</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Adi Sumardi..."
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Contoh: adi@simaya.org"
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Kata Sandi</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Peran (Role)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Unit Kerja Afiliasi</label>
                <select
                  value={newUnitId}
                  onChange={(e) => setNewUnitId(e.target.value)}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                >
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors">
                Simpan Pengguna
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
            <h3 className="text-base font-extrabold text-foreground font-serif">Ubah Pengguna</h3>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Nama Pengguna</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Email</label>
                <input
                  type="email"
                  value={editModal.email}
                  onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Kata Sandi Baru (Kosongkan jika tidak diubah)</label>
                <input
                  type="password"
                  value={editModal.password || ""}
                  onChange={(e) => setEditModal({ ...editModal, password: e.target.value })}
                  placeholder="Isi jika ingin mengganti sandi"
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Peran (Role)</label>
                <select
                  value={editModal.role}
                  onChange={(e) => setEditModal({ ...editModal, role: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-foreground/75">Unit Kerja Afiliasi</label>
                <select
                  value={editModal.unit_id}
                  onChange={(e) => setEditModal({ ...editModal, unit_id: e.target.value })}
                  className="px-4 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-semibold text-foreground"
                  required
                >
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
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
    </div>
  );
}
