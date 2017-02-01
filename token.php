<?php

$url = "https://www.healthplanet.jp/oauth/token?" .
  "client_id=" . "＜登録したアプリケーションのClient ID＞" . 
  "&client_secret=" . "＜登録したアプリケーションのClient Secret＞" .
  "&redirect_uri=" . "https://www.healthplanet.jp/success.html" . // 使わないので仮設定できる値にした
  "&code=" . "＜/oauth/auth で取得したコード＞" .
  "&grant_type=" . "authorization_code";  // 固定値

$options = array(
  "http" => array(
    "method"     => "POST",
    "user_agent" => "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; Tablet PC 2.0)",
  )  // User-AgentはInternet Explorer 9を偽装
);

$data = @file_get_contents( $url, false, stream_context_create( $options ) );
echo $data;