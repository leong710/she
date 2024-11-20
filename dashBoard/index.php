<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    if(!isset($_SESSION)){                          // 確認session是否啟動
		session_start();
	}
    //    accessDenied($sys_id);
    if(!empty($_SESSION["AUTH"]["pass"]) && empty($_SESSION[$sys_id])){
        accessDenied_sys($sys_id);
    }

    // 複製本頁網址藥用
    // $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁

?>

<?php include("../template/header.php"); ?>
<?php include("../template/nav.php"); ?>
<head>
   <link href="../../libs/aos/aos.css" rel="stylesheet">                                           <!-- goTop滾動畫面aos.css 1/4-->
   <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>            <!-- Jquery -->

   <script src="../../libs/sweetalert/sweetalert.min.js"></script>                                 <!-- 引入 SweetAlert 的 JS 套件 參考資料 https://w3c.hexschool.com/blog/13ef5369 -->
   <script src="../../libs/jquery/jquery.mloading.js"></script>                                    <!-- mloading JS 1/3 -->
   <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">                            <!-- mloading CSS 2/3 -->
   <script src="../../libs/jquery/mloading_init.js"></script>                                      <!-- mLoading_init.js 3/3 -->
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
   </style>
    <link rel="stylesheet" href="wave.css">
</head>

<body>
    <div class="col-12">
        <div class="row justify-content-center">
            <div class="col-mm-10 col-12 rounded p-4 " style="background-color: rgba(255, 255, 255, .7);">
                <div class="row">
                    <!-- 左測：單 -->
                    <div class="col-3 col-md-3 px-2 py-0">
                        <h2><span class="badge bg-primary w-100">--&nbsp;<i class="fa fa-edit"></i>&nbsp;左側&nbsp;--</span></h2>
                        <div class="col-12 p-0" id="btn_list">
                            <div id="overlay">Permission Denied</div>
                            <!-- append button here -->
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
                            <div class="col-12 seed">
                                <h4>垂老別</h4>
                                <strong>作者：唐朝 杜甫</strong><br>
                                原文：<br>
                                <p>
                                    四郊未寧靜，垂老不得安。<br>子孫陣亡盡，焉用身獨完。<br>
                                    投杖出門去，同行爲辛酸。<br>幸有牙齒存，所悲骨髓幹。<br>
                                    男兒既介冑，長揖別上官。<br>老妻臥路啼，歲暮衣裳單。<br>
                                    孰知是死別，且復傷其寒。<br>此去必不歸，還聞勸加餐。<br>
                                    土門壁甚堅，杏園度亦難。<br>勢異鄴城下，縱死時猶寬。<br>
                                    人生有離合，豈擇衰老端。<br>憶昔少壯日，遲迴竟長嘆。<br>
                                    萬國盡征戍，烽火被岡巒。<br>積屍草木腥，流血川原丹。<br>
                                    何鄉爲樂土，安敢尚盤桓。<br>棄絕蓬室居，塌然摧肺肝。
                                </p>
                                <hr>
                                <strong>譯文作者：佚名</strong><br>
                                <P>
                                    四野的戰爭還沒得到安平，我已經老了卻得不到安寧。
                                    子孫們在戰場上盡都殉難，兵荒馬亂又何需老命苟全。
                                    扔掉柺杖出門去拼搏一番，同行的人也爲我流淚辛酸。
                                    慶幸牙齒完好胃口還不減，悲傷身骨瘦如柴枯槁不堪。
                                    男兒既披戴盔甲從戎征戰，也只好長揖不拜辭別長官。
                                    聽到老伴睡路上聲聲哀喚，嚴冬臘月仍然是褲薄衣單。
                                    明知道死別最後一次見面，貧賤夫妻怎麼不憐她飢寒。
                                    今朝離去永不能回返家園，猶聽她再三勸我努力加餐。
                                    土門關深溝高壘防守堅嚴，杏園鎮天險足恃偷渡...
                                </P>
                            </div>
                        </div>
                    </div>

                    <!-- 右上：各廠燈號 -->
                    <div class="col-9 col-md-9 px-2 py-0 mb-2 ">
                        <!-- 廠區燈號欄 -->
                        <h2><span class="badge bg-c-blue w-100">--&nbsp;右上&nbsp;--</span></h2>
                        <div class="col-12 bg-white rounded p-0" id="highLight">
                            <!-- append site here -->
                        </div>
                        <!-- 說明欄 -->
                        <div class="col-12 bg-white border rounded p-3 my-2 bs-b" id="remark">
                            <div class="text-center">
                                <img src="image.jfif" alt="tnESH Logo">
                            </div>
            
                            <hr>
                            <b>說明欄位：</b></br>
           
                            <div class="col-12 py-0 px-3 text-end">
                                <a href="sys_role.php?sys_id=she&role=0"    class="btn btn-outline-success add_btn">0 管理員</a>
                                <a href="sys_role.php?sys_id=she&role=1"    class="btn btn-outline-success add_btn">1 PM</a>
                                <a href="sys_role.php?sys_id=she&role=2"    class="btn btn-outline-success add_btn">2 site窗口</a>
                                <a href="sys_role.php?sys_id=she&role=2.5"  class="btn btn-outline-success add_btn">2.5 ESH</a>
                                <a href="sys_role.php?sys_id=she&role=3"    class="btn btn-outline-success add_btn">3 現場窗口</a>
                                <a href="sys_role.php?sys_id=she&role=3.5"  class="btn btn-outline-success add_btn">3.5 現場主管</a>
        
                            </div>
                        </div>
                    </div>
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
<script src="../../libs/openUrl/openUrl.js"></script>       <!-- 彈出子畫面 -->

<script>
    
</script>

<!-- <script src="dashboard.js?v=<?=time()?>"></script> -->

<?php include("../template/footer.php"); ?>
