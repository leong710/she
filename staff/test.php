<?php

// $parm = "南科管理大樓,9T041500";

// $emp_sub_scope = explode(',', $parm)[0];
// $deptNo = explode(',', $parm)[1];

// echo $emp_sub_scope."<br>";
// echo $deptNo;

    // load 審查作業步驟json
    function reviewStep() {
        $reviewStep_file = "../review/reviewStep.json";
        $reviewStep_arr = [];

        if(file_exists($reviewStep_file)){
            $reviewStep_json = file_get_contents($reviewStep_file); // 从JSON文件加载内容
            // 嘗試解碼 JSON，並檢查是否成功
            $decoded_data = json_decode($reviewStep_json, true);    // 解析JSON数据并将其存储在$变量中，如果想解析为陣列，请传入true，否则将解析为物件
            if (json_last_error() === JSON_ERROR_NONE) {
                $reviewStep_arr = $decoded_data;                    // 直接賦值
            } else {
                // 處理 JSON 解碼錯誤，您可以在這裡記錄錯誤或拋出異常
                // error_log('JSON Error: ' . json_last_error_msg());
            }
        }

        return $reviewStep_arr;
    }


$reviewStep_arr = reviewStep(); // 取得reviewStep

echo "<pre>";
print_r($reviewStep_arr);
echo "</pre>";
