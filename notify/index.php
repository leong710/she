<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("function.php");
    require_once("../autolog/function.php");
    // accessDenied();
    if(!isset($_SESSION)){ session_start(); }                                                          // 確認session是否啟動
    if(!empty($_SESSION["AUTH"]["pass"]) && !isset($_SESSION[$sys_id])){ accessDenied_sys($sys_id); }  // 套用sys_id權限

        $uri       = (!empty($_SERVER['HTTPS']) && ('on' == $_SERVER['HTTPS'])) ? 'https://' : 'http://';  // 取得開頭
        $uri      .= $_SERVER['HTTP_HOST'];                                                                // 組合成http_host
        $pc        = $_REQUEST["ip"] = $_SERVER['REMOTE_ADDR'];                                            // 取得user IP
        $check_ip  = check_ip($_REQUEST);                                                                  // 驗證IP權限 // 確認電腦IP是否受認證
        $sys_role = (isset($_SESSION[$sys_id]["role"])) ? $_SESSION[$sys_id]["role"] : "";      // 取出$_session引用

        $fun       = (!empty($_REQUEST['fun'])) ? $_REQUEST['fun'] : false ;                               // 先抓操作功能'notify_insign'= MAPP待簽發報 // 確認有帶數值才執行
        // $notify_lists    = notify_list();                                                                  // 載入所有待簽名單

        $reloadTime = (file_exists("reloadTime.txt")) ? file_get_contents("reloadTime.txt") : "";       // 從文件加载reloadTime内容



    // 編輯功能
    if(isset($_POST["deleteLog"])){ deleteLog($_REQUEST); }                     // 刪除整大串
    if(isset($_POST["delLog_item"])){ delLog_item($_REQUEST); }                 // 刪除小項

    // 取得年月參數
        $_year = (isset($_REQUEST["_year"])) ? $_REQUEST["_year"] : date('Y');      // 今年
        $_month = (isset($_REQUEST["_month"])) ? $_REQUEST["_month"] : date('m');   // 今月 // $_month = "All";  
        
    // 組合查詢陣列
        $query_arr = array(                           // 組合查詢陣列 -- 建立查詢陣列for顯示今年領用單
            '_year' => $_year,
            '_month' => $_month
        );

    $row_lists    = show_log_list($query_arr);
    $row_lists_yy = show_log_GB_year();              // 取Logs所有年月作為篩選

    // <!-- 20211215分頁工具 -->
        $per_total = count($row_lists);     //計算總筆數
        $per = 5;                           //每頁筆數
        $pages = ceil($per_total/$per);     //計算總頁數;ceil(x)取>=x的整數,也就是小數無條件進1法
        // !isset 判斷有沒有$_GET['page']這個變數
        $page = (!isset($_GET['page'])) ? 1 : $_GET['page'];
        $start = ($page-1)*$per;            //每一頁開始的資料序號(資料庫序號是從0開始)
        // 合併嵌入分頁工具
            $query_arr["start"]  = $start;
            $query_arr["per"]    = $per;
        $row_lists_div = show_log_list($query_arr);
        $page_start = $start +1;            //選取頁的起始筆數
        $page_end = $start + $per;          //選取頁的最後筆數
        if($page_end>$per_total){           //最後頁的最後筆數=總筆數
            $page_end = $per_total;
        }
    // <!-- 20211215分頁工具 -->

    // echo "<pre>";
        // print_r($row_lists_div);
    // echo "</pre>";


    include("../template/header.php"); 
    include("../template/nav.php"); 

?>

<head>
    <link href="../../libs/aos/aos.css" rel="stylesheet">
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer" ></script>
    <link rel="stylesheet" type="text/css" href="../../libs/dataTables/jquery.dataTables.css">  <!-- dataTable參照 https://ithelp.ithome.com.tw/articles/10230169 --> <!-- data table CSS+JS -->
    <script type="text/javascript" charset="utf8" src="../../libs/dataTables/jquery.dataTables.js"></script>
    <script src="../../libs/jquery/jquery.mloading.js"></script>
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">
    <script src="../../libs/jquery/mloading_init.js"></script>
    <style>
        /* 當螢幕寬度小於或等於 1366px時 */
        @media (max-width: 1366px) {
            .col-mm-10 {
                flex: 0 0 calc(100% / 12 * 12);
            }
        }
        /* 當螢幕寬度大於 1366px時 */
        @media (min-width: 1367px) {
            .col-mm-10 {
                flex: 0 0 calc(100% / 12 * 9);
            }
        }
        .fa_check {
            color: #00ff00;
            text-shadow: 3px 3px 5px rgba(0,0,0,.5);
        }
        .fa_remove {
            color: #ff0000;
            text-shadow: 3px 3px 5px rgba(0,0,0,.5);
        }
        #result {
            text-align: center;
        }
                /* tr > td {
            text-align: left;
        } */
        .mg_msg {
            width: 60%;
        }
        .NG {
            background-color: pink;
            font-weight: bold;
        }
        .today {
            background-color: paleturquoise;
            font-weight: bold;
        }
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
                <div class="col-12 pb-0">
                    <!-- Bootstrap Alarm -->
                    <div id="liveAlertPlaceholder" class="col-12 text-center mb-0 p-0"></div>
                    <!-- NAV分頁標籤 -->
                    <nav>
                        <div class="nav nav-tabs" id="nav-tab" role="tablist">
                            <button type="button" class="nav-link active" id="nav-p1-tab" data-bs-toggle="tab" data-bs-target="#nav-p1_table" role="tab" aria-controls="nav-p1" aria-selected="false"><i class="fa-solid fa-share-from-square"></i>&nbsp;發報紀錄</button>
                            <?php if($sys_role <= 1){ ?>
                                <button type="button" class="nav-link "   id="nav-p2-tab" data-bs-toggle="tab" data-bs-target="#nav-p2_table" role="tab" aria-controls="nav-p2" aria-selected="false"><i class="fa-solid fa-2"></i>&nbsp;變更作業健檢通知</button>
                                <button type="button" class="nav-link "   id="nav-p3-tab" data-bs-toggle="tab" data-bs-target="#nav-p3_table" role="tab" aria-controls="nav-p3" aria-selected="false"><i class="fa-solid fa-3"></i>&nbsp;定期特殊健檢通知</button>
                            <?php }?>
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
                                    <div class="col-8 col-md-7 py-1 inf">
                                        <snap for="deptNo_opts" class="form-label"><h3>已登錄之發報紀錄：</h3></snap>
                                     </div>

                                    <div class="col-4 col-md-5 py-1 text-end">
                                        <form action="" method="post">
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fa fa-search"></i>&nbsp篩選</span>
                                                <select name="_year" id="_year" class="form-select">
                                                    <option for="_year" value="All" <?php if($_year == "All"){ ?>selected<?php } ?> >-- 年度 / All --</option>
                                                    <?php foreach($row_lists_yy as $row_list_yy){ ?>
                                                        <option for="_year" value="<?php echo $row_list_yy["_year"];?>" <?php echo ($row_list_yy["_year"] == $_year) ? "selected":"";?>>
                                                            <?php echo $row_list_yy["_year"]."y";?></option>
                                                    <?php } ?>
                                                </select>
                                                <select name="_month" id="_month" class="form-select">
                                                    <option for="_month" value="All" <?php echo ($_month == "All") ? "selected":"";?> >-- 全年度 / All --</option>
                                                    <?php foreach (range(1, 12) as $item) {
                                                            echo "<option for='_month' value='{$item}'";
                                                            echo ($item == $_month ) ? "selected":"";
                                                            echo " >{$item}m</option>";
                                                        } ?>
                                                </select>
                                                <button type="submit" class="btn btn-outline-secondary">查詢</button>
                                            </div>
                                        </form>  
                                    </div>
                                </div>

                                <div id="p1_logs_inside" class="row p-0">
                                    <!-- 20211215分頁工具 -->               
                                    <div class="row">
                                        <div class="col-12 col-md-6 pb-0">	
                                            <?php //每頁顯示筆數明細
                                                echo '顯示 '.$page_start.' 到 '.$page_end.' 筆 共 '.$per_total.' 筆，目前在第 '.$page.' 頁 共 '.$pages.' 頁'; 
                                            ?>
                                        </div>
                                        <div class="col-12 col-md-6 pb-0 text-end">
                                            <?php
                                                if($pages>1){  //總頁數>1才顯示分頁選單
            
                                                    //分頁頁碼；在第一頁時,該頁就不超連結,可連結就送出$_GET['page']
                                                    if($page=='1'){
                                                        echo "首頁 ";
                                                        echo "上一頁 ";		
                                                    }else if(isset($list_ym)){
                                                        echo "<a href=?list_ym=".$list_ym."&page=1>首頁 </a> ";
                                                        echo "<a href=?list_ym=".$list_ym."&page=".($page-1).">上一頁 </a> ";	
                                                    }else{
                                                        echo "<a href=?page=1>首頁 </a> ";
                                                        echo "<a href=?page=".($page-1).">上一頁 </a> ";		
                                                    }
            
                                                    //此分頁頁籤以左、右頁數來控制總顯示頁籤數，例如顯示5個分頁數且將當下分頁位於中間，則設2+1+2 即可。若要當下頁位於第1個，則設0+1+4。也就是總合就是要顯示分頁數。如要顯示10頁，則為 4+1+5 或 0+1+9，以此類推。	
                                                    for($i=1 ; $i<=$pages ;$i++){ 
                                                        $lnum = 2;  //顯示左分頁數，直接修改就可增減顯示左頁數
                                                        $rnum = 2;  //顯示右分頁數，直接修改就可增減顯示右頁數
            
                                                        //判斷左(右)頁籤數是否足夠設定的分頁數，不夠就增加右(左)頁數，以保持總顯示分頁數目。
                                                        if($page <= $lnum){
                                                            $rnum = $rnum + ($lnum-$page+1);
                                                        }
            
                                                        if($page+$rnum > $pages){
                                                            $lnum = $lnum + ($rnum - ($pages-$page));
                                                        }
                                                        //分頁部份處於該頁就不超連結,不是就連結送出$_GET['page']
                                                        if($page-$lnum <= $i && $i <= $page+$rnum){
                                                            if($i==$page){
                                                                echo $i.' ';
                                                            }else if(isset($list_ym)){
                                                                echo '<a href=?list_ym='.$list_ym.'&page='.$i.'>'.$i.'</a> ';
                                                            }else{
                                                                echo '<a href=?page='.$i.'>'.$i.'</a> ';
                                                            }
                                                        }
                                                    }
                                                    //在最後頁時,該頁就不超連結,可連結就送出$_GET['page']	
                                                    if($page==$pages){
                                                        echo " 下一頁";
                                                        echo " 末頁";
                                                    }else if(isset($list_ym)){
                                                        echo "<a href=?list_ym=".$list_ym."&page=".($page+1)."> 下一頁</a>";
                                                        echo "<a href=?list_ym=".$list_ym."&page=".$pages."> 末頁</a>";		
                                                    }else{
                                                        echo "<a href=?page=".($page+1)."> 下一頁</a>";
                                                        echo "<a href=?page=".$pages."> 末頁</a>";		
                                                    }
                                                }
                                            ?>
                                        </div>
                                    </div>
                                    <!-- 20211215分頁工具 -->
                                    <table id="p1_log_table" class="display responsive nowrap" style="width:100%">
                                        <thead>
                                            <tr>
                                                <th data-toggle="tooltip" data-placement="bottom" title="記錄敘述">thisInfo</th>
                                                <th data-toggle="tooltip" data-placement="bottom" title="記錄事項" style="width: 80%;">logs</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach($row_lists_div as $log){ 
                                                $logs_log = json_decode($log['logs']);                        // 1.把json字串反解成物件或陣列
                                                if(is_object($logs_log)) { $logs_log = (array)$logs_log; }    // 2.判斷 物件轉陣列
                                                $logs_json = $logs_log['autoLogs'];                           // 3.只取autoLogs的部分
                                            ?>
                                                <tr id="<?php echo $log['id']; ?>">
                                                    <!-- 第1格.thisInfo 紀錄敘述 -->
                                                    <td class="<?php echo ($log['thisDay'] == date('Y/m/d')) ? 'today':'';?>">
                                                        <?php echo $log['thisDay']."</br>";
                                                            if($sys_role == 0){ ?>
                                                                <form action="" method="post" class='inf'>
                                                                    <input type="hidden" name="list_ym" value="<?php echo $list_ym; ?>">
                                                                    <input type="hidden" name="page" value="<?php echo $page == '1' ? '1':$page; ?>">
                                                                    <input type="hidden" name="id" value="<?php echo $log['id']; ?>">
                                                                    <input type="submit" name="deleteLog" value="Del" class="btn btn-sm btn-xs btn-secondary" onclick="return confirm('確認刪除？')">
                                                                </form>
                                                        <?php echo "&nbsp(aid:".$log['id'].")&nbsp" .$log['sys']." => ".count($logs_json)."次  ";
                                                    
                                                        }?>
                                                    </td>
                                                    <!-- 第2格.Logs 紀錄內容 -->
                                                    <td>
                                                        <table>
                                                            <?php $i = 0;
                                                                foreach($logs_json AS $l){
                                                                    if(is_object($l)) { $l = (array)$l; } 
                                                                    echo "<tr><td class='".(isset($l["mail_res"]) ? $l["mail_res"]:' '). (!empty($l["emergency"]) ? ' alert_it':' ') ."' style='text-align: left;'>";
                                                                    if($sys_role == 0){ ?>
                                                                        <form action="" method="post" class='inf'>
                                                                            <input type="hidden" name="list_ym"     value="<?php echo $list_ym; ?>">
                                                                            <input type="hidden" name="page"        value="<?php echo $page == '1' ? '1':$page; ?>">
                                                                            <input type="hidden" name="log_id"      value="<?php echo $i;?>">
                                                                            <input type="hidden" name="id"          value="<?php echo $log['id'];?>">
                                                                            <input type="submit" name="delLog_item" value="Del" class="btn btn-sm btn-xs btn-secondary" onclick="return confirm('確認刪除？')">
                                                                        </form>
                                                                    <?php echo "&nbsp"; } 
                                                                    echo ($i+1) ."_" .$l["cname"]." (".$l["emp_id"].") ". (isset($l["emergency"]) ? "&nbsp急件：".$l["emergency"] : "") ;
                                                                    echo "&nbsp&nbsp".$l["thisTime"]." => " .(isset($l["mail_res"]) ? $l["mail_res"]:$l["mapp_res"]) ;
                                                                    echo "</td>" ."<td class='word_bk mg_msg' >".$l["mg_msg"]."</td></tr>";
                                                                    $i++;
                                                                } 
                                                            ?>
                                                        </table>
                                                    </td>
                                                </tr>
                                            <?php } ?>
                                        </tbody>
                                    </table>
                                    <hr>
                                    <!-- 20211215分頁工具 -->               
                                    <div class="row">
                                        <div class="col-12 col-md-6 pt-0">	
                                            <?php //每頁顯示筆數明細
                                                echo '顯示 '.$page_start.' 到 '.$page_end.' 筆 共 '.$per_total.' 筆，目前在第 '.$page.' 頁 共 '.$pages.' 頁'; 
                                            ?>
                                        </div>
                                        <div class="col-12 col-md-6 pt-0 text-end">
                                            <?php
                                                if($pages>1){  //總頁數>1才顯示分頁選單
            
                                                    //分頁頁碼；在第一頁時,該頁就不超連結,可連結就送出$_GET['page']
                                                    if($page=='1'){
                                                        echo "首頁 ";
                                                        echo "上一頁 ";		
                                                    }else if(isset($list_ym)){
                                                        echo "<a href=?list_ym=".$list_ym."&page=1>首頁 </a> ";
                                                        echo "<a href=?list_ym=".$list_ym."&page=".($page-1).">上一頁 </a> ";	
                                                    }else{
                                                        echo "<a href=?page=1>首頁 </a> ";
                                                        echo "<a href=?page=".($page-1).">上一頁 </a> ";		
                                                    }
            
                                                    //此分頁頁籤以左、右頁數來控制總顯示頁籤數，例如顯示5個分頁數且將當下分頁位於中間，則設2+1+2 即可。若要當下頁位於第1個，則設0+1+4。也就是總合就是要顯示分頁數。如要顯示10頁，則為 4+1+5 或 0+1+9，以此類推。	
                                                    for($i=1 ; $i<=$pages ;$i++){ 
                                                        $lnum = 2;  //顯示左分頁數，直接修改就可增減顯示左頁數
                                                        $rnum = 2;  //顯示右分頁數，直接修改就可增減顯示右頁數
            
                                                        //判斷左(右)頁籤數是否足夠設定的分頁數，不夠就增加右(左)頁數，以保持總顯示分頁數目。
                                                        if($page <= $lnum){
                                                            $rnum = $rnum + ($lnum-$page+1);
                                                        }
            
                                                        if($page+$rnum > $pages){
                                                            $lnum = $lnum + ($rnum - ($pages-$page));
                                                        }
                                                        //分頁部份處於該頁就不超連結,不是就連結送出$_GET['page']
                                                        if($page-$lnum <= $i && $i <= $page+$rnum){
                                                            if($i==$page){
                                                                echo $i.' ';
                                                            }else if(isset($list_ym)){
                                                                echo '<a href=?list_ym='.$list_ym.'&page='.$i.'>'.$i.'</a> ';
                                                            }else{
                                                                echo '<a href=?page='.$i.'>'.$i.'</a> ';
                                                            }
                                                        }
                                                    }
                                                    //在最後頁時,該頁就不超連結,可連結就送出$_GET['page']	
                                                    if($page==$pages){
                                                        echo " 下一頁";
                                                        echo " 末頁";
                                                    }else if(isset($list_ym)){
                                                        echo "<a href=?list_ym=".$list_ym."&page=".($page+1)."> 下一頁</a>";
                                                        echo "<a href=?list_ym=".$list_ym."&page=".$pages."> 末頁</a>";		
                                                    }else{
                                                        echo "<a href=?page=".($page+1)."> 下一頁</a>";
                                                        echo "<a href=?page=".$pages."> 末頁</a>";		
                                                    }
                                                }
                                            ?>
                                        </div>
                                    </div>
                                    <!-- 20211215分頁工具 -->
                                </div> 
                            </div>
                        </div>
                    </div>

                    <!-- p2 -->
                    <div id="nav-p2_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p2-tab">
                        <div class="col-12 bg-white">
                            <!-- p2表頭 -->
                            <div class="row">
                                <div class="col-12 col-md-6 py-0">
                                    <h3><i class="fa-solid fa-2"></i>&nbsp;變更作業健檢-待通報清單統計</h3>
                                </div>
                                <div class="col-12 col-md-6 py-0 text-end">
                                    <?php if($sys_role <= 1 || $check_ip){ ?>
                                        <button type="button" id="p2notify_btn" class="btn <?php echo !$mailTo_notify ? 'btn-primary':'btn-warning';?>" data-toggle="tooltip" data-placement="bottom" 
                                            title="P2 send notify" ><i class="fa-solid fa-paper-plane"></i>&nbsp;傳送&nbsp;Email</button>
                                        <button type="button" class="btn btn-success" value="../_downloadDoc?emp_id=10008048,202502" onclick="openUrl(this.value)"><i class="fa-solid fa-arrow-up-right-from-square"></i>&nbsp;預覽通知書</button>

                                    <?php } ?>
                                </div>
                            </div>
                            <!-- p2表身 -->
                            <div class="row">
                                <div class="col-12 py-0 text-primary">
                                    <button type="button" title="訊息收折" class="op_tab_btn" id="p2_notify_lists_btn" value="p2_notify_lists" onclick="op_tab(this.value)"><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></button>
                                    待通知名單共：<span id="p2totalUsers_length"></span>
                                </div>
                            </div>
                            <hr>
                            <div id="p2_notify_lists" class="notify_lists col-12 mt-2 border rounded">
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
                            </div>
                        </div>
                    </div>

                    <!-- p3 -->
                    <div id="nav-p3_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p3-tab">
                        <div class="col-12 bg-white">
                            <!-- p3表頭 -->
                            <div class="row">
                                <div class="col-12 col-md-6 py-0">
                                    <h3><i class="fa-solid fa-3"></i>&nbsp;定期特殊健檢-待通報清單統計</h3>
                                </div>
                                <div class="col-12 col-md-6 py-0 text-end">
                                    <?php if($sys_role == 0 || $check_ip){ ?>
                                        <button type="button" id="p3_send_btn" class="btn <?php echo !$mailTo_notify ? 'btn-primary':'btn-warning';?>" data-toggle="tooltip" data-placement="bottom" 
                                            title="P3 send notify" onclick="return confirm('確認發報？') && notify_process()"><i class="fa-solid fa-paper-plane"></i>&nbsp;傳送&nbsp;Email</button>
                                    <?php } ?>
                                </div>
                            </div>
                            <!-- p3表身 -->
                            <div class="row">
                                <div class="col-12 py-0 text-primary">
                                    <button type="button" title="訊息收折" class="op_tab_btn" id="p3_notify_lists_btn" value="p3_notify_lists" onclick="op_tab(this.value)"><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></button>
                                    待通知名單共：<span id="p3totalUsers_length"></span> 筆
                                </div>
                            </div>
                            <hr>
                            <div id="p3_notify_lists" class="notify_lists col-12 mt-2 border rounded">
                                <table id="p3_table" class="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th class="table-success">年月</th>
                                            <th class="table-success">廠區</th>
                                            <th class="table-success">工號</th>
                                            <th class="table-success">姓名</th>
                                            <th class="table-success">部門代號</th>
                                            <th class="table-success">變更體檢項目</th>
                                            <th class="table-warning">是否檢查</th>
                                            <th class="table-warning">備註說明</th>
                                            <th class="table-warning">受檢日期</th>
                                            <th class="table-primary">總窗備註</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <hr>
                <!-- 頁尾操作訊息 -->
                <div class="col-12 py-0"><b>執行訊息：</b></div>
                <!-- append執行訊息 -->
                <div class="col-12 bg-white border rounded py-2 my-0" id="p2result"></div>
                <div class="row">
                    <div class="col-6 col-md-4">
                        <?php echo ($sys_role == 0) ? "* [管理者]" : "* [路人]";
                                echo ($check_ip ? " V ":" X ")." ".$pc; ?>
                    </div>
                    <div class="col-6 col-md-4 text-center">
                        <div id="myMessage">
                            <?php echo (!empty($fun)) ? "** 自動模式 **" : "** 手動模式 **"; ?>
                        </div>
                    </div>
                    <!-- 20231108-資料更新時間 -->
                    <div class="col-6 col-md-4 text-end">
                        <span style="display: inline-block;" >
                            <button type="button" class="btn btn-outline-success add_btn" onclick="load_init(true)" data-toggle="tooltip" data-placement="bottom" title="強制更新"
                                <?php echo ($sys_role == 0) ? "":"disabled";?> ><i class="fa-solid fa-rotate"></i></button>&nbspLast reload time：</span>
                        <span style="display: inline-block;" id="reload_time" title="" ><?php echo $reloadTime;?></span>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <!-- toast -->
    <div id="toastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 11"></div>

    <div id="gotop">
        <i class="fas fa-angle-up fa-2x"></i>
    </div>
</body>

<script src="../../libs/aos/aos.js"></script>
<script src="../../libs/aos/aos_init.js"></script>
<script src="../../libs/sweetalert/sweetalert.min.js"></script>
<script src="../../libs/openUrl/openUrl.js?v=<?=time();?>"></script>           <!-- 彈出子畫面 -->
<script>
    // init
    const uri       = '<?=$uri?>';
    const fun       = '<?=$fun?>';                                  // 是否自動啟動寄送信件給人員
    const check_ip  = '<?=$check_ip?>';

    const reload_time = document.getElementById('reload_time');

    var bpm         = {};
    var doc_lists   = {};
    var notifyLists = {};

    const userInfo = {
        'role'     : '<?=$sys_role?>',
        'BTRTL'    : ('<?=$sys_BTRTL?>').split(','),     // 人事子範圍-建物代號
        'empId'    : '<?=$auth_emp_id?>',
        'cname'    : '<?=$auth_cname?>',
        'signCode' : '<?=$auth_sign_code?>',
    }

</script>
<!-- change 要新載入 -->
<script src="../change/change_notify.js?v=<?=time()?>"></script>
<script src="notify.js?v=<?=time()?>"></script>

<?php include("../template/footer.php"); ?>
