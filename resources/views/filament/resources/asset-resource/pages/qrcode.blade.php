<x-filament-panels::page>

<div class="row" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
    @foreach ($assets as $item)
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

        <script src="{{ asset('qrcode.js') }}"></script>
        <script type="text/javascript">
            var qrcode = new QRCode(document.getElementById("qrcode-{{$item->id}}"), {
                text: "https://simaya.yapi.web.id/guest-detail-asset/{{$item->id}}",
                width: 60,
                height: 60,
                colorDark: "#048025",
                colorLight: "#ffffff"
            });
        </script>
    @endforeach
</div>

</x-filament-panels::page>
