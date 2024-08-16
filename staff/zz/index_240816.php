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
                            <button class="nav-link active" id="nav-p1-tab" data-bs-toggle="tab" data-bs-target="#nav-p1_table" type="button" role="tab" aria-controls="nav-p1" aria-selected="false">特危作業人員管理</button>
                            <button class="nav-link" id="nav-p2-tab" data-bs-toggle="tab" data-bs-target="#nav-p2_table" type="button" role="tab" aria-controls="nav-p2" aria-selected="false">p2</button>
                            <button class="nav-link" id="nav-p3-tab" data-bs-toggle="tab" data-bs-target="#nav-p3_table" type="button" role="tab" aria-controls="nav-p3" aria-selected="false">p3</button>
                        </div>
                    </nav>
                </div>
                <!-- 內頁 -->
                <div class="tab-content" id="nav-tabContent">
                    <!-- p1 -->
                    <div id="nav-p1_table" class="tab-pane fade show active" role="tabpanel" aria-labelledby="nav-p1-tab">
                        <div class="col-12 bg-white">
                            <!-- step-0 資料交換 -->
                            <p>
                                <button class="btn btn-sm btn-xs btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#step1-1" aria-expanded="false" aria-controls="step1-1">step1-1</button>
                                <button class="btn btn-sm btn-xs btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#step1-2" aria-expanded="false" aria-controls="step1-2">step1-2</button>
                                <button class="btn btn-sm btn-xs btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#step2-1" aria-expanded="false" aria-controls="step2-1">step2-1</button>
                                <button class="btn btn-sm btn-xs btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#step2-2" aria-expanded="false" aria-controls="step2-2">step2-2</button>
                                <button class="btn btn-sm btn-xs btn-primary" type="button" data-bs-toggle="collapse" data-bs-target=".multi-collapse" aria-expanded="false" aria-controls="step1-1 step1-2 step2-1 step2-2">Toggle both elements</button>
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
                                    <div class="col">
                                        <div class="collapse multi-collapse" id="step2-2">
                                            <div class="card card-body" id="">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            <!-- step-1 -->
                            <div class="col-12 p-1">
                                <label for="OSTEXT_30" class="form-label">STEP-1.篩選特危健康場所：<sup class="text-danger"> *</sup></label>
                                <snap id="OSTEXT_30_Out" class="border rounded p-3 form-control is-valid" >
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
                                </snap>
                                <div class='invalid-feedback pt-0' id='OSTEXT_30_Out_feedback'>* STEP-1.特危健康場所至少需勾選一項 !! </div>
                            </div>
                            <!-- step-2 -->
                            <div class="col-12 p-1">
                                <label for="OSHORTs_opts" class="form-label">STEP-2.特危健康場所部門代號：<sup class="text-danger"> *</sup></label>
                                    <div id="OSHORTs_opts" class="row is-valid"> 
                                        <!-- 放checkbox按鈕的地方 -->
                                    </div>
                                <div class='invalid-feedback pt-0' id='OSHORTs_opts_feedback'>* STEP-2.特危健康場所部門代號至少需有一項 !! </div>
                            </div>


                            <hr>
                            <!-- by各shLocal： -->
                            <div class="row">
                                <!-- Bootstrap Alarm -->
                                <div id="liveAlertPlaceholder" class="col-12 text-center mb-0 py-0"></div>
                                <!-- sort/groupBy function -->
                                <div class="col-md-8 py-0 ">
                                    <form action="" method="GET">
                                        <div class="input-group">
                                            <span class="input-group-text">篩選</span>
                                            <select name="fab_title" id="fab_title" class="form-select" >
                                                <option value="" hidden selected >-- 請選擇 Fab --</option>
                                                <?php 
                                                    echo '<option for="fab_title" value="All" '.($fab_title == "All" ? "selected":"").' >-- All 所有棟別 --</option>';
                                                    echo '<option for="fab_title" value="allMy" '.($fab_title == "allMy" ? "selected":"").' >-- allMy 部門轄下 '.($sfab_id_str ? " (".$sfab_id_str.")":"").' --</option>';
                                                    foreach($fab_lists as $fab){
                                                        echo "<option for='fab_title' value='{$fab["fab_title"]}' ".($fab["fab_title"] == $fab_title ? "selected" : "" ) ." >";
                                                        echo $fab["id"]."：".$fab["site_title"]."&nbsp".$fab["fab_title"]." ( ".$fab["fab_remark"]." )"; 
                                                        echo ($fab["flag"] == "Off") ? " - (已關閉)":"" ."</option>";
                                                    } ?>
                                            </select>
                                            <select name="OSHORT" id="OSHORT" class="form-select" >
                                                <option value="" hidden selected >-- 請選擇 部門代號 --</option>
                                                <?php 
                                                    echo '<option for="OSHORT" value="All" '.($OSHORT == "All" ? "selected":"" ).' >-- All 所有類型 --</option>';
                                                    foreach($OSHORT_lists as $OSHORTs){
                                                        echo "<option for='OSHORT' value='{$OSHORTs["OSHORT"]}' ";
                                                        echo ($OSHORTs["OSHORT"] == $OSHORT ? "selected" : "" )." >".$OSHORTs["OSHORT"]." (".$OSHORTs["OSTEXT"].")</option>";
                                                    } ?>
                                            </select>
                                            <select name="flag" id="flag" class="form-select" >
                                                <option value="" hidden selected >-- 請選擇 開關狀態 --</option>
                                                <?php 
                                                    echo '<option for="flag" value="All" '.($flag == "All" ? "selected":"").' >-- All 所有狀態 --</option>';
                                                    echo '<option for="flag" value="On"  '.($flag == "On"  ? "selected":"").' >On</option>';
                                                    echo '<option for="flag" value="Off" '.($flag == "Off" ? "selected":"").' >Off</option>';
                                                ?>
                                            </select>
                                            <button type="submit" class="btn btn-outline-secondary search_btn" >&nbsp<i class="fa-solid fa-magnifying-glass"></i>&nbsp查詢</button>
                                        </div>
                                    </form>
                                </div>
                                <div class="col-md-4 py-0 text-end">
                                
                                    <button type="button" id="load_hrdb_btn"  class="btn btn-outline-warning add_btn" ><i class="fa-solid fa-arrows-rotate"></i> 取得人事資料庫</button>
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
                            <table id="shLocal" class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th title="OSTEXT_30">廠區</th>
                                        <th data-toggle="tooltip" data-placement="bottom" title="OSHORT">部門代碼</th>
                                        <th title="OSTEXT">部門名稱</th>
                                        <th title="HE_CATE">類別</th>
                                        <th title="AVG_VOL">均能音量</th>
                                        <th title="AVG_8HR/工作日8小時平均音壓值">8hr平均音壓</th>
                                        <th title="MONIT_NO">監測編號</th>
                                        <th title="MONIT_LOCAL">監測處所</th>
                                        <th title="WORK_DESC">作業描述</th>
                                        <th title="flag">開關</th>
                                        <th title="updated">最後更新</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach($shLocals as $shLocal){ ?>
                                        <tr>
                                            <td><?php echo $shLocal['OSTEXT_30'];?></td>
                                            <td><?php echo $shLocal['OSHORT'];?></td>
                                            <td><?php echo $shLocal['OSTEXT'];?></td>
                                            <td><?php echo $shLocal['HE_CATE'];?></td>

                                            <td><?php echo $shLocal['AVG_VOL'];?></td>
                                            <td><?php echo $shLocal['AVG_8HR'];?></td>
                                            <td><?php echo $shLocal["MONIT_NO"];?></td>
                                            <td><?php echo $shLocal['MONIT_LOCAL'];?></td>

                                            <td class="word_bk"><?php echo $shLocal['WORK_DESC'];?></td>
                                            <td><?php 
                                                    echo "<span class='badge rounded-pill ";
                                                    echo ($shLocal['flag'] == "On") ? "bg-success ":" bg-danger ";
                                                    echo "'>".$shLocal['flag']."</span>"
                                                ?></td>
                                            <td class="h6"><?php 
                                                    echo substr($shLocal["updated_at"],0,10)."<br>".$shLocal['updated_cname'];
                                                    if($sys_role <= 1){ 
                                                        echo "&nbsp;<button type='button' value='../sh_local/form.php?action=edit&id={$shLocal["id"]}' class='btn btn-sm btn-xs btn-outline-success add_btn'";
                                                        echo " onclick='openUrl(this.value)' data-toggle='tooltip' data-placement='bottom' title='編輯'><i class='fa-solid fa-pen-to-square'></i></button>";
                                                    } 
                                                ?></td>
                                        </tr>
                                    <?php } ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!-- p2 -->
                    <div id="nav-p2_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p2-tab">
                        p2
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
    
    // [step-0] 取得重要資訊
        const OSHORTs = document.getElementById('row_OSTEXT_30').innerText;    // 取得row_OSTEXT_30原始的fab+sign_code陣列
        const OSHORTsObj = JSON.parse(OSHORTs);                                // row_OSTEXT_30字串 轉 物件Obj for 生成STEP-1.篩選特危健康場所
        const OSTEXT_30_Out = document.getElementById('OSTEXT_30_Out');        // 取得STEP-1.篩選特危健康場所
        const OSTEXT_30s = Array.from(OSTEXT_30_Out.querySelectorAll('input[type="checkbox"]'));

        // [fun-1] 動態生成部門代號字串，並貼在指定位置#OSHORTs
        function mk_OSHORTs(selectedValues){
            // 根據 selectedValues 從 OSHORTsObj 中取得對應的值
            // const selectedOSHORTs = selectedValues.map(value => OSHORTsObj[value]).filter(value => value !== undefined);
            const selectedOSHORTs = selectedValues.reduce((acc, value) => {
                if (OSHORTsObj[value] !== undefined) { acc[value] = OSHORTsObj[value]; }
                return acc;
            }, {});
            // console.log('selectedOSHORTs...', selectedOSHORTs); // 輸出: ['9T521502', '9T952501']
            selectedOSHORTs_str = JSON.stringify(selectedOSHORTs).replace(/[\[\]]/g, '');   // 正則表達式
            $('#OSHORTs').empty().append(selectedOSHORTs_str);                      // target step1-2 <OSHORTs>

            mk_OSHORTs_btn(selectedOSHORTs);                                        // 呼叫[fun-1-1]生成按鈕
        }
        // [fun-1-1] 動態生成step-2的所有按鈕
        function mk_OSHORTs_btn(selectedOSHORTs){
            $('#OSHORTs_opts').empty();
            for (const [ohtext_30, oh_value] of Object.entries(selectedOSHORTs)) {
                // console.log(ohtext_30);
                let ostext_btns = '<div class="col-md-3"><div class="card">'+'<div class="card-header">'+ ohtext_30 +'</div>'+'<div class="card-body">';
                Object.entries(oh_value).forEach(([o_key, o_value]) => {
                    // console.log(o_key, o_value);
                    ostext_btns += '<div class="form-check px-4">'
                        + '<input type="checkbox" name="OSHORTs" id="'+o_key+'" value="'+o_key+'" class="form-check-input" checked >'
                        + '<label for="'+o_key+'" class="form-check-label">'+o_key+' ('+o_value+')</label></div>';
                })
                ostext_btns += '</div>'+'</div>'+'</div>';
                $('#OSHORTs_opts').append(ostext_btns);                         // target <OSHORTs_opts> step-2 按鈕
            }

        }
        // [fun-2] 依照step-2.特危健康場所部門代號 選擇結果，動態生成 部門代號字串
        function mk_select_OSHORTs(OSHORTs_opts_arr){
            const selectedOptsValues = OSHORTs_opts_arr.filter(cb => cb.checked).map(cb => cb.value);
            // console.log('selectedOptsValues...目前選擇結果：', selectedOptsValues);
            if (selectedOptsValues.length > 0) { // 有選
                OSHORTs_opts.classList.remove('is-invalid');
                OSHORTs_opts.classList.add('is-valid');
            } else { // 沒選
                OSHORTs_opts.classList.remove('is-valid');
                OSHORTs_opts.classList.add('is-invalid');
            }
            selectedOptsValues_str = JSON.stringify(selectedOptsValues).replace(/[\[\]]/g, '');   // 正規表達式
            $('#select_OSHORTs').empty().append(selectedOptsValues_str);                // target step2-1 <select_OSHORTs>
        }
        // [fun-3]
        async function eventListener(){
            return new Promise((resolve) => { 
                // [step-1-5] 監聽step-1.[棟別]的選擇狀態
                    OSTEXT_30s.forEach(checkbox => {
                        checkbox.addEventListener('change', function() {
                            if(this.value == 'All'){
                                OSTEXT_30s.forEach(cb => cb.checked = this.checked);

                            }else{  // 以下是 以上皆是/否
                                const allCheckbox = OSTEXT_30s.find(cb => cb.value == 'All');
                                const nonAllCheckboxes = OSTEXT_30s.filter(cb => cb.value != 'All');
                                const allChecked = nonAllCheckboxes.every(cb => cb.checked);
                                allCheckbox.checked = allChecked;       // 更新"All"狀態
                            }
                            const selectedValues = OSTEXT_30s.filter(cb => cb.checked).map(cb => cb.value);
                            // console.log('selectedValues...目前選擇結果：', selectedValues);
                            if (selectedValues.length > 0) { // 有選
                                OSTEXT_30_Out.classList.remove('is-invalid');
                                OSTEXT_30_Out.classList.add('is-valid');
                                OSTEXT_30s.forEach(cb => cb.required = false);
                            } else { // 沒選
                                OSTEXT_30_Out.classList.remove('is-valid');
                                OSTEXT_30_Out.classList.add('is-invalid');
                                OSTEXT_30s.forEach(cb => cb.required = true);
                            }
                            mk_OSHORTs(selectedValues);                                                 // [step-1-2] 先呼叫[fun-1]生成部門代號字串
                            const OSHORTs_opts_arr = Array.from(OSHORTs_opts.querySelectorAll('input[type="checkbox"]'));
                            mk_select_OSHORTs(OSHORTs_opts_arr);                                                // [step-1-3] 呼叫[fun-2]
                        });
                    });

                // 監聽 STEP-2.特危健康場所部門代號選擇狀態，並更新生成字串
                    const OSHORTsDiv = document.getElementById('OSHORTs');
                    const OSHORTs_opts = document.getElementById('OSHORTs_opts');
                    const OSHORTs_opts_arr = Array.from(OSHORTs_opts.querySelectorAll('input[type="checkbox"]'));
                    OSHORTs_opts_arr.forEach(checkbox => {
                        checkbox.addEventListener('change', function() {
                            mk_select_OSHORTs(OSHORTs_opts_arr);            // 呼叫[fun-2]
                        });
                    });

                // 創建一個 MutationObserver 來監聽 step2 OSHORTs.innerText 的變化
                    const observer = new MutationObserver(() => {
                        if (OSHORTsDiv.innerText.trim() === '') {
                            OSHORTs_opts.classList.remove('is-valid');
                            OSHORTs_opts.classList.add('is-invalid');
                        } else {
                            OSHORTs_opts.classList.remove('is-invalid');
                            OSHORTs_opts.classList.add('is-valid');
                        }
                    });
                    const config = { childList: true, subtree: true };      // 配置觀察選項，只監聽子節點變化（包括文本）
                    observer.observe(OSHORTsDiv, config);                   // 開始監聽

                // 文件載入成功，resolve
                resolve();
            });
        }

        $(function(){
            // [step-1] 取得 STEP-1.篩選特危健康場所 checkbox 值，包含 以上皆是/否
            const selectedValues = OSTEXT_30s.filter(cb => cb.checked).map(cb => cb.value);     // [step-1-1] 先取得目前[棟別]的選擇狀態
            mk_OSHORTs(selectedValues);                                                         // [step-1-2] 先呼叫[fun-1]生成部門代號字串
            
            eventListener();                                                                    // [step-1-4] 呼叫[fun-3]
            
            const OSHORTs_opts_arr = Array.from(OSHORTs_opts.querySelectorAll('input[type="checkbox"]'));
            mk_select_OSHORTs(OSHORTs_opts_arr);                                                // [step-1-3] 呼叫[fun-2]
            
        })


</script>
<!-- <script src="staff.js?v=<=time()?>"></script> -->

<?php include("../template/footer.php"); ?>