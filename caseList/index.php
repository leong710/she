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
        $_fab_id     = (isset($_REQUEST["_fab_id"]))     ? $_REQUEST["_fab_id"]     : $fab_scope;   // 問卷fab
        $_year       = (isset($_REQUEST["_year"]))       ? $_REQUEST["_year"]       : date('Y');    // 問卷年度
        $_month      = (isset($_REQUEST["_month"]))      ? $_REQUEST["_month"]      : date('m');    // 問卷月份
        $_short_name = (isset($_REQUEST["_short_name"])) ? $_REQUEST["_short_name"] : "All";        // 問卷類別
        $idty        = (isset($_REQUEST["idty"]))        ? $_REQUEST["idty"]        : "All";        // 問卷狀態
    // tidy sign_code scope 
        $sfab_id_str     = get_coverFab_lists("str");   // get signCode的管理轄區
        $sfab_id_arr     = explode(',', $sfab_id_str);  // 將管理轄區字串轉陣列
    // merge quesy array
        $query_arr = array(
            'fab_id'        => $_fab_id,
            '_year'         => $_year,
            '_month'        => $_month,
            'short_name'    => $_short_name,
            'sfab_id'       => $sfab_id_str,
            'idty'          => $idty,
        );
    // get mainData = caseList
        $caseLists       = show_caseList($query_arr);   // get case清單
    // for select item
        $fab_lists       = show_fab_lists();            // get 廠區清單
        $year_lists      = show_document_GB_year();     // get 立案year清單
        $shortName_lists = show_document_shortName();   // get 簡稱清單

        $icon_s = '<i class="';
        $icon_e = ' fa-2x"></i>&nbsp&nbsp';
            
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
    </style>
</head>
<body>
    <div class="col-12">
        <div class="row justify-content-center">
            <div class="col_xl_11 col-12 rounded" style="background-color: rgba(255, 255, 255, .8);">
                <!-- NAV分頁標籤與統計 -->
                <div class="col-12 pb-0 px-0">
                    <ul class="nav nav-tabs">
                        <li class="nav-item"><a class="nav-link active"     href="index.php">訪談清單管理</span></a></li>
                        <?php echo ($sys_role <= 2.5) ? "<li class='nav-item'><a class='nav-link '   href='condition.php'>條件化搜尋</span></a></li>":"";?>
                    </ul>
                </div>
                <!-- 內頁 -->
                <div class="col-12 bg-white">
                    <!-- by各Local儲存點： -->
                    <div class="row">
                        <!-- sort/groupBy function -->
                        <div class="col-md-12 pb-0 ">
                            <form action="" method="GET">
                                <div class="input-group">
                                    <span class="input-group-text">篩選</span>
                                    <select name="_year" id="_year" class="form-select" >
                                        <option value="" hidden selected >-- 請選擇 問卷年度 --</option>
                                        <?php 
                                            echo '<option for="_year" value="All" '.($_year == "All" ? "selected":"" ).' >-- All 所有年度 --</option>';
                                            foreach($year_lists as $list_year){
                                                echo "<option for='_year' value='{$list_year["_year"]}' ";
                                                echo ($list_year["_year"] == $_year ? "selected" : "" )." >".$list_year["_year"]."y</option>";
                                            } ?>
                                    </select>
                                    <select name="_month" id="_month" class="form-select">
                                        <?php 
                                            echo "<option for='_month' value='All' ".(($_month == "All") ? "selected":"" )." >-- 全月份 / All --</option>";
                                            foreach (range(1, 12) as $month_lists) {
                                                $month_str = str_pad($month_lists, 2, '0', STR_PAD_LEFT);
                                                echo "<option for='_month' value='{$month_str}' ".(($month_str == $_month ) ? "selected":"" )." >{$month_str}m</option>";
                                            } ?>
                                    </select>
                                    <select name="_short_name" id="_short_name" class="form-select" >
                                        <option value="" hidden selected >-- 請選擇 問卷類型 --</option>
                                        <?php 
                                            echo '<option for="_short_name" value="All" '.($_short_name == "All" ? "selected":"" ).' >-- All 所有類型 --</option>';
                                            foreach($shortName_lists as $shortName){
                                                echo "<option for='_short_name' value='{$shortName["short_name"]}' ";
                                                echo ($shortName["short_name"] == $_short_name ? "selected" : "" )." >".$shortName["short_name"]."</option>";
                                            } ?>
                                    </select>
                                    <select name="_fab_id" id="_fab_id" class="form-select" >
                                        <option value="" hidden selected >-- 請選擇 問卷Fab --</option>
                                        <?php 
                                            echo '<option for="_fab_id" value="All" '.($_fab_id == "All" ? "selected":"").' >-- All 所有棟別 --</option>';
                                            echo '<option for="_fab_id" value="allMy" '.($_fab_id == "allMy" ? "selected":"").' >-- allMy 部門轄下 '.($sfab_id_str ? "(".$sfab_id_str.")":"").' --</option>';
                                            foreach($fab_lists as $fab){
                                                echo "<option for='_fab_id' value='{$fab["id"]}' ".($fab["id"] == $_fab_id ? "selected" : "" ) ." >";
                                                echo $fab["id"]."：".$fab["site_title"]."&nbsp".$fab["fab_title"]."( ".$fab["fab_remark"]." )"; 
                                                echo ($fab["flag"] == "Off") ? " - (已關閉)":"" ."</option>";
                                            } ?>
                                    </select>
                                    <select name="idty" id="idty" class="form-select" >
                                        <option value="" hidden selected >-- 請選擇 問卷狀態 --</option>
                                        <?php 
                                            echo '<option for="idty" value="All" '.($idty == "All" ? "selected":"").' >-- All 所有狀態 --</option>';
                                            echo '<option for="idty" value="1" '.($idty == "1" ? "selected":"").' >1：立案/簽核中</option>';
                                            echo '<option for="idty" value="10" '.($idty == "10" ? "selected":"").' >10：完成訪談</option>';
                                            echo '<option for="idty" value="6" '.($idty == "6" ? "selected":"").' >6：暫存</option>';
                                            echo '<option for="idty" value="3" '.($idty == "3" ? "selected":"").' >3：取消</option>';
                                        ?>
                                    </select>
                                    <button type="submit" class="btn btn-outline-secondary search_btn" >&nbsp<i class="fa-solid fa-magnifying-glass"></i>&nbsp查詢</button>
                                </div>
                            </form>
                        </div>
                        <!-- Bootstrap Alarm -->
                        <div id="liveAlertPlaceholder" class="col-12 text-center mb-0 pb-0"></div>
                    </div>
                    <table id="caseList" class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th data-toggle="tooltip" data-placement="bottom" title="操作">ANSI單號</th>
                                <th>案件簡稱</th>
                                <th>事件名稱</th>
                                <th>棟別</th>
                                <th>廠處別</th>
                                <th>事故單位</th>
                                <th>表單狀態</th>
                                <th>職災申報</th>
                                <th>立案日 / 人</th>
                                <th>結案存檔</th>
                            </tr>
                        </thead>
                        <tbody>

                            <?php foreach($caseLists as $caseList){ ?>
                                <tr>
                                    <td>
                                        <?php 
                                        echo "<button type='button' value='../interView/form.php?action=review&uuid={$caseList["uuid"]}' class='tran_btn' 
                                            onclick='openUrl(this.value)' data-toggle='tooltip' data-placement='bottom' title='檢視問卷'>{$caseList["anis_no"]}</button>";
                                        // 1簽核中  3作廢  10結案
                                        if((empty($caseList["confirm_sign"]) && !in_array($caseList["idty"], ['1','3','10'])) && ($caseList["created_emp_id"] == $auth_emp_id) || ($sys_role <= 1)){ 
                                            echo "&nbsp<button type='button' value='../interView/form.php?action=edit&uuid={$caseList["uuid"]}' class='btn btn-sm btn-xs "
                                                .(($caseList["created_emp_id"] == $auth_emp_id) ? "btn-success" : "btn-outline-success add_btn" ).
                                                "' onclick='openUrl(this.value)' data-toggle='tooltip' data-placement='bottom' title='編輯問卷'><i class='fa-solid fa-pen-to-square'></i></button>";
                                        } ?>
                                    </td>
                                    <td><?php echo $icon_s.$caseList['_icon'].$icon_e.$caseList['short_name'];?></td>
                                    <td class="word_bk" title="aid_<?php echo $caseList['id'];?>"><?php echo $caseList['id'].".".$caseList['case_title'];?></td>

                                    <td><?php echo $caseList['fab_title']."(".$caseList['fab_remark'].")";?></td>
                                    <td><?php echo $caseList['local_title'];?></td>
                                    <td><?php echo $caseList['a_dept'];?></td>
                                    
                                    <td><?php 
                                            if(!empty($caseList['idty'])){
                                                $c_idty = $caseList['idty'];
                                                switch($caseList['idty']){
                                                    case '0':  $c_idty .= '.啟單';      break;
                                                    case '1':  $c_idty .= '.簽核中';    break;
                                                    case '2':  $c_idty .= '.退件';      break;
                                                    case '3':  $c_idty .= '.作廢';      break;
                                                    case '4':  $c_idty .= '.編輯';      break;
                                                    case '6':  $c_idty .= '.暫存';      break;
                                                    case '10': $c_idty .= '.完成訪談';  break;
                                                    case '11': $c_idty .= '.環安主管';  break;
                                                    case '12': $c_idty .= '.--';        break;
                                                    case '13': $c_idty .= '.承辦簽核';  break;
                                                    default:   $c_idty .= 'N/A';
                                                };
                                            }
                                            echo $c_idty;
                                    ?></td>
                                    <td>
                                        <?php 
                                            $_odd = isset($caseList['_odd']) ? (array) json_decode($caseList['_odd']) : [];
                                            echo "<span class='inb'>";
                                            echo !empty($_odd["due_day"]) ? "截止日：".$_odd["due_day"]."</br>申報日：" : "";
                                            echo !empty($_odd["od_day"])  ? $_odd["od_day"] : (!empty($_odd["due_day"]) ? "--" : "");
                                            echo "</span>";
                                            if(!empty($_odd["due_day"]) && ((empty($_odd["od_day"]) && ($caseList["created_emp_id"] == $auth_emp_id)) || $sys_role <= 2)){
                                                echo "&nbsp<button type='button' value='../interView/process_odd.php?uuid={$caseList["uuid"]}' class='btn btn-sm btn-xs "
                                                    .(($caseList["created_emp_id"] == $auth_emp_id) ? "btn-success" : "btn-outline-success add_btn" ).
                                                    "' onclick='openUrl(this.value)' data-toggle='tooltip' data-placement='bottom' title='編輯申報日'><i class='fa-solid fa-pen-to-square'></i></button>";
                                            } 
                                        ?>
                                    </td>
                                    <td><?php echo substr($caseList["created_at"],0,10)."</br>".$caseList['created_cname'];?></td>

                                    <td class="text-end"><?php
                                        if(!empty($caseList["confirm_sign"])) {
                                            $pdf_path = "{$caseList["case_year"]}/{$caseList["anis_no"]}/";
                                            echo "<button type='button' class='btn text-danger add_btn' data-toggle='tooltip' data-placement='bottom' title='{$caseList["confirm_sign"]}' ";
                                            echo "value='../doc_files/{$pdf_path}{$caseList["confirm_sign"]}' ";
                                            echo " onclick='openUrl(this.value)' ><i class='fa-solid fa-file-pdf fa-2x'></i></button>"; 
                                        };
                                        if((empty($caseList["confirm_sign"]) && $caseList["idty"] === "1" && $caseList["idty"] !== "3" && $caseList["created_emp_id"] == $auth_emp_id) || $sys_role <= 1){
                                            echo "<button type='button' value='../interView/process_pdf.php?uuid={$caseList["uuid"]}' class='btn btn-sm btn-xs "
                                                .(($caseList["created_emp_id"] == $auth_emp_id) ? "btn-secondary" : "btn-outline-secondary add_btn" ).
                                                "' onclick='openUrl(this.value)' data-toggle='tooltip' data-placement='bottom' title='上傳結案PDF' ><i class='fa fa-plus'></i></button>";
                                        }; ?>
                                    </td>
                                </tr>
                            <?php } ?>
                        </tbody>
                    </table>
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
    $(document).ready(function () {
        // 在任何地方啟用工具提示框
        $('[data-toggle="tooltip"]').tooltip();
        // dataTable 2 https://ithelp.ithome.com.tw/articles/10272439
        $('#caseList').DataTable({
            "autoWidth": false,
            // 排序
            "order": [[ 8, "desc" ]],
            // 顯示長度
            "pageLength": 25,
            // 中文化
            "language":{
                url: "../../libs/dataTables/dataTable_zh.json"
            }
        });
    })
    
</script>
<!-- <script src="caseList.js?v=<=time()?>"></script> -->

<?php include("../template/footer.php"); ?>