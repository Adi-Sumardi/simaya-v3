<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR Code Disposisi - {{ $disposition->disposition_number }}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    @media print {
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
      }
      .card {
        border: 1px solid #000 !important;
      }
    }
    .qr-card {
      width: 220px;
      margin: 10px;
      display: inline-block;
      vertical-align: top;
    }
    .qr-card .card-body {
      padding: 15px;
      text-align: center;
    }
    .badge-type {
      font-size: 0.9rem;
    }
  </style>
</head>
<body>

  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm no-print">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">SIMAYA - Disposisi Aset</a>
      <div class="ms-auto">
        <button onclick="window.print()" class="btn btn-primary btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16">
            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
          </svg>
          Cetak
        </button>
        <a href="{{ url()->previous() }}" class="btn btn-secondary btn-sm ms-2">Kembali</a>
      </div>
    </div>
  </nav>

  <div class="container mt-4">
    <!-- Header Informasi Disposisi -->
    <div class="card mb-4">
      <div class="card-header bg-{{ match($disposition->type) { 'penghapusan' => 'danger', 'hibah' => 'warning', 'sumbangan' => 'info' } }} text-white">
        <h5 class="mb-0">
          {{ match($disposition->type) { 'penghapusan' => 'BERITA ACARA PENGHAPUSAN ASET', 'hibah' => 'BERITA ACARA HIBAH ASET', 'sumbangan' => 'BERITA ACARA SUMBANGAN ASET' } }}
        </h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 text-center">
            <div id="qrcode-main" style="display: inline-block;"></div>
            <p class="mt-2 fw-bold">{{ $disposition->disposition_number }}</p>
          </div>
          <div class="col-md-8">
            <table class="table table-sm table-borderless">
              <tr>
                <td width="150">Nomor Disposisi</td>
                <td>: <strong>{{ $disposition->disposition_number }}</strong></td>
              </tr>
              <tr>
                <td>Tipe</td>
                <td>: <span class="badge bg-{{ match($disposition->type) { 'penghapusan' => 'danger', 'hibah' => 'warning', 'sumbangan' => 'info' } }}">{{ ucfirst($disposition->type) }}</span></td>
              </tr>
              <tr>
                <td>Status</td>
                <td>: <span class="badge bg-{{ match($disposition->status) { 'draft' => 'secondary', 'completed' => 'success', 'cancelled' => 'danger' } }}">{{ ucfirst($disposition->status) }}</span></td>
              </tr>
              <tr>
                <td>Tanggal</td>
                <td>: {{ $disposition->created_at->format('d F Y') }}</td>
              </tr>
              <tr>
                <td>Diproses Oleh</td>
                <td>: {{ $disposition->processedBy->name ?? '-' }}</td>
              </tr>
              <tr>
                <td>Jumlah Aset</td>
                <td>: <strong>{{ $disposition->items->count() }} item</strong></td>
              </tr>
              @if(in_array($disposition->type, ['hibah', 'sumbangan']))
              <tr>
                <td>Penerima</td>
                <td>: {{ $disposition->recipient_name }} {{ $disposition->recipient_organization ? "({$disposition->recipient_organization})" : '' }}</td>
              </tr>
              @endif
            </table>
          </div>
        </div>
        @if($disposition->reason)
        <hr>
        <p class="mb-0"><strong>Alasan:</strong> {{ $disposition->reason }}</p>
        @endif
      </div>
    </div>

    <!-- QR Code per Item -->
    <div class="card mb-4">
      <div class="card-header">
        <h6 class="mb-0">QR Code Per Aset</h6>
      </div>
      <div class="card-body">
        <div class="text-center">
          @foreach($disposition->items as $item)
          <div class="qr-card card">
            <div class="card-body">
              <div id="qrcode-asset-{{ $item->asset->id }}" style="display: inline-block;"></div>
              <hr>
              <p class="mb-1"><strong>{{ $item->asset->name }}</strong></p>
              <p class="mb-1 text-muted small">No: {{ $item->asset->entries_number }}</p>
              <p class="mb-0">
                <span class="badge bg-{{ $item->asset->condition === 'bagus' ? 'success' : 'danger' }}">
                  {{ ucfirst($item->asset->condition) }}
                </span>
              </p>
              @if($item->estimated_value)
              <p class="mb-0 small text-muted mt-1">Nilai: Rp {{ number_format($item->estimated_value, 0, ',', '.') }}</p>
              @endif
            </div>
          </div>
          @endforeach
        </div>
      </div>
    </div>

    <!-- Daftar Aset -->
    <div class="card mb-4">
      <div class="card-header">
        <h6 class="mb-0">Daftar Aset Disposisi</h6>
      </div>
      <div class="card-body p-0">
        <table class="table table-striped table-bordered mb-0">
          <thead class="table-dark">
            <tr>
              <th width="40">No</th>
              <th>Nama Aset</th>
              <th width="120">No. Aset</th>
              <th width="100">Kondisi</th>
              <th width="100">Merk</th>
              <th width="140">Estimasi Nilai</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            @php $totalValue = 0; @endphp
            @foreach($disposition->items as $index => $item)
            @php $totalValue += $item->estimated_value ?? 0; @endphp
            <tr>
              <td>{{ $index + 1 }}</td>
              <td>{{ $item->asset->name }}</td>
              <td>{{ $item->asset->entries_number }}</td>
              <td>
                <span class="badge bg-{{ $item->asset->condition === 'bagus' ? 'success' : 'danger' }}">
                  {{ ucfirst($item->asset->condition) }}
                </span>
              </td>
              <td>{{ $item->asset->brand ?? '-' }}</td>
              <td class="text-end">Rp {{ number_format($item->estimated_value ?? 0, 0, ',', '.') }}</td>
              <td>{{ $item->condition_notes ?? '-' }}</td>
            </tr>
            @endforeach
          </tbody>
          <tfoot class="table-secondary">
            <tr>
              <td colspan="5" class="text-end"><strong>Total Estimasi Nilai:</strong></td>
              <td class="text-end"><strong>Rp {{ number_format($totalValue, 0, ',', '.') }}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Tanda Tangan -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row text-center">
          <div class="col-4">
            <p class="mb-5">Yang Menyerahkan,</p>
            <p class="mb-0">_______________________</p>
            <p class="small text-muted">{{ $disposition->processedBy->name ?? '(Nama)' }}</p>
          </div>
          <div class="col-4">
            <p class="mb-5">Mengetahui,</p>
            <p class="mb-0">_______________________</p>
            <p class="small text-muted">Kepala Yayasan</p>
          </div>
          @if(in_array($disposition->type, ['hibah', 'sumbangan']))
          <div class="col-4">
            <p class="mb-5">Yang Menerima,</p>
            <p class="mb-0">_______________________</p>
            <p class="small text-muted">{{ $disposition->recipient_name ?? '(Penerima)' }}</p>
          </div>
          @else
          <div class="col-4">
            <p class="mb-5">Saksi,</p>
            <p class="mb-0">_______________________</p>
            <p class="small text-muted">(Nama)</p>
          </div>
          @endif
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
  <script src="{{ asset('qrcode.js') }}"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      // QR Code utama untuk disposisi
      new QRCode(document.getElementById("qrcode-main"), {
        text: "{{ route('disposition.detail', $disposition) }}",
        width: 180,
        height: 180,
        colorDark: "#{{ match($disposition->type) { 'penghapusan' => 'dc3545', 'hibah' => 'ffc107', 'sumbangan' => '0dcaf0' } }}",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });

      // QR Code per aset
      @foreach($disposition->items as $item)
      new QRCode(document.getElementById("qrcode-asset-{{ $item->asset->id }}"), {
        text: "{{ route('asset.detail', $item->asset->id) }}",
        width: 100,
        height: 100,
        colorDark: "#048025",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
      @endforeach
    });
  </script>

</body>
</html>
