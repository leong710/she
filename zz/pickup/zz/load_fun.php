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
                if(isset($parm)){
                    $pdo = pdo_hrdb();
                    $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                    $sql = "SELECT _S.emp_sub_scope, _S.dept_no, _S.emp_dept, _S.emp_id, _S.cname, _S.cstext, _S.gesch, _S.emp_group, _S.natiotxt, _S.schkztxt, _S.updated_at, _E.HIRED, _E.BTRTL
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

                }else{
                    $result['error'] = 'Load '.$fun.' failed...(no parm)';
                }
            break;
            case 'load_shLocal':                   // _shLocal撈取唯一清單，帶入查詢條件OSHORT
                if(isset($parm)){
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

                }else{
                    $result['error'] = 'Load '.$fun.' failed...(no parm)';
                }
            break;
            case 'load_sample':                   // 帶入查詢條件
                if(isset($parm)){
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

                }else{
                    $result['error'] = 'Load '.$fun.' failed...(no parm)';
                }
            break;
            case 'load_staff_byDeptNo':
                if(isset($parm)){
                    $pdo = pdo();
                    $parm = str_replace('"', '', $parm);
                    // 分拆參數
                    $year          = explode(',', $parm)[0];
                    $deptNo        = explode(',', $parm)[1];
                    $emp_sub_scope = explode(',', $parm)[2];
                    // 241025--owner想把特作內的部門代號都掏出來...由各自的窗口進行維護... // 241104 UNION ALL之後的項目暫時不需要給先前單位撈取了，故於以暫停
                    $sql = "SELECT '{$year}' AS year_key, emp_id, cname, _logs, _content
                            FROM _staff
                            WHERE JSON_UNQUOTE(JSON_EXTRACT(_logs, CONCAT('$.{$year}.dept_no'))) IN ('{$deptNo}')
                              AND JSON_UNQUOTE(JSON_EXTRACT(_logs, CONCAT('$.{$year}.emp_sub_scope'))) IN ('{$emp_sub_scope}')
                            ";
                    // 後段-堆疊查詢語法：加入排序
                    $sql .= " ORDER BY emp_id ASC ";
                    $stmt = $pdo->prepare($sql);
                    try {
                        $stmt->execute();
                        $shStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        foreach($shStaffs as $index => $shStaff){
                            $shStaffs[$index]['_logs'] = json_decode($shStaffs[$index]['_logs'], true);
                            $shStaffs[$index]['shCase']      = $shStaffs[$index]['_logs'][$year]['shCase'];
                            $shStaffs[$index]['shCondition'] = $shStaffs[$index]['_logs'][$year]['shCondition'];
                            $shStaffs[$index]['_content']    = json_decode($shStaffs[$index]['_content']);
                        }

                    // 製作返回文件
                        $result = [
                            'result_obj' => $shStaffs,
                            'fun'        => $sql,
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
                }else{
                    $result['error'] = 'Load '.$fun.' failed...(no parm)';
                }
            break;
            case 'load_staff_byCheckList':      // 主要參考_doc中的checkList名單，不會亂抓!
                if(isset($parm)){
                    $pdo = pdo();
                    $parm = str_replace(['[', ']', '"'], '', $parm);
                    // 分拆參數
                    $year          = explode(',', $parm)[0];
                    $deptNo        = explode(',', $parm)[1];
                    $emp_sub_scope = explode(',', $parm)[2];
                    $checkList     = explode(',', $parm)[3];
                        $checkList = str_replace(';', ',', $checkList);

                    // 241025--owner想把特作內的部門代號都掏出來...由各自的窗口進行維護... // 241104 UNION ALL之後的項目暫時不需要給先前單位撈取了，故於以暫停
                    $sql = "SELECT '{$year}' AS year_key, emp_id, cname, _logs, _content
                            FROM _staff
                            WHERE JSON_UNQUOTE(JSON_EXTRACT(_logs, CONCAT('$.{$year}.dept_no'))) IN ('{$deptNo}')
                              AND JSON_UNQUOTE(JSON_EXTRACT(_logs, CONCAT('$.{$year}.emp_sub_scope'))) IN ('{$emp_sub_scope}')
                              AND _staff.emp_id IN ({$checkList})
                            ";
                    // 後段-堆疊查詢語法：加入排序
                    $sql .= " ORDER BY _staff.emp_id ASC ";
                    $stmt = $pdo->prepare($sql);
                    try {
                        $stmt->execute();
                        $shStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        foreach($shStaffs as $index => $shStaff){
                            $shStaffs[$index]['_logs'] = json_decode($shStaffs[$index]['_logs'], true);
                            $shStaffs[$index]['shCase']      = $shStaffs[$index]['_logs'][$year]['shCase'];
                            $shStaffs[$index]['shCondition'] = $shStaffs[$index]['_logs'][$year]['shCondition'];
                            $shStaffs[$index]['_content']    = json_decode($shStaffs[$index]['_content']);
                        }

                    // 製作返回文件
                        $result = [
                            'result_obj' => $shStaffs,
                            'fun'        => $sql,
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
                }else{
                    $result['error'] = 'Load '.$fun.' failed...(no parm)';
                }
            break;
            case 'bat_storeStaff':  // 
                require_once("../user_info.php");
                $pdo = pdo();
                $swal_json = array(                                 // for swal_json
                    "fun"       => "bat_storeStaff",
                    "content"   => "批次儲存名單--"
                );
                
                define('SQL_SELECT_DOC', "SELECT _logs, _content FROM _staff WHERE emp_id = ? ");
                define('SQL_INSERT_DOC', "INSERT INTO _staff ( emp_id, cname, gesch, natiotxt, HIRED, _logs, _content, created_cname, updated_cname,  created_at, updated_at ) VALUES ");
                // ON DUPLICATE KEY UPDATE：在插入操作導致唯一鍵或主鍵衝突時，執行更新操作。
                define('SQL_UPDATE_DOC', "ON DUPLICATE KEY UPDATE 
                                cname            = VALUES(cname),
                                gesch            = VALUES(gesch),
                                natiotxt         = VALUES(natiotxt),
                                HIRED            = VALUES(HIRED),
                                _logs      = VALUES(_logs),
                                _content         = VALUES(_content),
                                updated_cname    = VALUES(updated_cname),
                                updated_at       = now()");
                $values = [];
                $params = [];
                $parm_array = parseJsonParams($parm); // 使用新的函數解析JSON

                // step.3a 檢查並維護現有資料中的 key
                $staff_inf    = $parm_array['_staff']   ?? [];
                $current_year = $parm_array['currentYear'] ?? date('Y');

                foreach ($staff_inf as $parm_i) {
                    $parm_i_arr = (array) $parm_i; // #2.這裡也要由物件轉成陣列
                    extract($parm_i_arr);
                
                    // step.1 提取現有資料
                    $stmt_select = $pdo->prepare(SQL_SELECT_DOC);
                    executeQuery($stmt_select, [$emp_id]);
                    $row_data = $stmt_select->fetch(PDO::FETCH_ASSOC);
                
                    // step.2 解析現有資料為陣列
                    $row__logs = isset($row_data['_logs']) ? json_decode($row_data['_logs'], true) : [];
                    $row_content     = isset($row_data['_content'])    ? json_decode($row_data['_content']   , true) : [];
                
                    // step.3b 更新或新增該年份的資料
                        $row__logs[$current_year] = [
                            "cstext"        => $cstext        ?? ( $row__logs[$current_year]["cstext"]        ?? null ),
                            "dept_no"       => $dept_no       ?? ( $row__logs[$current_year]["dept_no"]       ?? null ),
                            "eh_time"       => $eh_time       ?? ( $row__logs[$current_year]["eh_time"]       ?? null ),    // 暴露時數
                            "emp_dept"      => $emp_dept      ?? ( $row__logs[$current_year]["emp_dept"]      ?? null ),
                            "emp_group"     => $emp_group     ?? ( $row__logs[$current_year]["emp_group"]     ?? null ),
                            "emp_sub_scope" => $emp_sub_scope ?? ( $row__logs[$current_year]["emp_sub_scope"] ?? null ),
                            "schkztxt"      => $schkztxt      ?? ( $row__logs[$current_year]["schkztxt"]      ?? null ),
                            "shCase"        => $shCase        ?? ( $row__logs[$current_year]["shCase"]        ?? null ),    // 特作區域
                            "shCondition"   => $shCondition   ?? ( $row__logs[$current_year]["shCondition"]   ?? null ),    // 特作驗證
                            "HIRED"         => $HIRED         ?? ( $row__logs[$current_year]["HIRED"]         ?? null ),    // 到職日
                            "BTRTL"         => $BTRTL         ?? ( $row__logs[$current_year]["BTRTL"]         ?? null ),    // 人事子範圍
                            "gesch"         => $gesch         ?? ( $row__logs[$current_year]["gesch"]         ?? null ),    // 性別
                            "natiotxt"      => $natiotxt      ?? ( $row__logs[$current_year]["natiotxt"]      ?? null )     // 國籍
                        ];
                    // //  241021 針對 
                        //     if(!empty($row__logs[$current_year]["shCase"])){
                        //         if(!empty($shCase)){
                        //             $get_shCase = (array) $row__logs[$current_year]["shCase"];
                        //             array_push($get_shCase, $shCase);
                        //             // array_push($row__logs[$current_year]["shCase"], $shCase);
                        //             $row__logs[$current_year]["shCase"] = $get_shCase;
                        //         }
                        //     }else{
                        //         $row__logs[$current_year]["shCase"] = $shCase;
                        //     }
                        
                    // $row_content[$current_year] = isset($_content) ? $_content : null;
                    // 檢查並串接新的 _content
                    if (isset($_content[$current_year])) {
                        // 確保 $_content[$current_year] 是陣列，並將其轉換成字符串
                        // $new_content = is_array($_content[$current_year]) ? implode("\r\n", $_content[$current_year]) : $_content[$current_year];
                        // 確保 $row_content[$current_year] 是陣列的存在
                        $row_content[$current_year] = $row_content[$current_year] ?? [];                        
                        $new_content = $_content[$current_year];
                        // // 檢查 $new_content 是否非空，才進行後續操作
                        // if (!empty($new_content)) {
                        //     // 檢查現有內容是否非空，再進行串接
                        //     if (!empty($row_content[$current_year])) {
                        //         foreach ($new_content as $new_content_ikey => $new_content_ivalue){     // forEach目的：避免蓋掉其他項目                                    
                        //             // if($new_content_ikey == "import"){
                        //                 // if (!empty($new_content_ivalue)) {
                        //                     foreach ($new_content_ivalue as $import_key => $import_value ) {
                        //                         // $row_content[$current_year]['import'][$import_key] = $import_value;
                        //                         $row_content[$current_year][$new_content_ikey][$import_key] = $import_value;
                        //                     }
                        //                 // }
                        //             // } else {
                        //                 // $row_content[$current_year][$new_content_ikey] = isset($row_content[$current_year][$new_content_ikey]) ? $row_content[$current_year][$new_content_ikey]:[];
                        //                 // $row_content[$current_year][$new_content_ikey] = $new_content[$new_content_ikey]; // 直接覆蓋指定項
                        //             // }
                        //         }
                        //     } else {
                        //         // 如果現有內容是空的，直接設置為新內容
                        //         $row_content[$current_year] = $new_content;
                        //     }
                        // }
                        // 更新現有的內容，將其刪除
                        $row_content[$current_year] = array_merge($row_content[$current_year], $_content[$current_year]); // 合併新的項目
                    }
                
                    // step.4 將更新後的資料編碼為 JSON 字串
                    $_logs_str = json_encode($row__logs, JSON_UNESCAPED_UNICODE);
                    $_content_str    = json_encode($row_content,     JSON_UNESCAPED_UNICODE);
                
                    // 防呆
                    $gesch    = $gesch    ?? "";    // 性別
                    $natiotxt = $natiotxt ?? "";    // 國別
                    $HIRED    = $HIRED    ?? "";    // 到職日

                    // step.5 準備 SQL 和參數
                    $values[] = "(?, ?, ?, ?, ?,   ?, ?,  ?, ?, now(), now())";
                    $params = array_merge($params, [
                        $emp_id, $cname, $gesch, $natiotxt, $HIRED,
                        $_logs_str, $_content_str, 
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
            case 'load_heCate':     // for 提取危害類別
                // load 作業類別json
                $heCateFile = "../sh_local/he_cate.json";              // 預設sw.json檔案位置
                if(file_exists($heCateFile)){
                    $heCate_json = file_get_contents($heCateFile);              // 从 JSON 文件加载内容
                    // $heCate_arr = json_decode($heCate_json, true);     // 解析 JSON 数据并将其存储在 $form_a_json 变量中 // 如果您想将JSON解析为关联数组，请传入 true，否则将解析为对象
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

            // 241223 取得審核文件年度清單
            case 'load_doc_deptNos':                   // 帶入查詢條件
                $pdo = pdo();
                $sql = "SELECT *, age as year_key, sub_scope as emp_sub_scope FROM `_document`";

                $parm = isset($parm) ? json_decode($parm, true) : [];
                $_year = $parm['_year'] ?? date('Y');

                // 初始查詢陣列
                    $conditions = [];
                    $stmt_arr   = [];    

                    $conditions[] = "idty in (4, 5, 6)";

                if (!empty($_year)) {
                    $conditions[] = "age = ?";
                    $stmt_arr[]   = $_year;
                    // $stmt_arr[] = $parm;
                    // $stmt_arr[] = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                }
                
                if (!empty($conditions)) {
                    $sql .= ' WHERE ' . implode(' AND ', $conditions);
                }
                // 後段-堆疊查詢語法：加入排序
                // $sql .= " ORDER BY s.dept_no ASC, s.emp_id ASC ";

                $stmt = $pdo->prepare($sql);
                try {
                    if(!empty($stmt_arr)){
                        $stmt->execute($stmt_arr);                          //處理 byYear
                    }else{
                        $stmt->execute();                                   //處理 byAll
                    }
                    $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $doc_deptNos_arr = [];
                    $doc_deptNos_obj = [];
                    foreach($docs as $deptNo_i){
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["id"]          = $deptNo_i["id"];
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["uuid"]        = $deptNo_i["uuid"];
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["OSTEXT"]      = $deptNo_i["emp_dept"];
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["check_list"]  = json_decode($deptNo_i["check_list"], true);
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["BTRTL"]       = $deptNo_i["BTRTL"];
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["idty"]        = $deptNo_i["idty"];
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["omager"]      = $deptNo_i["omager"];
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["in_sign"]     = $deptNo_i["in_sign"];
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["in_signName"] = $deptNo_i["in_signName"];
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["flow"]        = $deptNo_i["flow"];
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["flow_remark"] = json_decode($deptNo_i["flow_remark"], true);
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["_content"]    = json_decode($deptNo_i["_content"], true);
                        $doc_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["logs"]        = json_decode($deptNo_i["logs"], true);
                    }

                    foreach($doc_deptNos_obj as $key => $value){
                        $i = [];
                        $i[$key] = $value;
                        array_push($doc_deptNos_arr, $i);
                    }

                    // 製作返回文件
                    $result = [
                        'result_obj' => $doc_deptNos_arr,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.',
                        'sel'        => $sql
                    ];

                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }

            break;
            // 241211 送嬸
            case 'processReview':  
                require_once("../user_info.php");
                require_once("../staff/load_function.php");
                $pdo = pdo();
                $swal_json = [
                    "fun" => "processReview",
                    "content" => "批次送審名單--"
                ];

                // define('SQL_SELECT_DOC', "SELECT * FROM `_document` WHERE uuid = ? ");
                define('SQL_SELECT_PM', "SELECT GROUP_CONCAT(CONCAT(_u.emp_id, ',', _u.cname) SEPARATOR ',') AS pm_empId FROM _users _u WHERE _u.role = 1 AND _u.emp_id < 90000000 LIMIT 3;");
                define('SQL_SELECT_DOC', "SELECT _d.*, _f.pm_emp_id AS pm_empId, _f.osha_id FROM `_document` _d LEFT JOIN `_fab` _f ON REPLACE(_f.fab_title, '棟', '') = _d.sub_scope AND _f.BTRTL = _d.BTRTL WHERE uuid = ? ");
                define('SQL_UPDATE_DOC', "UPDATE _document SET in_sign = ?, in_signName = ?, idty = ?, flow = ?, flow_remark = ?, _content = ?, updated_cname = ?, logs = ?, updated_at = now() WHERE uuid = ? " );
                $values       = [];
                $params       = [];
                $parm_array   = parseJsonParams($parm); // 使用新的函數解析JSON
                $current_year = $parm_array['currentYear'] ?? date('Y');
                $staff_inf    = $parm_array['_staff']      ?? [];
                $forwarded    = $parm_array['forwarded']   ?? [];
                $doc_inf      = $parm_array['_doc']        ?? [];
                $deptNo       = $doc_inf["deptNo"];
                $uuid         = $doc_inf["uuid"];
                $_content     = $doc_inf["_content"]       ?? [];  

                // 簽核步驟
                $reviewStep_arr = reviewStep();                         // 取得reviewStep
                $action         = $parm_array["action"] ?? "3";         // 3 = 送出
                // 簽核欄位數據整理：by $action
                $action_arr     = $reviewStep_arr['action'];            // getAction arr
                    $status     = $action_arr[$action] ?? "99";         // 錯誤 (Error)

                $stmt_select = $pdo->prepare(SQL_SELECT_DOC);           // 預先動作：找是否已經有送件
                if (executeQuery($stmt_select, [$uuid])) {
                    $row_data = $stmt_select->fetch(PDO::FETCH_ASSOC);
                    // 如果資料存在則更新，$rowStep = 目前的進度 = idty // 若不存在，可以考慮直接進行插入3
                    $rowStep = ($row_data) ? ($row_data["idty"] ?? "4") : "3";  
                }

                // 簽核欄位數據整理：by $rowStep = 目前狀態
                $rowStep_arr = $reviewStep_arr['step'][$rowStep];   // getStep arr 取得目前狀態節點
                    // $rowStep_arr['idty'];              // 表單狀態
                    // $rowStep_arr['approvalStep'];      // 節點工作
                    // $rowStep_arr['remark'];            // 節點工作備註
                    // $rowStep_arr['group'];             // 適用群組
                    // $rowStep_arr['edit'];              // 節點-編輯
                    // $rowStep_arr['returnTo'];          // 節點-返回
                    // $rowStep_arr['approveTo'];         // 節點-進步

                switch ($action) {
                    case "0":       // 作廢
                        $idty = "0";
                        break;
                    case "1":       // 編輯
                    case "2":       // 暫存
                        $idty = "2";
                        break;
                    case "3":       // 送出
                    case "5":       // 轉呈
                        $idty = "4";
                    break;
                    case "4":       // 退回
                        $idty = $rowStep_arr['returnTo'];
                        $status .= " {$rowStep} => {$idty}";
                        break;
                    case "6":       // 同意
                    case "10":      // 結案
                        $idty = $rowStep_arr['approveTo'];
                        break;
                    default:
                        $idty = 4;  // 4 = 各站點審核 ** 在staff模組中只需要強制給step4
                }

                // 製作log紀錄前處理：塞進去製作元素
                    $logs_request = array (
                        "step"   => $rowStep_arr['approvalStep'] ?? '名單送審',                  // 節點
                        "cname"  => $auth_cname." (".$auth_emp_id.")",
                        "action" => $status ?? '送出 (Submit)',
                        "logs"   => $row_data["logs"] ?? "",
                        "remark" => $parm_array["sign_comm"] ?? ""
                    ); 
                // 呼叫toLog製作log檔
                    $logs_enc = toLog($logs_request);

                // 簽核欄位數據整理：by $idty = 下一步狀態
                $nextStep_arr = $reviewStep_arr['step'][$idty];   // getStep arr 取得下一步狀態節點

                $flow        = $nextStep_arr['approvalStep'] ?? "簽核審查";
                $flow_remark = [
                    "group"  => $nextStep_arr['group']  ?? "上層主管,單位窗口,護理師",  
                    "remark" => $nextStep_arr['remark'] ?? "簽核主管可維調暴露時數"
                ];

                if($action === "3"){
                    $result = queryHrdb("showSignCode",   $deptNo);                        // 查詢signCode部門主管
                    $DEPUTY = queryHrdb("showDelegation", $result["OMAGER"]);              // 查詢部門主管簽核代理人
                    $in_sign     = $in_sign     ?? ($DEPUTY["DEPUTYEMPID"] ?? $result["OMAGER"]);  
                    $in_signName = $in_signName ?? ($DEPUTY["DEPUTYCNAME"] ?? $result["cname"]);  
                    
                // } else if($action === "5"){
                //     $in_sign     = $forwarded["in_sign"]     ?? ($row_data["in_sign"]     ?? "");  
                //     $in_signName = $forwarded["in_signName"] ?? ($row_data["in_signName"] ?? "");  

                } else {
                    if($idty === "5"){
                        $pm_empId_arr = explode(",", $row_data["pm_empId"]);    // 資料表是字串，要炸成陣列
                        $in_sign      = $pm_empId_arr[0] ?? NULL;               // 由 4->5時，即業務窗口簽核，未到主管
                        $in_signName  = $pm_empId_arr[1] ?? NULL;               // 由 存換成 NULL
                    }else if($idty === "6"){
                        $pm_select = $pdo->prepare(SQL_SELECT_PM);              // 預先動作：找出大PM
                        if (executeQuery($pm_select, '' )) {
                            $pm_data = $pm_select->fetch(PDO::FETCH_ASSOC);
                        }else{
                            $pm_data = array ( "pm_empId" => "" );
                        }
                        $pm_empId_arr = explode(",", $pm_data["pm_empId"]);    // 資料表是字串，要炸成陣列
                        $in_sign      = $pm_empId_arr[0] ?? NULL;               // 由 4->5時，即業務窗口簽核，未到主管
                        $in_signName  = $pm_empId_arr[1] ?? NULL;               // 由 存換成 NULL
                    }else{
                        $in_sign     = ($action === "5") ? $forwarded["in_sign"]     : ($row_data["in_sign"]     ?? NULL);  
                        $in_signName = ($action === "5") ? $forwarded["in_signName"] : ($row_data["in_signName"] ?? NULL);  
                    }
                }
                
                // 重點打包
                $flow_remark_str = json_encode($flow_remark, JSON_UNESCAPED_UNICODE);
                $_content_str    = json_encode($_content,    JSON_UNESCAPED_UNICODE);

                // 準備 SQL 和參數
                $params = array_merge($params, [
                        $in_sign, $in_signName, $idty, $flow, $flow_remark_str, $_content_str,
                        $parm_array["updated_cname"], $logs_enc, $uuid
                    ]);

                $sql = SQL_UPDATE_DOC;
                $stmt = $pdo->prepare($sql);

                if (executeQuery($stmt, $params)) {
                    // 製作返回文件
                    $swal_json["action"] = "success";
                    $swal_json["content"] .= '簽核成功';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                } else {
                    $swal_json["action"] = "error";
                    $swal_json["content"] .= '簽核失敗';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e or no parm)'
                    ];
                }
            break;
            // 241223 取得審核文件
            case 'load_doc':                   // 帶入查詢條件
                $pdo = pdo();
                $sql = "SELECT *, age as year_key, sub_scope as emp_sub_scope FROM `_document`";

                $parm = isset($parm) ? json_decode($parm, true) : [];
                $_year = $parm['_year'] ?? date('Y');
                
                // 初始查詢陣列
                    $conditions = [];
                    $stmt_arr   = [];    

                if (!empty($_year)) {
                    $conditions[] = "age = ?";
                    $stmt_arr[]   = $_year;
                    // $stmt_arr[] = $parm;
                    // $stmt_arr[] = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                }
                
                if (!empty($conditions)) {
                    $sql .= ' WHERE ' . implode(' AND ', $conditions);
                }
                // 後段-堆疊查詢語法：加入排序
                // $sql .= " ORDER BY s.dept_no ASC, s.emp_id ASC ";

                $stmt = $pdo->prepare($sql);
                try {
                    if(!empty($stmt_arr)){
                        $stmt->execute($stmt_arr);                          //處理 byYear
                    }else{
                        $stmt->execute();                                   //處理 byAll
                    }
                    $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    $doc_deptNos_arr = [];
                    foreach($docs as $deptNo_i){
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["OSTEXT"]      = $deptNo_i["emp_dept"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["check_list"]  = json_decode($deptNo_i["check_list"], true);
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["idty"]        = $deptNo_i["idty"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["uuid"]        = $deptNo_i["uuid"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["omager"]      = $deptNo_i["omager"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["in_sign"]     = $deptNo_i["in_sign"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["in_signName"] = $deptNo_i["in_signName"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["flow"]        = $deptNo_i["flow"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["flow_remark"] = json_decode($deptNo_i["flow_remark"], true);
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["_content"]    = json_decode($deptNo_i["_content"], true);
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["logs"]        = json_decode($deptNo_i["logs"], true);
                    }

                    // 製作返回文件
                    $result = [
                        'result_obj' => $doc_deptNos_arr,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];

                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }

            break;
            case 'reviewStep':
                require_once("../staff/load_function.php");
                $step_arr = reviewStep();                         // 取得reviewStep
                if ($step_arr) {
                    // 製作返回文件
                    $result = [
                        'result_obj' => $step_arr,
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
