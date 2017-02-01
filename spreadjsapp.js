window.onload = function() {
  
  fetch("jsondata.php").then(function(response) {
    return response.json();
  }).then(function(json) {
    
    var jsonData = json.data;               // 計測データ
    var birth_date = json.birth_date;       // 誕生日
    var height = Number(json.height) / 100; // 身長（m単位）
    var sex = json.sex;                     // 性別
    
    // スプレッドシートを生成するための初期化処理
    var spread = new GC.Spread.Sheets.Workbook(
      document.getElementById("ss"), { 
        tabStripVisible: false,         // タブストリップを非表示
        showHorizontalScrollbar: false, // 水平スクロールバーを非表示
        canUserEditFormula: false,      // 編集不可
        hideSelection: true,            // 選択状態を隠す（ユーザー選択は可能）
        grayAreaBackColor: "white"      // 無効領域の色指定
       }); 
    var sheet = spread.getActiveSheet();
    
    // インデックス番号の定義
    var colMLid = 0; // 1列目：左余白（Margin-Left）
    var colTDid = 1; // 2列目：テーブル－測定日（Table-Date）
    var colTWid = 2; // 3列目：テーブル－体重（Table-Weight）
    var colTFid = 3; // 4列目：テーブル－体脂肪率（Table-Fat）
    var colTMid = 4; // 5列目：テーブル－筋肉量（Table-Muscle）
    var colMCid = 5; // 6列目：中央余白（Margin-Center）
    var colSLid = 6; // 7列目：スパークライン（Spark-Line）
    var colMRid = 7; // 8列目：右余白（Margin-Right）
    var colGWid = 8; // 9列目：グラフ用体重（Graph-Weight）＝体重の逆順
    var colGMid = 9; // 10列目：グラフ用3日移動平均（Graph-MovingAverage） ＝体脂肪率（3日移動平均）の逆順
    var rowGTid = 0; // 1行目：通常タイトル（General-Title）
    var rowTHid = 1; // 2行目：テーブルヘッダー（Table-Header）
    var rowTDid = 2; // 3行目～：テーブルデータ（Table-Data）
    
    // スパークライン関連の定義
    var rowS1id =  1;    //  2行目：スパークライン1つ目（Sparkline-1）
    var rowS2id = 22;    // 23行目：スパークライン2つ目（Sparkline-2）
    var slRowCount = 20; // 20行：スパークラインの行数
    var slColCount =  1; // 1行：スパークラインの列数
    
    // アプリで使うフォント関連の定義
    var appFont = "bold 12pt Meiryo"; // アプリ用フォント
    var appColor = "#70AD47";         // アプリ用文字色
    var invisible = "white";          // 見えないようにする文字色
    
    // フォーマッターに指定する書式の定義
    var fmtDate = 'YYYY年MM月dd日(ddd)'; // 日付
    var fmtKgP2 = '#.00 "kg"';           // キログラム（小数点2桁）
    var fmtPtP1 = '#.0 "%"';             // パーセント（小数点1桁）
    
    sheet.suspendPaint();  // 描画をいったん停止。まとめて描画で高速に
    
    sheet.getCell(rowGTid, colTDid).
      text("体組成測定情報（過去90日）").
      font(appFont).
      foreColor(appColor);
    
    sheet.getCell(rowGTid, colSLid).
      text("変化の推移を示すグラフ（上：体重、下：体脂肪率）").
      font(appFont).
      foreColor(appColor);
    
    // 行の高さと列の幅を設定
    sheet.setRowHeight(rowGTid, 25);
    sheet.setColumnWidth(colMLid, 20);
    sheet.setColumnWidth(colTDid, 150);
    sheet.setColumnWidth(colTWid, 80);
    sheet.setColumnWidth(colTFid, 70);
    sheet.setColumnWidth(colTMid, 80);
    sheet.setColumnWidth(colMCid, 20);
    sheet.setColumnWidth(colSLid, 600);
    sheet.setColumnWidth(colMRid, 20);
    sheet.setColumnWidth(colGWid, 60);
    sheet.setColumnWidth(colGMid, 50);
    
    
    // ▼▼▼ ここからデータ加工処理 ▼▼▼
    
    // 年月日順に今日を含めて過去90日間の初期データを作成
    var dateMap = new Map();
    var thisDate = new Date();
    thisDate.setHours(0, 0, 0, 0);
    for (var i = 0; i < 90; i++) {
      // 年月日のキーと文字列を作成する
      var yyyy = String(thisDate.getFullYear());
      var mm = String(thisDate.getMonth() + 1); // 0スタートなので注意
      if (Number(mm) < 10) { mm = "0" + mm }
      var dd = String(thisDate.getDate());
      if (Number(dd) < 10) { dd = "0" + dd }
      var dateKey = yyyy + mm + dd;
       // 日付番号を基準に、JSONデータから各項目値を設定できるようにMapを使う
      dateMap.set(dateKey, { 
        "測定日": thisDate,
        "体重": null,
        "体脂肪率": null,
        "筋肉量": null });
      // 日にちを1日進める
      var thisDateTime = thisDate.getTime();
      var prevDateTime = thisDateTime - 86400000; // ＝ 60 * 60 * 24 * 1000
      thisDate = new Date(prevDateTime);
    }
    
    // JSONデータから、日付番号を基準に各項目値を設定する
    jsonData.forEach(function(jsonValue) {
      var dateKey = jsonValue.date.substring(0, 8); // 年月日のみ抽出
      if (dateMap.has(dateKey) == false) return;
      var mapValue = dateMap.get(dateKey);
      switch (jsonValue.tag) {
        case "6021":
          mapValue.体重 = Number(jsonValue.keydata);
          break;
        case "6022":
          mapValue.体脂肪率 = Number(jsonValue.keydata);
          break;
        case "6023":
          mapValue.筋肉量 = Number(jsonValue.keydata);
          break;
        default:
          return;
      }
      dateMap.set(dateKey, mapValue);
    });
    
    // 作成できた計測データの一覧をArrayオブジェクト化してデータソースとして使う
    var dataSource = Array.from(dateMap.values());
    
    // ▲▲▲ ここまでデータ加工処理 ▲▲▲
    
    // 行数と列数を確定する
    var dataLen = dataSource.length;
    var rowCount = dataLen + 3; // ＝上余白＋見だし＋下余白の3行
    sheet.setRowCount(rowCount);
    sheet.setColumnCount(10); // ＝左余白＋4列のテーブル＋中央余白＋グラフ＋右余白＋2列のグラフ表示用データ
    
    // 行と列のヘッダーやグリッド線を非表示に
    sheet.options.rowHeaderVisible = false;
    sheet.options.colHeaderVisible = false;
    sheet.options.gridline = { showVerticalGridline: false, showHorizontalGridline: false};
    sheet.options.tabStripVisible = false;
    
    // シート全体をロックして保護する
    sheet.options.isProtected = true;
    // 隣接セルへのオーバーフロー表示
    sheet.options.allowCellOverflow = true;
    
    // テーブルテーマを選択（※一部のスタイルをカスタマイズした）
    var tableTheme = GC.Spread.Sheets.Tables.TableThemes.medium7;
    var lineStyle = GC.Spread.Sheets.LineStyle.dotted;
    var lineBorder = new GC.Spread.Sheets.LineBorder(appColor, lineStyle);
    tableTheme._ps.wholeTableStyle.borderVertical = lineBorder;
    
    // データソースからテーブルを自動作成
    var tableName = "過去90日の体組成測定情報";
    var table = sheet.tables.addFromDataSource(tableName, rowTHid, colTDid, dataSource, tableTheme);
    table.filterButtonVisible(0, false).  // テーブル内の1列目（測定日）
          filterButtonVisible(1, false).  // テーブル内の2列目（体重）
          filterButtonVisible(2, false).  // テーブル内の3列目（体脂肪率）
          filterButtonVisible(3, false);  // テーブル内の4列目（筋肉量）
    
    // テーブル内の書式をセット（1列ずつ）
    sheet.getRange(rowTDid, colTDid + 0, dataLen, 1).formatter(fmtDate);
    sheet.getRange(rowTDid, colTDid + 1, dataLen, 1).formatter(fmtKgP2);
    sheet.getRange(rowTDid, colTDid + 2, dataLen, 1).formatter(fmtPtP1);
    sheet.getRange(rowTDid, colTDid + 3, dataLen, 1).formatter(fmtKgP2);
    // テーブル以外（グラフ表示用の2列）の書式もついでにセット（1列ずつ）
    sheet.getRange(rowTDid, colGWid, dataLen, 1).formatter(fmtKgP2).foreColor(invisible);
    sheet.getRange(rowTDid, colGMid, dataLen, 1).formatter(fmtPtP1).foreColor(invisible);
    var tableLen = dataLen + 1; // テーブル全体の行数。ヘッダー分の「1」を足す
    sheet.getRange(rowTHid, colTDid, tableLen, 4).  // 4列全てに対してセンタリング
      hAlign(GC.Spread.Sheets.HorizontalAlign.center);
    
    var tblRowIndex = dataLen - 1;           // 現在（＝最終行）のテーブルデータ内インデックス
    var revRowIndex = tblRowIndex + rowTDid; // 現在の全セルデータ内インデックス（逆順用）
    var prevFat = null;
    var thisFat = sheet.getValue(revRowIndex, colTFid); // 末尾行取得。※インデックスは0番スタートなので+2ではなく「+1」にする
    
    var fwdRowIndex = rowTDid; // 3行目～：テーブルデータ（Table-Data）インデックス（昇順用）
    for (; revRowIndex >= rowTDid; revRowIndex--) { // 下から走査していく
      
      var prevRowIndex = revRowIndex - 1; // 1つ上のデータ
      var nextFat = sheet.getValue(prevRowIndex, colTFid);
      if (!thisFat || thisFat == 0) { 
        prevFat = thisFat;
        thisFat = nextFat;
        continue;
      }
      
      // グラフ用体重データ
      sheet.setFormula(fwdRowIndex, colGWid, "C" + (revRowIndex + 1));
      // インデックスが「0」スタートなのに対し、C1形式のセル参照は「1」スタートなので「1」を足す必要がある。
      
      // グラフ用3日移動平均データ
      var dividedBy = 3 - ((!Number(prevFat) || prevFat == 0) ? 1 : 0) - ((!Number(nextFat) || nextFat == 0) ? 1 : 0);
      sheet.setFormula(fwdRowIndex, colGMid, "=SUM(D" + (revRowIndex) + ":D" + (revRowIndex + 2) + ")/" + dividedBy);
      // 「0」「1」スタートの違いから、1つ上のセル参照は何も足さず、1つ下のセル参照は「2」を足す必要がある。
      
      prevFat = thisFat;
      thisFat = nextFat;
      
      // BMIをコメントで設定
      var thisWeight = sheet.getValue(revRowIndex, colTWid);
      var bmi = thisWeight / ( height * height );
      sheet.comments.add(revRowIndex, colTWid, "BMI: " + bmi.toFixed(2));
      
      fwdRowIndex++;
    }
    
    var setting = new GC.Spread.Sheets.Sparklines.SparklineSetting();
    setting.options.showMarkers = true;
    setting.options.lineWeight = 3;
    
    // スパークラインタイプ（体重）
    var graphDataW  = new GC.Spread.Sheets.Range(2, 8, dataLen, 1);
    sheet.addSpan(rowS1id, colSLid, slRowCount, slColCount);
    var sparkline = sheet.setSparkline(rowS1id, colSLid, graphDataW, GC.Spread.Sheets.Sparklines.DataOrientation.vertical, GC.Spread.Sheets.Sparklines.SparklineType.line, setting);
    
    // スパークラインタイプ（体脂肪率）
    var graphDataF  = new GC.Spread.Sheets.Range(2, 9, dataLen, 1);
    sheet.addSpan(rowS2id, colSLid, slRowCount, slColCount);
    var sparkline = sheet.setSparkline(rowS2id, colSLid, graphDataF, GC.Spread.Sheets.Sparklines.DataOrientation.vertical, GC.Spread.Sheets.Sparklines.SparklineType.line, setting);
    
    sheet.resumePaint();  // 描画を再開。まとめて描画で高速に
    
    
    // データの印刷
    document.getElementById("buttonPrint").onclick = function() {
      spread.print(0);
    };
    
    // CSV形式でのデータの保存
    document.getElementById("buttonCsvFile").onclick = function() {
      var csvString = sheet.getCsv(
        1, 1, trc, 4, // データが対象
        "\n", ","); // 行区切りと列区切りの文字
      var filename = "spreadjs.csv";
      var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      var blob = new Blob([ bom, csvString ], { "type" : "text/csv" });
      var a = document.createElement('a');
      a.download = name;
      a.target   = '_blank';
      a.style = "display: none";
      if (window.navigator.msSaveBlob) { 
        window.navigator.msSaveBlob(blob, filename);
      } else if (window.URL && window.URL.createObjectURL) {
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (window.webkitURL && window.webkitURL.createObject) {
        a.href = window.webkitURL.createObjectURL(blob);
        a.download = filename;
        a.click();
      } else {
        window.open("data:text/csv;base64," + window.Base64.encode(csvString), "_blank");
      }
      alert(filename + "ファイルをダウンロードしました。");
    };
  
  });
  
};
