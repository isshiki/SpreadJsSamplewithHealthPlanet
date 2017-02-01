<?php

$url = "https://www.healthplanet.jp/status/innerscan.json?" .
  "access_token=" . "＜/oauth/token で取得したトークン＞" .
  "&tag=" . "6021,6022,6023" .    // 6021＝体重（kg）、6022＝体脂肪率（%）、6023＝筋肉量（kg）
  "&date=" . "0" ;                // 0＝登録日付、1＝測定日付
  //"&from=" . "20010101000000" . // 取得開始期間（未指定時は3カ月前＝90日前）
  //"&to=" . date('YmdHis');      // 取得終了期間（未指定時は現時刻）

$options = array(
  "http" => array(
    "method"     => "GET",
    "user_agent" => "PHP Access",
  )
);

$data = @file_get_contents( $url, false, stream_context_create( $options ) );

header('Content-Type: application/json');
echo $data;