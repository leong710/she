<?php
    require_once("../pdo.php");
    // require_once("../user_info.php");
    require '../../libs/vendor/autoload.php';
    include("../template/header.php");

    use PhpOffice\PhpSpreadsheet\IOFactory;

    // --- 1. 建立全域配置中心 (參考正式版) ---
    /**
     * 定義不同提交類型的配置信息。
     * 包含：
     *   - headers: 表格的表頭標題。
     *   - field_mapping: 欄位索引對應的最終 JSON 鍵名。
     *   - (驗證邏輯將在 validateRow 函式中處理)
     */
    const SUBMISSION_CONFIG = [
        'shLocal' => [
            'headers' => ['廠區', '部門代碼', '部門名稱', '類別', '監測編號', '監測處所(255)', '作業描述(255)', 'A權音壓級 <sup>(dBA)</sup>', '日時量平均 <sup>(dBA)</sup>'],
            'field_mapping' => [
                "OSTEXT_30", "OSHORT", "OSTEXT", "HE_CATE", "MONIT_NO", 
                "MONIT_LOCAL", "WORK_DESC", "AVG_VOL", "AVG_8HR"
            ]
        ],
        'shStaff' => [
            'headers' => ['NO', '廠區', '工號', '姓名', '部門代碼', '部門名稱', '檢查類別', '檢查代號', '去年檢查項目'],
            'field_mapping' => [
                "no", "emp_sub_scope", "emp_id", "cname", "dept_no", "emp_dept", 
                "yearHe", "yearCurrent", "yearPre"
                // "HE_CATE", "HE_CATE_KEY" 需要特殊處理，將在 processRowData 中完成
            ]
        ],
        'shStaffChange' => [
            'headers' => ['年月份','廠區','工號','姓名','部門代碼','部門名稱'],
            'field_mapping' => [
                "targetYear", "OSTEXT_30", "emp_id", "cname", "OSHORT", "OSTEXT"
            ]
        ]
    ];

    // --- 2. 建立輔助函式 (Helper Functions) ---

    /**
     * 將特定格式的字串 'key1:value1,key2:value2' 轉換為 JSON 字串
     */
    function parseHealthCategoryString(string $inputStr): string {
        $result = [];
        $pairs = explode(',', $inputStr);
        foreach ($pairs as $pair) {
            if (strpos($pair, ':') !== false) {
                list($key, $value) = explode(':', $pair, 2); // 使用 limit 避免 value 中有 : 出錯
                $result[trim($key)] = trim($value);
            }
        }
        return json_encode($result, JSON_UNESCAPED_UNICODE);
    }

    /**
     * 根據提交類型，驗證單行資料
     * @return array 包含驗證結果的布林值陣列
     */
    function validateRow(string $submit, array $processed_row): array {
        $checks = [];
        switch ($submit) {
            case 'shLocal':
                $checks["OSHORT_check"] = !empty($processed_row[1]);
                $checks["noise_check"] = preg_match("/噪音/i", $processed_row[3]) ? (!empty($processed_row[7]) || !empty($processed_row[8])) : true;
                $checks["MONIT_LOCAL_check"] = mb_strlen($processed_row[5], 'UTF-8') <= 255; // 索引從 0 開始
                $checks["WORK_DESC_check"] = mb_strlen($processed_row[6], 'UTF-8') <= 255;
                $checks["HE_CATE_check"] = strpos($processed_row[3], ':') !== false;
                $checks["MONIT_NO_check"] = !empty($processed_row[4]);
                break;

            case 'shStaff':
                $checks["emp_id_check"] = !empty($processed_row[2]) && strlen($processed_row[2]) == 8;
                $checks["OSHORT_check"] = !empty($processed_row[4]);
                break;

            case 'shStaffChange':
                $checks["emp_id_check"] = !empty($processed_row[2]) && strlen($processed_row[2]) == 8;
                $checks["OSHORT_check"] = !empty($processed_row[4]) && strlen($processed_row[4]) == 8;
                break;
        }
        return $checks;
    }

    /**
     * 將驗證通過的資料行轉換為最終的資料結構
     * @return array 準備寫入 JSON 的單筆資料
     */
    function processRowData(string $submit, array $row, array $config): array {
        $entry = [];
        foreach ($config['field_mapping'] as $index => $fieldName) {
            $entry[$fieldName] = $row[$index] ?? '';
        }

        // 針對特定類型進行特殊資料處理
        if ($submit === 'shLocal' && preg_match("/:/i", $row[3])) {
            $entry['HE_CATE'] = parseHealthCategoryString($row[3]);
        } elseif ($submit === 'shLocal') {
            $entry['HE_CATE'] = explode(',', $row[3]);
        }

        if ($submit === 'shStaff') {
            // shStaff 的特殊欄位邏輯
            $entry["HE_CATE"] = null; // 根據原邏輯設定
            $entry["HE_CATE_KEY"] = ""; // 根據原邏輯設定
        }

        return $entry;
    }

    /**
     * 根據驗證結果，渲染表格的儲存格 (<td>)
     * @return string 組好的 HTML <td> 字串
     */
    function renderRowCells(string $submit, array $row_data, array $row_checks): string {
        $td_str = '';
        $errorSpan = '<br><span style="background-color: pink;">注意：此欄有誤</span>';
        $errorSpanFormat = '<br><span style="background-color: pink;">注意：此欄格式有誤</span>';
        $errorSpanLength = fn($len) => '<br><span style="background-color: pink;">注意：此欄字數有誤('.$len.')</span>';

        switch ($submit) {
            case 'shLocal':
                $td_str .= '<td>' . htmlspecialchars($row_data[0] ?? '') . '</td>';
                $td_str .= '<td>' . htmlspecialchars($row_data[1] ?? '') . (!$row_checks["OSHORT_check"] ? $errorSpan : '') . '</td>';
                $td_str .= '<td>' . htmlspecialchars($row_data[2] ?? '') . '</td>';
                $td_str .= '<td>' . htmlspecialchars($row_data[3] ?? '') . (!$row_checks["HE_CATE_check"] ? $errorSpanFormat : '') . '</td>';
                $td_str .= '<td>' . htmlspecialchars($row_data[4] ?? '') . (!$row_checks["MONIT_NO_check"] ? $errorSpan : '') . '</td>';
                $td_str .= '<td>' . htmlspecialchars($row_data[5] ?? '') . (!$row_checks["MONIT_LOCAL_check"] ? $errorSpanLength(mb_strlen($row_data[5], 'UTF-8')) : '') . '</td>';
                $td_str .= '<td class="word_bk">' . htmlspecialchars($row_data[6] ?? '') . (!$row_checks["WORK_DESC_check"] ? $errorSpanLength(mb_strlen($row_data[6], 'UTF-8')) : '') . '</td>';
                $td_str .= '<td>' . htmlspecialchars($row_data[7] ?? '') . (!$row_checks["noise_check"] ? $errorSpan : '') . '</td>';
                $td_str .= '<td>' . htmlspecialchars($row_data[8] ?? '') . (!$row_checks["noise_check"] ? $errorSpan : '') . '</td>';
                break;

            case 'shStaff':
            case 'shStaffChange': // 這兩者錯誤標記邏輯相同
                $errorTag = ' style="color: red; background-color: pink;"';
                $headers = SUBMISSION_CONFIG[$submit]['headers'];
                for ($i = 0; $i < count($headers); $i++) {
                    $value = htmlspecialchars($row_data[$i] ?? '');
                    $td_str .= "<td";
                    if ($i === 2 && !($row_checks['emp_id_check'] ?? true)) {
                        $td_str .= $errorTag . ">" . $value;
                    } elseif ($i === 4 && !($row_checks['OSHORT_check'] ?? true)) {
                        $td_str .= $errorTag . ">" . $value;
                    } else {
                        $td_str .= ">" . $value;
                    }
                    $td_str .= "</td>";
                }
                break;

            default:
                // 預設情況，直接輸出資料
                foreach ($row_data as $cell) {
                    $td_str .= '<td>' . htmlspecialchars($cell) . '</td>';
                }
                break;
        }
        return $td_str;
    }
    /**
     * 【最終版】超級字串清理函式
     * - 去除頭尾所有類型的空白 (包括換行符)
     * - 替換不換行空白 (NBSP)
     * - 將字串中間連續的空白/換行符壓縮為單一空格
     * @param string|null $str 原始字串
     * @return string 清理後的字串
     */
    function superTrim(?string $str): string {
        if ($str === null) {
            return '';
        }
        // 1. 將各種換行符 (Windows: \r\n, Old Mac: \r, Unix/Linux: \n) 和 不換行空白 (C2 A0)
        //    全部替換為標準空格。
        //    這是最關鍵的一步，它將所有看不見的換行符都變成了普通的、可處理的空格。
        $str = str_replace(["\r\n", "\r", "\n", "\xC2\xA0"], ' ', $str);
        // 2. (可選但推薦) 將一個或多個連續的標準空格，壓縮成單一空格。
        //    這會處理 "多個  空格" 或換行後產生的空格，把它們變成 "單一 空格"。
        $str = preg_replace('/\s+/', ' ', $str);
        // 3. 最後，使用 trim 去除字串頭尾可能剩餘的空格。
        return trim($str);
    }


    // --- 3. 重構後的主流程 ---
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['excelUpload'])) {

        // 檢查檔案是否存在
        if (!isset($_FILES['excelFile']) || empty($_FILES['excelFile']['tmp_name'])) {
            echo "<script>alert('請選擇要上傳的 Excel 檔案！');</script>";
            return;
        }

        $submitType = $_POST['excelUpload'];
        $config = SUBMISSION_CONFIG[$submitType] ?? null;

        // 如果提交類型未定義，則停止
        if (!$config) {
            echo "<script>alert('錯誤：未知的提交類型！');</script>";
            return;
        }

        // --- A. 提取出的通用邏輯：讀取檔案和建立表格 ---
        $file = $_FILES['excelFile']['tmp_name'];
        $spreadsheet = IOFactory::load($file);
        $worksheet = $spreadsheet->getActiveSheet();
        $data = $worksheet->toArray();

        // 檢查是否有資料
        if (count($data) < 2) {
            echo "<script>alert('請確認『上傳清冊』格式是否正確或包含資料！');</script>";
            return;
        }

        echo '<div class="col-12 bg-light px-0 ">';
        echo '<table><thead><tr>';
        foreach ($config['headers'] as $header) {
            echo '<th>' . $header . '</th>';
        }
        echo '</tr></thead>';
        echo '<tbody>';

        $result = [];
        $stopUpload = 0;
        $errLog = [];

        // --- B. 提取出的通用邏輯：遍歷資料行 ---
        foreach ($data as $rowIndex => $row) {
            if ($rowIndex === 0) {
                continue; // 跳過表頭
            }

            // 1. 初步資料清理
            $processed_row = array_map('superTrim', $row);
            if (isset($processed_row[1])) $processed_row[1] = strtoupper($processed_row[1]); // shLocal
            if (isset($processed_row[4])) $processed_row[4] = strtoupper($processed_row[4]); // shStaff, shStaffChange
            if (isset($processed_row[3])) $processed_row[3] = str_replace('、', ',', $processed_row[3]); // shLocal
            if (isset($processed_row[6])) $processed_row[6] = str_replace('、', ',', $processed_row[6]); // shStaff

            // 2. 進行驗證
            $row_checks = validateRow($submitType, $processed_row);
            $is_valid_row = !in_array(false, $row_checks, true);

            // 3. 渲染HTML並收集資料
            echo '<tr>';
            echo renderRowCells($submitType, $processed_row, $row_checks);
            echo '</tr>';

            if ($is_valid_row) {
                // 如果驗證通過，處理並收集資料
                $result[] = processRowData($submitType, $processed_row, $config);
            } else {
                // 如果驗證失敗，更新錯誤計數
                $stopUpload++;
                $errLog[] = $processed_row;
            }
        }

        echo '</tbody></table>';

        // --- C. 提取出的通用邏輯：最終輸出 ---
        if ($stopUpload === 0) {
            $jsonString = json_encode($result, JSON_UNESCAPED_UNICODE);
            echo '<textarea name="" id="excel_json" class="form-control" style="display: none;">' . $jsonString . '</textarea>';
        } else {
            echo '<div name="" id="stopUpload" style="color: red; font-weight: bold;">' . "有 " . $stopUpload . " 個資料有誤，請確認後再上傳。" . '</div>';
        }
        echo '</div>'; // 關閉 .col-12
    }

?>
