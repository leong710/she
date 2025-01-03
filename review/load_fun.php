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
                    $sql = "SELECT '{$year}' AS year_key, emp_id, cname, shCase_logs, _content
                            FROM _staff
                            WHERE JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.dept_no'))) IN ('{$deptNo}')
                              AND JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.emp_sub_scope'))) IN ('{$emp_sub_scope}')
                            ";
                    // 後段-堆疊查詢語法：加入排序
                    $sql .= " ORDER BY emp_id ASC ";
                    $stmt = $pdo->prepare($sql);
                    try {
                        $stmt->execute();
                        $shStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        foreach($shStaffs as $index => $shStaff){
                            $shStaffs[$index]['shCase_logs'] = json_decode($shStaffs[$index]['shCase_logs'], true);
                            $shStaffs[$index]['shCase']      = $shStaffs[$index]['shCase_logs'][$year]['shCase'];
                            $shStaffs[$index]['shCondition'] = $shStaffs[$index]['shCase_logs'][$year]['shCondition'];
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
                $staff_inf    = $parm_array['staff_inf']   ?? [];
                $current_year = $parm_array['currentYear'] ?? date('Y');

                foreach ($staff_inf as $parm_i) {
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
                            "cstext"        => $cstext        ?? ( $row_shCase_logs[$current_year]["cstext"]        ?? null ),
                            "dept_no"       => $dept_no       ?? ( $row_shCase_logs[$current_year]["dept_no"]       ?? null ),
                            "eh_time"       => $eh_time       ?? ( $row_shCase_logs[$current_year]["eh_time"]       ?? null ),    // 暴露時數
                            "emp_dept"      => $emp_dept      ?? ( $row_shCase_logs[$current_year]["emp_dept"]      ?? null ),
                            "emp_group"     => $emp_group     ?? ( $row_shCase_logs[$current_year]["emp_group"]     ?? null ),
                            "emp_sub_scope" => $emp_sub_scope ?? ( $row_shCase_logs[$current_year]["emp_sub_scope"] ?? null ),
                            "schkztxt"      => $schkztxt      ?? ( $row_shCase_logs[$current_year]["schkztxt"]      ?? null ),
                            "shCase"        => $shCase        ?? ( $row_shCase_logs[$current_year]["shCase"]        ?? null ),    // 特作區域
                            "shCondition"   => $shCondition   ?? ( $row_shCase_logs[$current_year]["shCondition"]   ?? null ),    // 特作驗證
                            "HIRED"         => $HIRED         ?? ( $row_shCase_logs[$current_year]["HIRED"]         ?? null ),    // 到職日
                            "gesch"         => $gesch         ?? ( $row_shCase_logs[$current_year]["gesch"]         ?? null ),    // 性別
                            "natiotxt"      => $natiotxt      ?? ( $row_shCase_logs[$current_year]["natiotxt"]      ?? null )     // 國籍
                        ];
                    // //  241021 針對 
                        //     if(!empty($row_shCase_logs[$current_year]["shCase"])){
                        //         if(!empty($shCase)){
                        //             $get_shCase = (array) $row_shCase_logs[$current_year]["shCase"];
                        //             array_push($get_shCase, $shCase);
                        //             // array_push($row_shCase_logs[$current_year]["shCase"], $shCase);
                        //             $row_shCase_logs[$current_year]["shCase"] = $get_shCase;
                        //         }
                        //     }else{
                        //         $row_shCase_logs[$current_year]["shCase"] = $shCase;
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
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["id"]          = $deptNo_i["id"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["uuid"]        = $deptNo_i["uuid"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["OSTEXT"]      = $deptNo_i["emp_dept"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["check_list"]  = json_decode($deptNo_i["check_list"], true);
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["idty"]        = $deptNo_i["idty"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["omager"]      = $deptNo_i["omager"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["in_sign"]     = $deptNo_i["in_sign"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["in_signName"] = $deptNo_i["in_signName"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["flow"]        = $deptNo_i["flow"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["flow_remark"] = json_decode($deptNo_i["flow_remark"], true);
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["_content"]    = $deptNo_i["_content"];
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
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["_content"]    = $deptNo_i["_content"];
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
