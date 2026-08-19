<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Unit;
use App\Models\User;
use App\Models\Category;
use App\Models\Tool;
use App\Models\Year;
use App\Models\Aktiva;
use App\Models\Location;
use App\Models\Asset;
use App\Models\AssetTransfer;
use App\Models\AssetTransferItem;
use App\Models\AssetDisposition;
use App\Models\AssetDispositionItem;

class BeritaAcaraDemoSeeder extends Seeder
{
    public function run(): void
    {
        $unit1 = Unit::firstOrCreate(['number' => 'UNT-001'], ['name' => 'Unit Teknologi Informasi']);
        $unit2 = Unit::firstOrCreate(['number' => 'UNT-002'], ['name' => 'Unit Administrasi Umum']);
        $unit3 = Unit::firstOrCreate(['number' => 'UNT-003'], ['name' => 'Unit Sarana & Prasarana']);

        $userAdmin = User::where('email', 'admin@simaya.id')->first() ?? User::first();
        $userOperator = User::where('email', 'operator@simaya.id')->first() ?? $userAdmin;

        $catElk = Category::firstOrCreate(['code' => 'CAT-ELK'], ['name' => 'Elektronik & Gadget']);
        $catKnt = Category::firstOrCreate(['code' => 'CAT-KNT'], ['name' => 'Peralatan Kantor']);

        $toolLap = Tool::firstOrCreate(['code' => 'TOL-LAP'], ['name' => 'Laptop ThinkPad T14', 'code_name' => 'Laptop']);
        $toolPrn = Tool::firstOrCreate(['code' => 'TOL-PRN'], ['name' => 'Printer Epson L3210', 'code_name' => 'Printer']);
        $toolAC  = Tool::firstOrCreate(['code' => 'TOL-AC'],  ['name' => 'AC Daikin 1.5 PK', 'code_name' => 'AC']);
        $toolKrs = Tool::firstOrCreate(['code' => 'TOL-KRS'], ['name' => 'Kursi Ergonomis Direksi', 'code_name' => 'Kursi']);

        $yr24 = Year::firstOrCreate(['code' => 'YR24'], ['year' => '2024']);
        $yr25 = Year::firstOrCreate(['code' => 'YR25'], ['year' => '2025']);

        $aktivaTtp = Aktiva::firstOrCreate(['code' => 'AKT-TTP'], ['name' => 'Aktiva Tetap Peralatan']);

        $locServer = Location::firstOrCreate(['number' => 'LOC-001'], [
            'name' => 'Ruang Server Utama',
            'floor' => 'Lantai 3',
            'unit_id' => $unit1->id,
            'user_id' => $userAdmin->id
        ]);

        $locAdmin = Location::firstOrCreate(['number' => 'LOC-002'], [
            'name' => 'Ruang Staff Administrasi',
            'floor' => 'Lantai 1',
            'unit_id' => $unit2->id,
            'user_id' => $userOperator->id
        ]);

        $locGudang = Location::firstOrCreate(['number' => 'LOC-003'], [
            'name' => 'Gudang Sarpras Utama',
            'floor' => 'Lantai Basement',
            'unit_id' => $unit3->id,
            'user_id' => $userAdmin->id
        ]);

        // 1. Create Sample Assets
        $asset1 = Asset::create([
            'name' => 'Laptop Lenovo ThinkPad T14 Gen 4',
            'brand' => 'Lenovo',
            'entries_number' => 101,
            'condition' => 'bagus',
            'portability' => 'portable',
            'description' => 'Laptop dinas operasional divisi IT dengan spesifikasi Core i7 16GB RAM',
            'price' => 18500000,
            'depreciation_rate' => 20,
            'aquisition' => 'Pembelian Anggaran 2024',
            'aquisition_date' => '2024-03-15',
            'status' => 'active',
            'unit_id' => $unit1->id,
            'location_id' => $locServer->id,
            'tool_id' => $toolLap->id,
            'category_id' => $catElk->id,
            'year_id' => $yr24->id,
            'aktiva_id' => $aktivaTtp->id,
            'user_id' => $userAdmin->id,
        ]);

        $asset2 = Asset::create([
            'name' => 'Printer Multifungsi Epson EcoTank L3210',
            'brand' => 'Epson',
            'entries_number' => 102,
            'condition' => 'bagus',
            'portability' => 'portable',
            'description' => 'Printer warna tangki tinta untuk kebutuhan cetak surat dan administrasi',
            'price' => 2800000,
            'depreciation_rate' => 25,
            'aquisition' => 'Pengadaan Sarpras 2024',
            'aquisition_date' => '2024-05-10',
            'status' => 'active',
            'unit_id' => $unit1->id,
            'location_id' => $locServer->id,
            'tool_id' => $toolPrn->id,
            'category_id' => $catElk->id,
            'year_id' => $yr24->id,
            'aktiva_id' => $aktivaTtp->id,
            'user_id' => $userAdmin->id,
        ]);

        $asset3 = Asset::create([
            'name' => 'Air Conditioner Daikin Inverter 1.5 PK',
            'brand' => 'Daikin',
            'entries_number' => 103,
            'condition' => 'rusak',
            'portability' => 'non-portable',
            'description' => 'AC ruang staff mengalami kompresor bocor dan perlu peremajaan',
            'price' => 6200000,
            'depreciation_rate' => 20,
            'aquisition' => 'Pengadaan 2023',
            'aquisition_date' => '2023-01-20',
            'status' => 'disposed',
            'unit_id' => $unit2->id,
            'location_id' => $locAdmin->id,
            'tool_id' => $toolAC->id,
            'category_id' => $catElk->id,
            'year_id' => $yr24->id,
            'aktiva_id' => $aktivaTtp->id,
            'user_id' => $userOperator->id,
        ]);

        $asset4 = Asset::create([
            'name' => 'Kursi Kerja Ergonomis Mesh Pro',
            'brand' => 'Indachi',
            'entries_number' => 104,
            'condition' => 'bagus',
            'portability' => 'non-portable',
            'description' => 'Kursi putar hidrolik ergonomis untuk staff',
            'price' => 1450000,
            'depreciation_rate' => 15,
            'aquisition' => 'Pengadaan 2024',
            'aquisition_date' => '2024-08-01',
            'status' => 'active',
            'unit_id' => $unit2->id,
            'location_id' => $locAdmin->id,
            'tool_id' => $toolKrs->id,
            'category_id' => $catKnt->id,
            'year_id' => $yr24->id,
            'aktiva_id' => $aktivaTtp->id,
            'user_id' => $userOperator->id,
        ]);

        // 2. Create Sample Mutasi / Serah Terima (AssetTransfer)
        $transfer = AssetTransfer::create([
            'transfer_number' => 'TRF-2026-0001',
            'from_unit_id' => $unit1->id,
            'from_location_id' => $locServer->id,
            'to_location_id' => $locAdmin->id,
            'reason' => 'Mutasi perangkat komputer dan printer operasional untuk penunjang kegiatan pelayanan administrasi yayasan.',
            'notes' => 'Seluruh unit telah dicek dan berfungsi normal 100% lengkap dengan kabel power dan adaptor.',
            'requested_by' => $userOperator->id,
            'approved_by' => $userAdmin->id,
            'status' => 'completed',
            'requested_at' => now()->subDays(3),
            'approved_at' => now()->subDays(2),
            'completed_at' => now()->subDay(),
        ]);

        AssetTransferItem::create([
            'asset_transfer_id' => $transfer->id,
            'asset_id' => $asset1->id,
            'condition_notes' => 'Kondisi fisik mulus, sistem operasi Windows 11 Pro original',
            'is_verified' => true,
        ]);

        AssetTransferItem::create([
            'asset_transfer_id' => $transfer->id,
            'asset_id' => $asset2->id,
            'condition_notes' => 'Tinta terisi penuh 4 warna, hasil cetak tajam dan bersih',
            'is_verified' => true,
        ]);

        // 3. Create Sample Disposisi (Penghapusan Aset)
        $disp1 = AssetDisposition::create([
            'disposition_number' => 'DSP-2026-0001',
            'document_number' => 'SK-YAPI/014/SARPRAS/II/2026',
            'document_date' => now()->subDays(4)->toDateString(),
            'type' => 'penghapusan',
            'reason' => 'Penghapusan aset pendingin ruangan yang rusak berat pada bagian kompresor dan biaya servis tidak efisien.',
            'notes' => 'Barang disimpan di gudang limbah yayasan sebelum proses lelang/pemusnahan akhir.',
            'processed_by' => $userAdmin->id,
            'status' => 'completed',
        ]);

        AssetDispositionItem::create([
            'asset_disposition_id' => $disp1->id,
            'asset_id' => $asset3->id,
            'condition_notes' => 'Kompresor mati total, bodi outdoor berkarat',
            'estimated_value' => 750000,
        ]);

        // 4. Create Sample Disposisi (Hibah Aset)
        $disp2 = AssetDisposition::create([
            'disposition_number' => 'DSP-2026-0002',
            'document_number' => 'SK-YAPI/021/HIBAH/II/2026',
            'document_date' => now()->subDays(2)->toDateString(),
            'type' => 'hibah',
            'recipient_name' => 'Drs. H. Ahmad Fauzi, M.Pd',
            'recipient_organization' => 'Yayasan Pesantren Al-Ikhlas',
            'recipient_address' => 'Jl. Pendidikan No. 45, Kramat Jati, Jakarta Timur',
            'recipient_phone' => '0812-8899-7766',
            'reason' => 'Pemberian hibah inventaris perabotan kantor untuk menunjang sarana belajar santri binaan yayasan.',
            'notes' => 'Diserahterimakan langsung kepada pimpinan yayasan penerima hibah.',
            'processed_by' => $userAdmin->id,
            'status' => 'completed',
        ]);

        AssetDispositionItem::create([
            'asset_disposition_id' => $disp2->id,
            'asset_id' => $asset4->id,
            'condition_notes' => 'Kondisi 95% bagus, hidrolik berfungsi lancar',
            'estimated_value' => 1200000,
        ]);
    }
}
