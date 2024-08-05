<?php
    require_once("../pdo.php");
    require_once("../sso.php");
    require_once("../user_info.php");
    require_once("function.php");
    accessDenied($sys_id);

    if(isset($_POST["delete"])){
        deleteUser($_REQUEST);
        header("refresh:0;url=../auth/");
        exit;
    }
    if(isset($_POST["submit"])){
        updateUser($_REQUEST);
        header("refresh:0;url=../auth/");
        exit;
    }
    // $sites = show_site();
    $depts = show_dept();

    $user = editUser($_REQUEST);

    if(empty($user) || ($sys_role >=2 && $_SESSION[$sys_id]["id"] != $user["id"])){
        header("location:../auth/");    // 用這個，因為跳太快
        exit;
    }
?>

<?php include("../template/header.php"); ?>
<?php include("../template/nav.php"); ?>
<head>
    <script src="../../libs/jquery/jquery.min.js" referrerpolicy="no-referrer"></script>
</head>
<div class="container my-2">
    <div class="row justify-content-center">
        <div class="col-8 bg-light border p-4 rounded">
            <div class="row border rounded edit_mode_bgc ">
                <div class="col-12 col-md-6">
                    <h5 class="modal-title"><i class="fa-solid fa-circle-info"></i> Edit local user info&role</h5>
                </div>
                <div class="col-12 col-md-6 text-end">
                    <?php if($user["role"] == "" && ($sys_role <= 1)){ ?>
                        <form action="" method="post">
                            <input type="hidden" name="id" value="<?php echo $user["id"];?>">
                            <button type="submit" name="delete" title="刪除" class="btn btn-sm btn-xs btn-danger" onclick="return confirm(`確認刪除？`)"><i class="fa-solid fa-user-xmark"></i></button>
                        </form>
                    <?php } ?>
                    <button type="button" class="btn-close border rounded mx-1" onclick="history.back()" aria-label="Close"></button>
                </div>
            </div>
            <hr>
            <form action="" method="post" enctype="multipart/form-data" 
                    onsubmit="this.user.disabled=false, this.emp_id.disabled=false, this.cname.disabled=false, this.idty.disabled=false, this.role.disabled=false, this.sys_id.disabled=false";>
                <div class="px-4">
                    <!-- line 1 -->
                    <div class="row">
                        <div class="col-12 col-md-6 py-2">
                            <div class="form-floating">
                                <input type="text" name="user" class="form-control" id="floatingUser" value="<?php echo $user["user"];?>" <?php echo ($sys_role >= 1) ? "readonly":"required";?>>
                                <label for="floatingUser" class="form-label">user/帳號：<sup class='text-danger'><?php echo ($sys_role >= 1) ? " - disabled":" *";?></sup></label>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 py-2">
                            <div class="form-floating">
                                <input type="text" name="sys_id" id="sys_id" class="form-control" value="<?php echo $sys_id;?>" required readOnly>
                                <label for="sys_id" class="form-label">sys_id：<sup class="text-danger"> - readOnly</sup></label>
                            </div>
                        </div>
                    </div>
                    <!-- line 2 -->
                    <div class="row">
                        <div class="col-12 col-md-6 py-2">
                            <div class="form-floating">
                                <input type="text" name="emp_id" class="form-control" id="floatingEmp_id" value="<?php echo $user["emp_id"];?>" <?php echo ($sys_role >= 1) ? "readonly":"required";?>>
                                <label for="floatingEmp_id" class="form-label">emp_id/工號：<sup class='text-danger'><?php echo ($sys_role >= 1) ? " - disabled":" *";?></sup></label>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 py-2">
                            <div class="form-floating">
                                <input type="text" name="cname" class="form-control" id="floatingCname" value="<?php echo $user["cname"];?>" <?php echo ($sys_role >= 1) ? "readonly":"required";?>>
                                <label for="floatingCname" class="form-label">cname/中文姓名：<sup class='text-danger'><?php echo ($sys_role >= 1) ? " - disabled":" *";?></sup></label>
                            </div>
                        </div>
                    </div>
                    <!-- line 3 -->
                    <div class="row">
                        <div class="col-12 col-md-6 py-2">
                            <div class="form-floating">
                                <select name="idty" id="idty" class="form-select" <?php echo ($sys_role >= 2) ? "disabled":"";?>>
                                    <option value="" <?php  echo ($user["idty"] == "" ) ? "selected":"";?> >停用</option>
                                    <option value="1" <?php echo ($user["idty"] == "1" ) ? "selected":"";?> >1_工程師</option>
                                    <option value="2" <?php echo ($user["idty"] == "2" ) ? "selected":"";?> >2_課副理</option>
                                    <option value="3" <?php echo ($user["idty"] == "3" ) ? "selected":"";?> >3_部經理層</option>
                                    <option value="4" <?php echo ($user["idty"] == "4" ) ? "selected":"";?> >4_廠處長層</option>
                                </select>
                                <label for="idty" class="form-label">idty/身份定義：<sup class="text-danger"><?php echo ($sys_role >= 2) ? " - disabled":" *";?></sup></label>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 py-2">
                            <div class="form-floating">
                                <select name="role" id="role" class="form-select" <?php echo ($sys_role >= 2) ? "disabled":"";?>>
                                    <option value=""  for="role" <?php echo ($user["role"] == "") ? "selected":"";?>>停用</option>
                                    <option value="0" for="role" <?php echo ($user["role"] == "0") ? "selected":"";?>
                                                                <?php echo ($sys_role >= 1) ? "hidden":"";?>>0_管理</option>
                                    <option value="1" for="role" <?php echo ($user["role"] == "1") ? "selected":"";?>>1_PM</option>
                                    <option value="2" for="role" <?php echo ($user["role"] == "2") ? "selected":"";?>>2_siteUser</option>
                                    <option value="3" for="role" <?php echo ($user["role"] == "3") ? "selected":"";?>>3_noBody</option>
                                </select>
                                <label for="role" class="form-label">role/權限：<sup class='text-danger'><?php echo ($sys_role >= 2) ? " - disabled":" *";?></sup></label>
                            </div>
                        </div>
                    </div>
                    <!-- line 4 -->
                    <div class="row">
                        <div class="col-12 col-md-6 py-2">
                            <div class="form-floating">
                                <select name="sign_code" id="sign_code" class="form-select" required>
                                    <option value="" selected hidden>--請選擇所屬部門--</option>
                                    <?php 
                                        if($depts['up_sign_code']){ 
                                            echo "<option value='".$depts['up_sign_code']."' ";
                                            echo ($depts['up_sign_code'] == $user["sign_code"]) ? "selected class='alert_it'" : "" ;
                                            echo " >".$depts['up_sign_dept']."(".$depts['up_sign_code'].")</option>";
                                        } 
                                        foreach($depts as $dept){
                                            echo "<option value='".$dept['sign_code']."' ";
                                            echo ($dept['sign_code'] == $user["sign_code"]) ? "selected class='alert_it'" : "" ;
                                            echo ">";
                                            echo $dept['up_sign_dept'] != "" ? $dept['up_sign_dept']." / ":""; 
                                            echo $dept['sign_dept']." (".$dept['sign_code'].")</option>";
                                        } 
                                    ?>
                                </select>
                                <label for="sign_code" class="form-label">部門代號：<sup class="text-danger"> *</sup></label>
                            </div>
                        </div>

                        <div class="col-12 py-2">

                        </div>
                    </div>
                </div>
                <hr>
                <div class="text-end">
                    <input type="hidden" value="<?php echo $user["id"];?>" name="id">
                    <input type="submit" value="儲存" name="submit" class="btn btn-primary">
                    <input type="button" value="取消" class="btn btn-secondary" onclick="history.back()">
                </div>
            </form>
        </div>
    </div>
</div>
 
<?php include("../template/footer.php"); ?>