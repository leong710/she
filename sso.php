<?php
// // // *** none function group
    function accessDenied($sys_id){
        $url='http://'.$_SERVER['HTTP_HOST'].'/';   // 複製本頁網址藥用
        if(!isset($_SESSION)){                                              // 確認session是否啟動
            session_start();
        }
        if(!isset($_SESSION["AUTH"]) || !isset($_SESSION[$sys_id])){
            header("refresh:0;url={$url}tnESH_SSO/login.php?sys_id={$sys_id}");
            exit;
        }
        return;
    }
    // reload sys_id & local user role
    function accessDenied_sys($sys_id){
        $url='http://'.$_SERVER['HTTP_HOST'].'/';                           // 複製本頁網址藥用
        if(!isset($_SESSION)){                                              // 確認session是否啟動
            session_start();
        }
        if(isset($_SESSION["AUTH"]) && !empty($_SESSION["AUTH"]["pass"])){                              // 確認是否完成AUTH/pass => True
            if(!empty($_SESSION[$sys_id])){                                  // 如果sys_id已經建立，就返回
                return;
            }else{                                                          // sys_id還沒建立，就導入
                $user = $_SESSION["AUTH"]["user"];
                $user = strtoupper($_SESSION["AUTH"]["user"]);  // strtoupper(大寫)
                    $pdo = pdo();
                        $sql = "SELECT u.role, GROUP_CONCAT(f.BTRTL SEPARATOR ',') AS BTRTL
                                FROM `_users` u
                                LEFT JOIN `_fab` f ON FIND_IN_SET(u.emp_id, f.pm_emp_id) > 0 AND f.flag = 'On'
                                WHERE u.user = ? 
                                GROUP BY u.emp_id;";
                        $stmt = $pdo -> prepare($sql);
                        $stmt -> execute([$user]);
                    $sys_local_row = $stmt -> fetch(PDO::FETCH_ASSOC);

                    $pdo_hrdb = pdo_hrdb();
                        $sql_hrdb = "SELECT s.*, d.plant AS plant
                                FROM [dbo].[STAFF] AS s
                                LEFT JOIN [dbo].[DEPT] AS d ON s.dept_no = d.sign_code
                                WHERE s.[user] = ? ";
                        $stmt_hrdb = $pdo_hrdb -> prepare($sql_hrdb);
                        $stmt_hrdb -> execute([$user]);
                    $esh_mb = $stmt_hrdb -> fetch(PDO::FETCH_ASSOC);
    
                if($sys_local_row){                                         // 有sys_id的人員權限資料
                    if($sys_local_row["role"] != ""){                       // 權限沒被禁用
                        $_SESSION[$sys_id] = $sys_local_row;                // 導入$sys_id指定權限
                        if(!empty($esh_mb["BTRTL"])){                       // 組合BTRTL
                            $b_BTRTL_arr = !empty($_SESSION[$sys_id]["BTRTL"]) ? explode(",", $_SESSION[$sys_id]["BTRTL"]) : [];   // 字串轉陣列
                            array_push($b_BTRTL_arr, $esh_mb["BTRTL"]);                 // 插入陣列
                            // $_SESSION[$sys_id]["BTRTL"] = array_unique($b_BTRTL_arr);   // 陣列去重 + 帶入陣列型態
                            $b_BTRTL_arr = array_unique($b_BTRTL_arr);                  // 陣列去重
                            $_SESSION[$sys_id]["BTRTL"] = implode(",", $b_BTRTL_arr);   // 陣列轉字串
                        }
                    }else{                                                  // Local權限被禁用
                        echo "<script>alert('{$sys_local_row["cname"]} Local帳號停用，請洽管理員')</script>";
                    }
                }else{                                                      // 沒有sys_id的人員權限資料
                    // 20240527_確認是否是環安處成員~
                    $_SESSION[$sys_id]["role"]  = !empty($esh_mb["plant"]) ? 2.5 : 3;      // 2.5 = tnESH_user    // 3 = 外部user  
                    // $_SESSION[$sys_id]["BTRTL"] = explode(",",$esh_mb["BTRTL"]) ?? [];   // 帶入陣列型態
                    $_SESSION[$sys_id]["BTRTL"] = $esh_mb["BTRTL"] ?? "";
                    header("refresh:0;url={$url}{$sys_id}");
                    exit;
                }
                // 20230906_set this point to log logs
                header("refresh:0;url={$url}tnESH_SSO/autoLog.php?sys_id={$sys_id}");
                exit;
            }
        }else{                                                              // 確認AUTH/pass => false
            header("refresh:0;url={$url}tnESH_SSO/login.php?sys_id={$sys_id}");
            exit;
        }
        return;
    }
    
    function accessDeniedAdmin($sys_id){
        if(!isset($_SESSION)){                                              // 確認session是否啟動
            session_start();
        }
        if(!isset($_SESSION["AUTH"]) || !isset($_SESSION[$sys_id]) || $_SESSION[$sys_id]["role"] == "" || $_SESSION[$sys_id]["role"] >= "2"){
            header('location:../');
            exit;
        }
        return;
    }

?>