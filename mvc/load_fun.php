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
                sendErrorResponse("Database error");
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
                $sql = "SELECT _S.emp_sub_scope, _S.dept_no, _S.emp_dept, _S.emp_id, _S.cname, _S.cstext, _S.gesch, _S.emp_group, _S.natiotxt, _S.schkztxt, _S.omager, _S.updated_at, _E.HIRED, _E.BTRTL
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

            case 'load_dept':                   // 由hrdb撈取HCM_VW_DEPT08部門資料，帶入查詢條件OSHORT
                $pdo = pdo_hrdb();
                $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                $sql = "SELECT _D.OSHORT, _D.OSTEXT, _D.OFTEXT, _D.OMAGER, _S.cname, _S.[user], _S.comid2
                        FROM HCM_VW_DEPT08 _D 
                        LEFT JOIN STAFF _S ON _D.OMAGER = _S.emp_id
                        WHERE _D.OSHORT IN ({$parm_re}) ";
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();                                   //處理 byAll
                    $load_depts = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    // 製作返回文件
                    $result = [
                        'result_obj' => $load_depts,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;

            case 'load_shLocal':                // _shLocal撈取唯一清單，帶入查詢條件OSHORT
                $pdo = pdo();
                $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                $sql = "SELECT _S.id, _S.OSTEXT_30, _S.OSHORT, _S.OSTEXT, _S.HE_CATE, _S.AVG_VOL, _S.AVG_8HR, _S.MONIT_NO, _S.MONIT_LOCAL, _S.WORK_DESC
                        FROM `_shlocal` _S
                        WHERE _S.flag = 'On' AND _S.OSHORT IN ({$parm_re}) ";
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

            case 'load_sample':                 // 帶入查詢條件
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
                $parm = str_replace('"', '', $parm);
                // 分拆參數
                $year           = explode(',', $parm)[0];
                $emp_sub_scope  = explode(',', $parm)[1];
                $deptNo         = explode(',', $parm)[2];
                // 241025--owner想把特作內的部門代號都掏出來...由各自的窗口進行維護... // 241104 UNION ALL之後的項目暫時不需要給先前單位撈取了，故於以暫停
                $sql = "SELECT '{$year}' AS year_key, _s.emp_id, _s.cname, _s.gesch, _s.natiotxt, _s.HIRED, _s._logs, _s._content, _c._changeLogs
                        FROM _staff _s
                        LEFT JOIN _change _c ON _s.emp_id = _c.emp_id
                        WHERE JSON_UNQUOTE(JSON_EXTRACT(_s._logs, CONCAT('$.{$year}.dept_no'))) IN ('{$deptNo}')
                          AND JSON_UNQUOTE(JSON_EXTRACT(_s._logs, CONCAT('$.{$year}.emp_sub_scope'))) IN ('{$emp_sub_scope}')
                        ";
                // 後段-堆疊查詢語法：加入排序
                $sql .= " ORDER BY emp_id ASC ";
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();
                    $shStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach($shStaffs as $index => $shStaff){
                        $shStaffs[$index]['_logs']       = json_decode($shStaffs[$index]['_logs'], true);
                        $shStaffs[$index]['shCase']      = $shStaffs[$index]['_logs'][$year]['shCase'];
                        $shStaffs[$index]['shCondition'] = $shStaffs[$index]['_logs'][$year]['shCondition'];
                        $shStaffs[$index]['_content']    = json_decode($shStaffs[$index]['_content']);
                        $shStaffs[$index]['_changeLogs'] = json_decode($shStaffs[$index]['_changeLogs'], true);     // 來自left join _change
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

            case 'load_staff_byCheckList':      // 主要參考_doc中的checkList名單，不會亂抓!
                $pdo = pdo();
                $parm = str_replace(['[', ']', '"'], '', $parm);
                // 分拆參數
                $year          = explode(',', $parm)[0];
                $deptNo        = explode(',', $parm)[1];
                $emp_sub_scope = explode(',', $parm)[2];
                $checkList     = explode(',', $parm)[3];
                    $checkList = str_replace(';', ',', $checkList);
                // 241025--owner想把特作內的部門代號都掏出來...由各自的窗口進行維護... // 241104 UNION ALL之後的項目暫時不需要給先前單位撈取了，故於以暫停
                $sql = "SELECT '{$year}' AS year_key, emp_id, cname, gesch, natiotxt, HIRED, _logs, _content
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
                        $shStaffs[$index]['_logs']       = json_decode($shStaffs[$index]['_logs'], true);
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
                break;

            case 'bat_storeStaff':              // 
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
                                _logs            = VALUES(_logs),
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
                    $row_logs       = isset($row_data['_logs'])     ? json_decode($row_data['_logs']    , true) : [];
                    $row_content    = isset($row_data['_content'])  ? json_decode($row_data['_content'] , true) : [];
                    // step.3b 更新或新增該年份的資料
                    $row_logs[$current_year] = [
                        "cstext"        => $cstext        ?? ( $row_logs[$current_year]["cstext"]        ?? null ),     // 職稱
                        "dept_no"       => $dept_no       ?? ( $row_logs[$current_year]["dept_no"]       ?? null ),     // 部門代號
                        "eh_time"       => $eh_time       ?? ( $row_logs[$current_year]["eh_time"]       ?? null ),    // 暴露時數
                        "emp_dept"      => $emp_dept      ?? ( $row_logs[$current_year]["emp_dept"]      ?? null ),     // 部門名稱
                        "emp_group"     => $emp_group     ?? ( $row_logs[$current_year]["emp_group"]     ?? null ),     // 
                        "emp_sub_scope" => $emp_sub_scope ?? ( $row_logs[$current_year]["emp_sub_scope"] ?? null ),     // 棟別名稱
                        "schkztxt"      => $schkztxt      ?? ( $row_logs[$current_year]["schkztxt"]      ?? null ),     // 工作時程表規則名稱
                        "shCase"        => $shCase        ?? ( $row_logs[$current_year]["shCase"]        ?? null ),    // 特作區域
                        "shCondition"   => $shCondition   ?? ( $row_logs[$current_year]["shCondition"]   ?? null ),    // 特作驗證
                        "BTRTL"         => $BTRTL         ?? ( $row_logs[$current_year]["BTRTL"]         ?? null ),    // 人事子範圍-建物代碼
                        "omager"        => $omager        ?? ( $row_logs[$current_year]["omager"]        ?? null ),    // 所屬主管
                        // "gesch"         => $gesch         ?? ( $row_logs[$current_year]["gesch"]         ?? null ),    // 性別
                        // "natiotxt"      => $natiotxt      ?? ( $row_logs[$current_year]["natiotxt"]      ?? null ),    // 國籍
                        // "HIRED"         => $HIRED         ?? ( $row_logs[$current_year]["HIRED"]         ?? null ),    // 到職日
                    ];
                    // 檢查並串接新的 _content
                    if (isset($_content[$current_year])) {
                        // 確保 $row_content[$current_year] 是陣列的存在
                        $row_content[$current_year] = $row_content[$current_year] ?? [];                        
                        $new_content = $_content[$current_year];
                        // 更新現有的內容，將其刪除
                        $row_content[$current_year] = array_merge($row_content[$current_year], $_content[$current_year]); // 合併新的項目
                    }
                    // step.4 將更新後的資料編碼為 JSON 字串
                    $_logs_str      = json_encode($row_logs,    JSON_UNESCAPED_UNICODE);
                    $_content_str   = json_encode($row_content, JSON_UNESCAPED_UNICODE);
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
            // 250415 批次刪除員工資料
            case 'bat_deleteStaff':              // 
                $pdo = pdo();
                $swal_json = array(                                 // for swal_json
                    "fun"       => "bat_deleteStaff",
                    "content"   => "批次刪除名單--"
                );
                $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                $sql = "DELETE FROM _staff
                        WHERE emp_id IN ({$parm_re}) ";
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();                                   //處理 byAll
                      // 製作返回文件
                      $swal_json["action"] = "success";
                      $swal_json["content"] .= '刪除成功';
                      $result = [
                          'result_obj' => $swal_json,
                          'fun'        => $fun,
                          'success'    => 'Load '.$fun.' success.'
                      ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $swal_json["action"] = "error";
                    $swal_json["content"] .= '刪除失敗';
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
                $heCateFile = "../sh_local/he_cate.json";                                     // 預設sw.json檔案位置
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
                    $swal_json["action"]   = "error";
                    $swal_json["content"] .= '儲存失敗';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e or no parm)'
                    ];
                }
                break;

            case 'load_heCate':                 // for 提取危害類別
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
            // 241223 取得審核文件年度清單
            case 'load_doc_deptNos':            // 帶入查詢條件
                $pdo = pdo();
                $sql = "SELECT *, age as year_key, sub_scope as emp_sub_scope FROM `_document`";
                $parm = isset($parm) ? json_decode($parm, true) : [];
                $_year = $parm['_year'] ?? date('Y');
                // 初始查詢陣列
                    $conditions = [];
                    $stmt_arr   = [];    
                    $conditions[] = "idty in (4, 5, 6, 10)";
                if (!empty($_year)) {
                    $conditions[] = "age = ?";
                    $stmt_arr[]   = $_year;
                    // $stmt_arr[] = $parm;
                    // $stmt_arr[] = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                }
                if (!empty($conditions)) {
                    $sql .= ' WHERE ' . implode(' AND ', $conditions);
                }
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
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;

            case 'update_workTarget':
                $swal_json = array(                                 // for swal_json
                    "fun"       => "update_workTarget",
                    "content"   => "更新作業年度--"
                );
                $workTargetFile = "../staff/workTarget.json";                                     // 預設sw.json檔案位置
                $workTarget_json = isset($_REQUEST['parm']) ? $_REQUEST['parm'] : null;
                if(!empty($workTarget_json)){
                    $fop = fopen($workTargetFile,"w");  //開啟檔案
                    fputs($fop, $workTarget_json);      //初始化sw+寫入
                    fclose($fop);                       //關閉檔案
                    // 製作返回文件
                    $swal_json["action"]   = "success";
                    $swal_json["content"] .= '儲存成功';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                }else{
                    $swal_json["action"]   = "error";
                    $swal_json["content"] .= '儲存失敗';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e or no parm)'
                    ];
                }
                break;
            
            case 'load_staff_dept_nos':         // 取得已存檔的員工部門代號...for 定期特殊健檢使用
                $pdo = pdo();
                $parm = isset($parm) ? json_decode($parm, true) : [];
                $year = $parm['_year'] ?? date('Y');
                $sql = "SELECT year_key, emp_sub_scope, BTRTL, dept_no, emp_dept, omager, COUNT(*) AS _count,
                            SUM( CASE 
                                    WHEN JSON_EXTRACT(_logs, '$.{$year}.shCase') IS NOT NULL 
                                        AND JSON_TYPE(JSON_EXTRACT(_logs, '$.{$year}.shCase')) = 'ARRAY' 
                                        AND JSON_LENGTH(JSON_EXTRACT(_logs, '$.{$year}.shCase')) > 0 
                                    THEN 1 ELSE 0 
                                END
                            ) AS shCaseNotNull,
                            ROUND( SUM( CASE 
                                            WHEN JSON_EXTRACT(_logs, '$.{$year}.shCase') IS NOT NULL 
                                                AND JSON_TYPE(JSON_EXTRACT(_logs, '$.{$year}.shCase')) = 'ARRAY' 
                                                AND JSON_LENGTH(JSON_EXTRACT(_logs, '$.{$year}.shCase')) > 0 
                                            THEN 1 ELSE 0 
                                        END
                            ) * 100 / COUNT(*), 0 ) AS shCaseNotNull_pc
                        FROM (
                            SELECT '{$year}' AS year_key,
                                JSON_UNQUOTE(JSON_EXTRACT(_logs, '$.{$year}.dept_no')) AS dept_no,
                                JSON_UNQUOTE(JSON_EXTRACT(_logs, '$.{$year}.emp_sub_scope')) AS emp_sub_scope,
                                JSON_UNQUOTE(JSON_EXTRACT(_logs, '$.{$year}.emp_dept')) AS emp_dept,
                                JSON_UNQUOTE(JSON_EXTRACT(_logs, '$.{$year}.BTRTL')) AS BTRTL,
                                JSON_UNQUOTE(JSON_EXTRACT(_logs, '$.{$year}.omager')) AS omager,
                                _logs
                            FROM _staff
                            WHERE JSON_EXTRACT(_logs, '$.{$year}.dept_no') IS NOT NULL
                        ) AS expanded_shCase
                        GROUP BY year_key, emp_sub_scope, dept_no, emp_dept ";
                $stmt = $pdo->prepare($sql);                                // 讀取全部=不分頁
                try {
                    $stmt->execute();
                    $staff_deptNos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $staff_deptNos_arr = [];
                    $staff_deptNos_obj = [];
                    foreach($staff_deptNos as $deptNo_i){
                        $staff_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["OSTEXT"]           = $deptNo_i["emp_dept"];
                        $staff_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["BTRTL"]            = $deptNo_i["BTRTL"];
                        $staff_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["_count"]           = $deptNo_i["_count"];
                        $staff_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["omager"]           = $deptNo_i["omager"];
                        $staff_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["shCaseNotNull"]    = $deptNo_i["shCaseNotNull"];
                        $staff_deptNos_obj[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["shCaseNotNull_pc"] = $deptNo_i["shCaseNotNull_pc"];
                    }
                    foreach($staff_deptNos_obj as $key => $value){
                        $i = [];
                        $i[$key] = $value;
                        array_push($staff_deptNos_arr, $i);
                    }
                    // 製作返回文件
                    $result = [
                        'result_obj' => $staff_deptNos_arr,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;
            // 241211 提出--送嬸
            case 'storeForReview':  
                require_once("../user_info.php");
                require_once("../mvc/load_function.php");
                $pdo = pdo();
                $swal_json = [
                    "fun" => "storeForReview",
                    "content" => "批次送審名單--"
                ];
                define('SQL_SELECT_FAB', "SELECT _f.pm_emp_id AS pm_empId, _f.osha_id FROM `_fab` _f WHERE _f.BTRTL = ? AND _f.fab_title LIKE ? "); // 找出廠區護理師窗口
                define('SQL_SELECT_PM', "SELECT GROUP_CONCAT(CONCAT(_u.emp_id, ',', _u.cname) SEPARATOR ',') AS pm_empId FROM _users _u WHERE _u.role = 1 AND _u.emp_id < 90000000 LIMIT 3;");  // 找出大PM
                define('SQL_SELECT_DOC', "SELECT * FROM `_document` WHERE age = ? AND dept_no = ? AND sub_scope = ? AND BTRTL = ? ");
                define('SQL_INSERT_DOC', "INSERT INTO _document (uuid, age, dept_no, emp_dept, sub_scope, BTRTL, omager, check_list, in_sign, in_signName, idty, flow, flow_remark, _content, created_emp_id, created_cname, updated_cname, logs, created_at, updated_at) VALUES ");
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
                $staff_inf           = $parm_array['staff_inf']   ?? [];
                $age = $current_year = $parm_array['currentYear'] ?? date('Y');
                $new_check_list_in  = [];
                $new_check_list_out = [];
                $new_form           = [];
                // 簽核步驟
                $reviewStep_arr = reviewStep();                         // 取得reviewStep
                $action         = $action ?? "3";                       // 3 = 送出
                // 簽核欄位數據整理：by $action
                $action_arr     = $reviewStep_arr['action'];            // getAction arr
                    $status     = $action_arr[$action] ?? "99";         // 錯誤 (Error)
                // 250214 取出staff_inf內的主管
                $omager         = ''; // 用來儲存找到的值
                foreach ($staff_inf as $parm_i) {
                    $parm_i_arr = (array) $parm_i; 
                    $dept_no   = $parm_i_arr['_logs'][$current_year]["dept_no"] ?? "";
                    $emp_dept  = $parm_i_arr['_logs'][$current_year]["emp_dept"] ?? "";
                    $sub_scope = $parm_i_arr['_logs'][$current_year]["emp_sub_scope"] ?? "";
                    $BTRTL     = $parm_i_arr['_logs'][$current_year]["BTRTL"] ?? "";
                    $omager    = empty($omager) ? $parm_i_arr['_logs'][$current_year]["omager"] : $omager; // 250214 取出staff_inf內的主管 -- 取得值
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
                        $stmt_select = $pdo->prepare(SQL_SELECT_DOC);   // 預先動作：找是否已經有送件
                        if (executeQuery($stmt_select, [$age, $new_check_deptNo, $sub_scope, $BTRTL])) {
                            $row_data = $stmt_select->fetch(PDO::FETCH_ASSOC);
                            // 如果資料存在則更新
                            if ($row_data) {
                                $row_check_list = json_decode($row_data["check_list"], true) ?? [];
                                // 使用 array_merge() 將兩個陣列合併。 使用 array_unique() 去除重複值。
                                $new_form[$new_check_deptNo]["check_list"] = array_unique(array_merge($new_check_valueArr, $row_check_list)); 
                                $rowStep = $row_data["idty"] ?? "4";        // $rowStep = 目前的進度 = idty
                            } 
                            // 若不存在，可以考慮直接進行插入
                            else {
                                $new_form[$new_check_deptNo]["check_list"] = $new_check_valueArr;
                                $rowStep = "3";
                            }
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
                        // 製作log紀錄前處理：塞進去製作元素
                        $logs_request = array (
                            "step"   => $rowStep_arr['approvalStep'] ?? '名單送審',                  // 節點
                            "cname"  => $auth_cname." (".$auth_emp_id.")",
                            "action" => $status ?? "送出 (Submit)",
                            "logs"   => $row_data["logs"] ?? "",
                            "remark" => $parm_array["sign_comm"] ?? ""
                        ); 
                        // 呼叫toLog製作log檔
                            $logs_enc = toLog($logs_request);
                        switch ($action) {
                            case "0":       // 作廢
                                $idty = "0";
                                break;
                            case "1":       // 編輯
                            case "2":       // 暫存
                                $idty = "2";
                                break;
                            case "3":       // 送出
                                if($auth_emp_id === $omager){
                                    $rowStep = "7";                                     // 自動--簽核審查
                                    $rowStep_arr = $reviewStep_arr['step'][$rowStep];   // getStep arr 取得目前狀態節點
                                    $status     = $action_arr[$rowStep] ?? "99";        // 7:自動同意 / 99:錯誤 (Error)
                                    // 製作log紀錄前處理：塞進去製作元素
                                    $logs_request = array (
                                        "step"   => $rowStep_arr['approvalStep'] ?? '名單送審',     // 節點
                                        "cname"  => $auth_cname." (".$auth_emp_id.")",
                                        "action" => $status ?? "送出 (Submit)",
                                        "logs"   => $logs_enc ?? "",
                                        "remark" => ""
                                    ); 
                                    // 呼叫toLog製作log檔
                                        $logs_enc = toLog($logs_request);
                                    $idty = "5";
                                }else{
                                    $idty = "4";
                                }
                                break;  

                            case "5":       // 轉呈
                                $idty = "4";
                                break;  
                            case "4":       // 退回
                                $idty = $rowStep_arr['returnTo'];
                                break;
                            case "6":       // 同意
                            case "10":      // 結案
                                $idty = $rowStep_arr['approveTo'];
                                break;
                            default:
                                $idty = 4;  // 4 = 各站點審核 ** 在staff模組中只需要強制給step4
                        }
                        // 簽核欄位數據整理：by $idty = 下一步狀態
                        $nextStep_arr = $reviewStep_arr['step'][$idty];   // getStep arr 取得下一步狀態節點
                        $flow        = $nextStep_arr['approvalStep'] ?? "簽核審查";
                        $flow_remark = [
                            "group"  => $nextStep_arr['group']  ?? "上層主管,單位窗口,護理師",  
                            "remark" => $nextStep_arr['remark'] ?? "簽核主管可維調暴露時數"
                        ];
                        $result = queryHrdb("showSignCode", $new_check_deptNo);                                     // 查詢signCode部門主管
                        $new_form[$new_check_deptNo]["omager"] = $result["OMAGER"] ?? ($row_data["omager"] ?? $omager);
                        // 250214 取出staff_inf內的主管 -- 取得值
                        $showStaffOmager = [];
                        if(empty($result["OMAGER"]) || !isset($result["OMAGER"])){
                            $showStaffOmager = queryHrdb("showStaff", $omager);                                     // 查詢員工資訊for部門消滅
                        }
                        if($action == 3 && $idty == 5){     // *** 這裡是 3名單送審人===4簽核審查人 then 自動跳下一階
                            $stmt_select_fab = $pdo->prepare(SQL_SELECT_FAB);   // 送審人==簽核人=自動轉下一關
                            $like_sub_scope = "%".$sub_scope."%";
                            if (executeQuery($stmt_select_fab, [$BTRTL , $like_sub_scope])) {
                                $row_fab = $stmt_select_fab->fetch(PDO::FETCH_ASSOC);
                                
                                if (!empty($row_fab)) {         // 如果資料存在則帶入更新
                                    $pm_empId_arr = explode(",", $row_fab["pm_empId"]);                     // 資料表是字串，要炸成陣列

                                } else {                        // 若不存在，改直接帶入大PM
                                    $stmt_select_pm = $pdo->prepare(SQL_SELECT_PM);   
                                    if (executeQuery($stmt_select_pm, '')) {
                                        $row_pm = $stmt_select_pm->fetch(PDO::FETCH_ASSOC);
                                    
                                    }else{
                                        $row_pm = array ( "pm_empId" => "" );
                                    }
                                    $pm_empId_arr = explode(",", $row_pm["pm_empId"]);                      // 資料表是字串，要炸成陣列
                                } 

                                $in_sign      = $pm_empId_arr[0] ?? NULL;                                   // 5-> 窗口護理師 || 大PM
                                $in_signName  = $pm_empId_arr[1] ?? NULL;                                   // 5-> 窗口護理師 || 大PM
                            }
                            $DEPUTY = queryHrdb("showDelegation", $in_sign);                                // 查詢---自動簽核的下一階 簽核代理人
                            
                        } else {
                            $in_sign     = $result["OMAGER"] ?? ( $showStaffOmager["emp_id"] ?? "");        // 5-> 帶入部門主管
                            $in_signName = $result["cname"]  ?? ( $showStaffOmager["cname"]  ?? "");        // 5-> 帶入部門主管
                            $DEPUTY = queryHrdb("showDelegation", $new_form[$new_check_deptNo]["omager"]);  // 查詢---部門主管 簽核代理人
                        }
                        if(isset($DEPUTY["SINGFLAG"])){
                            $in_sign     = ($DEPUTY["DEPUTYEMPID"] && $DEPUTY["SINGFLAG"] === 'Y') ? $DEPUTY["DEPUTYEMPID"] : $in_sign;     // Y=啟動代理簽核
                            $in_signName = ($DEPUTY["DEPUTYCNAME"] && $DEPUTY["SINGFLAG"] === 'Y') ? $DEPUTY["DEPUTYCNAME"] : $in_signName; // Y=啟動代理簽核
                        }
                        // 防呆，使用預設值
                        $uuid        = $age.",".$new_check_deptNo.",".$sub_scope;
                        $_content    = $_content    ?? [];  
                        // 重點打包
                        $flow_remark_str = json_encode($flow_remark, JSON_UNESCAPED_UNICODE);
                        $check_list_str  = json_encode($new_form[$new_check_deptNo]["check_list"], JSON_UNESCAPED_UNICODE);
                        $_content_str    = json_encode($_content, JSON_UNESCAPED_UNICODE);
                        // 準備 SQL 和參數
                        $values[] = "(?, ?, ?, ?, ?, ?, ?,   ?, ?, ?, ?, ?, ?, ?,   ?, ?, ?, ?,   now(), now())";
                        $params = array_merge($params, [
                            $uuid,           $age,        $new_check_deptNo, $emp_dept, $sub_scope, $BTRTL,           $new_form[$new_check_deptNo]["omager"],
                            $check_list_str, $in_sign,    $in_signName,      $idty,     $flow,      $flow_remark_str, $_content_str,
                            $auth_emp_id,    $auth_cname, $auth_cname,       $logs_enc
                        ]);
                    }
                }
                if (empty($new_check_deptNo) || empty($sub_scope) || (count($new_form[$new_check_deptNo]["check_list"]) == 0 ) || empty($in_sign) ) {
                    $swal_json["action"] = "error";
                    $swal_json["content"] .= '送審失敗...表單內容有誤';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e or no parm)',
                        'check'      => count($new_form[$new_check_deptNo]["check_list"]),
                        'omager'     => $omager,
                        'showStaffOmager' => $showStaffOmager
                    ];

                } else {
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
                }
                break;
            // 241211 送嬸--簽核
            case 'processReview':  
                require_once("../user_info.php");
                require_once("../mvc/load_function.php");
                $pdo = pdo();
                $swal_json = [
                    "fun" => "processReview",
                    "content" => "批次送審名單--"
                ];
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
                            ;
                    case "1":       // 編輯
                    case "2":       // 暫存
                        $idty = "2";
                        break;
                    case "3":       // 送出
                        $idty = "4";
                        break;
                    case "5":       // 轉呈
                        $idty = "4";
                        $status .= " => {$forwarded["in_signName"]} ({$forwarded["in_sign"]})";
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
                    $in_sign     = $in_sign     ?? (($DEPUTY["DEPUTYEMPID"] && $DEPUTY["SINGFLAG"] === 'Y') ? $DEPUTY["DEPUTYEMPID"] : $result["OMAGER"] ?? "");  
                    $in_signName = $in_signName ?? (($DEPUTY["DEPUTYCNAME"] && $DEPUTY["SINGFLAG"] === 'Y') ? $DEPUTY["DEPUTYCNAME"] : $result["cname"]  ?? "");  
                // } else if($action === "5"){
                //     $in_sign     = $forwarded["in_sign"]     ?? ($row_data["in_sign"]     ?? "");  
                //     $in_signName = $forwarded["in_signName"] ?? ($row_data["in_signName"] ?? "");  

                } else {
                    if($idty === "4" && $row_data["idty"] === "5"){     // 從idty5(收單review)退到idty4(簽核審查)...要把簽核主管找回來
                        $result = queryHrdb("showSignCode",   $deptNo);                        // 查詢signCode部門主管
                        $DEPUTY = queryHrdb("showDelegation", $result["OMAGER"]);              // 查詢部門主管簽核代理人
                        $in_sign     = $in_sign     ?? ($DEPUTY["DEPUTYEMPID"] ?? $result["OMAGER"]);  
                        $in_signName = $in_signName ?? ($DEPUTY["DEPUTYCNAME"] ?? $result["cname"]);  

                    }else if($idty === "5"){
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
            // 241212 取得_document送審清單
            case 'load_document':
                $pdo = pdo();
                $parm = isset($parm) ? json_decode($parm, true) : [];
                $year = $parm['_year'] ?? date('Y');
                $sql = "SELECT id, uuid, age as year_key, sub_scope as emp_sub_scope, dept_no, emp_dept, BTRTL, check_list, idty FROM `_document` WHERE age = '{$year}' ";
                $stmt = $pdo->prepare($sql);
                if (executeQuery($stmt, '')) {
                    $_documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    // JSON解碼
                    foreach($_documents as $index => $_doc){
                        $_documents[$index]['check_list'] = json_decode($_documents[$index]['check_list'], true);
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
            // 241223 取得審核文件
            case 'load_doc':                    // 帶入查詢條件
                $pdo = pdo();
                $sql = "SELECT *, age as year_key, sub_scope as emp_sub_scope FROM `_document`";
                // 初始查詢陣列
                    $conditions = [];
                    $stmt_arr   = [];    
                $parm = isset($parm) ? json_decode($parm, true) : [];
                $_year = $parm['_year'] ?? null;
                if (!empty($_year)) {
                    $conditions[] = "age = ?";
                    $stmt_arr[]   = $_year;
                }
                $uuid = $parm['uuid'] ?? null;
                if (!empty($uuid)) {
                    $conditions[] = "uuid = ?";
                    $stmt_arr[]   = $uuid;
                }
                if (!empty($conditions)) {
                    $sql .= ' WHERE ' . implode(' AND ', $conditions);
                }
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
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["BTRTL"]       = $deptNo_i["BTRTL"];
                        $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["idty"]        = $deptNo_i["idty"];
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
                require_once("../mvc/load_function.php");
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

            case 'changeStep':
                require_once("../mvc/load_function.php");
                $step_arr = changeStep();                         // changeStep
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

            case 'loadFabs':                    // 由hrdb撈取人員資料，帶入查詢條件OSHORT
                $pdo = pdo();
                $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                $sql = "SELECT id, site_id, fab_title, fab_remark, BTRTL, osha_id, flag, sign_code, pm_emp_id
                        FROM _fab ";
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();                                   //處理 byAll
                    $_fabs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    // 製作返回文件
                    $result = [
                        'result_obj' => $_fabs,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;

            // _change使用
            case 'load_shLocal_OSHORTs':        // 250217 取得特作列管的部門代號 for index p1
                $pdo = pdo();
                $sql = "SELECT  _sl.OSTEXT_30, _sl.OSTEXT, _sl.OSHORT, _sl.flag
                        FROM `_shlocaldept` _sl
                        -- WHERE _sl.flag = true OR _sh.flag IS NULL  -- 確保右表的記錄也能被選到
                        GROUP BY _sl.OSHORT
                        ORDER BY OSTEXT_30, OSHORT
                         ";
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();
                    $shLocal_OSHORTs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $shLocal_OSHORTs_arr = [];
                    $shLocal_OSHORTs_obj = [];
                    foreach($shLocal_OSHORTs as $OSHORT_i){
                        $shLocal_OSHORTs_obj[$OSHORT_i["OSTEXT_30"]][$OSHORT_i["OSHORT"]]["OSTEXT"] = $OSHORT_i["OSTEXT"];
                        $shLocal_OSHORTs_obj[$OSHORT_i["OSTEXT_30"]][$OSHORT_i["OSHORT"]]["flag"]   = $OSHORT_i["flag"];
                    }
                    foreach($shLocal_OSHORTs_obj as $key => $value){
                        $i = [];
                        $i[$key] = $value;
                        array_push($shLocal_OSHORTs_arr, $i);
                    }
                    // 製作返回文件
                    $result = [
                        'result_obj' => $shLocal_OSHORTs_arr,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.',
                        'debug'      => $shLocal_OSHORTs
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;

            case 'load_shLocalDepts':           // 250217 取得in[範圍內]特作部門內容
                $pdo = pdo();
                $sql = "SELECT _shd.* 
                        FROM `_shlocaldept` _shd
                    ";
                if(!empty($parm)){
                    $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                    $sql .= " WHERE _shd.OSHORT IN ({$parm_re})";
                }
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();
                    $shLocalDepts = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    // JSON解碼  true = 還原成陣列
                    foreach($shLocalDepts as $index => $shLocalDept){
                        $shLocalDepts[$index]['base']   = json_decode($shLocalDept['base']);
                        $shLocalDepts[$index]['inCare'] = json_decode($shLocalDept['inCare']);
                        $shLocalDepts[$index]['remark'] = json_decode($shLocalDept['remark']);
                    }
                    // 製作返回文件
                    $result = [
                        'result_obj' => $shLocalDepts,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.',
                    ];
                    
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;

            case 'bat_storeDept':               // 批次儲存部門變更作業P2
                require_once("../user_info.php");
                $pdo = pdo();
                $swal_json = array(                                 // for swal_json
                    "fun"       => "bat_storeDept",
                    "content"   => "批次儲存變更作業健檢名單--"
                );
                
                define('SQL_SELECT_DOC', "SELECT * FROM _shlocaldept WHERE OSHORT = ? ");
                define('SQL_INSERT_DOC', "INSERT INTO _shlocaldept ( OSTEXT_30, OSHORT, OSTEXT, base, inCare, remark, flag, updated_cname, updated_at, created_at ) VALUES ");
                // ON DUPLICATE KEY UPDATE：在插入操作導致唯一鍵或主鍵衝突時，執行更新操作。
                define('SQL_UPDATE_DOC', "ON DUPLICATE KEY UPDATE 
                                OSTEXT_30     = VALUES(OSTEXT_30),
                                OSTEXT        = VALUES(OSTEXT),
                                base          = VALUES(base),
                                inCare        = VALUES(inCare),
                                remark        = VALUES(remark),
                                flag          = VALUES(flag),
                                updated_cname = VALUES(updated_cname),
                                updated_at    = now()");
                $values = [];
                $params = [];
                $parm_array = parseJsonParams($parm); // 使用新的函數解析JSON

                // step.3a 檢查並維護現有資料中的 key
                $shLocalDept_inf = $parm_array['shLocalDept_inf'] ?? [];

                foreach ($shLocalDept_inf as $parm_i) {
                    $parm_i_arr = (array) $parm_i; // #2.這裡也要由物件轉成陣列
                    extract($parm_i_arr);

                    // step.1 提取現有資料
                    $stmt_select = $pdo->prepare(SQL_SELECT_DOC);
                    executeQuery($stmt_select, [$OSHORT]);
                    $row_data = $stmt_select->fetch(PDO::FETCH_ASSOC);

                    // 防呆
                    $OSTEXT_30 = $OSTEXT_30 ?? ( $row_data["OSTEXT_30"] ?? "");    // 廠區
                    $OSTEXT    = $OSTEXT    ?? ( $row_data["OSTEXT"]    ?? "");    // 部門名稱
                    $remark    = $remark    ?? ( $row_data["remark"]    ?? NULL);  // 備註說明
                    $flag      = $flag      ?? ( $row_data["flag"]      ?? true);  // 開關

                    // step.4 將更新後的資料編碼為 JSON 字串
                    $base_str   = json_encode($base,   JSON_UNESCAPED_UNICODE);
                    $inCare_str = json_encode($inCare, JSON_UNESCAPED_UNICODE);
                    $remark_str = json_encode($remark, JSON_UNESCAPED_UNICODE);

                    // step.5 準備 SQL 和參數
                    $values[] = "(?, ?, ?,   ?, ?, ?,   ?, ?,   now(), now())";
                    $params = array_merge($params, [
                        $OSTEXT_30, $OSHORT, $OSTEXT,
                        $base_str, $inCare_str, $remark_str,
                        $flag, $auth_cname
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

            case 'load_shLocal_Lists':          // 250217 取得所有特作部門代號清單
                $pdo = pdo();
                $sql = "SELECT _sh.OSTEXT_30, _sh.OSTEXT, _sh.OSHORT  
                        FROM `_shlocal` _sh
                        WHERE _sh.flag = 'On'
                        GROUP BY _sh.OSHORT";
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();
                    $shLocal_Lists = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    // 製作返回文件
                    $result = [
                        'result_obj' => $shLocal_Lists,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.',
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;

            case 'all_shLocalStaff':            // 250217 從危害地圖中，取得所有特作部門代號，並從hrdb中撈出所有符合部門待號的員工(base=未排除)
                $pdo = pdo();
                $sql = "SELECT DATE_FORMAT(now(),'%Y') AS yy, DATE_FORMAT(now(), '%m') AS mm , _sh.OSTEXT_30, _sh.OSTEXT, _sh.OSHORT, _st.emp_id 
                        FROM `_shlocal` _sh
                        LEFT JOIN `hrdb`.`staff` _st ON _st.dept_no = _sh.OSHORT
                        WHERE _sh.flag = 'On'
                        GROUP BY _sh.OSHORT, _st.emp_id;";
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();                                   //處理 byAll
                    $all_shLocalStaff = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    $allShLocalStaff_arr = [];                          // 預設起始空陣列
                    foreach($all_shLocalStaff as $Staff_i){             // 進行彙整
                        if(!isset($allShLocalStaff_arr[$Staff_i["OSHORT"]])){
                            $allShLocalStaff_arr[$Staff_i["OSHORT"]] = [];                                                          // 第一層：部門代號
                        }
                        if(!isset($allShLocalStaff_arr[$Staff_i["OSHORT"]][$Staff_i["yy"].$Staff_i["mm"]])){
                            $allShLocalStaff_arr[$Staff_i["OSHORT"]][$Staff_i["yy"].$Staff_i["mm"]] = [];                           // 第二層：年月
                        }
                        array_push($allShLocalStaff_arr[$Staff_i["OSHORT"]][$Staff_i["yy"].$Staff_i["mm"]], $Staff_i["emp_id"]);    // 帶進去emp_id
                    }
                    // 製作返回文件
                    $result = [
                        'result_obj' => $allShLocalStaff_arr,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.',
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;

            case 'load_deptStaff_formHrdb':     // 250218 從hrdb中撈出所有符合部門代號的員工(base=未排除)
                $pdo = pdo_hrdb();
                $sql = "SELECT u.* , _E.HIRED ,_E.BTRTL , REPLACE(u.emp_sub_scope, ' ', '') AS emp_sub_scope 
                        --, DATE_FORMAT(now(),'%Y') AS yy, DATE_FORMAT(now(), '%m') AS mm
                        FROM staff u
                        LEFT JOIN HCM_VW_EMP01_hiring _E ON u.emp_id = _E.PERNR
                        WHERE u.dept_no = ? 
                        ORDER BY u.emp_id DESC ";
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute([$parm]);                                   //處理 byAll
                    $load_deptStaff = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    // 製作返回文件
                    $result = [
                        'result_obj' => $load_deptStaff,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.',
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;

            case 'load_change':                 // 由hrdb撈取人員資料，帶入查詢條件OSHORT
                $pdo = pdo();
                $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                $sql = "SELECT _c.emp_id ,_c.cname ,_c._changeLogs ,_c._content ,_c._todo
                        FROM _change _c
                        -- LEFT JOIN _staff _s ON _c.emp_id = _s.emp_id
                        WHERE _c.emp_id IN ({$parm_re}) ";
                // 後段-堆疊查詢語法：加入排序
                $sql .= " ORDER BY _c.emp_id ASC ";
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();                                   //處理 byAll
                    $chStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    foreach($chStaffs as $index => $shStaff){
                        $chStaffs[$index]['_changeLogs'] = json_decode($chStaffs[$index]['_changeLogs'], true);
                        $chStaffs[$index]['_content']    = json_decode($chStaffs[$index]['_content']);
                        $chStaffs[$index]['_todo']       = json_decode($chStaffs[$index]['_todo'], true);
                    }
                    // 製作返回文件
                    $result = [
                        'result_obj' => $chStaffs,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.',
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;

            case 'bat_storeChangeStaff':        // 250310 變更作業健檢--儲存人員P3
                require_once("../user_info.php");
                $pdo = pdo();
                $swal_json = array(                                 // for swal_json
                    "fun"       => "bat_storeChangeStaff",
                    "content"   => "批次儲存名單--"
                );
                
                define('SQL_SELECT_DOC', "SELECT emp_id, cname, _changeLogs, _content, _todo, updated_at FROM _change WHERE emp_id = ? ");
                define('SQL_INSERT_DOC', "INSERT INTO _change ( emp_id, cname, _changeLogs, _content, _todo, created_cname, updated_cname,  created_at, updated_at ) VALUES ");
                // ON DUPLICATE KEY UPDATE：在插入操作導致唯一鍵或主鍵衝突時，執行更新操作。
                define('SQL_UPDATE_DOC', "ON DUPLICATE KEY UPDATE 
                                _changeLogs   = VALUES(_changeLogs),
                                _content      = VALUES(_content),
                                _todo         = VALUES(_todo),
                                updated_cname = VALUES(updated_cname),
                                updated_at    = now()");
                $values = [];
                $params = [];
                $parm_array = parseJsonParams($parm);   // 使用新的函數解析JSON
                // step.3a 檢查並維護現有資料中的 key
                $staff_inf   = $parm_array['staff_inf']   ?? [];
                // $targetMonth = $parm_array['targetMonth'] ?? date('Y');      // => 這裡沒有指定作業年月
                foreach ($staff_inf as $staff_i) {
                    $staff_i_arr = (array) $staff_i; // #2.這裡也要由物件轉成陣列
                    extract($staff_i_arr);
                    // step.2a 提取現有資料
                    $stmt_select = $pdo->prepare(SQL_SELECT_DOC);
                    executeQuery($stmt_select, [$emp_id]);
                    $row_data = $stmt_select->fetch(PDO::FETCH_ASSOC);
                    // step.2b 解析現有資料為陣列
                    $row_changeLogs = isset($row_data['_changeLogs']) ? json_decode($row_data['_changeLogs'] , true) : [];
                    $row_content    = isset($row_data['_content'])    ? json_decode($row_data['_content']    , true) : [];
                    // $row_todo       = isset($row_data['_todo'])       ? json_decode($row_data['_todo']       , true) : [];
                    // step.3a 更新或新增該年份的資料
                    foreach ($_changeLogs as $targetMonth => $new_log_value) {      // forEach目的：避免蓋掉其他項目 。$new_content_key這裡指到import      
                        // 前後驗證                        
                            $new_log_value_str = json_encode($new_log_value);
                            $row_log_value_str = (isset($row_changeLogs[$targetMonth])) ? json_encode($row_changeLogs[$targetMonth]) : "";
                        // 驗證後的更新
                        if($row_log_value_str !== $new_log_value_str){
                            // 3.強制覆蓋法 -- 只有這招最實在b 
                            $row_changeLogs[$targetMonth] = $new_log_value; 
                        }
                    };
                    // step.3b 檢查並串接新的 _content
                    foreach ($_content as $targetMonth => $new_content_value) {      // forEach目的：避免蓋掉其他項目 。$new_content_key這裡指到import      
                        // 前後驗證                        
                            $new_content_value_str = json_encode($new_content_value);
                            $row_content_value_str = (isset($row_content[$targetMonth])) ? json_encode($row_content[$targetMonth]) : "";
                        // 驗證後的更新
                        if($row_content_value_str !== $new_content_value_str){
                            // 確保 $row_content[$targetMonth 是陣列的存在
                            $row_content[$targetMonth] = $new_content_value; 
                        }
                    };
                    // step.4 將更新後的資料編碼為 JSON 字串
                    $_changeLogs_str = json_encode($row_changeLogs, JSON_UNESCAPED_UNICODE);
                    $_content_str    = json_encode($row_content,    JSON_UNESCAPED_UNICODE);
                    $_todo_str       = json_encode($_todo,          JSON_UNESCAPED_UNICODE);
                    // step.5 準備 SQL 和參數
                    $values[] = "(?, ?, ?, ?, ?,   ?, ?,  now(), now())";
                    $params = array_merge($params, [
                        $emp_id, $cname, $_changeLogs_str, $_content_str, $_todo_str,  $auth_cname, $auth_cname
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

            // mail使用
            case 'load_changeTodo':             // 由hrdb撈取人員資料，帶入查詢條件OSHORT
                $pdo = pdo();
                $sql = "SELECT id ,emp_id ,cname , _changeLogs ,_content ,_todo  -- ,JSON_UNQUOTE(JSON_KEYS(_todo)) AS ikey
                        FROM `_change` 
                        WHERE _todo <> '[]' AND _todo <> '' ";
                if(isset($parm) && $parm != 'load_changeTodo' ){               // 這裡定義的$parm是員工代號
                    $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                    $sql .= " AND emp_id IN ({$parm_re})"; 
                }
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();                                   //處理 byAll
                    $chStaffs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    // JSON反解成array
                    foreach($chStaffs as $index => $shStaff){
                        $chStaffs[$index]['_changeLogs'] = json_decode($chStaffs[$index]['_changeLogs'], true);
                        $chStaffs[$index]['_content']    = json_decode($chStaffs[$index]['_content']);
                        $chStaffs[$index]['_todo']       = json_decode($chStaffs[$index]['_todo'], true);
                    }
                    // 製作返回文件
                    $result = [
                        'result_obj' => $chStaffs,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.',
                        'sql'        => $sql
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;
            
            case 'showStaff':                   // 250324..因為要加上到職日
                require_once("../mvc/load_function.php");
                $showStaff = queryHrdb("showStaff", $parm);                                     // 查詢員工資訊for部門消滅
                // 製作返回文件
                $result = [
                    'result_obj' => $showStaff,
                    'fun'        => $fun,
                    'success'    => 'Load '.$fun.' success.',
                ];
                break;

            case 'bat_updateStaffNotify':       // 250325 變更作業健檢--更新人員_content通知訊息P3
                require_once("../user_info.php");
                $pdo = pdo();
                $swal_json = array(                                 // for swal_json
                    "fun"       => "bat_updateStaffNotify",
                    "content"   => "批次更新人員_content通知訊息--"
                );
                function fetchEmployeeData($pdo, $emp_id) {
                    $stmt_select = $pdo->prepare(SQL_SELECT_DOC);
                    executeQuery($stmt_select, [$emp_id]);
                    return $stmt_select->fetch(PDO::FETCH_ASSOC);
                }
                function updateEmployeeData($pdo, $_content_data, $auth_cname, $emp_id) {
                    $stmt_update = $pdo->prepare(SQL_UPDATE_DOC);
                    return executeQuery($stmt_update, [$_content_data, $auth_cname, $emp_id]);
                }
                define('SQL_SELECT_DOC', "SELECT emp_id, _content, updated_at FROM _change WHERE emp_id = ? ");
                define('SQL_UPDATE_DOC', "UPDATE _change SET _content = ?, updated_cname = ?, updated_at = now() WHERE emp_id = ?" );
                $params = [];
                $parm_array = parseJsonParams($parm);   // 使用新的函數解析JSON
                // step.3a 檢查並維護現有資料中的 key
                $staff_inf = $parm_array['staff_inf'] ?? [];
                foreach ($staff_inf as $staff_i) {
                    $staff_i_arr = (array) $staff_i; // #2.這裡也要由物件轉成陣列
                    extract($staff_i_arr);
                    // step.2a 提取現有資料
                    $row_data = fetchEmployeeData($pdo, $emp_id);
                    if ($row_data){
                        // step.2b 解析現有資料為陣列
                        $row_content = isset($row_data['_content']) ? json_decode($row_data['_content'], true) : [];
                        // step.3 更新或新增個人該變更日期的資料
                        $row_content[$changeTime] = $row_content[$changeTime] ?? ['notify' => []];
                        $row_content[$changeTime]['notify'][] = [
                            "from_cname" => $from_cname,    // 誰通知
                            "to_cname"   => $to_cname,      // 通知誰
                            // "to_emp_id"  => $to_emp_id,     // 誰的工號
                            // "to_email"   => $to_email,      // 誰的信箱
                            "dateTime"   => $dateTime,      // 通知時間
                            "result"     => $result,        // 通知結果
                        ];
                        // step.4 將更新後的資料編碼為 JSON 字串
                        $_content_str = json_encode($row_content, JSON_UNESCAPED_UNICODE);
                        // step.5 執行更新
                        if (!updateEmployeeData($pdo, $_content_str, $auth_cname, $emp_id)) {
                            $swal_json["action"] = "error";
                            $swal_json["content"] .= '儲存失敗';
                            break; 
                        }
                    } else {
                        $swal_json["action"] = "error";
                        $swal_json["content"] .= '無法取得員工資料';
                    }
                }
                $swal_json["action"] = $swal_json["action"] ?? "success";
                $swal_json["content"] .= ($swal_json["action"] === "success") ? '儲存成功' : '';
                $result = [
                    'result_obj' => $swal_json,
                    'fun'        => $fun,
                    'success'    => $swal_json["action"] === "success" ? 'Load ' . $fun . ' success.' : null,
                    'error'      => $swal_json["action"] === "error" ? 'Load ' . $fun . ' failed...(e or no parm)' : null,
                ];
                break;

            case 'bat_updateDocumentNotify':       // 250401 定期特殊健檢--更新doc_content通知訊息P3
                require_once("../user_info.php");
                $pdo = pdo();
                $swal_json = array(                                 // for swal_json
                    "fun"       => "bat_updateDocumentNotify",
                    "content"   => "批次更新doc_content通知訊息--"
                );
                function fetchDocumentData($pdo, $uuid) {
                    $stmt_select = $pdo->prepare(SQL_SELECT_DOC);
                    executeQuery($stmt_select, [$uuid]);
                    return $stmt_select->fetch(PDO::FETCH_ASSOC);
                }
                function updateDocumentData($pdo, $_content_data, $auth_cname, $uuid) {
                    $stmt_update = $pdo->prepare(SQL_UPDATE_DOC);
                    return executeQuery($stmt_update, [$_content_data, $auth_cname, $uuid]);
                }
                define('SQL_SELECT_DOC', "SELECT _content, updated_at FROM _document WHERE uuid = ? ");
                define('SQL_UPDATE_DOC', "UPDATE _document SET _content = ?, updated_cname = ?, updated_at = now() WHERE uuid = ?" );
                $params = [];
                $parm_array = parseJsonParams($parm);   // 使用新的函數解析JSON
                // step.3a 檢查並維護現有資料中的 key
                $doc_inf = $parm_array['doc_inf'] ?? [];
                foreach ($doc_inf as $doc_i) {
                    $doc_i_arr = (array) $doc_i; // #2.這裡也要由物件轉成陣列
                    extract($doc_i_arr);
                    // step.2a 提取現有資料
                    $row_data = fetchDocumentData($pdo, $uuid);
                    if ($row_data){
                        // step.2b 解析現有資料為陣列
                        $row_content = isset($row_data['_content']) ? json_decode($row_data['_content'], true) : [];
                        // step.3 更新或新增個人該變更日期的資料
                        $row_content[$age] = $row_content[$age] ?? ['notify' => []];
                        $row_content[$age]['notify'][] = [
                            "from_cname" => $from_cname,    // 誰通知
                            "to_cname"   => $to_cname,      // 通知誰
                            // "to_emp_id"  => $to_emp_id,     // 誰的工號
                            // "to_email"   => $to_email,      // 誰的信箱
                            "dateTime"   => $dateTime,      // 通知時間
                            "result"     => $result,        // 通知結果
                        ];
                        // step.4 將更新後的資料編碼為 JSON 字串
                        $_content_str = json_encode($row_content, JSON_UNESCAPED_UNICODE);
                        // step.5 執行更新
                        if (!updateDocumentData($pdo, $_content_str, $auth_cname, $uuid)) {
                            $swal_json["action"] = "error";
                            $swal_json["content"] .= '儲存失敗';
                            break; 
                        }
                    } else {
                        $swal_json["action"] = "error";
                        $swal_json["content"] .= '無法取得_document資料';
                    }
                }
                $swal_json["action"] = $swal_json["action"] ?? "success";
                $swal_json["content"] .= ($swal_json["action"] === "success") ? '儲存成功' : '';
                $result = [
                    'result_obj' => $swal_json,
                    'fun'        => $fun,
                    'success'    => $swal_json["action"] === "success" ? 'Load ' . $fun . ' success.' : null,
                    'error'      => $swal_json["action"] === "error" ? 'Load ' . $fun . ' failed...(e or no parm)' : null,
                ];
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
