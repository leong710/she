<?php
        // 製作記錄JSON_Log檔   20230803
        function toLog($request){       // 包裝參數：idty, step, cname, action, logs, remark
            extract($request);
            // log資料前處理
            // 交易狀態：0完成/1待收/2退貨/3取消/12發貨
                // switch($action){
                //     case "0":   $action = '作廢 (Abort)';          break;
                //     case "1":   $action = '編輯 (Edit)';           break;
                //     case "2":   $action = '暫存 (Save)';           break;
                //     case "3":   $action = '送出 (Submit)';         break;
                //     case "4":   $action = '退回 (Reject)';         break;
                //     case "5":   $action = '轉呈 (Forwarded)';      break;
                //     case "6":   $action = '同意 (Approve)';        break;
                //     case "10":  $action = '結案 (Close)';          break;    // 結案 (Close)
                //     default:    $action = '錯誤 (Error)';
                // }

            if(!isset($logs)){
                $logs     = [];
                $logs_arr = [];
            }else{
                $logs_arr = (array) json_decode($logs, true);
            }

            // $app = [];  // 定義app陣列=appry
            // 因為remark=textarea會包含換行符號，必須用str_replace置換/n標籤
            $log_remark = str_replace(array("\r\n","\r","\n"), "_rn_", $remark);
            $app = array (
                "step"      => $step,                   // 1.節點/身分
                "cname"     => $cname,                  // 2.操作人
                "datetime"  => date('Y-m-d H:i:s'),     // 3.時間戳
                "action"    => $action,                 // 4.動作/核決
                "remark"    => $log_remark              // 5.command
            );

            array_push($logs_arr, $app);
            $logs = json_encode($logs_arr, JSON_UNESCAPED_UNICODE);

            return $logs;        
        }
        // load 審查作業步驟json
        function reviewStep() {
            $reviewStep_file = "../review/reviewStep.json";
            $reviewStep_arr = [];

            if(file_exists($reviewStep_file)){
                $reviewStep_json = file_get_contents($reviewStep_file); // 从JSON文件加载内容
                // 嘗試解碼 JSON，並檢查是否成功
                $decoded_data = json_decode($reviewStep_json, true);    // 解析JSON数据并将其存储在$变量中，如果想解析为陣列，请传入true，否则将解析为物件
                if (json_last_error() === JSON_ERROR_NONE) {
                    $reviewStep_arr = $decoded_data;                    // 直接賦值
                } else {
                    // 處理 JSON 解碼錯誤，您可以在這裡記錄錯誤或拋出異常
                    // error_log('JSON Error: ' . json_last_error_msg());
                }
            }

            return $reviewStep_arr;
        }
                
        function queryHrdb($hrdb_fun, $request) {
            $pdo_hrdb = pdo_hrdb();
            switch ($hrdb_fun){
                case 'showSignCode':                        // 由hrdb撈取人員資料，帶入查詢條件OSHORT
                    $sql = "SELECT DEPT08.*, s.cname  FROM HCM_VW_DEPT08 DEPT08  LEFT JOIN staff s ON DEPT08.OMAGER = s.emp_id  WHERE DEPT08.OSHORT = ? ";
                break;
                case 'showDelegation':                  // 由hrdb查詢簽核代理人，帶入查詢條件emp_id
                    $sql = "SELECT d.*, s.cname AS DEPUTYCNAME  FROM hcm_zdelegation d  LEFT JOIN staff s ON d.DEPUTYEMPID = s.emp_id  WHERE d.APPLICATIONEMPID = ? ";
                break;
                case 'showStaff':                  // 由hrdb查詢簽核代理人，帶入查詢條件emp_id
                    $sql = "SELECT u.*  
                                -- , s2.emp_id AS s2_emp_id, s2.cname AS s2_cname, s2.emp_scope AS s2_emp_scope, s2.dept_no AS s2_dept_no, s2.emp_dept AS s2_emp_dept, s2.emp_sub_scope AS s2_emp_sub_scope
                                -- , _E.HIRED
                            FROM staff u
                            -- LEFT JOIN HCM_VW_EMP01_hiring _E ON u.emp_id = _E.PERNR
                            -- LEFT JOIN staff s2 ON u.omager = s2.emp_id
                            WHERE u.emp_id = ? ";
                            // pass掉的部分是所屬主管部門訊息的部分
                break;
                default:
                return null; // 返回null以便檢查
            };
            $stmt = $pdo_hrdb->prepare($sql);
            try {
                $stmt->execute([$request]);
                return $stmt->fetch(PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                error_log($e->getMessage());
                return null; // 返回null以便檢查
            }
        }


