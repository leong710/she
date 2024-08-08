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
    // $locals = show_local_lists();                   // load local list for select item 
    // load doc form
    $he_cate_file = "../sh_local/he_cate.json";
    // load doc form
    if(file_exists($he_cate_file)){
        $he_cate_json = file_get_contents($he_cate_file);              // 从 JSON 文件加载内容
        $he_cate_json = (array) json_decode($he_cate_json, true);     // 解析 JSON 数据并将其存储在 $form_a_json 变量中 // 如果您想将JSON解析为关联数组，请传入 true，否则将解析为对象
    }else{
        $he_cate_json = [];
    }

    // 
    $let_btn_s = '<button type="button" class="btn ';
    $let_btn_m = '" data-bs-toggle="modal" data-bs-target="#saveSubmit" value="';
    $let_btn_e = '" onclick="saveSubmit_modal(this.value, this.innerHTML);">';
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
        /* #emp_id, #excelFile{    
            margin-bottom: 0px;
            text-align: center;
        } */
        .a_pic {
            width: 150px; 
            height: auto; 
            text-align: center;
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
        #session-group {
            position: sticky;
            top: 0;
            z-index: 1;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 增加陰影以更明顯地看到效果 */
        }
        .list-group-item{
            padding: .5rem 1rem;
            /* word-wrap: break-word; */
            white-space: nowrap;            /* 防止自動換行 */
            overflow: hidden;               /* 確保溢出的文字被截斷並顯示省 */
            text-overflow: ellipsis;
        }
        @media print {
            body * {
                visibility: hidden;
            }
            #form_top, #form_top * {
                visibility: visible;
            }
            #form_top {
                position: absolute;
                left : 0;
                top  : 0;
                width: 100%;
            }
            /* 設置紙張大小為 A4 */
            @page {
                size  : A3;
                margin: 10mm; /* 設置頁面邊距 */
            }
        }
        .confirm_sign_div {
            height: 200px; 
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            position: relative;
        }

        .confirm_sign_div::after {
            content: '';
            display: block;
            width: 100%;
            border-top: 1px solid #000;
            margin-top: 10px;
        }
        /* inline */
        .inb {
            display: inline-block;
            /* margin-right: 10px; */
        }
        .inf {
            display: inline-flex;
            align-items: center;
            width: 100%; /* 让父容器占满整个单元格 */
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
                        <h3><i class="fa-solid fa-list-check"></i>&nbsp;<b><snap id="form_title">通用表單Form</snap></b><?php echo empty($action) ? "":" - ".$action;?></h3>
                    </div>
                    <div class="col-6 col-md-6 py-0 text-end head_btn">
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#saveSubmit" value="" onclick="saveSubmit_modal(this.value, this.innerHTML);">儲存 (Save)</button> 
                        <button type="button" class="btn btn-secondary" onclick="return confirm('確認返回？') && closeWindow()"><i class="fa fa-external-link" aria-hidden="true"></i>&nbsp回上頁</button>
                    </div>
                </div>
                <div class="row px-1">
                    <div class="col-12 col-md-6 py-1">
                        存檔編號：<?php echo ($action == 'create' || !isset($shLocal_row['id'])) ? "(尚未給號)": "aid_".$shLocal_row['id']; ?></br>
                        開單日期：<?php echo ($action == 'create' || !isset($shLocal_row['created_at'])) ? date('Y-m-d H:i')."&nbsp;(以送出時間為主)":$shLocal_row['created_at']; ?></br>
                        填單人員：<?php echo ($action == 'create' || !isset($shLocal_row['id'])) ? $auth_cname : $shLocal_row["created_cname"];?>
                    </div>
                    <div class="col-12 col-md-6 py-1 text-end head_btn"  >
                        <span id="pdf_name" class="unblock">
                            <?php echo isset($shLocal_row["fab_title"]) ? $shLocal_row["fab_title"]:""; echo isset($shLocal_row["short_name"]) ? "_".$shLocal_row["short_name"]:"";?></span>
                        <span id="delete_btn">
                            <?php if(($sys_role === 0 ) && (isset($shLocal_row['idty']) && $shLocal_row['idty'] != 0)){ ?>
                                <form action="process.php" method="post">
                                    <input  type="hidden" name="action"          value="delete">
                                    <input  type="hidden" name="id"              value="<?php echo $shLocal_row["id"];?>">
                                    <button type="submit" name="delete_shLocal" title="刪除申請單" class="btn btn-danger" onclick="return confirm(`確認徹底刪除此單？`)"><i class="fa-regular fa-trash-can"></i> 刪除</button>
                                </form>
                            <?php }else{
                                // 表單狀態：1送出 2退回 4編輯 5轉呈 6暫存
                                if($action !== 'create' && in_array($shLocal_row['idty'], [ 1, 2, 4, 5, 6 ])){ 
                                    echo $let_btn_s."bg-warning text-dark".$let_btn_m."3".$let_btn_e."作廢 (Abort)</button> ";
                                } 
                            } ?>
                        </span>
                    </div>
                </div>
    
                <!-- container -->
                <div class="col-12 px-1 py-1 scrollspy-example" data-bs-spy="scroll" data-bs-target="#session-group" data-bs-offset="0" tabindex="0" >
                    <!-- 內頁 -->
                    <form action="process.php" method="post" enctype="multipart/form-data" onsubmit="this.cname.disabled=false,this._odd.disabled=false" id="mainForm">
                        <div class="row rounded bg-light py-1" id="form_container">
                            <div class="col-12 p-3 ">
                                <span class="from-label"><b>表單分類：</b></span><br>
                                <div class="col-12 p-3 border rounded bg-white">
                                    <div class="row">
                                        <!-- line 0 -->
                                        <div class="col-6 col-md-6 py-0">
                                            <div class="form-floating">
                                                <select name="OSTEXT_30" id="OSTEXT_30" class="form-select" onchange="select_local(this.value)" required>
                                                    <option value="" hidden>-- [請選擇 棟別] --</option>
                                                    <?php foreach($fabs as $fab){ 
                                                        echo "<option value='{$fab["id"]}' title='{$fab["fab_title"]}' ".($fab["flag"] == "Off" ? "disabled":"" ).">";
                                                        echo "{$fab["id"]}：{$fab["site_title"]}&nbsp{$fab["fab_title"]}&nbsp({$fab["fab_remark"]})".($fab["flag"] == "Off" ? "&nbsp(已關閉)":"")."</option>";
                                                    } ?>
                                                </select>
                                                <label for="OSTEXT_30" class="form-label">OSTEXT_30/棟別：<sup class="text-danger"> *</sup></label>
                                            </div>
                                        </div>
                                                <div class="col-6 col-md-6 py-0">
                                                    <div class="form-floating">
                                                        <select name="local_id" id="local_id" class="form-select" required>
                                                            <option value="" hidden>-- [請選擇 廠別] --</option>

                                                        </select>
                                                        <label for="local_id" class="form-label">local_id/廠別：<sup class="text-danger"> * </sup></label>
                                                    </div>
                                                </div>

                                        <div class="col-6 col-md-6 pb-0">
                                            <div class="form-floating input-group">
                                                <input type="text" name="OSHORT" id="OSHORT" class="form-control mb-0" data-toggle="tooltip" data-placement="bottom" title="請輸入部門代號" required  onchange="search_fun('sign_code');">
                                                <label for="OSHORT" class="form-label">OSHORT/部門代號：<sup class="text-danger"> *</sup></label>
                                                <button type="button" class="btn btn-outline-primary" onclick="search_fun('sign_code')"><i class="fa-solid fa-magnifying-glass"></i> 搜尋</button>
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




                                <span class="from-label"><b>訪談摘要：</b></span><br>
                                <div class="col-12 p-3 border rounded bg-white">
                                    <div class="row">
                                        <!-- line 0 -->
                                        <div class="col-12">
                                            <label for="HE_CATE" class="form-label">HE_CATE/類別：<sup class="text-danger"> *</sup></label>
                                            <snap id="HE_CATE" class="border rounded p-3 inf" >
                                                <?php
                                                    foreach($he_cate_json as $key => $he_cate){
                                                        echo "<div class='form-check px-3'>";
                                                        echo "<input type='checkbox' name='HE_CATE[]' id='HE_CATE_{$key}' value='{$key}' class='form-check-input' >";
                                                        echo "<label for='HE_CATE_{$key}' class='form-check-label'>{$he_cate}</label></div>";
                                                    }
                                                ?>
                                            </snap>
                                        </div>
    
                                        <!-- line 1 -->
                                        <div class="col-6 col-md-6 py-0">
                                            <div class="form-floating">
                                                <input type="text" name="AVG_VOL" id="AVG_VOL" class="form-control" placeholder require >
                                                <label for="AVG_VOL" class="form-label">AVG_VOL/均能音量：<sup class="text-danger"> * </sup></label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-6 py-0">
                                            <div class="form-floating">
                                                <input type="text" name="AVG_8HR" id="AVG_8HR" class="form-control" placeholder require >
                                                <label for="AVG_8HR" class="form-label">AVG_8HR/工作日8小時平均音壓值：<sup class="text-danger"> * </sup></label>
                                            </div>
                                        </div>

                                        <!-- line 2 -->
                                        <div class="col-6 col-md-6 pb-0">
                                            <div class="form-floating">
                                                <input type="datetime-local" name="meeting_time" id="meeting_time" class="form-control" value="" require>
                                                <label for="meeting_time" class="form-label">meeting_time/會議時間：<sup class="text-danger"> * </sup></label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-6 pb-0">
                                            <div class="form-floating">
                                                <input type="text" name="meeting_local" id="meeting_local" class="form-control" placeholder="會議地點：" require >
                                                <label for="meeting_local" class="form-label">meeting_local/會議地點：<sup class="text-danger"> * </sup></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr>
                                <!-- line 3 -->
                                <span class="from-label"><b>與會人員：</b></span><br>
                                <div class="col-12 p-3 border rounded bg-white" id="selectUser">
                                    <div class="row">
                                        <!-- 第一排的功能 : 顯示已加入名單+input -->
                                        <div class="col-12 py-0">
                                            <div class="input-group py-1">
                                                <span class="input-group-text" style="width:25%;">事故當事者(或代理人)</span>
                                                <input type="hidden" id="meeting_man_a_select" name="meeting_man_a">
                                                <span type="text" id="meeting_man_a_show" class="form-control mb-0" ></span>
                                                <button type="button" class="btn btn-outline-secondary search_btn" id="meeting_man_a" data-bs-target="#searchUser" data-bs-toggle="modal" >&nbsp<i class="fa fa-plus"></i>&nbsp</button>
                                            </div>
    
                                            <div class="input-group py-1">
                                                <span class="input-group-text" style="width:25%;">其他與會人員/勞工代表</span>
                                                <input type="hidden" id="meeting_man_o_select" name="meeting_man_o">
                                                <span type="text" id="meeting_man_o_show" class="form-control mb-0" ></span>
                                                <button type="button" class="btn btn-outline-secondary search_btn" id="meeting_man_o" data-bs-target="#searchUser" data-bs-toggle="modal" >&nbsp<i class="fa fa-plus"></i>&nbsp</button>
                                            </div>
    
                                            <div class="input-group py-1">
                                                <span class="input-group-text" style="width:25%;">環安人員</span>
                                                <input type="hidden" id="meeting_man_s_select" name="meeting_man_s">
                                                <span type="text" id="meeting_man_s_show" class="form-control mb-0" ></span>
                                                <button type="button" class="btn btn-outline-secondary search_btn" id="meeting_man_s" data-bs-target="#searchUser" data-bs-toggle="modal" >&nbsp<i class="fa fa-plus"></i>&nbsp</button>
                                            </div>

                                            <div class="input-group py-1">
                                                <span class="input-group-text" style="width:25%;">其他與會人員 <sup class='text-danger'> (請用,分隔)</sup></span>
                                                <input type="text" id="meeting_man_d" name="meeting_man_d" class="form-control mb-0">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- <hr> -->
                            <div class="col-12 p-3 pt-0">
                                <div class="row">
                                    <div class="col-6 col-md-6 py-0 "><span class="from-label"><b>內容：</b></span></div>
                                    <div class="col-6 col-md-6 py-0 text-end"></div>
                                </div>
                                <div class="accordion" id="item_list" >
                                    <!-- append -->
                                </div>
                                 <div class="accordion unblock" id="confirm_sign">
                                    <!-- append 簽名欄 -->
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
                                    <div class="modal-body">
                                        <div class="row px-4" id="modal_body">
                                            <label for="sign_comm" class="form-label" >command：</label>
                                            <textarea name="sign_comm" id="sign_comm" class="form-control" rows="5"></textarea>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <input type="hidden"  name="created_emp_id"  id="created_emp_id"  value="<?php echo $auth_emp_id;?>">
                                        <input type="hidden"  name="created_cname"   id="created_cname"   value="<?php echo $auth_cname;?>">
                                        <input type="hidden"  name="action"          id="action"          value="<?php echo $action;?>">
                                        <input type="hidden"  name="step"            id="step"            value="1">
                                        <input type="hidden"  name="idty"            id="idty"            value="1">
                                        <input type="hidden"  name="uuid"            id="uuid"            value="">
                                        <input type="hidden"  name="dcc_no"          id="dcc_no"          value="">
                                        <input type="hidden"  name="_odd"            id="_odd"            value="">
                                        <input type="hidden"  name="omager"          id="omager"          value="">
                                        <snap id="submit_action">
                                            <?php if($sys_role <= 3){ ?>
                                                <button type="submit" value="Submit" name="submit_document" class="btn btn-primary" ><i class="fa fa-paper-plane" aria-hidden="true"></i> 送出 (Submit)</button>
                                            <?php } ?>
                                        </snap>
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                    <!-- 240709 row_json -->
                    <snap name="row_json" id="row_json" class="t-left block" style="font-size: 10px;"></snap>
                    <!-- 尾段logs訊息 -->
                    <div class="row rounded bg-light my-2 unblock" id="logs_div">
                        <div class="col-6 col-md-6 pb-0">
                            流程記錄：
                        </div>
                        <div class="col-6 col-md-6 pb-0 text-end">
                            <button type="button" id="logs_btn" class="op_tab_btn" value="logs" onclick="op_tab(this.value)" title="訊息收折"><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></button>
                        </div>
                        <div class="col-12 pt-1 px-4" id="logs_table">
                            <table class="for-table logs table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <th>Step</th>
                                        <th>Signer</th>
                                        <th>Time Signed</th>
                                        <th>Status</th>
                                        <th>Comment</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                        <div style="font-size: 12px;" class="text-end">
                            logs-end
                        </div>
                    </div>
                    <!-- 尾段Editions訊息 -->
                    <div class="row rounded bg-light my-2 unblock" id="editions_div">
                        <div class="col-6 col-md-6 pb-0">
                            編輯記錄：
                        </div>
                        <div class="col-6 col-md-6 pb-0 text-end">
                            <button type="button" id="editions_btn" class="op_tab_btn" value="editions" onclick="op_tab(this.value)" title="訊息收折"><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></button>
                        </div>
                        <div class="col-12 pt-1 px-4" id="editions_table">
                            <table class="for-table editions table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <th>Step</th>
                                        <th>Editor</th>
                                        <th>Time Edited</th>
                                        <th>Edit content</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                        <div style="font-size: 12px;" class="text-end">
                            editions-end
                        </div>
                    </div>
                </div>
                <div class="row" style="font-size: 12px;">
                    <div class="col-6 col-md-6 py-0">
                        <?php echo !empty($shLocal_row["dcc_no"]) ? $shLocal_row["dcc_no"]:""; ?>
                    </div>
                    <div class="col-6 col-md-6 py-0 text-end">
                        universalForm v0
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 彈出畫面-查詢user模組 -->
        <div class="modal fade" id="searchUser" aria-hidden="true" aria-labelledby="searchUser" tabindex="-1">
            <div class="modal-dialog modal-dialog-scrollable modal-xl">
                <div class="modal-content">

                    <div class="modal-header bg-warning  border rounded p-3 m-2">
                        <h5 class="modal-title"><i class="fa-solid fa-circle-info"></i>&nbspsearch & append User for&nbsp<span id="modal_title"></span></h5>
                        <button type="button" class="btn-close border rounded mx-1" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <div class="modal-body mx-2">
                        <div class="row">
                            <div class="col-12 border rounded p-3 " id="selectScomp_no">
                                <div class="row justify-content-center">
                                    <!-- 第一排的功能 : 顯示已加入名單+input -->
                                    <div class="col-12 px-4 py-0">
                                        <div id="selectScomp_noItem"></div>
                                        <input type="hidden" class="form-control" name="scomp_no[]" id="scomp_no" placeholder="已加入的">
                                    </div>
                                    <!-- 第二排的功能 : 搜尋功能 -->
                                    <div class="col-12 col-md-8 px-4">
                                        <div class="input-group search">
                                            <span class="input-group-text">查詢</span>
                                            <input type="text" class="form-control text-center mb-0" id="key_word" required placeholder="-- 工號 / 姓名 查詢 --" >
                                            <button type="button" class="btn btn-outline-success" onclick="resetMain()">清除</button>
                                            <button type="button" class="btn btn-outline-primary" onclick="search_fun()"><i class="fa-solid fa-magnifying-glass"></i> 搜尋</button>
                                        </div>
                                    </div>
                                    <!-- 第三排的功能 : 放查詢結果-->
                                    <div class="result" id="result">
                                        <table id="result_table" class="table table-striped table-hover"></table>
                                    </div>
                                </div>
                            </div>
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
<script src="../../libs/signature_pad/signature_pad.umd.min.js"></script>     <!-- 簽名板外掛 -->
<script src="../../libs/openUrl/openUrl.js"></script>       <!-- 彈出子畫面 -->
<!-- <script src="../../libs/moment/moment.min.js"></script> -->

<script>
    // init
    var action        = '<?=$action?>';
    var check_action  = ( action == 'review') ? true : false;
    var dcc_no        = '<?=$dcc_no?>';
    var uuid          = '<?=$uuid?>';
    var locals        = <?=json_encode($locals)?>;
    var meeting_man_a = [];                         // 事故當事者(或其委任代理人)
    var meeting_man_o = [];                         // 其他與會人員
    var meeting_man_s = [];                         // 環安人員
    var meeting_man_target;                         // 指向目標
    var negative_arr  = [];                         // 監聽負向選項
    var searchUser_modal = new bootstrap.Modal(document.getElementById('searchUser'), { keyboard: false });
    
</script>

<script src="form.js?v=<?=time()?>"></script>

<?php include("../template/footer.php"); ?>