<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("function.php");
    accessDeniedAdmin($sys_id);

    $sw_json = [];       // 

    // CRUD
    if(isset($_POST["submit_add_user"]))   { $sw_json = storeUser($_REQUEST); }
    if(isset($_POST["submit_edit_user"]))  { $sw_json = updateUser($_REQUEST); }
    if(isset($_POST["submit_delete_user"])){ $sw_json = deleteUser($_REQUEST); }

    // 切換指定NAV分頁
    $activeTab = (isset($_REQUEST["activeTab"])) ? $_REQUEST["activeTab"] : "nav_btn_1";       // nav_btn_1= PM名單

    // 這裡讀取狀態：none正常、new新人、pause停用
    $showAllUsers = showAllUsers("all");

    $depts = show_dept();

?>
<?php include("../template/header.php"); ?>
<?php include("../template/nav.php"); ?>
<head>
    <link href="../../libs/aos/aos.css" rel="stylesheet">
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>
    <script src="../../libs/sweetalert/sweetalert.min.js"></script>                         <!-- 引入 SweetAlert -->
    <script src="../../libs/jquery/jquery.mloading.js"></script>
    <link rel="stylesheet" href="../../libs/jquery/jquery.mloading.css">
    <script src="../../libs/jquery/mloading_init.js"></script>
    <style>      
        .t_left {
            text-align: left;
            padding-left: 20px;
        }
        #key_word, #user{    
            margin-bottom: 0px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="" id="top"></div>
    <div class="container my-2">
        <div class="justify-content-center rounded bg-light">
            <!-- head -->
            <div class="row px-4 pb-0">
                <div class="col-12 pb-0 pt-5">
                    <h5><?php echo $sys_id." local User資料庫 - 共 ".count($showAllUsers);?> 筆</h5>
                </div>
                <!-- nav tab -->
                <div class="col-md-6 head">
                    <ul class="nav nav-pills">
                        <li class="nav-item">
                            <button type="button" id="nav_btn_1" class="nav-link" value="0,1,2" onclick=" groupBy_role(this.value)" ><i class="fa-solid fa-circle-user"></i>&nbspPM名單
                                <span id="none" class="badge bg-success"></span></button>
                        </li>
                        <li class="nav-item">
                            <button type="button" id="nav_btn_2" class="nav-link" value="3" onclick=" groupBy_role(this.value)" ><i class="fa-solid fa-ghost"></i>&nbsp一般使用者
                                <span id="new" class="badge bg-danger"></span></button>
                        </li>
                        <li class="nav-item">
                            <button type="button" id="nav_btn_3" class="nav-link" value=" " onclick=" groupBy_role(this.value)" ><i class="fa-solid fa-ban"></i>&nbsp停用
                                <span id="pause" class="badge bg-secondary"></span></button>
                        </li>
                    </ul>
                </div>
                <div class="col-md-6 text-end">
                    <button type="button" id="role_info_btn" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#role_info" > <i class="fa fa-info-circle" aria-hidden="true"></i> 權限說明</button>
                    <button type="button" id="add_usere_btn" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#user_modal" onclick="add_module('user')" > <i class="fa fa-user-plus"></i> 新增</button>
                </div>
            </div>
            <!-- dataTable -->
            <div class="col-12 p-4 pt-0  ">
                <table id="user_table" class="table table-striped table-hover">
                    <thead> 
                        <tr>
                            <th>id</th>
                            <th class="unblock">role</th>
                            <th data-toggle="tooltip" data-placement="bottom" title="** 紅色字體為非在職名單 ~">emp_id / cName / user</th>
                            <th>sign_code</th>
                            <th>role▼</th>
                            <th>idty</th>
                            <th>created_at</th>
                            <th>action</th>
                        </tr>
                    </thead>
                    <!-- user list -->
                    <tbody>
                        <?php foreach($showAllUsers as $user_row){ ?>
                            <tr>
                                <td><?php echo $user_row["id"];?></td>
                                <td class="unblock"><?php echo $user_row["role"];?></td>
                                <td class="t_left" id="<?php echo 'emp_id_'.$user_row["emp_id"];?>"><?php echo $user_row["emp_id"]." / ".$user_row["cname"]." / ";?><a href="#" data-bs-toggle="modal" data-bs-target="#user_modal" onclick="edit_module('user',<?php echo $user_row['id'];?>)"><?php echo $user_row["user"]; ?></a></td>
                                <td><?php echo $user_row["sign_code"]; ?></td>
                                <td class="text-start" <?php if($user_row["role"] == "0"){ ?> style="background-color:yellow" <?php } ?>>
                                    <?php switch($user_row["role"]){
                                        case "0": echo "0.&nbsp管理"; break;
                                        case "1": echo "1.&nbspPM"; break;
                                        case "2": echo "2.&nbspsiteUser"; break;
                                        case "3": echo "3.&nbspnoBody"; break;
                                        default: echo "【&nbsp停用&nbsp】";} ?></td>
                                <td class="text-start"><?php echo $user_row["idty"];?>
                                    <?php switch($user_row["idty"]){
                                        case "0": echo ".&nbsp管理"; break;
                                        case "1": echo ".&nbsp工程師"; break;
                                        case "2": echo ".&nbsp課副理"; break;
                                        case "3": echo ".&nbsp部經理"; break;
                                        case "4": echo ".&nbsp廠處長"; break;
                                        default: echo "【&nbsp停用&nbsp】";} ?></td>
                                <td title="<?php echo $user_row["created_at"];?>"><?php echo substr($user_row["created_at"],0,10);?></td>
                                <td>
                                    <button type="button" value="<?php echo $user_row["id"];?>" class="btn btn-sm btn-xs btn-secondary" title="編輯"
                                        data-bs-toggle="modal" data-bs-target="#user_modal" onclick="edit_module('user',this.value)" ><i class="fa-solid fa-pen-to-square"></i></button>
                                    <?php if($user_row["role"] == ""){ ?>
                                        <form action="" method="post" style="display: inline-block;">
                                            <input type="hidden" name="id" value="<?php echo $user_row["id"];?>">
                                            <button type="submit" name="submit_delete_user" class="btn btn-sm btn-xs btn-danger" title="刪除" onclick="return confirm('確認刪除？')"><i class="fa-solid fa-user-xmark"></i></button>
                                        </form>
                                    <?php } ?>
                                </td>
                            </tr>
                        <?php } ?>
                    </tbody>
                </table>
                <hr>
                <div class="row">
                    <div class="col-6 col-md-6 py-0">
                        <input type="hidden" name="emp_id" id="recheck_user" >
                    </div>
                    <div class="col-6 col-md-6 py-0 text-end" style="font-size: 12px;">
                        202403 updated modal
                    </div>
                </div>
            </div>
        </div>
    </div>
<!-- 模組-權限說明 -->
    <div class="modal fade" id="role_info" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header border rounded bg-success text-white p-3 m-2">
                    <h5 class="modal-title"><i class="fa-solid fa-circle-info"></i> role權限說明</h5>
                    <button type="button" class="btn-close border rounded mx-1" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="col-12 py-0 px-4">
                        <table>
                            <thead> 
                                <tr>
                                    <th>role</th>
                                    <th>定義名稱</th>
                                    <th>權限說明</th>
                                    <th>適用對象</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>null</td>
                                    <td>停用</td>
                                    <td>停止該User使用權利</td>
                                    <td>離職或其他不被授予權限之對象</td>
                                </tr>
                                <tr>
                                    <td>0</td>
                                    <td>管理</td>
                                    <td>系統管理人員</td>
                                    <td>細部設定、最大權限之管理人</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>PM</td>
                                    <td>大部分管理與審核功能</td>
                                    <td>系統負責人</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>siteUser</td>
                                    <td>廠區業務人員</td>
                                    <td>各site指定業務窗口</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>noBody</td>
                                    <td>一般使用者</td>
                                    <td>一次性使用者</td>
                                </tr>
                            </tbody>
                        </table>
                        <hr>
                        <h4>user身份設定：</h4>
                        <table>
                            <thead> 
                                <tr>
                                    <th>使用環境</th>
                                    <th>1. PM設定</th>
                                    <th>2. 所屬部課級</th>
                                    <th>使用環境 PM / Site</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="t-center">PM</td>
                                    <td class="t-center">指定PM或副PM</td>
                                    <td class="t-center">依需求設定</td>
                                    <td class="t-center">V / V</td>
                                </tr>
                                <tr>
                                    <td class="t-center">Site</td>
                                    <td class="t-center">限用 tnESH(一般用戶)</td>
                                    <td class="t-center">依需求設定</td>
                                    <td class="t-center">X / V</td>
                                </tr>
          
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="text-end">
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">關閉</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
<!-- 模組-user modal -->
    <div class="modal fade" id="user_modal" tabindex="-1" aria-labelledby="exampleModalScrollableTitle" aria-hidden="true" aria-modal="true" role="dialog">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header border rounded p-3 m-2">
                    <h5 class="modal-title"><i class="fa-solid fa-circle-info"></i> <span id="user_modal_action"></span> local user role</h5>
                    <form action="" method="post">
                        <input type="hidden" name="id" id="user_delete_id">&nbsp&nbsp&nbsp&nbsp&nbsp
                        <span id="user_modal_delect_btn" class="<?php echo ($sys_role == 0) ? "":" unblock ";?>"></span>
                    </form>
                    <button type="button" class="btn-close border rounded mx-1" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <form action="" method="post" class="needs-validation">
                    <div class="modal-body px-3">
                        <!-- line 1 -->
                        <div class="row">
                            <div class="col-12 col-md-6 py-1">
                                <div class="form-floating input-group">
                                    <input type="text" name="user" id="user" class="form-control" data-toggle="tooltip" data-placement="bottom" title="請輸入查詢對象 工號、姓名或NT帳號" required  onchange="search_fun('search');">
                                    <label for="user" class="form-label">user ID：<sup class="text-danger"> *</sup></label>
                                    <button type="button" class="btn btn-outline-primary" onclick="search_fun('search')"><i class="fa-solid fa-magnifying-glass"></i> 搜尋</button>
                                </div>
                            </div>
                            <div class="col-12 col-md-6 py-1">
                                <div class="form-floating">
                                    <input type="text" name="sys_id" id="sys_id" class="form-control" value="<?php echo $sys_id;?>" required readOnly>
                                    <label for="sys_id" class="form-label">sys_id：<sup class="text-danger"> - readOnly</sup></label>
                                </div>
                            </div>
                        </div>
                        <!-- line 2 -->
                        <div class="row">
                            <div class="col-12 col-md-6 py-1">
                                <div class="form-floating">
                                    <input type="text" name="emp_id" id="emp_id" class="form-control" required>
                                    <label for="emp_id" class="form-label">emp_id/工號：<sup class="text-danger"> *</sup></label>
                                </div>
                            </div>
                            <div class="col-12 col-md-6 py-1">
                                <div class="form-floating">
                                    <input type="text" name="cname" id="cname" class="form-control" required>
                                    <label for="cname" class="form-label">中文姓名：<sup class="text-danger"> *</sup></label>
                                </div>
                            </div>
                        </div>
                        <!-- line 3 -->
                        <div class="row">
                            <div class="col-12 col-md-6 py-1">
                                <div class="form-floating">
                                    <select name="idty" id="idty" class="form-select">
                                        <option value=""  >停用</option>
                                        <option value="1" selected >1_工程師</option>
                                        <option value="2" >2_課副理</option>
                                        <option value="3" >3_部經理層</option>
                                        <option value="4" >4_廠處長層</option>
                                    </select>
                                    <label for="idty" class="form-label">身份定義：<sup class="text-danger"> *</sup></label>
                                </div>
                            </div>
                            <div class="col-12 col-md-6 py-1">
                                <div class="form-floating">
                                    <select name="role" id="role" class="form-select">
                                        <option value=""  for="role">停用</option>
                                        <option value="0" for="role" <?php echo $sys_role > 0 ? "hidden":"";?>>0_管理</option>
                                        <option value="1" for="role" <?php echo $sys_role > 1 ? "hidden":"";?>>1_PM</option>
                                        <option value="2" for="role" selected >2_siteUser</option>
                                        <option value="3" for="role" >3_noBody</option>
                                    </select>
                                    <label for="role" class="form-label">權限：<sup class="text-danger"> *</sup></label>
                                </div>
                            </div>
                        </div>
                        <!-- line 4 -->
                        <div class="row">
                            <div class="col-12 col-md-6 py-2">
                                <div class="form-floating">
                                    <select name="sign_code" id="sign_code" class="form-select" required>
                                        <option value="" selected hidden>--請選擇所屬部門--</option>
                                        <!-- <php if($depts['up_sign_code']){ ?>
                                            <option value="<php echo $depts['up_sign_code'];?>" ><php echo $depts['up_sign_dept']."(".$depts['up_sign_code'].")";?></option>
                                        <php } ?> -->
                                        <?php foreach($depts as $dept){ ?>
                                            <option value="<?php echo $dept['sign_code'];?>" ><?php echo $dept['up_sign_dept'] != "" ? $dept['up_sign_dept']." / ":""; echo $dept['sign_dept']." (".$dept['sign_code'].")";?></option>
                                        <?php } ?>
                                    </select>
                                    <label for="sign_code" class="form-label">部門代號：<sup class="text-danger"> *</sup></label>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 text-end p-0" id="edit_user_info"></div>
                    </div>
                    <div class="modal-footer">
                        <div class="text-end">
                            
                            <span id="activeTab" ></span>
                            <input type="hidden" name="id" id="user_edit_id" >
                            
                            <span id="user_modal_button" class="<?php echo ($sys_role <= 1) ? "":" unblock ";?>"></span>
                            <input type="reset" class="btn btn-info" id="user_reset_btn" onclick="$('#emp_id, #cname, #user, #idty').removeClass('autoinput');" value="清除">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
<!--模組-查詢user -->
    <div class="modal fade" id="searchUser" aria-hidden="true" aria-labelledby="searchUser" tabindex="-1">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-warning">
                    <h5 class="modal-title" id="searchUser">searchUser</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-12 p-3 border rounded" id="selectScomp_no">
                            <div class="row">
                                <!-- 第三排的功能 : 放查詢結果-->
                                <div class="result" id="result">
                                    <table id="result_table" class="table table-striped table-hover"></table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="bt_addUser" class="btn btn-secondary" data-bs-target="#user_modal" data-bs-toggle="modal">Back to addUser</button>
                </div>
            </div>
        </div>
    </div>

    <div id="gotop">
        <i class="fas fa-angle-up fa-2x"></i>
    </div>
</body>
<script src="../../libs/aos/aos.js"></script>               <!-- goTop滾動畫面jquery.min.js+aos.js 3/4-->
<script src="../../libs/aos/aos_init.js"></script>          <!-- goTop滾動畫面script.js 4/4-->
<script>    
    // modal
    var user        = <?=json_encode($showAllUsers)?>;
    var user_item   = ['id','user','cname','emp_id','idty','role','sign_code'];                 // 交給其他功能帶入
    var tags        = [];                                                                       // fun3-1：search Key_word
    var swal_json   = <?=json_encode($sw_json)?>;
    var activeTab   = '<?=$activeTab?>';                                                        //设置要自动选中的选项卡的索引（从0开始）
    var user_modal  = new bootstrap.Modal(document.getElementById('user_modal'), { keyboard: false });
    var searchUser_modal = new bootstrap.Modal(document.getElementById('searchUser'), { keyboard: false });
    const uuid = 'e65fccd1-79e7-11ee-92f1-1c697a98a75f';        // nurse

</script>

<script src="auth.js?v=<?=time()?>"></script>

<?php include("../template/footer.php"); ?>