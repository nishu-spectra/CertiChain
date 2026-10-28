<?php
declare(strict_types=1);
// Local XAMPP configuration. Change credentials if your MySQL setup differs.
const DB_HOST = '127.0.0.1';
const DB_NAME = 'certichain';
const DB_USER = 'root';
const DB_PASS = '';

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}
function start_secure_session(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_name('CERTICHAINSESSID');
        session_set_cookie_params(['httponly'=>true, 'secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'samesite'=>'Lax', 'path'=>'/']);
        session_start();
    }
}
function json_response(array $data, int $status=200): never {
    http_response_code($status); header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store'); echo json_encode($data, JSON_UNESCAPED_SLASHES); exit;
}
function read_json(): array {
    $raw=file_get_contents('php://input'); $data=json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}
function require_csrf(array $data): void {
    start_secure_session(); $token=(string)($data['csrf_token'] ?? '');
    if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) json_response(['ok'=>false,'message'=>'Session security token expired. Refresh the page and try again.'], 419);
}
function current_institution(): ?array {
    start_secure_session();
    if (empty($_SESSION['institution_id'])) return null;
    $q=db()->prepare('SELECT id, institution_name, email, wallet_address, status FROM institutions WHERE id = ?');
    $q->execute([$_SESSION['institution_id']]); $row=$q->fetch();
    if (!$row || $row['status'] !== 'approved') { $_SESSION=[]; session_regenerate_id(true); return null; }
    return $row;
}
function require_institution(): array {
    $institution=current_institution();
    if (!$institution) json_response(['ok'=>false,'message'=>'Please log in with an approved institution account.'], 401);
    return $institution;
}
