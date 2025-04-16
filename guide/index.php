<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("function.php");
    require_once("../user_info.php");
    accessDenied($sys_id);
    // accessDeniedAdmin($sys_id);

    $_guides = show_guide();

    include("../template/header.php");
    include("../template/nav.php"); 
?>

<head>
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>
    <link href="../../libs/aos/aos.css" rel="stylesheet">
    <script src="../../libs/jquery/jquery.mloading.js"></script>
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">
    <script src="../../libs/jquery/mloading_init.js"></script>
        <link rel="stylesheet" type="text/css" href="../../libs/dataTables/jquery.dataTables.css">  <!-- dataTable參照 https://ithelp.ithome.com.tw/articles/10230169 --> <!-- data table CSS+JS -->
        <script type="text/javascript" charset="utf8" src="../../libs/dataTables/jquery.dataTables.js"></script>
    <style>
        header {
            background-image: 
                linear-gradient(to right, rgba(0,0,0,0.8), transparent),
                URL("../image/guide.jpg");
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            padding-top: 10px;
            padding-bottom: 30px;
            /* text-align: center; */
        }
        tr > td {
            text-align: left;
        }
    </style>
</head>

<header>
    <div class="col-12">
        <div class="row justify-content-center">
            <div class="col-xl-12 col-12 rounded p-4 " style="background-color: rgba(255, 255, 255, .7);">
                <div class="row">
                    <div class="col-md-6 py-1">
                        <div>
                            <h5>導覽文件清單：</h5>
                        </div>
                    </div>
                    <div class="col-md-6 py-1 text-end">
                        <?php if($sys_role <= 1){ ?>
                            <button type="button" id="add_guide_btn" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#edit_modal" onclick="add_module('guide')" > <i class="fa fa-plus"></i> 新增文件</button>
                        <?php } ?>
                        <a href="index.php" title="回上層列表" class="btn btn-secondary"><i class="fa fa-external-link" aria-hidden="true"></i> 返回管理</a>
                    </div>
                </div>
                <!-- <hr> -->
                <!-- 分類列表 -->
                <div class="row">
                    <div class="col-12 bg-white rounded">
                        <table class="table table-striped table-hover" id="guide_list">
                            <thead>
                                <tr>
                                    <th>id</th>
                                    <th>_title</th>
                                    <th>_remark</th>
                                    <th>_file</th>
                                    <th>created/updated</th>
                                    <th>updated_user/flag<?php echo ($sys_role <= "1") ? "/action":"";?></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach($_guides as $_guide){ 
                                    if($_guide['flag'] == 'Off' && $sys_role > "1"){
                                        continue; // 跳過本次迭代
                                    }else{ ?>
                                        <tr>
                                            <td><?php echo $_guide["id"];?></td>
                                            <td><?php echo $_guide["_title"];?></td>
                                            <td><?php echo $_guide["_remark"];?></td>
                                            <td><button type="button" value="./doc/<?php echo $_guide["_file"];?>.pdf" class="btn btn-outline-primary add_btn" onclick="openUrl(this.value)"><?php echo $_guide["_file"];?></button></td>
                                            <td><?php echo $_guide["created_at"]."</br>".$_guide["updated_at"];?></td>
                                            <td><?php echo $_guide["updated_user"]."&nbsp";?> 
                                                <span class="badge rounded-pill <?php echo $_guide['flag'] == 'On' ? 'bg-success':'bg-warning';?>"><?php echo $_guide['flag'];?></span>
                                                <?php if($sys_role <= "1"){ ?>
                                                    <button type="button" id="update_guide_btn" value="<?php echo $_guide['id'];?>" class="btn btn-sm btn-xs btn-info" 
                                                        data-bs-toggle="modal" data-bs-target="#edit_modal" onclick="edit_module('_guide',this.value)" >編輯</button>
                                                <?php } ?>
                                            </td>
                                        </tr>
                                <?php }} ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

<!-- 模組 編輯、新增-->
<div class="modal fade" id="edit_modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" aria-modal="true" role="dialog" >
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header border rounded p-3 m-2">
                <h5 class="modal-title"><span id="modal_action"></span>文件</h5>
                <form action="process.php" method="post">
                    <input type="hidden" name="id" id="_guide_delete_id">&nbsp&nbsp&nbsp&nbsp&nbsp
                    <span id="modal_delect_btn" class="<?php echo ($sys_role == 0) ? "":" unblock ";?>"></span>
                </form>
                <button type="button" class="btn-close border rounded mx-1" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <form action="process.php" method="post" enctype="multipart/form-data" onsubmit="this._guide__file.disabled=false" >
                <div class="modal-body px-3">
                    <div class="row">
                        
                        <div class="col-12 py-1">
                            <div class="col-12 border rounded">
                                <div class="form-floating">
                                    <input type="text" name="_file" id="_guide__file" class="form-control" readonly placeholder="套用文件">
                                    <label for="_guide__file" class="form-label">_file/導覽文件：</label>
                                </div>
    
                                <div class="input-group">
                                    <input type="file" name="upload_file" id="_file" class="form-control mb-0" accept=".pdf" placeholder="上傳檔案">
                                    <!-- <button type="button" class="btn btn-outline-success" onclick="uploadFile('_file')">Upload</button> -->
                                    <!-- <button type="button" class="btn btn-outline-danger" onclick="unlinkFile('_file')">Delete</button> -->
                                </div>
                            </div>
                        </div>

                        <div class="col-12 py-1">
                            <div class="form-floating">
                                <input type="text" name="_title" id="_guide__title" class="form-control" required placeholder="文件名稱">
                                <label for="_guide__title" class="form-label">_title/文件名稱：<sup class="text-danger"> *</sup></label>
                            </div>
                        </div>

                        <div class="col-12 py-1">
                            <div class="form-floating">
                                <input type="text" name="_remark" id="_guide__remark" class="form-control" required placeholder="文件簡介說明">
                                <label for="_guide__remark" class="form-label">_remark/文件簡介說明：<sup class="text-danger"> *</sup></label>
                            </div>
                        </div>

                        <div class="col-12 py-1">
                            <table>
                                <tr>
                                    <td style="text-align: right;">
                                        <snap for="flag" class="form-label">flag/顯示開關：</snap>
                                    </td>
                                    <td style="text-align: left;">
                                        <input type="radio" name="flag" value="On" id="_guide_On" class="form-check-input" checked >&nbsp
                                        <label for="_guide_On" class="form-check-label">On</label>
                                    </td>
                                    <td style="text-align: left;">
                                        <input type="radio" name="flag" value="Off" id="_guide_Off" class="form-check-input">&nbsp
                                        <label for="_guide_Off" class="form-check-label">Off</label>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <div class="col-12 text-end py-0" id="_guide_info"></div>
                    </div>
                </div>

                <div class="modal-footer">
                    <div class="text-end">
                        <input type="hidden" name="id" id="_guide_edit_id" >
                        <input type="hidden" name="updated_user" value="<?php echo $auth_cname;?>">
                            <span id="modal_button" class="<?php echo ($sys_role <= 1) ? "":" unblock ";?>"></span>
                        <input type="reset" class="btn btn-info" id="reset_btn" value="清除">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    </div>
                </div>
            </form>

        </div>
    </div>
</div>

<script src="../../libs/aos/aos.js"></script>
<script src="../../libs/aos/aos_init.js"></script>
<script src="../../libs/openUrl/openUrl.js"></script>       <!-- 彈出子畫面 -->
<script src="../../libs/sweetalert/sweetalert.min.js"></script>

<script>

    var _guide        = <?=json_encode($_guides)?>;                                  // 引入_guide資料
    var _guide_item   = ['id', '_file', '_title', '_remark', 'flag'];                // 交給其他功能帶入 delete_cate_id

</script>
<script src="_guide.js?v=<?=time()?>"></script>

<?php include("../template/footer.php"); ?>