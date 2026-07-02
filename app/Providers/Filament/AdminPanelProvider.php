<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use BezhanSalleh\FilamentShield\FilamentShieldPlugin;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use App\Filament\Pages\Auth\Login;
use Filament\Pages;
use Filament\Pages\Auth\EditProfile;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login(Login::class)
            ->spa()
            ->sidebarCollapsibleOnDesktop()
            ->colors([
                'danger' => Color::Red,
                'gray' => Color::Zinc,
                'info' => Color::Blue,
                'primary' => Color::Amber,
                'success' => Color::Green,
                'warning' => Color::Yellow,
                'secondary' => Color::Gray,
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                Widgets\AccountWidget::class,
                // Widgets\FilamentInfoWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
                \App\Http\Middleware\PreventRequestsCaching::class,
            ])
            ->plugins([
                FilamentShieldPlugin::make(),
            ])
            ->authMiddleware([
                Authenticate::class,
            ])
            ->profile(EditProfile::class)
            ->renderHook(
                \Filament\View\PanelsRenderHook::HEAD_END,
                fn (): string => \Illuminate\Support\Facades\Blade::render('
                    <script>
                        (function() {
                            const appVersion = "v3.3.14_b2";
                            if (localStorage.getItem("simaya_app_version") !== appVersion) {
                                localStorage.setItem("simaya_app_version", appVersion);
                                try {
                                    const links = document.querySelectorAll(\'link[rel="stylesheet"]\');
                                    links.forEach(link => {
                                        const url = new URL(link.href);
                                        if (url.origin === window.location.origin) {
                                            url.searchParams.set(\'cb\', Date.now());
                                            link.href = url.toString();
                                        }
                                    });
                                } catch (e) {}
                                setTimeout(() => {
                                    window.location.reload();
                                }, 150);
                            }
                        })();
                    </script>
                ')
            )
            ->renderHook(
                \Filament\View\PanelsRenderHook::BODY_START,
                fn (): string => \Illuminate\Support\Facades\Blade::render('
                    <noscript>
                        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0f172a; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 99999; font-family: sans-serif; padding: 20px; text-align: center;">
                            <div style="background: #1e293b; padding: 40px; border-radius: 16px; max-width: 500px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); border: 1px solid #334155;">
                                <svg style="width: 64px; height: 64px; color: #f59e0b; margin-bottom: 20px; display: inline-block;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">JavaScript Diperlukan</h1>
                                <p style="color: #94a3b8; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                                    SIMAYA memerlukan JavaScript untuk memuat antarmuka pengguna dan data aset dengan benar. Harap aktifkan JavaScript di pengaturan browser Anda, lalu segarkan halaman ini.
                                </p>
                                <a href="." style="display: inline-block; background: #f59e0b; color: #0f172a; padding: 10px 20px; border-radius: 8px; font-weight: bold; text-decoration: none;">Segarkan Halaman</a>
                            </div>
                        </div>
                    </noscript>
                ')
            );
    }
}
