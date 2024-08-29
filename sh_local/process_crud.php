<?php
    require_once("../pdo.php");
    require_once("function.php");
    include("../template/header.php");

    $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁
    $swal_json = array();
    // $swal_json["notify"] = isset($_REQUEST["notify"]) ? true : false;

    function do_check($request){
        extract($request);
        $query_arr = [                                  // 打包問項
            "OSHORT"      => trim($OSHORT),             // 部門代號
            "HE_CATE_str" => json_encode($HE_CATE, JSON_UNESCAPED_UNICODE)       // 特作
        ];
        return check_HE_CATE($query_arr);                      // 比對提醒~
    }

?>
<head>
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>    <!-- Jquery -->
    <script src="../../libs/sweetalert/sweetalert.min.js"></script>                         <!-- 引入 SweetAlert -->
    <script src="../../libs/jquery/jquery.mloading.js"></script>                            <!-- mloading JS 1/3 -->
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">                    <!-- mloading CSS 2/3 -->
    <script src="../../libs/jquery/mloading_init.js"></script>                              <!-- mLoading_init.js 3/3 -->
    <script src="../../libs/openUrl/openUrl.js"></script>                                   <!-- 彈出子畫面 -->
    <style>
        body{
            color: white;
        }
    </style>
</head>
<body>
    <div class="col-12" id="process">prccess issue...<br></div>
    <?php
        switch($_REQUEST["action"]){
            case "create":              // 開新表單
                $swal_json[] = do_check($_REQUEST);
                $swal_json[] = store_shLocal($_REQUEST);  break;
    
            case "edit":                // 編輯更新
                $swal_json[] = do_check($_REQUEST);
                $swal_json[] = update_shLocal($_REQUEST); break;
    
            case "delete":              // 刪除
                $swal_json[] = delete_shLocal($_REQUEST); break;
    
            default:                    // 預定失效 
                $swal_json[] = warningCRUD($_REQUEST);
        }
    ?>
</body>

<script>    
    
    const swal_json = <?=json_encode($swal_json)?>;                 // 引入swal_json值
    const url       = 'index.php';

    // 20240314 配合await將swal外移
    function show_swal_fun(swal_value){
        return new Promise((resolve) => {  
            $("body").mLoading("hide");
            if(swal_value && swal_value['fun'] && swal_value['content'] && swal_value['action']){
                if(swal_value['action'] == 'success'){
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.href = url});     // n秒后回首頁
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{closeWindow(true)});        // 手動關閉畫面
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{closeWindow(true); resolve();});  // 2秒自動關閉畫面; 載入成功，resolve
                
                } else if(swal_value['action'] == 'warning' || swal_value['action'] == 'info'){   // warning、info
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{resolve();}); // 載入成功，resolve
                
                } else {                                        // error
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{history.back();resolve();}); // 手動回上頁; 載入成功，resolve
                }
            }else{
                console.error("Invalid swal_value:", swal_value);
                location.href = url;
                resolve(); // 異常情況下也需要resolve
            }
        });
    }

// // 主技能--alert使用await
    async function notify_process(){
        mloading("show");             // 啟用mLoading
        if(swal_json.length != 0){
            for (const value_i of swal_json) {
                if(value_i.length != 0){
                    await show_swal_fun(value_i);        // 调用 show_swal_fun
                } else {
                    console.error("Value is empty or undefined", value_i);
                }
            }
        }
    }

    $(document).ready(function () {
        notify_process();
    })

</script>