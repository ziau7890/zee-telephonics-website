<?php
// Test router for `php -S`: adds the Content-Security-Policy from public/.htaccess,
// so the tests catch anything the live security headers would block.
$ht = (string)file_get_contents(__DIR__ . '/../../public/.htaccess');
if (preg_match('/Content-Security-Policy "([^"]+)"/', $ht, $m)) {
    header('Content-Security-Policy: ' . $m[1]);
}
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = $_SERVER['DOCUMENT_ROOT'] . $path;
if (str_ends_with($path, '.php') && is_file($file)) {
    chdir(dirname($file));
    require $file;
    return true;
}
if (is_dir($file) && is_file(rtrim($file, '/') . '/index.html')) {
    $file = rtrim($file, '/') . '/index.html';
}
if (!is_file($file)) {
    http_response_code(404);
    $file = $_SERVER['DOCUMENT_ROOT'] . '/404.html';
}
$types = ['html' => 'text/html; charset=utf-8', 'css' => 'text/css', 'js' => 'text/javascript', 'svg' => 'image/svg+xml',
    'woff2' => 'font/woff2', 'json' => 'application/json', 'xml' => 'application/xml', 'txt' => 'text/plain'];
header('Content-Type: ' . ($types[pathinfo($file, PATHINFO_EXTENSION)] ?? 'application/octet-stream'));
readfile($file);
return true;
