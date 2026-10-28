<?php
require_once __DIR__ . '/../config.php'; start_secure_session();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['ok'=>false,'message'=>'Method not allowed.'],405);
$data=read_json(); require_csrf($data); $_SESSION=[];
if (ini_get('session.use_cookies')) { $p=session_get_cookie_params(); setcookie(session_name(),'',time()-42000,$p['path'],$p['domain']??'',(bool)$p['secure'],(bool)$p['httponly']); }
session_destroy(); json_response(['ok'=>true,'message'=>'Logged out.']);
