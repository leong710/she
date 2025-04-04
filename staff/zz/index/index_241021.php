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


        $shLocal_OSTEXT_30s = load_shLocal_OSTEXT30s();

        // p1
        $shLocal_OSHORTs = load_shLocal_OSHORTs();                                      // step1.取得特危健康場所部門代號
        $shLocal_OSHORTs_str = json_encode($shLocal_OSHORTs, JSON_UNESCAPED_UNICODE);   // step2.陣列轉字串
        $shLocal_OSHORTs_str = trim($shLocal_OSHORTs_str, '[]');                        // step3.去掉括號forMysql查詢

        // p3
        $staff_deptNos = load_staff_dept_nos();                                        // step1.取得存檔員工的部門代號
        $staff_deptNos_str = json_encode($staff_deptNos, JSON_UNESCAPED_UNICODE);     // step2.陣列轉字串
        $staff_deptNos_str = trim($staff_deptNos_str, '[]');                          // step3.去掉括號forMysql查詢

        // echo "<pre>";
        // print_r($staff_deptNos);
        // echo "</pre>";

?>

<?php include("../template/header.php"); ?>
<?php include("../template/nav.php"); ?>

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
        .HE_CATE:hover {
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
                margin-top: calc(1 * var(--spacing));
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
    </style>
</head>
<body>
    <div class="col-12">
        <div class="row justify-content-center">
            <div class="col_xl_11 col-12 rounded" style="background-color: rgba(255, 255, 255, .8);">
                <div class="col-12 pb-0 px-0">
                    <!-- Bootstrap Alarm -->
                    <div id="liveAlertPlaceholder" class="col-12 text-center mb-0 p-0"></div>
                    <!-- NAV分頁標籤 -->
                    <nav>
                        <div class="nav nav-tabs" id="nav-tab" role="tablist">
                            <button type="button" class="nav-link active"   id="nav-p2-tab" data-bs-toggle="tab" data-bs-target="#nav-p2_table" role="tab" aria-controls="nav-p2" aria-selected="false"><i class="fa-solid fa-user-shield"></i> 定期特殊健檢</button>
                            <button type="button" class="nav-link"          id="nav-p1-tab" data-bs-toggle="tab" data-bs-target="#nav-p1_table" role="tab" aria-controls="nav-p1" aria-selected="false"><i class="fa-solid fa-cloud-arrow-down"></i> 提取部門現況名單</button>
                            <button type="button" class="nav-link"          id="nav-p3-tab" data-bs-toggle="tab" data-bs-target="#nav-p3_table" role="tab" aria-controls="nav-p3" aria-selected="false"><i class="fa-solid fa-share-from-square"></i> 提取存檔員工資料</button>
                        </div>
                    </nav>
                </div>
                <!-- 內頁 -->
                <div class="tab-content" id="nav-tabContent">
                    <!-- p1 -->
                    <div id="nav-p1_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p1-tab">
                        <div class="col-12 bg-white">
                            <!-- step-0 資料交換 -->
                            <p class="<?php echo ($sys_role > 0) ? 'unblock':'';?>">
                                <button class="btn btn-sm btn-xs btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#step1-1" aria-expanded="false" aria-controls="step1-1">step1-1</button>
                            </p>
                            <div class="row">
                                <div class="col">
                                    <div class="collapse multi-collapse" id="step1-1">
                                        <div class="card card-body" id="row_OSTEXT_30">
                                            <!-- 1-1.放原始 shLocal_str -->
                                            <?php echo $shLocal_OSHORTs_str;?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 p-1">
                                
                                <div class="row">
                                    <div class="col-9 col-md-10">
                                        <snap for="deptNo_opts" class="form-label"><h5>由人事資料庫撈取現況名單(僅限有建立危害地圖之部門代號)：</h5></snap>
                                    </div>
                                    <div class="col-3 col-md-2 text-end">
                                        <!-- step-3 -->
                                        <button type="button" id="load_hrdb_btn"  class="btn btn-outline-success add_btn form-control is-invalid" disabled ><i class="fa-solid fa-arrows-rotate"></i> 提取人事資料庫</button>
                                        <div class='invalid-feedback pt-0' id='load_hrdb_btn_feedback'>* 特危健康場所部門代號至少需有一項 !! </div>
                                    </div>
                                </div>
                            </div>
                            <!-- step-1 -->
                            <div class="col-12 p-1">
                                <snap for="OSTEXT_30" class="form-label">STEP-1.篩選特危健康場所：<sup class="text-danger"> *</sup></snap>
                                <div id="OSTEXT_30_Out" class="col-12 p-3 form-control is-invalid" >
                                    <div class='form-check px-4 py-1'>
                                        <input type='checkbox' name='OSTEXT_30_All' id='OSTEXT_30_All' value='All' class='form-check-input' >
                                        <label for='OSTEXT_30_All' class='form-check-label'>All</label>
                                    </div>
                                    <snap id="OSTEXT_30" class=" px-3 inf" >
                                        <?php foreach($shLocal_OSTEXT_30s as $OSTEXT_30_i){
                                                echo "<div class='form-check px-3'>";
                                                echo "<input type='checkbox' name='OSTEXT_30[]' id='OSTEXT_30_{$OSTEXT_30_i["OSTEXT_30"]}' value='{$OSTEXT_30_i["OSTEXT_30"]}' class='form-check-input'  >";
                                                echo "<label for='OSTEXT_30_{$OSTEXT_30_i["OSTEXT_30"]}' class='form-check-label'>{$OSTEXT_30_i["OSTEXT_30"]}</label></div>&nbsp;";
                                            }
                                        ?>
                                    </snap>
                                </div>
                                <div class='invalid-feedback pt-0' id='OSTEXT_30_Out_feedback'>* STEP-1.特危健康場所至少需勾選一項 !! </div>
                            </div>
                            <!-- step-2 -->
                            <div class="col-12 p-1">
                                <snap for="OSHORTs_opts" class="form-label">STEP-2.特危健康場所部門代號：<sup class="text-danger"> *</sup></snap>
                                <div id="OSHORTs_opts" class="col-12 px-2 py-1 form-control is-invalid">
                                    <div id="OSHORTs_opts_inside" class="row">
                                        <!-- 放checkbox按鈕的地方 -->
                                    </div> 
                                </div>
                                <div class='invalid-feedback pt-0' id='OSHORTs_opts_feedback'>* STEP-2.特危健康場所部門代號至少需有一項 !! </div>
                            </div>
                        </div>
                    </div>

                    <!-- p2 -->
                    <div id="nav-p2_table" class="tab-pane fade show active" role="tabpanel" aria-labelledby="nav-p2-tab">
                        <div class="col-12 bg-white">
                            <!-- 人員名單： -->
                            <div class="row">
                                <!-- 左側function -->
                                <div class="col-md-8 py-0 ">
                                    <button type="button" class="btn btn-outline-secondary add_btn" id="resetINF_btn" title="清除清單" data-toggle="tooltip" data-placement="bottom" onclick="resetINF(true);" disabled><i class="fa-solid fa-trash-arrow-up"></i></button>
                                </div>
                                <!-- 右側function -->
                                <div class="col-md-4 py-0 text-end">
                                    <button type="button" class="btn btn-outline-success add_btn" id="bat_storeStaff_btn" onclick="bat_storeStaff()" disabled ><i class="fa-solid fa-floppy-disk"></i> 儲存</button>
                                    <!-- 下載EXCEL的觸發 -->
                                    <div class="inb">
                                        <form id="staff_myForm" method="post" action="../_Format/download_excel.php">
                                            <input  type="hidden" name="htmlTable" id="staff_htmlTable" value="">
                                            <button type="submit" name="submit" id="download_excel_btn" class="btn btn-outline-success add_btn" value="staff" onclick="downloadExcel(this.value)" disabled ><i class="fa fa-download" aria-hidden="true"></i> 下載</button>
                                        </form>
                                    </div>
                                    <button type="button" id="load_excel_btn"  class="btn btn-outline-primary add_btn" data-bs-toggle="modal" data-bs-target="#load_excel"><i class="fa fa-upload" aria-hidden="true"></i> 上傳</button>
                                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#import_staff"><i class="fa fa-plus"></i> 新增</button>
                                </div>
                            </div>
                            <hr>
                            <table id="hrdb_table" class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th title="emp_id+cname">工號姓名</th>
                                        <th title="emp_sub_scope">年份_廠區</th>
                                        <th title="dept_no">部門代碼名稱</th>
                                        <th title="">工作場所</th>
                                        <th title="點選特殊作業" data-toggle="tooltip" data-placement="bottom"><i class="fa-regular fa-square-check"></i>&nbsp;工作內容</th>
                                        <th title="HE_CATE" data-toggle="tooltip" data-placement="bottom">檢查類別代號</th>
                                        <th title="AVG_VOL" data-toggle="tooltip" data-placement="bottom" style="width: 40px;">均能音量</th>
                                        <th title="AVG_8HR 工作日8小時" data-toggle="tooltip" data-placement="bottom" style="width: 40px;">平均音壓</th>
                                        <th title="eh_time 累計暴露" data-toggle="tooltip" data-placement="bottom" style="width: 50px;">每日曝露時數</th>
                                        <th title="NC" data-toggle="tooltip" data-placement="bottom">噪音資格</th>
                                        <th title="SH3" style="width: 70px;">特檢資格</th>
                                        <th title="shCondition" data-toggle="tooltip" data-placement="bottom">資格驗證</th>
                                        <th title="change" data-toggle="tooltip" data-placement="bottom">轉調</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- p3 -->
                    <div id="nav-p3_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p3-tab">
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
                    
                </div>
                </br>
            </div>
        </div>
    </div>
   
<!-- toast -->
    <div id="toastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 11"></div>

    <!-- 互動視窗 load_excel -->
    <div class="modal fade" id="load_excel" tabindex="-1" aria-labelledby="load_excel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">上傳Excel檔：</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body px-4">
                    <form name="excelInput" action="../_Format/upload_excel.php" method="POST" enctype="multipart/form-data" target="api" onsubmit="return loadExcelForm()">
                        <div class="row">
                            <div class="col-6 col-md-8 py-0">
                                <label for="excelFile" class="form-label">特作員工清單 <span>&nbsp<a href="../_Format/shStaff_example.xlsx" target="_blank">上傳格式範例</a></span> 
                                    <sup class="text-danger"> * 限EXCEL檔案</sup></label>
                                <div class="input-group">
                                    <input type="file" name="excelFile" id="excelFile" style="font-size: 16px; max-width: 350px;" class="form-control form-control-sm" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                                    <button type="submit" name="excelUpload" id="excelUpload" class="btn btn-outline-secondary" value="shStaff">上傳</button>
                                </div>
                            </div>
                            <div class="col-6 col-md-4 py-0">
                                <p id="warningText_1" name="warning" >＊請上傳[特危作業人員清單]Excel檔</p>
                                <p id="warningText_2" name="warning" >＊請確認Excel中的資料</p>
                            </div>
                        </div>
                            
                        <div class="row" id="excel_iframe">
                            <iframe id="api" name="api" width="100%" height="30" style="display: none;" onclick="loadExcelForm()"></iframe>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <input  type="hidden" id="excelTable" name="excelTable" value="">
                    <button type="submit" class="btn btn-success unblock" data-bs-dismiss="modal" id="import_excel_btn" >載入</button>
                    <button type="reset"  class="btn btn-secondary"       data-bs-dismiss="modal">返回</button>
                </div>
            </div>
        </div>
    </div> 

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
    var realName           = document.getElementById('realName');           // 上傳後，JSON存放處(給表單儲存使用)
    var iframe             = document.getElementById('api');                // 清冊的iframe介面
    var warningText_1      = document.getElementById('warningText_1');      // 未上傳的提示
    var warningText_2      = document.getElementById('warningText_2');      // 資料有誤的提示
    var excel_json         = document.getElementById('excel_json');         // 清冊中有誤的提示
    var excelFile          = document.getElementById('excelFile');          // 上傳檔案名稱
    var excelUpload        = document.getElementById('excelUpload');        // 上傳按鈕
    var import_excel_btn   = document.getElementById('import_excel_btn');   // 載入按鈕
    var download_excel_btn = document.getElementById('download_excel_btn'); // 下載按鈕
    var bat_storeStaff_btn = document.getElementById('bat_storeStaff_btn'); // 儲存按鈕
    var resetINF_btn       = document.getElementById('resetINF_btn');       // 清空按鈕

    var searchUser_modal    = new bootstrap.Modal(document.getElementById('import_staff'), { keyboard: false });
    var importShLocal_modal = new bootstrap.Modal(document.getElementById('import_shLocal'), { keyboard: false });

    var staff_inf        = [];
    var shLocal_inf      = [];
    var loadStaff_tmp    = [];
    
    // [p1 步驟-0] 取得重要資訊
    const OSHORTsObj = JSON.parse(document.getElementById('row_OSTEXT_30').innerText);          // 將row_OSTEXT_30的字串轉換為物件
    const OSTEXT_30_Out = document.getElementById('OSTEXT_30_Out');                             // 取得步驟1篩選後的特危健康場所
    const OSTEXT_30s = Array.from(OSTEXT_30_Out.querySelectorAll('input[type="checkbox"]'));    // 取得所有checkbox元素
    const load_hrdb_btn = document.getElementById('load_hrdb_btn');
    
    // const deptNosObj = JSON.parse(document.getElementById('row_emp_sub_scope').innerText);      // 將row_emp_sub_scope的字串轉換為物件

    const ept_noTXT = (document.getElementById('row_emp_sub_scope').innerText).trim();
    const deptNosObj = ept_noTXT ? JSON.parse(ept_noTXT) : ept_noTXT; // 將row_OSTEXT_30的字串轉換為物件


</script>
<script src="staff.js?v=<?=time()?>"></script>

<?php include("../template/footer.php"); ?>