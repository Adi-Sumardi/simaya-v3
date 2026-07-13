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
            <h5 class="card-title text-center mb-4">Data Detail Asset QR-Code</h5>
            <div class="row">
              <div class="col-md-12">
                <div class="row">
                  <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            @if ($asset->image)
                                <img src="{{ asset('storage/' . $asset->image) }}" class="img-fluid mb-3" alt="Asset Image">
                            @else
                                <img src="{{ asset('images/no-image.png') }}" class="img-fluid mb-3" alt="No Image Available">
                            @endif

                        </div>
                    </div>

                    <div id="print-area" class="mt-3">
                        <div class="card">
                            <div class="card-body text-center">
                                <div class="bx-border mx-auto" style="width: 220px; height: 220px; border: 1px solid black; position: relative;">
                                    <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                                    <div id="qrcode-{{ $id }}" style="width: 200px; height: 200px;"></div>
                                    <img src="{{ asset('images/yapi.png') }}" alt="Logo Tengah"
                                        style="
                                            position: absolute;
                                            top: 50%;
                                            left: 50%;
                                            width: 55px;
                                            height: 55px;
                                            transform: translate(-50%, -50%);
                                            z-index: 5;
                                            background: white;
                                            padding: 3px;
                                            border-radius: 8px;
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
                            <h5 class="card-title">Detail Asset</h5>
                            <p class="card-text">Nama Asset: {{ $asset->name }}</p>
                            <p class="card-text">Nomor Asset: {{ $asset->entries_number }}</p>
                            <p class="card-text">Merk: {{ $asset->brand }}</p>
                            <p class="card-text">Deskripsi: {{ $asset->description }}</p>
                            <p class="card-text">Aktiva: {{ $asset->aktiva->name }}</p>
                            <p class="card-text">Kondisi: {{ $asset->condition }}</p>
                            <p class="card-text">Harga: Rp {{ number_format($asset->price, 0, ',', '.') }}</p>
                            <p class="card-text">Tanggal Perolehan: {{ $asset->aquisition_date }}</p>
                            <p class="card-text">Lokasi: {{ $asset->location->name }}</p>
                            <p class="card-text">Unit: {{ $asset->unit->name }}</p>
                            <p class="card-text">Tanggal Dibuat: {{ $asset->created_at->format('d-m-Y H:i:s') }}</p>
                            <p class="card-text">Tanggal Diupdate: {{ $asset->updated_at->format('d-m-Y H:i:s') }}</p>
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
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
  <script src="{{ asset('qrcode.js') }}"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      new QRCode(document.getElementById("qrcode-{{ $id }}"), {
        text: "https://simaya.yapi.web.id/guest-detail-asset/{{ $id }}",
        width: 200,
        height: 200,
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
