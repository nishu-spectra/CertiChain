<?php
require_once __DIR__ . '/../config.php'; start_secure_session();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['ok'=>false,'message'=>'Method not allowed.'],405);
$data=read_json(); require_csrf($data);
$email=strtolower(trim((string)($data['email']??''))); $password=(string)($data['password']??'');
if (!filter_var($email,FILTER_VALIDATE_EMAIL) || $password==='') json_response(['ok'=>false,'message'=>'Enter your email and password.'],422);
$q=db()->prepare('SELECT id,institution_name,email,password_hash,status FROM institutions WHERE email=? LIMIT 1'); $q->execute([$email]); $row=$q->fetch();
if (!$row || !password_verify($password,$row['password_hash'])) json_response(['ok'=>false,'message'=>'Email or password is incorrect.'],401);
if ($row['status']!=='approved') json_response(['ok'=>false,'message'=>$row['status']==='pending'?'Your institution registration is awaiting administrator approval.':'This institution account is not active.'],403);
session_regenerate_id(true); $_SESSION['institution_id']=(int)$row['id']; $_SESSION['csrf_token']=bin2hex(random_bytes(32));
json_response(['ok'=>true,'message'=>'Login successful.','institution'=>['name'=>$row['institution_name'],'email'=>$row['email']]]);
