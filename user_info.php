<?php
    if(!isset($_SESSION)){                                              // 確認session是否啟動
        session_start();
    }
    // 取出$_session引用
    $auth_pass      = (isset($_SESSION["AUTH"]["pass"]))      ? $_SESSION["AUTH"]["pass"]      : false ;
    $auth_emp_id    = (isset($_SESSION["AUTH"]["emp_id"]))    ? $_SESSION["AUTH"]["emp_id"]    : false ;
    $auth_user      = (isset($_SESSION["AUTH"]["user"]))      ? $_SESSION["AUTH"]["user"]      : false ;
    $auth_cname     = (isset($_SESSION["AUTH"]["cname"]))     ? $_SESSION["AUTH"]["cname"]     : false ;
    $auth_idty      = (isset($_SESSION["AUTH"]["idty"]))      ? $_SESSION["AUTH"]["idty"]      : false ;
    $auth_sign_code = (isset($_SESSION["AUTH"]["sign_code"])) ? $_SESSION["AUTH"]["sign_code"] : false ;
    $sys_role       = (isset($_SESSION[$sys_id]["role"]))     ? $_SESSION[$sys_id]["role"]     : false ;
    $sys_BTRTL      = (isset($_SESSION[$sys_id]["BTRTL"]))    ? $_SESSION[$sys_id]["BTRTL"]    : false ;
    $sys_auth       = (isset($_SESSION[$sys_id]))             ? true                           : false ; 

