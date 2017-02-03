# SpreadJsSamplewithHealthPlanet
Build InsiderのSpreadJS記事サンプル。Health Planet APIから取得したJSONデータを使います。サーバー側にはPHPを使います。

## 実行する方法
- http://localhost/ でアクセスされるフォルダー（筆者の例では「C:\WebSites\」）に全てのファイルをコピーしてください。
- http://localhost/spreadjs/9201610/ でアクセスされるフォルダー（筆者の例では「C:\WebSites\spreadjs\9201610\」）に、SpreadJSのSDKに含まれるscripts／cssフォルダーをコピーしてください。

## Health Planet（ヘルスプラネット）とは？

- [Health Planet（ヘルスプラネット）](https://www.healthplanet.jp/)
- 体重計・体組成計（＝体脂肪率や筋肉量も計れる体重計）の会社である「タニタ」が運営するWebサービス
- なお、Health Planetには外部からまとめてデータをインポートする手段は用意されていない。そこで簡易的なインポートツール「[isshiki/DataUploderToHealthPlanet](https://github.com/isshiki/DataUploderToHealthPlanet)」も開発した

## Health Planet APIからのJSONデータ取得

- jsondata.phpで、Health Planetが提供するWeb APIからデータを取得
- [Health Planet API 仕様書](https://www.healthplanet.jp/apis/api.html)
- Health PlanetでAPIを呼び出せるまでの簡易的な手順  
  1. [無料の新規アカウント登録](https://www.healthplanet.jp/entry_agreement.do)  
  2. [［APIの設定］ページ](https://www.healthplanet.jp/apis_account.do)  
  3. アクセス許可コードの取得： https://www.healthplanet.jp/oauth/auth?client_id=＜Client-ID＞&redirect_uri=https://www.healthplanet.jp/oauth/auth&scope=innerscan&response_type=code  
  4. アクセストークンの取得： http://localhost/token.php  
  5. Health Planet APIを使った体組成測定情報の取得： http://localhost/jsondata.php

## ライセンス
MIT