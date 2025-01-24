<?php

    require '../../libs/vendor/autoload.php';  // 導入 PhpSpreadsheet 庫

    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

        function numberToLetters($number) {
            $letters = '';
            while ($number > 0) {
                $remainder = ($number - 1) % 26;
                $letters = chr($remainder + 65) . $letters;
                $number = intval(($number - 1) / 26);
            }
            return $letters;
        }

        function setCellValueWithWrapText($sheet, $col, $row, $value) {
            $cell = $sheet->getCellByColumnAndRow($col, $row);
            $cell->setValue($value);
            // 設置自動換行樣式
            $cell->getStyle()->getAlignment()->setWrapText(true);
        }

    $data = json_decode($_POST["htmlTable"], true);
    $to_module = $_REQUEST["submit"] ?? "downLoad_excel";  // 使用 null 合併運算子 || 避免 isset() 檢查
    $now = date("Y-m-d");

    // 創建一個新的 Excel 對象
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->freezePane('A2');  // 冻结窗格，锁定行和列

    // 寫入標題行
    $keys = array_keys($data[0]);
    $column = 1;
    foreach ($keys as $key) {
        if ($key !== "action") {
            $sheet->setCellValueByColumnAndRow($column, 1, $key);
            $column++;
        }
    }

    $col_word = numberToLetters($column - 1);
    $sheet->setAutoFilter("A1:{$col_word}1");  // 設置篩選功能應用

    // 寫入數據
    $row = 2;
    foreach ($data as $item) {
        $col = 1;
        foreach ($item as $key => $value) {
            if ($key !== "action") {
                setCellValueWithWrapText($sheet, $col, $row, $value);
                $col++;
            }
        }
        $row++;
    }

    // 根據模組設定檔名和欄位寬度
    $moduleSettings = [
        "shLocal" => ["特殊危害健康作業管理_",  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']],
        "staff"   => ["變更作業特殊健檢_",      ['B', 'C', 'F', 'G', 'H', 'L', 'N']],
        "review"  => ["審查特殊健檢名單_",      ['B', 'C', 'F', 'G', 'H', 'L', 'N']],
        "pickup"  => ["彙整特殊健檢名單_",      ['B', 'C', 'F', 'G', 'H', 'I', 'M', 'N']],
    ];

    $filename_head = $moduleSettings[$to_module][0] ?? $to_module;
    $columns = $moduleSettings[$to_module][1] ?? [];

    // 定義 sheet 名稱
    if (!empty($_REQUEST["tab_name"])) {
        $sheet->setTitle($_REQUEST["tab_name"]);
    }

    // 調整欄寬
    foreach ($columns as $column) {
        $sheet->getColumnDimension($column)->setAutoSize(true);
    }

    // 調整欄列寬高換行
    $sheet->getStyle('1:1')->getAlignment()->setWrapText(true);
    $sheet->getRowDimension(1)->setRowHeight(-1);

    $filename = $filename_head . "_" . $now . '.xlsx';  // 設定檔名

    // 設定 header
    header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    header("Content-Disposition: attachment; filename=\"{$filename}\"");
    header('Cache-Control: max-age=0');

    // 將 Excel 寫入到輸出
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');

?>