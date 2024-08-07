<?php
    require_once("..\user_info.php");
    require_once("function.php");

    $webroot = "..";
    
    // init

?>
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
        <a class="navbar-brand" href="<?php echo $webroot;?>/">tnESH-SHE特殊健檢系統</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarContent">
            <ul class="navbar-nav me-auto   my-2 my-lg-0 navbar-nav-scroll">
                <?php if($sys_auth){ ?>
                    <!-- <li class="nav-item"><a class="nav-link active" aria-current="page" href="#"><i class="fa-regular fa-square-plus"></i>&nbsp外層Link</a></li> -->
                    <!-- <li class="nav-item"><a class="nav-link active" aria-current="page" href="<php echo $webroot;?>/interView/"><i class="fa fa-edit"></i>&nbsp</a></li> -->
                    <!-- 下拉式選單 -->
                    <?php if($sys_role >= 0){ 
                        if($sys_role <= 2.5 ){ ?>
                            <li class="nav-item dropdown">
                                <a class="nav-link active dropdown-toggle" id="navbarDD_2" role="button" data-bs-toggle="dropdown" aria-expanded="false" >
                                    <i class="fa-solid fa-map-location-dot"></i>&nbsp危害健康作業地圖<span class="badge rounded-pill bg-danger"></span></a>
                                              
                                <ul class="dropdown-menu" aria-labelledby="navbarDD_2">
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/sn_local/"><i class="fa-solid fa-list-check"></i>&nbsp<b>特殊危害健康作業管理</b></a></li>
                                    <?php if($sys_role <= 2 ){ ?>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><a class="dropdown-item" href="<?php echo $webroot;?>/analyze/"><i class="fa-solid fa-chart-column"></i>&nbsp<b>統計(試作版)</b></a></li>
                                    <?php } ?>
                                </ul>
                            </li>
                        <?php } 
                        
                        if($sys_role <= 1 ){ ?>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" id="navbarDD_3" role="button" data-bs-toggle="dropdown" aria-expanded="false" >
                                    <i class="fa-solid fa-gear"></i>&nbsp管理員專區</a>
                                <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDD_3">
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/local/"><i class="fa-solid fa-location-dot"></i>&nbsp廠區清單管理</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/formcase/"><i class="fa-solid fa-sliders"></i>&nbsp<i class="fas fa-th-large"></i>&nbsp表單管理</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/autolog/"><i class="fa-regular fa-rectangle-list"></i>&nbsp發報記錄管理</a></li>
                                    <?php if($sys_role == 0 ){ ?>
                                        <li><a class="dropdown-item" href="<?php echo $webroot;?>/notify/"><i class="fa-solid fa-comment-sms"></i>&nbsp待通報清單統計</a></li>
                                    <?php } ?>
                                </ul>
                            </li>
                        <?php }
                    } ?>
                <?php } ?>
            </ul>
            
            <!-- .navbar-toggler, .navbar-collapse 和 .navbar-expand{-sm|-md|-lg|-xl} -->
            <ul class="navbar-nav ms-auto   my-2 my-lg-0 navbar-nav-scroll">
                <?php if(!$sys_auth){
                    echo "<li class='nav-item mx-1'><a href='{$webroot}/auth/login.php' class=''><i class='fa fa-sign-in' aria-hidden='true'></i> 登入</a></li>";
                    // echo "<li class='nav-item mx-1 disabled'><a href='{$webroot}/auth/register.php' class='btn btn-success'>註冊</a></li>";
                } else { ?>
                    <!-- 下拉式選單 -->
                    <li class="nav-item dropdown">
                        <a class="nav-link active dropdown-toggle" href="#" id="navbarDD_reg" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <?php echo (isset($auth_pass) && $auth_pass == "ldap") ? "<i class='fa fa-user' aria-hidden='true'></i>" : "<i class='fa fa-user-secret' aria-hidden='true'></i>";
                                  echo "&nbsp".$auth_cname .($sys_auth ? '<sup class="text-danger"> - '.$sys_role.'</sup>':'').'&nbsp你好'; 
                            ?>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDD_reg">
                            <?php if($sys_auth){  
                                    if($sys_role <= 1){
                                        echo "<li><a class='dropdown-item' href='{$webroot}/auth/edit.php?user={$auth_user}'><i class='fa fa-user-circle' aria-hidden='true'></i> 編輯User資訊</a></li>";
                                        echo "<li><hr class='dropdown-divider'></li>";
                                    } 
                                    if($sys_role <= 1){
                                        echo "<li><a class='dropdown-item' href='{$webroot}/auth/'><i class='fa fa-address-card' aria-hidden='true'></i> 管理使用者</a></li>";
                                        echo "<li><hr class='dropdown-divider'></li>";
                                    } 
                                } else {
                                    echo "<li><a class='dropdown-item' href='{$webroot}/auth/login.php'><i class='fa fa-sign-in' aria-hidden='true'></i> SSO登入</a></li>";
                                } 
                                echo "<li><a class='dropdown-item' href='{$webroot}/auth/logout.php' class=''><i class='fa fa-sign-out' aria-hidden='true'></i> 登出</a></li>";
                            ?>
                        </ul>
                    </li>
                <?php } ?>
            </ul>
        </div>
    </div>
</nav>
