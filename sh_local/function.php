<?php
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
    // 取得特作列管的部門代號
    function load_shLocal_OSHORTs(){
        $pdo = pdo();
        $sql = "SELECT _sh.OSTEXT_30, _sh.OSTEXT, _sh.OSHORT ,COUNT(_sh.OSHORT) AS OSHORT_count 
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
                $shLocal_OSHORTs_arr[$OSHORT_i["OSTEXT_30"]][$OSHORT_i["OSHORT"]]["OSTEXT"] = $OSHORT_i["OSTEXT"];
                $shLocal_OSHORTs_arr[$OSHORT_i["OSTEXT_30"]][$OSHORT_i["OSHORT"]]["_count"] = $OSHORT_i["OSHORT_count"];
            }
            return $shLocal_OSHORTs_arr;

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
// shLocal
    // shLocal項目--新增 230703
    function store_shLocal($request){
        $pdo = pdo();
        extract($request);
        $swal_json = array(                                 // for swal_json
            "fun"       => "store_shLocal",
            "content"   => "新增案例--"
        );
        $OSHORT = trim($OSHORT);
        $HE_CATE_str = json_encode($HE_CATE, JSON_UNESCAPED_UNICODE);  // 中文不編碼
        $sql = "INSERT INTO _shlocal( OSHORT, OSTEXT_30, OSTEXT, HE_CATE, AVG_VOL,   AVG_8HR, MONIT_NO, MONIT_LOCAL, WORK_DESC, flag,   updated_cname, updated_at, created_at )
                VALUES(?,?,?,?,?,  ?,?,?,?,?,  ?,now(),now())";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$OSHORT, $OSTEXT_30, $OSTEXT, $HE_CATE_str, $AVG_VOL,   $AVG_8HR, $MONIT_NO, $MONIT_LOCAL, $WORK_DESC, $flag,   $updated_cname ]);
            $swal_json["action"]   = "success";
            $swal_json["content"] .= '送出成功';
        }catch(PDOException $e){
            echo $e->getMessage();
            $swal_json["action"]   = "error";
            $swal_json["content"] .= '送出失敗';
        }

        return $swal_json;
    }
    // from edit_shLocal.php 依ID找出要修改的shLocal內容
    function edit_shLocal($request){
        $pdo = pdo();
        extract($request);
        $sql = "SELECT _sh.*
                FROM _shlocal _sh WHERE _sh.id = ?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$id]);
            $shLocal = $stmt->fetch();
            // 把特定json轉物件
            $shLocal["HE_CATE"] = json_decode($shLocal["HE_CATE"]);
            return $shLocal;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    //from edit_shLocal.php call update_shLocal 修改完成的edit_shLocal 進行Update
    function update_shLocal($request){
        $pdo = pdo();
        extract($request);
        $swal_json = array(                                 // for swal_json
            "fun"       => "update_shLocal",
            "content"   => "更新案例--"
        );
        $OSHORT = trim($OSHORT);
        $HE_CATE_str = json_encode($HE_CATE, JSON_UNESCAPED_UNICODE);
        $sql = "UPDATE _shlocal
                SET OSHORT=?, OSTEXT_30=?, OSTEXT=?, HE_CATE=?, AVG_VOL=?,   AVG_8HR=?, MONIT_NO=?, MONIT_LOCAL=?, WORK_DESC=?, flag=?,   updated_cname=?, updated_at=now()
                WHERE id=? ";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$OSHORT, $OSTEXT_30, $OSTEXT, $HE_CATE_str, $AVG_VOL,   $AVG_8HR, $MONIT_NO, $MONIT_LOCAL, $WORK_DESC, $flag,   $updated_cname, $id]);
            $swal_json["action"]   = "success";
            $swal_json["content"] .= '送出成功';
        }catch(PDOException $e){
            echo $e->getMessage();
            $swal_json["action"]   = "error";
            $swal_json["content"] .= '送出失敗';
        }

        return $swal_json;
    }

    function delete_shLocal($request){
        $pdo = pdo();
        extract($request);
        $swal_json = array(                                 // for swal_json
            "fun"       => "delete_shLocal",
            "content"   => "刪除案例--"
        );
        $sql = "DELETE FROM _shlocal WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$id]);
            $swal_json["action"]   = "success";
            $swal_json["content"] .= '刪除成功';
        }catch(PDOException $e){
            echo $e->getMessage();
            $swal_json["action"]   = "error";
            $swal_json["content"] .= '刪除失敗';
        }

        return $swal_json;
    }

    function warningCRUD($request){
        extract($request);
        $swal_json = array(                                 // for swal_json
            "fun"       => $action,
            "content"   => "處理--異常",
            "action"    => "warning"
        );
        return $swal_json;
    }

    function check_HE_CATE($request){
        $pdo = pdo();
        extract($request);
        $OSHORT      = isset($OSHORT)       ? $OSHORT       : "";
        $HE_CATE_str = isset($HE_CATE_str)  ? $HE_CATE_str  : "";
        $LIKE_OSHORT = "%".$OSHORT."%";
        $HE_CATE_arr = json_decode($HE_CATE_str, true);  // 確保是陣列
        // 檢查OSHORT部門代號是否已經有註冊
        $sql_check = "SELECT _sh.id, _sh.OSHORT, _sh.HE_CATE FROM _shlocal _sh WHERE _sh.OSHORT LIKE ?";
        $stmt_check = $pdo -> prepare($sql_check);
        $stmt_check -> execute([$LIKE_OSHORT]);
        // 初始化找到的項目集合
        $found_items = [];
        $loss_item = [];
        if($stmt_check -> rowCount() > 0){     
            $row = $stmt_check->fetchAll(PDO::FETCH_ASSOC);         // no index
            foreach($row as $r){                                    // 第一層迴圈：資料庫
                $r_HE_CATE_arr = json_decode($r['HE_CATE'], true);  // 確保是陣列
                // 確保 $r_HE_CATE_arr 是一個有效的陣列
                if (is_array($r_HE_CATE_arr)) {
                    foreach($HE_CATE_arr as $key_i){
                        if (in_array($key_i, $r_HE_CATE_arr)) {
                            $found_items[] = $key_i;
                            echo "<br>Find... ".$key_i;
                        }
                    }
                }
            }
        }
        // 計算未找到的項目
        if (is_array($HE_CATE_arr) && is_array($found_items)) {
            $loss_item = array_diff($HE_CATE_arr, $found_items);
        } else {
            $loss_item = [];
        }
        if(!empty($loss_item)){
            $loss_item_str = implode('、', $loss_item);
            $swal_json = array(                                 // for swal_json
                "fun"       => "請確認 {$OSHORT}",
                "content"   => "其[ {$loss_item_str} ]是否已完成環測 !!",
                "action"    => "warning"
            );
        } else {
            $swal_json = [];
        }

        return $swal_json;
    }
    // API隱藏或開啟
    function changeShLocal_flag($request){
        $pdo = pdo();
        extract($request);
        $sql_check = "SELECT sh.id, sh.flag FROM _shLocal sh WHERE id=?";
        $stmt_check = $pdo -> prepare($sql_check);
        $stmt_check -> execute([$id]);
        $row = $stmt_check -> fetch();
        if($row['flag'] == "Off" || $row['flag'] == "chk"){
            $flag = "On";
        }else{
            $flag = "Off";
        }
        $sql = "UPDATE _shlocal SET flag=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$flag, $id]);
            $Result = array(
                'table' => $table, 
                'id'    => $id,
                'flag'  => $flag
            );
            return $Result;

        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
// shLocal

