<?php
require_once __DIR__ . '/../config.php'; start_secure_session();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['ok'=>false,'message'=>'Method not allowed.'],405);
$data=read_json(); require_csrf($data);
$name=trim((string)($data['institution_name']??'')); $email=strtolower(trim((string)($data['email']??'')));
$wallet=strtolower(trim((string)($data['wallet_address']??''))); $contact=trim((string)($data['contact']??'')); $password=(string)($data['password']??'');
if (mb_strlen($name)<3 || mb_strlen($name)>180) json_response(['ok'=>false,'message'=>'Institution name must be 3–180 characters.'],422);
if (!filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($email)>254) json_response(['ok'=>false,'message'=>'Enter a valid official email address.'],422);
if ($contact==='' || strlen($contact)>30) json_response(['ok'=>false,'message'=>'Enter a contact number (maximum 30 characters).'],422);
if (strlen($password)<12 || strlen($password)>200) json_response(['ok'=>false,'message'=>'Password must be at least 12 characters long.'],422);
if ($wallet!=='' && !preg_match('/^0x[a-f0-9]{40}$/',$wallet)) json_response(['ok'=>false,'message'=>'Wallet address must be a valid 0x address or left blank.'],422);
try {
  $hash=password_hash($password,PASSWORD_DEFAULT);
  $q=db()->prepare('INSERT INTO institutions (institution_name,email,contact,wallet_address,password_hash,status) VALUES (?,?,?,?,?,\'pending\')');
  $q->execute([$name,$email,$contact,$wallet!==''?$wallet:null,$hash]);
  json_response(['ok'=>true,'message'=>'Registration submitted. Your institution account is pending administrator approval. You can log in after approval.']);
} catch (PDOException $e) {
  if ($e->getCode()==='23000') json_response(['ok'=>false,'message'=>'An account with this email already exists.'],409);
  error_log('CertiChain registration error: '.$e->getMessage()); json_response(['ok'=>false,'message'=>'Could not complete registration. Check the database setup and try again.'],500);
}
