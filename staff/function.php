<?php
    // 取得特作列管的棟別清單
use Mockery\Undefined;

    function load_shLocal_OSTEXT30s(){
        $pdo = pdo();
        $sql = "SELECT _sh.OSTEXT_30 
                FROM `_shlocal` _sh
                WHERE _sh.flag = 'On'
                GROUP BY _sh.OSTEXT_30
                ORDER BY _sh.OSTEXT_30 ";
        $stmt = $pdo->prepare($sql);                                // 讀取全部=不分頁
        try {
            $stmt->execute();
            $shLocal_OSTEXT_30s = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $shLocal_OSTEXT_30s;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    // 取得特作列管的部門代號
    function load_shLocal_OSHORTs(){
        $pdo = pdo();
        $sql = "SELECT _sh.OSTEXT_30, _sh.OSTEXT, _sh.OSHORT 
                FROM `_shlocal` _sh
                WHERE _sh.flag = 'On'
                GROUP BY _sh.OSHORT
                ORDER BY _sh.OSHORT ";
        $stmt = $pdo->prepare($sql);                                // 讀取全部=不分頁
        try {
            $stmt->execute();
            $shLocal_OSHORTs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $shLocal_OSHORTs_arr = [];
            foreach($shLocal_OSHORTs as $OSHORT_i){
                $shLocal_OSHORTs_arr[$OSHORT_i["OSTEXT_30"]][$OSHORT_i["OSHORT"]] = $OSHORT_i["OSTEXT"];
            }
            return $shLocal_OSHORTs_arr;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    // 取得已存檔的員工部門代號
    function load_staff_dept_nos(){
        $pdo = pdo();
        $year = $year ?? date('Y');
        $sql = "SELECT year_key, emp_sub_scope, dept_no, emp_dept, COUNT(*) AS _count,
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
                        _logs
                    FROM _staff
                    WHERE JSON_EXTRACT(_logs, '$.{$year}.dept_no') IS NOT NULL
                ) AS expanded_shCase
                GROUP BY year_key, dept_no, emp_sub_scope, emp_dept;
                ";
        $stmt = $pdo->prepare($sql);                                // 讀取全部=不分頁
        try {
            $stmt->execute();
            $staff_deptNos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $staff_deptNos_arr = [];
            foreach($staff_deptNos as $deptNo_i){
                $staff_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["OSTEXT"]           = $deptNo_i["emp_dept"];
                $staff_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["_count"]           = $deptNo_i["_count"];
                $staff_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["shCaseNotNull"]    = $deptNo_i["shCaseNotNull"];
                $staff_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["dept_no"]]["shCaseNotNull_pc"] = $deptNo_i["shCaseNotNull_pc"];
            }
            return $staff_deptNos_arr;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

// 在index表頭顯示清單：
    function show_shLocal($request){
        $pdo = pdo();
        extract($request);
        $sql = "SELECT sh.* 
                FROM _shlocal sh ";
        // tidy query condition：
            $stmt_arr   = [];    // 初始查詢陣列
            $conditions = [];
            if(isset($OSHORT) && $OSHORT != "All"){                         // 處理過濾 OSHORT != All  
                $conditions[] = "sh.OSHORT = ?";
                $stmt_arr[] = $OSHORT;
            }
            if($flag != "All"){                                        // 處理過濾 flag != All  
                $conditions[] = "sh.flag = ?";
                $stmt_arr[] = $flag;
            }
            if(isset($fab_title) && $fab_title != "All"){                         // 處理 fab_title != All 進行二階   
                if($fab_title == "allMy"){                                     // 處理 fab_title = allMy 我的轄區
                    $conditions[] = "sh.OSTEXT_30 IN ({$sfab_id})";
                }else{                                                      // 處理 fab_title != allMy 就是單點fab_title
                    $conditions[] = "sh.OSTEXT_30 LIKE ?";
                    $stmt_arr[] = "%".$fab_title."%";
                }
            }                                                               // 處理 fab_title = All 就不用套用，反之進行二階
            if (!empty($conditions)) {
                $sql .= ' WHERE ' . implode(' AND ', $conditions);
            }
            // 後段-堆疊查詢語法：加入排序
            $sql .= " ORDER BY sh.created_at DESC ";     // ORDER BY sh.created_at DESC
        // 決定是否採用 page_div 20230803
            if(isset($start) && isset($per)){
                $stmt = $pdo -> prepare($sql.' LIMIT '.$start.', '.$per);   // 讀取選取頁的資料=分頁
            }else{
                $stmt = $pdo->prepare($sql);                                // 讀取全部=不分頁
            }
        try {
            if(!empty($stmt_arr)){
                $stmt->execute($stmt_arr);                          //處理 byUser & byYear
            }else{
                $stmt->execute();                                   //處理 byAll
            }
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);            // no index
            return $result;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    function show_site_lists(){
        $pdo = pdo();
        $sql = "SELECT _site.id, _site.site_title, _site.site_remark, _site.flag
                FROM _site
                -- WHERE _fab.flag = 'On' AND _site.flag = 'On'
                ORDER BY _site.id ASC ";
        $stmt = $pdo->prepare($sql);                                // 讀取全部=不分頁
        try {
            $stmt->execute();
            $site = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $site;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    function show_fab_lists(){
        $pdo = pdo();
        $sql = "SELECT _fab.*, _site.site_title, _site.site_remark, _site.flag AS site_flag
                FROM _fab
                LEFT JOIN _site ON _site.id = _fab.site_id
                -- WHERE _fab.flag = 'On' AND _site.flag = 'On'
                ORDER BY _site.id, _fab.id ASC ";
        $stmt = $pdo->prepare($sql);                                // 讀取全部=不分頁
        try {
            $stmt->execute();
            $fabs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $fabs;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    // 20240125 4.組合我的sign_code所涵蓋的廠區
    function get_coverFab_lists($type){
        $sfab_id = [];
        // 1-1b 將sign_code涵蓋的fab_id加入sfab_id
        if(isset($_SESSION["AUTH"]["sign_code"])){
            $auth_sign_code["sign_code"] = $_SESSION["AUTH"]["sign_code"];
            $coverFab_lists = show_coverFab_lists($auth_sign_code);
            if(!empty($coverFab_lists)){
                foreach($coverFab_lists as $coverFab){
                    if(!in_array($coverFab["id"], $sfab_id)){
                        array_push($sfab_id, $coverFab["id"]);
                    }
                }
            }
        }
        // 根據需求類別進行編碼 arr=陣列、str=字串
        if($type == "str"){
            $result = implode(",", $sfab_id);                   // 1-1c sfab_id是陣列，要轉成字串
        }else{
            $result = $sfab_id;
        }
        // 1-1c sfab_id是陣列，要轉成字串
        return $result;
    }

    // 20231026 在index表頭顯示my_coverFab區域 = 使用signCode去搜尋
    function show_coverFab_lists($request){
        $pdo = pdo();
        extract($request);
            $sign_code = substr($sign_code, 0, -2);     // 去掉最後兩個字 =>
            $sign_code = "%".$sign_code."%";            // 加上模糊包裝

        $sql = "SELECT _f.*
                FROM _fab AS _f 
                WHERE _f.sign_code LIKE ?
                ORDER BY _f.id ASC ";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$sign_code]);
            $coverFab_lists = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $coverFab_lists;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    // 取出年份清單 => 供面篩選
    function show_GB_year(){
        $pdo = pdo();
        $sql = "SELECT DISTINCT year(sh.created_at) AS _year
                FROM _shlocal sh
                GROUP BY sh.created_at
                ORDER BY sh.created_at DESC ";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    // 取出年份清單 => 供面篩選
    function show_OSHORT(){
        $pdo = pdo();
        $sql = "SELECT DISTINCT sh.OSHORT, sh.OSTEXT
                FROM _shlocal sh
                GROUP BY sh.OSHORT
                ORDER BY sh.OSHORT ASC ";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    // load workTarget.json
    function load_workTarget($parm) {
        $workTarget_file = "../staff/workTarget.json";
        $workTarget_arr = "{}";
        if(file_exists($workTarget_file)){
            $workTarget_json = file_get_contents($workTarget_file); // 从JSON文件加载内容
            // 嘗試解碼 JSON，並檢查是否成功
            $decoded_data = json_decode($workTarget_json, true);    // 解析JSON数据并将其存储在$变量中，如果想解析为陣列，请传入true，否则将解析为物件
            if (json_last_error() === JSON_ERROR_NONE) {
                $workTarget_arr = $decoded_data;                    // 直接賦值
            } else {
                // 處理 JSON 解碼錯誤，您可以在這裡記錄錯誤或拋出異常
                // error_log('JSON Error: ' . json_last_error_msg());
            }
            // 假如有直取參數...
            if($parm){
                $workTarget_arr = (isset($workTarget_arr[$parm])) ? $workTarget_arr[$parm] : null;
            }
        }

        return $workTarget_arr;
    }
