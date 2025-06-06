<?php
    require_once("../user_info.php");
    $webroot = "..";
?>
<head>
    <link href="../template/nav.css" rel="stylesheet">
</head>

<nav class="navbar navbar-expand-lg navbar-light bg-light app-header ">
    <div class="container-fluid">

        <a class="navbar-brand" href="<?php echo $webroot;?>/">
            <img class="navbar-brand-full pl-3" src="../template/tnesh_logo.png" height="40" width="100" alt="tnESH Logo">
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <ul class="navbar-nav me-auto sysTitle">
            <li class="nav-item px-1">
                <a class="nav-link" href="<?php echo $webroot;?>/" class="p-0">特殊健檢系統(SHE)</a>
                <h6 id="hFullName">Special Health Examination</h6>
            </li>
        </ul>

        <div class="collapse navbar-collapse" id="navbarContent">
            <ul class="navbar-nav me-auto   my-2 my-lg-0 navbar-nav-scroll">
                <?php if($sys_auth){ ?>
                    <!-- <li class="nav-item"><a class="nav-link active" aria-current="page" href="#"><i class="fa-regular fa-square-plus"></i>&nbsp;外層Link</a></li> -->
                    <!-- 下拉式選單 -->
                    <?php if($sys_role >= 0){ 
                        if($sys_role <= 5 ){ ?>
                            <li class="nav-item"><a class="nav-link active" aria-current="page" href="<?php echo $webroot;?>/sh_local/">
                                <i class="fa-solid fa-map-location-dot"></i>&nbsp;危害健康作業地圖<span class="badge rounded-pill bg-danger"></span></a></li>

                            <li class="nav-item dropdown">
                                <a class="nav-link active dropdown-toggle" id="navbarDD_2" role="button" data-bs-toggle="dropdown" aria-expanded="false" >
                                    <i class="fa-solid fa-users"></i>&nbsp;職業病預防管理<span class="badge rounded-pill bg-danger"></span></a>
                                              
                                <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <?php if($sys_role <= 2.5 ){ ?>
                                        <li><a class="dropdown-item" href="<?php echo $webroot;?>/change/"><i class="fa-solid fa-people-arrows"></i>&nbsp;<b>變更作業健檢</b></a></li>
                                        <li><hr class="dropdown-divider"></li>
                                    <?php }?>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/staff/"><i class="fa-solid fa-list-check"></i>&nbsp;<b>定期特殊健檢</b></a></li>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/review/"><i class="fa-solid fa-person-circle-check"></i>&nbsp;<b>特檢名單審核與彙整</b></a></li>
                                </ul>
                            </li>

                            <li class="nav-item"><a class="nav-link active" aria-current="page" href="<?php echo $webroot;?>/guide/"><i class="fa-solid fa-circle-question"></i>&nbsp;導覽文件</a></li>
                        <?php } 
                        if($sys_role <= 2.2 ){ ?>
                            <li class="nav-item"><a class="nav-link active" aria-current="page" href="<?php echo $webroot;?>/notify/"><i class="fa-solid fa-comment-sms"></i>&nbsp;發報記錄管理</a></li>
                        <?php } 
                        if($sys_role <= 1 ){ ?>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" id="navbarDD_4" role="button" data-bs-toggle="dropdown" aria-expanded="false" ><i class="fa-solid fa-gear"></i>&nbsp;管理員專區</a>
                                <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDropdown">
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/local/"><i class="fa-solid fa-location-dot"></i>&nbsp;廠區清單管理</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item " href="<?php echo $webroot;?>/balert/"><i class="fa-solid fa-bell"></i>&nbsp;橫幅警語管理</a></li>
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
                } else { ?>
                    <!-- 下拉式選單 -->
                    <li class="nav-item dropdown">
                        <a class="nav-link active dropdown-toggle" href="#" id="navbarDD_reg" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <?php echo (isset($auth_pass) && $auth_pass == "ldap") ? "<i class='fa fa-user' aria-hidden='true'></i>" : "<i class='fa fa-user-secret' aria-hidden='true'></i>";
                                  echo "&nbsp;".$auth_cname .($sys_auth ? '<sup class="text-danger"> - '.$sys_role.'</sup>':'').'&nbsp;你好'; 
                            ?>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDropdown">
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
