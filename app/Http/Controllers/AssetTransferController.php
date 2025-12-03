<?php

namespace App\Http\Controllers;

use App\Models\AssetTransfer;
use Barryvdh\DomPDF\Facade\Pdf;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

class AssetTransferController extends Controller
{
    /**
     * Print Berita Acara Serah Terima
     */
    public function print(AssetTransfer $transfer)
    {
        // Load relationships
        $transfer->load([
            'fromUnit',
            'fromLocation',
            'toLocation',
            'requestedBy',
            'approvedBy',
            'items.asset'
        ]);

        // Generate QR code as base64
        $qrCodeBase64 = $this->generateQrCode(route('transfer.view', $transfer));

        $pdf = Pdf::loadView('pdf.berita-acara-transfer', [
            'transfer' => $transfer,
            'qrCodeBase64' => $qrCodeBase64,
        ]);

        $pdf->setPaper('A4', 'portrait');

        return $pdf->stream("Berita-Acara-{$transfer->transfer_number}.pdf");
    }

    /**
     * Public view for Berita Acara (accessible via QR Code)
     */
    public function view(AssetTransfer $transfer)
    {
        $transfer->load([
            'fromUnit',
            'fromLocation',
            'toLocation',
            'requestedBy',
            'approvedBy',
            'items.asset'
        ]);

        return view('filament.pages.transfer.detail', compact('transfer'));
    }

    /**
     * Generate QR Code as base64 using chillerlan/php-qrcode
     */
    private function generateQrCode(string $data): string
    {
        $options = new QROptions([
            'outputType' => QRCode::OUTPUT_IMAGE_PNG,
            'scale' => 5,
            'imageBase64' => true,
        ]);

        $qrcode = new QRCode($options);

        return $qrcode->render($data);
    }
}
