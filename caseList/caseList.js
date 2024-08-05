
// // // utility fun
    // Bootstrap Alarm function
    function alert(message, type) {
        var alertPlaceholder = document.getElementById("liveAlertPlaceholder")      // Bootstrap Alarm
        var wrapper = document.createElement('div')
        wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message 
                            + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        alertPlaceholder.append(wrapper)
    }
    // fun3-3：吐司顯示字條 // init toast
    function inside_toast(sinn){
        var toastLiveExample = document.getElementById('liveToast');
        var toast = new bootstrap.Toast(toastLiveExample);
        var toast_body = document.getElementById('toast-body');
        toast_body.innerHTML = sinn;
        toast.show();
    }

    $(function(){
        // 在任何地方啟用工具提示框
        $('[data-toggle="tooltip"]').tooltip();
        // swl function    
        if(swal_json.length != 0){
            if(swal_json['action'] == 'success'){
                var sinn = 'submit - ( '+swal_json['fun']+' : '+swal_json['content']+' ) <b>'+ swal_json['action'] +'</b>&nbsp!!';
                inside_toast(sinn);
                // 20240220_增加mapp推播訊息
                if(swal_json['fun'] == 'store_ptreceive' && ppe_pms.length !=0 ){
                    var mg_msg = swal_json['msg'];
                    Object(ppe_pms).forEach(function(user){
                        var user_emp_id = String(user['emp_id']).trim();            // 定義 user_emp_id + 去空白
                        push_mapp(user_emp_id, mg_msg);
                    })
                }
            }
            swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action'], {buttons: false, timer:3000});
        }
        // 20230131 新增保存日期為'永久'    20230714 升級合併'永久'、'清除'
        // 監聽lot_num是否有輸入值，跟著改變樣態
        $('#lot_num').on('input', function() {
            change_btn('edit');
        });
    });
    

// // // shopping_cart
    $(document).ready(function () {
        
        // dataTable 2 https://ithelp.ithome.com.tw/articles/10272439
        $('#stock_list').DataTable({
            "autoWidth": false,
            // 排序
            // "order": [[ 4, "asc" ]],
            // 顯示長度
            "pageLength": 25,
            // 中文化
            "language":{
                url: "../../libs/dataTables/dataTable_zh.json"
            }
        });


        // 假如index找不到當下存在已完成的表單，就alarm它!
        // if (check_yh_list_num == '0') {
        //     let message  = '*** '+ thisYear +' '+ half +'年度 PPE儲存量確認開始了! 請務必在指定時間前完成確認 ~ <i class="fa-solid fa-right-long"></i>&nbsp&nbsp&nbsp';
        //         message += '<button type="button" style="background-color: transparent;" data-bs-toggle="modal" data-bs-target="#checkList">'
        //                     +'<b><i class="fa-solid fa-clipboard-list" aria-hidden="true"></i>&nbsp打開點檢表</button></b>';
        //     alert( message, 'danger')
        // }
        if (_inplan && (sys_role <= 2) && (check_yh_list_num == '0')) {
            let message  = '*** <b>'+case_title+'</b> 開放填寫時間：<b><u>'+ start_time +'</u></b>&nbsp至&nbsp<b><u>'+ end_time +'</u></b>&nbsp請各廠窗口務必在指定時間前完成填寫&nbsp~&nbsp';
            alert( message, 'warning')
        }
    })