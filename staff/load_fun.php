<?php
    if(isset($_REQUEST['fun'])) {
        require_once("../pdo.php");
        extract($_REQUEST);

        $result = [];
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
                    // $sql = "SELECT emp_id, cname, shCase_logs, _content 
                    //         FROM _staff
                    //         WHERE JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.', JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(shCase_logs), '$[0]'))))), '$.dept_no')) IN ({$parm}) ";
                    $year = $year ?? date('Y');
                    // 241025--owner想把特作內的部門代號都掏出來...由各自的窗口進行維護... // 241104 UNION ALL之後的項目暫時不需要給先前單位撈取了，故於以暫停
                    $sql = "SELECT emp_id, cname, shCase_logs, _content
                            FROM _staff
                            WHERE JSON_UNQUOTE(JSON_EXTRACT(shCase_logs, CONCAT('$.{$year}.dept_no'))) IN ({$parm})
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
                                $shStaffs[$index]['eh_time']     = $shStaffs[$index]['shCase_logs'][$current_year]['eh_time'];
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
                }else{
                    $result['error'] = 'Load '.$fun.' failed...(no parm)';
                }
            break;
            case 'bat_storeStaff':  // 
                if(isset($parm)){
                    require_once("../user_info.php");
                    $pdo = pdo();
                    $swal_json = array(                                 // for swal_json
                        "fun"       => "bat_storeStaff",
                        "content"   => "批次儲存名單--"
                    );
                    
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
                    $parm = (array) json_decode($parm, true); // #1.這裡decode要由物件轉成陣列

                    foreach ($parm as $parm_i) {
                        $parm_i_arr = (array) $parm_i; // #2.這裡也要由物件轉成陣列
                        extract($parm_i_arr);
                    
                        // step.1 提取現有資料
                        $stmt_select = $pdo->prepare($sql_select);
                        $stmt_select->execute([$emp_id]);
                        $existing_data = $stmt_select->fetch(PDO::FETCH_ASSOC);
                    
                        // step.2 解析現有資料為陣列
                        $shCase_logs_existing = isset($existing_data['shCase_logs']) ? json_decode($existing_data['shCase_logs'], true) : [];
                        $_content_existing    = isset($existing_data['_content'])    ? json_decode($existing_data['_content'], true)    : [];
                    
                        // step.3a 檢查並維護現有資料中的 key
                            $current_year = date('Y');
                    
                        // step.3b 更新或新增該年份的資料
                            $shCase_logs_existing[$current_year] = [
                                "dept_no"       => !empty($dept_no)       ? $dept_no       : (!empty($shCase_logs_existing[$current_year]["dept_no"])       ? $shCase_logs_existing[$current_year]["dept_no"]       : null),
                                "emp_dept"      => !empty($emp_dept)      ? $emp_dept      : (!empty($shCase_logs_existing[$current_year]["emp_dept"])      ? $shCase_logs_existing[$current_year]["emp_dept"]      : null),
                                "emp_sub_scope" => !empty($emp_sub_scope) ? $emp_sub_scope : (!empty($shCase_logs_existing[$current_year]["emp_sub_scope"]) ? $shCase_logs_existing[$current_year]["emp_sub_scope"] : null),
                                "schkztxt"      => !empty($schkztxt)      ? $schkztxt      : (!empty($shCase_logs_existing[$current_year]["schkztxt"])      ? $shCase_logs_existing[$current_year]["schkztxt"]      : null),
                                "cstext"        => !empty($cstext)        ? $cstext        : (!empty($shCase_logs_existing[$current_year]["cstext"])        ? $shCase_logs_existing[$current_year]["cstext"]        : null),
                                "emp_group"     => !empty($emp_group)     ? $emp_group     : (!empty($shCase_logs_existing[$current_year]["emp_group"])     ? $shCase_logs_existing[$current_year]["emp_group"]     : null),
                                "eh_time"       => isset($eh_time)        ? $eh_time       : (!empty($shCase_logs_existing[$current_year]["eh_time"])       ? $shCase_logs_existing[$current_year]["eh_time"]       : null),    // 暴露時數
                                "shCase"        => isset($shCase)         ? $shCase        : (!empty($shCase_logs_existing[$current_year]["shCase"])        ? $shCase_logs_existing[$current_year]["shCase"]        : null),    // 特作區域
                                "shCondition"   => !empty($shCondition)   ? $shCondition   : (!empty($shCase_logs_existing[$current_year]["shCondition"])   ? $shCase_logs_existing[$current_year]["shCondition"]   : null)     // 特作驗證
                            ];
                        // //  241021 針對 
                        //     if(!empty($shCase_logs_existing[$current_year]["shCase"])){
                        //         if(!empty($shCase)){
                        //             $get_shCase = (array) $shCase_logs_existing[$current_year]["shCase"];
                        //             array_push($get_shCase, $shCase);
                        //             // array_push($shCase_logs_existing[$current_year]["shCase"], $shCase);
                        //             $shCase_logs_existing[$current_year]["shCase"] = $get_shCase;
                        //         }
                        //     }else{
                        //         $shCase_logs_existing[$current_year]["shCase"] = $shCase;
                        //     }
                            
                        // $_content_existing[$current_year] = isset($_content) ? $_content : null;
                        // 檢查並串接新的 _content
                        if (isset($_content[$current_year])) {
                            // 確保 $_content[$current_year] 是陣列，並將其轉換成字符串
                            // $new_content = is_array($_content[$current_year]) ? implode("\r\n", $_content[$current_year]) : $_content[$current_year];
                            $new_content = $_content[$current_year];
                            // 確保 $_content_existing[$current_year] 是陣列的存在
                            $_content_existing[$current_year] = isset($_content_existing[$current_year]) ? $_content_existing[$current_year] : [];

                            // 檢查 $new_content 是否非空，才進行後續操作
                            if (!empty($new_content)) {
                                // 檢查現有內容是否非空，再進行串接
                                if (!empty($_content_existing[$current_year])) {
                                    // $_content_existing[$current_year] .= "\r\n" . $new_content;
                                    foreach ($new_content as $new_content_ikey => $new_content_ivalue){     // forEach目的：避免蓋掉其他項目
                                        $_content_existing[$current_year][$new_content_ikey] = isset($_content_existing[$current_year][$new_content_ikey]) ? $_content_existing[$current_year][$new_content_ikey]:[];
                                        $_content_existing[$current_year][$new_content_ikey] = $new_content[$new_content_ikey]; // 直接覆蓋指定項
                                    }
                                } else {
                                    // 如果現有內容是空的，直接設置為新內容
                                    $_content_existing[$current_year] = $new_content;
                                }
     
                            }
                        }
                    
                        // step.4 將更新後的資料編碼為 JSON 字串
                        $shCase_logs_str       = json_encode($shCase_logs_existing, JSON_UNESCAPED_UNICODE);
                        $_content_str          = json_encode($_content_existing,    JSON_UNESCAPED_UNICODE);
                    
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

                }else{
                    $result['error'] = 'Load '.$fun.' failed...(no parm)';
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
            default:
                // $result['error'] = 'Load '.$fun.' failed...(function)';
        };

        if(isset($result["error"])){
            http_response_code(500);
        }else{
            http_response_code(200);
        }
        echo json_encode($result);

    } else {
        http_response_code(500);
        echo json_encode(['error' => 'fun is lost.']);
    }

?>
