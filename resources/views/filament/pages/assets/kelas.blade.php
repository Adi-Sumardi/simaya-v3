<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Data Assets</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    @media print {
      body * {
        visibility: hidden;
      }
      #print-area, #print-area * {
        visibility: visible;
      }
      #print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
    }
  </style>
</head>
<body>

  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand">SIMAYA</a>
    </div>
  </nav>

  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title text-center mb-4">Data Lokasi QR-Code {{ $lokasi->name }}</h5>
            <div class="row">
              <div class="col-md-12">
                <div class="row">
                  <div class="col-md-4">
                    <div id="print-area">
                        <div class="card">
                            <div class="card-body text-center">
                                <div class="bx-border mx-auto" style="width: 380px; height: 380px; border: 1px solid black; position: relative;">
                                    <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                                    <div id="qrcode-{{$id}}" style="width: 360px; height: 360px;"></div>
                                    <img src="{{ asset('images/yapi.png') }}" alt="Logo Tengah"
                                        style="
                                            position: absolute;
                                            top: 50%;
                                            left: 50%;
                                            width: 100px;
                                            height: 100px;
                                            transform: translate(-50%, -50%);
                                            z-index: 5;
                                            background: white;
                                            padding: 5px;
                                            border-radius: 10px;
                                        ">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-start mt-3 mb-3">
                      <button onclick="printQRCode()" class="btn btn-secondary">Print QR-Code</button>
                    </div>
                  </div>
                  <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Detail Lokasi</h5>
                            <p class="card-text">Nama Lokasi: {{ $lokasi->name }}</p>
                            <p class="card-text">Nomor Lokasi: {{ $lokasi->number }}</p>
                            <p class="card-text">Lantai: {{ $lokasi->floor }}</p>
                            <p class="card-text">Unit: {{ $lokasi->unit->name }}</p>
                            <p class="card-text">Jumlah Aset: {{ $lokasi->assets->count() }}</p>
                            <p class="card-text">Tanggal Dibuat: {{ $lokasi->created_at->format('d-m-Y H:i:s') }}</p>
                            <p class="card-text">Tanggal Diupdate: {{ $lokasi->updated_at->format('d-m-Y H:i:s') }}</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-3">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title text-center mb-4">Data Aset di Lokasi {{ $lokasi->name }}</h5>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Aset</th>
                                    <th>Nomor Aset</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($lokasi->assets as $asset)
                                    <tr>
                                        <td>{{ $loop->iteration }}</td>
                                        <td>{{ $asset->name }}</td>
                                        <td>{{ $asset->entries_number }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
  <script src="{{ asset('qrcode.js') }}"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      new QRCode(document.getElementById("qrcode-{{$id}}"), {
        text: "https://simaya.yapi.web.id/guest-data-asset-lokasi/{{$id}}",
        width: 360,
        height: 360,
        colorDark: "#048025",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    });

    function printQRCode() {
      window.print();
    }
  </script>

</body>
</html>
