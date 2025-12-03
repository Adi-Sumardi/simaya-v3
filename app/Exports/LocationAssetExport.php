<?php

namespace App\Exports;

use App\Models\Location;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class LocationAssetExport implements FromCollection, WithHeadings, WithTitle, WithStyles, ShouldAutoSize
{
    protected $locationId;
    protected $location;

    public function __construct($locationId = null)
    {
        $this->locationId = $locationId;
        if ($locationId) {
            $this->location = Location::with('unit')->find($locationId);
        }
    }

    public function collection()
    {
        $query = Location::with(['unit', 'assets' => function ($q) {
            $q->with(['category', 'tool', 'year', 'aktiva'])
              ->where('status', '!=', 'disposed')
              ->orderBy('entries_number');
        }]);

        if ($this->locationId) {
            $query->where('id', $this->locationId);
        }

        $locations = $query->orderBy('unit_id')->orderBy('name')->get();

        $data = collect();
        $no = 1;

        foreach ($locations as $location) {
            // Header lokasi
            $data->push([
                'no' => '',
                'lokasi' => $location->name,
                'nomor_lokasi' => $location->number,
                'lantai' => $location->floor,
                'unit' => $location->unit?->name ?? '-',
                'nama_aset' => '--- DAFTAR ASET ---',
                'nomor_aset' => '',
                'kategori' => '',
                'jenis' => '',
                'merk' => '',
                'kondisi' => '',
                'status' => '',
                'tahun' => '',
                'harga' => '',
            ]);

            if ($location->assets->isEmpty()) {
                $data->push([
                    'no' => '',
                    'lokasi' => '',
                    'nomor_lokasi' => '',
                    'lantai' => '',
                    'unit' => '',
                    'nama_aset' => '(Tidak ada aset)',
                    'nomor_aset' => '',
                    'kategori' => '',
                    'jenis' => '',
                    'merk' => '',
                    'kondisi' => '',
                    'status' => '',
                    'tahun' => '',
                    'harga' => '',
                ]);
            } else {
                foreach ($location->assets as $asset) {
                    $data->push([
                        'no' => $no++,
                        'lokasi' => $location->name,
                        'nomor_lokasi' => $location->number,
                        'lantai' => $location->floor,
                        'unit' => $location->unit?->name ?? '-',
                        'nama_aset' => $asset->name,
                        'nomor_aset' => $asset->entries_number,
                        'kategori' => $asset->category?->name ?? '-',
                        'jenis' => $asset->tool?->name ?? '-',
                        'merk' => $asset->brand ?? '-',
                        'kondisi' => $asset->condition === 'bagus' ? 'Bagus' : 'Rusak',
                        'status' => $this->getStatusLabel($asset->status),
                        'tahun' => $asset->year?->year ?? '-',
                        'harga' => $asset->price ?? 0,
                    ]);
                }
            }

            // Separator antar lokasi
            $data->push([
                'no' => '',
                'lokasi' => '',
                'nomor_lokasi' => '',
                'lantai' => '',
                'unit' => '',
                'nama_aset' => '',
                'nomor_aset' => '',
                'kategori' => '',
                'jenis' => '',
                'merk' => '',
                'kondisi' => '',
                'status' => '',
                'tahun' => '',
                'harga' => '',
            ]);
        }

        return $data;
    }

    protected function getStatusLabel($status): string
    {
        return match($status) {
            'active' => 'Aktif',
            'inactive' => 'Tidak Aktif',
            'repaired' => 'Diperbaiki',
            'transferred' => 'Ditransfer',
            'disposed' => 'Dihapus',
            'deleted' => 'Dihapus',
            default => $status,
        };
    }

    public function headings(): array
    {
        return [
            'No',
            'Lokasi',
            'Nomor Lokasi',
            'Lantai',
            'Unit',
            'Nama Aset',
            'Nomor Aset',
            'Kategori',
            'Jenis Alat',
            'Merk/Brand',
            'Kondisi',
            'Status',
            'Tahun Perolehan',
            'Harga (Rp)',
        ];
    }

    public function title(): string
    {
        if ($this->location) {
            return 'Aset ' . $this->location->name;
        }
        return 'Daftar Aset Per Lokasi';
    }

    public function styles(Worksheet $sheet)
    {
        // Header styling
        $sheet->getStyle('A1:N1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2563EB'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        // Set row height for header
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Format number columns
        $sheet->getStyle('A:A')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('N:N')->getNumberFormat()->setFormatCode('#,##0');

        return [];
    }
}
