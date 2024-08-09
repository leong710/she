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
                    // 後段-堆疊查詢語法：加入排序
                    // $sql .= " ORDER BY _sh.OSHORT, _sh.created_at DESC ";

                    $stmt = $pdo->prepare($sql);
                    try {
                        if(!empty($stmt_arr)){
                            $stmt->execute($stmt_arr);                          //處理 byUser & byYear
                        }else{
                            $stmt->execute();                                   //處理 byAll
                        }
                        $shLocal = $stmt->fetch(PDO::FETCH_ASSOC);
                        // 把特定json轉物件
                        $shLocal["HE_CATE"] = explode(',', $shLocal["HE_CATE"]);

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
