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
                                    <button type="button" class="btn btn-primary" value="form.php?action=create" onclick="openUrl(this.value)" ><i class="fa fa-plus"></i> 新增</button>
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
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div id="liveToast" class="toast align-items-center bg-warning" role="alert" aria-live="assertive" aria-atomic="true" autohide="true" delay="1000">
            <div class="d-flex">
                <div class="toast-body" id="toast-body"></div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>

    <!-- 互動視窗 load_excel -->
    <div class="modal fade" id="load_excel" tabindex="-1" aria-labelledby="load_excel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">上傳Excel檔：</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body px-4">
                    <form name="excelInput" action="../_Format/upload_excel.php" method="POST" enctype="multipart/form-data" target="api" onsubmit="return shLocalExcelForm()">
                        <div class="row">
                            <div class="col-6 col-md-8 py-0">
                                <label for="excelFile" class="form-label">需求清單 <span>&nbsp<a href="../_Format/shLocal_example.xlsx" target="_blank">上傳格式範例</a></span> 
                                    <sup class="text-danger"> * 限EXCEL檔案</sup></label>
                                <div class="input-group">
                                    <input type="file" name="excelFile" id="excelFile" style="font-size: 16px; max-width: 350px;" class="form-control form-control-sm" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                                    <button type="submit" name="excelUpload" id="excelUpload" class="btn btn-outline-secondary" value="shLocal">上傳</button>
                                </div>
                            </div>
                            <div class="col-6 col-md-4 py-0">
                                <p id="warningText_1" name="warning" >＊請上傳[危害健康作業表]Excel檔</p>
                                <p id="warningText_2" name="warning" >＊請確認Excel中的資料</p>
                            </div>
                        </div>
                            
                        <div class="row" id="excel_iframe">
                            <iframe id="api" name="api" width="100%" height="30" style="display: none;" onclick="shLocalExcelForm()"></iframe>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <form action="import_excel.php" method="POST">
                        <input  type="hidden" name="excelTable"    id="excelTable"       value="">
                        <input  type="hidden" name="updated_cname" id="updated_cname"    value="<?php echo $auth_cname;?>">
                        <button type="submit" name="import_excel"  id="import_excel_btn" value="shLocal" class="btn btn-success unblock" data-bs-dismiss="modal">載入</button>
                    </form>
                    <button type="reset" class="btn btn-secondary" data-bs-dismiss="modal">返回</button>
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

    // const shLocals       = <=json_encode($shLocals)?>;    // 引入shLocal資料
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
    // fun3-3：吐司顯示字條 // init toast
    function inside_toast(sinn){
        var toastLiveExample = document.getElementById('liveToast');
        var toast = new bootstrap.Toast(toastLiveExample);
        var toast_body = document.getElementById('toast-body');
        toast_body.innerHTML = sinn;
        toast.show();
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

            const OSHORTsDiv = document.getElementById('OSHORTs'); // 定義OSHORTsDiv變量
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

            // 監聽 load_hrdb_btn 取得認識資料庫
            load_hrdb_btn.addEventListener('click', function() {

                const select_OSHORTs_str = document.getElementById('select_OSHORTs').innerText; // 將row_OSTEXT_30的字串轉換為物件
                
                // console.log('select_OSHORTs_str...', select_OSHORTs_str);

                load_fun('load_shLocal', select_OSHORTs_str, post_shLocal);

                load_fun('load_hrdb', select_OSHORTs_str, post_hrdb);

                $('#nav-p2-tab').tab('show');
            });

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
    async function post_hrdb(hrdb_arr){
        $('#hrdb_table tbody').empty();
        if(hrdb_arr.length === 0){
            $('#hrdb_table tbody').append('<div class="text-center text-dnager">沒有資料</div>');

        }else{
            staff_inf = hrdb_arr;                           // 把staff_arr建立起來
            await Object(hrdb_arr).forEach((emp_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                    console.log(emp_i);
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
                                
                    tr += `<td id="MONIT_LOCAL_${emp_i.emp_id}"></td> <td id="WORK_DESC_${emp_i.emp_id}"></td> <td id="HE_CATE_${emp_i.emp_id}"></td> <td id="AVG_VOL_${emp_i.emp_id}"></td> <td id="AVG_8HR_${emp_i.emp_id}"></td>`;
                    tr += `<td id="DEH_${emp_i.emp_id}"><input type="number" class="form-control" name="DEH"></td> <td id="NC_${emp_i.emp_id}"></td> <td id="SH3_${emp_i.emp_id}"></td>`;
                    tr += `<td>${emp_i.HIRED}</td>`;
                    tr += '</tr>';
                    $('#hrdb_table tbody').append(tr);
            })
            await reload_dataTable(hrdb_arr);               // 倒參數(陣列)，直接由dataTable渲染
        }
        $("body").mLoading("hide");
    }

    // [p1 函數-7] 渲染shLocal
    async function post_shLocal(shLocal_arr){
        $('#shLocal_table tbody').empty();
        if(shLocal_arr.length === 0){
            $('#shLocal_table tbody').append('<div class="text-center text-dnager">沒有資料</div>');

        }else{
            shLocal_inf = shLocal_arr;                                           // 把shLocal_inf建立起來
            await Object.entries(shLocal_arr).forEach(([sh_key, sh_i])=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                let tr = '<tr>';
                Object.entries(sh_i).forEach(([s_key, s_value]) => {
                    tr += '<td>' + s_value + '</td>';
                })
                tr += `<td class="text-center"><input type="checkbox" name="shLocal_id[]" value="${sh_key}" class="form-check-input" check ></td>`;
                tr += '</tr>';
                $('#shLocal_table tbody').append(tr);
            })

        }
        await reload_shLocalTable_Listeners();      // 建立監聽~shLocalTable的checkbox

        $("body").mLoading("hide");
    }
    // 建立dataTable數據庫
    async function reload_dataTable(hrdb_data){
        // dataTable 2 https://ithelp.ithome.com.tw/articles/10272439
        return new Promise((resolve) => {

            // 停止並銷毀 DataTable
            let table = $('#hrdb_table').DataTable();
                table.destroy();
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
                    //         // { data: null , title: "驗證資格",  // 這邊是欄位
                    //         //     render: function (data, type, row) {
                    //         //         return `<div class="text-center"><input type="checkbox" name="emp_ids[]" id="${data.emp_id}" value="${data.emp_id}" class="form-check-input" ></div>`
                    //         //     } 
                    //         // },
                    //         { data: 'emp_sub_scope' }, 
                    //         { data: 'dept_no' }, 
                    //         { data: 'emp_dept' }, 
                    //         { data: 'emp_id' }, 
                    //         { data: 'cname' }, 
                    //         { data: null , title: '特危作業', 
                    //             render: function (data, type, row) {
                    //                 return `<button type="button" class="btn btn-warning btn-sm btn-xs" data-bs-toggle="modal" data-bs-target="#import_shLocal" value="${data.emp_id}" onclick="reNew_empId(this.value)">挑選</button>`
                    //                 // return `<button type="button" class="btn btn-warning btn-sm btn-xs" name="emp_id" value="${data.emp_id}">挑選</button>`
                    //             } }, 
                    //         { data: null , title: '工作場所', 
                    //             render: function (data, type, row) {
                    //                 return ``
                    //             } }, 
                    //         { data: null , title: '工作內容', 
                    //             render: function (data, type, row) {
                    //                 return ``
                    //             } }, 
                    //         { data: null , title: '均能音量', 
                    //             render: function (data, type, row) {
                    //                 return ``
                    //             } }, 
                    //         { data: null , title: '平均音壓', 
                    //             render: function (data, type, row) {
                    //                 return ``
                    //             } }, 
                    //         { data: null , title: '每日曝露時數', 
                    //             render: function (data, type, row) {
                    //                 return ``
                    //             } }, 
                    //         { data: null , title: '檢查類別代號', 
                    //             render: function (data, type, row) {
                    //                 return ``
                    //             } },
                    //         { data: null , title: '噪音作業判斷', 
                    //             render: function (data, type, row) {
                    //                 return ``
                    //             } },
                    //         { data: null , title: '特殊健檢資格驗證', 
                    //             render: function (data, type, row) {
                    //                 return ``
                    //             } },
                    //         { data: 'HIRED' , title: '到職日'},
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
    async function reload_shLocalTable_Listeners() {
        return new Promise((resolve) => {
            console.log('fun reload_shLocalTable_Listeners...');
            const import_shLocal_btn = document.getElementById('import_shLocal_btn');
                //     Object.entries(staff_inf).forEach(([s_key, s_value]) => {
                //         if(staff_inf[s_key]['emp_id'] == select_empId){
                //             Object.entries(selectedOptsValues).forEach(([sov_key, sov_vaule]) => {
                //                 // 合併到陣列指定位置
                //                 if(staff_inf[s_key]['shCase'] == undefined){
                //                     staff_inf[s_key]['shCase'] = [];
                //                 }
                //                 if(staff_inf[s_key]['shCase'][sov_key] == undefined){
                //                     staff_inf[s_key]['shCase'][sov_key] = [];
                //                 }
                //                 staff_inf[s_key]['shCase'][sov_key] = shLocal_inf[sov_vaule];

                //                 // 渲染到 hrdb_table 對應欄位...
                //                 let nbsp = (sov_key > 0) ? '<br>':'';
                //                 let sov_key_up = Number(sov_key) + 1;
                //                 Object(shLocal_item_arr).forEach((s_item) => {
                //                     console.log(s_item ,shLocal_inf[sov_vaule][s_item]);
                //                     let inner_Value = (s_item.includes('AVG')) ? nbsp + shLocal_inf[sov_vaule][s_item] : nbsp + sov_key_up +': '+ shLocal_inf[sov_vaule][s_item];
                //                     $('#'+s_item+'_'+select_empId).append(inner_Value);
                //                 })
                //             })
                //         }
                //     })

            // 當按鈕被點擊時觸發處理邏輯
            import_shLocal_btn.addEventListener('click', () => {
                // 取得選中的員工 ID
                const select_empId = document.querySelector('#import_shLocal #import_shLocal_empId').innerText;
                // 取得所有選中的 checkbox 值
                const selectedOptsValues = Array.from(document.querySelectorAll('#import_shLocal #shLocal_table input[type="checkbox"]:checked')).map(cb => cb.value);
                // 欲更新的欄位陣列
                const shLocal_item_arr = ['MONIT_LOCAL', 'WORK_DESC', 'HE_CATE', 'AVG_VOL', 'AVG_8HR'];
                // 遍歷選中的選項
                selectedOptsValues.forEach((sov_vaule, sov_key) => {
                    const empData = staff_inf.find(emp => emp.emp_id === select_empId);     // 找到對應的員工資料
                    if (empData) {
                        empData.shCase = empData.shCase || [];                              // 初始化 shCase 陣列，如果不存在的話
                        empData.shCase[sov_key] = shLocal_inf[sov_vaule];                   // 將 shLocal_inf 中對應的值賦予 shCase 中相應的位置
                        const nbsp = sov_key > 0 ? '<br>' : '';                             // 生成分隔符號，用於非首項的數據
                        const sov_key_up = sov_key + 1;                                     // 用於顯示的索引值，因為 `sov_key` 是 0 開始的索引
                        // 更新 hrdb_table 中對應欄位的內容
                        shLocal_item_arr.forEach((s_item) => {
                            // 根據欄位類型選擇不同的顯示格式
                            const inner_Value = s_item.includes('AVG') ? `${nbsp}${shLocal_inf[sov_vaule][s_item]}` : `${nbsp}${sov_key_up}: ${shLocal_inf[sov_vaule][s_item]}`;
                            // 將生成的 HTML 插入到對應的欄位中
                            document.getElementById(`${s_item}_${select_empId}`).insertAdjacentHTML('beforeend', inner_Value);
                        });
                        // 噪音驗證noise_check1
                        if(shLocal_inf[sov_vaule]['HE_CATE'].includes('噪音')){
                            // console.log('noise_check1...', noise_check1);
                            const noise_check = (shLocal_inf[sov_vaule]['AVG_VOL'] >= 85) ? `${nbsp}${sov_key_up}: 1-符合` : `${nbsp}${sov_key_up}: 1-不符合`;
                            // 將生成的 HTML 插入到對應的欄位中
                            document.getElementById(`NC_${select_empId}`).insertAdjacentHTML('beforeend', noise_check);
                        }
                    }
                });
            });
            // 當所有設置完成後，resolve Promise
           resolve();
        });
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