<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Detail Disposisi - {{ $disposition->disposition_number }}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">SIMAYA - Detail Disposisi Aset</a>
    </div>
  </nav>

  <div class="container mt-4">
    <!-- Header -->
    <div class="card mb-4">
      <div class="card-header bg-{{ match($disposition->type) { 'penghapusan' => 'danger', 'hibah' => 'warning', 'sumbangan' => 'info' } }} text-white">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ $disposition->disposition_number }}</h5>
          <span class="badge bg-{{ match($disposition->status) { 'draft' => 'secondary', 'completed' => 'success', 'cancelled' => 'danger' } }} fs-6">
            {{ ucfirst($disposition->status) }}
          </span>
        </div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <h6 class="text-muted">Informasi Disposisi</h6>
            <table class="table table-sm table-borderless">
              <tr>
                <td width="150">Tipe Disposisi</td>
                <td>: <span class="badge bg-{{ match($disposition->type) { 'penghapusan' => 'danger', 'hibah' => 'warning', 'sumbangan' => 'info' } }}">{{ ucfirst($disposition->type) }}</span></td>
              </tr>
              <tr>
                <td>Tanggal Dibuat</td>
                <td>: {{ $disposition->created_at->format('d F Y, H:i') }}</td>
              </tr>
              <tr>
                <td>Diproses Oleh</td>
                <td>: {{ $disposition->processedBy->name ?? '-' }}</td>
              </tr>
              @if($disposition->completed_at)
              <tr>
                <td>Tanggal Selesai</td>
                <td>: {{ $disposition->completed_at->format('d F Y, H:i') }}</td>
              </tr>
              @endif
              <tr>
                <td>Jumlah Aset</td>
                <td>: <strong>{{ $disposition->items->count() }} item</strong></td>
              </tr>
            </table>
          </div>
          @if(in_array($disposition->type, ['hibah', 'sumbangan']))
          <div class="col-md-6">
            <h6 class="text-muted">Informasi Penerima</h6>
            <table class="table table-sm table-borderless">
              <tr>
                <td width="150">Nama</td>
                <td>: {{ $disposition->recipient_name ?? '-' }}</td>
              </tr>
              <tr>
                <td>Organisasi</td>
                <td>: {{ $disposition->recipient_organization ?? '-' }}</td>
              </tr>
              <tr>
                <td>Telepon</td>
                <td>: {{ $disposition->recipient_phone ?? '-' }}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: {{ $disposition->recipient_address ?? '-' }}</td>
              </tr>
            </table>
          </div>
          @endif
        </div>

        @if($disposition->reason)
        <hr>
        <h6 class="text-muted">Alasan Disposisi</h6>
        <p>{{ $disposition->reason }}</p>
        @endif

        @if($disposition->notes)
        <h6 class="text-muted">Catatan</h6>
        <p>{{ $disposition->notes }}</p>
        @endif
      </div>
    </div>

    <!-- Daftar Aset -->
    <div class="card mb-4">
      <div class="card-header">
        <h6 class="mb-0">Daftar Aset</h6>
      </div>
      <div class="card-body p-0">
        <table class="table table-striped mb-0">
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
              <td>
                <a href="{{ route('asset.detail', $item->asset->id) }}" target="_blank">
                  {{ $item->asset->name }}
                </a>
              </td>
              <td><code>{{ $item->asset->entries_number }}</code></td>
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

    <!-- Dokumen -->
    @if($disposition->document_number || $disposition->document_file)
    <div class="card mb-4">
      <div class="card-header">
        <h6 class="mb-0">Dokumen Pendukung</h6>
      </div>
      <div class="card-body">
        <p><strong>Nomor Dokumen:</strong> {{ $disposition->document_number ?? '-' }}</p>
        <p><strong>Tanggal Dokumen:</strong> {{ $disposition->document_date ? $disposition->document_date->format('d F Y') : '-' }}</p>
        @if($disposition->document_file)
        <a href="{{ asset('storage/' . $disposition->document_file) }}" target="_blank" class="btn btn-outline-primary btn-sm">
          Lihat Dokumen
        </a>
        @endif
      </div>
    </div>
    @endif
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
