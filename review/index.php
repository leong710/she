<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("function.php");
    accessDenied($sys_id);

    // for return
    $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁

    // default fab_scope
        $fab_scope = ($sys_role <= 1 ) ? "All" : "allMy";               // All :allMy
    // tidy query condition：
        $OSHORT      = (isset($_REQUEST["OSHORT"]))      ? $_REQUEST["OSHORT"]      : "All";        // 部門代碼
        $flag        = (isset($_REQUEST["flag"]))        ? $_REQUEST["flag"]        : "All";        // 開關狀態
        $fab_title   = (isset($_REQUEST["fab_title"]))   ? $_REQUEST["fab_title"]   : $fab_scope;   // 問卷fab
    // tidy sign_code scope 
        $sfab_id_str     = get_coverFab_lists("str");   // get signCode的管理轄區
        $sfab_id_arr     = explode(',', $sfab_id_str);  // 將管理轄區字串轉陣列
    // merge quesy array
        $query_arr = array(
            'OSHORT'        => $OSHORT,
            'flag'          => $flag,
            'fab_title'     => $fab_title,
            'sfab_id'       => $sfab_id_str,
        );
    // get mainData = shLocal
        // $shLocals       = show_shLocal($query_arr);     // get case清單
        $shLocals       = [];     // get case清單
        $per_total      = count($shLocals);             // 計算總筆數
    // for select item
        $fab_lists      = show_fab_lists();             // get 廠區清單
        $OSHORT_lists   = show_OSHORT();                // get 部門代號

            $icon_s = '<i class="';
            $icon_e = ' fa-2x"></i>&nbsp&nbsp';


        // $shLocal_OSTEXT_30s = load_shLocal_OSTEXT30s();

        // ...
        $shLocal_OSHORTs = load_shLocal_OSHORTs();                                      // step1.取得特危健康場所部門代號
        $shLocal_OSHORTs_str = json_encode($shLocal_OSHORTs, JSON_UNESCAPED_UNICODE);   // step2.陣列轉字串
        $shLocal_OSHORTs_str = trim($shLocal_OSHORTs_str, '[]');                        // step3.去掉括號forMysql查詢

        // p1
        $staff_deptNos = load_staff_dept_nos();                                        // step1.取得存檔員工的部門代號
        $staff_deptNos_str = json_encode($staff_deptNos, JSON_UNESCAPED_UNICODE);     // step2.陣列轉字串
        $staff_deptNos_str = trim($staff_deptNos_str, '[]');                          // step3.去掉括號forMysql查詢

        // echo "<pre>";
        // print_r($staff_deptNos);
        // echo "</pre>";

    include("../template/header.php"); 
    include("../template/nav.php"); 

?>

<head>
    <link href="../../libs/aos/aos.css" rel="stylesheet">                                           <!-- goTop滾動畫面aos.css 1/4-->
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>            <!-- Jquery -->
        <link rel="stylesheet" type="text/css" href="../../libs/dataTables/jquery.dataTables.css">  <!-- dataTable參照 https://ithelp.ithome.com.tw/articles/10230169 --> <!-- data table CSS+JS -->
        <script type="text/javascript" charset="utf8" src="../../libs/dataTables/jquery.dataTables.js"></script>
        <script src="../../libs/dataTables/jquery.dataTables.min.js" referrerpolicy="no-referrer"></script> <!-- dataTable RWD JS -->
        <script src="../../libs/dataTables/dataTables.responsive.min.js" referrerpolicy="no-referrer"></script>
    <script src="../../libs/jquery/jquery.mloading.js"></script>                                    <!-- mloading JS 1/3 -->
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">                            <!-- mloading CSS 2/3 -->
    <script src="../../libs/jquery/mloading_init.js"></script>                                      <!-- mLoading_init.js 3/3 -->
    <style>
        /* 當螢幕寬度小於或等於 1366px時 */
        @media (max-width: 1366px) {
            .col-lm-3 {
                flex: 0 0 calc(100% / 12 * 3);
            }
        }
        /* 當螢幕寬度大於 1366px時 */
        @media (min-width: 1367px) {
            .col-lm-3 {
                flex: 0 0 calc(100% / 12 * 2);
            }
        }
        .body > ul {
            padding-left: 0px;
        }
        tr, td{
            text-align: start; 
        }
        /* 警示項目 amount、lot_num */
            .alert_itb {
                background-color: #FFBFFF;
                color: red;
                font-size: 1.2em;
            }
            .alert_it {
                background-color: #FFBFFF;
                color: red;
            }
        /* inline */
            .inb {
                display: inline-block;
            }
            .inf {
                display: inline-flex;
            }
        .h6 {
            font-size: 12px;
        }
        .HE_CATE:hover ,.shCondition:hover ,.yearHe:hover {
            background-color: #adff2f;
            transition: .5s;
            font-weight: bold;
            text-shadow: 3px 3px 5px rgba(0,0,0,.5);
        }
            .split-td {
                display: flex;
                flex-direction: column;
                /* 設定高度以顯示效果 */
                /* height: 100px; */
                height: 100%;
                padding: 0;
            }
            .top-half, .bottom-half {
                height: 50%;
                overflow: hidden;
                /* padding: calc(1 * var(--spacing)); */
                /* 平均分配空間 */
                /* flex: 1;  */
            }
            .bottom-half {
                background-color: #cceeff;
                border-radius: 4px;
                /* margin-top: calc(1 * var(--spacing)); */
                margin-top: 0;
                margin-bottom: 0;
            }
            /* 轉調欄位 */
            .change_ {      
                background-color: #FFBFFF;
                padding: calc(1 * var(--spacing));
                border-radius: 4px;
                height: 100%;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            }
            .btn {
                padding: 4px 4px;
            }
    </style>
</head>
<body>
    <div class="col-12">
        <div class="row justify-content-center">
            <div class="col_xl_11 col-12 rounded" style="background-color: rgba(255, 255, 255, .8);">
                <div class="col-12">
                    <div class="row">
                        <div class="col-12 border rounded bg-light ">
                            <h4 class="mb-0">step.3 各站點審核工作</h4>
                        </div>
                    </div>
                </div>
                <div class="col-12 p-0">
                    <!-- Bootstrap Alarm -->
                    <div id="liveAlertPlaceholder" class="col-12 text-center mb-0 p-0"></div>
                    <!-- NAV分頁標籤 -->
                    <nav>
                        <div class="nav nav-tabs" id="nav-tab" role="tablist">
                            <button type="button" class="nav-link active" id="nav-p1-tab" data-bs-toggle="tab" data-bs-target="#nav-p1_table" role="tab" aria-controls="nav-p1" aria-selected="false"><i class="fa-solid fa-share-from-square"></i> 提取存檔員工資料</button>
                            <button type="button" class="nav-link "       id="nav-p2-tab" data-bs-toggle="tab" data-bs-target="#nav-p2_table" role="tab" aria-controls="nav-p2" aria-selected="false"><i class="fa-solid fa-user-check"></i> 審核特檢名單</button>
                        </div>
                    </nav>
                </div>
                <!-- 內頁 -->
                <div class="tab-content" id="nav-tabContent">
                    <!-- p1 -->
                    <div id="nav-p1_table" class="tab-pane fade show active" role="tabpanel" aria-labelledby="nav-p1-tab">
                        <div class="col-12 bg-white">
                            <!-- step-0 資料交換 -->
                            <div class="unblock" id="row_emp_sub_scope">
                                <!-- 1-1.放原始 staff_deptNos_str 已存檔之部門代號 -->
                                <?php echo $staff_deptNos_str;?>
                            </div>
                            <!-- step-1 -->
                            <div class="col-12 p-1">
                                <div class="row">
                                    <div class="col-9 col-md-10">
                                        <snap for="deptNo_opts" class="form-label"><h5>已存檔之部門代號：</h5></snap>
                                    </div>
                                    <div class="col-3 col-md-2 text-end">
                                        <button type="button" id="load_deptNo_btn"  class="btn btn-outline-success add_btn form-control is-invalid" disabled ><i class="fa-solid fa-arrows-rotate"></i> 提取存檔資料</button>
                                        <div class='invalid-feedback pt-0' id='load_deptNo_btn_feedback'>* 請先勾選部門代號至少一項 !! </div>
                                    </div>
                                </div>
                                <div id="deptNo_opts" class="col-12 px-2 py-1 form-control is-invalid">
                                    <div id="deptNo_opts_inside" class="row">
                                        <!-- 放checkbox按鈕的地方 -->
                                    </div> 
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- p2 -->
                    <div id="nav-p2_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p2-tab">
                        <div class="col-12 bg-white">
                            <!-- 人員名單： -->
                            <div class="row">
                                <!-- 左側function -->
                                <div class="col-md-8 py-0 ">
                                    <button type="button" class="btn btn-outline-danger add_btn" id="resetINF_btn" title="清除編輯清單" data-toggle="tooltip" data-placement="bottom" onclick="return confirm(`確認放棄畫面上的資料？`) && resetINF(true)" disabled><i class="fa-solid fa-trash-arrow-up"></i></button>
                                    <button type="button" class="btn btn-outline-success add_btn" id="bat_storeStaff_btn" onclick="bat_storeStaff()" disabled ><i class="fa-solid fa-floppy-disk"></i> 儲存</button>
                                    <!-- 下載EXCEL的觸發 -->
                                    <div class="inb">
                                        <form id="review_myForm" method="post" action="../_Format/download_excel.php">
                                            <input  type="hidden" name="htmlTable" id="review_htmlTable" value="">
                                            <button type="submit" name="submit" id="download_excel_btn" class="btn btn-outline-success add_btn" value="review" onclick="downloadExcel(this.value)" disabled ><i class="fa fa-download" aria-hidden="true"></i> 下載</button>
                                        </form>
                                    </div>
                                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#edit_modal" disabled ><i class="fa fa-plus"></i> 新增</button>
                                </div>
                                <!-- 右側function -->
                                <div class="col-md-4 py-0 text-end" id="form_btn_div">
                                    <?php
                                        $receive_row = array(
                                            'idty'     => '1',
                                            'in_sign'  => '',
                                            "flow"     => '',
                                            "fab_id"   => '0',
                                            'in_sign'  => '',
                                        );
                                        $sys_sfab_id = [];
                                        $let_btn_s = '<button type="button" class="btn ';
                                        $let_btn_m = '" data-bs-toggle="modal" data-bs-target="#submitModal" value="';
                                        $let_btn_e = '" onclick="submit_item(this.value, this.innerHTML);" disabled>';
                                    
                                        if( (($receive_row['idty'] == 1) && ($receive_row['in_sign'] == $auth_emp_id)) || $sys_role <= 3.5 ){ 
                                            if(in_array($receive_row['idty'], [ 1 ])){ // 1.簽核中
                                                echo $let_btn_s."btn-success".$let_btn_m."0".$let_btn_e."同意 (Approve)</button> ";
                                                if( ($receive_row["flow"] != "forward")  ){  
                                                    echo $let_btn_s."btn-info text-white".$let_btn_m."5".$let_btn_e."轉呈 (Forwarded)</button> ";
                                                }
                                            }
                                        } 
                                        if((in_array($receive_row['idty'], [ 1, 12 ])) && ((in_array($receive_row["fab_id"], $sys_sfab_id) && $sys_role <= 2 ) || ($receive_row['in_sign'] == $auth_emp_id))){ // 1.簽核中 12.待領
                                            echo $let_btn_s."btn-danger".$let_btn_m."2".$let_btn_e."退回 (Reject)</button> ";
                                        }
                                        // 這裡取得發放權限 idty=12.待領、待收 => 13.交貨 (Delivery)
                                            $receive_collect_role = (($receive_row['idty'] == 12) && ($receive_row['flow'] == 'collect') && (in_array($receive_row["fab_id"], $sys_sfab_id))); 
                                            if($receive_collect_role){ 
                                                echo $let_btn_s."btn-primary".$let_btn_m."13".$let_btn_e."交貨 (Delivery)</button> ";
                                            }  
                                        // 承辦+主管簽核選項 idty=13.交貨delivery => 11.承辦簽核 (Undertake)
                                            $receive_delivery_role = ($receive_row['flow'] == 'PPEpm' && (in_array($auth_emp_id, $pm_emp_id_arr) || $sys_role <= 1));
                                            if($receive_row['idty'] == 13 && $receive_delivery_role){  
                                                echo $let_btn_s."btn-primary".$let_btn_m."11".$let_btn_e."承辦同意 (Approve)</button> ";
                                            } 
                                        // 承辦+主管簽核選項 idty=11.承辦簽核 => 10.結案 (Close)
                                            if( $receive_row['idty'] == 11 && ( $receive_row['in_sign'] == $auth_emp_id || $sys_role <= 0 )){ 
                                                echo $let_btn_s."btn-primary".$let_btn_m."10".$let_btn_e."主管同意 (Approve)</button> ";
                                            } 
                                        // 20240429 承辦退貨選項 idty=10.同意退貨 => 2.結案 (Close)
                                        if( $receive_row['idty'] == 10 && ((in_array($receive_row["fab_id"], $sys_sfab_id)) && $sys_role <= 2 )){ 
                                            echo $let_btn_s.'btn-danger" id="return_btn" onclick="return_the_goods()">退貨 (Return)</button> ';
                                        }
                                    ?>
                                </div>
                            </div>
                            <hr>
                            <table id="hrdb_table" class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th title="emp_id+cname">工號姓名</th>
                                        <th title="emp_sub_scope">年份_廠區</th>
                                        <th title="dept_no">部門代碼名稱</th>
                                        <th title="MONIT_LOCAL">工作場所</th>
                                        <th data-toggle="tooltip" data-placement="bottom" title="特殊作業"            >工作內容</th>
                                        <th data-toggle="tooltip" data-placement="bottom" title="HE_CATE 選擇特作項目" style="width: 90px;"><i class="fa-regular fa-square-check"></i>&nbsp;檢查類別代號</th>
                                        <th data-toggle="tooltip" data-placement="bottom" title="AVG_VOL"             style="width: 40px;">均能<br>音量</th>
                                        <th data-toggle="tooltip" data-placement="bottom" title="AVG_8HR 工作日8小時"  style="width: 40px;">平均<br>音壓</th>
                                        <th data-toggle="tooltip" data-placement="bottom" title="eh_time 累計暴露"     style="width: 50px;">每日曝露時數</th>
                                        <th data-toggle="tooltip" data-placement="bottom" title="noiseCheck"          >噪音資格</th>
                                        <th data-toggle="tooltip" data-placement="bottom" title="shCondition"         >資格驗證</th>
                                        <th data-toggle="tooltip" data-placement="bottom" title="process"             >特檢資格</th>
                                        <th title="匯入1" <?php echo ($sys_role <= '3') ? "":"class='unblock'";?>      >項目類別代號</th>
                                        <th title="匯入2" <?php echo ($sys_role <= '3') ? "":"class='unblock'";?>      >檢查項目</th>
                                        <th title="匯入3" <?php echo ($sys_role <= '3') ? "":"class='unblock'";?>      >去年檢查項目</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                </br>
            </div>
        </div>
    </div>
   
<!-- toast -->
    <div id="toastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 11"></div>


    <!-- 互動視窗 import_shLocal -->
    <div class="modal fade" id="import_shLocal" tabindex="-1" aria-labelledby="import_shLocal" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">挑選作業位置&nbsp;(<snap id="import_shLocal_empId"></snap>)：</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body px-4">
                    <table id="shLocal_table" class="table table-striped table-hover">
                        <thead>
                            <th title="id">aid</th>
                            <th title="OSTEXT_30">廠區</th>
                            <th data-toggle="tooltip" data-placement="bottom" title="OSHORT">部門代碼</th>
                            <th title="OSTEXT">部門名稱</th>

                            <th title="HE_CATE">類別</th>
                            <th title="AVG_VOL">均能音量</th>
                            <th title="AVG_8HR/工作日8小時平均音壓值">8hr平均音壓</th>
                            <th title="MONIT_NO">監測編號</th>
                            <th title="MONIT_LOCAL">監測處所</th>
                            <th title="WORK_DESC">作業描述</th>
                            <th title="">選擇</th>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="useImportShLocal" checked>
                        <label class="form-check-label" for="useImportShLocal">保留選項</label>
                    </div>
                    <button type="button" class="btn btn-success"   data-bs-dismiss="modal" id="import_shLocal_btn">載入</button>
                    <button type="reset"  class="btn btn-secondary" data-bs-dismiss="modal">返回</button>
                </div>
            </div>
        </div>
    </div> 

    <!--模組-新增Staff -->
    <div class="modal fade" id="import_staff" aria-hidden="true" aria-labelledby="import_staff" tabindex="-1">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-warning">
                    <h5 class="modal-title" id="searchStaff">searchStaff</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <!-- 第一排-查詢功能 -->
                    <div class="row">
                        <div class="col-12 col-md-6"></div>
                        <div class="col-12 col-md-6 text-end py-1">
                            <div class="input-group">
                                <input id="searchkeyWord" class="form-control col-sm-10 mb-0" type="text" placeholder="請輸入查詢對象 工號、姓名或NT帳號" required>
                                <button type="button" class="btn btn-outline-primary" onclick="search_fun('search','searchkeyWord')"><i class="fa-solid fa-magnifying-glass"></i> 搜尋</button>
                            </div>
                        </div>
                    </div>
                    <!-- 第二排-查詢結果 -->
                    <div class="row">
                        <div class="col-12 p-3" id="result">
                            <table id="result_table" class="table table-striped table-hover">
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-bs-dismiss="modal">Back</button>
                </div>
            </div>
        </div>
    </div>

    <!-- canvas側欄 -->
    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
        <div class="offcanvas-header">
            <h5 id="offcanvasRightLabel">歷史紀錄查閱 <snap id="offcanvas_title"></snap></h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            ...
        </div>
    </div>
    <!-- canvas上側欄 -->
    <div class="offcanvas offcanvas-top" tabindex="-1" id="offcanvasTop" aria-labelledby="offcanvasTopLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasTopLabel">歷史紀錄查閱 <snap id="offcanvas_title"></snap></h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body small py-0">
            <table id="shCase_table" class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th title="emp_id+cname">工號姓名</th>
                        <th title="emp_sub_scope">年份_廠區</th>
                        <th title="dept_no">部門代碼名稱</th>
                        <th title="">工作場所</th>
                        <th title="點選特殊作業">工作內容</th>
                        <th title="HE_CATE">檢查類別代號</th>
                        <th title="AVG_VOL" style="width: 50px;">均能音量</th>
                        <th title="AVG_8HR 工作日8小時" style="width: 50px;">平均音壓</th>
                        <th title="eh_time 累計暴露" style="width: 70px;">每日曝露時數</th>
                        <th title="NC" style="width: 80px;">噪音資格</th>
                        <th title="SH3" style="width: 80px;">特檢資格</th>
                        <th title="shCondition">資格驗證</th>
                        <th title="change">轉調</th>
                        <th title="匯入1yearHe" <?php echo ($sys_role <= '3') ? "":"class='unblock'";?> >項目類別代號</th>
                        <th title="匯入2yearCurrent" <?php echo ($sys_role <= '3') ? "":"class='unblock'";?> >檢查項目</th>
                        <th title="匯入3yearPre" <?php echo ($sys_role <= '3') ? "":"class='unblock'";?> >去年檢查項目</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    </div>

    <!-- 模組 submitModal-->
    <div class="modal fade" id="submitModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable ">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Do you submit this：<span id="idty_title"></span>&nbsp?</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                
                <div class="modal-body px-4 pt-1">
                    <!-- 第二排的功能 : 搜尋功能 -->
                    <div class="row unblock" id="forwarded">
                        <div class="col-12" id="searchUser_table">
                            <div class="input-group search" id="select_inSign_Form">
                                <span class="input-group-text form-label">轉呈</span>
                                <input type="text" name="in_sign" id="in_sign" class="form-control" placeholder="請輸入工號"
                                        aria-label="請輸入查詢對象工號" onchange="search_fun(this.id, this.value);">
                                <div id="in_signBadge"></div>
                                <input type="hidden" name="in_signName" id="in_signName" >
                            </div>
                        </div>
                        <hr>
                    </div>
                    <label for="sign_comm" id="sign_comm_label" class="form-check-label" >command：</label>
                    <textarea name="sign_comm" id="sign_comm" class="form-control" rows="5"></textarea>
                </div>
                <div class="modal-footer">
                    <input type="hidden" name="updated_user"   id="updated_user"   value="<?php echo $auth_cname;?>">
                    <input type="hidden" name="updated_emp_id" id="updated_emp_id" value="<?php echo $auth_emp_id;?>">
                    <input type="hidden" name="uuid"           id="uuid"           value="">
                    <input type="hidden" name="fab_sign_code"  id="fab_sign_code"  value="">
                    <input type="hidden" name="action"         id="action"         value="">
                    <input type="hidden" name="step"           id="step"           value="">
                    <input type="hidden" name="idty"           id="idty"           value="">
                    <input type="hidden" name="old_idty"       id="old_idty"       value="">
                    <?php if($sys_role <= 3){ ?>
                        <button type="submit" name="receive_submit" value="Submit" class="btn btn-primary" ><i class="fa fa-paper-plane" aria-hidden="true"></i> Agree</button>
                    <?php } ?>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    
    <!-- 互動視窗 edit_modal -->
    <div class="modal fade" id="edit_modal" tabindex="-1" aria-labelledby="edit_modal" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">編輯&nbsp;<snap id="edit_modal_empId"></snap>：</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body px-4"></div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-success"   data-bs-dismiss="modal" id="edit_modal_btn" >更新</button>
                    <button type="reset"  class="btn btn-secondary" data-bs-dismiss="modal">返回</button>
                </div>
            </div>
        </div>
    </div> 

    <div id="gotop">
        <i class="fas fa-angle-up fa-2x"></i>
    </div>
</body>

<script src="../../libs/aos/aos.js"></script>                       <!-- goTop滾動畫面jquery.min.js+aos.js 3/4-->
<script src="../../libs/aos/aos_init.js"></script>                  <!-- goTop滾動畫面script.js 4/4-->
<script src="../../libs/sweetalert/sweetalert.min.js"></script>     <!-- 引入 SweetAlert 的 JS 套件 參考資料 https://w3c.hexschool.com/blog/13ef5369 -->
<script src="../../libs/openUrl/openUrl.js"></script>               <!-- 彈出子畫面 -->

<script>

// // // 開局導入設定檔
// 以下為控制 iframe

    var download_excel_btn  = document.getElementById('download_excel_btn');   // 下載按鈕
    var bat_storeStaff_btn  = document.getElementById('bat_storeStaff_btn');   // 儲存按鈕
    var resetINF_btn        = document.getElementById('resetINF_btn');         // 清空按鈕
    var editModal_btn       = document.getElementById('edit_modal_btn');        // 編輯更新ShCondition按鈕

    var searchUser_modal    = new bootstrap.Modal(document.getElementById('import_staff'), { keyboard: false });
    var importShLocal_modal = new bootstrap.Modal(document.getElementById('import_shLocal'), { keyboard: false });
    var edit_modal          = new bootstrap.Modal(document.getElementById('edit_modal'), { keyboard: false });

    var staff_inf        = [];
    var shLocal_inf      = [];
    var loadStaff_tmp    = [];
    
    // [p1 步驟-0] 取得重要資訊
    const OSHORTsObj = <?=json_encode($shLocal_OSHORTs_str)?>;
    const ept_noTXT = (document.getElementById('row_emp_sub_scope').innerText).trim();
    const deptNosObj = ept_noTXT ? JSON.parse(ept_noTXT) : ept_noTXT;       // 將row_OSTEXT_30的字串轉換為物件

    const sys_role = '<?=$sys_role?>';
    const currentYear = String(new Date().getFullYear());                   // 取得當前年份
    const preYear     = String(currentYear - 1);                            // 取得去年年份

</script>
<script src="review.js?v=<?=time()?>"></script>
<script src="review_excel.js?v=<?=time()?>"></script>
<script src="review_check.js?v=<?=time()?>"></script>

<?php include("../template/footer.php"); ?>