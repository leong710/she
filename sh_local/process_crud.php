<?php
    require_once("../pdo.php");
    require_once("function.php");

    $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁

    $swal_json = array();

    switch($_REQUEST["action"]){
        case "create":           // 開新表單
            $swal_json = store_shLocal($_REQUEST);  break;

        case "edit":             // 編輯更新
            $swal_json = update_shLocal($_REQUEST); break;

        case "delete":          // 刪除
            $swal_json = delete_shLocal($_REQUEST); break;

        default:                    // 預定失效 
            $swal_json = warningCRUD($_REQUEST);
    }

    $swal_json["notify"] = isset($_REQUEST["notify"]) ? true : false;
?>
<?php include("../template/header.php"); ?>
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
    <div class="col-12" id="process">prccess post...<br></div>
    
    <?php 
        echo "<pre>";
        print_r($_REQUEST);
        echo "</pre>";
    ?>

</body>

<script>    
    
    const swal_json = <?=json_encode($swal_json)?>;                 // 引入swal_json值
    const url       = 'index.php';

    // 20240314 配合await將swal外移
    function show_swal_fun(){
        if(swal_json.length != 0){
            $("body").mLoading("hide");
            if(swal_json['action'] == 'success'){
                // swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action'], {buttons: false, timer:2000}).then(()=>{location.href = url});     // n秒后回首頁
                // swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action'], {buttons: false, timer:2000}).then(()=>{closeWindow()});           // 秒自動關閉畫面
                swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action']).then(()=>{closeWindow(true)});        // 秒自動關閉畫面
            } else { // warning、error
                swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action']).then(()=>{history.back()});     // 手動回上頁
            }
        }else{
            location.href = url;
        }
    }

// // 主技能--發報用 be await
    // 2024/07/23 notify_process()整理訊息、發送、顯示發送結果。
    async function notify_process(){
        mloading("show");       // 啟用mLoading
        show_swal_fun();        // 调用 show_swal_fun
    }

    $(document).ready(function () {
        notify_process();
    })

</script>