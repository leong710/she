<?php
    if(isset($_REQUEST['fun'])) {
        require_once("../pdo.php");
        extract($_REQUEST);

        if (!isset($parm) || empty($parm)) {
            sendErrorResponse('Load '.$fun.' failed...(no parm)', 400);
        }

        switch ($fun){

            case '_json':       // 現撈json檔案 -- by parm
                $parm_arr = explode(",", $parm);    // 將參數parm炸成陣列：0= 要抓的對象； 1= true/false 是否輸出更新json檔
                $filename = $parm_arr[0].".json";
                if(file_exists($filename)){
                    $file_json = file_get_contents($filename);              // 从 JSON 文件加载内容
                    $file_json = (array) json_decode($file_json, true);     // 解析 JSON 数据；如果您想将JSON解析为关联数组，请传入 true，否则将解析为对象
                    $result = [                                             // 製作返回文件
                        'result_obj' => $file_json,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                }else{
                    $result['error'] = 'Load '.$fun.' failed...(file not exist)';
                }
                break;

            case 'x_db':        // 現撈db -- formcase / _site / _fab
                $pdo = pdo();
                $parm_arr = explode(",", $parm);    // 將參數parm炸成陣列：0= 要抓的對象； 1= true/false 是否輸出更新json檔
                if($parm_arr[0] == "formcase"){
                    $sql = "SELECT * FROM _formcase WHERE flag <> 'Off' ORDER BY id ASC";

                }else if($parm_arr[0] == "_site"){
                    $sql = "SELECT _s.id, _s.site_title, _s.site_remark FROM _site _s WHERE _s.flag <> 'Off' ORDER BY _s.id ASC";

                }else if($parm_arr[0] == "_fab"){
                    $sql = "SELECT _f.id, _f.site_id, _f.fab_title, _f.fab_remark FROM _fab _f WHERE _f.flag <> 'Off' ORDER BY _f.id ASC";

                }else if($parm_arr[0] == "highlight"){
                    $sql = "SELECT f.id, f.fab_title, DATEDIFF(JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.due_day')), CURDATE()) AS '_remaining', 
                                CASE
                                    WHEN COUNT(CASE 
                                                WHEN d.idty IN (1, 6, 10) 
                                                    AND (d._odd <> '[]' AND JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.od_day')) = '')
                                                THEN 1 
                                                END) = 0 
                                        THEN 'success'      -- Green
                                    WHEN COUNT(CASE 
                                                WHEN d.idty IN (1, 6, 10) 
                                                    AND (d._odd <> '[]' AND JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.od_day')) = '' 
                                                        AND DATEDIFF(JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.due_day')), CURDATE()) > 1 
                                                        -- AND DATEDIFF(JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.due_day')), CURDATE()) <= 5 
                                                        )
                                                    THEN 1 
                                                END) > 0 
                                        THEN 'warning'      -- Yellow
                                    WHEN COUNT(CASE 
                                                WHEN d._odd <> '[]' AND JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.od_day')) = '' 
                                                    AND DATEDIFF(JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.due_day')), CURDATE()) <= 1 
                                                THEN 1 
                                            END) > 0 
                                        THEN 'danger'       -- Red
                                    ELSE 'secondary'
                                END AS 'light'
                            FROM _fab f
                            LEFT JOIN _document d ON f.id = d.fab_id
                            WHERE f.flag = 'On'
                            GROUP BY f.id ";
                }else{  // 0= 沒有歸屬 then 當作錯誤處理+break
                    $result['error'] = 'Load '.$fun.' -- '.$parm_arr[0].' failed...(e)';
                    break;
                }
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();
                    $_db = $stmt->fetchAll(PDO::FETCH_ASSOC);        // no index
                    // 製作返回文件
                    $result = [
                        'result_obj' => $_db,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                    // 240711 寫入json 1= true/false 是否輸出更新json檔
                        if($parm_arr[1]){
                            $doJson = fopen($parm_arr[0].".json","w");         //開啟檔案
                            fputs($doJson, json_encode($_db , JSON_UNESCAPED_UNICODE ));  //初始化sw+寫入
                            fclose($doJson);                            //關閉檔案
                        }

                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
                break;

            case '_db':        // 現撈db -- 
                $pdo = pdo();
                $parm_arr = explode(",", $parm);    // 將參數parm炸成陣列：0= 要抓的對象； 1= true/false 是否輸出更新json檔
                $table = $parm_arr[0];
                if($table == "_shLocal"){               // 取得_shLocal for chart1特殊危害健康作業場所統計繪圖
                    $sql = "SELECT _sh.OSTEXT_30, _sh.OSTEXT, _sh.OSHORT ,COUNT(_sh.OSHORT) AS OSHORT_count 
                            FROM `_shlocal` _sh WHERE _sh.flag = 'On' GROUP BY _sh.OSHORT ORDER BY _sh.OSHORT ";

                }else if($table == "_shLocalDepts"){    // 取得_shLocalDepts for chart2變更作業建檢統計
                    $sql = "SELECT _sl.OSTEXT_30, _sl.OSHORT, _sl.OSTEXT, _sl.inCare, _sl.flag
                            FROM `_shlocaldept` _sl WHERE _sl.flag IS true ";

                }else if($table == "_site"){
                    $sql = "SELECT _s.id, _s.site_title, _s.site_remark FROM _site _s WHERE _s.flag <> 'Off' ORDER BY _s.id ASC";
                
                }else{  // 0= 沒有歸屬 then 當作錯誤處理+break
                    $result['error'] = 'Load '.$fun.' -- '.$table.' failed...(e)';
                    break;
                }

                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();
                    $_db = $stmt->fetchAll(PDO::FETCH_ASSOC);        // no index

                    // 資料整理
                    if($table == "_shLocal"){               // 取得_shLocal for chart1特殊危害健康作業場所統計繪圖
                        $shLocal_OSHORTs_arr = [];
                        foreach($_db as $OSHORT_i){
                            $shLocal_OSHORTs_arr[$OSHORT_i["OSTEXT_30"]][$OSHORT_i["OSHORT"]]["OSTEXT"] = $OSHORT_i["OSTEXT"];
                            $shLocal_OSHORTs_arr[$OSHORT_i["OSTEXT_30"]][$OSHORT_i["OSHORT"]]["_count"] = $OSHORT_i["OSHORT_count"];
                        }
                        $_db = $shLocal_OSHORTs_arr;  // 整理完後帶回去

                    }else if($table == "_shLocalDepts"){     // 取得_shLocalDepts for chart2變更作業建檢統計
                        // JSON解碼  true = 還原成陣列
                        foreach($_db as $index => $shLocalDept){
                            $_db[$index]['inCare'] = json_decode($shLocalDept['inCare']);
                        }
                    }

                    // 製作返回文件
                    $result = [
                        'result_obj' => $_db,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                    // 240711 寫入json 1= true/false 是否輸出更新json檔
                        if($parm_arr[1]){
                            $doJson = fopen($table.".json","w");         //開啟檔案
                            fputs($doJson, json_encode($_db , JSON_UNESCAPED_UNICODE ));  //初始化sw+寫入
                            fclose($doJson);                            //關閉檔案
                        }

                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
       
                break;

            case 'urt':       // 2.更新reloadTime.txt時間；完成後=>3.更新畫面上reload_time時間
                $parm_arr = explode(",", $parm);    // 將參數parm炸成陣列：0= 要抓的對象； 1= true/false 是否輸出更新json檔
                $rightNow = $parm_arr[0];
                
                if($parm_arr[1]){                   // 判斷是否更新
                    $filename = "reloadTime.txt";
                    $rt = fopen($filename,"w");     // 寫入新的資料
                    fputs($rt, $rightNow);
                    fclose($rt);
                }    

                $result = [                         // 製作返回文件
                    'result_obj' => $rightNow,
                    'fun'        => $fun,
                    'success'    => 'Load '.$fun.' success.'
                ];
                break;

            case 'load_balert':       // 250414 讀取balert的jason字串並返回
                $filename = "../balert/balert.json";
                $balert_jsonFile = fopen($filename,"r");
                $balert_str = trim(fgets($balert_jsonFile));
                fclose($balert_jsonFile);
                $result = [                         // 製作返回文件
                    'result_obj' => $balert_str ? json_decode($balert_str, true) : [],
                    'fun'        => $fun,
                    'success'    => 'Load '.$fun.' success.'
                ];
                break;



        // 取自 load_shLocalDepts => 修改後給eChart繪圖用
            case 'load_shLocalDepts':           // 250217 取得in[範圍內]特作部門內容
                $pdo = pdo();
                $sql = "SELECT _sl.OSTEXT_30, _sl.OSHORT, _sl.OSTEXT, _sl.inCare, _sl.flag
                        FROM `_shlocaldept` _sl 
                        WHERE _sl.flag IS true ";
                $stmt = $pdo->prepare($sql);
                try {
                    $stmt->execute();
                    $shLocalDepts = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    // JSON解碼  true = 還原成陣列
                    foreach($shLocalDepts as $index => $shLocalDept){
                        $shLocalDepts[$index]['inCare'] = json_decode($shLocalDept['inCare']);
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

            case 'load_change':                 // 由hrdb撈取人員資料，帶入查詢條件OSHORT
                $pdo = pdo();
                $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                $sql = "SELECT _c.emp_id ,_c.cname ,_c._changeLogs ,_c._content ,_c._todo
                        FROM _change _c
                        WHERE _c.emp_id IN ({$parm_re}) ";
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
