<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("function.php");
    accessDenied($sys_id);

    // for return
    // $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁
        $uri       = (!empty($_SERVER['HTTPS']) && ('on' == $_SERVER['HTTPS'])) ? 'https://' : 'http://';  // 取得開頭
        $uri      .= $_SERVER['HTTP_HOST'];                                                                // 組合成http_host
        
    // tidy query condition：
        // $get_year = load_workTarget("_year");
        $_year    = $_REQUEST["_year"] ?? (!empty($get_year) ? $get_year : date('Y'));    // 開起年份
        $_years   = [ $_year, $_year-1, $_year-2, $_year-3];

        $sys_role1 = ($sys_role <= 1) ? "" : "disabled unblock";
        $sys_role2 = ($sys_role <= 2) ? "" : "disabled unblock";
        $sys_role3 = ($sys_role <= 3) ? "" : "unblock";
        $faSquareCheck = `<i class="fa-regular fa-square-check"></i>&nbsp;`;

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
        #banner li {
            margin: 15px 0;
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
            .infb {
                justify-content: space-between;
                /* justify-content: space-around; */
            }
        .h6 {
            font-size: 12px;
        }
        .import:hover , .edit1:hover , .edit2:hover {
            background-color: #adff2f !important;
            transition: .5s;
            font-weight: bold;
            text-shadow: 3px 3px 5px rgba(0, 0, 0, .5);
        }
            .btn {
                padding: 4px 4px;
            }
            .btn-info {
                background-color: rgba(23, 162, 184, 0.5); /* 這是 Bootstrap 中 btn-info 的顏色，0.5 表示透明度50% */
            }
            .btn-info:hover {
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            }
            .btn-info[disabled] {
                background-color: rgba(23, 162, 184, 0.2);
            }
            .btn-warning {
                background-color: rgba(255, 193, 7, 0.5); /* 這是 Bootstrap 中 btn-warning 的顏色，0.5 表示透明度50% */
            }
            .bg-m-warning {
                background-color: rgba(255, 193, 7, 0.5); /* 這是 Bootstrap 中 btn-warning 的顏色，0.5 表示透明度50% */
            }
            .bg-m-danger {
                background-color: rgba(255, 193, 7, 0.5); /* 這是 Bootstrap 中 btn-warning 的顏色，0.5 表示透明度50% */
            }

            .cover {
                width: 100%;
                height: 100px;
            }
            .cover-img{
                width: 100%;
                height: 100%;
                object-fit: contain;
                object-position: left;
            }
            .banner {
                /* 若綠 わかみどり */
                /* background-color: #98D98E; */
                /* 若草色 わかくさいろ */
                /* background-color: #C3D825; */
                /* 若竹色 わかたけいろ */
                /* background-color: #68BE8D; */
                /* 若芽色 わかめいろ */
                /* background-color: #E0EBAF; */
                /* CornflowerBlue */
                /* background-color: #6495ED; */
                /* Cornsilk */
                /* background-color: #FFF8DC; */
                /* Khaki */
                /* background-color: #F0E68C; */
                /* SkyBlue */
                background-color: #87CEEB;
            }
            .banner-img{
                width: auto;
                height: 150px;
            }
            /* .memoCard {
                color: $yellow-300;
                background-color: $indigo-900;
            } */
            .unblock_b {
                opacity: 0;
                transition: opacity .6s ease; /* 調整為1秒 */
                visibility: hidden;     /* 初始為hidden */
                height: 0;              /* 初始高度為0以避免佔用空間 */
                overflow: hidden;       /* 防止顯示內容 */
            }

            .unblock_b.show {           /* 增加show類別 */
                opacity: 1;
                visibility: visible;    /* 顯示時為visible */
                height: auto;           /* 根據內容自動調整高度 */
            }
            .wh-25 {
                width: 25px;
            }
            .wh-50 {
                width: 50px;
            }
            .wh-75 {
                width: 70px;
            }
            .wh-100 {
                width: 100px;
            }
            .edit2Header {
                background-color: #ffdb99
            }
            .notify_log {
                font-size: 12px;
            }
            .mcc {
                display         : flex; 
                align-items     : center;
                justify-content : center;
            }
    </style>
</head>
<body>
    <div class="col-12">
        <div class="row justify-content-center">
            <div class="col_xl_11 col-12 rounded" style="background-color: rgba(255, 255, 255, .8);">
                <div id="banner" class="col-12 my-3 p-1 border rounded banner inf infb"></div>
                <div class="col-12 p-0">
                    <!-- Bootstrap Alarm -->
                    <div id="liveAlertPlaceholder" class="col-12 text-center mb-0 p-0"></div>
                    <!-- NAV分頁標籤 -->
                    <nav>
                        <div class="nav nav-tabs" id="nav-tab" role="tablist">
                            <button type="button" class="nav-link active" id="nav-p1-tab" data-bs-toggle="tab" data-bs-target="#nav-p1_table" role="tab" aria-controls="nav-p1" aria-selected="false"><i class="fa-solid fa-share-from-square"></i>&nbsp;提取特作部門資料</button>
                            <button type="button" class="nav-link "       id="nav-p2-tab" data-bs-toggle="tab" data-bs-target="#nav-p2_table" role="tab" aria-controls="nav-p2" aria-selected="false"><i class="fa-solid fa-user-shield"></i>&nbsp;特作部門名單維護</button>
                            <button type="button" class="nav-link "       id="nav-p3-tab" data-bs-toggle="tab" data-bs-target="#nav-p3_table" role="tab" aria-controls="nav-p3" aria-selected="false"><i class="fa-solid fa-list-check"></i>&nbsp;作業追蹤維護</button>
                        </div>
                    </nav>
                </div>
                <!-- 內頁 -->
                <div class="tab-content" id="nav-tabContent">
                    <!-- p1 -->
                    <div id="nav-p1_table" class="tab-pane fade show active" role="tabpanel" aria-labelledby="nav-p1-tab">
                        <div class="col-12 bg-white">
                            <!-- step-1 -->
                            <div class="col-12 p-1">
                                <div class="row">
                                    <div class="col-8 col-md-9 py-1 inf">
                                        <snap for="deptNo_opts" class="form-label"><h5>已存檔之部門代號：</h5></snap>
                                        <snap data-toggle="tooltip" data-placement="bottom" title="全選" class="px-1 <?php echo $sys_role1;?>">
                                            <button type="button" id="selectAll_subScopes_btn"  class="btn btn-outline-danger add_btn form-control " ><i class="fa-solid fa-check-double"></i></button>
                                        </snap>
                                        <snap data-toggle="tooltip" data-placement="bottom" title="特作部門名單維護" class="px-1">
                                            <button type="button" id="load_subScopes_btn"  class="btn btn-outline-success add_btn form-control is-invalid block" disabled ><i class="fa-solid fa-arrows-rotate"></i> 提取勾選部門</button>
                                            <!-- <div class='invalid-feedback pt-0' id='load_subScopes_btn_feedback'>* 請先勾選部門代號至少一項 !! </div> -->
                                        </snap>
                                        <snap data-toggle="tooltip" data-placement="bottom" title="變更作業名單追蹤(by年)" class="px-1">
                                            <button type="button" id="SubmitForReview_btn" class="btn btn-outline-primary add_btn form-control is-invalid block" disabled ><i class="fa-solid fa-arrows-down-to-people"></i> 追蹤維護</button>
                                        </snap>
                                    </div>
                                    <div class="col-4 col-md-3 py-1 text-end">
                                        <div class="input-group">
                                            <span class="input-group-text" data-toggle="tooltip" data-placement="bottom" title="作業追蹤年度篩選">篩選</span>
                                            <select name="_year" id="_year" class="form-select" >
                                                <option value="" hidden selected >-- 請選擇 篩選年度 --</option>
                                                <?php 
                                                    echo '<option for="_year" value="All" '.($_year == "All" ? "selected":"" ).' hidden >-- All 所有年度 --</option>';
                                                    foreach($_years as $_y){
                                                        echo "<option for='_year' value='{$_y}' ".($_y == $_year ? "selected" : "" )." >".$_y."y</option>";
                                                    } ?>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div id="deptNo_opts_inside" class="row p-0">
                                    <!-- 放checkbox按鈕的地方 -->
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
                                <div class="col-md-8 py-0 inf">
                                    <div class="d-grid gap-2 d-md-block">
                                        <button type="button" id="resetINF_btn"      class="btn btn-outline-danger  add_btn" title="清除清單" data-toggle="tooltip" data-placement="bottom" onclick="return confirm(`確認放棄畫面上的資料？`) && resetINF(true)" disabled><i class="fa-solid fa-trash-arrow-up"></i></button>
                                        <button type="button" id="bat_storeDept_btn" class="btn btn-outline-success add_btn <?php echo $sys_role2;?>" onclick="bat_storeDept()" disabled ><i class="fa-solid fa-floppy-disk"></i> 儲存</button>
                                        <!-- 上傳EXCEL的觸發 -->
                                        <button type="button" id="load_excel_btn"    class="btn btn-outline-primary add_btn <?php echo $sys_role2;?>" data-bs-toggle="modal" data-bs-target="#load_excel"><i class="fa fa-upload" inert ></i> 上傳</button>
                                        <button type="button" id="maintainDept_btn"  class="btn btn-outline-primary add_btn <?php echo $sys_role2;?>" data-bs-toggle="modal" data-bs-target="#maintainDept"><i class="fa fa-plus"></i> 新增</button>
                                    </div>
                                    <snap class="px-1" data-toggle="tooltip" data-placement="bottom" title="由此帶入變更作業名單追蹤(by年月)">
                                        <button type="button" id="P2SubmitForReview_btn" class="btn btn-outline-primary add_btn" disabled ><i class="fa-solid fa-arrows-down-to-people"></i> 追蹤維護</button>
                                    </snap>
                                </div>
                                <!-- 右側function -->
                                <div class="col-md-4 py-0 text-end inf">
                                    <div class="input-group">
                                        <span class="input-group-text">篩選</span>
                                        <select name="_yearMonth" id="_yearMonth" class="form-select" onchange="post_hrdb('', this.value)">
                                            <option value="" hidden selected >-- 請篩選年月 --</option>
                                        </select>
                                        <!-- <button type="submit" class="btn btn-outline-secondary search_btn" >&nbsp<i class="fa-solid fa-magnifying-glass"></i>&nbsp查詢</button> -->
                                    </div>
                      
                                </div>
                            </div>
                            <hr>
                            <table id="hrdb_table" class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th title="OSTEXT_30/OSHORT/OSTEXT" >廠區/部門代碼/名稱</th>
                                        <th title="base"                    >部門全員</th>
                                        <th title="getOut"                  >轉出</th>
                                        <th title="getIn"                   >轉入</th>
                                        <th title="inCare"                  >變更作業</th>
                                        <th title="remark/flag"             >備註說明/開關</th>
                                        <th title="created_at/updated_at/updated_cname" class="unblock">創建/更新/操作人</th>
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
                            <!-- 人員名單： -->
                            <div class="row">
                                <!-- 左側function -->
                                <div class="col-md-8 py-0 ">
                                    <button type="button" class="btn btn-outline-danger add_btn" id="P3resetINF_btn" title="清除清單" data-toggle="tooltip" data-placement="bottom" onclick="return confirm(`確認放棄畫面上的資料？`) && resetINF(true)" disabled><i class="fa-solid fa-trash-arrow-up"></i></button>
                                    <button type="button" class="btn btn-outline-success add_btn <?php echo $sys_role2;?>" id="bat_storeChangeStaff_btn" onclick="bat_storeChangeStaff()" disabled ><i class="fa-solid fa-floppy-disk"></i>&nbsp;儲存</button>
                                    <!-- 下載EXCEL的觸發 -->
                                    <div class="inb">
                                        <form id="staffChange_myForm" method="post" action="../_Format/download_excel.php">
                                            <input  type="hidden" name="htmlTable" id="staffChange_htmlTable" value="">
                                            <button type="submit" name="submit" id="download_excel_btn" class="btn btn-outline-success add_btn" value="staffChange" onclick="return confirm(`下載前建議您進行儲存，請問是否要繼續下載？\r\n(請注意：未儲存的下載資料可能會與資料庫有所差異)`) && P3downloadExcel(this.value)" disabled ><i class="fa fa-download"></i>&nbsp;下載</button>
                                        </form>
                                    </div>
                                </div>
                                <!-- 右側function -->
                                <div class="col-md-4 py-0 text-end">
                                    <button type="button" class="btn btn-outline-primary add_btn <?php echo $sys_role2;?>" id="p2_send_btn" title="通知部門主管" data-toggle="tooltip" data-placement="bottom" disabled  data-bs-toggle="modal" data-bs-target="#p2notify" onclick="p2_init(true)"><i class="fa-solid fa-paper-plane"></i>&nbsp;傳送通知</button>
                                </div>
                            </div>
                            <hr>
                            <table id="staff_table" class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th title="AB" class="table-success"      >年月</th>
                                        <th title="2"  class="table-success"      >廠區</th>
                                        <th title="3"  class="table-success"      >工號</th>
                                        <th title="4"  class="table-success"      >姓名</th>
                                        <th title="5"  class="table-success"      >部門代號</th>
                                        <th title="6"  class="table-warning"      >變更檢查項目</th>
                                        <th title="7"  class="table-warning wh-75">是否檢查</th>
                                        <th title="8"  class="table-warning"      >備註說明</th>
                                        <th class="table-warning wh-75" data-toggle="tooltip" data-placement="bottom" title="通知時間：黃底 >=7、紅底 >=12" >受檢日期 <i class="fa-solid fa-circle-info"></i></th>
                                        <th title="10" class="table-primary"      >總窗備註</th>
                                        <th title="11" class="table-danger"       >Notify</th>
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
    <!-- 互動視窗 load_excel -->
    <div class="modal fade" id="load_excel" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">上傳Excel檔：</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body px-4">
                    <form name="excelInput" action="../_Format/upload_excel.php" method="POST" enctype="multipart/form-data" target="api" onsubmit="return loadExcelForm()">
                        <div class="row">
                            <div class="col-6 col-md-7 py-0">
                                <label for="excelFile" class="form-label">變更作業健檢名單 <span>&nbsp<a href="../_Format/shStaffChange_example.xlsx" target="_blank">上傳格式範例</a></span> 
                                    <sup class="text-danger"> * 限EXCEL檔案</sup></label>
                                <div class="input-group">
                                    <input type="file" name="excelFile" id="excelFile" style="font-size: 16px; max-width: 350px;" class="form-control form-control-sm" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                                    <button type="submit" name="excelUpload" id="excelUpload" class="btn btn-outline-secondary" value="shStaffChange">上傳</button>
                                </div>
                            </div>
                            <div class="col-6 col-md-5 py-0">
                                <p id="warningText_0" name="warning" class="mb-1 text-danger">＊作業年度[<b><?php echo $_year;?></b>]...上傳儲存有覆蓋風險，請務必確認!!</p>
                                <p id="warningText_1" name="warning" class="mb-1">＊請上傳[特危作業人員清單]Excel檔</p>
                                <p id="warningText_2" name="warning" class="mb-1">＊請確認Excel中的資料</p>
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
    <!-- 模組-維護部門員工名單 -->
    <div class="modal fade" id="maintainDept" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-warning">
                    <h5 class="modal-title"><b>maintainDept：&nbsp;</b><snap id="dept_info"></snap></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <!-- 第一排-查詢功能 -->
                    <div class="row">
                        <div class="col-12 col-md-4"><snap id="daptStaff_length"></snap>&nbsp;<snap id="result_info"></snap></div>
                        <div class="col-12 col-md-8 text-end py-1 inf">
                            <div class="input-group">
                                <span class="input-group-text">部門代號</span>
                                <input id="searchkeyWord" class="form-control col-sm-10 mb-0" type="text" placeholder="請輸入查詢部門代號" required disabled>
                                <!-- <button type="button" class="btn btn-outline-primary" onclick="search_fun('search','searchkeyWord')"><i class="fa-solid fa-magnifying-glass"></i> 搜尋</button> -->
                                <button type="button" class="btn btn-outline-primary <?php echo $sys_role2;?>" data-toggle="tooltip" data-placement="bottom" title="清除" onclick="resetMaintainDept()">&nbsp;<i class="fa-solid fa-delete-left"></i>&nbsp;</button>
                                <button type="button" class="btn btn-outline-primary <?php echo $sys_role2;?>" data-toggle="tooltip" data-placement="bottom" title="搜尋" onclick="load_deptStaff('load_deptStaff_formHrdb','searchkeyWord')">&nbsp;<i class="fa-solid fa-magnifying-glass"></i>&nbsp;</button>
                            </div>
                                &nbsp;
                            <button type="button" class="btn btn-outline-primary <?php echo $sys_role2;?>" data-toggle="tooltip" data-placement="bottom" title="套用名單"  onclick="loadInCare(false)">&nbsp;套&nbsp;</button>
                        </div>
                    </div>
                    <div class="col-12 bg-light border rounded unblock_b" id="loadInCare_div">
                        <label for="loadInCare" id="loadInCare_label" class="form-check-label" >套用名單：</label>
                        <textarea name="loadInCare" id="loadInCare" class="form-control" rows="5"></textarea>
                        <div class="col-12 p-0 text-end">
                            <button type="button" class="btn btn-outline-primary" data-toggle="tooltip" data-placement="bottom" title="帶入套用名單"  onclick="loadInCare(true)">&nbsp;套用&nbsp;</button>
                        </div>
                    </div>
                    <!-- 第二排-查詢結果 -->
                    <div class="row">
                        <div class="col-12 p-3" id="result">
                            <table id="maintainDept_table" class="table table-striped table-hover">
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline-primary unblock" id="submitDeptStaff" disabled >代入</button>
                    <button class="btn btn-secondary"       data-bs-dismiss="modal">Back</button>
                </div>
            </div>
        </div>
    </div>
    <!-- 互動視窗 edit_modal -->
    <div class="modal fade" id="edit_modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">編輯&nbsp;<snap id="edit_modal_title"></snap>：</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body px-4"></div>
                <div class="modal-footer">
                    <!-- <button type="submit" class="btn btn-success"   data-bs-dismiss="modal" id="edit_modal_btn" >更新</button> -->
                    <button type="submit" class="btn btn-success <?php echo $sys_role2;?>"   id="edit_modal_btn" value="">更新</button>
                    <button type="reset"  class="btn btn-secondary" data-bs-dismiss="modal">返回</button>
                </div>
            </div>
        </div>
    </div> 
    <!-- 互動視窗 edit2_modal -->
    <div class="modal fade" id="edit2_modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header edit2Header">
                    <h5 class="modal-title">編輯&nbsp;<snap id="edit2_modal_title"></snap>：</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body px-4"></div>
                <div class="modal-footer">
                    <!-- <button type="submit" class="btn btn-success"   data-bs-dismiss="modal" id="edit2_modal_btn" >更新</button> -->
                    <button type="submit" class="btn btn-success <?php echo $sys_role2;?>"   id="edit2_modal_btn" value="">更新</button>
                    <button type="reset"  class="btn btn-secondary" data-bs-dismiss="modal">返回</button>
                </div>
            </div>
        </div>
    </div> 
    <!-- 互動視窗 p2notify -->
    <div class="modal fade" id="p2notify" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="fa-solid fa-2"></i>&nbsp;變更作業健檢-待通報清單統計</h5>&nbsp;&nbsp;共：<span id="p2totalUsers_length"></span>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body px-4">
                    <table id="p2notify_table" class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>姓名 (工號)</th>
                                <th>異動時間</th>
                                <th>異動部門</th>
                                <th>特作項目</th>
                                <th class="table-success text-success">部門主管 (工號)</th>
                                <th class="table-warning">Result</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    <hr>
                    <!-- 頁尾操作訊息 -->
                    <div class="col-12 py-0"><b>執行訊息：</b></div>
                    <!-- append執行訊息 -->
                    <div class="col-12 bg-white border rounded py-2 my-0" id="p2result"></div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-success"   data-bs-dismiss="modal" id="p2notify_btn" disabled >發出</button>
                    <button type="reset"  class="btn btn-secondary" data-bs-dismiss="modal">返回</button>
                </div>
            </div>
        </div>
    </div> 



    <!-- canvas側欄 memoCard-->
    <div class="offcanvas offcanvas-end" id="offcanvasRight" tabindex="-1" aria-labelledby="offcanvasRightLabel" aria-hidden="true">
        <div class="offcanvas-header bg-light">
            <h5 id="offcanvasRightLabel"><i class="fa-solid fa-clipboard-list"></i>&nbsp;個案備註&nbsp;<snap id="memoTitle"></snap></h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-0" style="background-color: #D4D4D4;">
            <table>
                <tbody id="memoBody">
                </tbody>
            </table>
        </div>
        <div class="modal-footer bg-light">
            <div class="input-group">
                <input type="text"    class="form-control mb-0 bg-white <?php echo $sys_role2;?>" id="memoMsg" name="memoMsg" placeholder="請輸入文字訊息" required>
                <button type="submit" class="btn btn-outline-primary add_btn  <?php echo $sys_role2;?>" id="postMemoMsg_btn" value="" title="Paste">&nbsp;<i class="fa-regular fa-paste"></i>&nbsp;</button>
            </div>
            <label for="memoMsg" class="form-label text-danger"><h6>* 任何編輯備註行為，最後請記得按[儲存]！</h6></label>
        </div>
    </div>
    <!-- canvas上側欄 -->
    <div class="offcanvas offcanvas-top" id="offcanvasTop" tabindex="-1" aria-labelledby="offcanvasTopLabel" aria-hidden="true">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasTopLabel">歷史紀錄查閱 <snap id="offcanvas_title"></snap></h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body small py-0">
        </div>
    </div>
    <!-- full互動視窗 歷史紀錄 -->
    <div class="modal fade" id="aboutStaff" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">歷史紀錄查閱 <snap id="aboutStaff_title"></snap></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-3">
                    <table id="shCase_table" class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th title="emp_id+cname"        >工號姓名</th>
                                <th title="emp_sub_scope"       >年份_廠區</th>
                                <th title="dept_no"             >部門代碼名稱</th>
                                <th title="HE_CATE"             >檢查類別代號</th>
                                <th title="MONIT_LOCAL"         >工作場所</th>
                                <th title="特殊作業"            >工作內容</th>
                                <th title="AVG_VOL"             >A權音壓級 <sup>(dBA)</sup></th>
                                <th title="AVG_8HR 工作日8小時" >日時量平均 <sup>(dBA)</sup></th>
                                <th title="eh_time 累計暴露"    >每日曝露時數</th>
                                <th title="NC"                 >噪音資格</th>
                                <th title="shCondition"        >特檢資格</th>
                                <th title="change"             >轉調</th>
                                <th title="匯入1yearHe"      class="<?php echo $sys_role3;?>">項目類別代號</th>
                                <th title="匯入2yearCurrent" class="<?php echo $sys_role3;?>">檢查項目</th>
                                <th title="匯入3yearPre"     class="<?php echo $sys_role3;?>">去年檢查項目</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
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
                    <button type="submit" id="reviewSubmit" value="" class="btn btn-primary <?php echo $sys_role3;?>" ><i class="fa fa-paper-plane" aria-hidden="true"></i> Agree</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
    var realName            = document.getElementById('realName');              // 上傳後，JSON存放處(給表單儲存使用)
    var iframe              = document.getElementById('api');                   // 清冊的iframe介面
    var warningText_1       = document.getElementById('warningText_1');         // 未上傳的提示
    var warningText_2       = document.getElementById('warningText_2');         // 資料有誤的提示
    var excel_json          = document.getElementById('excel_json');            // 清冊中有誤的提示
    var excelFile           = document.getElementById('excelFile');             // 上傳檔案名稱
    var excelUpload         = document.getElementById('excelUpload');           // 上傳按鈕
    var import_excel_btn    = document.getElementById('import_excel_btn');      // 載入按鈕
    var download_excel_btn  = document.getElementById('download_excel_btn');    // 下載按鈕
    var loadExcel_btn       = document.getElementById('load_excel_btn');        // 上傳按鈕
    
    var p2_send_btn         = document.getElementById('p2_send_btn');           // 1.傳送通知按鈕
    var p2notify_btn        = document.getElementById('p2notify_btn');          // 2.發出按鈕

    // var bat_storeDept_btn   = document.getElementById('bat_storeDept_btn');     // 儲存按鈕
    // var resetINF_btn        = document.getElementById('resetINF_btn');          // 清空按鈕
    // var editModal_btn       = document.getElementById('edit_modal_btn');        // 編輯更新ShCondition按鈕
    var SubmitForReview_btn   = document.getElementById('SubmitForReview_btn');    // P1追蹤維護
    var P2SubmitForReview_btn = document.getElementById('P2SubmitForReview_btn');  // P2追蹤維護
    // var importStaff_btn     = document.getElementById('import_staff_btn');      // 上傳按鈕
    // const memoMsg_input     = document.getElementById('memoMsg');               // 定義出memoMsg_input
    // const postMemoMsg_btn   = document.getElementById('postMemoMsg_btn');       // 定義出postMemoMsg_btn
    // const reviewSubmit_btn  = document.getElementById('reviewSubmit');          // 定義出reviewSubmit_btn

    const resultInfo = document.querySelector('#maintainDept #result_info');       // 定義modal表頭info id
    const deptInfo             = document.getElementById('dept_info');             // 定義modal表頭dept id
    const daptStaffLength      = document.getElementById('daptStaff_length');      // 定義modal表頭daptStaff_length


    var maintainDept_modal    = new bootstrap.Modal(document.getElementById('maintainDept'), { keyboard: false });
    var edit_modal            = new bootstrap.Modal(document.getElementById('edit_modal'), { keyboard: false });
    var edit2_modal           = new bootstrap.Modal(document.getElementById('edit2_modal'), { keyboard: false });
    var p2notify_modal        = new bootstrap.Modal(document.getElementById('p2notify'), { keyboard: false });

    // var submit_modal        = new bootstrap.Modal(document.getElementById('submitModal'), { keyboard: false });
    // var memoCard_modal      = new bootstrap.Offcanvas(document.getElementById('offcanvasRight'), { keyboard: false });

    var shLocalDept_inf     = [];   // 存放db取得的dept資料
    var defaultDept_inf     = [];   // db沒有資料，這裡生成預設值 by bomNewDept(selectDeptStr)
    var defaultStaff_inf    = [];   // db沒有資料，這裡生成預設值 by bomNewStaff(selectStaffStr)
    var _dept_inf           = [];   // 中繼專用：存放selectDept的id資訊 = ["FAB7棟,9T041502,工安衛二課"]，供生成時取得...
    var staff_inf           = [];
    var shLocal_inf         = [];
    var mergedData_inf      = [];
    var shItemArr_inf       = [];
    // var loadStaff_tmp    = [];
    // var _docs_inf        = [];
    // var _docsIdty_inf    = null;
    
    // [p1 步驟-0] 取得重要資訊
    // const OSHORTsObj = <=json_encode($shLocal_OSHORTs_str)?>;
    // const ept_noTXT = (document.getElementById('row_emp_sub_scope').innerText).trim();
    // const deptNosObj = ept_noTXT ? JSON.parse(ept_noTXT) : ept_noTXT;       // 將row_OSTEXT_30的字串轉換為物件
    const uri       = '<?=$uri?>';

    const userInfo = {
        'role'     : '<?=$sys_role?>',
        'BTRTL'    : ('<?=$sys_BTRTL?>').split(','),     // 人事子範圍-建物代號
        'empId'    : '<?=$auth_emp_id?>',
        'cname'    : '<?=$auth_cname?>',
        'signCode' : '<?=$auth_sign_code?>',
    }
    // const currentYear = String(new Date().getFullYear());   // 取得當前年份
    // const currentYear = '<=$_year?>';                      // 取得當前年份
    // const preYear     = String(currentYear - 1);            // 取得去年年份

</script>
<script src="../mvc/utility.js?v=<?=time()?>"></script>
<!-- <script src="../mvc/excel.js?v=<=time()?>"></script> -->
<!-- <script src="../mvc/check.js?v=<=time()?>"></script> -->
<!-- <script src="../mvc/editModal.js?v=<=time()?>"></script> -->

<script src="change.js?v=<?=time()?>"></script>
<script src="change_excel.js?v=<?=time()?>"></script>
<script src="change_memo.js?v=<?=time()?>"></script>
<script src="change_p3.js?v=<?=time()?>"></script>
<script src="change_notify.js?v=<?=time()?>"></script>
<!-- <script src="change_editModal.js?v=<=time()?>"></script> -->

<?php include("../template/footer.php"); ?>