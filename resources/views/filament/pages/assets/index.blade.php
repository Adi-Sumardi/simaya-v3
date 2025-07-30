<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Data Assets</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">

  <style>
    @page {
      size: landscape;
      margin: 0.5cm;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }

      .no-break {
        page-break-inside: avoid;
      }

      .print-page {
        margin: 0;
        padding: 0;
        width: 29.7cm;
        height: 21cm;
      }

      .d-print-none {
        display: none !important;
      }
    }

    .bx-border {
      width: 3.4cm;
      height: 2cm;
      border: 1px solid black;
      padding: 0.1cm;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
    }

    .qr-row {
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      margin-bottom: 0.1cm;
    }

    .qr-image {
      width: 1.5cm;
      height: 1.5cm;
      margin-left: 0.2cm;
    }

    .qr-code {
      width: 1cm;
      height: 1cm;
    }

    .asset-text {
      font-size: 7px;
      text-align: center;
      line-height: 1.1;
      word-wrap: break-word;
    }
  </style>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm d-print-none">
  <div class="container-fluid">
    <a class="navbar-brand">SIMAYA</a>
  </div>
</nav>

<div class="container-fluid mt-4 print-page">
  <div class="text-center d-print-none mb-3">
    <a href="javascript:window.print()" class="btn btn-secondary">Print</a>
  </div>

  <h5 class="text-center mb-4">Data Assets QR-Code</h5>

  <div class="d-flex flex-wrap justify-content-start gap-1">
    @foreach ($dt_assets as $item)
      <div class="no-break">
        <div class="bx-border">
          <div class="qr-row">
            <div id="qrcode-{{$item->id}}" class="qr-code"></div>
            <img src="{{ asset('images/yapi.png') }}" class="qr-image" alt="Logo">
          </div>
          <div class="asset-text">
            {{$item->unit->number ?? '--'}}/{{$item->aktiva->code ?? '--'}}/{{$item->location->number ?? '--'}}/{{$item->tool->code_name ?? '--'}}/{{$item->category->code ?? '--'}}/{{$item->year->code ?? '--'}}/{{$item->entries_number ?? '--'}}
          </div>
        </div>
      </div>
    @endforeach
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
<script src="{{ asset('qrcode.js') }}"></script>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    @foreach ($dt_assets as $item)
      new QRCode(document.getElementById("qrcode-{{$item->id}}"), {
        text: "https://simaya.yapi.web.id/guest-detail-asset/{{$item->id}}",
        width: 50,
        height: 50,
        colorDark: "#048025",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    @endforeach
  });
</script>

</body>
</html>
