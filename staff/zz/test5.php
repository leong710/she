<?php

    $test = "[]";

    $test_arr = json_decode($test, true);


    // $test_arr = !empty($test) ? explode(",", $test) : [];

    // array_push($test_arr, "0004");

    echo "<pre>";

        echo "test：".$test."<br>";
        print_r($test_arr);
        
        // $test_arr = array_unique($test_arr);
        // echo "<br>";
        // print_r($test_arr);

        // $test_str = implode(",", $test_arr);
        // echo "test_str：".$test_str."<br>";

    echo "</pre>";






