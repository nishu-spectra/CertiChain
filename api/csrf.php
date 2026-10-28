<?php
require_once __DIR__ . '/../config.php'; start_secure_session();
if (empty($_SESSION['csrf_token'])) $_SESSION['csrf_token']=bin2hex(random_bytes(32));
json_response(['ok'=>true,'csrf_token'=>$_SESSION['csrf_token']]);
