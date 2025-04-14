<?php
    if(isset($_REQUEST['fun'])) {
        require_once("../pdo.php");
        extract($_REQUEST);
        $result = [];
        switch ($_REQUEST['fun']){
            case 'update_balert':
                $swal_json = array(                                 // for swal_json
                    "fun"       => "update_balert",
                    "content"   => "更新危害類別--"
                );
                $balertFile = "../balert/balert.json";                                     // 預設sw.json檔案位置
                $balert_json = isset($_REQUEST['parm']) ? $_REQUEST['parm'] : null;
                if(!empty($balert_json)){
                    $fop = fopen($balertFile,"w");  //開啟檔案
                    fputs($fop, $balert_json);      //初始化sw+寫入
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
                
            case 'load_balert':       // 250414 讀取balert的jason字串並返回
                if(isset($_REQUEST['parm'])) {
                    extract($_REQUEST);
                    $filename = "../balert/balert.json";
                    $balert_jsonFile = fopen($filename,"r");
                    $balert_str = trim(fgets($balert_jsonFile));
                    fclose($balert_jsonFile);
                    $result = [                         // 製作返回文件
                        'result_obj' => $balert_str ? json_decode($balert_str, true) : [],
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                } else {
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
