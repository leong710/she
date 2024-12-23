<?php

    // require 不容許回傳值
    // 以下為"PhpSpreadsheet"啟動碼
    require '../../libs/vendor/autoload.php';  // 导入 PhpSpreadsheet 库

        function numberToLetters($number) {
            $letters = '';
            while ($number > 0) {
                $remainder = ($number - 1) % 26;
                $letters = chr($remainder + 65) . $letters;
                $number = intval(($number - 1) / 26);
            }
            return $letters;
        }

    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

    $data = json_decode($_POST["htmlTable"], true);
    $to_module = (!empty($_REQUEST["submit"])) ? $_REQUEST["submit"] : "downLoad_excel";
    $now = date("Y-m-d");
    // 創建一個新的 Excel 對象
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet()->freezePane('A2');      // 冻结窗格，锁定行和列
    
    // 將數據寫入 Excel
        // 寫入標題行
        $keys = array_keys($data[0]);
        $column = 1;
        foreach ($keys as $key) {
            if ($key === "action") {
                continue; // 跳过特定的 $key
            }
            $sheet->setCellValueByColumnAndRow($column, 1, $key);
            $column++;
        }

        $col_word = numberToLetters($column-1);
        $spreadsheet->getActiveSheet()->setAutoFilter("A1:{$col_word}1");        // 設置篩選功能應用於第1列// A列，從第1行到第n行

        // 寫入數據
        $row = 2;
        foreach ($data as $item) {
            $col = 1;
            foreach ($item as $key => $value) {
                if ($key === "action") {
                    continue; // 跳过特定的 $key
                }
                // $sheet->setCellValueByColumnAndRow($col, $row, $value); // cell直接帶入值
                // 自動換行
                $cell = $sheet->getCellByColumnAndRow($col, $row);
                $cell->setValue($value);                                   
                $style = $cell->getStyle();
                $style->getAlignment()->setWrapText(true);

                $col++;
            }
            $row++;
        }

    // 設定檔案名稱
        switch($to_module){
            case "shLocal":
                $filename_head = "特殊危害健康作業管理_";
                $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];   // 定義調整蘭寬 
                break;
            case "staff":
                $filename_head = "變更作業特殊健檢_";
                $columns = ['B', 'C', 'F', 'G', 'H', 'L', 'N'];   // 定義調整蘭寬 
                break;
            case "review":
                $filename_head = "審查特殊健檢名單_";
                $columns = ['B', 'C', 'F', 'G', 'H', 'L', 'N'];   // 定義調整蘭寬 
                break;
            default:
                $filename_head = $to_module;
                $columns = [];
                break;
        }

    // 定義sheetName        
        if(isset($_REQUEST["tab_name"]) && !empty($_REQUEST["tab_name"])){
            $spreadsheet->getActiveSheet()->setTitle($_REQUEST["tab_name"]);
        }
    // 調整蘭寬        
        if(!empty($columns)){
            foreach ($columns as $column) {
                $spreadsheet->getActiveSheet()->getColumnDimension($column)->setAutoSize(true);
            }
        }
    // 調整欄列寬高換行
    $spreadsheet->getActiveSheet()->getStyle('1:1')->getAlignment()->setWrapText(true); // 1列-自動換行
    $spreadsheet->getActiveSheet()->getRowDimension(1)->setRowHeight(-1);               // 1列-自動欄高

    $filename = $filename_head."_".$now.'.xlsx';  // 設定檔名 

    // 以下為EXCEL規範制式的表頭格式
    header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    header("Content-Disposition: attachment; filename=".$filename);
    header('Cache-Control: max-age=0');
    // 將 Excel 對象寫入到檔案
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');

?>