<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Data Assets</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr" crossorigin="anonymous">
    </head>
  <body>

    <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand">
          SIMAYA
        </a>
      </div>
    </nav>

    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title text-center mb-4">Data Assets QR-Code</h5>
                    <div class="d-print-none">
                        <div class="text-center mb-3">
                            <a href="javascript:window.print()" class="btn btn-secondary waves-effect waves-light">Print</a>
                        </div>
                    </div>
                    <div class="row">
                        @foreach ($dt_assets as $item)
                            <div class="col-2 mb-3">
                                <div class="bx-border" style="width: 180px; height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid black;">
                                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px;">
                                        <div id="qrcode-{{$item->id}}" style="width: 60px; height: 60px;"></div>
                                        <img src="{{ asset('images/yapi.png') }}" style="width: 80px; height: 80px;">
                                    </div>
                                    <div class="text-center" style="font-size: 10px; line-height: 1.2;">
                                        {{$item->unit->number ?? '--'}}/{{$item->aktiva->code ?? '--'}}/{{$item->location->number ?? '--'}}/{{$item->tool->code_name ?? '--'}}/{{$item->category->code ?? '--'}}/{{$item->year->code ?? '--'}}/{{$item->entries_number ?? '--'}}
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js" integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q" crossorigin="anonymous"></script>
    <script src="{{ asset('qrcode.js') }}"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            @foreach ($dt_assets as $item)
                new QRCode(document.getElementById("qrcode-{{$item->id}}"), {
                    text: "https://simaya.yapi.web.id/guest-detail-asset/{{$item->id}}",
                    width: 60,
                    height: 60,
                    colorDark: "#048025",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
            @endforeach
        });
    </script>

  </body>
</html>
