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
    <script src="../../libs/jquery/jquery.mloading.js"></script>                                    <!-- mloading JS 1/3 -->
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">                            <!-- mloading CSS 2/3 -->
    <script src="../../libs/jquery/mloading_init.js"></script>                                      <!-- mLoading_init.js 3/3 -->
    <style>
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
                                <div id="OSTEXT_30_Out" class="col-12 p-3 form-control is-valid" >
                                    <div class='form-check px-4 py-1'>
                                        <input type='checkbox' name='OSTEXT_30_All' id='OSTEXT_30_All' value='All' class='form-check-input' checked >
                                        <label for='OSTEXT_30_All' class='form-check-label'>All</label>
                                    </div>
                                    <snap id="OSTEXT_30" class=" px-3 inf" >
                                        <?php foreach($shLocal_OSTEXT_30s as $OSTEXT_30_i){
                                                echo "<div class='form-check px-3'>";
                                                echo "<input type='checkbox' name='OSTEXT_30[]' id='OSTEXT_30_{$OSTEXT_30_i["OSTEXT_30"]}' value='{$OSTEXT_30_i["OSTEXT_30"]}' class='form-check-input' checked >";
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
                                <div id="step-3" class="col-12 p-3 form-control ">
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
                                        <th title="emp_sub_scope">廠區</th>
                                        <th title="dept_no" data-toggle="tooltip" data-placement="bottom">部門代碼</th>
                                        <th title="emp_dept">部門名稱</th>
                                        <th title="emp_id">工號</th>
                                        <th title="cname">姓名</th>
                                        <th title="cstext">職稱</th>
                                        <th title="gesch">性別</th>
                                        <th title="emp_group">員工群組</th>
                                        <th title="natiotxt">國籍</th>
                                        <th title="schkztxt">班別</th>
                                        <th title="updated_at">最後更新</th>
                                        <th title="flag">勾選</th>
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
    
    // [p1 步驟-0] 取得重要資訊
    const OSHORTsObj = JSON.parse(document.getElementById('row_OSTEXT_30').innerText); // 將row_OSTEXT_30的字串轉換為物件
    const OSTEXT_30_Out = document.getElementById('OSTEXT_30_Out'); // 取得步驟1篩選後的特危健康場所
    const OSTEXT_30s = Array.from(OSTEXT_30_Out.querySelectorAll('input[type="checkbox"]')); // 取得所有checkbox元素
    const load_hrdb_btn = document.getElementById('load_hrdb_btn');

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
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-header">${ohtext_30}</div>
                            <div class="card-body">
                                ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                    `<div class="form-check px-4">
                                        <input type="checkbox" name="OSHORTs" id="${o_key}" value="${o_key}" class="form-check-input" checked>
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
                // console.log('select_OSHORTs_str...', select_OSHORTs_str, typeof(select_OSHORTs_str));
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
            // await Object(hrdb_arr).forEach((emp_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
            //     // console.log(emp_i);
            //     let tr = '<tr>';
            //     Object.entries(emp_i).forEach(([e_key, e_value]) => {
            //         tr += '<td>' + e_value + '</td>';
            //     })
            //     tr += `<td class="text-center"><input type="checkbox" name="emp_ids[]" id="${emp_i.emp_id}" value="${emp_i.emp_id}" class="form-check-input" checked></td>`;
            //     tr += '</tr>';
            //     $('#hrdb_table tbody').append(tr);
            // })

            reload_dataTable(hrdb_arr);             // 到參數(陣列)，直接由dataTable渲染
        }

        $("body").mLoading("hide");
    }

    function reload_dataTable(hrdb_data){
        // dataTable 2 https://ithelp.ithome.com.tw/articles/10272439

        // 停止並銷毀 DataTable
        let table = $('#hrdb_table').DataTable();
            table.destroy();
        // 重新初始化 DataTable
        $('#hrdb_table').DataTable({
            "data": hrdb_data,
            "columns": [
                            { data: 'emp_sub_scope' }, 
                            { data: 'dept_no' }, 
                            { data: 'emp_dept' }, 
                            { data: 'emp_id' }, 
                            { data: 'cname' }, 
                            { data: 'cstext' }, 
                            { data: 'gesch' }, 
                            { data: 'emp_group' }, 
                            { data: 'natiotxt' }, 
                            { data: 'schkztxt' }, 
                            { data: 'updated_at' },
                            { data: null , title: "勾選功能",  // 這邊是欄位
                                render: function (data, type, row) {
                                    return `<div class="text-center"><input type="checkbox" name="emp_ids[]" id="${data.emp_id}" value="${data.emp_id}" class="form-check-input" checked></div>`
                                } 
                            },
                        ],
                // "paging": false,     // 分頁
                // "searching": false,  // 搜尋
                // "destroy": true,
            "autoWidth": false,     // 自動寬度
            // 排序
            "order": [[ 0, "asc" ], [ 1, "asc" ], [ 3, "asc" ]],
            // 顯示長度
            "pageLength": 25,
            // 中文化
            "language": {
                url: "../../libs/dataTables/dataTable_zh.json"
            }
        });
    }

    $(function() {
        // [步驟-1] 初始化設置
        const selectedValues = OSTEXT_30s.filter(cb => cb.checked).map(cb => cb.value);
        mk_OSHORTs(selectedValues); // 呼叫函數-1

        eventListener(); // 呼叫函數-3
    });




</script>
<!-- <script src="staff.js?v=<=time()?>"></script> -->

<?php include("../template/footer.php"); ?>