<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NextJsProxyController extends Controller
{
    public function proxy(Request $request, $path = '')
    {
        $uri = $request->getRequestUri();
        $targetUrl = 'http://127.0.0.1:3000' . $uri;

        try {
            $ch = curl_init($targetUrl);

            $headers = [];
            foreach ($request->headers->all() as $name => $values) {
                if (in_array(strtolower($name), ['host', 'content-length'])) {
                    continue;
                }
                foreach ($values as $value) {
                    $headers[] = "{$name}: {$value}";
                }
            }
            $headers[] = 'Host: localhost:3000';
            $headers[] = 'X-Forwarded-Host: ' . $request->getHost();
            $headers[] = 'X-Forwarded-Proto: ' . $request->getScheme();
            $headers[] = 'X-Forwarded-For: ' . $request->ip();

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, true);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $request->method());
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

            if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, $request->getContent());
            }

            $response = curl_exec($ch);

            if (curl_errno($ch)) {
                $error = curl_error($ch);
                curl_close($ch);
                return response(
                    "<h3>Gagal Terhubung ke Frontend Next.js (Port 3000)</h3><p>Pastikan Next.js sudah berjalan di server via PM2: <code>pm2 list</code></p><p>Error: {$error}</p>",
                    502
                )->header('Content-Type', 'text/html');
            }

            $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $headerStr = substr($response, 0, $headerSize);
            $body = substr($response, $headerSize);
            curl_close($ch);

            $responseObj = response($body, $httpCode);

            // Forward essential response headers
            $headerLines = explode("\r\n", $headerStr);
            foreach ($headerLines as $line) {
                if (strpos($line, ':') !== false) {
                    [$k, $v] = explode(':', $line, 2);
                    $k = trim($k);
                    $v = trim($v);
                    if (in_array(strtolower($k), ['content-type', 'cache-control', 'location', 'set-cookie'])) {
                        $responseObj->header($k, $v);
                    }
                }
            }

            return $responseObj;
        } catch (\Throwable $e) {
            return response("Proxy Error: " . $e->getMessage(), 500);
        }
    }
}
