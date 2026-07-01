#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=================================================="
echo "      MEMULAI PEMBARUAN SIMAYA (FILAMENT)         "
echo "=================================================="

# 1. Aktifkan mode pemeliharaan
echo "-> Menonaktifkan akses publik (maintenance mode)..."
php artisan down || true

# 2. Ambil perubahan kode terbaru
echo "-> Mengambil kode terbaru dari repository..."
git pull origin simaya-v3

# 3. Install/Update dependensi composer
echo "-> Mengoptimalkan dependensi PHP..."
composer install --no-dev --optimize-autoloader

# 4. Jalankan migrasi database (Tanpa menghapus data yang ada)
echo "-> Menjalankan migrasi database..."
php artisan migrate --force

# 5. Sinkronisasi aset Filament ke direktori publik
echo "-> Memperbarui aset Filament..."
php artisan filament:assets

# 6. Generate perizinan baru dari Filament Shield (jika ada resource baru)
echo "-> Sinkronisasi perizinan Filament Shield..."
php artisan shield:generate --all --panel=admin --no-interaction

# 7. Verifikasi & sinkronisasi Roles & Permissions agar menu tetap muncul
echo "-> Memverifikasi konfigurasi hak akses user..."
php artisan tinker --execute="
\$unitRole = Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Unit', 'guard_name' => 'web']);
\$allPermissions = Spatie\Permission\Models\Permission::pluck('name')->toArray();

// Berikan izin Unit untuk semua modul kecuali modul pengaturan Role (shield)
\$unitPermissions = array_filter(\$allPermissions, function(\$p) {
    return !str_contains(\$p, 'role');
});
\$unitRole->syncPermissions(\$unitPermissions);

\$adminRole = Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);

\$admin = App\Models\User::where('email', 'admin@simaya.id')->first();
if (\$admin && !\$admin->hasRole('super_admin')) {
    \$admin->assignRole(\$adminRole);
}

\$operator = App\Models\User::where('email', 'operator@simaya.id')->first();
if (\$operator && !\$operator->hasRole('Unit')) {
    \$operator->assignRole(\$unitRole);
}
"

# 8. Bersihkan dan bangun ulang cache Laravel untuk performa maksimal
echo "-> Mengoptimalkan cache konfigurasi dan rute..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan cache:clear

# 9. Matikan mode pemeliharaan
echo "-> Mengaktifkan kembali akses publik..."
php artisan up

echo "=================================================="
echo "    PEMBARUAN SIMAYA SELESAI DENGAN SUKSES!       "
echo "=================================================="
