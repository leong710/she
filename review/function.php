<?php
    // 取得特作列管的棟別清單
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
                // array_push($shLocal_OSHORTs_arr, $OSHORT_i["OSHORT"]);
                $shLocal_OSHORTs_arr[$OSHORT_i["OSTEXT_30"]][$OSHORT_i["OSHORT"]] = $OSHORT_i["OSTEXT"];
            }
            return $shLocal_OSHORTs_arr;
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    
    // 取得已存檔的員工部門代號
    function load_doc_deptNos(){
        $pdo = pdo();
        $year = $year ?? date('Y');
        $sql = "SELECT * FROM `_document`
                ";
        $stmt = $pdo->prepare($sql);                                // 讀取全部=不分頁
        try {
            $stmt->execute();
            $doc_deptNos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // $doc_deptNos_arr = [];
            // foreach($doc_deptNos as $deptNo_i){
            //     $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["deptNo"]]["OSTEXT"] = $deptNo_i["emp_dept"];
            //     $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["deptNo"]]["_count"] = $deptNo_i["_count"];
            //     $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["deptNo"]]["shCaseNotNull"]    = $deptNo_i["shCaseNotNull"];
            //     $doc_deptNos_arr[$deptNo_i["emp_sub_scope"]][$deptNo_i["deptNo"]]["shCaseNotNull_pc"] = $deptNo_i["shCaseNotNull_pc"];
            // }
            return $doc_deptNos;
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

// 在index表頭顯示清單：
    function show_shLocal($request){
        $pdo = pdo();
        extract($request);
        $sql = "SELECT sh.* 
                    -- _d.id, _d.uuid, _d.idty, _d.anis_no, _d.local_id, _d.case_title, _d.a_dept, _d.meeting_time, _d.meeting_local, _odd
                    -- , _d.created_emp_id, _d.created_cname, _d.created_at, _d.updated_cname, _d.updated_at, year(_d.created_at) AS case_year , _d.confirm_sign
                    -- , _l.local_title, _l.local_remark , _f.fab_title, _f.fab_remark, _f.sign_code AS fab_signCode, _f.pm_emp_id, _fc.short_name, _fc._icon
                FROM _shlocal sh
                -- LEFT JOIN _local _l     ON _d.local_id = _l.id 
                -- LEFT JOIN _fab _f       ON _l.fab_id   = _f.id 
                -- LEFT JOIN _formcase _fc ON _d.dcc_no   = _fc.dcc_no 
                ";
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


