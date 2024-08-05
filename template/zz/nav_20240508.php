<?php
    require_once("..\user_info.php");
    require_once("function.php");

    $webroot = "..";
    
    // init
        $numReceive = 0; $numTrade = 0; $numIssue = 0; $numChecked = 0; 

    $num3 = $numReceive;
    $num12 = $numIssue + $numTrade;
?>
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
        <a class="navbar-brand" href="<?php echo $webroot;?>/">tnESH-Invest事故訪談系統</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarContent">
            <ul class="navbar-nav me-auto   my-2 my-lg-0 navbar-nav-scroll">
                <?php if($sys_auth){ ?>
                    <!-- <li class="nav-item"><a class="nav-link active" aria-current="page" href="#"><i class="fa-regular fa-square-plus"></i>&nbsp外層Link</a></li> -->
                    <li class="nav-item"><a class="nav-link active" aria-current="page" href="<?php echo $webroot;?>/interView/"><i class="fa fa-edit"></i>&nbsp填寫訪問單</a></li>
                    <!-- 下拉式選單 -->
                    <?php if($sys_role >= 0){ ?>

                        <?php if($sys_role <= 2.5 ){ ?>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" id="navbarDD_2" role="button" data-bs-toggle="dropdown" aria-expanded="false" >
                                    <i class="fas fa-warehouse"></i>&nbsp表單應用<span class="badge rounded-pill bg-danger"></span></a>
                                              
                                <ul class="dropdown-menu" aria-labelledby="navbarDD_2">

                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/caseList/"><i class="fa-solid fa-list-check"></i>&nbsp<b>訪問清單</b></a></li>
                                    <li><hr class="dropdown-divider"></li>

                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/stock/"><i class="fa-solid fa-boxes-stacked"></i>&nbsp<b>倉庫庫存</b>
                                        <span class="badge rounded-pill bg-danger"><i class="fa-solid fa-car-on"></i></span>
                                        </a></li>

                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/stock/sum_report.php"><i class="fa-solid fa-chart-column"></i>&nbsp<b>PPE器材管控清單</b></a></li>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/dashBoard/sum_report.php"><i class="fa-solid fa-list"></i><i class="fa-solid fa-truck"></i>&nbsp進出量與成本匯總</a></li>

                                    <li><hr class="dropdown-divider"></li>
                                    <?php if($sys_role <= 2 ){ ?>
                                        <li><a class="dropdown-item" href="<?php echo $webroot;?>/trade/form.php"><i class="fa-solid fa-upload"></i>&nbsp調撥出庫</a></li>
                                    <?php } if($sys_role <= 1 ){ ?>
                                        <li><a class="dropdown-item" href="<?php echo $webroot;?>/trade/restock.php"><i class="fa-solid fa-download"></i>&nbsp其他入庫</a></li>
                                    <?php }?>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/trade/"><i class="fa-solid fa-2"></i>&nbsp<b>出入作業總表</b>
                                        <?php if($numTrade !=0){?>
                                            &nbsp<span class="badge rounded-pill bg-danger"><?php echo $numTrade; ?></span>
                                        <?php }?></a></li>

                                    <li><hr class="dropdown-divider"></li>
                                    <?php if($sys_role <= 2 ){ ?>
                                        <li><a class="dropdown-item" href="<?php echo $webroot;?>/issue/form.php"><i class="fa fa-edit" aria-hidden="true"></i>&nbsp請購需求</a></li>
                                    <?php }?>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/issue/"><i class="fa-solid fa-1"></i>&nbsp<b>請購需求總表</b>
                                        <?php if($numIssue !=0){?>
                                            &nbsp<span class="badge rounded-pill bg-danger"><?php echo $numIssue; ?></span>
                                        <?php }?></a></li>

                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/pt_stock/sum_report.php"><i class="fa-solid fa-chart-column"></i>&nbsp<b>除汙器材管控清單</b></a></li>
                                    
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/pno/"><i class="fa-solid fa-list"></i>&nbsp料號管理</a></li>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/catalog/"><i class="fas fa-th-large"></i>&nbsp器材目錄管理</a></li>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/local/low_level.php"><i class="fa-solid fa-retweet"></i>&nbsp安全存量設定</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/supp/"><i class="fa-solid fa-address-book"></i>&nbsp供應商聯絡人管理</a></li>
                                    <li><hr class="dropdown-divider"></li>

                                </ul>
                            </li>
                        <?php } ?>

                        <?php if($sys_role <= 1 ){ ?>
                            <li class="nav-item dropdown">
                                <a class="nav-link active dropdown-toggle" id="navbarDD_3" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fa-solid fa-sliders"></i>&nbsp進階設定</a>
                                <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDD_3">
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/local/"><i class="fa-solid fa-location-dot"></i>&nbsp廠區清單管理</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/formcase/"><i class="fas fa-th-large"></i>&nbsp表單管理</a></li>
                                    <li><hr class="dropdown-divider"></li>
                 
                                </ul>
                            </li>

                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" id="navbarDD_4" role="button" data-bs-toggle="dropdown" aria-expanded="false" disabled >
                                    <i class="fa-solid fa-gear"></i>&nbsp管理員專區</a>
                                <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDD_4">
                                    <?php if($sys_role <= 1 ){ ?>
                                        <li><a class="dropdown-item" href="<?php echo $webroot;?>/insign_msg/"><i class="fa-solid fa-comment-sms"></i>&nbsp待簽清單統計</a></li>
                                    <?php } ?>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/autolog/"><i class="fa-regular fa-rectangle-list"></i>&nbspMAPP發報記錄管理</a></li>
                                </ul>
                            </li>
                        <?php } ?>
                    <?php } ?>
                    <!-- 下拉式選單 -->
                <?php } ?>
            </ul>
            
            <!-- .navbar-toggler, .navbar-collapse 和 .navbar-expand{-sm|-md|-lg|-xl} -->
            <ul class="navbar-nav ms-auto   my-2 my-lg-0 navbar-nav-scroll">
                <?php if(!$sys_auth){ ?>
                    <li class="nav-item mx-1"><a href="<?php echo $webroot;?>/auth/login.php" class=""><i class="fa fa-sign-in" aria-hidden="true"></i> 登入</a></li>
                    <!-- <li class="nav-item mx-1 disabled"><a href="<php echo $webroot;?>/auth/register.php" class="btn btn-success">註冊</a></li> -->
                <?php } else { ?>
                    <!-- 下拉式選單 -->
                    <li class="nav-item dropdown">
                        <a class="nav-link active dropdown-toggle" href="#" id="navbarDD_reg" role="button" data-bs-toggle="dropdown" aria-expanded="false"
                            title="<?php echo $sys_auth ? 'sys_role：'.$sys_role:'';?>">
                            <?php if(isset($auth_pass) && $auth_pass == "ldap"){
                                        echo '<i class="fa fa-user" aria-hidden="true"></i>';
                                    } else {
                                        echo '<i class="fa fa-user-secret" aria-hidden="true"></i>';
                                    } 
                                    // echo (isset($_SESSION[$sys_id]["site_title"])) ? "(".$_SESSION[$sys_id]["site_title"].") ":"";
                                    // echo (isset($_SESSION["AUTH"]["dept"])) ? "&nbsp(".$_SESSION["AUTH"]["dept"].")":"";
                                    echo $sys_auth ? "&nbsp".$auth_cname:""; 
                                    echo $sys_auth ? '<sup class="text-danger"> - '.$sys_role.'</sup>':""; 
                            ?> 你好</a>
                        <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDD_reg">
                            <?php   
                                if($sys_auth){  
                                    if($sys_role <= 2){ ?>
                                        <li><a class="dropdown-item" href="<?php echo $webroot;?>/auth/edit.php?user=<?php echo $auth_user;?>"><i class="fa fa-user-circle" aria-hidden="true"></i> 編輯User資訊</a></li>
                                        <li><hr class="dropdown-divider"></li>
                                <?php } 
                                    if($sys_role <= 1){ ?>
                                        <li><a class="dropdown-item" href="<?php echo $webroot;?>/auth/"><i class="fa fa-address-card" aria-hidden="true"></i> 管理使用者</a></li>
                                        <li><hr class="dropdown-divider"></li>
                                <?php } 
                                } else {?>
                                    <li><a class="dropdown-item" href="<?php echo $webroot;?>/auth/login.php"><i class="fa fa-sign-in" aria-hidden="true"></i> SSO登入</a></li>
                                <?php } ?>
                            <li><a class="dropdown-item" href="<?php echo $webroot;?>/auth/logout.php" class=""><i class="fa fa-sign-out" aria-hidden="true"></i> 登出</a></li>
                        </ul>
                    </li>
                <?php } ?>
            </ul>
        </div>
    </div>
</nav>
