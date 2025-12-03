<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Berita Acara Serah Terima - {{ $transfer->transfer_number }}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .status-badge {
      font-size: 0.9rem;
    }
    .status-pending { background-color: #fef3c7 !important; color: #92400e !important; }
    .status-approved { background-color: #d1fae5 !important; color: #065f46 !important; }
    .status-rejected { background-color: #fee2e2 !important; color: #991b1b !important; }
    .status-completed { background-color: #dbeafe !important; color: #1e40af !important; }
    .asset-photo {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }
  </style>
</head>
<body class="bg-light">

  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container">
      <a class="navbar-brand" href="#">
        <img src="{{ asset('images/yapi.png') }}" alt="YAPI" height="40" class="me-2">
        SIMAYA - Berita Acara Serah Terima Aset
      </a>
    </div>
  </nav>

  <div class="container py-4">
    @php
      $bulanIndo = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
      ];
      $hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      $formatTanggal = function($date, $withTime = false) use ($bulanIndo) {
        $carbon = \Carbon\Carbon::parse($date);
        $format = $carbon->day . ' ' . $bulanIndo[$carbon->month] . ' ' . $carbon->year;
        if ($withTime) {
          $format .= ', ' . $carbon->format('H:i');
        }
        return $format;
      };

      $getHari = function($date) use ($hariIndo) {
        $carbon = \Carbon\Carbon::parse($date);
        return $hariIndo[$carbon->dayOfWeek];
      };

      $tanggalBA = $transfer->approved_at ?? $transfer->created_at;
    @endphp

    <!-- Header Card -->
    <div class="card mb-4 shadow-sm">
      <div class="card-header bg-primary text-white">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-0">{{ $transfer->transfer_number }}</h4>
            <small>Berita Acara Serah Terima Aset</small>
          </div>
          <span class="badge status-badge status-{{ $transfer->status }}">
            {{ strtoupper($transfer->status) }}
          </span>
        </div>
      </div>
      <div class="card-body">
        <p class="lead">
          Pada hari <strong>{{ $getHari($tanggalBA) }}</strong>,
          tanggal <strong>{{ $formatTanggal($tanggalBA) }}</strong>,
          telah dilaksanakan serah terima aset dengan rincian sebagai berikut:
        </p>
      </div>
    </div>

    <div class="row">
      <!-- Informasi Transfer -->
      <div class="col-md-6 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header">
            <h6 class="mb-0">Informasi Transfer</h6>
          </div>
          <div class="card-body">
            <table class="table table-sm table-borderless mb-0">
              <tr>
                <td width="150">Nomor Transfer</td>
                <td>: <strong>{{ $transfer->transfer_number }}</strong></td>
              </tr>
              <tr>
                <td>Tanggal Pengajuan</td>
                <td>: {{ $formatTanggal($transfer->created_at, true) }}</td>
              </tr>
              @if($transfer->approved_at)
              <tr>
                <td>Tanggal Persetujuan</td>
                <td>: {{ $formatTanggal($transfer->approved_at, true) }}</td>
              </tr>
              @endif
              @if($transfer->completed_at)
              <tr>
                <td>Tanggal Selesai</td>
                <td>: {{ $formatTanggal($transfer->completed_at, true) }}</td>
              </tr>
              @endif
            </table>
          </div>
        </div>
      </div>

      <!-- Pihak Terkait -->
      <div class="col-md-6 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header">
            <h6 class="mb-0">Pihak Terkait</h6>
          </div>
          <div class="card-body">
            <h6 class="text-muted small">Yang Menyerahkan:</h6>
            <table class="table table-sm table-borderless">
              <tr>
                <td width="100">Unit</td>
                <td>: {{ $transfer->fromUnit->name ?? '-' }}</td>
              </tr>
              <tr>
                <td>Lokasi Asal</td>
                <td>: {{ $transfer->fromLocation->name ?? '-' }}</td>
              </tr>
              <tr>
                <td>Diajukan Oleh</td>
                <td>: {{ $transfer->requestedBy->name ?? '-' }}</td>
              </tr>
            </table>

            <h6 class="text-muted small mt-3">Yang Menerima:</h6>
            <table class="table table-sm table-borderless mb-0">
              <tr>
                <td width="100">Lokasi Tujuan</td>
                <td>: {{ $transfer->toLocation->name ?? '-' }}</td>
              </tr>
              @if($transfer->approvedBy)
              <tr>
                <td>Diterima Oleh</td>
                <td>: {{ $transfer->approvedBy->name }}</td>
              </tr>
              @endif
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Alasan Transfer -->
    <div class="card mb-4 shadow-sm">
      <div class="card-header">
        <h6 class="mb-0">Alasan Transfer</h6>
      </div>
      <div class="card-body">
        <p class="mb-0">{{ $transfer->reason }}</p>
      </div>
    </div>

    @if($transfer->rejection_reason)
    <div class="card mb-4 shadow-sm border-danger">
      <div class="card-header bg-danger text-white">
        <h6 class="mb-0">Alasan Penolakan</h6>
      </div>
      <div class="card-body">
        <p class="mb-0 text-danger">{{ $transfer->rejection_reason }}</p>
      </div>
    </div>
    @endif

    <!-- Daftar Aset -->
    <div class="card mb-4 shadow-sm">
      <div class="card-header">
        <h6 class="mb-0">Daftar Aset yang Diserahterimakan</h6>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-striped mb-0">
            <thead class="table-dark">
              <tr>
                <th width="40">No</th>
                <th>Nama Aset</th>
                <th width="120">Nomor Aset</th>
                <th width="100">Kondisi</th>
                <th>Catatan</th>
                <th width="80">Foto</th>
              </tr>
            </thead>
            <tbody>
              @forelse($transfer->items as $index => $item)
              <tr>
                <td>{{ $index + 1 }}</td>
                <td>
                  <a href="{{ route('asset.detail', $item->asset->id) }}" target="_blank">
                    {{ $item->asset->name ?? '-' }}
                  </a>
                </td>
                <td><code>{{ $item->asset->entries_number ?? '-' }}</code></td>
                <td>
                  <span class="badge bg-{{ ($item->asset->condition ?? '') === 'bagus' ? 'success' : 'warning' }}">
                    {{ ucfirst($item->asset->condition ?? '-') }}
                  </span>
                </td>
                <td>{{ $item->condition_notes ?? '-' }}</td>
                <td>
                  @if($item->photo_before)
                    <img src="{{ asset('storage/' . $item->photo_before) }}" class="asset-photo" alt="Foto Aset">
                  @elseif($item->asset->image)
                    <img src="{{ asset('storage/' . $item->asset->image) }}" class="asset-photo" alt="Foto Aset">
                  @else
                    <span class="text-muted small">No Photo</span>
                  @endif
                </td>
              </tr>
              @empty
              <tr>
                <td colspan="6" class="text-center text-muted">Tidak ada aset dalam transfer ini</td>
              </tr>
              @endforelse
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer">
        <strong>Total Aset: {{ $transfer->items->count() }} item</strong>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center text-muted small py-3">
      <p class="mb-1">SIMAYA - Sistem Manajemen Aset Yayasan Asrama Pelajar Islam</p>
      <p class="mb-0">Dokumen ini dapat diakses secara publik melalui QR Code pada Berita Acara</p>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
