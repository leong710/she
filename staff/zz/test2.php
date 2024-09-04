<?php

    $a = "02:噪音,31:銦";

    $arr = explode(",", $a);                   // 1-1c sfab_id是陣列，要轉成字串

    
    $result = array();
    foreach ($arr as $arr_i) {
        list($key, $value) = explode(':', $arr_i);
        $result[$key] = $value;
    }


    echo "<pre>";
    print_r($result);
    echo "</pre>";


?>