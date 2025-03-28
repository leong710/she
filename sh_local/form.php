<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("function.php");
    accessDenied($sys_id);

    // 複製本頁網址藥用
    $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : "http://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁
    $action  = (isset($_REQUEST["action"]))      ? $_REQUEST["action"]      : "create";   // 有action就帶action，沒有action就新開單
    $id      = (isset($_REQUEST["id"]))          ? $_REQUEST["id"]          : "";
    
    // 決定表單開啟方式
    if(!empty($id)){
        $shLocal_row = edit_shLocal(["id" => $id]);
        if(empty($shLocal_row)){
            echo "<script>alert('id-error：{$id}')</script>";
            header("refresh:0;url=index.php");
            return;
        }
    }else{
        $shLocal_row = array( "id" => "" );      // 預設shLocal_row[uuid]=空array
    }

    $fabs   = show_fab_lists();                     // load fab list for select item 
    // load 作業類別json
    $he_cate_file = "../sh_local/he_cate.json";
    if(file_exists($he_cate_file)){
        $he_cate_json = file_get_contents($he_cate_file);              // 从 JSON 文件加载内容
        $he_cate_json = (array) json_decode($he_cate_json, true);     // 解析 JSON 数据并将其存储在 $form_a_json 变量中 // 如果您想将JSON解析为关联数组，请传入 true，否则将解析为对象
    }else{
        $he_cate_json = [];
    }

    // 
    // $let_btn_s = '<button type="button" class="btn ';
    // $let_btn_m = '" data-bs-toggle="modal" data-bs-target="#saveSubmit" value="';
    // $let_btn_e = '" onclick="saveSubmit_modal(this.value, this.innerHTML);">';
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
    </style>
</head>

<body>
    <div class="col-12">
        <div class="row justify-content-center">
            <div class="col-12 col-md-11 col-lg-10 border rounded" style="background-color: #D4D4D4;" id="form_top">
                <!-- 表頭1 -->
                <div class="row px-1">
                    <div class="col-6 col-md-6 py-0" id="home_title">
                        <h3><i class="fa-solid fa-list-check"></i>&nbsp;<b><snap id="form_title">特殊危害健康作業</snap></b><?php echo empty($action) ? "":" - ".$action;?></h3>
                    </div>
                    <div class="col-6 col-md-6 py-0 text-end head_btn">
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#saveSubmit" onclick="saveSubmit_modal(this.innerHTML);">儲存 (Save)</button> 
                        <button type="button" class="btn btn-secondary" onclick="return confirm('確認返回？') && closeWindow()"><i class="fa fa-external-link" aria-hidden="true"></i>&nbsp回上頁</button>
                    </div>
                </div>
                <!-- 表頭2 -->
                <div class="row px-1">
                    <div class="col-12 col-md-8 py-1">
                        存檔編號：<?php echo ($action == 'create' || !isset($shLocal_row['id'])) ? "(尚未給號)": "aid_".$shLocal_row['id']; ?></br>
                        開單日期：<?php echo ($action == 'create' || !isset($shLocal_row['created_at'])) ? date('Y-m-d H:i')."&nbsp;(以送出時間為主)" : $shLocal_row['created_at'] ." / 更新：".$shLocal_row['updated_at'] ; ?></br>
                        建檔人員：<?php echo ($action == 'create' || !isset($shLocal_row['id'])) ? $auth_cname : $shLocal_row["updated_cname"];?>
                    </div>
                    <div class="col-12 col-md-4 py-1 text-end head_btn"  >
                        <span id="delete_btn">
                            <?php if( ($action != "create") && ( (($sys_role <= 3 ) && (isset($shLocal_row['flag']) && $shLocal_row['flag'] == "Off")) || ($sys_role == 1 )) ){ ?>
                                <form action="process_crud.php" method="post">
                                    <input  type="hidden" name="action"         value="delete">
                                    <input  type="hidden" name="id"             value="<?php echo $shLocal_row["id"];?>">
                                    <button type="submit" name="delete_shLocal" title="刪除特殊危害健康作業" class="btn btn-danger" onclick="return confirm(`確認徹底刪除此單？`)"><i class="fa-regular fa-trash-can"></i> 刪除</button>
                                </form>
                            <?php } ?>
                        </span>
                    </div>
                </div>
    
                <!-- container -->
                <div class="col-12 px-1 py-1">
                    <!-- 內頁 -->
                    <form action="process_crud.php" method="post" enctype="multipart/form-data" onsubmit="this.cname.disabled=false;" id="mainForm">
                        <div class="row rounded bg-light py-1" id="form_container">
                            <div class="col-12 p-3 ">

                                <span class="from-label"><b>廠區資訊：</b></span><br>
                                <div class="col-12 p-3 border rounded bg-white">
                                    <div class="row">
                                        <!-- line a1 -->
                                        <div class="col-6 col-md-6 py-0">
                                            <div class="form-floating">
                                                <select name="OSTEXT_30" id="OSTEXT_30" class="form-select" required>
                                                    <option value="" hidden>-- [請選擇 棟別] --</option>
                                                    <?php foreach($fabs as $fab){ 
                                                        echo "<option value='{$fab["fab_title"]}' title='{$fab["fab_title"]}' ".($fab["flag"] == "Off" ? "disabled":"" ).">";
                                                        echo "{$fab["id"]}：{$fab["site_title"]}&nbsp{$fab["fab_title"]}&nbsp({$fab["fab_remark"]})".($fab["flag"] == "Off" ? "&nbsp(已關閉)":"")."</option>";
                                                    } ?>
                                                </select>
                                                <label for="OSTEXT_30" class="form-label">OSTEXT_30/棟別：<sup class="text-danger"> *</sup></label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-6 py-0">
                                            <snap class="border rounded p-3 inf" >
                                                <div class="pr-3">flag/顯示開關：</div>
                                                <div class="form-check px-3">
                                                    <input type="radio" name="flag" id="flag_On" class="form-check-input" value="On" checked>
                                                    <label for="flag_On" class="form-check-label">On</label>
                                                </div>&nbsp;
                                                <div class="form-check px-3">
                                                    <input type="radio" name="flag" id="flag_Off" class="form-check-input" value="Off" >
                                                    <label for="flag_Off" class="form-check-label">Off</label>
                                                </div>&nbsp;
                                            </snap>
                                        </div>
                                        
                                        <!-- line a2 -->
                                        <div class="col-6 col-md-6 pb-0">
                                            <div class="form-floating input-group">
                                                <input type="text" name="OSHORT" id="OSHORT" class="form-control mb-0" data-toggle="tooltip" data-placement="bottom" title="請輸入部門代號" required >
                                                <label for="OSHORT" class="form-label">OSHORT/部門代號：<sup class="text-danger"> *</sup></label>
                                                <button type="button" class="btn btn-outline-primary" onclick="search_fun('showSignCode')"><i class="fa-solid fa-magnifying-glass"></i> 搜尋</button>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-6 pb-0">
                                            <div class="form-floating">
                                                <input type="text" name="OSTEXT" id="OSTEXT" class="form-control" require >
                                                <label for="OSTEXT" class="form-label">OSTEXT/部門名稱：<sup class="text-danger"> *</sup></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr>

                                <span class="from-label"><b>作業資訊：</b></span><br>
                                <div class="col-12 p-3 border rounded bg-white">
                                    <div class="row">
                                        <!-- line b1 -->
                                        <div class="col-12 pt-1 pb-3">
                                            <label for="HE_CATE" class="form-label">HE_CATE/類別：<sup class="text-danger"> *</sup></label>
                                            <div id="HE_CATE" class="border rounded p-3 inf form-control is-invalid" >
                                                <?php foreach($he_cate_json as $key => $he_cate){
                                                        echo "<div class='form-check px-3'>";
                                                        echo "<input type='checkbox' name='HE_CATE[{$key}]' id='HE_CATE_{$key}' value='{$he_cate}' data-key='{$key}' class='form-check-input' required>";
                                                        echo "<label for='HE_CATE_{$key}' class='form-check-label'>{$he_cate}</label></div>&nbsp;";
                                                    } ?>
                                            </div>
                                            <div class='invalid-feedback py-0' id='HE_CATE_feedback'>* 需勾選一項危害類別 !! </div>
                                        </div>
    
                                        <!-- line b2 -->
                                        <div class="col-6 col-md-6 py-1">
                                            <div class="form-floating">
                                                <input type="text" name="MONIT_NO" id="MONIT_NO" class="form-control" placeholder required>
                                                <label for="MONIT_NO" class="form-label">MONIT_NO/監測編號：<sup class="text-danger"> *</sup></label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-6 py-1">
                                            <div class="form-floating">
                                                <input type="text" name="MONIT_LOCAL" id="MONIT_LOCAL" class="form-control" maxlength="10" placeholder required>
                                                <label for="MONIT_LOCAL" class="form-label">MONIT_LOCAL/監測處所：<sup class="text-danger"> * (限10字)</sup></label>
                                            </div>
                                        </div>
                                        
                                        <!-- line b3 -->
                                        <div class="col-12 py-1">
                                            <div class="form-floating">
                                                <input type="text" name="WORK_DESC" id="WORK_DESC" class="form-control" maxlength="20" placeholder required></input>
                                                <label for="WORK_DESC" class="form-label">WORK_DESC/作業描述：<sup class="text-danger"> * (限20字)</sup></label>
                                            </div>
                                        </div>
                                        
                                        <!-- line b4 -->
                                        <div class="col-6 col-md-6 py-1">
                                            <div class="form-floating">
                                                <input type="text" name="AVG_VOL" id="AVG_VOL" class="form-control" placeholder  >
                                                <label for="AVG_VOL" class="form-label">AVG_VOL/均能音量：<sup class="text-danger"> --</sup></label>
                                                <div class="invalid-feedback" id="AVG_VOL_feedback">* 音量、音壓二擇一填寫 ~ </div>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-6 py-1">
                                            <div class="form-floating">
                                                <input type="text" name="AVG_8HR" id="AVG_8HR" class="form-control" placeholder  >
                                                <label for="AVG_8HR" class="form-label">AVG_8HR/工作日8小時平均音壓值：<sup class="text-danger"> --</sup></label>
                                                <div class="invalid-feedback" id="AVG_8HR_feedback">* 音量、音壓二擇一填寫 ~ </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="row">
                                        <div class="col-12 col-md-6">
                                            <?php if($action != "edit"){ ?>
                                                <button type="reset" class="btn btn-outline-secondary add_btn" onclick="remove_invalid()">Reset</button> 
                                            <?php } ?>
                                        </div>
                                        <div class="col-12 col-md-6 text-end">
                                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#saveSubmit" onclick="saveSubmit_modal(this.innerHTML);">儲存 (Save)</button> 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 模組 saveSubmit-->
                        <div class="modal fade" id="saveSubmit" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                <div class="modal-content">
                                    <div class="modal-header rounded p-3 m-2 text-white">
                                        <h5 class="modal-title">Do you want to <span id="modal_action"></span> this Case</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <!-- <div class="modal-body"> </div> -->
                                    <div class="modal-footer">
                                        <input type="hidden"  name="id"              id="id"              value="<?php echo $shLocal_row["id"];?>">
                                        <input type="hidden"  name="updated_cname"   id="updated_cname"   value="<?php echo $auth_cname;?>">
                                        <input type="hidden"  name="action"          id="action"          value="<?php echo $action;?>">
                                        <snap id="submit_action">
                                            <?php if($sys_role <= 3){ ?>
                                                <button type="submit" name="submit_shLocal" class="btn btn-primary" id="submitBtn" value="Submit" ><i class="fa fa-paper-plane" aria-hidden="true"></i> 送出 (Submit)</button>
                                            <?php } ?>
                                        </snap>
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
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
    <!-- 彈出畫面-查詢user模組 -->
    <div class="modal fade" id="searchModal" aria-hidden="true" aria-labelledby="searchModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">

                <div class="modal-header bg-warning  border rounded p-3 m-2">
                    <h5 class="modal-title"><i class="fa-solid fa-circle-info"></i>&nbsp;search & append dept</h5>
                    <button type="button" class="btn-close border rounded mx-1" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body P-3">
                    <!-- 第三排的功能 : 放查詢結果-->
                    <div class="result" id="result">
                        <table id="result_table" class="table table-striped table-hover"></table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">返回</button>
                </div>
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
    const action = '<?=$action?>';
    const id     = '<?=$id?>';
    const searchModal = new bootstrap.Modal(document.getElementById('searchModal'), { keyboard: false });
    const uuid   = 'e65fccd1-79e7-11ee-92f1-1c697a98a75f';   // nurse

    const userInfo = {
            'role'     : '<?=$sys_role?>',
            'BTRTL'    : ('<?=$sys_BTRTL?>').split(','),     // 人事子範圍-建物代號
            'empId'    : '<?=$auth_emp_id?>',
            'cname'    : '<?=$auth_cname?>',
            'signCode' : '<?=$auth_sign_code?>'
        };

</script>
<script src="form.js?v=<?=time()?>"></script>

<?php include("../template/footer.php"); ?>