<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("function.php");
    accessDenied($sys_id);

    // 複製本頁網址藥用
    $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : "http://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁
    $action  = (isset($_REQUEST["action"]))      ? $_REQUEST["action"]      : "create";   // 有action就帶action，沒有action就新開單
    
    // load 作業類別json
    $workTarget_arr = load_workTarget('');

?>

<?php include("../template/header.php"); ?>
<!-- <php include("../template/nav.php"); ?> -->
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
        .w50 {
            width: 50% !important; 
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
                        <h3><i class="fa-regular fa-calendar-check"></i>&nbsp;<b><snap id="form_title">指定作業年度</snap></b><?php echo empty($action) ? "":" - ".$action;?></h3>
                    </div>
                    <div class="col-6 col-md-6 py-0 text-end head_btn">
                        <button type="button" class="btn btn-primary" id="append_submit" >儲存 (Save)</button> 
                        <button type="button" class="btn btn-secondary" onclick="return confirm('確認返回？') && closeWindow()"><i class="fa fa-external-link" aria-hidden="true"></i>&nbsp回上頁</button>
                    </div>
                </div>
    
                <!-- container -->
                <div class="row">
                    <!-- 編輯新年度 -->
                    <div class="col-6 col-md-6 p-3 ">
                        <span class="from-label"><b>編輯新年度：</b></span><br>
                        <div class="col-12 p-3 border rounded bg-light" id="workTarget">
                            <?php foreach($workTarget_arr as $key => $wt){
                                    echo "<div class='input-group p-1' id='workTarget_{$key}' >";
                                    echo "<snap class='form-control mb-0 text-center' >{$key}</snap>";
                                    echo "<snap class='form-control mb-0 w50' >{$wt}</snap>";
                                    echo $sys_role <= 1 ? "<button type='delete' class='btn btn-outline-danger' name='workTarget_{$key}' value='{$key}' title='刪除' >&nbsp;<i class='fa-solid fa-xmark'></i>&nbsp;</button>":"";
                                    echo "</div>";
                                } ?>
                        </div>

                    </div>
                    <!-- 舊年度參考 -->
                    <div class="col-6 col-md-6 p-3 ">
                        <span class="from-label"><b>舊年度參考：</b></span><br>
                        <div class="col-12 p-3 border rounded bg-light">
                            <?php 
                                foreach($workTarget_arr as $key => $key_value){
                                    if(in_array(gettype($key_value), ['array', 'object'])){
                                        $key_value = (array) $key_value;
                                        echo "<li>{$key}：<ul>";
                                        foreach($key_value as $k => $k_v){
                                            echo "<li>{$k}：{$k_v}</li>";
                                        }
                                        echo "</ul></li>";
                                    }else{
                                        echo "<li>{$key}：{$key_value}</li>";
                                    }
                                };
                                echo "<snap name='workTarget_json' id='workTarget_json' class='t-left unblock' style='font-size: 12px;'>".json_encode($workTarget_arr)."</snap>";
                            ?>
                        </div>
                        <!-- 添加 -->
                        <div class="input-group p-3 my-2 bg-info rounded" id="workTarget_append">
                            <input type="text" id="append_key"   placeholder="key" class="form-control mb-0 text-center" value="_year">
                            <input type="text" id="append_value" placeholder="年度" class="form-control mb-0 w50" >
                            <button type="append" class="btn btn-outline-secondary" value="append" data-toggle="tooltip" data-placement="bottom" title="添加">&nbsp;<i class="fa-solid fa-plus"></i>&nbsp;</button>
                        </div>
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
    // init
                
</script>
<script src="workTarget.js?v=<?=time()?>"></script>

<?php include("../template/footer.php"); ?>