<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("function.php");
    // accessDenied();
    if(!isset($_SESSION)){ session_start(); }                                                          // 確認session是否啟動
    if(!empty($_SESSION["AUTH"]["pass"]) && !isset($_SESSION[$sys_id])){ accessDenied_sys($sys_id); }  // 套用sys_id權限

        $uri       = (!empty($_SERVER['HTTPS']) && ('on' == $_SERVER['HTTPS'])) ? 'https://' : 'http://';  // 取得開頭
        $uri      .= $_SERVER['HTTP_HOST'];                                                                // 組合成http_host
        $pc        = $_REQUEST["ip"] = $_SERVER['REMOTE_ADDR'];                                            // 取得user IP
        $check_ip  = check_ip($_REQUEST);                                                                  // 驗證IP權限 // 確認電腦IP是否受認證

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

    // $row_lists    = show_log_list($query_arr);
    // $row_lists_yy = show_log_GB_year();              // 取Logs所有年月作為篩選

    // <!-- 20211215分頁工具 -->
        // $per_total = count($row_lists);     //計算總筆數
        // $per = 5;                           //每頁筆數
        // $pages = ceil($per_total/$per);     //計算總頁數;ceil(x)取>=x的整數,也就是小數無條件進1法
        // // !isset 判斷有沒有$_GET['page']這個變數
        // $page = (!isset($_GET['page'])) ? 1 : $_GET['page'];
        // $start = ($page-1)*$per;            //每一頁開始的資料序號(資料庫序號是從0開始)
        // // 合併嵌入分頁工具
        //     $query_arr["start"]  = $start;
        //     $query_arr["per"]    = $per;
        // $row_lists_div = show_log_list($query_arr);
        // $page_start = $start +1;            //選取頁的起始筆數
        // $page_end = $start + $per;          //選取頁的最後筆數
        // if($page_end>$per_total){           //最後頁的最後筆數=總筆數
        //     $page_end = $per_total;
        // }
    // <!-- 20211215分頁工具 -->


    include("../template/header.php"); 
    include("../template/nav.php"); 

?>

<head>
    <link href="../../libs/aos/aos.css" rel="stylesheet">
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer" ></script>
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
                                    <table id="p1_log_table" class="display responsive nowrap" style="width:100%">
                                        <thead>
                                            <tr>
                                                <th data-toggle="tooltip" data-placement="bottom" title="記錄敘述">thisInfo</th>
                                                <th data-toggle="tooltip" data-placement="bottom" title="記錄事項" style="width: 80%;">logs</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
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
                                        <button type="button" id="p2_send_btn" class="btn <?php echo !$mailTo_notify ? 'btn-primary':'btn-warning';?>" data-toggle="tooltip" data-placement="bottom" 
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
                                <table id="p2_table" class="table table-striped table-hover">
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

    var fa_OK       = '<snap class="fa_check">&nbsp<i class="fa fa-check" aria-hidden="true"></i></snap>';    // 打勾符號
    var fa_NG       = '<snap class="fa_remove">&nbsp<i class="fa fa-remove" aria-hidden="true"></i></snap>';  // 打叉符號
    var mail_OK     = '<snap class="fa_check"><i class="fa-solid fa-paper-plane"></i> </snap>';               // 寄信符號
    var mail_NG     = '<snap class="fa_remove"><i class="fa-solid fa-triangle-exclamation"></i></snap>';      // 警告符號
    var mapp_OK     = '<snap class="fa_check"><i class="fa-solid fa-comment-sms"></i> </snap>';               // 簡訊符號
    var mapp_NG     = '<snap class="fa_remove"><i class="fa-solid fa-triangle-exclamation"></i></snap>';      // 警告符號
    
    // const uuid      = '3cd9a6fd-4021-11ef-9173-1c697a98a75f';       // invest

    const Today     = new Date();
    const thisToday = Today.getFullYear() +'/'+ String(Today.getMonth()+1).padStart(2,'0') +'/'+ String(Today.getDate()).padStart(2,'0');  // 20230406_bug-fix: 定義出今天日期，padStart(2,'0'))=未滿2位數補0
    const thisTime  = String(Today.getHours()).padStart(2,'0') +':'+ String(Today.getMinutes()).padStart(2,'0');                           // 20230406_bug-fix: 定義出今天日期，padStart(2,'0'))=未滿2位數補0

    var bpm         = {};
    var doc_lists   = {};
    var notifyLists = {};

</script>

<script src="../change/change_notify.js?v=<?=time()?>"></script>
<script src="notify.js?v=<?=time()?>"></script>

<?php include("../template/footer.php"); ?>
