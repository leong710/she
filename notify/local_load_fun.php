<?php
        function sendErrorResponse($errorMessage, $httpCode = 500) {
            http_response_code($httpCode);
            echo json_encode(['error' => $errorMessage]);
            exit();
        }
        
        function executeQuery($stmt, $params) {
            try {
                return empty($params) ? $stmt->execute() : $stmt->execute($params);
            } catch (PDOException $e) {
                error_log($e->getMessage());
                sendErrorResponse("Database error");
            }
        }

        function parseJsonParams($parm) {
            $parm_array = json_decode($parm, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                sendErrorResponse('Invalid JSON format for parameters.', 400);
            }
            return $parm_array;
        }

    if(isset($_REQUEST['fun'])) {
        require_once("../pdo.php");
        extract($_REQUEST);

        $result = [];

        if (!isset($parm) || empty($parm)) {
            sendErrorResponse('Load '.$fun.' failed...(no parm)', 400);
        }

        switch ($fun){

            case '_json':       // 現撈json檔案 -- by parm
                if(isset($_REQUEST['parm'])) {
                    extract($_REQUEST);
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
                        break;
                        
                    }else{
                        $result['error'] = 'Load '.$fun.' failed...(file not exist)';
                    }
                } else {
                    $result['error'] = 'Load '.$fun.' failed...(no parm)';
                }

            case '_db':        // 現撈db -- formcase / _site / _fab
                if(isset($_REQUEST['parm'])) {
                    require_once("../pdo.php");
                    $pdo = pdo();
                    extract($_REQUEST);
                        $parm_arr = explode(",", $parm);    // 將參數parm炸成陣列：0= 要抓的對象； 1= true/false 是否輸出更新json檔
                        if($parm_arr[0] == "formcase"){
                            $sql = "SELECT * FROM _formcase WHERE flag <> 'Off' ORDER BY id ASC";

                        }else if($parm_arr[0] == "_site"){
                            $sql = "SELECT _s.id, _s.site_title, _s.site_remark FROM _site _s WHERE _s.flag <> 'Off' ORDER BY _s.id ASC";

                        }else if($parm_arr[0] == "_fab"){
                            $sql = "SELECT _f.id, _f.site_id, _f.fab_title, _f.fab_remark FROM _fab _f WHERE _f.flag <> 'Off' ORDER BY _f.id ASC";

                        }else if($parm_arr[0] == "highlight"){
                            $sql = "SELECT f.id, f.fab_title, DATEDIFF(JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.due_day')), CURDATE()) AS '_remaining', 
                                        CASE
                                            WHEN COUNT(CASE 
                                                        WHEN d.idty IN (1, 6, 10) 
                                                            AND (d._odd <> '[]' AND JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.od_day')) = '')
                                                        THEN 1 
                                                        END) = 0 
                                                THEN 'success'      -- Green
                                            WHEN COUNT(CASE 
                                                        WHEN d.idty IN (1, 6, 10) 
                                                            AND (d._odd <> '[]' AND JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.od_day')) = '' 
                                                                AND DATEDIFF(JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.due_day')), CURDATE()) > 1 
                                                                -- AND DATEDIFF(JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.due_day')), CURDATE()) <= 5 
                                                                )
                                                            THEN 1 
                                                        END) > 0 
                                                THEN 'warning'      -- Yellow
                                            WHEN COUNT(CASE 
                                                        WHEN d._odd <> '[]' AND JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.od_day')) = '' 
                                                            AND DATEDIFF(JSON_UNQUOTE(JSON_EXTRACT(d._odd, '$.due_day')), CURDATE()) <= 1 
                                                        THEN 1 
                                                    END) > 0 
                                                THEN 'danger'       -- Red
                                            ELSE 'secondary'
                                        END AS 'light'
                                    FROM _fab f
                                    LEFT JOIN _document d ON f.id = d.fab_id
                                    WHERE f.flag = 'On'
                                    GROUP BY f.id ";

                        }else if($parm_arr[0] == "notify"){
                            $sql = "SELECT _d.id, _d.anis_no, _d.idty, _d.created_at ,_f.fab_title, _fc.short_name, _d._odd
                                        , _d.created_cname, _d.created_emp_id, _f.sign_code, _f.pm_emp_id
                                        , DATEDIFF(JSON_UNQUOTE(JSON_EXTRACT(_d._odd, '$.due_day')), CURDATE()) AS '_remaining'
                                    FROM `_document` _d
                                    LEFT JOIN _formcase _fc ON _d.dcc_no = _fc.dcc_no
                                    LEFT JOIN _fab _f ON _d.fab_id = _f.id
                                    WHERE DATEDIFF(JSON_UNQUOTE(JSON_EXTRACT(_d._odd, '$.due_day')), CURDATE()) <= 5";

                        }else if($parm_arr[0] == "bpm"){
                            $sql = "SELECT _u.emp_id, _u.cname
                                    FROM `_users` _u
                                    WHERE _u.role = '1'";
                                    
                        }else{  // 0= 沒有歸屬 then 當作錯誤處理+break
                            $result['error'] = 'Load '.$fun.' -- '.$parm_arr[0].' failed...(e)';
                            break;
                        }
                    $stmt = $pdo->prepare($sql);
                    try {
                        $stmt->execute();
                        $_db = $stmt->fetchAll(PDO::FETCH_ASSOC);        // no index
                        // 製作返回文件
                        $result = [
                            'result_obj' => $_db,
                            'fun'        => $fun,
                            'success'    => 'Load '.$fun.' success.'
                        ];
                        // 240711 寫入json 1= true/false 是否輸出更新json檔
                            if($parm_arr[1]){
                                $doJson = fopen($parm_arr[0].".json","w");         //開啟檔案
                                fputs($doJson, json_encode($_db , JSON_UNESCAPED_UNICODE ));  //初始化sw+寫入
                                fclose($doJson);                            //關閉檔案
                            }

                    }catch(PDOException $e){
                        echo $e->getMessage();
                        $result['error'] = 'Load '.$fun.' failed...(e)';
                    }
                } else {
                    $result['error'] = 'Load '.$fun.' failed...(no parm)';
                }
                break;

            case 'urt':       // 2.更新reloadTime.txt時間；完成後=>3.更新畫面上reload_time時間
                if(isset($_REQUEST['parm'])) {
                    extract($_REQUEST);
                    $parm_arr = explode(",", $parm);    // 將參數parm炸成陣列：0= 要抓的對象； 1= true/false 是否輸出更新json檔
                    $filename = "reloadTime.txt";
                    $rightNow = $parm_arr[0];

                    if($parm_arr[1]){                   // 判斷是否更新
                        $rt = fopen($filename,"w");     // 寫入新的資料
                        fputs($rt, $rightNow);
                        fclose($rt);
                    }    

                    $result = [                         // 製作返回文件
                        'result_obj' => $rightNow,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];

                } else {
                    $result['error'] = 'Load '.$fun.' failed...(no parm)';
                }
                break;
            case 'showP3Notify_list':
                require_once("function.php");
                try {
                    $P3Notify_list = showP3Notify_list(); 
                    // 製作返回文件
                    $result = [
                        'result_obj' => $P3Notify_list,
                        'fun'        => $fun,
                        'success'    => 'Load '.$fun.' success.'
                    ];
                }catch(PDOException $e){
                    echo $e->getMessage();
                    $result['error'] = 'Load '.$fun.' failed...(e)';
                }
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
