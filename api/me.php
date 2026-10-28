<?php
require_once __DIR__ . '/../config.php';
try { $institution=current_institution(); json_response(['ok'=>true,'authenticated'=>(bool)$institution,'institution'=>$institution ? ['id'=>(int)$institution['id'],'name'=>$institution['institution_name'],'email'=>$institution['email'],'wallet_address'=>$institution['wallet_address']] : null]); }
catch (Throwable $e) { error_log('CertiChain session check: '.$e->getMessage()); json_response(['ok'=>false,'message'=>'Authentication service is unavailable.'],500); }
