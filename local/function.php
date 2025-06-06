<?php
// site
    // site項目--新增 230703
    function store_site($request){
        $pdo = pdo();
        extract($request);
        $sql = "INSERT INTO _site(site_title, site_remark, flag, updated_user, created_at, updated_at)VALUES(?,?,?,?,now(),now())";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$site_title, $site_remark, $flag, $updated_user]);
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    // from edit_site.php 依ID找出要修改的site內容
    function edit_site($request){
        $pdo = pdo();
        extract($request);
        $sql = "SELECT * FROM _site WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$id]);
            $site = $stmt->fetch();
            return $site;
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    // from edit_site.php call update_site 修改完成的edit_site 進行Update
    function update_site($request){
        $pdo = pdo();
        extract($request);
        $sql = "UPDATE _site
                SET site_title=?, site_remark=?, flag=?, updated_user=?, updated_at=now()
                WHERE id=?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$site_title, $site_remark, $flag, $updated_user, $id]);
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    
    function delete_site($request){
        $pdo = pdo();
        extract($request);
        $sql = "DELETE FROM _site WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$id]);
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    // 隱藏或開啟
    function changeSite_flag($request){
        $pdo = pdo();
        extract($request);

        $sql_check = "SELECT _site.* FROM _site WHERE id=?";
        $stmt_check = $pdo -> prepare($sql_check);
        $stmt_check -> execute([$id]);
        $row = $stmt_check -> fetch();

        if($row['flag'] == "Off" || $row['flag'] == "chk"){
            $flag = "On";
        }else{
            $flag = "Off";
        }

        $sql = "UPDATE _site SET flag=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$flag, $id]);
            $Result = array(
                'table' => $table, 
                'id' => $id,
                'flag' => $flag
            );
            return $Result;
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    function show_site($request){       // 已加入分頁功能
        $pdo = pdo();
        extract($request);
        $sql = "SELECT _site.*
                FROM _site
                ORDER BY _site.id ASC";
        // 決定是否採用 page_div 20230803
            if(isset($start) && isset($per)){
                $stmt = $pdo -> prepare($sql.' LIMIT '.$start.', '.$per);   // 讀取選取頁的資料=分頁
            }else{
                $stmt = $pdo->prepare($sql);                                // 讀取全部=不分頁
            }
        try {
            $stmt->execute();
            $sites = $stmt->fetchAll();
            return $sites;
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
// site

// _Fab
    // fab項目--新增 230703
    function store_fab($request){
        $pdo = pdo();
        extract($request);
        $sql = "INSERT INTO _fab(site_id, fab_title, fab_remark, BTRTL, osha_id, sign_code, flag, updated_user, created_at, updated_at)VALUES(?,?,?,?,?,?,  ?,?,now(),now())";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$site_id, $fab_title, $fab_remark, $BTRTL, $osha_id, $sign_code, $flag, $updated_user]);
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    // from edit_fab.php 依ID找出要修改的fab內容
    function edit_fab($request){
        $pdo = pdo();
        extract($request);
        $sql = "SELECT * FROM _fab WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$id]);
            $fab = $stmt->fetch();
            return $fab;
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    // from edit_fab.php  call update_Fab 修改完成的edit_Fab 進行Update
    function update_fab($request){
        $pdo = pdo();
        extract($request);

        if(!empty($pm_emp_id)){
            $pm_emp_id = implode(",", $pm_emp_id);       //管理權組是陣列，要儲存前要轉成字串
        }else{
            $pm_emp_id = "";
        }

        $sql = "UPDATE _fab
                SET site_id=?, fab_title=?, fab_remark=?, BTRTL=? ,osha_id=? ,sign_code=?, pm_emp_id=?, flag=?, updated_user=?, updated_at=now()
                WHERE id=?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$site_id, $fab_title, $fab_remark, $BTRTL, $osha_id, $sign_code, $pm_emp_id, $flag, $updated_user, $id]);
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    function delete_fab($request){
        $pdo = pdo();
        extract($request);
        $sql = "DELETE FROM _fab WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$id]);
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
    // 隱藏或開啟
    function changeFab_flag($request){
        $pdo = pdo();
        extract($request);

        $sql_check = "SELECT _fab.* FROM _fab WHERE id=?";
        $stmt_check = $pdo -> prepare($sql_check);
        $stmt_check -> execute([$id]);
        $row = $stmt_check -> fetch();

        if($row['flag'] == "Off" || $row['flag'] == "chk"){
            $flag = "On";
        }else{
            $flag = "Off";
        }

        $sql = "UPDATE _fab SET flag=? WHERE id=?";
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

    function show_fab($request){       // 已加入分頁功能
        $pdo = pdo();
        extract($request);
        $sql = "SELECT _fab.*, _site.site_title, _site.site_remark, _site.flag AS site_flag
                FROM _fab
                LEFT JOIN _site ON _site.id = _fab.site_id
                ORDER BY _site.id, _fab.id ASC ";
        // 決定是否採用 page_div 20230803
            if(isset($start) && isset($per)){
                $stmt = $pdo -> prepare($sql.' LIMIT '.$start.', '.$per);   // 讀取選取頁的資料=分頁
            }else{
                $stmt = $pdo->prepare($sql);                                // 讀取全部=不分頁
            }
        try {
            $stmt->execute();
            $fabs = $stmt->fetchAll();
            return $fabs;
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }
// _Fab

    // 20240318 ~ 製作服務窗口
    function make_server_window($fabs){
        echo "<div class='text-white'>";
        foreach($fabs as $fab){
            echo "Fab：".$fab["fab_title"]."&nbsp/&nbsp"."cname：".$fab["pm_emp_id"]."<br/>";
        }
        echo "</div>";
    }

    