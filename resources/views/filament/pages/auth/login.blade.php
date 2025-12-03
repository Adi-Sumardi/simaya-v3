<x-filament-panels::page.simple>
    @php
        $assetCount = \App\Models\Asset::count();
        $unitCount = \App\Models\Unit::count();
        $locationCount = \App\Models\Location::count();
    @endphp

    <div class="login-container">
        {{-- Left Side - Branding --}}
        <div class="login-branding">
            <div class="branding-overlay"></div>
            <div class="branding-content">
                <div class="branding-logo">
                    <img src="{{ asset('images/yapi.png') }}" alt="YAPI Logo" class="logo-img">
                </div>
                <div class="branding-text">
                    <h1 class="branding-title">SIMAYA</h1>
                    <p class="branding-subtitle">Sistem Manajemen Aset<br>Yayasan Asrama Pelajar Islam</p>
                </div>
                <div class="branding-stats">
                    <div class="stat-item">
                        <div class="stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ number_format($unitCount) }}</span>
                            <span class="stat-label">Unit</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ number_format($assetCount) }}</span>
                            <span class="stat-label">Aset</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ number_format($locationCount) }}</span>
                            <span class="stat-label">Lokasi</span>
                        </div>
                    </div>
                </div>
                <div class="branding-features">
                    <div class="feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Manajemen Aset Terpusat</span>
                    </div>
                    <div class="feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>QR Code untuk Setiap Aset</span>
                    </div>
                    <div class="feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Transfer & Disposisi Aset</span>
                    </div>
                    <div class="feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Laporan Real-time</span>
                    </div>
                </div>
            </div>
            {{-- Illustration with Animation --}}
            <div class="branding-illustration">
                <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {{-- Building --}}
                    <g class="building">
                        <rect x="50" y="100" width="120" height="150" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
                        <rect class="window window-1" x="70" y="120" width="25" height="25" fill="rgba(255,255,255,0.2)"/>
                        <rect class="window window-2" x="110" y="120" width="25" height="25" fill="rgba(255,255,255,0.2)"/>
                        <rect class="window window-3" x="70" y="160" width="25" height="25" fill="rgba(255,255,255,0.2)"/>
                        <rect class="window window-4" x="110" y="160" width="25" height="25" fill="rgba(255,255,255,0.2)"/>
                        <rect x="90" y="200" width="40" height="50" fill="rgba(255,255,255,0.15)"/>
                    </g>

                    {{-- Boxes/Assets with float animation --}}
                    <g class="asset-box box-1">
                        <rect x="200" y="180" width="50" height="40" fill="rgba(251,191,36,0.3)" stroke="rgba(251,191,36,0.6)" stroke-width="2" rx="4"/>
                    </g>
                    <g class="asset-box box-2">
                        <rect x="260" y="160" width="50" height="60" fill="rgba(251,191,36,0.3)" stroke="rgba(251,191,36,0.6)" stroke-width="2" rx="4"/>
                    </g>
                    <g class="asset-box box-3">
                        <rect x="320" y="170" width="50" height="50" fill="rgba(251,191,36,0.3)" stroke="rgba(251,191,36,0.6)" stroke-width="2" rx="4"/>
                    </g>

                    {{-- QR Code with pulse animation --}}
                    <g class="qr-code">
                        <rect x="210" y="70" width="60" height="60" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" stroke-width="2" rx="4"/>
                        <rect x="220" y="80" width="10" height="10" fill="rgba(255,255,255,0.5)"/>
                        <rect x="235" y="80" width="10" height="10" fill="rgba(255,255,255,0.5)"/>
                        <rect x="250" y="80" width="10" height="10" fill="rgba(255,255,255,0.5)"/>
                        <rect x="220" y="95" width="10" height="10" fill="rgba(255,255,255,0.5)"/>
                        <rect x="250" y="95" width="10" height="10" fill="rgba(255,255,255,0.5)"/>
                        <rect x="220" y="110" width="10" height="10" fill="rgba(255,255,255,0.5)"/>
                        <rect x="235" y="110" width="10" height="10" fill="rgba(255,255,255,0.5)"/>
                        <rect x="250" y="110" width="10" height="10" fill="rgba(255,255,255,0.5)"/>
                    </g>

                    {{-- Connecting lines with dash animation --}}
                    <line class="connect-line line-1" x1="170" y1="175" x2="200" y2="200" stroke="rgba(251,191,36,0.4)" stroke-width="2" stroke-dasharray="5,5"/>
                    <line class="connect-line line-2" x1="240" y1="130" x2="240" y2="160" stroke="rgba(251,191,36,0.4)" stroke-width="2" stroke-dasharray="5,5"/>

                    {{-- Ground --}}
                    <line x1="30" y1="250" x2="380" y2="250" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>

                    {{-- Floating particles --}}
                    <circle class="particle p1" cx="180" cy="140" r="3" fill="rgba(251,191,36,0.5)"/>
                    <circle class="particle p2" cx="300" cy="120" r="2" fill="rgba(251,191,36,0.4)"/>
                    <circle class="particle p3" cx="350" cy="140" r="2.5" fill="rgba(251,191,36,0.6)"/>
                    <circle class="particle p4" cx="230" cy="240" r="2" fill="rgba(255,255,255,0.3)"/>
                    <circle class="particle p5" cx="280" cy="230" r="3" fill="rgba(255,255,255,0.4)"/>
                </svg>
            </div>
        </div>

        {{-- Right Side - Login Form --}}
        <div class="login-form-container">
            <div class="login-form-wrapper">
                <div class="login-header">
                    <div class="login-logo-mobile">
                        <img src="{{ asset('images/yapi.png') }}" alt="YAPI Logo">
                    </div>
                    <h2 class="login-title">Selamat Datang</h2>
                    <p class="login-subtitle">Silakan masuk ke akun Anda untuk melanjutkan</p>
                </div>

                <x-filament-panels::form wire:submit="authenticate">
                    {{ $this->form }}

                    <x-filament-panels::form.actions
                        :actions="$this->getCachedFormActions()"
                        :full-width="$this->hasFullWidthFormActions()"
                    />
                </x-filament-panels::form>

                <div class="login-security-notice">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span>Koneksi aman terenkripsi</span>
                </div>

                <div class="login-footer">
                    <p>&copy; {{ date('Y') }} Yayasan Asrama Pelajar Islam</p>
                    <p class="login-version">SIMAYA v3.0</p>
                </div>
            </div>
        </div>
    </div>

    <style>
        /* Hide default Filament simple page wrapper */
        .fi-simple-page {
            background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%) !important;
            min-height: 100vh;
        }

        .fi-simple-page > div {
            max-width: 100% !important;
            padding: 0 !important;
        }

        .fi-simple-main {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
        }

        .fi-simple-main-ctn {
            padding: 0 !important;
        }

        /* Hide default Filament header (Simaya + Sign in text) */
        .fi-simple-header {
            display: none !important;
        }

        /* Remove white gap at top */
        .fi-simple-layout {
            padding: 0 !important;
            gap: 0 !important;
            background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%) !important;
        }

        .fi-simple-main-ctn {
            margin: 0 !important;
            min-height: 100vh !important;
        }

        /* Body background */
        body.fi-body {
            background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%) !important;
        }

        /* Main Container */
        .login-container {
            display: flex;
            min-height: 100vh;
            background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
        }

        /* Left Branding Section */
        .login-branding {
            flex: 1;
            display: none;
            position: relative;
            padding: 3rem;
            overflow: hidden;
        }

        @media (min-width: 1024px) {
            .login-branding {
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
        }

        .branding-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.5;
        }

        .branding-content {
            position: relative;
            z-index: 10;
            color: white;
        }

        .branding-logo {
            margin-bottom: 2rem;
        }

        .logo-img {
            height: 80px;
            width: auto;
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
        }

        .branding-title {
            font-size: 3.5rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .branding-subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            line-height: 1.6;
            margin-bottom: 2.5rem;
        }

        .branding-stats {
            display: flex;
            gap: 2rem;
            margin-bottom: 2.5rem;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem 1.25rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }

        .stat-icon {
            width: 40px;
            height: 40px;
            background: rgba(251, 191, 36, 0.2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stat-icon svg {
            width: 24px;
            height: 24px;
            color: #fbbf24;
        }

        .stat-info {
            display: flex;
            flex-direction: column;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #fbbf24;
        }

        .stat-label {
            font-size: 0.875rem;
            opacity: 0.8;
        }

        .branding-features {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .feature-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1rem;
            opacity: 0.9;
        }

        .feature-item svg {
            width: 22px;
            height: 22px;
            color: #34d399;
        }

        .branding-illustration {
            position: absolute;
            bottom: 2rem;
            right: 2rem;
            width: 400px;
            height: 300px;
            opacity: 0.7;
        }

        /* Window blinking animation */
        @keyframes windowBlink {
            0%, 100% { fill: rgba(255,255,255,0.2); }
            50% { fill: rgba(251,191,36,0.4); }
        }

        .window-1 { animation: windowBlink 3s ease-in-out infinite; }
        .window-2 { animation: windowBlink 3s ease-in-out infinite 0.5s; }
        .window-3 { animation: windowBlink 3s ease-in-out infinite 1s; }
        .window-4 { animation: windowBlink 3s ease-in-out infinite 1.5s; }

        /* Asset boxes floating animation */
        @keyframes floatBox {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        .box-1 { animation: floatBox 3s ease-in-out infinite; }
        .box-2 { animation: floatBox 3s ease-in-out infinite 0.3s; }
        .box-3 { animation: floatBox 3s ease-in-out infinite 0.6s; }

        /* QR Code pulse animation */
        @keyframes qrPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.02); }
        }

        .qr-code { animation: qrPulse 2s ease-in-out infinite; }

        /* Connecting lines dash animation */
        @keyframes dashMove {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 20; }
        }

        .connect-line { animation: dashMove 1s linear infinite; }

        /* Floating particles animation */
        @keyframes particleFloat {
            0%, 100% {
                transform: translateY(0) translateX(0);
                opacity: 0.5;
            }
            25% {
                transform: translateY(-15px) translateX(5px);
                opacity: 0.8;
            }
            50% {
                transform: translateY(-25px) translateX(-5px);
                opacity: 0.6;
            }
            75% {
                transform: translateY(-15px) translateX(8px);
                opacity: 0.9;
            }
        }

        .particle { animation: particleFloat 4s ease-in-out infinite; }
        .p1 { animation-delay: 0s; }
        .p2 { animation-delay: 0.5s; }
        .p3 { animation-delay: 1s; }
        .p4 { animation-delay: 1.5s; }
        .p5 { animation-delay: 2s; }

        /* Right Form Section */
        .login-form-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            background: white;
        }

        @media (min-width: 1024px) {
            .login-form-container {
                max-width: 500px;
                border-radius: 24px 0 0 24px;
                margin: 1rem 0;
                box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
            }
        }

        .login-form-wrapper {
            width: 100%;
            max-width: 380px;
        }

        .login-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .login-logo-mobile {
            display: block;
            margin-bottom: 1.5rem;
        }

        .login-logo-mobile img {
            height: 60px;
            width: auto;
            margin: 0 auto;
        }

        @media (min-width: 1024px) {
            .login-logo-mobile {
                display: none;
            }
        }

        .login-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }

        .login-subtitle {
            color: #64748b;
            font-size: 0.95rem;
        }

        /* Form Styling */
        .fi-fo-field-wrp {
            margin-bottom: 1.25rem;
        }

        .fi-input-wrp {
            border-radius: 12px !important;
            border: 2px solid #e2e8f0 !important;
            transition: all 0.2s ease !important;
        }

        .fi-input-wrp:focus-within {
            border-color: #f59e0b !important;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1) !important;
        }

        .fi-input {
            padding: 0.875rem 1rem !important;
        }

        .fi-btn-primary {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 0.875rem 1.5rem !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4) !important;
        }

        .fi-btn-primary:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5) !important;
        }

        .fi-checkbox-input:checked {
            background-color: #f59e0b !important;
            border-color: #f59e0b !important;
        }

        /* Security Notice */
        .login-security-notice {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 2rem;
            padding: 0.75rem;
            background: #f0fdf4;
            border-radius: 8px;
            color: #166534;
            font-size: 0.85rem;
        }

        .login-security-notice svg {
            width: 18px;
            height: 18px;
        }

        /* Footer */
        .login-footer {
            text-align: center;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
        }

        .login-footer p {
            color: #94a3b8;
            font-size: 0.85rem;
            margin: 0;
        }

        .login-version {
            margin-top: 0.25rem !important;
            font-weight: 500;
        }

        /* Dark mode adjustments */
        .dark .login-form-container {
            background: #1e293b;
        }

        .dark .login-title {
            color: #f1f5f9;
        }

        .dark .login-subtitle {
            color: #94a3b8;
        }

        .dark .fi-input-wrp {
            border-color: #334155 !important;
            background: #0f172a !important;
        }

        .dark .login-security-notice {
            background: rgba(34, 197, 94, 0.1);
            color: #4ade80;
        }

        .dark .login-footer {
            border-color: #334155;
        }
    </style>
</x-filament-panels::page.simple>
