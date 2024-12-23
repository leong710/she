<?php
        function sendErrorResponse($errorMessage, $httpCode = 500) {
            http_response_code($httpCode);
            echo json_encode(['error' => $errorMessage]);
            exit();
        }
        
        function executeQuery($stmt, $params) {
            try {
                return empty($params) ? $stmt->execute() : $stmt->execute($params);
            } catch (PDOException $e) {
                error_log($e->getMessage());
                sendErrorResponse('Database error.');
            }
        }

        function parseJsonParams($parm) {
            $parm_array = json_decode($parm, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                sendErrorResponse('Invalid JSON format for parameters.', 400);
            }
            return $parm_array;
        }
        
    if(isset($_REQUEST['fun'])) {
        require_once("../pdo.php");
        extract($_REQUEST);

        $result = [];

        if (!isset($parm) || empty($parm)) {
            sendErrorResponse('Load '.$fun.' failed...(no parm)', 400);
        }

        switch ($fun){
            case 'load_hrdb':                   // 由hrdb撈取人員資料，帶入查詢條件OSHORT
                $pdo = pdo_hrdb();
                $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                
                $sql = "SELECT _S.emp_sub_scope, _S.dept_no, _S.emp_dept, _S.emp_id, _S.cname, _S.cstext, _S.gesch, _S.emp_group, _S.natiotxt, _S.schkztxt, _S.updated_at, _E.HIRED
                        FROM STAFF _S 
                        LEFT JOIN HCM_VW_EMP01_hiring _E ON _S.emp_id = _E.PERNR
                        WHERE _S.dept_no IN ({$parm_re}) ";

                // 後段-堆疊查詢語法：加入排序
                $sql .= " ORDER BY _S.dept_no ASC, _S.emp_id ASC ";

                $stmt = $pdo->prepare($sql);
                try {

                    $stmt->execute();                                   //處理 byAll
                    $shStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    // 製作返回文件
                    $result = [
                        'result_obj' => $shStaffs,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.',
                        'parm'       => $parm_re
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
    
            break;
            case 'load_shLocal':                   // _shLocal撈取唯一清單，帶入查詢條件OSHORT
                $pdo = pdo();
                $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                
                // $sql = "SELECT _S.OSTEXT_30,_S.OSHORT,_S.OSTEXT
                //             , GROUP_CONCAT(DISTINCT _S.AVG_VOL ORDER BY _S.AVG_VOL SEPARATOR ',') AS gb_AVG_VOL 
                //             , GROUP_CONCAT(DISTINCT _S.AVG_8HR ORDER BY _S.AVG_8HR SEPARATOR ',') AS gb_AVG_8HR 
                //             , GROUP_CONCAT(DISTINCT _S.HE_CATE ORDER BY _S.HE_CATE SEPARATOR ',') AS gb_HE_CATE 
                //         FROM `_shlocal` _S
                //         WHERE _S.flag = 'On' AND _S.OSHORT IN ({$parm_re})
                //         GROUP BY _S.OSHORT ";
                $sql = "SELECT _S.id, _S.OSTEXT_30, _S.OSHORT, _S.OSTEXT, _S.HE_CATE, _S.AVG_VOL, _S.AVG_8HR, _S.MONIT_NO, _S.MONIT_LOCAL, _S.WORK_DESC
                        FROM `_shlocal` _S
                        WHERE _S.flag = 'On' AND _S.OSHORT IN ({$parm_re})
                        ";

                // 後段-堆疊查詢語法：加入排序
                $sql .= " ORDER BY _S.OSHORT ASC ";

                $stmt = $pdo->prepare($sql);
                try {

                    $stmt->execute();                                   //處理 byAll
                    $shStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    // 製作返回文件
                    $result = [
                        'result_obj' => $shStaffs,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.',
                        'parm'       => $parm_re
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }

            break;
            case 'load_sample':                   // 帶入查詢條件
                $pdo = pdo_hrdb();
                $sql = "SELECT s.emp_sub_scope, s.dept_no, s.emp_dept, s.emp_id, s.cname, s.cstext, s.gesch, s.emp_group, s.natiotxt, s.schkztxt, s.updated_at
                        FROM STAFF s ";

                // 初始查詢陣列
                    $conditions = [];
                    $stmt_arr   = [];    

                if (!empty($parm)) {
                    $conditions[] = "s.dept_no IN ( ? )";
                    // $stmt_arr[] = $parm;
                    $stmt_arr[] = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                }
                
                if (!empty($conditions)) {
                    $sql .= ' WHERE ' . implode(' AND ', $conditions);
                }
                // 後段-堆疊查詢語法：加入排序
                $sql .= " ORDER BY s.dept_no ASC, s.emp_id ASC ";

                $stmt = $pdo->prepare($sql);
                try {
                    if(!empty($stmt_arr)){
                        $stmt->execute($stmt_arr);                          //處理 byUser & byYear
                    }else{
                        $stmt->execute();                                   //處理 byAll
                    }
                    $shStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    // 製作返回文件
                    $result = [
                        'result_obj' => $shStaffs,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }

            break;
            case 'load_staff_byDeptNo':
                $pdo = pdo();
                // $sql = "SELECT emp_id, cname, shCase_logs, _content 
                //         FROM _staff
                //         WHERE JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.', JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(shCase_logs), '$[0]'))))), '$.dept_no')) IN ({$parm}) ";
                $year = $year ?? date('Y');
                $parm = str_replace('"', '', $parm);
                // 分拆參數
                $emp_sub_scope = explode(',', $parm)[0];
                $deptNo = explode(',', $parm)[1];
                // 241025--owner想把特作內的部門代號都掏出來...由各自的窗口進行維護... // 241104 UNION ALL之後的項目暫時不需要給先前單位撈取了，故於以暫停
                $sql = "SELECT emp_id, cname, shCase_logs, _content
                        FROM _staff
                        WHERE JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.dept_no'))) IN ('{$deptNo}')
                          AND JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.emp_sub_scope'))) IN ('{$emp_sub_scope}')
                            -- WHERE JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.shCase[0].OSHORT'))) IN ({$parm})
                            --    OR JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.shCase[1].OSHORT'))) IN ({$parm})
                            --    OR JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.shCase[2].OSHORT'))) IN ({$parm});
                        ";
                // 後段-堆疊查詢語法：加入排序
                $sql .= " ORDER BY emp_id ASC ";

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
                            // $shStaffs[$index]['eh_time']     = $shStaffs[$index]['shCase_logs'][$current_year]['eh_time'];
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
                require_once("../user_info.php");
                $pdo = pdo();
                $swal_json = array(                                 // for swal_json
                    "fun"       => "bat_storeStaff",
                    "content"   => "批次儲存名單--"
                );
                
                define('SQL_SELECT_DOC', "SELECT shCase_logs, _content FROM _staff WHERE emp_id = ? ");
                define('SQL_INSERT_DOC', "INSERT INTO _staff ( emp_id, cname, gesch, natiotxt, HIRED, shCase_logs, _content, created_cname, updated_cname,  created_at, updated_at ) VALUES ");
                // ON DUPLICATE KEY UPDATE：在插入操作導致唯一鍵或主鍵衝突時，執行更新操作。
                define('SQL_UPDATE_DOC', "ON DUPLICATE KEY UPDATE 
                                cname            = VALUES(cname),
                                gesch            = VALUES(gesch),
                                natiotxt         = VALUES(natiotxt),
                                HIRED            = VALUES(HIRED),
                                shCase_logs      = VALUES(shCase_logs),
                                _content         = VALUES(_content),
                                updated_cname    = VALUES(updated_cname),
                                updated_at       = now()");
                $values = [];
                $params = [];
                $parm_array = parseJsonParams($parm); // 使用新的函數解析JSON

                // step.3a 檢查並維護現有資料中的 key
                $current_year = date('Y');

                foreach ($parm_array as $parm_i) {
                    $parm_i_arr = (array) $parm_i; // #2.這裡也要由物件轉成陣列
                    extract($parm_i_arr);
                
                    // step.1 提取現有資料
                    $stmt_select = $pdo->prepare(SQL_SELECT_DOC);
                    executeQuery($stmt_select, [$emp_id]);
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
                        // 確保 $row_content[$current_year] 是陣列的存在
                        $row_content[$current_year] = $row_content[$current_year] ?? [];                        
                        $new_content = $_content[$current_year];
                        // 檢查 $new_content 是否非空，才進行後續操作
                        if (!empty($new_content)) {
                            foreach ($new_content as $new_content_key => $new_content_value) {      // forEach目的：避免蓋掉其他項目 。$new_content_key這裡指到import      
                                // 初始化當前年份的 row_content
                                $row_content[$current_year][$new_content_key] = $row_content[$current_year][$new_content_key] ?? [];
                                // 針對每一筆分別帶入
                                foreach ($new_content_value as $newMainKey => $newMainValue) {      // forEach目的：避免蓋掉其他項目 。$newMainKey這裡指到yearHe...
                                    // 如果 newMainValue 不為空，則使用它，否則保留舊值
                                    $row_content[$current_year][$new_content_key][$newMainKey] = $newMainValue ?? null;
                                        // !empty($newMainValue) ? $newMainValue : ($row_content[$current_year][$new_content_key][$newMainKey] ?? null);    // 這裡會無法更新新的空值
                                }
                            }
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
                
                $sql = SQL_INSERT_DOC . implode(", ", $values) . " " . SQL_UPDATE_DOC;
                $stmt = $pdo->prepare($sql);
                
                if (executeQuery($stmt, $params)) {
                    // 製作返回文件
                    $swal_json["action"] = "success";
                    $swal_json["content"] .= '儲存成功';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                } else {
                    $swal_json["action"] = "error";
                    $swal_json["content"] .= '儲存失敗';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e or no parm)'
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

            // 241211 送嬸
            case 'storeForReview':  
                require_once("../user_info.php");
                $pdo = pdo();
                $swal_json = [
                    "fun" => "storeForReview",
                    "content" => "批次送審名單--"
                ];
                
                function showSignCode($request) {
                    $pdo_hrdb = pdo_hrdb();
                    $sql = "SELECT DEPT08.* FROM HCM_VW_DEPT08 DEPT08 WHERE DEPT08.OSHORT = ?";
                    $stmt = $pdo_hrdb->prepare($sql);
                    try {
                        $stmt->execute([$request]);
                        return $stmt->fetch(PDO::FETCH_ASSOC);
                    } catch (PDOException $e) {
                        error_log($e->getMessage());
                        return null; // 返回null以便檢查
                    }
                }

                // 定義SQL語句常量
                // define('SQL_SELECT_DOC', "SELECT * FROM ( SELECT *, SUBSTRING_INDEX(uuid, ',', 1) AS _age,
                //                                             SUBSTRING_INDEX(SUBSTRING_INDEX(uuid, ',', 2), ',', -1) AS _dept_no, SUBSTRING_INDEX(uuid, ',', -1) AS _sub_scope
                //                                         FROM `_document` ) AS subquery 
                //                           WHERE _age = ? AND _dept_no = ? AND _sub_scope = ? "); // 這用在分拆uuid成獨立欄位進行篩選
                define('SQL_SELECT_DOC', "SELECT * FROM `_document` WHERE age = ? AND dept_no = ? AND sub_scope = ? ");
                define('SQL_INSERT_DOC', "INSERT INTO _document (uuid, age, dept_no, emp_dept, sub_scope, omager, check_list, in_sign, in_signName, idty, flow, flow_remark, _content, created_emp_id, created_cname, updated_cname, logs, created_at, updated_at) VALUES ");
                define('SQL_UPDATE_DOC', "ON DUPLICATE KEY UPDATE 
                                check_list      = VALUES(check_list), 
                                in_sign         = VALUES(in_sign), 
                                in_signName     = VALUES(in_signName), 
                                idty            = VALUES(idty), 
                                flow            = VALUES(flow), 
                                flow_remark     = VALUES(flow_remark), 
                                _content        = VALUES(_content), 
                                updated_cname   = VALUES(updated_cname), 
                                logs            = VALUES(logs), 
                                updated_at      = NOW()");
                $values = [];
                $params = [];
                $parm_array = parseJsonParams($parm); // 使用新的函數解析JSON
            
                $age = $current_year = date('Y');
                $new_check_list_in = [];
                $new_check_list_out = [];
                $new_form = [];

                foreach ($parm_array as $parm_i) {
                    $parm_i_arr = (array) $parm_i; 
                    $dept_no = $parm_i_arr["dept_no"];
                    $emp_dept = $parm_i_arr["emp_dept"];
                    $sub_scope = $parm_i_arr["emp_sub_scope"];
                    
                    $new_check_list_in[$dept_no]  = $new_check_list_in[$dept_no]  ?? [];
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
                        if (executeQuery($stmt_select, [$age, $new_check_deptNo, $sub_scope])) {
                            $row_data = $stmt_select->fetch(PDO::FETCH_ASSOC);
                            // 如果資料存在則更新
                            if ($row_data) {
                                $row_check_list = json_decode($row_data["check_list"], true) ?? [];
                                // 使用 array_merge() 將兩個陣列合併。 使用 array_unique() 去除重複值。
                                $new_form[$new_check_deptNo]["check_list"] = array_unique(array_merge($new_check_valueArr, $row_check_list)); 
                            } 
                            // 若不存在，可以考慮直接進行插入
                            else {
                                $new_form[$new_check_deptNo]["check_list"] = $new_check_valueArr;
                            }
                        }
                             
                        $result = showSignCode($new_check_deptNo);
                        $new_form[$new_check_deptNo]["omager"] = $result["OMAGER"] ?? ($row_data["omager"] ?? "");
            
                        // 防呆，使用預設值
                        $uuid        = $age.",".$new_check_deptNo.",".$sub_scope;
                        $in_sign     = $in_sign     ?? "in_sign";  
                        $in_signName = $in_signName ?? "in_signName";  
                        $idty        = $idty        ?? 4;  
                        $flow        = $flow        ?? "flow";  
                        $flow_remark = $flow_remark ?? "flow_remark";  
                        $_content    = $_content    ?? [];  
                        $logs        = $logs        ?? [];  
            
                        $check_list_str = json_encode($new_form[$new_check_deptNo]["check_list"], JSON_UNESCAPED_UNICODE);
                        $_content_str   = json_encode($_content, JSON_UNESCAPED_UNICODE);
                        $logs_str       = json_encode($logs, JSON_UNESCAPED_UNICODE);

                        // 準備 SQL 和參數
                        $values[] = "(?, ?, ?, ?, ?, ?,   ?, ?, ?, ?, ?, ?, ?,   ?, ?, ?, ?,   now(), now())";
                        $params = array_merge($params, [
                            $uuid, $age, $new_check_deptNo, $emp_dept, $sub_scope, $new_form[$new_check_deptNo]["omager"],
                            $check_list_str, $in_sign, $in_signName, $idty, $flow, $flow_remark, $_content_str,
                            $auth_emp_id, $auth_cname, $auth_cname, $logs_str
                        ]);
                    }
                }
                
                $sql = SQL_INSERT_DOC . implode(", ", $values) . " " . SQL_UPDATE_DOC;
                $stmt = $pdo->prepare($sql);

                if (executeQuery($stmt, $params)) {
                    // 製作返回文件
                    $swal_json["action"] = "success";
                    $swal_json["content"] .= '送審成功';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                } else {
                    $swal_json["action"] = "error";
                    $swal_json["content"] .= '送審失敗';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e or no parm)'
                    ];
                }
            break;
            // 241212 取得_document送審清單
            case 'load_document':
                $pdo = pdo();
                $year = $year ?? date('Y');
                $sql = "SELECT id, uuid, age as year_key, sub_scope as emp_sub_scope, dept_no, emp_dept, check_list, idty FROM `_document` WHERE age = '{$year}' ";

                $stmt = $pdo->prepare($sql);
                if (executeQuery($stmt, '')) {
                    $_documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    // JSON解碼
                    foreach($_documents as $index => $_doc){
                        $_documents[$index]['check_list']     = json_decode($_documents[$index]['check_list'], true);
                    }
                    // 製作返回文件
                    $result = [
                        'result_obj' => $_documents,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                } else {
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
            break;
            default:
                sendErrorResponse('Invalid function', 400);
        };

        // 正常返回
        http_response_code(200);
        echo json_encode($result);

    } else {
        sendErrorResponse('fun is lost.', 400);
    }

?>
