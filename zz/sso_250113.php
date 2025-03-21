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
                $pdo = pdo();
                // $sql = "SELECT u.* FROM _users u WHERE u.user = ? ";
                $sql = "SELECT u.*, GROUP_CONCAT(f.BTRTL SEPARATOR ',') AS BTRTL
                        FROM `_users` u
                        LEFT JOIN `_fab` f ON FIND_IN_SET(u.emp_id, f.pm_emp_id) > 0
                        WHERE u.user = ? 
                        GROUP BY u.emp_id;";
                $stmt = $pdo -> prepare($sql);
                $stmt -> execute([$user]);
                $sys_local_row = $stmt -> fetch(PDO::FETCH_ASSOC);
    
                if($sys_local_row){                                         // 有sys_id的人員權限資料
                    if($sys_local_row["role"] != ""){                       // 權限沒被禁用
                        $_SESSION[$sys_id] = $sys_local_row;                // 導入$sys_id指定權限

                    }else{                                                  // 權限被禁用
                        echo "<script>alert('{$sys_local_row["cname"]} Local帳號停用，請洽管理員')</script>";
                    }
                }else{                                                      // 沒有sys_id的人員權限資料
                    // echo "<script>alert('{$user} local無資料，請洽管理員')</script>";
                    // header("location:../auth/register.php?user=$user");     // 沒有local資料，帶入註冊頁面

                    // 20240527_確認是否是環安處成員~
                    $user = strtoupper($_SESSION["AUTH"]["user"]);  // strtoupper(大寫)
                    $pdo = pdo_hrdb();
                    $sql = "SELECT s.*, d.plant AS plant
                            FROM [dbo].[STAFF] AS s
                            LEFT JOIN [dbo].[DEPT] AS d ON s.dept_no = d.sign_code
                            WHERE s.[user] = ? ";
                    $stmt = $pdo -> prepare($sql);
                    $stmt -> execute([$user]);
                    $esh_mb = $stmt -> fetch(PDO::FETCH_ASSOC);
                    $_SESSION[$sys_id]["role"]  = !empty($esh_mb["plant"]) ? 2.5 : 3;      // 2.5 = tnESH_user    // 3 = 外部user  
                    $_SESSION[$sys_id]["BTRTL"] = $esh_mb["BTRTL"] ?? null;
                    return;
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