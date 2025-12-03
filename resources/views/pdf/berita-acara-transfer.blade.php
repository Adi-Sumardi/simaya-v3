<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Berita Acara Serah Terima - {{ $transfer->transfer_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
        }

        .container {
            padding: 20px 40px;
        }

        .header {
            margin-bottom: 20px;
            border-bottom: 3px double #000;
            padding-bottom: 15px;
        }

        .header-table {
            width: 100%;
        }

        .header-table td {
            vertical-align: middle;
        }

        .header-logo {
            width: 80px;
        }

        .header-logo img {
            width: 70px;
            height: auto;
        }

        .header-qr {
            width: 80px;
            text-align: right;
        }

        .header-qr img {
            width: 70px;
            height: 70px;
        }

        .header-text {
            text-align: center;
        }

        .header-text h1 {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .header-text h2 {
            font-size: 16pt;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 3px;
        }

        .header-text p {
            font-size: 11pt;
        }

        .header-text .subtitle {
            font-size: 10pt;
            color: #333;
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 12pt;
        }

        .info-table {
            width: 100%;
            margin-bottom: 15px;
        }

        .info-table td {
            padding: 3px 0;
            vertical-align: top;
        }

        .info-table td:first-child {
            width: 150px;
        }

        .info-table td:nth-child(2) {
            width: 10px;
        }

        .asset-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .asset-table th,
        .asset-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-size: 10pt;
        }

        .asset-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }

        .asset-table td.center {
            text-align: center;
        }

        .asset-photo {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border: 1px solid #ddd;
        }

        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }

        .signature-table {
            width: 100%;
        }

        .signature-table td {
            width: 50%;
            text-align: center;
            padding: 10px;
            vertical-align: top;
        }

        .signature-box {
            margin-top: 10px;
        }

        .signature-line {
            margin-top: 80px;
            border-bottom: 1px solid #000;
            width: 200px;
            margin-left: auto;
            margin-right: auto;
        }

        .signature-name {
            margin-top: 5px;
            font-weight: bold;
        }

        .footer {
            margin-top: 30px;
            font-size: 10pt;
            text-align: center;
            color: #666;
        }

        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 3px;
            font-size: 10pt;
            font-weight: bold;
        }

        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-approved { background-color: #d1fae5; color: #065f46; }
        .status-rejected { background-color: #fee2e2; color: #991b1b; }
        .status-completed { background-color: #dbeafe; color: #1e40af; }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <table class="header-table">
                <tr>
                    <td class="header-logo">
                        <img src="{{ public_path('images/yapi.png') }}" alt="Logo YAPI">
                    </td>
                    <td class="header-text">
                        <h1>YAYASAN ASRAMA PELAJAR ISLAM</h1>
                        <h2>BERITA ACARA SERAH TERIMA ASET</h2>
                        <p>Nomor: {{ $transfer->transfer_number }}</p>
                    </td>
                    <td class="header-qr">
                        @if($qrCodeBase64)
                            <img src="{{ $qrCodeBase64 }}" alt="QR Code">
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <!-- Introduction -->
        @php
            // Helper function untuk format tanggal Indonesia
            function formatTanggalIndo($date, $withTime = false) {
                $carbon = \Carbon\Carbon::parse($date);
                $bulanIndo = [
                    1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
                    5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
                    9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
                ];
                $format = $carbon->day . ' ' . $bulanIndo[$carbon->month] . ' ' . $carbon->year;
                if ($withTime) {
                    $format .= ', ' . $carbon->format('H:i');
                }
                return $format;
            }

            function getHariIndo($date) {
                $carbon = \Carbon\Carbon::parse($date);
                $hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                return $hariIndo[$carbon->dayOfWeek];
            }

            $tanggalBA = $transfer->approved_at ?? $transfer->created_at;
        @endphp
        <div class="section">
            <p style="text-align: justify;">
                Pada hari ini, <strong>{{ getHariIndo($tanggalBA) }}</strong>,
                tanggal <strong>{{ formatTanggalIndo($tanggalBA) }}</strong>,
                telah dilaksanakan serah terima aset dengan rincian sebagai berikut:
            </p>
        </div>

        <!-- Transfer Information -->
        <div class="section">
            <div class="section-title">I. INFORMASI TRANSFER</div>
            <table class="info-table">
                <tr>
                    <td>Nomor Transfer</td>
                    <td>:</td>
                    <td><strong>{{ $transfer->transfer_number }}</strong></td>
                </tr>
                <tr>
                    <td>Status</td>
                    <td>:</td>
                    <td>
                        <span class="status-badge status-{{ $transfer->status }}">
                            {{ strtoupper($transfer->status) }}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>Tanggal Pengajuan</td>
                    <td>:</td>
                    <td>{{ formatTanggalIndo($transfer->created_at, true) }}</td>
                </tr>
                @if($transfer->approved_at)
                <tr>
                    <td>Tanggal Persetujuan</td>
                    <td>:</td>
                    <td>{{ formatTanggalIndo($transfer->approved_at, true) }}</td>
                </tr>
                @endif
                @if($transfer->completed_at)
                <tr>
                    <td>Tanggal Selesai</td>
                    <td>:</td>
                    <td>{{ formatTanggalIndo($transfer->completed_at, true) }}</td>
                </tr>
                @endif
            </table>
        </div>

        <!-- From Information -->
        <div class="section">
            <div class="section-title">II. PIHAK YANG MENYERAHKAN</div>
            <table class="info-table">
                <tr>
                    <td>Unit</td>
                    <td>:</td>
                    <td>{{ $transfer->fromUnit->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td>Lokasi Asal</td>
                    <td>:</td>
                    <td>{{ $transfer->fromLocation->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td>Diajukan Oleh</td>
                    <td>:</td>
                    <td>{{ $transfer->requestedBy->name ?? '-' }}</td>
                </tr>
            </table>
        </div>

        <!-- To Information -->
        <div class="section">
            <div class="section-title">III. PIHAK YANG MENERIMA</div>
            <table class="info-table">
                <tr>
                    <td>Lokasi Tujuan</td>
                    <td>:</td>
                    <td>{{ $transfer->toLocation->name ?? '-' }} (Gudang Yayasan)</td>
                </tr>
                @if($transfer->approvedBy)
                <tr>
                    <td>Diterima Oleh</td>
                    <td>:</td>
                    <td>{{ $transfer->approvedBy->name }} (Manajer)</td>
                </tr>
                @endif
            </table>
        </div>

        <!-- Reason -->
        <div class="section">
            <div class="section-title">IV. ALASAN TRANSFER</div>
            <p style="text-align: justify; padding-left: 10px;">
                {{ $transfer->reason }}
            </p>
        </div>

        @if($transfer->rejection_reason)
        <div class="section">
            <div class="section-title">V. ALASAN PENOLAKAN</div>
            <p style="text-align: justify; padding-left: 10px; color: #991b1b;">
                {{ $transfer->rejection_reason }}
            </p>
        </div>
        @endif

        <!-- Asset List -->
        <div class="section">
            <div class="section-title">{{ $transfer->rejection_reason ? 'VI' : 'V' }}. DAFTAR ASET YANG DISERAHTERIMAKAN</div>
            <table class="asset-table">
                <thead>
                    <tr>
                        <th style="width: 30px;">No</th>
                        <th>Nama Aset</th>
                        <th style="width: 100px;">Nomor Aset</th>
                        <th style="width: 80px;">Kondisi</th>
                        <th>Catatan</th>
                        <th style="width: 70px;">Foto</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($transfer->items as $index => $item)
                    <tr>
                        <td class="center">{{ $index + 1 }}</td>
                        <td>{{ $item->asset->name ?? '-' }}</td>
                        <td class="center">{{ $item->asset->entries_number ?? '-' }}</td>
                        <td class="center">{{ ucfirst($item->asset->condition ?? '-') }}</td>
                        <td>{{ $item->condition_notes ?? '-' }}</td>
                        <td class="center">
                            @if($item->photo_before)
                                <img src="{{ public_path('storage/' . $item->photo_before) }}" class="asset-photo" alt="Foto Aset">
                            @elseif($item->asset->image)
                                <img src="{{ public_path('storage/' . $item->asset->image) }}" class="asset-photo" alt="Foto Aset">
                            @else
                                <span style="font-size: 8pt; color: #999;">No Photo</span>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="center">Tidak ada aset dalam transfer ini</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
            <p><strong>Total Aset: {{ $transfer->items->count() }} item</strong></p>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="section-title">{{ $transfer->rejection_reason ? 'VII' : 'VI' }}. TANDA TANGAN</div>
            <table class="signature-table">
                <tr>
                    <td>
                        <div class="signature-box">
                            <p><strong>Yang Menyerahkan,</strong></p>
                            <div class="signature-line"></div>
                            <p class="signature-name">{{ $transfer->requestedBy->name ?? '........................' }}</p>
                            <p style="font-size: 10pt;">Pemohon</p>
                        </div>
                    </td>
                    <td>
                        <div class="signature-box">
                            <p><strong>Yang Menerima,</strong></p>
                            <div class="signature-line"></div>
                            <p class="signature-name">{{ $transfer->approvedBy->name ?? '........................' }}</p>
                            <p style="font-size: 10pt;">Manajer</p>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Dokumen ini dicetak pada {{ formatTanggalIndo(now(), true) }}</p>
            <p>SIMAYA - Sistem Manajemen Aset Yayasan Asrama Pelajar Islam</p>
        </div>
    </div>
</body>
</html>
