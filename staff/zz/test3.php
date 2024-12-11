<?php

    require_once("../pdo.php");

        function showSignCode($request) {
            $pdo_hrdb = pdo_hrdb();
            $sql = "SELECT DEPT08.* FROM HCM_VW_DEPT08 DEPT08 WHERE DEPT08.OSHORT = ?";
            $stmt = $pdo_hrdb->prepare($sql);
            try {
                $stmt->execute([$request]);
                return $stmt->fetch(PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                error_log($e->getMessage());
                return null; // 返回null以便檢查
            }
        }
      
        
        
    echo "<pre>";
        $new_check_deptNo = "9T041500";
        echo "new_check_deptNo=".$new_check_deptNo."<br>";
        
        $result = showSignCode($new_check_deptNo);
        print_r($result);

    echo "</pre>";