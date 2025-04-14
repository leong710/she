<?php

// // // _guide CRUD
    function store_guide($request){
        $pdo = pdo();
        extract($request);
        $swal_json = array(                                 // for swal_json
            "fun"       => "store_guide",
            "content"   => "新增文件--"
        );
        // 處理dcc_no上傳檔案
        if($_FILES["upload_file"]["name"]){
            // 確認是否有同檔名存在 true / false
            if(check_is_file($_FILES["upload_file"]["name"])){
                $name = $_FILES["upload_file"]["name"];
                    $swal_json["action"]   = "error";
                    $swal_json["content"] .= "檔案名稱：{$name} 已存在，儲存失敗";
                return $swal_json;
            }else{
                $_file = uploadFile($_FILES["upload_file"]);
            }
        }else{
            $flag = "Off";
        }

        $sql = "INSERT INTO _guide(_file, _title, _remark, flag, updated_user,  created_at, updated_at)VALUES(?,?,?,?,?,  now(), now())";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$_file, $_title, $_remark, $flag, $updated_user]);
            $swal_json["action"]   = "success";
            $swal_json["content"] .= '儲存成功';
        }catch(PDOException $e){
            echo $e->getMessage();
            $swal_json["action"]   = "error";
            $swal_json["content"] .= '儲存失敗';
            $swal_json["unlinkFile"] = unlinkFile($_FILES["upload_file"]);      // 清除舊檔
        }
        return $swal_json;
    }

    function edit_guide($request){
        $pdo = pdo();
        extract($request);
        $sql = "SELECT * FROM _guide WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$id]);
            $guide = $stmt->fetch(PDO::FETCH_ASSOC);          // no index
            return $guide;
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    function update_guide($request){
        $pdo = pdo();
        extract($request);
        $swal_json = array(                                 // for swal_json
            "fun"       => "update_guide",
            "content"   => "更新文件--"
        );
        // 處理fileName上傳更換檔案
        if($_FILES["upload_file"]["name"]){                                         // 檢查是否有上傳檔案
            $upload_fileExt = $_FILES["upload_file"]["name"];                   // 取得上傳檔名
            $upload_file = str_ireplace(".json", "", $upload_fileExt);      // 把副檔名移除

            if ($_file && ($_file == $upload_file)){          // 如果已有 fileName 且與上傳檔案名稱相符
                // 清除舊檔
                unlinkFile($_file); 
            }else{
                // 檢查是否已存在同名檔案
                if(check_is_file($upload_fileExt)){
                    $swal_json["action"]   = "error";
                    $swal_json["content"] .= "檔案名稱：{$upload_fileExt} 已存在，更新失敗";
                    return $swal_json;
                }
                // 清除舊檔
                unlinkFile($_file); 
            }
            // 處理上傳檔案
            $_file = uploadFile($_FILES["upload_file"]);
        }

        $sql = "UPDATE _guide SET _file=?, _title=?, _remark=?, flag=?, updated_user=?, updated_at=now() WHERE id=?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$_file, $_title, $_remark, $flag, $updated_user, $id]);
            $swal_json["action"]   = "success";
            $swal_json["content"] .= '儲存成功';
        }catch(PDOException $e){
            echo $e->getMessage();
            $swal_json["action"]   = "error";
            $swal_json["content"] .= '儲存失敗';
        }
        return $swal_json;
    }

    function delete_guide($request){
        $pdo = pdo();
        extract($request);
        $swal_json = array(                                 // for swal_json
            "fun"       => "delete_guide",
            "content"   => "刪除文件--"
        );
        // 舊檔案處理
        $row_guide = edit_guide(["id"=>$id]);               // 叫出舊檔案
        $row_guide_file = $row_guide["_file"];      // 取得舊fileName
        if(!empty($row_guide_file)){                    // 判斷是否有值
            $result = unlinkFile($row_guide_file);      // 清除舊檔
            if(!$result){
                $swal_json["action"]   = "error";
                $swal_json["content"] .= 'fileName刪除失敗';
                return $swal_json;
            }
        }
        $sql = "DELETE FROM _guide WHERE id = ?";
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

            // guide 隱藏或開啟
            // function changeguide_flag($request){
            //     $pdo = pdo();
            //     extract($request);

            //     $sql_check = "SELECT _guide.* FROM _guide WHERE id=?";
            //     $stmt_check = $pdo -> prepare($sql_check);
            //     $stmt_check -> execute([$id]);
            //     $row = $stmt_check -> fetch();

            //     if($row['flag'] == "Off" || $row['flag'] == ""){
            //         $flag = "On";
            //     }else{
            //         $flag = "Off";
            //     }

            //     $sql = "UPDATE _guide SET flag=? WHERE id=?";
            //     $stmt = $pdo->prepare($sql);
            //     try {
            //         $stmt->execute([$flag, $id]);
            //         $Result = array(
            //             'id'   => $id,
            //             'flag' => $flag
            //         );
            //         return $Result;
            //     }catch(PDOException $e){
            //         echo $e->getMessage();
            //     }
            // }

    // 在index表頭顯示清單：
    function show_guide(){
        $pdo = pdo();
        $sql = "SELECT * FROM _guide ORDER BY id ASC";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute();
            $guide = $stmt->fetchAll(PDO::FETCH_ASSOC);          // no index
            return $guide;
        }catch(PDOException $e){
            echo $e->getMessage();
        }
    }

    // 20240417
    function uploadFile($files){
        extract($files);

        $uploadDir = './doc/';                              // 過度路徑，submit後再搬移到正是路徑
            if(!is_dir($uploadDir)){ mkdir($uploadDir); }   // 检查資料夾是否存在
        $row_file = basename($name);                    // 取得檔案名稱
        $uploadFile = $uploadDir.$row_file;             // 合成上船路境+檔名
        // // 假如已經有了....
            // if(is_file($uploadFile)){
            //     $rename_time = date('Ymd-His');
            //     $row_file = str_ireplace(".pdf", "", $row_file);     // 把副檔名移除
            //     $row_file .= "_".$rename_time.".pdf";
            //     $uploadFile = $uploadDir.$row_file;         // 合成上船路境+檔名
            // }

        // 将文件移动到指定目录
        if(move_uploaded_file($tmp_name, $uploadFile)) {
            $success_file = str_ireplace(".pdf", "", $row_file);     // 把副檔名移除
            return $success_file;       // 返回 文件名稱
        } else {
            return false;           // 返回 錯誤
        }
    }    
    // 20240417
    function unlinkFile($unlinkFile){
        $file_from = "./doc/";                // submit後正是路徑
        $file_to   = "./doc/offLine/";        // submit後再搬移到垃圾路徑

        $rename_time = date('Ymd-His');
        $ext_name = ".pdf";

        // 確認檔案在目錄下
        if(is_file($file_from .$unlinkFile .$ext_name)) {
            // // 移除檔案 unlink($unlinkFile); 
            // 搬到垃圾桶
            $moved = rename( $file_from .$unlinkFile .$ext_name , $file_to .$unlinkFile ."_" .$rename_time .$ext_name );
            // 返回完成訊息
            if($moved){
                return true;
            }else{
                return false;
            }
        } else {
            return false;
        }
    }
    // 20240417
    function check_is_file($fileName){
        $uploadDir = './doc/';                    // 過度路徑，submit後再搬移到正是路徑
        if(is_file($uploadDir .$fileName )) {
            $result = true;
        } else {
            $result = false;
        }
        return $result;
    }

