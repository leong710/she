<?php
    $row_3 = "作業";
    $row_4 = "95";
    $row_5 = "";

    // 檢查HE_CATE是否含"噪音作業"，必須填AVG_VAL或AVG_8HR
    // $noise_check = ((strpos($row_3,"噪音")) && ($row_4 || $row_5)) ? "true" : "false" ;
    // $noise_check = ((preg_match("/噪音/i",$row_3)) && ($row_4 || $row_5)) ? "true" : "false" ;

    if(preg_match("/噪音/i",$row_3)){
        $noise_check = ($row_4 || $row_5) ? "true" : "false" ;
    }else{
        $noise_check = "true";
    }


    
    echo "row_3：".$row_3."<br>";
    echo "row_4：".$row_4."<br>";
    echo "row_5：".$row_5."<br>";
    echo "noise_check：".$noise_check."<br>";
    echo "preg_match：".(preg_match("/噪音/i",$row_3))."<br>";