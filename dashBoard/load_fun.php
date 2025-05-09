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

            case '_db':        // 現撈db -- 
                $pdo = pdo();
                $parm_arr = explode(",", $parm);        // 將參數parm炸成陣列：0= 要抓的對象； 1= true/false 是否輸出更新json檔
                $table = $parm_arr[0];
                if($table == "_shLocal"){               // 取得_shLocal for chart1_特殊危害健康作業場所統計繪圖
                    $sql = "SELECT _sh.OSTEXT_30, _sh.OSTEXT, _sh.OSHORT ,COUNT(_sh.OSHORT) AS OSHORT_count 
                            FROM `_shlocal` _sh WHERE _sh.flag = 'On' GROUP BY _sh.OSHORT ORDER BY _sh.OSHORT ";

                }else if($table == "_shLocalDepts"){    // 取得_shLocalDepts for chart2_變更作業建檢統計
                    $sql = "SELECT _sl.OSTEXT_30, _sl.OSHORT, _sl.OSTEXT, _sl.inCare, _sl.flag
                            FROM `_shlocaldept` _sl WHERE _sl.flag IS true ";

                }else if($table == "_change"){           // 取得_chang for chart2_變更作業建檢統計
                    $parm_re = str_replace(":", ",", $parm_arr[2]);   // 類別 符號轉逗號
                    $parm_re2 = str_replace('"', "'", $parm_re);   // 類別 符號轉逗號
                    $sql = "SELECT _c.emp_id ,_c.cname ,_c._changeLogs ,_c._content ,_c._todo
                            FROM _change _c WHERE _c.emp_id IN ({$parm_re2}) ";

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
                    }else if($table == "_change"){     // 取得_shLocalDepts for chart2變更作業建檢統計
                        foreach($_db as $index => $shStaff){
                            $_db[$index]['_changeLogs'] = json_decode($_db[$index]['_changeLogs'], true);
                            $_db[$index]['_content']    = json_decode($_db[$index]['_content']);
                            $_db[$index]['_todo']       = json_decode($_db[$index]['_todo'], true);
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
                $targetTimeId = $parm_arr[0];
                $rightNow     = $parm_arr[1];
                $action       = $parm_arr[2];
                if($action){                        // 判斷是否更新
                    $filename = "{$targetTimeId}.txt";
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
