<?php

$parm = "南科管理大樓,9T041500";

$emp_sub_scope = explode(',', $parm)[0];
$deptNo = explode(',', $parm)[1];

echo $emp_sub_scope."<br>";
echo $deptNo;