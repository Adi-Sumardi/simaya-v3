<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">
            <div class="flex items-center gap-2">
                <span>Rekap Pergerakan Aset</span>
                <x-filament::badge color="primary" size="sm">Baru</x-filament::badge>
            </div>
        </x-slot>

        <x-slot name="headerEnd">
            <div class="flex flex-wrap items-end gap-3">
                @unless ($lockUnit)
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Unit</label>
                        <x-filament::input.wrapper>
                            <x-filament::input.select wire:model.live="unitId">
                                <option value="">Semua Unit</option>
                                @foreach ($this->getUnits() as $unit)
                                    <option value="{{ $unit->id }}">{{ $unit->name }}</option>
                                @endforeach
                            </x-filament::input.select>
                        </x-filament::input.wrapper>
                    </div>
                @endunless

                <div class="flex flex-col gap-1">
                    <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Lokasi</label>
                    <x-filament::input.wrapper>
                        <x-filament::input.select wire:model.live="locationId" :disabled="! $unitId">
                            <option value="">Semua Lokasi</option>
                            @foreach ($this->getLocations() as $location)
                                <option value="{{ $location->id }}">{{ $location->name }}</option>
                            @endforeach
                        </x-filament::input.select>
                    </x-filament::input.wrapper>
                </div>
            </div>
        </x-slot>

        @if ($this->getScopeLevel() === 'location')
            @php($recap = $this->getLocationRecap())

            <div class="grid grid-cols-1 gap-4 border-b border-gray-200 pb-4 sm:grid-cols-3 dark:border-white/10">
                <div>
                    <div class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Barang Masuk Baru</div>
                    <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ number_format($recap['masuk']) }}</div>
                </div>
                <div>
                    <div class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Barang Keluar</div>
                    <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ number_format($recap['keluar']) }}</div>
                </div>
                <div>
                    <div class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Aktif (OK)</div>
                    <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ number_format($recap['aktif']) }}</div>
                </div>
            </div>

            <h4 class="mt-4 text-sm font-semibold text-gray-950 dark:text-white">
                Rekap Aset di Lokasi {{ $recap['location_name'] }}
            </h4>

            <div class="mt-2 overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-white/10">
                            <th class="w-12 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">No</th>
                            <th class="py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Nama Aset</th>
                            <th class="py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($recap['assets'] as $name => $count)
                            <tr class="border-b border-gray-100 dark:border-white/5">
                                <td class="py-2 text-gray-500 dark:text-gray-400">{{ $loop->iteration }}</td>
                                <td class="py-2 text-gray-950 dark:text-white">{{ $name }}</td>
                                <td class="py-2 text-right tabular-nums text-gray-950 dark:text-white">{{ $count }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="3" class="py-4 text-center text-gray-500 dark:text-gray-400">Tidak ada aset di lokasi ini</td>
                            </tr>
                        @endforelse
                        @if ($recap['assets']->isNotEmpty())
                            <tr class="font-bold">
                                <td></td>
                                <td class="py-2 text-gray-950 dark:text-white">Total</td>
                                <td class="py-2 text-right tabular-nums text-gray-950 dark:text-white">{{ $recap['total_assets'] }}</td>
                            </tr>
                        @endif
                    </tbody>
                </table>
            </div>
        @else
            @php($data = $this->getRows())

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-white/10">
                            <th class="w-12 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">No</th>
                            <th class="py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                {{ $this->getScopeLevel() === 'unit-locations' ? 'Lokasi' : 'Unit' }}
                            </th>
                            <th class="py-2 text-right text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Barang Masuk Baru</th>
                            <th class="py-2 text-right text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Barang Keluar</th>
                            <th class="py-2 text-right text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">Total Aktif (OK)</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($data['rows'] as $row)
                            <tr class="border-b border-gray-100 dark:border-white/5">
                                <td class="py-2 text-gray-500 dark:text-gray-400">{{ $loop->iteration }}</td>
                                <td class="py-2 text-gray-950 dark:text-white">{{ $row['label'] }}</td>
                                <td class="py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{{ $row['masuk'] }}</td>
                                <td class="py-2 text-right tabular-nums text-amber-600 dark:text-amber-400">{{ $row['keluar'] }}</td>
                                <td class="py-2 text-right tabular-nums text-primary-600 dark:text-primary-400">{{ $row['aktif'] }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="py-4 text-center text-gray-500 dark:text-gray-400">Tidak ada data</td>
                            </tr>
                        @endforelse
                        @if (! empty($data['rows']))
                            <tr class="font-bold">
                                <td></td>
                                <td class="py-2 text-gray-950 dark:text-white">{{ $data['total']['label'] }}</td>
                                <td class="py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{{ $data['total']['masuk'] }}</td>
                                <td class="py-2 text-right tabular-nums text-amber-600 dark:text-amber-400">{{ $data['total']['keluar'] }}</td>
                                <td class="py-2 text-right tabular-nums text-primary-600 dark:text-primary-400">{{ $data['total']['aktif'] }}</td>
                            </tr>
                        @endif
                    </tbody>
                </table>
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
