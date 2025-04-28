<?php
// // // p3查詢待簽名單
    function showP3Notify_list(){
        $pdo = pdo();
        $sql = "SELECT _d.*, _f.osha_id, _f.pm_emp_id
                FROM `_document` _d
                LEFT JOIN _fab _f ON _d.BTRTL = _f.BTRTL
                WHERE _d.idty > 3 AND _d.idty < 10 
                GROUP BY _d.uuid";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute();
            $notify_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $notify_list;

        }catch(PDOException $e){
            echo $e->getMessage();
            return false;
        }
    }
// // // 查詢待簽名單 -- end

// // // mapp init -- end
    function check_ip($request){
        extract($request);
        $local_pc = array(                      // 建立local_pc查詢陣列
            '127.0.0.1'   => '7132e2545d301024dfb18da07cceccedb41b4864',   // 127.0.0.1
            'tw059332n_1' => 'a2e9ef3a208c4882a99ec708d09cedc7ebb92bb6',   // tw059332n-10.53.90.184
            'tw059332n_2' => 'dc7f33a2a06752e87d62a7e75bd0feedbddf1cbd',   // tw059332n-169.254.69.80
            'tw059332n_3' => '0afa7ce76ab41ba4845e719d3246c48dadb611fd',   // tw059332n-10.53.110.83
            'tw074163p'   => 'c2cb37acb2c9eb3e4068ac55d278ac7d9bea85e3'    // tw074163p-10.53.90.114
        );
        $ip = sha1(md5($ip));
        
        if(in_array($ip, $local_pc)){
            return true;
        }else{
            return false;
        }
    }


