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

class LocationAssetSimpleExport implements FromCollection, WithHeadings, WithTitle, WithStyles, ShouldAutoSize, WithEvents
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
            ->where('status', '!=', 'disposed')
            ->orderBy('name')
            ->orderBy('brand')
            ->orderBy('condition')
            ->get();

        if ($assets->isEmpty()) {
            $this->rowCount = 1;
            return collect([
                [
                    'no' => '-',
                    'nama_barang' => 'Tidak ada aset di lokasi ini',
                    'merk' => '-',
                    'kondisi' => '-',
                    'jumlah' => 0,
                ],
            ]);
        }

        // Group by nama + merk + kondisi
        $grouped = $assets->groupBy(function ($asset) {
            $kondisi = $asset->condition === 'bagus' ? 'Bagus' : 'Rusak';
            return $asset->name . '|' . ($asset->brand ?? '-') . '|' . $kondisi;
        });

        $this->rowCount = $grouped->count();

        $no = 1;
        return $grouped->map(function ($items, $key) use (&$no) {
            [$nama, $merk, $kondisi] = explode('|', $key);

            return [
                'no' => $no++,
                'nama_barang' => $nama,
                'merk' => $merk,
                'kondisi' => $kondisi,
                'jumlah' => $items->count(),
            ];
        })->values();
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Barang',
            'Merk',
            'Kondisi',
            'Jumlah',
        ];
    }

    public function title(): string
    {
        return 'Daftar Aset';
    }

    public function styles(Worksheet $sheet)
    {
        // Header styling
        $sheet->getStyle('A1:E1')->applyFromArray([
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
        $sheet->getStyle('E:E')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

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
                $sheet->mergeCells('A1:E1');
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 14],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                $sheet->setCellValue('A3', 'Lokasi:');
                $sheet->setCellValue('B3', $this->location->name);

                $sheet->setCellValue('A4', 'Unit:');
                $sheet->setCellValue('B4', $this->location->unit?->name ?? '-');

                $sheet->setCellValue('D3', 'Nomor:');
                $sheet->setCellValue('E3', $this->location->number);

                $sheet->setCellValue('D4', 'Lantai:');
                $sheet->setCellValue('E4', $this->location->floor);

                $sheet->getStyle('A3:A4')->getFont()->setBold(true);
                $sheet->getStyle('D3:D4')->getFont()->setBold(true);

                // Style all data rows
                $lastRow = $this->rowCount + 6;
                $sheet->getStyle("A6:E{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                ]);

                // Add total row
                $totalRow = $lastRow + 1;
                $sheet->setCellValue("D{$totalRow}", 'TOTAL:');
                $sheet->setCellValue("E{$totalRow}", "=SUM(E7:E{$lastRow})");
                $sheet->getStyle("D{$totalRow}:E{$totalRow}")->getFont()->setBold(true);
                $sheet->getStyle("D{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle("E{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            },
        ];
    }
}
