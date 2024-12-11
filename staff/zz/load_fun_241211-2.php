<?php
    if(isset($_REQUEST['fun'])) {
        require_once("../pdo.php");
        extract($_REQUEST);
        
            function sendErrorResponse($errorMessage, $httpCode = 500) {
                http_response_code($httpCode);
                echo json_encode(['error' => $errorMessage]);
                exit();
            }
            
            function executeQuery($stmt, $params) {
                try {
                    return $stmt->execute($params);
                } catch (PDOException $e) {
                    error_log($e->getMessage());
                    sendErrorResponse('Database error.');
                }
            }

            function parseJsonParams($parm) {
                $parm_array = json_decode($parm, true); // 解碼為陣列
                if (json_last_error() !== JSON_ERROR_NONE) {
                    sendErrorResponse('Invalid JSON format for parameters.', 400);
                }
                return $parm_array;
            }

        $result = [];

        if (!isset($parm) || empty($parm)) {
            sendErrorResponse('Load '.$fun.' failed...(no parm)', 400);
        }

        switch ($fun) {
            case 'load_hrdb': // 241211 由hrdb撈取人員資料，帶入查詢條件OSHORT
                $pdo = pdo_hrdb();
                $parm_array = parseJsonParams($parm); // 使用新的函數解析JSON

                if (is_array($parm_array) && !empty($parm_array)) {
                    $placeholders = implode(',', array_fill(0, count($parm_array), '?'));
                    $sql = "SELECT _S.emp_sub_scope, _S.dept_no, _S.emp_dept, _S.emp_id, _S.cname,
                                    _S.cstext, _S.gesch, _S.emp_group, _S.natiotxt, _S.schkztxt,
                                    _S.updated_at, _E.HIRED 
                            FROM STAFF _S 
                            LEFT JOIN HCM_VW_EMP01_hiring _E ON _S.emp_id = _E.PERNR 
                            WHERE _S.dept_no IN ($placeholders) 
                            ORDER BY _S.dept_no ASC, _S.emp_id ASC";
                    
                    $stmt = $pdo->prepare($sql);
                    executeQuery($stmt, $parm_array);
                    
                    $shStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $result = ['result_obj' => $shStaffs, 'fun' => $fun, 'success' => 'Load ' . $fun . ' success.', 'parm' => $parm_array];
                } else {
                    $result['error'] = 'Parameters are either not an array or empty.';
                }
                break;

            case 'load_shLocal':                   // _shLocal撈取唯一清單，帶入查詢條件OSHORT
                $pdo = pdo();
                $parm_array = parseJsonParams($parm); // 使用新的函數解析JSON

                if (is_array($parm_array) && !empty($parm_array)) {
                    $placeholders = implode(',', array_fill(0, count($parm_array), '?'));
                    $sql = "SELECT _S.id, _S.OSTEXT_30, _S.OSHORT, _S.OSTEXT, _S.HE_CATE, _S.AVG_VOL, _S.AVG_8HR, _S.MONIT_NO, _S.MONIT_LOCAL, _S.WORK_DESC
                            FROM `_shlocal` _S
                            WHERE _S.flag = 'On' AND _S.OSHORT IN ($placeholders)
                            ORDER BY _S.OSHORT ASC";
    
                    $stmt = $pdo->prepare($sql);
                    executeQuery($stmt, $parm_array);
                    
                    $shStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $result = [
                        'result_obj' => $shStaffs, 
                        'fun'        => $fun, 
                        'success'    => 'Load '.$fun.' success.', 
                        'parm'       => $parm_array
                    ];
                } else {
                    $result['error'] = 'Parameters are either not an array or empty.';
                }
                break;
   
            case 'load_staff_byDeptNo':
                $pdo = pdo();
                // $sql = "SELECT emp_id, cname, shCase_logs, _content 
                //         FROM _staff
                //         WHERE JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.', JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(shCase_logs), '$[0]'))))), '$.dept_no')) IN ({$parm}) ";
                $year = $year ?? date('Y');
                // 241025--owner想把特作內的部門代號都掏出來...由各自的窗口進行維護... // 241104 UNION ALL之後的項目暫時不需要給先前單位撈取了，故於以暫停
                $sql = "SELECT emp_id, cname, shCase_logs, _content
                        FROM _staff
                        WHERE JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.dept_no'))) IN ($parm)
                            -- WHERE JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.shCase[0].OSHORT'))) IN ({$parm})
                            --    OR JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.shCase[1].OSHORT'))) IN ({$parm})
                            --    OR JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.shCase[2].OSHORT'))) IN ({$parm});
                        ORDER BY emp_id ASC ";

                        // $deBugFile = "deBug.json";      // 預設sw.json檔案位置
                        // $fop = fopen($deBugFile,"w");   // 開啟檔案
                        // fputs($fop, $parm);             // 初始化sw+寫入
                        // fclose($fop);                   // 關閉檔案
                    
                $stmt = $pdo->prepare($sql);
                
                try {
                    $stmt->execute();
                    $shStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $current_year = date('Y');

                    foreach($shStaffs as $index => $shStaff){
                        $shStaffs[$index]['shCase_logs']     = json_decode($shStaffs[$index]['shCase_logs'], true);
                            $shStaffs[$index]['shCase']      = $shStaffs[$index]['shCase_logs'][$current_year]['shCase'];
                            $shStaffs[$index]['shCondition'] = $shStaffs[$index]['shCase_logs'][$current_year]['shCondition'];
                            
                        // $shStaffs[$index]['_content'][$current_year] = json_decode($shStaffs[$index]['_content'], true);
                        $shStaffs[$index]['_content']        = json_decode($shStaffs[$index]['_content']);
                    }

                // 製作返回文件
                    $result = [
                        'result_obj' => $shStaffs,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];

                } catch (PDOException $e) {
                    echo $e->getMessage();
                    $result = [
                        'result_obj' => $shStaffs,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e or no parm)'
                    ];
                }

            break;

            case 'bat_storeStaff':  // 
                if(!isset($parm)) {
                    sendErrorResponse('Load '.$fun.' failed...(no parm)');
                }
    
                require_once("../user_info.php");
                $pdo = pdo();
                $swal_json = [
                    "fun"       => "bat_storeStaff",
                    "content"   => "批次儲存名單--"
                ];

                $sql_select = "SELECT shCase_logs, _content FROM _staff WHERE emp_id = ? ";
                $sql_insert = "INSERT INTO _staff ( emp_id, cname, gesch, natiotxt, HIRED, 
                                    shCase_logs, _content, created_cname, updated_cname,  created_at, updated_at ) VALUES ";
                // ON DUPLICATE KEY UPDATE：在插入操作導致唯一鍵或主鍵衝突時，執行更新操作。
                $sql_update = "ON DUPLICATE KEY UPDATE 
                                cname            = VALUES(cname),
                                gesch            = VALUES(gesch),
                                natiotxt         = VALUES(natiotxt),
                                HIRED            = VALUES(HIRED),
                                shCase_logs      = VALUES(shCase_logs),
                                _content         = VALUES(_content),
                                updated_cname    = VALUES(updated_cname),
                                updated_at       = now()";
                $values = [];
                $params = [];
                $parm_array = parseJsonParams($parm); // 使用新的函數解析JSON
                // step.3a 檢查並維護現有資料中的 key
                $current_year = date('Y');

                foreach ($parm_array as $parm_i) {
                    $parm_i_arr = (array) $parm_i; // #2.這裡也要由物件轉成陣列
                    extract($parm_i_arr);
                
                    // step.1 提取現有資料
                    $stmt_select = $pdo->prepare($sql_select);
                    $stmt_select -> execute([$emp_id]);
                    $row_data = $stmt_select->fetch(PDO::FETCH_ASSOC);
                
                    // step.2 解析現有資料為陣列
                    $row_shCase_logs = isset($row_data['shCase_logs']) ? json_decode($row_data['shCase_logs'], true) : [];
                    $row_content     = isset($row_data['_content'])    ? json_decode($row_data['_content']   , true) : [];
                
                    // step.3b 更新或新增該年份的資料
                        $row_shCase_logs[$current_year] = [
                            "dept_no"       => !empty($dept_no)       ? $dept_no       : (!empty($row_shCase_logs[$current_year]["dept_no"])       ? $row_shCase_logs[$current_year]["dept_no"]       : null),
                            "emp_dept"      => !empty($emp_dept)      ? $emp_dept      : (!empty($row_shCase_logs[$current_year]["emp_dept"])      ? $row_shCase_logs[$current_year]["emp_dept"]      : null),
                            "emp_sub_scope" => !empty($emp_sub_scope) ? $emp_sub_scope : (!empty($row_shCase_logs[$current_year]["emp_sub_scope"]) ? $row_shCase_logs[$current_year]["emp_sub_scope"] : null),
                            "schkztxt"      => !empty($schkztxt)      ? $schkztxt      : (!empty($row_shCase_logs[$current_year]["schkztxt"])      ? $row_shCase_logs[$current_year]["schkztxt"]      : null),
                            "cstext"        => !empty($cstext)        ? $cstext        : (!empty($row_shCase_logs[$current_year]["cstext"])        ? $row_shCase_logs[$current_year]["cstext"]        : null),
                            "emp_group"     => !empty($emp_group)     ? $emp_group     : (!empty($row_shCase_logs[$current_year]["emp_group"])     ? $row_shCase_logs[$current_year]["emp_group"]     : null),
                            "shCase"        => isset($shCase)         ? $shCase        : (!empty($row_shCase_logs[$current_year]["shCase"])        ? $row_shCase_logs[$current_year]["shCase"]        : null),    // 特作區域
                            "shCondition"   => !empty($shCondition)   ? $shCondition   : (!empty($row_shCase_logs[$current_year]["shCondition"])   ? $row_shCase_logs[$current_year]["shCondition"]   : null)     // 特作驗證
                        ];

                    // 檢查並串接新的 _content
                    if (isset($_content[$current_year])) {
                        // 確保 $_content[$current_year] 是陣列，並將其轉換成字符串
                        // $new_content = is_array($_content[$current_year]) ? implode("\r\n", $_content[$current_year]) : $_content[$current_year];
                        $new_content = $_content[$current_year];
                        // 確保 $row_content[$current_year] 是陣列的存在
                        $row_content[$current_year] = $row_content[$current_year] ?? [];

                        // 檢查 $new_content 是否非空，才進行後續操作
                        if (!empty($new_content)) {
                            // 檢查現有內容是否非空，再進行串接
                            // if (isset($row_content[$current_year])) {
                                foreach ($new_content as $new_content_key => $new_content_value){     // forEach目的：避免蓋掉其他項目 。$new_content_key這裡指到import
                                    // $row_content[$current_year][$new_content_key] = isset($row_content[$current_year][$new_content_key]) ? $row_content[$current_year][$new_content_key]:[];
                                    // $row_content[$current_year][$new_content_key] = $new_content[$new_content_key]; // 直接覆蓋指定項
                                    
                                    // 針對每一筆分別帶入
                                    foreach ($new_content_value as $newMainKey => $newMainValue){
                                        // $row_content[$current_year][$new_content_key] = $row_content[$current_year][$new_content_key] ?? [];
                                        // $row_content[$current_year][$new_content_key][$newMainKey] = !empty($newMainValue) ? $newMainValue : (!empty($row_content[$current_year][$new_content_key][$newMainKey]) ? $row_content[$current_year][$new_content_key][$newMainKey] : null);
                                        $row_content[$current_year][$new_content_key] = $row_content[$current_year][$new_content_key] ?? [];
                                        $row_content[$current_year][$new_content_key][$newMainKey] = !empty($newMainValue) ? $newMainValue : ($row_content[$current_year][$new_content_key][$newMainKey]);
                                    }
                                }
                            // } else {
                                // 如果現有內容是空的，直接設置為新內容
                                // $row_content[$current_year] = $new_content;
                            // }
                        }
                    }
                
                    // step.4 將更新後的資料編碼為 JSON 字串
                    $shCase_logs_str = json_encode($row_shCase_logs, JSON_UNESCAPED_UNICODE);
                    $_content_str    = json_encode($row_content,     JSON_UNESCAPED_UNICODE);
                
                    // 防呆
                    $gesch    = $gesch    ?? "";    // 性別
                    $natiotxt = $natiotxt ?? "";    // 國別
                    $HIRED    = $HIRED    ?? "";    // 到職日

                    // step.5 準備 SQL 和參數
                    $values[] = "(?, ?, ?, ?, ?,   ?, ?,  ?, ?, now(), now())";
                    $params = array_merge($params, [
                        $emp_id, $cname, $gesch, $natiotxt, $HIRED,
                        $shCase_logs_str, $_content_str, 
                        $auth_cname, $auth_cname
                    ]);
                }

                $sql = $sql_insert . implode(", ", $values) . " " . $sql_update;
                $stmt = $pdo->prepare($sql);
                    
                try {
                    $stmt->execute($params);
                    // 製作返回文件
                    $swal_json["action"]   = "success";
                    $swal_json["content"] .= '儲存成功';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                
                } catch (PDOException $e) {
                    echo $e->getMessage();
                    $swal_json["action"]   = "error";
                    $swal_json["content"] .= '儲存失敗';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e or no parm)'
                    ];
                }
                break;

            case 'storeForReview':        // 241209 送嬸
                define('SQL_SELECT_DOC', "SELECT * FROM _document WHERE age = ? AND dept_no = ?");
                define('SQL_INSERT_DOC', "INSERT INTO _document (age, dept_no, omager, check_list, in_sign, in_signName, idty, flow, flow_remark, _content, created_emp_id, created_cname, updated_cname, logs, uuid, created_at, updated_at) VALUES ");
                define('SQL_UPDATE_DOC', "ON DUPLICATE KEY UPDATE check_list = VALUES(check_list), in_sign = VALUES(in_sign), in_signName = VALUES(in_signName), idty = VALUES(idty), flow = VALUES(flow), flow_remark = VALUES(flow_remark), _content = VALUES(_content), updated_cname = VALUES(updated_cname), logs = VALUES(logs), updated_at = NOW()");

                function showSignCode($request) {
                    $pdo_hrdb = pdo_hrdb();
                    $sql = "SELECT DEPT08.* FROM HCM_VW_DEPT08 DEPT08 WHERE DEPT08.OSHORT = ?";
                    $stmt = $pdo_hrdb->prepare($sql);
                    executeQuery($stmt, [$request]);
                    return $stmt->fetch(PDO::FETCH_ASSOC);
                }

                require_once("../user_info.php");
                $pdo = pdo();
                $swal_json = [
                    "fun" => "bat_storeForReview",
                    "content" => "批次送審名單--"
                ];
            
                $values = [];
                $params = [];
                $parm = json_decode($parm, true); // 解碼為陣列
                if (json_last_error() !== JSON_ERROR_NONE) {
                    sendErrorResponse('Invalid JSON data', 400);
                }

                // 接下來的處理邏輯...
                $age = $current_year = date('Y');
                $new_check_list_in = [];
                $new_check_list_out = [];
                $new_form = [];

                foreach ($parm as $parm_i) {
                    $parm_i_arr = (array) $parm_i; 
                    $dept_no = $parm_i_arr["dept_no"];
                    
                    $new_check_list_in[$dept_no] = $new_check_list_in[$dept_no] ?? [];
                    $new_check_list_out[$dept_no] = $new_check_list_out[$dept_no] ?? [];
            
                    if (!empty($parm_i_arr["shCase"])) {
                        array_push($new_check_list_in[$dept_no], $parm_i_arr["emp_id"]);
                    } else {
                        array_push($new_check_list_out[$dept_no], $parm_i_arr["emp_id"]);
                    }
                }

                if (!empty($new_check_list_in)) {
                    foreach ($new_check_list_in as $new_check_deptNo => $new_check_valueArr) {
                        $stmt_select = $pdo->prepare(SQL_SELECT_DOC);
                        executeQuery($stmt_select, [$age, $new_check_deptNo]);
            
                        $row_data = $stmt_select->fetch(PDO::FETCH_ASSOC);
                        $row_check_list = isset($row_data["check_list"]) ? json_decode($row_data["check_list"], true) : [];
            
                        $new_form[$new_check_deptNo] = [
                            "check_list" => array_merge($new_check_valueArr, $row_check_list)
                        ];
                        
                        $result = showSignCode($new_check_deptNo);
                        $new_form[$new_check_deptNo]["omager"] = $result["omager"] ?? ($row_data["omager"] ?? "");
            
                        $check_list_str = json_encode($new_form[$new_check_deptNo]["check_list"], JSON_UNESCAPED_UNICODE);
            
                        // 防呆，使用預設值
                        $in_sign = $in_sign ?? "in_sign";  
                        $in_signName = $in_signName ?? "in_signName";  
                        $idty = $idty ?? "idty";  
                        $flow = $flow ?? "flow";  
                        $flow_remark = $flow_remark ?? "flow_remark";  
                        $_content = $_content ?? "_content";  
            
                        // 準備 SQL 和參數
                        $values[] = "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, uuid(), now(), now())";
                        $params = array_merge($params, [
                            $age, $new_check_deptNo, $new_form[$new_check_deptNo]["omager"],
                            $check_list_str, $in_sign, $in_signName, $idty, $flow, $flow_remark, $_content,
                            $auth_emp_id, $auth_cname, $auth_cname, $logs
                        ]);
                    }
                }

                $sql = SQL_INSERT_DOC . implode(", ", $values) . " " . SQL_UPDATE_DOC;
                $stmt = $pdo->prepare($sql);

                if (executeQuery($stmt, $params)) {
                    // 製作返回文件
                    $swal_json["action"] = "success";
                    $swal_json["content"] .= '儲存成功';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun' => $fun,
                        'success' => 'Load '.$fun.' success.'
                    ];
                } else {
                    $swal_json["action"] = "error";
                    $swal_json["content"] .= '儲存失敗';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun' => $fun,
                        'error' => 'Load '.$fun.' failed...(e or no parm)'
                    ];
                }

                break;

            case 'update_heCate':
                $swal_json = array(                                 // for swal_json
                    "fun"       => "update_heCate",
                    "content"   => "更新危害類別--"
                );
                $heCateFile = "he_cate.json";                                     // 預設sw.json檔案位置
                $HE_CATE_json = isset($_REQUEST['parm']) ? $_REQUEST['parm'] : null;
                if(!empty($HE_CATE_json)){
                    $fop = fopen($heCateFile,"w");  //開啟檔案
                    fputs($fop, $HE_CATE_json);     //初始化sw+寫入
                    fclose($fop);                   //關閉檔案
                    // 製作返回文件
                    $swal_json["action"]   = "success";
                    $swal_json["content"] .= '儲存成功';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                }else{
                    // echo "<script>alert('參數sw_json_data異常，請重新確認~')</script>";
                    $swal_json["action"]   = "error";
                    $swal_json["content"] .= '儲存失敗';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e or no parm)'
                    ];
                }
                break;

            case 'load_heCate':     // for 提取危害類別
                // load 作業類別json
                $heCateFile = "../sh_local/he_cate.json";              // 預設sw.json檔案位置
                if(file_exists($heCateFile)){
                    $heCate_json = file_get_contents($heCateFile);              // 从 JSON 文件加载内容
                    // $heCate_arr = (array) json_decode($heCate_json, true);     // 解析 JSON 数据并将其存储在 $form_a_json 变量中 // 如果您想将JSON解析为关联数组，请传入 true，否则将解析为对象
                    // 製作返回文件
                    $result = [
                        'result_obj' => $heCate_json,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                }else{
                    $result = [
                        'result_obj' => '',
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e 提取失敗 or 無內容)'
                    ];
                }
                break;

            default:
                sendErrorResponse('Invalid function', 400);
        }

        // 正常返回
        http_response_code(200);
        echo json_encode($result);

    } else {
        sendErrorResponse('fun is lost.', 400);
    }
?>