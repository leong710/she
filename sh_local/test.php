<?php
    require_once("../pdo.php");
    require_once("function.php");

            // $row_3 = "作業";
            // $row_4 = "95";
            // $row_5 = "";

            // // 檢查HE_CATE是否含"噪音作業"，必須填AVG_VAL或AVG_8HR
            // // $noise_check = ((strpos($row_3,"噪音")) && ($row_4 || $row_5)) ? "true" : "false" ;
            // // $noise_check = ((preg_match("/噪音/i",$row_3)) && ($row_4 || $row_5)) ? "true" : "false" ;

            // if(preg_match("/噪音/i",$row_3)){
            //     $noise_check = ($row_4 || $row_5) ? "true" : "false" ;
            // }else{
            //     $noise_check = "true";
            // }


            
            // echo "row_3：".$row_3."<br>";
            // echo "row_4：".$row_4."<br>";
            // echo "row_5：".$row_5."<br>";
            // echo "noise_check：".$noise_check."<br>";
            // echo "preg_match：".(preg_match("/噪音/i",$row_3))."<br>";


    $query_arr = [                          // 打包問項
        "OSHORT"      => "9T042501",        // 部門代號
        "HE_CATE_str" => "銦,鎳,游離輻射,噪音",       // 特作
    ];

    $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁
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
        $swal_json = array();

        // switch($_REQUEST["action"]){
        //     case "create":              // 開新表單
        //         $swal_json = store_shLocal($_REQUEST);  break;
    
        //     case "edit":                // 編輯更新
        //         $swal_json = update_shLocal($_REQUEST); break;
    
        //     case "delete":              // 刪除
        //         $swal_json = delete_shLocal($_REQUEST); break;
    
        //     default:                    // 預定失效 
        //         $swal_json = warningCRUD($_REQUEST);
        // }
        
      
        
        $swal_json["notify"] = isset($_REQUEST["notify"]) ? true : false;
        check_HE_CATE($query_arr);
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
                // swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action']).then(()=>{closeWindow(true)});        // 秒自動關閉畫面
                swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action'], {buttons: false, timer:2000}).then(()=>{closeWindow(true)});           // 秒自動關閉畫面
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