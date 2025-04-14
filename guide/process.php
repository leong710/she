<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("function.php");
    require_once("../user_info.php");
    accessDeniedAdmin($sys_id);
    extract($_REQUEST);
    
    $swal_json = array();
    // 複製本頁網址藥用
    $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁

    // CRUD
        if(isset($_POST)){
            // 新增
            if(isset($_POST["submit__guide"])){
                $action = "submit_guide";
                $swal_json = store_guide($_REQUEST); 
            }  
            // 更新
            if(isset($_POST["update__guide"])){ 
                $action = "update_guide";
                $swal_json = update_guide($_REQUEST);
             } 
             // 刪除
            if(isset($_POST["delete__guide"])){ 
                $action = "delete_guide";
                $swal_json = delete_guide($_REQUEST);
            } 
            
        }else{
            $action = "null function";
            $swal_json = array(                                 // for swal_json
                "fun"     => "_guide",
                "content" => "process處理--",
                "action"  => "error",
                "content" => '$_POST參數錯誤'
            );
        }
    // 調整flag ==> 20230712改用AJAX

?>
<?php include("../template/header.php"); ?>
<head>
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>    <!-- Jquery -->
    <script src="../../libs/sweetalert/sweetalert.min.js"></script>                         <!-- 引入 SweetAlert -->
    <script src="../../libs/jquery/jquery.mloading.js"></script>                            <!-- mloading JS 1/3 -->
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">                    <!-- mloading CSS 2/3 -->
    <script src="../../libs/jquery/mloading_init.js"></script>                              <!-- mLoading_init.js 3/3 -->
    <style>
        body{
            color: white;
        }
    </style>
</head>

<body>
    <div class="col-12">
        <snap><?php echo !empty($action) ? $action : '[process]'; ?> ...</snap>
    </div>
</body>

<script>    
    
    var swal_json = <?=json_encode($swal_json)?>;                   // 引入swal_json值
    var url       = '<?=$up_href?>';

    $(document).ready(function () {
        if(swal_json.length != 0){
            // history.back();
                // location.href = this.url;
                // swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action'], {buttons: false, timer:3000});         // 3秒
                // swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action']).then(()=>{window.close();});           // 關閉畫面
            if(swal_json['action'] == 'success'){
                swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action'], {buttons: false, timer:1000}).then(()=>{ location.href = url }); // 秒自動關閉畫面
            }else if(swal_json['action'] == 'error'){
                swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action']).then(()=>{history.back()});          // 手動關閉畫面
            }
        }else{
            location.href = url;
        }
    })
    
</script>




