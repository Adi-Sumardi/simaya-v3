<?php

namespace App\Exports;

use App\Models\Location;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class LocationSummarySheet implements FromCollection, WithHeadings, WithTitle, WithStyles, ShouldAutoSize
{
    protected $unitId;

    public function __construct($unitId = null)
    {
        $this->unitId = $unitId;
    }

    public function collection()
    {
        $query = Location::with(['unit', 'assets' => function ($q) {
            $q->where('status', '!=', 'disposed');
        }]);

        if ($this->unitId) {
            $query->where('unit_id', $this->unitId);
        }

        $locations = $query->orderBy('unit_id')->orderBy('name')->get();

        $no = 1;
        return $locations->map(function ($location) use (&$no) {
            $assets = $location->assets;
            $totalValue = $assets->sum('price');
            $goodCount = $assets->where('condition', 'bagus')->count();
            $damagedCount = $assets->where('condition', 'rusak')->count();

            return [
                'no' => $no++,
                'unit' => $location->unit?->name ?? '-',
                'lokasi' => $location->name,
                'nomor_lokasi' => $location->number,
                'lantai' => $location->floor,
                'jumlah_aset' => $assets->count(),
                'kondisi_bagus' => $goodCount,
                'kondisi_rusak' => $damagedCount,
                'total_nilai' => $totalValue,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'Unit',
            'Nama Lokasi',
            'Nomor Lokasi',
            'Lantai',
            'Jumlah Aset',
            'Kondisi Bagus',
            'Kondisi Rusak',
            'Total Nilai (Rp)',
        ];
    }

    public function title(): string
    {
        return 'Ringkasan Lokasi';
    }

    public function styles(Worksheet $sheet)
    {
        // Header styling
        $sheet->getStyle('A1:I1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '059669'],
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
        $sheet->getStyle('F:H')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('I:I')->getNumberFormat()->setFormatCode('#,##0');

        return [];
    }
}
