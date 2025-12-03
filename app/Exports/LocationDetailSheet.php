<?php

namespace App\Exports;

use App\Models\Location;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Illuminate\Support\Str;

class LocationDetailSheet implements FromCollection, WithHeadings, WithTitle, WithStyles, ShouldAutoSize, WithEvents
{
    protected $location;
    protected $rowCount = 0;

    public function __construct(Location $location)
    {
        $this->location = $location;
    }

    public function collection()
    {
        $assets = $this->location->assets()
            ->with(['category', 'tool', 'year', 'aktiva'])
            ->where('status', '!=', 'disposed')
            ->orderBy('entries_number')
            ->get();

        $this->rowCount = $assets->count();

        if ($assets->isEmpty()) {
            return collect([
                [
                    'no' => '-',
                    'nama_aset' => 'Tidak ada aset di lokasi ini',
                    'nomor_aset' => '-',
                    'kategori' => '-',
                    'jenis' => '-',
                    'merk' => '-',
                    'kondisi' => '-',
                    'status' => '-',
                    'tahun' => '-',
                    'aktiva' => '-',
                    'harga' => 0,
                    'keterangan' => '-',
                ],
            ]);
        }

        $no = 1;
        return $assets->map(function ($asset) use (&$no) {
            return [
                'no' => $no++,
                'nama_aset' => $asset->name,
                'nomor_aset' => $asset->entries_number,
                'kategori' => $asset->category?->name ?? '-',
                'jenis' => $asset->tool?->name ?? '-',
                'merk' => $asset->brand ?? '-',
                'kondisi' => $asset->condition === 'bagus' ? 'Bagus' : 'Rusak',
                'status' => $this->getStatusLabel($asset->status),
                'tahun' => $asset->year?->year ?? '-',
                'aktiva' => $asset->aktiva?->name ?? '-',
                'harga' => $asset->price ?? 0,
                'keterangan' => $asset->description ?? '-',
            ];
        });
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
            'Nama Aset',
            'Nomor Aset',
            'Kategori',
            'Jenis Alat',
            'Merk/Brand',
            'Kondisi',
            'Status',
            'Tahun Perolehan',
            'Aktiva',
            'Harga (Rp)',
            'Keterangan',
        ];
    }

    public function title(): string
    {
        // Sheet name max 31 chars
        $name = $this->location->name;
        if (strlen($name) > 28) {
            $name = substr($name, 0, 28) . '...';
        }
        return Str::slug($name, '_');
    }

    public function styles(Worksheet $sheet)
    {
        // Header styling
        $sheet->getStyle('A1:L1')->applyFromArray([
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

        $sheet->getRowDimension(1)->setRowHeight(25);
        $sheet->getStyle('A:A')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('K:K')->getNumberFormat()->setFormatCode('#,##0');

        return [];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Insert location info at top
                $sheet->insertNewRowBefore(1, 5);

                $sheet->setCellValue('A1', 'DAFTAR ASET LOKASI');
                $sheet->mergeCells('A1:L1');
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 14],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                $sheet->setCellValue('A3', 'Lokasi:');
                $sheet->setCellValue('B3', $this->location->name);
                $sheet->setCellValue('D3', 'Nomor Lokasi:');
                $sheet->setCellValue('E3', $this->location->number);

                $sheet->setCellValue('A4', 'Lantai:');
                $sheet->setCellValue('B4', $this->location->floor);
                $sheet->setCellValue('D4', 'Unit:');
                $sheet->setCellValue('E4', $this->location->unit?->name ?? '-');

                $sheet->getStyle('A3:A4')->getFont()->setBold(true);
                $sheet->getStyle('D3:D4')->getFont()->setBold(true);

                // Style all data rows
                $lastRow = $this->rowCount + 6;
                $sheet->getStyle("A6:L{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                ]);

                // Add total row
                $totalRow = $lastRow + 1;
                $sheet->setCellValue("J{$totalRow}", 'TOTAL:');
                $sheet->setCellValue("K{$totalRow}", "=SUM(K7:K{$lastRow})");
                $sheet->getStyle("J{$totalRow}:K{$totalRow}")->getFont()->setBold(true);
                $sheet->getStyle("K{$totalRow}")->getNumberFormat()->setFormatCode('#,##0');
            },
        ];
    }
}
