<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("function.php");
    accessDenied($sys_id);

    // for return
    $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁

    // default fab_scope
        $fab_scope = ($sys_role <= 1 ) ? "All" : "All";               // All :allMy
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
        $shLocals       = show_shLocal($query_arr);     // get case清單
        $per_total      = count($shLocals);             //計算總筆數
    // for select item
        $fab_lists      = show_fab_lists();             // get 廠區清單
        $OSHORT_lists   = show_OSHORT();                // get 部門代號

            $icon_s = '<i class="';
            $icon_e = ' fa-2x"></i>&nbsp&nbsp';

    $shLocal_OSHORTs = load_shLocal_OSHORTs();                                      // step1.取得特危健康場所部門代號
    if(count($shLocal_OSHORTs) >0 ){
        $shLocal_OSHORTs_str = json_encode($shLocal_OSHORTs, JSON_UNESCAPED_UNICODE);   // step2.陣列轉字串
        $shLocal_OSHORTs_str = trim($shLocal_OSHORTs_str, '[]');    // step3.去掉括號forMysql查詢
    }else{
        $shLocal_OSHORTs_str = "";
    }

    // echo "<pre>";
    // print_r($shLocals);
    // echo "</pre>";
            
    include("../template/header.php");
    include("../template/nav.php"); 
?>

<head>
    <link href="../../libs/aos/aos.css" rel="stylesheet">                                           <!-- goTop滾動畫面aos.css 1/4-->
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>            <!-- Jquery -->
        <link rel="stylesheet" type="text/css" href="../../libs/dataTables/jquery.dataTables.css">  <!-- dataTable參照 https://ithelp.ithome.com.tw/articles/10230169 --> <!-- data table CSS+JS -->
        <script type="text/javascript" charset="utf8" src="../../libs/dataTables/jquery.dataTables.js"></script>
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
        header {
            background-image: 
                linear-gradient(to right, rgba(0,0,0,0.8), transparent),
                URL("../image/ct_map1.png");
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            /* padding-top: 10px; */
            padding-bottom: 30px;
            /* text-align: center; */
        }
        .body > ul {
            padding-left: 0px;
        }
        #banner li {
            margin: 10px 0;
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
            .infb {
                justify-content: space-between;
                /* justify-content: space-around; */
            }
        .h6 {
            font-size: 12px;
        }
        .btn {
            padding: 4px 4px;
        }
        .banner {
            /* 若綠 わかみどり */
            /* background-color: #98D98E; */
            /* 若草色 わかくさいろ */
            /* background-color: #C3D825; */
            /* 若竹色 わかたけいろ */
            /* background-color: #68BE8D; */
            /* 若芽色 わかめいろ */
            background-color: #E0EBAF;
        }
        .banner-img{
            width: auto;
            height: 150px;
        }
    </style>
</head>
<body>
    <header>
        <div class="col-12">
            <div class="row justify-content-center">
                <div class="col_xl_11 col-12 rounded" style="background-color: rgba(255, 255, 255, .5);">
                    
                    <div id="banner" class="col-12 my-3 p-1 border rounded banner inf infb"></div>
                    <!-- Bootstrap Alarm -->
                    <div id="liveAlertPlaceholder" class="col-12 text-center mb-0 p-0"></div>

                    <!-- NAV分頁標籤與統計 -->
                    <div class="col-12 p-0 ">
                        <nav>
                            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                                <button type="button" class="nav-link active" id="nav-p1-tab" data-bs-toggle="tab" data-bs-target="#nav-p1_table" role="tab" aria-controls="nav-p1" aria-selected="false">特危作業管理</button>
                                <button type="button" class="nav-link"        id="nav-p2-tab" data-bs-toggle="tab" data-bs-target="#nav-p2_table" role="tab" aria-controls="nav-p2" aria-selected="false">特危作業清單</button>
                                <!-- <button type="button" class="nav-link"        id="nav-p3-tab" data-bs-toggle="tab" data-bs-target="#nav-p3_table" role="tab" aria-controls="nav-p3" aria-selected="false">p3</button> -->
                                <button type="button" class="nav-link <?php echo ($sys_role <= 1) ? "":"disabled unblock";?>" value="he_cate.php?action=edit" onclick="openUrl(this.value)"><i class="fa-solid fa-arrow-up-right-from-square"></i>&nbsp;危害類別管理</button>
                            </div>
                        </nav>
                    </div>
                    <!-- 內頁 -->
                    <div class="tab-content" id="nav-tabContent">
                        <!-- p1 -->
                        <div id="nav-p1_table" class="tab-pane fade show active" role="tabpanel" aria-labelledby="nav-p1-tab">
                            <div class="col-12 bg-white">
                                <!-- step-0 資料交換 -->
                                <div class="unblock" id="row_OSTEXT_30">
                                    <!-- 1-1.放原始 shLocal_str -->
                                    <?php echo $shLocal_OSHORTs_str;?>
                                </div>
                                <div class="row">
                                    <div class="col-12 col-md-6 py-0">
                                        <snap for="OSHORTs_opts" class="form-label">特殊危害健康作業場所(部門)管理：</snap>
                                    </div>
                                    <div class="col-12 col-md-6 py-0 text-end">
                                        <div class="<?php echo ($per_total != 0) ? "inb":"unblock";?>">
                                            <button type="button" id="truncate_shLocal_btn" class="btn btn-outline-danger add_btn" <?php echo ($sys_role <= 1) ? "":"disabled";?> ><i class="fa-solid fa-trash-can"></i> 刪除</button>
                                        </div>
                                        <!-- 下載EXCEL的觸發 -->
                                        <div class="<?php echo ($per_total != 0) ? "inb":"unblock";?>">
                                            <form id="shLocal_myForm" method="post" action="../_Format/download_excel.php">
                                                <input  type="hidden" name="htmlTable" id="shLocal_htmlTable" value="">
                                                <button type="submit" name="submit" class="btn btn-outline-success add_btn" value="shLocal" onclick="downloadExcel(this.value)" ><i class="fa fa-download" aria-hidden="true"></i> 下載</button>
                                            </form>
                                        </div>
                                        <button type="button" id="load_excel_btn"  class="btn btn-outline-primary add_btn" data-bs-toggle="modal" data-bs-target="#load_excel"><i class="fa fa-upload" aria-hidden="true"></i> 上傳</button>
                                        <button type="button" class="btn btn-primary" value="form.php?action=create" onclick="openUrl(this.value)" ><i class="fa fa-plus"></i> 新增</button>
                                    </div>
                                </div>
                                <div class="col-12 px-0 py-1">
                                    <div id="OSHORTs_opts" class="col-12 p-1">
                                        <div id="OSHORTs_opts_inside" class="row">
                                            <!-- 放checkbox按鈕的地方 -->
                                        </div> 
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        <!-- p2 -->
                        <div id="nav-p2_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p2-tab">
                            <div class="col-12 bg-white">
                                <!-- by各shLocal： -->
                                 <table id="shLocal" class="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th title="OSTEXT_30">廠區</th>
                                            <th data-toggle="tooltip" data-placement="bottom" title="OSHORT">部門代碼</th>
                                            <th title="OSTEXT">部門名稱</th>
                                            <th title="HE_CATE">類別</th>
                                            <th title="MONIT_NO">監測編號</th>
                                            <th title="MONIT_LOCAL">監測處所</th>
                                            <th title="WORK_DESC">作業描述</th>
                                            <th title="AVG_VOL">A權音壓級 <sup>(dBA)</sup></th>
                                            <th title="AVG_8HR/工作日8小時平均音壓值">日時量平均 <sup>(dBA)</sup></th>
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
                                                <td><?php 
                                                        $HE_CATE = trim($shLocal['HE_CATE'], '{}');    // 去除開頭和結尾的 {} 字符
                                                        $HE_CATE = str_replace('"', '', $HE_CATE);     // 去除所有的 " 字符
                                                        $HE_CATE = str_replace(',', '<br>', $HE_CATE); // 替換逗號為 <br>
                                                        echo $HE_CATE;
                                                ?></td>
                                                <td><?php echo $shLocal["MONIT_NO"];?></td>
                                                <td><?php echo $shLocal['MONIT_LOCAL'];?></td>
                                                <td class="word_bk"><?php echo $shLocal['WORK_DESC'];?></td>
                                                <td><?php echo $shLocal['AVG_VOL'];?></td>
                                                <td><?php echo $shLocal['AVG_8HR'];?></td>
    
                                                <td><?php 
                                                        echo "<span class='badge rounded-pill ";
                                                        echo ($shLocal['flag'] == "On") ? "bg-success ":" bg-danger ";
                                                        echo "'>".$shLocal['flag']."</span>"
                                                    ?></td>
                                                <td class="h6"><?php 
                                                        echo substr($shLocal["updated_at"],0,10)."<br>".$shLocal['updated_cname'];
                                                        if(($sys_role <= 1) || ($shLocal['OSHORT'] == $auth_sign_code && $sys_role != '')){ 
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
    
                        <!-- p3 -->
                        <div id="nav-p3_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p3-tab">
                        </div>
                    </div>
                    <br>
                </div>
            </div>
        </div>
    </header>
   
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
                    <form name="excelInput" action="../_Format/upload_excel.php" method="POST" enctype="multipart/form-data" target="api" onsubmit="return loadExcelForm()">
                        <div class="row">
                            <div class="col-6 col-md-8 py-0">
                                <label for="excelFile" class="form-label">特作管理清單 <span>&nbsp<a href="../_Format/snLocal_example.xlsx" target="_blank">上傳格式範例</a></span> 
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
                            <iframe id="api" name="api" width="100%" height="30" style="display: none;" onclick="loadExcelForm()"></iframe>
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

    const shLocals       = <?=json_encode($shLocals)?>;    // 引入shLocal資料

    const OSHORTsTXT = (document.getElementById('row_OSTEXT_30').innerText).trim();
    const OSHORTsObj = OSHORTsTXT ? JSON.parse(OSHORTsTXT) : OSHORTsTXT; // 將row_OSTEXT_30的字串轉換為物件

</script>
<script src="sh_local.js?v=<?=time()?>"></script>

<?php include("../template/footer.php"); ?>