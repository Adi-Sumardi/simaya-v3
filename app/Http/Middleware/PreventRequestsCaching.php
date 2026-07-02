<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventRequestsCaching
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Instruct browsers and intermediate proxies to never cache the HTML response
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Sat, 26 Jul 1997 05:00:00 GMT');

        // Dynamically bust cache for Filament static assets on the server side
        if (method_exists($response, 'getContent')) {
            $contentType = $response->headers->get('Content-Type');
            if (is_string($contentType) && str_contains($contentType, 'text/html')) {
                $content = $response->getContent();
                if (is_string($content) && str_contains($content, '<html')) {
                    $cssPath = public_path('css/filament/support/support.css');
                    $versionHash = file_exists($cssPath) ? filemtime($cssPath) : time();
                    
                    // Append &cb=<timestamp> to all css/js URLs that have Filament versioning (?v=...)
                    $content = preg_replace('/(\.css\?v=[a-zA-Z0-9\.\-_]+)/', '$1&cb=' . $versionHash, $content);
                    $content = preg_replace('/(\.js\?v=[a-zA-Z0-9\.\-_]+)/', '$1&cb=' . $versionHash, $content);
                    
                    $response->setContent($content);
                }
            }
        }

        return $response;
    }
}
