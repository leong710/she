<?php
    if(!isset($_SESSION)){                                              // 確認session是否啟動
        session_start();
    }
    if(isset($_REQUEST)){
        $sys_id = $_REQUEST["sys_id"] ?? '';
        $role   = $_REQUEST["role"] ?? '';
    }

    if(empty($sys_id) || !isset($role)){
        echo "兄弟...沒有任何參數...請確認!!";

    } else {
        if(isset($_SESSION[$sys_id])){
            if($_SESSION[$sys_id]["role"] == $role ){
                echo "兄弟...你的session[{$sys_id}][role]都是 {$role} ... 沒有變動...請確認!!";
            }else{
                $pre_role = $_SESSION[$sys_id]["role"];
                $_SESSION[$sys_id]["role"] = $role;
                echo "兄弟...你的session[{$sys_id}][role]由 {$pre_role} 變更成 {$role} ... 變動完成!!";
            }
            echo "<hr><pre>";
            print_r($_SESSION[$sys_id]);
            echo "</pre>";

        }else{
            echo "兄弟...你的session沒有 {$sys_id}...請確認!!";
        }
    }
?>
<body>
    <hr>
    241108 $sys_role 鹹魚改運系統：<button type="button" class="main-btn btn" onclick="history.back()">回上頁</button>
</body>
