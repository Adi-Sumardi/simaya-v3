<x-filament-panels::page>

    <div class="p-6 space-y-4">
        @if ($this->hasInfolist())
            {{-- Menampilkan Infolist --}}
            <div class="bg-white shadow rounded-xl p-6">
                {{ $this->infolist }}
            </div>
        @else
            {{-- Menampilkan Form jika tidak ada infolist --}}
            <div class="bg-white shadow rounded-xl p-6">
                {{ $this->form }}
            </div>
        @endif
    </div>

</x-filament-panels::page>
