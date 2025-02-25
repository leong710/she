<?php
    require_once("../pdo.php");
    // require_once("../user_info.php");
    // 以下為EXCEL檔案上傳
    // 引入PhpSpreadsheet库
    require '../../libs/vendor/autoload.php';
    include("../template/header.php");

    use PhpOffice\PhpSpreadsheet\IOFactory;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_POST['excelUpload'])) {
            
            if (isset($_FILES['excelFile'])) {
                $file = $_FILES['excelFile']['tmp_name'];
                $spreadsheet = IOFactory::load($file);
                $worksheet = $spreadsheet->getActiveSheet();
                $data = $worksheet->toArray();

                // 其他按钮被点击时执行的操作
                $submit = $_POST['excelUpload'];                // "上傳"按钮被点击时执行的操作
                if ($submit === 'shLocal') {                    // 240807_特殊危害健康作業管理

                    // 將HE_CATE字串轉成陣列...
                        function parseString($inputStr) {
                            $result = [];
                            $pairs = explode(',', $inputStr);               // 拆分字串，取得每個 key:value 配對
                            foreach ($pairs as $pair) {
                                list($key, $value) = explode(':', $pair);   // 拆分 key 和 value
                                $result[$key] = $value;                     // 儲存到結果陣列中
                            }
                            $result = json_encode($result, JSON_UNESCAPED_UNICODE );       // 類別轉中文字串
                            return $result;
                        }
                    // 在此处可以对$data进行进一步处理
                    // 将结果输出为HTML表格
                    $theadTitles = array('廠區', '部門代碼', '部門名稱', '類別', '監測編號', '監測處所(255)', '作業描述(255)', 'A權音壓級(dBA)', '日時量平均(dBA)');  //工作日8小時平均音壓值
                    // 計算陣列中的"key"
                    $keyCount = count($theadTitles);
                    echo '<div class="col-12 bg-light px-0 ">';
                    echo '<table><thead><tr>';
                        // 繞出每一個"theadTitles"的值
                        foreach ($theadTitles as $theadTitle){
                            echo '<th>' . $theadTitle . '</th>';
                        }
                        echo '</tr></thead>';
                    // 防止無資料送入的錯誤。
                    if(!isset($data[1])){
                        echo "<script>alert('請確認『上傳清冊』格式是否正確！');</script>";
                        return ;
        
                    }else{

                        echo '<tbody>';
                        // 設定一個"result"陣列
                        $result = array();
                        $stopUpload = 0;
                        $errLog = [];

                        // 繞出每一個Data的值
                        foreach ($data as $rowIndex => $row) {
                            // 跳過表頭
                            if ($rowIndex === 0) { continue; }
                            echo '<tr>';

                            // 避免有空白並處理部門代碼
                            foreach ($row as $index => $value) {
                                if ($index > 5) break;
                                $row[$index] = trim(str_replace(' ', '', $value));
                            }
                            $row[1] = strtoupper(trim($row[1]));         // 部門代碼 轉大寫
                            $row[3] = str_replace('、', ',', $row[3]);   // 類別 全形符號轉逗號
                            // $row[3] = parseString($row[3]);              // 類別 呼叫parseString進行加工--字串分拆成陣列再json_encode成中文字串

                            // 1. 檢查 OSHORT $row[1] 是否為空值
                                $OSHORT_check = !empty($row[1]);
                            // 2. 檢查 HE_CATE $row[3] 是否包含 "噪音作業"，必須填 AVG_VAL 或 AVG_8HR
                                $noise_check = preg_match("/噪音/i", $row[3]) ? ($row[4] || $row[5]) : true;
                            // 3. MONIT_LOCAL_check: 檢查字串長度是否小於等於 255
                                $MONIT_LOCAL_check = mb_strlen($row[7], 'UTF-8') <= 255;
                            // 4. WORK_DESC_check: 檢查字串長度是否小於等於 255
                                $WORK_DESC_check = mb_strlen($row[8], 'UTF-8') <= 255;
                            // 5. HE_CATE_check: 檢查 HE_CATE 是否包含 ":"
                                $HE_CATE_check = strpos($row[3], ':') !== false;
                            
                            // 合併檢查結果：
                                $row_result = array_merge($row, [
                                    "OSHORT_check"      => $OSHORT_check,
                                    "noise_check"       => $noise_check,
                                    "MONIT_LOCAL_check" => $MONIT_LOCAL_check,
                                    "WORK_DESC_check"   => $WORK_DESC_check,
                                    "HE_CATE_check"     => $HE_CATE_check
                                ]);

                            if ($OSHORT_check && $noise_check && $MONIT_LOCAL_check && $WORK_DESC_check && $HE_CATE_check) {
                                foreach ($row as $index => $value) {
                                    // row 6 作業敘述需要特殊顯示word_bk處理
                                    echo (($index === 6) ? '<td class="word_bk">' : '<td>'). htmlspecialchars($value) .'</td>';             // htmlspecialchars 函數的功能是用來轉換 HTML 特殊符號為僅能顯示用的編碼
                                }

                                $process = [
                                    "OSTEXT_30"     => $row[0],
                                    "OSHORT"        => $row[1],
                                    "OSTEXT"        => $row[2],
                                    "HE_CATE"       => (preg_match("/:/i",$row[3])) ? parseString($row[3]) : explode(',', $row[3]),        // 類別 呼叫parseString進行加工--字串分拆成陣列再json_encode成中文字串
                                    "MONIT_NO"      => $row[4],
                                    "MONIT_LOCAL"   => $row[5],
                                    "WORK_DESC"     => $row[6],
                                    "AVG_VOL"       => $row[7],
                                    "AVG_8HR"       => $row[8],
                                ];
                                $result[] = $process;
                            }else {
                                handleInvalidRow($submit, $row_result, "");
                            }
                            echo '</tr>'; 
                        };

                        echo '</tbody></table>';
                        // 增加卡"SN有誤"不能上傳。
                        // 如果"有誤"的累計資料等於"0"。
                        if( $stopUpload === 0 ){
                            // 將資料打包成JSON
                            $jsonString = json_encode($result, JSON_UNESCAPED_UNICODE );

                        // 鋪設前處理 
                            $cart_dec = (array) json_decode($jsonString);

                            // 以下是回傳給form使用。
                            echo '<textarea name="" id="excel_json" class="form-control" style="display: none;">'.$jsonString.'</textarea>';
                            echo '</div>';
                        }else{
                            echo '<div name="" id="stopUpload" style="color: red; font-weight: bold;">'."有 ".$stopUpload." 個資料有誤，請確認後再上傳。".'</div>';
                            echo '</div>';
                        }
                    }

                } else if ($submit === 'shStaff') {             // 240822_特危健康作業人員
                    // 在此处可以对$data进行进一步处理
                    // 将结果输出为HTML表格
                    $theadTitles = array('NO', '廠區', '工號', '姓名', '部門代碼', '部門名稱', '檢查類別', '檢查代號', '去年檢查項目');  //工作日8小時平均音壓值
                    // 計算陣列中的"key"
                    $keyCount = count($theadTitles);
                    echo '<div class="col-12 bg-light px-0 ">';
                    echo '<table><thead><tr>';
                        // 繞出每一個"theadTitles"的值
                        foreach ($theadTitles as $theadTitle){
                            echo '<th>' . $theadTitle . '</th>';
                        }
                        echo '</tr></thead>';
                    // 防止無資料送入的錯誤。
                    if(!isset($data[1])){
                        echo "<script>alert('請確認『上傳清冊』格式是否正確！');</script>";
                        return ;
        
                    }else{

                        echo '<tbody>';
                        // 設定一個"result"陣列
                        $result = array();
                        $stopUpload = 0;
                        $errLog = [];

                        // 繞出每一個Data的值
                        foreach ($data as $rowIndex => $row) {
                            // 跳過表頭
                            if ($rowIndex === 0) { continue; }
                            echo '<tr>';

                            // 避免有空白並處理部門代碼
                            foreach ($row as $index => $value) {
                                if ($index > 5) break;
                                $row[$index] = trim(str_replace(' ', '', $value));
                            }
                            $row[4] = strtoupper(trim($row[4]));         // 部門代碼 strtoupper轉大寫
                            $row[6] = str_replace('、', ',', $row[6]);   // 類別 str_replace符號轉逗號

                            // 檢查部門代碼emp_id $row[2]是否空值
                                $emp_id_check = (!empty($row[2]) && strlen($row[2]) == 8 ) ? true : false;
                            // 檢查部門代碼OSHORT $row[4]是否空值
                                $OSHORT_check = (!empty($row[4])) ? true : false;
                                $row_result = array_merge($row, [
                                    "emp_id_check" => $emp_id_check,
                                    "OSHORT_check" => $OSHORT_check,
                                ]);

                            if ($emp_id_check && $OSHORT_check) {
                                foreach ($row as $index => $value) {
                                    if ($index > 8) break;                                  // 欄位數
                                    echo '<td>' . htmlspecialchars($value) . '</td>';       // htmlspecialchars 函數的功能是用來轉換 HTML 特殊符號為僅能顯示用的編碼
                                }
                                // 240904 將特作代號$row[6]升級成物件
                                    $row6 = explode(",", $row[6]);    
                                    $row6_arr = array();
                                    foreach ($row6 as $row6_i) {
                                        list($key, $value) = explode(':', $row6_i);
                                        $row6_arr[$key] = $value;
                                    }

                                $process = [
                                    "no"            => $row[0],
                                    "emp_sub_scope" => $row[1],
                                    "emp_id"        => $row[2],
                                    "cname"         => $row[3],
                                    "dept_no"       => $row[4],
                                    "emp_dept"      => $row[5],
                                    // "HE_CATE"       => $row6_arr,
                                    "HE_CATE"       => null,
                                    // "HE_CATE_KEY"   => $row[7],
                                    "HE_CATE_KEY"   => "",
                                    "yearHe"        => $row[6],
                                    "yearCurrent"   => $row[7],
                                    "yearPre"       => $row[8]
                                ];
                                $result[] = $process;

                            }else {
                                handleInvalidRow($submit, $row_result, "");                 // [fun] ...
                            }
                            echo '</tr>'; 
                        };

                        echo '</tbody></table>';
                        // 增加卡"有誤"不能上傳。
                        // 如果"有誤"的累計資料等於"0"。
                        if( $stopUpload === 0 ){
                            // 將資料打包成JSON
                            $jsonString = json_encode($result, JSON_UNESCAPED_UNICODE );
                            // 鋪設前處理 
                            $cart_dec = (array) json_decode($jsonString);
                            // 以下是回傳給form使用。
                            echo '<textarea name="" id="excel_json" class="form-control" style="display: none;">'.$jsonString.'</textarea>';
                            echo '</div>';
                        }else{
                            echo '<div name="" id="stopUpload" style="color: red; font-weight: bold;">'."有 ".$stopUpload." 個資料有誤，請確認後再上傳。".'</div>';
                            // echo    '<div><pre>';
                            //     print_r($errLog);
                            // echo    '</pre></div>';
                            echo '</div>';
                        }
                    }
                } else if ($submit === 'shStaffChange') {       // 250225_變更作業健檢
                    // 在此处可以对$data进行进一步处理
                    // 将结果输出为HTML表格
                    $theadTitles = array('年月份','廠區','工號','姓名','部門代碼','部門名稱','檢查類別','彙整人員','是否執行檢查','確認檢查類別','檢查日','健檢醫院','是否結案','定檢資格');
                    // 計算陣列中的"key"
                    $keyCount = count($theadTitles);
                    echo '<div class="col-12 bg-light px-0 ">';
                    echo '<table><thead><tr>';
                        // 繞出每一個"theadTitles"的值
                        foreach ($theadTitles as $theadTitle){
                            echo '<th>' . $theadTitle . '</th>';
                        }
                        echo '</tr></thead>';
                    // 防止無資料送入的錯誤。
                    if(!isset($data[1])){
                        echo "<script>alert('請確認『上傳清冊』格式是否正確！');</script>";
                        return ;
        
                    }else{

                        echo '<tbody>';
                        // 設定一個"result"陣列
                        $result = array();
                        $stopUpload = 0;
                        $errLog = [];

                        // 繞出每一個Data的值
                        foreach ($data as $rowIndex => $row) {
                            // 跳過表頭
                            if ($rowIndex === 0) { continue; }
                            echo '<tr>';

                            // 避免有空白並處理部門代碼
                            foreach ($row as $index => $value) {
                                if ($index > 5) break;
                                $row[$index] = trim(str_replace(' ', '', $value));
                            }
                            $row[4] = strtoupper(trim($row[4]));         // 部門代碼 strtoupper轉大寫
                            $row[6] = str_replace('、', ',', $row[6]);   // 類別 str_replace符號轉逗號

                            // 檢查工號emp_id $row[2]是否空值
                                $emp_id_check = (!empty($row[2]) && strlen($row[2]) == 8 ) ? true : false;
                            // 檢查部門代碼OSHORT $row[4]是否空值
                                $OSHORT_check = (!empty($row[4])) ? true : false;
                                $row_result = array_merge($row, [
                                    "emp_id_check" => $emp_id_check,
                                    "OSHORT_check" => $OSHORT_check,
                                ]);

                            if ($emp_id_check && $OSHORT_check) {
                                foreach ($row as $index => $value) {
                                    if ($index > 8) break;                                  // 欄位數
                                    echo '<td>' . htmlspecialchars($value) . '</td>';       // htmlspecialchars 函數的功能是用來轉換 HTML 特殊符號為僅能顯示用的編碼
                                }
                                // 240904 將特作代號$row[6]升級成物件
                                    $row6 = explode(",", $row[6]);    
                                    $row6_arr = array();
                                    if(!empty($row6)){
                                        foreach ($row6 as $row6_i) {
                                            list($key, $value) = explode(':', $row6_i);
                                            $row6_arr[$key] = $value;
                                        }
                                    }

                                $process = [
                                    "targetYear"    => $row[0],
                                    "OSTEXT_30"     => $row[1],
                                    "emp_id"        => $row[2],
                                    "cname"         => $row[3],
                                    "OSHORT"        => $row[4],
                                    "OSTEXT"        => $row[5],
                                    "yearHe"        => $row[6],
                                    "updated_cname" => $row[7],
                                    "HE_CATE"       => null,
                                    "yearCurrent"   => $row[7],
                                    "yearPre"       => $row[8]
                                ];
                                $result[] = $process;

                            }else {
                                handleInvalidRow($submit, $row_result, "");                 // [fun] ...
                            }
                            echo '</tr>'; 
                        };

                        echo '</tbody></table>';
                        // 增加卡"有誤"不能上傳。
                        // 如果"有誤"的累計資料等於"0"。
                        if( $stopUpload === 0 ){
                            // 將資料打包成JSON
                            $jsonString = json_encode($result, JSON_UNESCAPED_UNICODE );
                            // 鋪設前處理 
                            $cart_dec = (array) json_decode($jsonString);
                            // 以下是回傳給form使用。
                            echo '<textarea name="" id="excel_json" class="form-control" style="display: none;">'.$jsonString.'</textarea>';
                            echo '</div>';
                        }else{
                            echo '<div name="" id="stopUpload" style="color: red; font-weight: bold;">'."有 ".$stopUpload." 個資料有誤，請確認後再上傳。".'</div>';
                            // echo    '<div><pre>';
                            //     print_r($errLog);
                            // echo    '</pre></div>';
                            echo '</div>';
                        }
                    }

                } else if ($submit === '其他按钮名称') {
                    // 其他按钮被点击时执行的操作
                    // ...
                }
            }
        }
    }

    // for整合確認：確認stock/SN、supp/comp_no、contact/cname是否已經建立
    function check_something($submit, $query_item){
        $pdo = pdo();
        switch($submit){
            case "shLocal":              
                $sql_check = "SELECT * FROM _cata WHERE SN = ?";
                break;

            default:            // 預定失效 
                // return; 
                break;
        }
        $stmt_check = $pdo -> prepare($sql_check);
        try {
            $stmt_check -> execute([$query_item]);

            if($stmt_check -> rowCount() > 0){     
                // 確認query_item是否已經註冊
                $result = $stmt_check->fetch();
                // 如果有值，則返回找到的資料。
                switch($submit){
                    case "shLocal":
                        $resultRecall = [
                            "state"         => "OK",
                            "query_item"    => $query_item,
                            "query_row"     => "SN",
                            "SN"            => $result["SN"],
                            "pname"         => $result["pname"]
                        ];    
                        break;

                    default:            // 預定失效 
                        break;
                }

            }else{
                // 返回"NA"值
                switch($submit){
                    case "shLocal":
                        $resultRecall = [
                            "state"         => "NA",
                            "query_item"    => $query_item,
                            "query_row"     => "SN",
                            "SN"            => $query_item
                        ];
                        break;

                    default:            // 預定失效 
                        break;
                }
            }
            return $resultRecall;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    function handleInvalidRow($submit, $row_result, $item_check) {
        // 构建错误消息
        $errorMsg = generateErrorMessage($submit, $row_result, $item_check);    // [fun] generateErrorMessage = 构建错误消息

        // 根據$submit 输出特定错误消息
        switch($submit){
            case "shLocal":
                $td_str  = '<td>' . $row_result[0] . '</td>';
                $td_str .= '<td>' . $row_result[1] . ((!$row_result["OSHORT_check"]) ? '<br><span style="background-color: pink;">注意：此欄有誤</span>' : '') . '</td>';
                $td_str .= '<td>' . $row_result[2] . '</td>';
                $td_str .= '<td>' . $row_result[3] . ((!$row_result["HE_CATE_check"]) ? '<br><span style="background-color: pink;">注意：此欄格式有誤</span>' : '') . '</td>';
                $td_str .= '<td>' . $row_result[4] . ((!$row_result["noise_check"]) ? '<br><span style="background-color: pink;">注意：此欄有誤</span>' : '') . '</td>';
                $td_str .= '<td>' . $row_result[5] . ((!$row_result["noise_check"]) ? '<br><span style="background-color: pink;">注意：此欄有誤</span>' : '') . '</td>';
                $td_str .= '<td>' . $row_result[6] . '</td>';
                $td_str .= '<td>' . $row_result[7] . ((!$row_result["MONIT_LOCAL_check"]) ? '<br><span style="background-color: pink;">注意：此欄字數有誤('.mb_strlen($row_result[7], 'UTF-8').')</span>' : '') . '</td>';
                $td_str .= '<td class="word_bk">' . $row_result[8] . ((!$row_result["WORK_DESC_check"]) ? '<br><span style="background-color: pink;">注意：此欄字數有誤('.mb_strlen($row_result[8], 'UTF-8').')</span>' : '') . '</td>';
                echo $td_str;
                break;

            case "shStaff":
                $td_str  = '<td>' . $row_result[0] . '</td><td>' . $row_result[1] .  '</td>';
                $td_str .= '<td'  . (!$row_result["emp_id_check"] ? ' style="color: red;background-color: pink;">此欄有誤' : '>' . $row_result[2]) . '</td><td>' . $row_result[3]. '</td>';
                $td_str .= '<td'  . (!$row_result["OSHORT_check"] ? ' style="color: red;background-color: pink;">此欄有誤' : '>' . $row_result[4]) . '</td><td>' . $row_result[5]. '</td>';
                $td_str .= '<td>' . $row_result[6] . '</td><td>' . $row_result[7] . '</td>';
                echo $td_str;
                break;

            case "shStaffChange":
                $td_str  = '<td>' . $row_result[0] . '</td><td>' . $row_result[1] .  '</td>';
                $td_str .= '<td'  . (!$row_result["emp_id_check"] ? ' style="color: red;background-color: pink;">此欄有誤' : '>' . $row_result[2]) . '</td><td>' . $row_result[3]. '</td>';
                $td_str .= '<td'  . (!$row_result["OSHORT_check"] ? ' style="color: red;background-color: pink;">此欄有誤' : '>' . $row_result[4]) . '</td><td>' . $row_result[5]. '</td>';
                $td_str .= '<td>' . $row_result[6] . '</td><td>' . $row_result[7] . '</td>';
                echo $td_str;
                break;

            default:            // 預定失效 
        }

        // 更新错误计数
        global $stopUpload;
        $stopUpload += 1;
        global $errLog;
        $errLog[] = $row_result;

    }
    // 构建错误消息
    function generateErrorMessage($submit, $row_result, $item_check) {
        $errorMsg = '';     // 訊息
        $conCount = 0;      // 件數

        $spans = "<span style='color: red;'>";
        $spane = "</span>";

        switch($submit){
            case "snLocal":    
                if(!$row_result["OSHORT_check"]){
                    $errorMsg .= $spans.'部門代碼'.$spane;
                    $conCount++;
                }
                if (!$row_result["noise_check"]) {
                    foreach (['4' => 'A權音壓級(dBA)', '5' => '日時量平均(dBA)'] as $index => $message) {
                        if (empty($row[$index])) {
                            if ($errorMsg !== '') {
                                $errorMsg .= '錯誤與';
                            }
                            $errorMsg .= $spans . $message . $spane;
                            $conCount++;
                        }
                    }
                }
                if(!$row_result["MONIT_LOCAL_check"]){
                    if ($errorMsg !== '') {
                        $errorMsg .= '錯誤與';
                    }
                    $errorMsg .= $spans.'監測處所(255)'.$spane;
                    $conCount++;
                }
                if(!$row_result["WORK_DESC_check"]){
                    if ($errorMsg !== '') {
                        $errorMsg .= '錯誤與';
                    }
                    $errorMsg .= $spans.'作業描述(255)'.$spane;
                    $conCount++;
                }
                break;

            case "supp":
                break;

            default:            // 預定失效 
        }
        $errorMsg .= ($conCount > 1) ? '皆' : '';
        return $errorMsg;
    }

?>

