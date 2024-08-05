<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("function.php");

    // default fab_scope
    $fab_scope = ($sys_role <=1 ) ? "All" : "allMy";    // All :allMy
    // tidy query condition：
        $_site_id    = (isset($_REQUEST["_site_id"]))    ? $_REQUEST["_site_id"]    : "";   // 問卷site
        $_fab_id     = (isset($_REQUEST["_fab_id"]))     ? $_REQUEST["_fab_id"]     : "";   // 問卷fab
        $_short_name = (isset($_REQUEST["_short_name"])) ? $_REQUEST["_short_name"] : "";   // 問卷類別

    // for select item
        $site_lists      = show_site_lists();           // get site清單
        $fab_lists       = show_fab_lists();            // get fab清單
        $shortName_lists = show_document_shortName();   // get 簡稱清單
?>
<?php include("../template/header.php"); ?>
<?php include("../template/nav.php"); ?>
<head>
    <link href="../../libs/aos/aos.css" rel="stylesheet">                                           <!-- goTop滾動畫面aos.css 1/4-->
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>            <!-- Jquery -->
        <!-- dataTable參照 https://ithelp.ithome.com.tw/articles/10230169 --> <!-- data table CSS+JS -->
        <!-- <link rel="stylesheet" type="text/css" href="../../libs/dataTables/jquery.dataTables.css">   -->
        <!-- <script type="text/javascript" charset="utf8" src="../../libs/dataTables/jquery.dataTables.js"></script> -->
    <script src="../../libs/sweetalert/sweetalert.min.js"></script>                                 <!-- 引入 SweetAlert 的 JS 套件 參考資料 https://w3c.hexschool.com/blog/13ef5369 -->
    <script src="../../libs/jquery/jquery.mloading.js"></script>                                    <!-- mloading JS 1/3 -->
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">                            <!-- mloading CSS 2/3 -->
    <script src="../../libs/jquery/mloading_init.js"></script>                                      <!-- mLoading_init.js 3/3 -->
    <style>
        body {
            position: relative;
        }
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

        table tbody tr td{
            /* text-align: right; */
            /* padding: 1em; */
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
            <div class="col_xl_8 col-8 rounded pb-3" style="background-color: rgba(255, 255, 255, .8);">
                <!-- NAV分頁標籤與統計 -->
                <div class="col-12 pb-0 px-0">
                    <ul class="nav nav-tabs">
                        <li class="nav-item"><a class="nav-link "           href="index.php">訪談清單管理</span></a></li>
                        <li class="nav-item"><a class="nav-link active"     href="condition.php">條件化搜尋</span></a></li>
                    </ul>
                </div>
                
                <!-- 內頁 -->
                <div class="col-12 bg-white rounded" id="main">
                    <form id="myForm" method="post" action="">
                        <table id="query_item">
                            <tbody>
                                <tr>
                                    <td class="text-end">廠區/棟別：</td>
                                    <td class="inf">
                                        <select name="_site_id" id="_site_id" class="form-select inb block" >
                                            <option value="" hidden selected >-- 請選擇 問卷site --</option>
                                            <?php 
                                                // echo '<option for="_site_id" value="All" '.($_fab_id == "All" ? " selected":"").' >-- All 所有site --</option>';
                                                foreach($site_lists as $site){
                                                    echo "<option for='_site_id' value='{$site["id"]}' ". ($site["id"] == $_site_id ? " selected" : "" );
                                                    echo ($site["flag"] == "Off" ? " disabl" : "" ) ;
                                                    echo " >";
                                                    echo $site["site_title"]."( ".$site["site_remark"]." )"; 
                                                    echo ($site["flag"] == "Off") ? " - (已關閉)":"" ."</option>";
                                                } ?>
                                        </select>
                                        &nbsp
                                        <select name="_fab_id" id="_fab_id" class="form-select inb" >
                                            <option value="" hidden selected >-- 請選擇 問卷Fab --</option>
                                            <?php 
                                                echo '<option for="_fab_id" value="All" '.($_fab_id == "All" ? " selected":"").' >-- All 所有棟別 --</option>';
                                                foreach($fab_lists as $fab){
                                                    echo "<option for='_fab_id' value='{$fab["id"]}' ";
                                                    echo "class='".$fab["site_id"]." _fab' ";
                                                    echo ($fab["id"] == $_fab_id) ? "selected" : "" ." >";
                                                    echo $fab["site_title"]."&nbsp".$fab["fab_title"]."( ".$fab["fab_remark"]." )"; 
                                                    echo ($fab["flag"] == "Off") ? " - (已關閉)":"" ."</option>";
                                                } ?>
                                        </select>
    
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-end">anis_no / 申請單號：</td>
                                    <td class="inf">
                                        <input type="text" name="anis_no" id="anis_no" class="form-control inb" placeholder="-- ANIS表單編號 --"
                                                maxlength="21" oninput="if(value.length>21)value=value.slice(0,21); this.value = this.value.toUpperCase();" >
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-end">created_emp_id / 申請人員：</td>
                                    <td class="inf">
                                        <input type="text" name="created_emp_id" id="created_emp_id" class="form-control" placeholder="-- 申請人員工號 --"
                                                maxlength="8" oninput="if(value.length>8)value=value.slice(0,8)" >
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-end">_short_name / 事件類別：</td>
                                    <td class="inf">
                                        <select name="_short_name" id="_short_name" class="form-select" >
                                            <option value="" hidden selected >-- 請選擇 問卷類型 --</option>
                                            <?php 
                                                // echo "<option for='_short_name' value='All' ".(($_short_name == "All") ? " selected":"" )." >-- 全問卷類型 / All --</option>";
                                                foreach($shortName_lists as $shortName){
                                                    echo "<option for='_short_name' value='{$shortName["short_name"]}' ";
                                                    echo ($shortName["short_name"] == $_short_name ? " selected" : "" )." >".$shortName["short_name"]."</option>";
                                                } ?>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-end">idty / 結案狀態：</td>
                                    <td class="inf px-3">
                                        <div class="form-check px-3">
                                            <input type="checkbox" name="idty[]" id="idty_1" value="1" class="form-check-input" checked>
                                            <label for="idty_1" class="form-check-label">立案/簽核中</label>
                                        </div>&nbsp
                                        <div class="form-check px-3">
                                            <input type="checkbox" name="idty[]" id="idty_10" value="10" class="form-check-input" checked>
                                            <label for="idty_10" class="form-check-label">完成訪談</label>
                                        </div>&nbsp
                                        <div class="form-check px-3">
                                            <input type="checkbox" name="idty[]" id="idty_6" value="6" class="form-check-input">
                                            <label for="idty_6" class="form-check-label">暫存</label>
                                        </div>&nbsp
                                        <div class="form-check px-3">
                                            <input type="checkbox" name="idty[]" id="idty_3" value="3" class="form-check-input">
                                            <label for="idty_3" class="form-check-label">取消</label>
                                        </div>&nbsp
                                        <!-- <div class="form-check px-3">
                                            <input type="checkbox" name="idty[]" id="idty_All" value="All" class="form-check-input"  >
                                            <label for="idty_All" class="form-check-label">All</label>
                                        </div> -->
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-end">s2_combo_07 / 事故分類：</td>
                                    <td class="inf">
                                        <select name="s2_combo_07" id="s2_combo_07" class="form-select" disabl>
                                            <option value="" hidden selected >-- 請選擇 事故類型 --</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-end">s2_combo_08 / 災害類型：</td>
                                    <td class="inf">
                                        <select name="s2_combo_08" id="s2_combo_08" class="form-select" disabl>
                                            <option value="" hidden selected >-- 請選擇 災害類型 --</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-end">created_at / 申請日期：</td>
                                    <td class="inf">
                                        <div class="input-group">
                                            <span class="input-group-text">From</span>
                                            <input type="date" name="created_at_form" id="created_at_form" class="form-control mb-0" >
                                            <div class="invalid-feedback" id="created_at_form_feedback">日期填入錯誤 ~ </div>
                                        </div>
                                        &nbsp
                                        <div class="input-group">
                                            <span class="input-group-text">To</span>
                                            <input type="date" name="created_at_to"   id="created_at_to"   class="form-control mb-0" >
                                            <div class="invalid-feedback" id="created_at_to_feedback">日期填入錯誤 ~ </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <hr>
                        <!-- Hear：H -->
                        <div class="col-12 text-center py-0">
                            <button type="reset" class="btn btn-outline-success">清除</button>
                            <button type="button" class="btn btn-outline-secondary search_btn" value="count" id="search_btn" data-bs-target="#searchUser" data-bs-toggle="modal" >&nbsp<i class="fa-solid fa-magnifying-glass"></i>&nbsp查詢</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- 彈出modal -->
    <div class="modal fade" id="searchUser" aria-hidden="true" aria-labelledby="searchUser" tabindex="-1">
        <div class="modal-dialog modal-dialog-scrollable modal-fullscreen">
            <div class="modal-content">

                <div class="modal-header bg-warning rounded p-3 m-2">
                    <h5 class="modal-title"><i class="fa-solid fa-circle-info"></i>&nbspsearch document for&nbsp<span id="modal_title"></span></h5>
                    <button type="button" class="btn-close border rounded mx-1" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body mx-2">
                        <div class="col-12 border rounded  result" id="result">
                            <!-- 放查詢結果-->
                                <table id="result_table" class="table table-striped table-hover mb-1">
                                    <thead>
                                        <tr></tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                        </div>
                </div>

                <div class="modal-footer">
                    <div class="inb">
                        <!-- H：downLoad Excel -->
                        <form id="myForm" method="post" action="../_Format/download_excel.php">
                            <input type="hidden" name="htmlTable" id="htmlTable" value="">
                            <button type="submit" name="submit" class="btn btn-outline-success" title="匯出Excel" value="interView" id="downloadExcel" disabled>
                                <i class="fa fa-download" aria-hidden="true"></i> 匯出</button>
                        </form>
                    </div>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">返回</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap Alarm -->
    <div id="liveAlertPlaceholder" class="col-12 text-center mb-0 pb-0"></div>
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
    var doc_keys = [];      // 匯集所有form的key/label
    var big_data = [];
    var doc_list_keys = {
        'anis_no'         : 'ANIS單號', 
        'idty'            : '簽核狀態', 
        'created_cname'   : '申請人員', 
        'created_at'      : '申請日期', 
        'short_name'      : '表單名稱', 
        'site_title'      : '廠區', 
        'fab_title'       : '棟別', 
        'local_title'     : '廠別'
        // '_content'        : '訪談內容'
    };
    var content_keys = {
        'a_day'           : '發生時間',
        'a_location'      : '發生地點',
        's2_combo_06'     : '事件等級',
        's2_combo_07'     : '事件主類型',
        's2_combo_08'     : '災害主類型',
        's8_direct_cause' : '直接原因',
        's8_combo_02'     : '間接原因',
        's8_basic_reasons_combo':'事故基本原因'
    };

</script>

<script src="condition.js?v=<?=time()?>"></script>