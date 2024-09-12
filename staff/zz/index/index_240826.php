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

        $shLocal_OSHORTs = load_shLocal_OSHORTs();                                      // step1.取得特危健康場所部門代號
        $shLocal_OSHORTs_str = json_encode($shLocal_OSHORTs, JSON_UNESCAPED_UNICODE);   // step2.陣列轉字串
        // $shLocal_OSHORTs_str = "";   // step2.陣列轉字串
        $shLocal_OSHORTs_str = trim($shLocal_OSHORTs_str, '[]');    // step3.去掉括號forMysql查詢

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
        @media (min-width: 1900px) {
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
        /* 凸顯可編輯欄位 */
            .fix_amount:hover {
                /* font-size: 1.05rem; */
                font-weight: bold;
                text-shadow: 3px 3px 5px rgba(0,0,0,.5);
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
            transition: .5s;
            font-weight: bold;
            text-shadow: 3px 3px 5px rgba(0,0,0,.5);
        }
    </style>
</head>
<body>
    <div class="col-12">
        <div class="row justify-content-center">
            <div class="col_xl_11 col-12 rounded" style="background-color: rgba(255, 255, 255, .8);">
                <!-- NAV分頁標籤與統計 -->
                <div class="col-12 pb-0 px-0">
                    <nav>
                        <div class="nav nav-tabs" id="nav-tab" role="tablist">
                            <button class="nav-link active" id="nav-p1-tab" data-bs-toggle="tab" data-bs-target="#nav-p1_table" type="button" role="tab" aria-controls="nav-p1" aria-selected="false">取得條件</button>
                            <button class="nav-link"        id="nav-p2-tab" data-bs-toggle="tab" data-bs-target="#nav-p2_table" type="button" role="tab" aria-controls="nav-p2" aria-selected="false">員工清單</button>
                            <button class="nav-link"        id="nav-p3-tab" data-bs-toggle="tab" data-bs-target="#nav-p3_table" type="button" role="tab" aria-controls="nav-p3" aria-selected="false">p3</button>
                        </div>
                    </nav>
                </div>
                <!-- 內頁 -->
                <div class="tab-content" id="nav-tabContent">
                    <!-- p1 -->
                    <div id="nav-p1_table" class="tab-pane fade show active" role="tabpanel" aria-labelledby="nav-p1-tab">
                        <div class="col-12 bg-white">
                            <!-- step-0 資料交換 -->
                            <p class="block">
                                <button class="btn btn-sm btn-xs btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#step1-1" aria-expanded="false" aria-controls="step1-1">step1-1</button>
                                <button class="btn btn-sm btn-xs btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#step1-2" aria-expanded="false" aria-controls="step1-2">step1-2</button>
                                <button class="btn btn-sm btn-xs btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#step2-1" aria-expanded="false" aria-controls="step2-1">step2-1</button>
                                <button class="btn btn-sm btn-xs btn-warning" type="button" data-bs-toggle="collapse" data-bs-target=".multi-collapse" aria-expanded="false" aria-controls="step1-1 step1-2 step2-1 step2-2">Toggle both elements</button>
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
                                <div class="col">
                                    <div class="collapse multi-collapse" id="step1-2">
                                        <div class="card card-body" id="OSHORTs">
                                            <!-- 1-2.根據STEP-1.篩選特危健康場所--選擇結果生成字串 -->
                                        </div>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="collapse multi-collapse" id="step2-1">
                                        <div class="card card-body" id="select_OSHORTs">
                                            <!-- 2-1.STEP-2.特危健康場所部門代號--選擇結果生成字串 -->
                                        </div>
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
                                <div id="OSHORTs_opts" class="col-12 px-2 py-1 form-control is-valid">
                                    <div id="OSHORTs_opts_inside" class="row">
                                        <!-- 放checkbox按鈕的地方 -->
                                    </div> 
                                </div>
                                <div class='invalid-feedback pt-0' id='OSHORTs_opts_feedback'>* STEP-2.特危健康場所部門代號至少需有一項 !! </div>
                            </div>
                            <!-- step-3 -->
                            <div class="col-12 p-1">
                                <snap for="step-3" class="form-label">STEP-3.依照條件取得人員名單：<sup class="text-danger"> *</sup></snap>
                                <div id="step-3" class="col-3 p-3 form-control ">
                                    <button type="button" id="load_hrdb_btn"  class="btn btn-outline-success add_btn  form-control" ><i class="fa-solid fa-arrows-rotate"></i> 取得人事資料庫</button>
                                    <div class='invalid-feedback pt-0' id='load_hrdb_btn_feedback'>* STEP-2.特危健康場所部門代號至少需有一項 !! </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- p2 -->
                    <div id="nav-p2_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p2-tab">
                        <div class="col-12 bg-white">
                            <!-- 人員名單： -->
                            <div class="row">
                                <!-- Bootstrap Alarm -->
                                <div id="liveAlertPlaceholder" class="col-12 text-center mb-0 py-0"></div>
                                <!-- sort/groupBy function -->
                                <div class="col-md-8 py-0 ">
                                    
                                </div>
                                <div class="col-md-4 py-0 text-end">
                                    <?php if($per_total != 0){ ?>
                                        <!-- 下載EXCEL的觸發 -->
                                        <div class="inb">
                                            <form id="shLocal_myForm" method="post" action="../_Format/download_excel.php">
                                                <input  type="hidden" name="htmlTable" id="shLocal_htmlTable" value="">
                                                <button type="submit" name="submit" class="btn btn-outline-success add_btn" value="shLocal" onclick="downloadExcel(this.value)" ><i class="fa fa-download" aria-hidden="true"></i> 下載</button>
                                            </form>
                                        </div>
                                    <?php } ?>
                                    <button type="button" id="load_excel_btn"  class="btn btn-outline-primary add_btn" data-bs-toggle="modal" data-bs-target="#load_excel"><i class="fa fa-upload" aria-hidden="true"></i> 上傳</button>
                                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#import_staff"><i class="fa fa-plus"></i> 新增</button>
                                </div>
                            </div>
                            <hr>
                            <table id="hrdb_table" class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <!-- <th title="">驗證資格</th> -->
                                        <th title="emp_sub_scope">廠區</th>
                                        <th title="dept_no">部門代碼名稱</th>
                                        <!-- <th title="emp_dept">部門名稱</th> -->
                                        <!-- <th title="emp_id">工號</th> -->
                                        <th title="點選特殊作業" data-toggle="tooltip" data-placement="bottom">工號姓名</th>
                                        <!-- <th title="">特危作業</th> -->
                                        <th title="">工作場所</th>
                                        <th title="">工作內容</th>
                                        <th title="">檢查類別代號</th>
                                        <th title="">均能音量</th>
                                        <th title="工作日8小時">平均音壓</th>
                                        <th title="累計暴露" data-toggle="tooltip" data-placement="bottom" style="width: 50px;">每日曝露時數</th>
                                        <th title="">噪音資格</th>
                                        <th title="">特檢資格</th>
                                        <th title="HIRED">到職日</th>
                                    </tr>
                                </thead>
                                <tbody>

                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- p3 -->
                    <div id="nav-p3_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p3-tab">
                        p3
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
                    <h5 class="modal-title">挑選危害健康作業&nbsp;(<snap id="import_shLocal_empId"></snap>)：</h5>
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

    <!-- 互動視窗 edit_shLocal -->
    <div class="modal fade" id="edit_shLocal" tabindex="-1" aria-labelledby="edit_shLocal" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">修正危害健康作業&nbsp;(<snap id="edit_shLocal_empId"></snap>)：</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body px-4">
                    <table id="edit_shLocal_table" class="table table-striped table-hover">
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
                    <button type="button" class="btn btn-success"   data-bs-dismiss="modal" id="edit_shLocal_btn" >修正</button>
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
                                <button type="button" class="btn btn-outline-primary" onclick="search_fun('search')"><i class="fa-solid fa-magnifying-glass"></i> 搜尋</button>
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
    var realName         = document.getElementById('realName');           // 上傳後，JSON存放處(給表單儲存使用)
    var iframe           = document.getElementById('api');                // 清冊的iframe介面
    var warningText_1    = document.getElementById('warningText_1');      // 未上傳的提示
    var warningText_2    = document.getElementById('warningText_2');      // 資料有誤的提示
    var excel_json       = document.getElementById('excel_json');         // 清冊中有誤的提示
    var excelFile        = document.getElementById('excelFile');          // 上傳檔案名稱
    var excelUpload      = document.getElementById('excelUpload');        // 上傳按鈕
    var import_excel_btn = document.getElementById('import_excel_btn');   // 載入按鈕

    var searchUser_modal = new bootstrap.Modal(document.getElementById('import_staff'), { keyboard: false });
    var edit_shLocal_modal = new bootstrap.Modal(document.getElementById('edit_shLocal'), { keyboard: false });

    var staff_inf        = [];
    var shLocal_inf      = [];
    
    // [p1 步驟-0] 取得重要資訊
    const OSHORTsObj = JSON.parse(document.getElementById('row_OSTEXT_30').innerText); // 將row_OSTEXT_30的字串轉換為物件
    const OSTEXT_30_Out = document.getElementById('OSTEXT_30_Out'); // 取得步驟1篩選後的特危健康場所
    const OSTEXT_30s = Array.from(OSTEXT_30_Out.querySelectorAll('input[type="checkbox"]')); // 取得所有checkbox元素
    const load_hrdb_btn = document.getElementById('load_hrdb_btn');

    // Bootstrap Alarm function
    function Balert(message, type) {
        var alertPlaceholder = document.getElementById("liveAlertPlaceholder")      // Bootstrap Alarm
        var wrapper = document.createElement('div')
        wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message 
                            + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        alertPlaceholder.append(wrapper)
    }
    // fun3-3：吐司顯示字條 // init toast // 240823堆疊
    function inside_toast(sinn){
        // 創建一個新的 toast 元素
        var newToast = document.createElement('div');
            newToast.className = 'toast align-items-center bg-warning';
            newToast.setAttribute('role', 'alert');
            newToast.setAttribute('aria-live', 'assertive');
            newToast.setAttribute('aria-atomic', 'true');
            newToast.setAttribute('autohide', 'true');
            newToast.setAttribute('delay', '1000');

            // 設置 toast 的內部 HTML
            newToast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">${sinn}</div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;

        // 將新 toast 添加到容器中
        document.getElementById('toastContainer').appendChild(newToast);

        // 初始化並顯示 toast
        var toast = new bootstrap.Toast(newToast);
        toast.show();

        // 選擇性地，在 toast 隱藏後將其從 DOM 中移除
        newToast.addEventListener('hidden.bs.toast', function () {
            newToast.remove();
        });
    }
    // 20240314 配合await將swal外移
    function show_swal_fun(swal_value){
        return new Promise((resolve) => {  
            $("body").mLoading("hide");
            if(swal_value && swal_value['fun'] && swal_value['content'] && swal_value['action']){
                if(swal_value['action'] == 'success'){
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.href = url});          // n秒后回首頁
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{closeWindow(true)});                                          // 手動關閉畫面
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{closeWindow(true); resolve();});  // 2秒自動關閉畫面; 載入成功，resolve
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.reload(); resolve();});  // 2秒自動 刷新页面;載入成功，resolve
                
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
    // 240823 停止並銷毀 DataTable
    function release_dataTable(){
        return new Promise((resolve) => {
            let table = $('#hrdb_table').DataTable();
                table.destroy();
            // 當所有設置完成後，resolve Promise
            resolve();
        });
    }
// searchStaff
    // 第一-階段：search Key_word
    function search_fun(fun){
        mloading("show");                                               // 啟用mLoading
        if(fun=='search'){
            var search = $('#searchkeyWord').val().trim();              // search keyword取自user欄位
            if(!search || (search.length < 2)){
                $("body").mLoading("hide");
                alert("查詢字數最少 2 個字以上!!");
                return false;
            } 
            var request = {
                functionname : 'search',                                // 操作功能
                uuid         : 'e65fccd1-79e7-11ee-92f1-1c697a98a75f',  // nurse
                search       : search                                   // 查詢對象key_word
            }
        }else{
            return false;
        }

        $.ajax({
            url: 'http://tneship.cminl.oa/api/hrdb/index.php',          // 正式2024新版
            method: 'post',
            dataType: 'json',
            data: request,
            success: function(res){
                var res_r = res["result"];
                postList(res_r);                                        // 將結果轉給postList進行渲染

            },
            error (err){
                console.log("search error:", err);
                $("body").mLoading("hide");
                alert("查詢錯誤!!");
            }
        })
    }
    // 第一階段：渲染功能
    function postList(res_r){
        // 定義表格頭段
        let div_result_table = document.getElementById('result_table');
            div_result_table.innerHTML = '';
        // 鋪設表格頭段thead
        let Rinner = "<thead><tr>"+ "<th>廠區</th>"+"<th>工號</th>"+"<th>姓名</th>"+"<th>職稱</th>"+"<th>部門代號</th>"+"<th>部門名稱</th>"+"<th>select</th>"+ "</tr></thead>" + "<tbody id='result_tbody'>"+"</tbody>";
        div_result_table.innerHTML += Rinner;
        // 定義表格中段tbody
        let div_result_tbody = document.getElementById('result_tbody');
            div_result_tbody.innerHTML = '';
        let len = res_r.length;
        for (let i=0; i < len; i++) {
            // 把user訊息包成json字串以便夾帶
            let user_json = JSON.stringify({
                    "emp_sub_scope" : res_r[i].emp_sub_scope.trim(),
                    "emp_id"        : res_r[i].emp_id.trim(),
                    "cname"         : res_r[i].cname.trim(),
                    "dept_no"       : res_r[i].dept_no.trim(),
                    "emp_dept"      : res_r[i].emp_dept.trim(),
                });

            div_result_tbody.innerHTML += 
                '<tr>' +
                    '<td>' + res_r[i].emp_sub_scope + '</td>' +
                    '<td>' + res_r[i].emp_id +'</td>' +
                    '<td>' + res_r[i].cname + '</td>' +
                    '<td>' + res_r[i].cstext + '</td>' +
                    '<td>' + res_r[i].dept_no + '</td>' +
                    '<td>' + res_r[i].emp_dept+ '</td>' +
                    '<td class="text-center">' + '<button type="button" class="btn btn-default btn-xs" id="'+res_r[i].emp_id+'" value='+user_json+' onclick="tagsInput_me(this.value)">'+
                    '<i class="fa-regular fa-circle"></i></button>' + '</td>' +
                '</tr>';
        }
        $("body").mLoading("hide");                                 // 關閉mLoading

    }
    // 第二階段：點選、渲染模組
    function tagsInput_me(val) {
        if (val !== '') {
            val = '['+val+']';
            const tagsInput_me_arr = JSON.parse(val);   // 將物件字串轉成陣列
            mgInto_staff_inf(tagsInput_me_arr);         // 合併+渲染
            $('#searchkeyWord').val('');                // 清除searchkeyWord
            $('#result_table').empty();                 // 清除搜尋頁面資料
            inside_toast(`新增單筆資料...Done&nbsp;!!`);
            searchUser_modal.hide();                    // 關閉頁面
        }
    }
    // [load_excel] 以下為上傳後"iframe"的部分
        // 阻止檔案未上傳導致的錯誤。
        // 請注意設置時的"onsubmit"與"onclick"。
        function loadExcelForm() {
            // 如果檔案長度等於"0"。
            if (excelFile.files.length === 0) {
                // 如果沒有選擇文件，顯示警告訊息並阻止表單提交
                warningText_1.style.display = "block";
                return false;
            }
            // 如果已選擇文件，允許表單提交
            iframe.style.display = 'block'; 
            // 以下為編輯特有
            // showTrainList.style.display = 'none';
            return true;
        }
        // 
        function iframeLoadAction() {
            iframe.style.height = '0px';
            var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            var iframeContent = iframeDocument.documentElement;
            var newHeight = iframeContent.scrollHeight + 'px';
            iframe.style.height = newHeight;

            var excel_json = iframeDocument.getElementById('excel_json');
            var stopUpload = iframeDocument.getElementById('stopUpload');
            // 在此處對找到的 <textarea> 元素進行相應的操作
            if (excel_json) {
                // 手动触发input事件
                var inputEvent = new Event('input', { bubbles: true });
                warningText_1.style.display = "none";           // 警告文字--隱藏
                warningText_2.style.display = "none";
                import_excel_btn.style.display = "block";       // 載入按鈕--顯示
                
            } else if(stopUpload) {
                // 沒有找到 <textarea> 元素
                console.log('請確認資料是否正確');
                warningText_1.style.display = "block";          // 警告文字--顯示
                warningText_2.style.display = "block";
                import_excel_btn.style.display = "none";        // 載入按鈕--隱藏

            }else{
                // console.log('找不到 < ? > 元素');
            }
        };
        // 20231128_下載Excel
        function downloadExcel(to_module) {
            // 定義要抓的key=>value
            const item_keys = {
                // "id"            : "aid",
                "OSHORT"        : "部門代碼",
                "OSTEXT_30"     : "廠區",
                "OSTEXT"        : "部門名稱",
                "HE_CATE"       : "類別",
                "AVG_VOL"       : "均能音量",
                "AVG_8HR"       : "工作日8小時平均音壓值",
                "MONIT_NO"      : "監測編號",
                "MONIT_LOCAL"   : "監測處所",
                "WORK_DESC"     : "作業描述",
                "flag"          : "開關",
                "created_at"    : "建檔日期",
                "updated_at"    : "最後更新",
                "updated_cname" : "最後編輯",
            };
            let sort_listData = [];                         // 建立整理陣列
            for(let i=0; i < shLocals.length; i++){
                sort_listData[i] = {};                      // 建立物件
                Object.keys(item_keys).forEach(function(i_key){
                    sort_listData[i][item_keys[i_key]] = shLocals[i][i_key];
                })
            }
            // 240813-直接擷取畫面上的table內數值~省去引入資料的大筆訊息~
                // const table = document.getElementById(to_module);
                // const headers = Array.from(table.querySelectorAll('thead th')).map(header => header.textContent.trim());
                // const rows = Array.from(table.querySelectorAll('tbody tr'));
            
                // const sort_listData = rows.map(row => {
                //     const cells = Array.from(row.querySelectorAll('td'));
                //     let rowData = {};
                //     cells.forEach((cell, index) => {
                //         rowData[headers[index]] = cell.textContent.trim();
                //     });
                //     return rowData;
                // });
                // console.log(sort_listData);

            let htmlTableValue = JSON.stringify(sort_listData);
            document.getElementById(to_module+'_htmlTable').value = htmlTableValue;
        }

    // 240823 將匯入資料合併到shLocal_inf
    async function mgInto_shLocal_inf(new_shLocal_arr){
        // 240826 進行shLocal_inf重複值的比對並合併
        shLocal_inf = shLocal_inf.concat(new_shLocal_arr);   // 合併
        let uniqueMap = new Map();      // 使用 Map 來去重

        shLocal_inf.forEach(item => {
            let key = `${item.id}-${item.OSHORT}`;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, item);
            }
        });
        // 將結果轉換為陣列
        shLocal_inf = Array.from(uniqueMap.values());
            // console.log('2-mgInto_shLocal_inf--shLocal_inf...', shLocal_inf);
        await post_shLocal(shLocal_inf)
    }
    // 240822 將匯入資料合併到staff_inf
    async function mgInto_staff_inf(excel_json_value_arr){
        // const excel_json_value_arr = JSON.parse(excel_json_value);
        // console.log('2.excel_json_value_arr...', excel_json_value_arr);
        const addIn_arr1 = ['HE_CATE', 'HE_CATE_KEY', 'no'];                                        // 合併陣列1
        const addIn_arr2 = {'OSTEXT_30':'emp_sub_scope', 'OSHORT':'dept_no', 'OSTEXT':'emp_dept'};  // 合併陣列2
        const excel_OSHORT_arr = [];
        Object.keys(excel_json_value_arr).forEach((e_key) => {      // 
            // 初始化 shCase 陣列
            if (!excel_json_value_arr[e_key]['shCase']) {
                excel_json_value_arr[e_key]['shCase'] = [];
            }
            // 建立一個新的物件來儲存合併的資料
            let mergedData = {};
            // 遍歷 addIn_arr1 並合併數據
            addIn_arr1.forEach((addIn_i) => {
                if (excel_json_value_arr[e_key][addIn_i]) {
                    mergedData[addIn_i] = excel_json_value_arr[e_key][addIn_i];  // 合併
                    // 刪除合併後的屬性
                    delete excel_json_value_arr[e_key][addIn_i];
                }
            });
            // 遍歷 addIn_arr2 並合併數據
            for (const [a2_key, a2_value] of Object.entries(addIn_arr2)) {
                if (excel_json_value_arr[e_key][a2_value]) {
                    mergedData[a2_key] = excel_json_value_arr[e_key][a2_value];  // 合併

                    if(a2_key=='OSHORT'){
                        excel_OSHORT_arr.push(excel_json_value_arr[e_key][a2_value])  // extra: 取得部門代號 => 抓特危場所清單用
                    }
                }
            }
            // 將合併後的物件加入 shCase 陣列中
            excel_json_value_arr[e_key]['shCase'].push(mergedData);
        });
            // 240826 進行emp_id重複值的比對並合併
                let combined = staff_inf.concat(excel_json_value_arr);   // 合併2個陣列到combined
                let uniqueStaffMap = new Map();                         // 創建一個 Map 來去除重複的 emp_id 並合併 shCase
                combined.forEach(item => {
                    if (uniqueStaffMap.has(item.emp_id)) {
                        // 如果 emp_id 已經存在，則合併 shCase
                        let existingShCase = uniqueStaffMap.get(item.emp_id).shCase;
                        uniqueStaffMap.get(item.emp_id).shCase = existingShCase.concat(item.shCase);
                    } else {
                        // 如果 emp_id 不存在，則新增
                        uniqueStaffMap.set(item.emp_id, item);
                    }
                });
                // 將 Map 轉換回陣列
                staff_inf = Array.from(uniqueStaffMap.values());

        // *** 精煉 shLocal 
            const excel_OSHORTs_str = (JSON.stringify([...new Set(excel_OSHORT_arr)])).replace(/[\[\]]/g, ''); // 過濾重複部門代號 + 轉字串
            load_fun('load_shLocal', excel_OSHORTs_str, mgInto_shLocal_inf);         // 呼叫load_fun 用 部門代號字串 取得 特作清單 => mgInto_shLocal_inf合併shLocal_inf

        await release_dataTable();                  // 停止並銷毀 DataTable
        await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
        await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
        await reload_HECateTable_Listeners();       // 重新定義HE_CATE td
    }
    // 240826 單筆刪除Staff資料
    async function eraseStaff(removeEmpId){
        if(!confirm(`確認刪除此筆(${removeEmpId})資料？`)){
            return;
        }else{

            // 創建一個 Map 來去除重複的 emp_id 並合併 shCase
            let uniqueStaffMap = new Map();

            staff_inf.forEach(item => {
                if (item.emp_id === removeEmpId) {  // 跳過這個 emp_id，達到刪除的效果
                    return;
                }
                if (uniqueStaffMap.has(item.emp_id)) {
                    // 如果 emp_id 已經存在，則合併 shCase
                    let existingShCase = uniqueStaffMap.get(item.emp_id).shCase;
                    uniqueStaffMap.get(item.emp_id).shCase = existingShCase.concat(item.shCase);
                } else {
                    // 如果 emp_id 不存在，則新增
                    uniqueStaffMap.set(item.emp_id, item);
                }
            });

            // 將 Map 轉換回陣列
            staff_inf = Array.from(uniqueStaffMap.values());

            await release_dataTable();                  // 停止並銷毀 DataTable
            await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
            await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
            await reload_HECateTable_Listeners();       // 重新定義HE_CATE td
            inside_toast(`刪除單筆資料${removeEmpId}...Done&nbsp;!!`);
        }
    }

    // [p1 函數-1] 動態生成部門代號字串並貼在#OSHORTs位置
    function mk_OSHORTs(selectedValues) {
        const selectedOSHORTs = selectedValues.reduce((acc, value) => {
            if (OSHORTsObj[value]) { // 檢查選擇的值是否存在於OSHORTsObj中
                acc[value] = OSHORTsObj[value];
            }
            return acc;
        }, {});

        const selectedOSHORTs_str = JSON.stringify(selectedOSHORTs).replace(/[\[\]]/g, '');
        $('#OSHORTs').empty().append(selectedOSHORTs_str); // 將生成的字串貼在<OSHORTs>元素中
        mk_OSHORTs_btn(selectedOSHORTs); // 呼叫函數-1-1來生成按鈕
        mk_select_OSHORTs(Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[type="checkbox"]'))); // 更新 select_OSHORTs 的內容
    }
    // [p1 函數-1-1] 動態生成步驟2的所有按鈕，並重新綁定事件監聽器
    function mk_OSHORTs_btn(selectedOSHORTs) {
        $('#OSHORTs_opts_inside').empty();
        if(Object.entries(selectedOSHORTs).length > 0){     // 判斷使否有長度值
            Object.entries(selectedOSHORTs).forEach(([ohtext_30, oh_value]) => {
                let ostext_btns = `
                    <div class="col-lm-3">
                        <div class="card">
                            <div class="card-header">${ohtext_30}</div>
                            <div class="card-body">
                                ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                    `<div class="form-check px-4">
                                        <input type="checkbox" name="OSHORTs" id="${o_key}" value="${o_key}" class="form-check-input" check >
                                        <label for="${o_key}" class="form-check-label">${o_key} (${o_value})</label>
                                    </div>`
                                ).join('')}
                            </div>
                        </div>
                    </div>`;
                $('#OSHORTs_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<OSHORTs_opts_inside>元素中
            });
        }else{
            let ostext_btns = `
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-header">空值注意</div>
                        <div class="card-body">
                            STEP-1.沒有選擇任何一個特危健康場所~ 本欄位無效!!
                        </div>
                    </div>
                </div>`;
            $('#OSHORTs_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<OSHORTs_opts_inside>元素中
        }

        // 重新綁定事件監聽器
        rebindOSHORTsOptsListeners();
    }
    // [p1 函數-2] 根據步驟2的選擇動態生成部門代號字串
    function mk_select_OSHORTs(OSHORTs_opts_arr) {
        const selectedOptsValues = OSHORTs_opts_arr.filter(cb => cb.checked).map(cb => cb.value);

        OSHORTs_opts.classList.toggle('is-invalid', selectedOptsValues.length === 0);
        OSHORTs_opts.classList.toggle('is-valid', selectedOptsValues.length > 0);
        
        load_hrdb_btn.classList.toggle('is-invalid', selectedOptsValues.length === 0);
        load_hrdb_btn.disabled = selectedOptsValues.length === 0 ;                  // 取得人事資料庫btn
        
        const selectedOptsValues_str = JSON.stringify(selectedOptsValues).replace(/[\[\]]/g, '');
        $('#select_OSHORTs').empty().append(selectedOptsValues_str); // 將生成的字串貼在<select_OSHORTs>元素中
    }
    // [p1 函數-4] 重新綁定事件監聽器給#OSHORTs_opts內的checkbox
    function rebindOSHORTsOptsListeners() {
        const OSHORTs_opts_arr = Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[type="checkbox"]'));
        
        OSHORTs_opts_arr.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                mk_select_OSHORTs(OSHORTs_opts_arr); // 呼叫函數-2
            });
        });
    }
    // [p1 函數-3] 設置事件監聽器和MutationObserver
    async function eventListener() {
        return new Promise((resolve) => {
            // 在任何地方啟用工具提示框
            $('[data-toggle="tooltip"]').tooltip();
            // [load_excel] 以下為上傳後"iframe"的部分
                // p-2 監控按下送出鍵後，打開"iframe"
                excelUpload.addEventListener('click', ()=> {
                    iframeLoadAction();
                    loadExcelForm();
                });
                // p-2 監控按下送出鍵後，打開"iframe"，"load"後，執行抓取資料
                iframe.addEventListener('load', ()=> {
                    iframeLoadAction();
                });
                // p-2 監控按下[載入]鍵後----呼叫Excel載入
                import_excel_btn.addEventListener('click', ()=> {
                    var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    var excel_json = iframeDocument.getElementById('excel_json');           // 正確載入
                    var stopUpload = iframeDocument.getElementById('stopUpload');           // 錯誤訊息

                    if (excel_json) {
                        document.getElementById('excelTable').value = excel_json.value;
                        const excel_json_value_arr = JSON.parse(excel_json.value);
                        mgInto_staff_inf(excel_json_value_arr)      // 呼叫[fun] 
                        inside_toast(`批次匯入Excel資料...Done&nbsp;!!`);

                    } else if(stopUpload) {
                        console.log('請確認資料是否正確');
                    }else{
                        console.log('找不到 ? 元素');
                    }
                });

            const OSHORTsDiv = document.getElementById('OSHORTs');               // 定義OSHORTsDiv變量
            const OSHORTs_opts = document.getElementById('OSHORTs_opts_inside'); // 定義OSHORTs_opts變量

            // [步驟-1-5] 監聽步驟1[棟別]的checkbox變化
            OSTEXT_30s.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (this.value === 'All') {
                        OSTEXT_30s.forEach(cb => cb.checked = this.checked); // 全選或取消全選
                    } else {
                        const allCheckbox = OSTEXT_30s.find(cb => cb.value === 'All');
                        const nonAllCheckboxes = OSTEXT_30s.filter(cb => cb.value !== 'All');
                        allCheckbox.checked = nonAllCheckboxes.every(cb => cb.checked); // 更新"All"狀態
                    }

                    const selectedValues = OSTEXT_30s.filter(cb => cb.checked).map(cb => cb.value);
                    OSTEXT_30_Out.classList.toggle('is-invalid', selectedValues.length === 0);
                    OSTEXT_30_Out.classList.toggle('is-valid', selectedValues.length > 0);

                    mk_OSHORTs(selectedValues); // 呼叫函數-1生成部門代號字串
                });
            });

            // 初始化監聽器
            rebindOSHORTsOptsListeners();

            // 使用MutationObserver監控OSHORTs區域內文本變化
            const observer = new MutationObserver(() => {
                const isEmpty = OSHORTsDiv.innerText.trim() === '';
                OSHORTs_opts.classList.toggle('is-invalid', isEmpty);
                OSHORTs_opts.classList.toggle('is-valid', !isEmpty);

                // 每次 OSHORTs 變動時也更新 select_OSHORTs 的內容
                mk_select_OSHORTs(Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[type="checkbox"]')));
            });
            observer.observe(OSHORTsDiv, { childList: true, subtree: true }); // 設置觀察選項並開始監控

            // 監聽 p1 load_hrdb_btn 取得人事資料庫
            load_hrdb_btn.addEventListener('click', function() {
                const select_OSHORTs_str = document.getElementById('select_OSHORTs').innerText; // 取得部門代號字串
                // $('#shLocal_table tbody').empty();
                // load_fun('load_shLocal', select_OSHORTs_str, post_shLocal);         // 呼叫load_fun 用 部門代號字串 取得 特作清單 => post_shLocal渲染
                // load_fun('load_shLocal', select_OSHORTs_str, mgInto_shLocal_inf);   // 呼叫load_fun 用 部門代號字串 取得 特作清單 => mgInto_shLocal_inf合併 // 動作合併到mgInto_staff_inf裡面去執行
                // $('#hrdb_table tbody').empty();
                // load_fun('load_hrdb', select_OSHORTs_str, post_hrdb);               // 呼叫load_fun 用 部門代號字串 取得 人員清單 => post_hrdb渲染
                load_fun('load_hrdb', select_OSHORTs_str, mgInto_staff_inf);         // 呼叫load_fun 用 部門代號字串 取得 人員清單 => post_hrdb渲染
                inside_toast('取得&nbsp;hrdb員工清單...Done&nbsp;!!');
                $('#nav-p2-tab').tab('show');                                       // 切換頁面
            });

            // 監聽 p2 edit_shLocal 之修正鈕
            const editShLocalBtn = document.getElementById('edit_shLocal_btn');
            editShLocalBtn.addEventListener('click', editShLocal_toShCase)

            // 當所有設置完成後，resolve Promise
            resolve();
        });
    }
    // [p1 函數-5] 多功能擷取fun 新版改用fetch
    async function load_fun(fun, parm, myCallback) {        // parm = 參數
        mloading(); 
        // console.log(fun, parm);
        try {
            let formData = new FormData();
                formData.append('fun', fun);
                formData.append('parm', parm);                  // 後端依照fun進行parm參數的採用

            let response = await fetch('load_fun.php', {
                method : 'POST',
                body   : formData
            });

            if (!response.ok) {
                throw new Error('fun load ' + fun + ' failed. Please try again.');
            }

            let responseData = await response.json();
            let result_obj = responseData['result_obj'];    // 擷取主要物件

            return myCallback(result_obj);                  // resolve(true) = 表單載入成功，then 呼叫--myCallback
                                                            // myCallback：form = bring_form() 、document = edit_show() 、
        } catch (error) {
            $("body").mLoading("hide");
            throw error;                                    // 載入失敗，reject
        }
    }
    // [p1 函數-6] 渲染hrdb
    async function post_hrdb(emp_arr){
        // console.log('post_hrdb--emp_arr...', emp_arr);
        $('#hrdb_table tbody').empty();
        if(emp_arr.length === 0){
            $('#hrdb_table tbody').append('<div class="text-center text-dnager">沒有資料</div>');
        }else{
            // 停止並銷毀 DataTable
            release_dataTable();
            await Object(emp_arr).forEach((emp_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                // console.log(emp_i);
                let tr = '<tr>';
                    // // Object.entries(emp_i).forEach(([e_key, e_value]) => {
                    // //     tr += '<td>' + e_value + '</td>';
                    // // })
                    // // tr += `<td class="text-center"><input type="checkbox" name="emp_ids[]" id="${emp_i.emp_id}" value="${emp_i.emp_id}" class="form-check-input" checked></td>`;
                    // tr += `<td class="text-center">
                    //         <button type="button" class="btn btn-warning btn-sm btn-xs" name="emp_id" value="${emp_i.emp_id}"  
                    //             data-bs-toggle="modal" data-bs-target="#import_shLocal" onclick="reNew_empId(this.value)">挑選</button></td>`;

                tr += `<td>${emp_i.emp_sub_scope}</td> <td>${emp_i.dept_no}</br>${emp_i.emp_dept}</td>`;
                tr += `<td class="text-center">${emp_i.emp_id}</br><button type="button" class="btn btn-outline-primary add_btn " name="emp_id" value="${emp_i.emp_id}"
                        data-bs-toggle="modal" data-bs-target="#import_shLocal" onclick="reNew_empId(this.value)">${emp_i.cname}</button></td>`;
                tr += `<td id="MONIT_LOCAL,${emp_i.emp_id}"></td> <td id="WORK_DESC,${emp_i.emp_id}"></td> <td id="HE_CATE,${emp_i.emp_id}" class="HE_CATE"></td> <td id="AVG_VOL,${emp_i.emp_id}"></td> <td id="AVG_8HR,${emp_i.emp_id}"></td>`;
                tr += `<td><input type="number" id="DEH,${emp_i.emp_id}" name="DEH" class="form-control"></td> <td id="NC,${emp_i.emp_id}"></td>`;
                tr += `<td class="text-center"><input type="checkbox" id="SH3,${emp_i.emp_id}" name="emp_ids[]" value="${emp_i.emp_id}" class="form-check-input" >`;
                tr += `&nbsp;&nbsp;<button type="button" class="btn btn-danger btn-sm btn-xs" value="${emp_i.emp_id}" onclick="eraseStaff(this.value)">刪除</button></td>`;
                tr += emp_i.HIRED ? `<td>${emp_i.HIRED}</td>` : `<td> -- </td>`;
                tr += '</tr>';
                $('#hrdb_table tbody').append(tr);
            })
            await reload_dataTable(emp_arr);               // 倒參數(陣列)，直接由dataTable渲染
        }
        $("body").mLoading("hide");
    }
        // 假設你有一個 clearDOM 函數，這個函數會根據 select_empId 清空對應的 DOM 區域
        async function clearDOM(empId) {
            // const container = document.querySelector(`#yourContainerId-${empId}`); // 修改為你的容器 ID
            // if (container) {
            //     container.innerHTML = ''; // 清空容器內容
            // }
            // 使用屬性選擇器選取所有包含 empId 的 td 元素
            const tdsToClear = document.querySelectorAll(`td[id*=",${empId}"]`);
            // 遍歷這些選取到的元素並清空內容
            tdsToClear.forEach(td => {
                td.innerHTML = '';
            });
        }
        // 通用的函數，用於更新 DOM
        async function updateDOM(sh_value, select_empId, sh_key_up) {
            // 欲更新的欄位陣列
            const shLocal_item_arr = ['MONIT_LOCAL', 'WORK_DESC', 'HE_CATE', 'AVG_VOL', 'AVG_8HR'];
            shLocal_item_arr.forEach((sh_item) => {
                if (sh_value[sh_item]) {
                    const nbsp = sh_key_up > 1 ? '<br>' : '';
                    const inner_Value = sh_item.includes('AVG') ? `${nbsp}${sh_value[sh_item]}` : `${nbsp}${sh_key_up}: ${sh_value[sh_item]}`;
                    document.getElementById(`${sh_item},${select_empId}`).insertAdjacentHTML('beforeend', inner_Value);

                    // 噪音驗證
                    if (sh_item === 'HE_CATE' && sh_value['HE_CATE'].includes('噪音') && sh_value['AVG_VOL']) {
                        const noise_check = (sh_value['AVG_VOL'] >= 85) ? `${nbsp}${sh_key_up}: 1-符合` : `${nbsp}${sh_key_up}: 1-不符合`;
                        document.getElementById(`NC,${select_empId}`).insertAdjacentHTML('beforeend', noise_check);
                    }
                }
            });
        }
    // 渲染特危項目
    async function post_shCase(emp_arr){
        emp_arr.forEach((emp_i) => {
            const { emp_id: select_empId, shCase } = emp_i;
            if (shCase) {
                Object.entries(shCase).forEach(([sh_key, sh_value], index) => {
                    updateDOM(sh_value, select_empId, index + 1);
                });
            }
        });
    }
    // [p1 函數-7] 渲染shLocal到互動視窗
    async function post_shLocal(shLocal_arr){
        $('#shLocal_table tbody').empty();
        if(shLocal_arr.length === 0){
            $('#shLocal_table tbody').append('<div class="text-center text-dnager">沒有資料</div>');

        }else{
            shLocal_inf = shLocal_arr;                                           // 把shLocal_inf建立起來
            await Object.entries(shLocal_arr).forEach(([sh_key, sh_i])=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                // console.log(sh_i);
                let tr = '<tr>';
                Object.entries(sh_i).forEach(([s_key, s_value]) => {
                    tr += '<td>' + s_value + '</td>';
                })
                tr += `<td class="text-center"><input type="checkbox" name="shLocal_id[]" value="${sh_key}" class="form-check-input" check ></td>`;
                tr += '</tr>';
                $('#shLocal_table tbody').append(tr);
            })
        }
        await reload_shLocalTable_Listeners();      // 重新建立監聽~shLocalTable的checkbox
        $("body").mLoading("hide");
    }
    // 建立dataTable數據庫
    async function reload_dataTable(hrdb_data){
        // dataTable 2 https://ithelp.ithome.com.tw/articles/10272439
        return new Promise((resolve) => {

            // 停止並銷毀 DataTable
            release_dataTable();
            // 重新初始化 DataTable
            $('#hrdb_table').DataTable({
                "language": { url: "../../libs/dataTables/dataTable_zh.json" }, // 中文化
                "autoWidth": false,                                             // 自動寬度
                "order": [[ 0, "asc" ], [ 1, "asc" ], [ 2, "asc" ]],            // 排序
                "pageLength": 25,                                               // 顯示長度
                // "paging": false,                                             // 分頁
                // "searching": false,                                          // 搜尋
                // "data": hrdb_data,
                // "columns": [
                    //             { data: 'emp_sub_scope' }, 
                    //             { data: 'dept_no' }, 
                    //             { data: 'emp_dept' }, 

                    //             { data: null , // title: 'emp_id', 
                    //                 render: function (data, type, row) {
                    //                     return `${emp_i.emp_id}</br><button type="button" class="btn btn-outline-primary add_btn " name="emp_id" value="${data.emp_id}" 
                    //                         data-bs-toggle="modal" data-bs-target="#import_shLocal" onclick="reNew_empId(this.value)">${data.cname}</button>`
                    //                 } }, 
                    //             { data: 'cname' }, 
                    //             { data: null , title: '工作場所', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } }, 
                    //             { data: null , title: '工作內容', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } }, 
                    //             { data: null , title: '均能音量', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } }, 
                    //             { data: null , title: '平均音壓', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } }, 
                    //             { data: null , title: '每日曝露時數', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } }, 
                    //             { data: null , title: '檢查類別代號', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } },
                    //             { data: null , title: '噪音作業判斷', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } },
                    //             { data: null , title: '特殊健檢資格驗證', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } },
                    //             { data: 'HIRED' , title: '到職日'},
                //     ]
            });

           // 當所有設置完成後，resolve Promise
           resolve();
        });
    }
    // 更換shLocal_modal內的emp_id值
    function reNew_empId(this_value){
        $('#import_shLocal #import_shLocal_empId').empty().append(this_value);
    }
    // [p1 函數-4] 建立監聽~shLocalTable的checkbox
    let importShLocalBtnListener;
    async function reload_shLocalTable_Listeners() {
        return new Promise((resolve) => {
            const importShLocalBtn = document.getElementById('import_shLocal_btn');

            // 檢查並移除已經存在的監聽器
            if (importShLocalBtnListener) {
                importShLocalBtn.removeEventListener('click', importShLocalBtnListener);
            }
            // 定義新的監聽器函數
            importShLocalBtnListener = function () {
                const select_empId = document.querySelector('#import_shLocal #import_shLocal_empId').innerText;
                const selectedOptsValues = Array.from(document.querySelectorAll('#import_shLocal #shLocal_table input[type="checkbox"]:checked')).map(cb => cb.value);

                selectedOptsValues.forEach((sov_vaule, index) => {
                    const empData = staff_inf.find(emp => emp.emp_id === select_empId);
                    if (empData) {
                        empData.shCase = empData.shCase || [];
                        empData.shCase[index] = shLocal_inf[sov_vaule];
                        updateDOM(shLocal_inf[sov_vaule], select_empId, index + 1);
                    }
                });
            };

            // 添加新的監聽器
            importShLocalBtn.addEventListener('click', importShLocalBtnListener);
            resolve();
        });
    }
    // [p2 函數-4] 建立監聽~shLocalTable的HE_CATE td
    let HECateClickListener;
    async function reload_HECateTable_Listeners() {
        return new Promise((resolve) => {
            const HECate = document.querySelectorAll('[class="HE_CATE"]');      //  定義出範圍

            // 檢查並移除已經存在的監聽器
            if (HECateClickListener) {
                HECate.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                    tdItem.removeEventListener('click', HECateClickListener);   // 將每一個tdItem移除監聽, 當按下click
                })
            }
            // 定義新的監聽器函數
            HECateClickListener = function () {
                const this_id_arr = this.id.split(',')                  // 分割this.id成陣列
                // console.log('tdItem...', this_id_arr[1])
                const edit_emp_id = this_id_arr[1];                     // 取出陣列1=emp_id
                $('#edit_shLocal #edit_shLocal_empId').empty().append(edit_emp_id); // 清空+填上工號
                $('#edit_shLocal tbody').empty();                       // 清空tbody
    
                Object.entries(staff_inf).forEach(([e_index, e_value]) => {
                    if(e_value['emp_id'] === edit_emp_id){
                        const shCase = e_value['shCase']
                        console.log('HECate--staff_inf...', e_index, shCase);
                        if(shCase.length > 0){
                            const shLocal_item_arr = ['id', 'OSTEXT_30', 'OSHORT', 'OSTEXT', 'HE_CATE', 'AVG_VOL', 'AVG_8HR', 'MONIT_NO', 'MONIT_LOCAL', 'WORK_DESC'];
                            Object.entries(shCase).forEach(([sh_i, sh_v])=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                                if(sh_v['id'] !== undefined || sh_v['no'] !== undefined){
                                    let tr = '<tr>';
                                    Object(shLocal_item_arr).forEach((item_i) => {
                                        tr += (sh_v[item_i]) ? '<td>' + sh_v[item_i] + '</td>' : '<td></td>';
                                    })
                                    tr += `<td class="text-center"><input type="checkbox" name="edit_shLocal_id[]" value="${sh_i}" class="form-check-input" checked ></td>`;
                                    tr += '</tr>';
                                    $('#edit_shLocal_table tbody').append(tr);
                                }
                            })
                        }else{
                            $('#edit_shLocal_table tbody').append('沒有資料');
                        }
                    }
                })
                edit_shLocal_modal.show();

            }
            // 添加新的監聽器
            HECate.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                tdItem.addEventListener('click', HECateClickListener);      // 將每一個tdItem增加監聽, 當按下click
            })
            resolve();
        });
    }
    // 執行監聽 p2 edit_shLocal 之修正鈕呼叫
    async function editShLocal_toShCase(){
        const select_empId = document.querySelector('#edit_shLocal #edit_shLocal_empId').innerText;
        const selectedOptsValues = Array.from(document.querySelectorAll('#edit_shLocal #edit_shLocal_table input[type="checkbox"]:checked')).map(cb => cb.value);
        console.log('selectedOptsValues...', selectedOptsValues);

        const empData = staff_inf.find(emp => emp.emp_id === select_empId);
        if (empData) {
            empData.shCase = empData.shCase || [];

            // 先移除未勾選的項目
            empData.shCase = empData.shCase.filter(shCaseItem => 
                selectedOptsValues.includes(shCaseItem.id) // 假設 shCaseItem.id 是你用來比對的值
            );
            // 清空目前顯示的 DOM
            clearDOM(select_empId); // 你需要根據 select_empId 來清空對應的 DOM

            // 然後將新勾選的項目加入或更新
            selectedOptsValues.forEach((sov_value, index) => {
                const existingIndex = empData.shCase.findIndex(item => item.id === sov_value);
                if (existingIndex === -1) {
                    // 若項目不存在，新增到陣列
                    empData.shCase.push(shLocal_inf[sov_value]);
                } else {
                    // 若項目已存在，更新該項目
                    empData.shCase[existingIndex] = shLocal_inf[sov_value];
                }
                // 更新 DOM
                updateDOM(shLocal_inf[sov_value], select_empId, index + 1);
            });
            // await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
        }
    }

    $(function() {
        // [步驟-1] 初始化設置
        const selectedValues = OSTEXT_30s.filter(cb => cb.checked).map(cb => cb.value);
        mk_OSHORTs(selectedValues); // 呼叫函數-1

        eventListener(); // 呼叫函數-3

        let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        Balert( message, 'warning')

    });

</script>
<!-- <script src="staff.js?v=<=time()?>"></script> -->

<?php include("../template/footer.php"); ?>