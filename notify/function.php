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
    // 20240515_查詢有多少待領清單
    function inCollect_list(){
        $pdo = pdo();
        $sql = "SELECT emp_id, cname  ,fab_title, local_title
                    -- , SUM(esh_collect)  AS esh_collect
                    -- , SUM(user_collect) AS user_collect 
                    , SUM(esh_collect + user_collect) AS total_collect
                    , SUM(esh_ppty_3 + user_ppty_3) AS ppty_3_count

                FROM (
                        SELECT _u.emp_id, _u.cname  COLLATE utf8mb4_general_ci AS cname , _f.fab_title  COLLATE utf8mb4_general_ci AS fab_title, _l.local_title  COLLATE utf8mb4_general_ci AS local_title
                            , COUNT(_r.uuid) AS esh_collect
                            , SUM(CASE WHEN _r.ppty = 3 THEN 1 ELSE 0 END) AS esh_ppty_3
                            , 0 AS user_collect
                            , 0 AS user_ppty_3 
                        FROM _users _u
                        LEFT JOIN _local _l ON _u.fab_id = _l.fab_id
                        LEFT JOIN _fab _f ON _l.fab_id = _f.id
                        LEFT JOIN _receive _r ON _l.id = _r.local_id
                        WHERE _u.role <> '' AND _u.role < 3 AND _r.idty = 12
                        GROUP BY _u.emp_id
                        HAVING _u.emp_id IS NOT NULL
                    UNION ALL
                        SELECT _r.emp_id, _r.cname  COLLATE utf8mb4_general_ci AS cname , _f.fab_title  COLLATE utf8mb4_general_ci AS fab_title, _l.local_title  COLLATE utf8mb4_general_ci AS local_title
                            , 0 AS esh_collect 
                            , 0 AS esh_ppty_3 
                            , SUM(CASE WHEN _r.idty = 12 THEN 1 ELSE 0 END) AS user_collect
                            , SUM(CASE WHEN _r.ppty = 3 THEN 1 ELSE 0 END) AS user_ppty_3
                        FROM _receive _r
                        LEFT JOIN _local _l ON _r.local_id = _l.id
                        LEFT JOIN _fab _f ON _l.fab_id = _f.id
                        WHERE _r.idty = 12
                        GROUP BY _r.emp_id
                        HAVING _r.emp_id IS NOT NULL
                    ) AS merged_results
                GROUP BY emp_id 
                ORDER BY emp_id ASC ";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute();
            $inCollect_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $inCollect_list;

        }catch(PDOException $e){
            echo $e->getMessage();
            return false;
        }
    }

    // 20240516_
    function inReject_list(){
        $pdo = pdo();
        $sql = "SELECT emp_id, cname
                    , SUM(issue_Reject) AS issue_Reject , SUM(receive_Reject) AS receive_Reject
                    , SUM(issue_Reject + receive_Reject) AS total_Reject , SUM(issue_3_count + receive_3_count) AS ppty_3_count
                FROM (
                        SELECT _i.in_user_id AS emp_id, cname
                            , SUM(CASE WHEN _i.idty = 2 THEN 1 ELSE 0 END) AS issue_Reject , 0 AS receive_Reject
                            , SUM(CASE WHEN _i.ppty = 3 THEN 1 ELSE 0 END) AS issue_3_count , 0 AS receive_3_count
                        FROM _issue _i
                        WHERE _i.idty = 2
                        GROUP BY _i.in_user_id
                        HAVING _i.in_user_id IS NOT NULL
                    UNION ALL
                        SELECT _r.emp_id, _r.cname
                            , 0 AS issue_Reject , SUM(CASE WHEN _r.idty = 2 THEN 1 ELSE 0 END) AS receive_Reject
                            , 0 AS issue_3_count , SUM(CASE WHEN _r.ppty = 3 THEN 1 ELSE 0 END) AS receive_3_count
                        FROM _receive _r
                        WHERE _r.idty = 2
                        GROUP BY _r.emp_id
                        HAVING _r.emp_id IS NOT NULL
                    ) AS merged_results
                GROUP BY emp_id, cname ";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute();
            $inReject_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $inReject_list;

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


