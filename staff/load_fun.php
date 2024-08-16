<?php
    if(isset($_REQUEST['fun'])) {
        require_once("../pdo.php");
        extract($_REQUEST);

        $result = [];
        switch ($fun){
            case 'load_hrdb':                   // 帶入查詢條件
                if(isset($parm)){
                    $pdo = pdo_hrdb();
                    $parm_re = str_replace('"', "'", $parm);   // 類別 符號轉逗號
                    
                    $sql = "SELECT s.emp_sub_scope, s.dept_no, s.emp_dept, s.emp_id, s.cname, s.cstext, s.gesch, s.emp_group, s.natiotxt, s.schkztxt, s.updated_at
                            FROM STAFF s 
                            WHERE s.dept_no IN ({$parm_re}) 
                            ";

                    // 後段-堆疊查詢語法：加入排序
                    $sql .= " ORDER BY s.dept_no ASC, s.emp_id ASC ";

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
