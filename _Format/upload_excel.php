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
                    // 在此处可以对$data进行进一步处理
                    // 将结果输出为HTML表格
                    $theadTitles = array('廠區', '部門代碼', '部門名稱', '類別', '均能音量', '8小時平均', '監測編號', '監測處所', '作業描述');  //工作日8小時平均音壓值
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
                            $row[3] = str_replace('、', ', ', $row[3]);  // 類別 符號轉逗號

                            // 檢查OSHORT是否空值
                                $OSHORT_check = !empty($row[1]);

                            // 檢查HE_CATE是否含"噪音作業"，必須填AVG_VAL或AVG_8HR
                                if(preg_match("/噪音/i",$row[3])){
                                    $noise_check = ($row[4] || $row[5]) ? true : false ;
                                }else{
                                    $noise_check = true;
                                }

                                $row_result = array_merge($row, [
                                    "OSHORT_check" => $OSHORT_check,
                                    "noise_check"  => $noise_check
                                ]);

                            // if ($SN_row["state"] !== "NA" && is_numeric($amount_replace)) {
                            if ($OSHORT_check && $noise_check) {
                                foreach ($row as $index => $value) {
                                    if ($index > 7) break;
                                    echo '<td>' . htmlspecialchars($value) . '</td>';
                                }
                                echo '<td class="word_bk">' . htmlspecialchars($row[8]) . '</td>';

                                $process = [
                                    "OSTEXT_30"     => $row[0],
                                    "OSHORT"        => $row[1],
                                    "OSTEXT"        => $row[2],
                                    "HE_CATE"       => $row[3],
                                    "AVG_VOL"       => $row[4],
                                    "AVG_8HR"       => $row[5],
                                    "MONIT_NO"      => $row[6],
                                    "MONIT_LOCAL"   => $row[7],
                                    "WORK_DESC"     => $row[8],
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

                        // cata購物車鋪設前處理 
                            $cart_dec = (array) json_decode($jsonString);

                            // 以下是回傳給form購物車使用。
                            echo '<textarea name="" id="excel_json" class="form-control" style="display: none;">'.$jsonString.'</textarea>';
                            echo '</div>';
                        }else{
                            echo '<div name="" id="stopUpload" style="color: red; font-weight: bold;">'."有 ".$stopUpload." 個資料有誤，請確認後再上傳。".'</div>';
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
        $errorMsg = generateErrorMessage($submit, $row_result, $item_check);

        // 输出错误消息
        switch($submit){
            case "snLocal":
                $td_str  = '<td>' . $row_result[0] . '</td>';
                $td_str .= '<td' . (!$row_result["OSHORT_check"] ? ' style="color: red;background-color: pink;">此欄有誤' : '>' . $row_result[1]) . '</td>';
                $td_str .= '<td>' . $row_result[2] . '</td><td>' . $row_result[3] . '</td>';
                $td_str .= '<td' . (!$row_result["noise_check"] ? ' style="color: red;background-color: pink;" colspan="2">此2欄噪音值有誤' : '>' . $row_result[4] . '</td><td>' . $row_result[5]) . '</td>';
                $td_str .= '<td>' . $row_result[6] . '</td><td>' . $row_result[7] . '</td>';
                $td_str .= '<td class="word_bk">' . $row_result[8] . (!$row_result["OSHORT_check"] || !$row_result["noise_check"] ? '<br><span style="background-color: pink;">注意：此列' . $errorMsg . '有誤' : '') . '</span></td>';
                echo $td_str;
                break;
            default:            // 預定失效 
        }

        // 更新错误计数
        global $stopUpload;
        $stopUpload += 1;
    }
    // 构建错误消息
    function generateErrorMessage($submit, $row_result, $item_check) {
        $errorMsg = '';
        $conCount = 0;
        
        switch($submit){
            case "snLocal":    
                if(!$row_result["OSHORT_check"]){
                    $errorMsg .= '<span style="color: red;">部門代碼</span>';
                    $conCount = 0;
                }
                if (!$row_result["noise_check"]) {
                    foreach (['4' => '均能音量', '5' => '工作日8小時平均音壓值'] as $index => $message) {
                        if (empty($row[$index])) {
                            if ($errorMsg !== '') {
                                $errorMsg .= '錯誤與';
                            }
                            $errorMsg .= '<span style="color: red;">' . $message . '</span>';
                            $conCount++;
                        }
                    }
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

