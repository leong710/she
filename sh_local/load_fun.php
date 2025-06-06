<?php
    if(isset($_REQUEST['fun'])) {
        require_once("../pdo.php");
        extract($_REQUEST);
        $result = [];
        switch ($_REQUEST['fun']){
            case 'edit_shLocal':                   // 帶入查詢條件
                if(isset($parm)){
                    $pdo = pdo();
                    $sql = "SELECT _sh.id,_sh.OSHORT, _sh.OSTEXT_30, _sh.OSTEXT, _sh.HE_CATE, _sh.AVG_VOL, _sh.AVG_8HR, _sh.MONIT_NO, _sh.MONIT_LOCAL, _sh.WORK_DESC, _sh.flag
                            FROM _shlocal _sh ";
                    // 初始查詢陣列
                        $conditions = [];
                        $stmt_arr   = [];    
                    if (!empty($parm)) {
                        $conditions[] = "_sh.id = ?";
                        $stmt_arr[] = $parm;
                    }
                    if (!empty($conditions)) {
                        $sql .= ' WHERE ' . implode(' AND ', $conditions);
                    }
                    $stmt = $pdo->prepare($sql);
                    try {
                        if(!empty($stmt_arr)){
                            $stmt->execute($stmt_arr);                          //處理 byUser & byYear
                        }else{
                            $stmt->execute();                                   //處理 byAll
                        }
                        $shLocal = $stmt->fetch(PDO::FETCH_ASSOC);
                        // 把特定json轉物件
                        $shLocal["HE_CATE"] = json_decode($shLocal["HE_CATE"]);
                        // 製作返回文件
                        $result = [
                            'result_obj' => $shLocal,
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

            case 'truncate_shLocal':               // 清空_shLocal
                $swal_json = array(                                 // for swal_json
                    "fun"       => "truncate_shLocal",
                    "content"   => "特危作業--"
                );
                if(isset($parm)){
                    $pdo = pdo();
                    $sql = "DELETE FROM `_shlocal`;
                            ALTER TABLE `_shlocal` AUTO_INCREMENT = 1";
                    $stmt = $pdo->prepare($sql);
                    try {
                        $stmt->execute();
                        $swal_json["action"]   = "success";
                        $swal_json["content"] .= '清除成功';
                        // 製作返回文件
                        $result = [
                            'result_obj' => $swal_json,
                            'fun'        => $fun,
                            'success'    => 'Load '.$fun.' success.'
                        ];

                    }catch(PDOException $e){
                        echo $e->getMessage();
                        $swal_json["action"]   = "error";
                        $swal_json["content"] .= '清除失敗';
                        // 製作返回文件
                        $result = [
                            'result_obj' => $swal_json,
                            'fun'        => $fun,
                            'error'      => 'Load '.$fun.' failed...(e)'
                        ];
                    }
                }else{
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(no parm)'
                    ];
                }
                break;

            case 'deleteSelected_shLocal':         // 刪除選定的_shLocal (可多筆)
                $swal_json = array(                                 // for swal_json
                    "fun"       => "deleteSelected_shLocal",
                    "content"   => "刪除特危作業--"
                );
                if(isset($parm)){
                    $pdo = pdo();
                    $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                    $sql = "DELETE FROM _shlocal WHERE OSHORT IN ({$parm_re}) ";
                    $stmt = $pdo->prepare($sql);
                    try {
                        $stmt->execute();
                        $swal_json["action"]   = "success";
                        $swal_json["content"] .= '成功';
                        // 製作返回文件
                        $result = [
                            'result_obj' => $swal_json,
                            'fun'        => $fun,
                            'success'    => 'Load '.$fun.' success.'
                        ];
                    }catch(PDOException $e){
                        echo $e->getMessage();
                        $swal_json["action"]   = "error";
                        $swal_json["content"] .= '失敗';
                        // 製作返回文件
                        $result = [
                            'result_obj' => $swal_json,
                            'fun'        => $fun,
                            'error'      => 'Load '.$fun.' failed...(e)'
                        ];
                    }
                }else{
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(no parm)'
                    ];
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
                    $swal_json["action"]   = "error";
                    $swal_json["content"] .= '儲存失敗';
                    $result = [
                        'result_obj' => $swal_json,
                        'fun'        => $fun,
                        'error'      => 'Load '.$fun.' failed...(e or no parm)'
                    ];
                }
                break;

            case 'shLocalStep':
                require_once("../mvc/load_function.php");
                $step_arr = shLocalStep();                         // shLocalStep
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
