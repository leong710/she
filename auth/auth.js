 
    $(function () {
        // 在任何地方啟用工具提示框
        $('[data-toggle="tooltip"]').tooltip();
        // Alex menu
        var navs = Array.from(document.querySelectorAll(".head > ul > li > button"));
        navs.forEach((nav)=>{
            nav.addEventListener('mousedown',function(){
                // 標籤
                document.querySelector(".head > ul > li > button.active").classList.remove('active');
                this.classList.add('active');
                show_activeTab(this.id);          // 呼叫fun竄改activeTab按鈕+數值
            })
        })

        // 監聽表單內 input 變更事件
        $('#emp_id, #cname, #user, #idty').change(function() {
            $(this).removeClass('autoinput');   // 當有變更時，對該input加上指定的class
        });

        // 20230817 禁用Enter鍵表單自動提交 
        document.onkeydown = function(event) { 
            var target, code, tag; 
            if (!event) { 
                event = window.event;       //針對ie瀏覽器 
                target = event.srcElement; 
                code = event.keyCode; 
                if (code == 13) { 
                    tag = target.tagName; 
                    if (tag == "TEXTAREA") { return true; } 
                    else { return false; } 
                } 
            } else { 
                target = event.target;      //針對遵循w3c標準的瀏覽器，如Firefox 
                code = event.keyCode; 
                if (code == 13) { 
                    tag = target.tagName; 
                    if (tag == "INPUT") { return false; } 
                    else { return true; } 
                } 
            } 
        };
    })

    function resetMain(){
        $("#result").removeClass("border rounded bg-white");
        $('#result_table').empty();
        // document.querySelector('#key_word').value = '';
    }
    // 第一-階段：search Key_word
    function search_fun(fun){
        mloading("show");                                               // 啟用mLoading
        const uuid = '752382f7-207b-11ee-a45f-2cfda183ef4f';            // ppe

        if(fun=='search'){
            var search = $('#user').val().trim();                       // search keyword取自user欄位
            if(!search || (search.length < 2)){
                $("body").mLoading("hide");
                alert("查詢字數最少 2 個字以上!!");
                return false;
            } 
            var request = {
                functionname : 'search',                                // 操作功能
                uuid         : uuid,                                    // ppe
                search       : search                                   // 查詢對象key_word
            }

        }else if(fun=='showStaff'){
            var search = $('#recheck_user').val().trim();               // search keyword取自user欄位
            if(!search || (search.length < 2)){
                $("body").mLoading("hide");
                alert("查詢字數最少 2 個字以上!!");
                return false;
            } 
            var request = {
                functionname : 'showStaff',                             // 操作功能
                uuid         : uuid,                                    // ppe
                emp_id       : search                                   // 查詢對象key_word
            }

        }else{
            return false;
        }

        $.ajax({
            // url:'http://tneship.cminl.oa/hrdb/api/index.php',        // 正式舊版
            url: 'http://tneship.cminl.oa/api/hrdb/index.php',          // 正式2024新版
            method: 'post',
            dataType: 'json',
            data: request,
            success: function(res){
                var res_r = res["result"];
                if(fun=='search'){
                    postList(res_r);                                        // 將結果轉給postList進行渲染
                }else{
                    var emp_id_search = document.querySelector('#emp_id_'+search);
                    if(res_r['emp_id'] == undefined && emp_id_search){
                        emp_id_search.classList.add('alert_it');
                    }
                }
            },
            error (err){
                console.log("search error:", err);
                $("body").mLoading("hide");
                alert("查詢錯誤!!");
            }
        })
    }
    // 第一階段：渲染功能
    function postList(res_r){
        // 清除表頭
        $('#result_table').empty();
        // $("#result").addClass("border rounded bg-white");
        $("#result").addClass("bg-white");
        // 定義表格頭段
        var div_result_table = document.querySelector('.result table');
        var Rinner = "<thead><tr>"+
                        "<th>員工編號</th>"+"<th>員工姓名</th>"+"<th>職稱</th>"+"<th>user_ID</th>"+"<th>部門代號</th>"+"<th>部門名稱</th>"+"<th>select</th>"+
                    "</tr></thead>" + "<tbody id='tbody'>"+"</tbody>";
        // 鋪設表格頭段thead
        div_result_table.innerHTML += Rinner;
        // 定義表格中段tbody
        var div_result_tbody = document.querySelector('.result table tbody');
        $('#tbody').empty();
        var len = res_r.length;
        for (let i=0; i < len; i++) {
            // 把user訊息包成json字串以便夾帶
            let user_json = JSON.stringify({
                    "emp_id"    : res_r[i].emp_id.trim(),
                    "cname"     : res_r[i].cname.trim(),
                    "user"      : res_r[i].user.trim(),
                    "cstext"    : res_r[i].cstext.trim(),
                    "sign_code" : res_r[i].dept_no.trim()
                });

            div_result_tbody.innerHTML += 
                '<tr>' +
                    '<td>' + res_r[i].emp_id +'</td>' +
                    '<td>' + res_r[i].cname + '</td>' +
                    '<td>' + res_r[i].cstext + '</td>' +
                    '<td>' + res_r[i].user + '</td>' +
                    '<td>' + res_r[i].dept_no + '</td>' +
                    '<td>' + res_r[i].dept_c +'/'+ res_r[i].dept_d + '</td>' +
                    '<td>' + '<button type="button" class="btn btn-default btn-xs" id="'+res_r[i].emp_id+'" value='+user_json+' onclick="tagsInput_me(this.value)">'+
                    '<i class="fa-regular fa-circle"></i></button>' + '</td>' +
                '</tr>';
        }
        $("body").mLoading("hide");                                 // 關閉mLoading
        // document.getElementById("searchUser_btn").click();       // 切到searchUser頁面
        user_modal.hide();
        searchUser_modal.show();                                    // 切到searchUser頁面

    }
    // 第二階段：點選、渲染模組
    function tagsInput_me(val) {
        if (val !== '') {
            let obj_val = JSON.parse(val);                  // 將JSON字串轉成Object物件
            // 渲染
            Object.entries(obj_val).forEach(function([user_key, user_value]){
                if(user_key == "cstext"){
                    // 使用正则表达式的 exec 方法来查找目标字符串中的匹配项
                    var idty = document.getElementById('idty');
                    if(idty){
                        // 创建正则表达式模式和对应的数值映射
                        const patterns = {
                            "副理": 2,
                            "經理": 3,
                            "處長": 4
                        };
                        let match;
                        for (const [pattern, value] of Object.entries(patterns)) {
                            const regex = new RegExp(pattern, 'gi');
                            if ((match = regex.exec(obj_val.cstext)) !== null) {
                                document.querySelector('#user_modal #idty').value = value; // 将字段带入值 = 职称.副理
                                break;          // 找到匹配项后，跳出循环
                            }
                        }
                        $("#idty").addClass("autoinput");
                    }
                }else{
                    var tag_key = document.getElementById(user_key);
                    if(tag_key){
                        tag_key.value = user_value;
                        $("#"+user_key).addClass("autoinput");
                    }
                }
            })
            resetMain()                                                             // 清除搜尋頁面資料
            searchUser_modal.hide();      // 切到searchUser頁面
            user_modal.show();            // 切換返回到addUser新增頁面
        }
    }

    // user_modal：新增模式
    function add_module(to_module){     
        $('#'+to_module+'_modal_action, #'+to_module+'_modal_button, #'+to_module+'_modal_delect_btn, #edit_'+to_module+'_info').empty();   // 清除model功能
        $('#'+to_module+'_reset_btn').click();                                  // reset清除表單

        var add_btn = '<input type="submit" name="submit_add_'+to_module+'" class="btn btn-primary" value="新增'+to_module+'">';
        $('#'+to_module+'_modal_button').append(add_btn);                       // 填上儲存鈕

        $('#'+to_module+'_modal_action').append('新增');                        // 更新model標題
        var reset_btn = document.getElementById(to_module+'_reset_btn');        // 指定清除按鈕
        reset_btn.classList.remove('unblock');                                  // 新增模式 = 顯示清除按鈕
        document.querySelector("#"+to_module+"_modal .modal-header").classList.remove('edit_mode_bgc');
        document.querySelector("#"+to_module+"_modal .modal-header").classList.add('add_mode_bgc');
    }
    // user_modal：編輯模式
    function edit_module(to_module, row_id){
        $('#'+to_module+'_modal_action, #'+to_module+'_modal_button, #'+to_module+'_modal_delect_btn, #edit_'+to_module+'_info').empty();   // 清除model功能
        $('#'+to_module+'_reset_btn').click();                                  // reset清除表單
        
        var add_btn = '<input type="submit" name="submit_edit_'+to_module+'" class="btn btn-primary" value="儲存'+to_module+'">';
        $('#'+to_module+'_modal_button').append(add_btn);                       // 填上儲存鈕
        // var del_btn = '<input type="submit" name="submit_delete_'+to_module+'" value="刪除'+to_module+'" class="btn btn-sm btn-xs btn-danger" onclick="return confirm(`確認刪除？`)">';
        var del_btn ='<button type="submit" name="submit_delete_'+to_module+'" title="刪除" class="btn btn-sm btn-xs btn-danger" onclick="return confirm(`確認刪除？`)"><i class="fa-solid fa-user-xmark"></i></button>';
        $('#'+to_module+'_modal_delect_btn').append(del_btn);                   // 填上刪除鈕

        $('#'+to_module+'_modal_action').append('編輯');                        // 更新model標題
        var reset_btn = document.getElementById(to_module+'_reset_btn');        // 指定清除按鈕
        reset_btn.classList.add('unblock');                                     // 編輯模式 = 隱藏清除按鈕
        document.querySelector("#"+to_module+"_modal .modal-header").classList.remove('add_mode_bgc');
        document.querySelector("#"+to_module+"_modal .modal-header").classList.add('edit_mode_bgc');

        // 參數說明: to_module = 來源與目的 user_item
        tags = [];                                                              // 清除tag名單陣列
        // step1.將原排程陣列逐筆繞出來
        Object(window[to_module]).forEach(function(row){  
            if(row['id'] == row_id){
                // step2.鋪畫面到module
                Object(window[to_module+'_item']).forEach(function(item_key){
                    if(item_key == 'id'){
                        document.querySelector('#'+to_module+'_delete_id').value = row['id'];       // 鋪上delete_id = this id.no for delete form
                        document.querySelector('#'+to_module+'_edit_id').value = row['id'];         // 鋪上edit_id = this id.no for edit form
                    }else if(item_key == 'flag'){
                        document.querySelector('#edit_'+to_module+' #edit_'+to_module+'_'+row[item_key]).checked = true;
                    }else if(item_key == 'sfab_id'){                          // 20231108_pm_emp_id多名單
                        // 第0階段：套用既有數據
                        var intt_val_str = row['sfab_id'];                    // 引入PM資料
                        var intt_val = [];
                        // if(intt_val_str.length !== 0){                       // 過濾原本pm字串不能為空
                        if(intt_val_str){                                       // 過濾原本pm字串不能為空
                            intt_val = intt_val_str.split(',');                 // 直接使用 split 方法得到陣列
                            intt_val.forEach(function(sfab_val){
                                document.querySelector('#'+to_module+'_modal #sfab_id_'+sfab_val).checked = true;
                            })
                        }
                    }else{
                        document.querySelector('#'+to_module+'_modal #'+item_key).value = row[item_key]; 
                    }
                })
                // 鋪上最後更新
                // let to_module_info = '最後更新：'+row['updated_at']+' / by '+row['updated_user'];
                // document.querySelector('#edit_'+to_module+'_info').innerHTML = to_module_info;
                // step3-3.開啟 彈出畫面模組 for user編輯
                // edit_myTodo_btn.click();
                return;
            }
        })
    }

    function show_swal(swal_json){
        swal(swal_json['fun'] ,swal_json['content'] ,swal_json['action'], {buttons: false, timer:3000});         // 3秒
    }

    // 空值遮蔽：On、Off
    function groupBy_role(role_value){
        mloading("show");                                               // 啟用mLoading
        const arr_role = role_value.split(',').map(item => parseInt(item));
        var table_tr = document.querySelectorAll('#user_table > tbody > tr');
        table_tr.forEach(function(row){
            var row_role = parseInt(row.children[1].innerText); // 將字串轉換為數字
            if(arr_role.includes(row_role)){
                row.classList.remove('unblock');
            } else {
                row.classList.add('unblock');
            }
        })  
        $("body").mLoading("hide");
    }
    // user分類算人頭
    function count_role(){
        var count_role_arr = {
            "none"  : 0,
            "new"   : 0,
            "pause" : 0
        };
        Object(user).forEach(function(row){
            var row_role = parseInt(row['role']); // 將字串轉換為數字
            if(row_role >= 0 && row_role <= 2 ){
                count_role_arr["none"]++;
            }else if(row_role == 3){
                count_role_arr["new"]++;
            }else{
                count_role_arr["pause"]++;
            }
        })
        // 渲染
        Object.entries(count_role_arr).forEach(function([key, value]){
            $('#'+key).append(value);                   // 填上數量
        })
    }
    // 竄改user_modal activeTab按鈕+數值
    function show_activeTab(active_no){
        let activeTab_input = '<input type="hidden" name="activeTab" value="'+active_no+'"></input>';
        $('#activeTab').empty();
        $('#activeTab').append(activeTab_input);
    }
    // recheck user
    function recheck_user(){
        Object(user).forEach(function(row){
            let emp_id = row['emp_id'];
            $('#recheck_user').empty();                             // 清除recheck_user input功能
            document.getElementById('recheck_user').value = emp_id;
            search_fun('showStaff');
        })
    }

    $(document).ready(function(){
        // show swal
        if(swal_json.length != 0){ show_swal(swal_json); }
        // recheck user
        recheck_user();
        // user分類算人頭
        count_role();
        // NAV select 1
        // groupBy_role('0,1,2');
        // 切換指定NAV分頁btn
        // document.querySelector(".head > ul > li > button.active").classList.remove('active');       // 移除激活
        document.querySelector("#"+activeTab).classList.add('active');                              // 激活选项卡
        $("#"+activeTab).click();                                                                   // 點選選項卡以便套用groupBy_role(...)
        show_activeTab(activeTab);                                                                  // 呼叫fun竄改user_modal activeTab按鈕+數值

    });