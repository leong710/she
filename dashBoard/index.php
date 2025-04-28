<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("service_window.php");             // service window
    $sw_arr = (array) json_decode($sw_json);        // service window 物件轉陣列
    if(!isset($_SESSION)){                          // 確認session是否啟動
		session_start();
	}
    //    accessDenied($sys_id);
    if(!empty($_SESSION["AUTH"]["pass"]) && empty($_SESSION[$sys_id])){
        accessDenied_sys($sys_id);
    }

    // 複製本頁網址藥用
    // $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁

    $reloadTime = (file_exists("reloadTime.txt")) ? file_get_contents("reloadTime.txt") : "";       // 從文件加载reloadTime内容

    include("../template/header.php");
    include("../template/nav.php"); 
?>
<head>
    <link href="../../libs/aos/aos.css" rel="stylesheet">                                           <!-- goTop滾動畫面aos.css 1/4-->
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>            <!-- Jquery -->
    <script src="../../libs/sweetalert/sweetalert.min.js"></script>                                 <!-- 引入 SweetAlert 的 JS 套件 參考資料 https://w3c.hexschool.com/blog/13ef5369 -->
    <script src="../../libs/jquery/jquery.mloading.js"></script>                                    <!-- mloading JS 1/3 -->
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">                            <!-- mloading CSS 2/3 -->
    <script src="../../libs/jquery/mloading_init.js"></script>                                      <!-- mLoading_init.js 3/3 -->
    <script src="../../libs/apache-echarts/560/echarts.min.js"></script>                            <!-- 引用eChart script 1/3 -->
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
            .form_btn {
                width:  100%;
                background: white;
                /* width:  367px; */
                /* height: 110px; */
            }
            .bs-b {
                box-shadow: 0 5px 15px -2px rgba(3 , 65 , 134 , .7);
            }
            /* 確保父元素具有定位上下文 */
            .parent {
                position: relative;
                height: 90vh; /* 或任何你希望的高度 */
            }
            /* 將 #remark 定位在父元素的底部 */
            .remark {
                position: absolute;
                bottom: 1em;
                width: 95%;
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
            .bg-c-blue {
                background: linear-gradient(45deg,#4099ff,#73b4ff);
            }
            /* 遮罩 */
            #btn_list {
                position: relative;
                display: inline-block;
            }

            #overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.7);
                display: none;
                justify-content: center;
                align-items: center;
                pointer-events: none;
            }
            .banner {
                width: 100%;
                height: auto;
                position: relative;
                overflow: hidden;
            }
            p {
                /* 對齊方式 */
                text-align: center;    
                letter-spacing: 2px;    /*字距，英文是每個字母，中文是每個文字*/
                /* word-spacing: 15px; */ /*字距，英文是每個單字，中文是每個文字*/
                /* line-height: 30px;     行高 */
                line-height: 1.4em;     /* em=父元素倍率，老師常用此行高 */

                /* text-transform: capitalize; */
                /* uppercase全部大寫, lowercase全部小寫, capitalize第一個字大寫 */
                font-size: 1.2em;
                font-weight: 300;
                /* 100-900, bold 加粗=600, bolder, lighter=200細字-看字體支援, normal一般, */
                font-style: normal;
                /* normal正常, italic斜體 */
                font-family: "New Tegomin","標楷體";
            }
            b {
                /* 100-900, bold 加粗=600, bolder, lighter=200細字-看字體支援, normal一般, */
                font-style: bolder;
            }
            .title {
                flex-grow: 1;
                align-items: center;
                text-align: center;
                /* display: flex; */
                /* justify-content: start; */
                font-size: 22px;
                /* font-family: 'Nunito', sans-serif; */
                font-weight: 200;
                /* height: 100vh; */
                margin: 0;
                /* 文字陰影效果 */
                letter-spacing: 3px;
                text-shadow: 3px 3px 5px rgba(0,0,0,.5);
                /* color: #636b6f; */
            }
    </style>
    <link rel="stylesheet" href="wave.css">
</head>

<body>
    <div class="col-12">
        <div class="row justify-content-center">
            <div class="col-mm-10 col-12 rounded p-3 " style="background-color: rgba(255, 255, 255, .7);">
                <!-- Bootstrap Alarm -->
                <div id="liveAlertPlaceholder" class="col-12 text-center m-0 p-0"></div>
                <!-- NAV分頁標籤與統計 -->
                <div class="col-12 p-0">
                    <nav>
                        <div class="nav nav-tabs" id="nav-tab" role="tablist">
                            <button type="button" class="nav-link active" id="nav-p1-tab" data-bs-toggle="tab" data-bs-target="#nav-p1_table" role="tab" aria-controls="nav-p1" aria-selected="false">進行中作業統計</button>
                            <button type="button" class="nav-link"        id="nav-p2-tab" data-bs-toggle="tab" data-bs-target="#nav-p2_table" role="tab" aria-controls="nav-p2" aria-selected="false">各式統計</button>
                            <button type="button" class="nav-link"        id="nav-p3-tab" data-bs-toggle="tab" data-bs-target="#nav-p3_table" role="tab" aria-controls="nav-p3" aria-selected="false">各廠聯絡窗口</button>
                        </div>
                    </nav>
                </div>
                <!-- 內頁 -->
                <div class="tab-content bs-b " id="nav-tabContent">
                    <!-- p1 -->
                    <div id="nav-p1_table" class="tab-pane fade show active" role="tabpanel" aria-labelledby="nav-p1-tab">
                        <div class="col-12 bg-white">
                            <!-- eChart圖表元素 2/3 -->
                            <div class="row px-3 py-1" id="p1chart_div">
                                <!-- p1-head -->
                                <span class="badge bg-c-blue w-100 title">--&nbsp;P1&nbsp;--</span>
                                <!-- p1-body -->
                                <div class="col-12 px-0 py-1" id="p1Body">
                                    <!-- 廠區燈號欄 append p1map here -->
                                        <!-- 測試曲線圖1 -->
                                        <div class="rounded wave_div">
                                            <div class="waveform">
                                                <div class="bar"></div>
                                                <div class="bar"></div>
                                                <div class="bar"></div>
                                                <div class="bar"></div>
                                                <div class="bar"></div>
                                                <div class="bar"></div>
                                                <div class="bar"></div>
                                                <div class="bar"></div>
                                            </div>
                                        </div>
                                </div>
                            </div>

                            <hr>
                            <!-- 20231108-資料更新時間 -->
                            <div class="col-12 p-0 text-end inb">
                                <span><button type="button" class="btn btn-outline-success add_btn" onclick="dashboard_init(true)" data-toggle="tooltip" data-placement="bottom" title="強制更新" 
                                        <?php echo ($sys_role <= 1 && isset($sys_role)) ? "":"disabled";?> > <i class="fa-solid fa-rotate"></i></button>&nbsp;Last reload time：</span>
                                <span id="reload_time" title="" ><?php echo $reloadTime;?> </span>
                            </div>
                        </div>
                    </div>

                    <!-- p2 -->
                    <div id="nav-p2_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p2-tab">
                        <div class="col-12 bg-white">
                            <!-- eChart圖表元素 2/3 -->
                            <div class="row px-3 py-1" id="p2chart_div">
                                <!-- 測試曲線圖1 -->
                                <div class="rounded wave_div">
                                    <div class="waveform">
                                        <div class="bar"></div>
                                        <div class="bar"></div>
                                        <div class="bar"></div>
                                        <div class="bar"></div>
                                        <div class="bar"></div>
                                        <div class="bar"></div>
                                        <div class="bar"></div>
                                        <div class="bar"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- p3 -->
                    <div id="nav-p3_table" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-p3-tab">
                        <div class="col-12 bg-white text-center">
                            <!-- p3-head -->
                            <!-- 測試圖1 -->
                            <div class="pb-2">
                                <img src="../image/banner-1.png" alt="tnESH Logo" class="banner" onerror="this.onerror=null; this.src='../image/lvl.png';">
                            </div>
                            <!-- p3-body -->
                            <div class="col-12 px-0 py-1" id="p3Body">
                                <!-- 聯絡窗口 -->
                                <span class="badge bg-info mb-3 p-2 title"><i class="fa-solid fa-circle-info"></i>&nbsp;各廠聯絡窗口</span>
                                <table id="service_window" class="table table-striped table-hover bs-b">
                                    <thead>
                                        <tr>
                                            <th>FAB</th>
                                            <th>窗口姓名</th>
                                            <th>分機</th>
                                            <th>email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach($sw_arr as $sw_key => $sw_value){
                                            $value_length = count($sw_value);
                                            if($value_length < 1){
                                                $append_str = '<tr><td>'.$sw_key.'</td><td>null</td><td></td><td></td></tr>';
                                            }else{
                                                if(is_object($sw_value)) { $sw_value = (array)$sw_value; }                      // 物件轉陣列
                                                $td_key = '<td rowspan="'.$value_length.'">'.$sw_key.'</td>';
                                                $append_str = "";
                                                $i = 1;
                                                foreach($sw_value as $sw_item => $sw_item_value){
                                                    if(is_object($sw_item_value)) { $sw_item_value = (array)$sw_item_value; }   // 物件轉陣列
                                                    $td_value = '. '.$sw_item_value["cname"].'</td><td>'.$sw_item_value["tel_no"].'</td><td>'.strtolower($sw_item_value["email"]).'</td></tr>';
                                                    if($i === 1){
                                                        $append_str .= '<tr>'.$td_key.'<td>'.$i.$td_value;
                                                    }else{
                                                        $append_str .= '<tr><td>'.$i.$td_value;
                                                    }
                                                    $i++;
                                                }
                                            };
                                            echo $append_str;
                                        }?>
                                    </tbody>
                                </table>
                            </div>
                            <span>系統維護：tnESH iT 陳建良 5014-42117</span>
                        </div>
                    </div>
                </div>

                <!-- 說明欄 -->
                <!-- 下：測試 -->
                    <div class="col-12 bg-light border rounded p-3 my-2 bs-b text-center">
                    <div class="row">
                        <div class="col-9 col-md-9">
                            <!-- 測試圖1 -->
                            <div class="text-center">
                                <img src="../image/banner-1.png" alt="tnESH Logo" class="banner" onerror="this.onerror=null; this.src='../image/lvl.png';">
                            </div>
                        </div>
                        <div class="col-3 col-md-3 seed text-center">
                            <!-- 測試圖2 -->
                            <img src="../image/safetyFirst.jfif" alt="tnESH Logo" class="img-thumbnail">
                            <!-- 測試權限 -->
                            <form action="sys_role.php" method="get">
                                <div class="input-group">
                                    <span class="input-group-text">測試</span>
                                    <select name="role" id="role" class="form-select" onchange="submit()">
                                        <option for="role" hidden selected>-- 調整role權限 --</option>
                                        <option for="role" value="0" >0 管理員</option>
                                        <option for="role" value="1" >1 大PM/總窗護理師</option>
                                        <option for="role" value="2" >2 廠-護理師</option>
                                        <option for="role" value="2.2" >2.2 廠-工安</option>
                                        <option for="role" value="2.5" >2.5 ESH工安</option>
                                        <option for="role" value="3" >3 現場窗口</option>
                                        <option for="role" value="3.5" >3.5 unknow</option>
                                    </select>
                                    <input type="hidden" name="sys_id" value="she">
                                </div>
                            </form>  
                        </div>
                    </div>
                </div>

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
<script src="../../libs/aos/aos.js"></script>               <!-- goTop滾動畫面jquery.min.js+aos.js 3/4-->
<script src="../../libs/aos/aos_init.js"></script>          <!-- goTop滾動畫面script.js 4/4-->
<!-- <script src="../../libs/openUrl/openUrl.js"></script>       彈出子畫面 -->
<script src="_change.js"></script>
<script src="dashboard.js"></script>

<?php include("../template/footer.php"); ?>
