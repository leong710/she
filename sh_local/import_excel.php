<?php
    require_once("../pdo.php");
    // require_once("function.php");
    extract($_REQUEST);

    function store_shLocal($request){
        $pdo = pdo();
        extract($request);
        $OSHORT = trim($OSHORT);

        $sql = "INSERT INTO _shlocal( OSHORT, OSTEXT_30, OSTEXT, HE_CATE, AVG_VOL,   AVG_8HR, MONIT_NO, MONIT_LOCAL, WORK_DESC, flag,   updated_cname, updated_at, created_at )
                VALUES(?,?,?,?,?,  ?,?,?,?,?,  ?,now(),now())";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([$OSHORT, $OSTEXT_30, $OSTEXT, $HE_CATE, $AVG_VOL,   $AVG_8HR, $MONIT_NO, $MONIT_LOCAL, $WORK_DESC, $flag,   $updated_cname ]);
            $result = TRUE;
        }catch(PDOException $e){
            echo $e->getMessage();
            $result = FALSE;
        }
        return $result;
    }
    // 回上一頁/本頁網址藥用
    $up_href = (isset($_SERVER["HTTP_REFERER"])) ? $_SERVER["HTTP_REFERER"] : 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];   // 回上頁 // 回本頁

    // 
    $to_module = (!empty($import_excel)) ? $import_excel : "";

    $swal_json = array(
        "content" => "特危健康作業管理",
        "fun"     => "store_".$to_module
    );

    // switch($to_module){
    //     case "snLocal":
    //         $swal_json["content"] = "(特殊危害健康作業管理)";
    //         break;
    //     default:            // 預定失效 
    //         $swal_json["content"] = "(-有毛病-)";
    // }

?>
<?php include("../template/header.php"); ?>
<head>
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>    <!-- Jquery -->
    <script src="../../libs/sweetalert/sweetalert.min.js"></script>                         <!-- 引入 SweetAlert -->
    <script src="../../libs/jquery/jquery.mloading.js"></script>                            <!-- mloading JS 1/3 -->
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">                    <!-- mloading CSS 2/3 -->
    <script src="../../libs/jquery/mloading_init.js"></script>                              <!-- mLoading_init.js 3/3 -->
    <style>
        body{
            color: white;
        }
    </style>
</head>

<body>
    <?php
        $excelTable = (array) json_decode($excelTable);

        foreach($excelTable as $row){ 
            // StdObject轉換成Array
            if(is_object($row)) { $row = (array)$row; }

            $row["flag"]          = "On";
            $row["updated_cname"] = $updated_cname;

            $result = store_shLocal($row);
        }

        if($result){
            $swal_json["action"] = "success";
            $swal_json["content"] .= "_上傳成功";
        }else{
            $swal_json["action"] = "error";
            $swal_json["content"] .= "_上傳失敗";
        }
            
    ?>

    <div class="col-12">
        <a href="<?php echo $up_href;?>" class="btn btn-sm btn-xs btn-success">回上頁</a>
        &nbsp;import_excel_<?php echo $to_module." (to_module)....." ?>
    </div>
    
</body>

<script>    
    
    var url         = 'index.php';
    var up_url      = '<?=$up_href?>';
    var swal_json   = <?=json_encode($swal_json)?>;     // 引入swal_json值

    $(document).ready(function () {
        if(swal_json.length != 0){
            $("body").mLoading("hide");
            if(swal_json['action'] == 'success'){
                swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action'], {buttons: false, timer:2000}).then(()=>{location.href = up_url});     // n秒后回首頁
            }else if(swal_json['action'] == 'error'){
                swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action']).then(()=>{history.back()});     // 手動回上頁
            }
        }else{
            location.href = url;
        }
    })
    
</script>


