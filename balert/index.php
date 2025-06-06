<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    accessDenied($sys_id);

    // 複製本頁網址藥用
    $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : "http://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁
    $action  = (isset($_REQUEST["action"]))      ? $_REQUEST["action"]      : "create";   // 有action就帶action，沒有action就新開單
    
    include("../template/header.php");
    include("../template/nav.php"); 
?>
<head>
    <link href="../../libs/aos/aos.css" rel="stylesheet">                                           <!-- goTop滾動畫面aos.css 1/4-->
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>            <!-- Jquery -->
    <script src="../../libs/sweetalert/sweetalert.min.js"></script>                                 <!-- 引入 SweetAlert 的 JS 套件 參考資料 https://w3c.hexschool.com/blog/13ef5369 -->
    <script src="../../libs/jquery/jquery.mloading.js"></script>                                    <!-- mloading JS 1/3 -->
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">                            <!-- mloading CSS 2/3 -->
    <script src="../../libs/jquery/mloading_init.js"></script>                                      <!-- mLoading_init.js 3/3 -->
    <style>
        body {
            position: relative;
        }
        .info {
            font-size: 14px;
            color: blue;
            text-shadow: 3px 3px 5px rgba(0,0,0,.3);
        }
        @keyframes fadeIn {
            from { opacity: 0;}
            to { opacity: 1;}
        }
        .unblock {
            opacity: 0;
            display: none;
            transition: opacity 1s;
            animation: none;
        }
        /* inline */
        .inb {
            display: inline-block;
            /* margin-right: 10px; */
        }
        .inf {
            display: inline-flex;
            align-items: center;
            width: 100%; 
        }
        .w70 {
            width: 70% !important; 
        }
    </style>
</head>

<body>
    <div class="col-12">
        <div class="row justify-content-center">
            <div class="col-12 col-md-11 col-lg-10 border rounded" style="background-color: #D4D4D4;" id="form_top">
                <!-- 表頭1 -->
                <div class="row p-1">
                    <div class="col-6 col-md-6 py-0" id="home_title">
                        <h3><i class="fa-solid fa-list-check"></i>&nbsp;<b><snap id="form_title">Balert橫幅訊息管理</snap></b><?php echo empty($action) ? "":" - ".$action;?></h3>
                    </div>
                    <div class="col-6 col-md-6 py-0 text-end head_btn">
                        <button type="button" class="btn btn-primary" id="append_submit" >儲存 (Save)</button> 
                    </div>
                </div>
                <!-- Bootstrap Alarm -->
                <div id="liveAlertPlaceholder" class="col-12 text-center m-0 p-0"></div>
                <!-- container -->
                <div class="row">
                    <!-- 添加 -->
                    <div class="col-12 py-0">
                        <div id="balert_append" class="input-group p-3 my-2 bg-info rounded">
                            <select name="_type" id="append_type" class="form-select" >
                                <option value="" hidden selected >-- 選擇 底色 --</option>
                                <?php $type_arr = ["primary","secondary","success","danger","warning","info","light","dark"];
                                    foreach($type_arr as $type_i){
                                        echo "<option for='_type' value='{$type_i}' class='alert-{$type_i}'>{$type_i}</option>";
                                    } ?>
                            </select>
                            <input type="text" id="append_value" placeholder="文字內容" class="form-control mb-0 w70" >
                            <button type="append" class="btn btn-outline-secondary" value="append" data-toggle="tooltip" data-placement="bottom" title="添加">&nbsp;<i class="fa-solid fa-plus"></i>&nbsp;</button>
                        </div>
                    </div>

                    <!-- 編輯新類別 -->
                    <div class="col-12 p-3 ">
                        <span class="from-label"><b>已存在之訊息：</b></span><br>
                        <div class="col-12 p-3 border rounded bg-light" id="balert">
                    </div>
                </div>
                <!-- 結尾敘述 -->
                <div class="row" style="font-size: 12px;">
                    <div class="col-6 col-md-6 py-0">
                    </div>
                    <div class="col-6 col-md-6 py-0 text-end">
                        universalForm v0
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- toast -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div id="liveToast" class="toast align-items-center" role="alert" aria-live="assertive" aria-atomic="true" autohide="true" delay="1000">
            <div class="d-flex">
                <div class="toast-body" id="toast-body">
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>
    <div id="gotop">
        <i class="fas fa-angle-up fa-2x"></i>
    </div>
</body>

<script src="../../libs/aos/aos.js"></script>               <!-- goTop滾動畫面jquery.min.js+aos.js 3/4-->
<script src="../../libs/aos/aos_init.js"></script>          <!-- goTop滾動畫面script.js 4/4-->
<script src="../../libs/openUrl/openUrl.js"></script>       <!-- 彈出子畫面 -->
<script>
    const userInfo = {
        'role'     : '<?=$sys_role?>',
        'BTRTL'    : ('<?=$sys_BTRTL?>').split(','),     // 人事子範圍-建物代號
        'empId'    : '<?=$auth_emp_id?>',
        'cname'    : '<?=$auth_cname?>',
        'signCode' : '<?=$auth_sign_code?>',
    }
</script>
<script src="balert.js"></script>

<?php include("../template/footer.php"); ?>