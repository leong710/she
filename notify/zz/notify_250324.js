// // 1. 工具函數 (Utility Functions)
    const uuid ='e65fccd1-79e7-11ee-92f1-1c697a98a75f';    // nurse
    // fun.0-1: Bootstrap Alarm function
    function Balert(message, type) {
        if(message){
            type = type ?? 'warning';
            var alertPlaceholder = document.getElementById("liveAlertPlaceholder")      // Bootstrap Alarm
            var wrapper = document.createElement('div')
            wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">${message}` 
                                + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
            alertPlaceholder.append(wrapper)
        }
    }
    // fun.0-2：吐司顯示字條 +堆疊
    function inside_toast(sinn, delayTime, type){
        if(sinn){
            delayTime = delayTime ?? 3000;
            type      = type ?? 'warning';
            // 創建一個新的 toast 元素
            var newToast = document.createElement('div');
                newToast.className = 'toast align-items-center bg-'+type;
                newToast.setAttribute('role', 'alert');
                newToast.setAttribute('aria-live', 'assertive');
                newToast.setAttribute('aria-atomic', 'true');
                newToast.setAttribute('autohide', 'true');
                newToast.setAttribute('delay', delayTime);
    
                // 設置 toast 的內部 HTML
                newToast.innerHTML = `<div class="d-flex"><div class="toast-body">${sinn}</div>
                        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
    
            // 將新 toast 添加到容器中
            document.getElementById('toastContainer').appendChild(newToast);
    
            // 初始化並顯示 toast
            var toast = new bootstrap.Toast(newToast);
            toast.show();
    
            // 選擇性地，在 toast 隱藏後將其從 DOM 中移除
            newToast.addEventListener('hidden.bs.toast', function () {
                newToast.remove();
            });
        }
    }
    // fun.0-3: swal
    function new_show_swal_fun(swal_value){
        return new Promise((resolve) => {  
            $("body").mLoading("hide");
            if(swal_value && swal_value['fun'] && swal_value['content'] && swal_value['action']){
                if(swal_value['action'] == 'success'){
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.href = url});          // n秒后回首頁
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{closeWindow(true)});                                          // 手動關閉畫面
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{closeWindow(true); resolve();});  // 2秒自動關閉畫面; 載入成功，resolve
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.reload(); resolve();});  // 2秒自動 刷新页面;載入成功，resolve
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{resolve();});  // 2秒自動 載入成功，resolve
                
                } else if(swal_value['action'] == 'warning' || swal_value['action'] == 'info'){   // warning、info
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{resolve();}); // 載入成功，resolve

                } else {                                        // error
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{history.back();resolve();}); // 手動回上頁; 載入成功，resolve
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{resolve();}); // 手動保留在本業; 載入成功，resolve
                }
            }else{
                console.error("Invalid swal_value:", swal_value);
                location.href = url;
                resolve(); // 異常情況下也需要resolve
            }
        });
    }
    // fun.0-4b: 停止並銷毀 DataTable
    function release_dataTable(_table){
        return new Promise((resolve) => {
            _table = _table ?? 'hrdb_table';
            let table = $(`#${_table}`).DataTable();
                if(table) {
                    table.destroy();
                }

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    // fun.0-4a: dataTable
    function reload_dataTable(_table){
        // dataTable 2 https://ithelp.ithome.com.tw/articles/10272439
        return new Promise((resolve) => {
            _table = _table ?? 'hrdb_table';
            let table = $(`#${_table}`).DataTable();
            if(table) {
                release_dataTable(_table);        // 呼叫[fun.0-4b] 停止並銷毀 DataTable
            }
            // 重新初始化 DataTable
            $(`#${_table}`).DataTable({
                "language": { url: "../../libs/dataTables/dataTable_zh.json" }, // 中文化
                "autoWidth": false,                                              // 自動寬度
                "order": _table == 'hrdb_table' ? [[ 2, "asc" ], [ 1, "asc" ], [ 0, "asc" ]] : [[ 4, "asc" ], [ 2, "asc" ]] ,            // 排序
                "pageLength": 25,                                               // 顯示長度
                    // "paging": false,                                             // 分頁
                    // "searching": false,                                          // 搜尋
                    // "data": hrdb_data,
                // "columnDefs": [
                        // { "width": "60px", "targets": [0, 1, 2] },               // 設定第1~3欄的寬度為50px
                        // { "width": "40px", "targets": [6, 7, 8, 9] },
                    // ]
            });

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    // fun.0-5 多功能擷取fun 新版改用fetch
    async function load_fun(fun, parm, myCallback) {        // parm = 參數
        // mloading(); 
        if(parm){
            try {
                let formData = new FormData();
                    formData.append('fun', fun);
                    formData.append('parm', parm);              // 後端依照fun進行parm參數的採用

                let response = await fetch('../mvc/load_fun.php', {
                    method : 'POST',
                    body   : formData
                });

                if (!response.ok) {
                    throw new Error('fun load ' + fun + ' failed. Please try again.');
                }

                let responseData = await response.json();
                let result_obj = responseData['result_obj'];    // 擷取主要物件

                if(parm === 'return' || myCallback === 'return'){
                    return result_obj;                          // resolve(true) = 表單載入成功，then 直接返回值
                }else{
                    return myCallback(result_obj);              // resolve(true) = 表單載入成功，then 呼叫--myCallback
                }                                               // myCallback：form = bring_form() 、document = edit_show() 、
            } catch (error) {
                $("body").mLoading("hide");
                throw error;                                    // 載入失敗，reject
            }
        }else{
            console.log('error: parm lost...');
            alert('error: parm lost...');
            $("body").mLoading("hide");
        }
    }
    // fun.0-6: console.log
    function console_log(debug_value){
        return new Promise((resolve) => {  
            $("body").mLoading("hide");
            console.log("console_log: ", debug_value);
            resolve(); // 異常情況下也需要resolve
        });
    }
    // fun.0-7 修改mLoading文字提示...str1=訊息文字, str2=百分比%
    function Adj_mLoading(str1, str2){
        if(str1 || str2) {                          // 有內容才來做這件事...
            const mloading_txt_div = document.querySelector('.mloading-body .mloading-bar .mloading-text'); // 取得mLoading_div
            if(mloading_txt_div){
                let adjText  = str1 ? `${str1}...` : ``;        // 組合文字...str1
                    adjText += str2 ? `(${str2}%)` : '';        // 組合文字...str2
                    mloading_txt_div.innerText = adjText;       // 渲染項目
            }else{
                console.error('mloading_txt_div...missed!');
            }
        }else{
            console.error(`Adj_mLoading(str1 || str2) parm ... missed!`);
        }
    } 
    // fun.0-8 提取指定json_file內容
    async function load_jsonFile(json_fileName){
        let json_value;
        if(json_fileName != undefined && json_fileName != null){
            await fetch(json_fileName)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('網頁錯誤: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    json_value = data;           // 將讀取的 JSON 資料放入變數
                })
                .catch(error => {
                    console.error('出現錯誤:', error);
                });
        }
        
        return (json_value);
    }
    // fun.0-9 多功能API新版改用fetch
    async function load_API(fun, parm, myCallback) {        // parm = 參數
        // mloading(); 
        if(parm){
            try {
                let formData = new FormData();
                    formData.append('functionname', fun);
                    formData.append('uuid', uuid);    // nurse
                    formData.append('parm', parm);              // 後端依照fun進行parm參數的採用

                let response = await fetch('http://tneship.cminl.oa/api/hrdb/', {
                    method : 'POST',
                    body   : formData
                });

                if (!response.ok) {
                    throw new Error('fun load ' + fun + ' failed. Please try again.');
                }

                let responseData = await response.json();
                let result_obj = responseData['result'];    // 擷取主要物件

                if(parm === 'return' || myCallback === 'return'){
                    return result_obj;                          // resolve(true) = 表單載入成功，then 直接返回值
                }else{
                    return myCallback(result_obj);              // resolve(true) = 表單載入成功，then 呼叫--myCallback
                }                                               // myCallback：form = bring_form() 、document = edit_show() 、
            } catch (error) {
                $("body").mLoading("hide");
                throw error;                                    // 載入失敗，reject
            }
        }else{
            console.log('error: parm lost...');
            alert('error: parm lost...');
            $("body").mLoading("hide");
        }
    }

// // 子功能--A
    // fun_1 tab_table的顯示關閉功能
    function op_tab(tab_value){
        $("#"+tab_value+"_btn .fa-chevron-circle-down").toggleClass("fa-chevron-circle-up");
        var tab_table = document.getElementById(tab_value);
        if (tab_table && (tab_table.style.display === "none")) {
            tab_table.style.display = "table";
        } else {
            tab_table.style.display = "none";
        }
    }
    // fun_2 倒數 n秒自動關閉視窗功能
    function CountDown(seconds) {
        let i = seconds;                        // 15次==15秒
        const loop = () => {
            if (i >= 0) {
                document.getElementById("myMessage").innerHTML = "視窗關閉倒數 "+ i +" 秒";
                setTimeout(loop, 1000);
            } else {
                // callback();                  // 要執行的程式
                document.getElementById("myMessage").innerHTML = "視窗關閉！";
                window.open('', '_self', '');
                window.close();
            }
            i--;
        };
        loop();
    }
    // fun_3 延遲模組 延遲模組，返回 Promise
    async function delayedLoop(seconds, callback) {
        return new Promise((resolve) => {
            const myMessage = document.getElementById("myMessage");
            let i = seconds;
            const loop = () => {
                if (i > 0) {
                    myMessage.innerHTML = "Fun: " + callback + " 執行倒數 " + i + " 秒";
                    setTimeout(loop, 1000);
                } else {
                    myMessage.innerHTML = "Fun: " + callback + " 執行！";
                    resolve();  // 延遲完成後 resolve Promise
                }
                i--;
            };
            loop();
        }).then(() => window[callback]());  // 在延遲完成後執行 callback
    }
    // 20240529 確認自己是否為彈出視窗 !! 只在完整url中可運行 = tw123456p.cminl.oa
    function checkPopup() {
        var urlParams = new URLSearchParams(window.location.search);
        if ((urlParams.has('popup') && urlParams.get('popup') === 'true') || (window.opener) || (sessionStorage.getItem('isPopup') === 'true')) {
            console.log('popup');
            sessionStorage.removeItem('isPopup');

            let nav = document.querySelector('nav');                // 獲取 <nav> 元素
                nav.classList.add('unblock');                       // class添加'unblock'進行隱藏 

            let rtn_btns = document.querySelectorAll('.rtn_btn');   // 獲取所有帶有 'rtn_btn' class 的按鈕
                rtn_btns.forEach(function(btn) {                    // 遍歷這些按鈕，並設置 onclick 事件
                    btn.onclick = function() {
                        // if (confirm('確認返回？')) {
                            closeWindow();                          // true=更新 / false=不更新
                        // }
                    };
                });
        }else{
            console.log('main');
        }
    }

// // 子功能--B
    // 0-1.確認是否超過3小時；true=_db/更新時間；false=_json          // 呼叫來源：load_init
    function check3hourse(action){
        let currentDate = new Date();                               // 取得今天日期時間
        let reloadTime  = new Date(reload_time.innerText);          // 取得reloadTime時間

        let timeDifference = currentDate - reloadTime;              // 計算兩個時間之間的毫秒差異
        let hoursDifference = timeDifference / (1000 * 60 * 60);    // 將毫秒差異轉換為小時數
        let result = hoursDifference >= 3 ;                          // 判斷相差時間是否大於3小時，並顯示結果
        let _method = result ? '_db' : '_json';
        if(result || action){
            recordTime();       // 1.取得目前時間，並格式化；2.更新reloadTime.txt時間；完成後=>3.更新畫面上reload_time時間
        }
        const _title = ('時間差：'+ Number(hoursDifference.toFixed(2)) +'（小時）>= 3小時：'+ result +' => '+ _method);
        document.getElementById('reload_time').title = _title;
        return _method;
    }
    // 0-2.取得目前時間，並格式化；2.更新reloadTime.txt時間；完成後=>3.更新畫面上reload_time時間        // 呼叫來源：check3hourse
    async function recordTime(){
        let rightNow = new Date().toLocaleString('zh-TW', { hour12: false });                       // 取得今天日期時間
        try {
            await load_fun('urt' , rightNow+', true' , update_reloadTime);      
        } catch (error) {
            console.error(error);
        }
    }
    // 0-3.更新畫面上reload_time時間                  // 呼叫來源：recordTime
    function update_reloadTime(rightNow){
        reload_time.innerText = rightNow;           // 更新畫面上reload_time時間
    }

// // 子技能--C
    // 20240515 整理log記錄檔並轉拋toLog
    async function swap_toLog(user_logs){
        // 打包整理Logs的陣列
        user_logs_obj = {
            thisDay  : thisToday,
            autoLogs : user_logs
        }
        user_logs_json = JSON.stringify(user_logs_obj);                                   // logs大陣列轉JSON字串
        await toLog(user_logs_json);                                                            // *** call fun.step_2 寫入log記錄檔
    }
    // 20231213 寫入log記錄檔~
    function toLog(logs_msg){
        return new Promise((resolve, reject) => {
            $.ajax({
                url      : '../autolog/log.php',
                method   : 'post',
                async    : false,
                dataType : 'json',
                data     : {
                    function : 'storeLog',
                    thisDay  : thisToday,
                    sys      : 'invest',
                    logs     : logs_msg,
                    t_stamp  : ''
                },
                success: function(res){
                    resolve(true);                                          // 成功時解析為 true 
                },
                error: function(res){
                    console.log("toLog -- error：", res);
                    reject(false);                                          // 失敗時拒絕 Promise
                }
            });
        });
    }
    // 20240314 配合await將swal外移
    function show_swal_fun(push_result){
        // swal組合訊息，根據發送結果選用提示內容與符號
        var swal_title = '領用申請單-發放訊息';
        
        if((push_result['email']['error'] == 0) && (push_result['email']['success'] != 0)){
            var swal_content = '寄送成功：'+ push_result['email']['success'];
            var swal_action = 'success';
        } else if((push_result['email']['error'] != 0) && (push_result['email']['success'] == 0)){
            var swal_content = '寄送失敗：'+ push_result['email']['error'];
            var swal_action = 'error';
        } else {
            var swal_content = '寄送成功：'+ push_result['email']['success'] +'、錯誤：'+ push_result['email']['error'];
            var swal_action = 'warning';
        }

        if((push_result['mapp']['error'] == 0) && (push_result['mapp']['success'] != 0)){
            swal_content += ' 、 推送成功：'+ push_result['mapp']['success'];
            swal_action = 'success';
        } else if((push_result['mapp']['error'] != 0) && (push_result['mapp']['success'] == 0)){
            swal_content += ' 、 推送失敗：'+ push_result['mapp']['error'];
            swal_action = 'error';
        } else {
            swal_content += ' 、 推送成功：'+ push_result['mapp']['success'] +'、錯誤：'+ push_result['mapp']['error'];
            swal_action = 'warning';
        }

        $("body").mLoading("hide");                                                       // 關閉mLoading圖示
        swal(swal_title ,swal_content ,swal_action, {timer:5000});                        // popOut swal + 自動關閉
    }
    // 20240314 search user_empid return email
    function search_fun(fun, search){
        let result = null;

        if(!search || (search.length < 8)){
            $("body").mLoading("hide");
            let reject_msg = "查詢 工號/部門代號 字數最少 8 個字!! 請確認："+search;
            console.log(reject_msg);
            return reject_msg;                                          // 失敗時拒絕 Promise
        } 

        $.ajax({
            url:'http://tneship.cminl.oa/api/hrdb/index.php',           // 正式2024新版
            method   :'post',
            async    : false,                                           // ajax取得數據包後，可以return的重要參數
            dataType :'json',
            data:{
                uuid         : uuid,                                    // invest
                functionname : fun,                                     // 操作功能
                emp_id       : search,                                  // 查詢對象key_word  // 使用開單人工號查詢
                sign_code    : search                                   // 查詢對象key_word  // 使用開單人工號查詢
            },
            success: function(res){
                let obj_val = res["result"];
                // 將結果進行渲染
                if (obj_val) {
                    result = (fun == 'showStaff' && obj_val.comid2 != undefined) ? obj_val.comid2 : obj_val;
                }else{
                    result = fun +" 查無[ "+ search +" ]!!";
                }
            },
            error(err){
                result = fun +"search error: "+ err;
            }
        })
        return result;                                          // 成功時解析為 true 
    }




            // 將bpm的email找出來
            function step1(bpm_obj){
                return new Promise((resolve) => {
                    Object.keys(bpm_obj).forEach((bpm_key)=>{                               // 依序處理...
                        let emp_id = bpm_obj[bpm_key].emp_id;                               // 依序 取出bpm工號
                        bpm_obj[bpm_key].email = search_fun('showStaff', emp_id);           // 查詢 showStaff
                    })
                    bpm = bpm_obj;
                    resolve(true);                                                          // 成功時解析為 true 
                });
            }
            // 把所有名單上的人頭代上email
            function step2(lists_obj){
                return new Promise((resolve) => {
                    Object.keys(lists_obj).forEach((list_key)=>{                            // 依序處理...
                        // s1.先找開單人
                            let created_emp_id = lists_obj[list_key].created_emp_id;        // 取出開單人工號
                            let created_email = search_fun('showStaff', created_emp_id);    // 查詢 showStaff
                            lists_obj[list_key].created_email = created_email;              // 帶入lists_obj
                        // s2.再找site-pm窗口
                            lists_obj[list_key].spm = [];                                   // 建立初始陣列
                            let pm_emp_id = lists_obj[list_key].pm_emp_id;                  // 取出窗口名單
                            let pm_emp_id_arr = pm_emp_id.split(',');                       // 分拆成陣列
                            for (let i = 0; i < pm_emp_id_arr.length; i += 2) {             // 依序處理...
                                let spm_emp_id = pm_emp_id_arr[i];                          // 依i序 取出窗口工號
                                let spm_email = search_fun('showStaff', spm_emp_id);        // 查詢 showStaff
                                lists_obj[list_key].spm.push({                              // 組合成Obj並帶入
                                    'emp_id' : spm_emp_id,
                                    'cname'  : pm_emp_id_arr[i + 1],
                                    'email'  : spm_email
                                })
                            }
                        // s3.把所有名單上代上dept
                            let sign_code = lists_obj[list_key].sign_code;                  // 取出sign_code
                            let signDept = search_fun('showSignDept', sign_code);           // 查詢 showSignDept
                            lists_obj[list_key].signDept = signDept;                        // 帶入lists_obj
                        // s4.將_odd反解
                            lists_obj[list_key]._odd = JSON.parse(lists_obj[list_key]._odd);// 將_odd反解
                        
                        // s5.把bpm帶入每一筆紀錄....這裡可以優化程序
                            lists_obj[list_key].bpm = bpm;                                  // 帶入bpm陣列
                    })
                    doc_lists = lists_obj;                                                  // lists_obj傾倒回主清單陣列doc_lists
                    resolve(true);                                                          // 成功時解析為 true 
                });
            }
            // notifyLists 資料清洗
            function step3(lists_obj, myCallback){
                return new Promise((resolve) => {
                    Object(lists_obj).forEach((list_i)=>{                        // 依序處理...
                        const {
                            _remaining, anis_no, _odd : { due_day }, short_name, fab_title, sign_code,
                            created_cname, created_emp_id, created_email, idty, spm, signDept, bpm
                        } = list_i;
            
                        const idty_value = {
                            '1' : '立案/簽核中',
                            '10': '完成訪談',
                            '6' : '暫存',
                            '3' : '取消'
                        }[idty] || 'NA';
            
                        const anis_no_arr = {
                            fab_title       : fab_title,
                            short_name      : short_name,
                            sign_code       : sign_code,
                            due_date        : due_day,
                            remaining_day   : _remaining,
                            idty            : idty + '_' + idty_value,
                            created_cname   : created_cname,
                            created_emp_id  : created_emp_id
                        };

                        const addToNotifyList = (i_emp_id, i_cname, i_email, i_action) => {
                            if(notifyLists[i_emp_id] == undefined){
                                notifyLists[i_emp_id] = {};
                            }
                            if(notifyLists[i_emp_id].anis_no == undefined){
                                notifyLists[i_emp_id].anis_no = {};
                            }
                            notifyLists[i_emp_id].cname = i_cname;
                            notifyLists[i_emp_id].email = i_email;
                            notifyLists[i_emp_id].anis_no[anis_no] = anis_no_arr;
                            notifyLists[i_emp_id].action = i_action;
                        };

                        const action = ( _remaining > 3) ? ['email'] : ['email', 'mapp'];

                        // console.log(anis_no, _remaining , '1.窗口、課副理 (未結案+開單人) => email');
                        // s1. 建立spm窗口名單
                            Object(spm).forEach((spm_i)=>{
                                const spm_emp_id = spm_i.emp_id
                                addToNotifyList(spm_emp_id, spm_i.cname, spm_i.email, action);
                            })

                        // s2. 課副理
                            const signDept_emp_id   = signDept.emp_id;
                            addToNotifyList(signDept_emp_id, signDept.cname, signDept.email, action);

                        // s3. 未結案+開單人
                            if(idty !== '10'){
                                addToNotifyList(created_emp_id, created_cname, created_email, action);
                            }

                        if ( _remaining <= 3 && _remaining >= 0 ){
                            // console.log(anis_no, _remaining , '2.窗口、課副理、部經理、大PM (未結案+開單人) => email + mapp')
                            // s4. 部經理
                                const signDept_up_emp_id   = signDept.up_emp_id;
                                addToNotifyList(signDept_up_emp_id, signDept.up_cname, signDept.up_email, action);

                            // s5. 建立bpm大pm名單
                                Object(bpm).forEach((bpm_i)=>{
                                    const bpm_emp_id = bpm_i.emp_id
                                    if(bpm_emp_id >= 90000000 && bpm_emp_id.includes("9000000")){  // 排除管理員+測試帳號
                                        return; 
                                    }else{
                                        addToNotifyList(bpm_emp_id, bpm_i.cname, bpm_i.email, action);
                                    }
                                })
                        } 

                        if ( _remaining < 0 ){
                            // console.log(anis_no, _remaining , '3.窗口、課副理、部經理、大PM、處長 (未結案+開單人) => email + mapp')
                            // s6. 處長
                                const signDept_uup_emp_id   = signDept.uup_emp_id;
                                addToNotifyList(signDept_uup_emp_id, signDept.uup_cname, signDept.uup_email, action);
                        }
                    })
                    resolve(myCallback(notifyLists));                            // 成功時執行myCallback，並解析為 true 
                });
            }
            // post_result 將notifyLists渲染到畫面Table
            function step4(lists_obj){
                return new Promise((resolve) => {
                    $("#notify_lists table tbody").empty();
                    let totalUsers_i = 0;                       // 計算通知筆數
                    Object.keys(lists_obj).forEach((lists_i)=>{
                        const _action = lists_obj[lists_i].action;
                        let a0 = ''
                        Object(_action).forEach((_a)=>{
                            a0 += '&nbsp'+ _a +'&nbsp<span id="'+ lists_i +'_'+ _a +'">'+'</span>';
                        })
                        const anis_no_obj = lists_obj[lists_i].anis_no;
                        let a1 = '';
                        let a2 = '';
                        let a3 = '';
                        let a4 = '';
                        let a5 = '';
                        let i  = 0;
                        Object.keys(anis_no_obj).forEach((anis_no_key)=>{
                            a1 += (i>0 ? '</br>':'') + '<span>'+ anis_no_obj[anis_no_key].fab_title +' ('+ anis_no_obj[anis_no_key].sign_code +')</span>';
                            a2 += (i>0 ? '</br>':'') + '<span>'+ anis_no_key +' ('+ anis_no_obj[anis_no_key].short_name +')</span>';
                            a3 += (i>0 ? '</br>':'') + '<span>'+ anis_no_obj[anis_no_key].due_date +' ('+ anis_no_obj[anis_no_key].remaining_day +')</span>';
                            a4 += (i>0 ? '</br>':'') + '<span>'+ anis_no_obj[anis_no_key].created_cname +' ('+ anis_no_obj[anis_no_key].created_emp_id +')</span>';
                            a5 += (i>0 ? '</br>':'') + '<span>'+ anis_no_obj[anis_no_key].idty +'</span>';
                            i++;
                        })
                        const inner_Text = '<tr>'+'<td>'+ a0 +'</td>'+'<td>'+ lists_obj[lists_i].cname +'('+ lists_i +')</td>'
                                            +'<td class="text-start">'+a1+'</td>'+'<td class="text-start">'+a2+'</td>'+'<td>'+a3+'</td>'+'<td>'+a4+'</td>'+'<td class="text-start">'+a5+'</td>'+'<td>'+i+'</td>'+'</tr>'
                        
                        notifyLists[lists_i].case_count = i;                // 將件數到回notifyLists主檔
                        $("#notify_lists table tbody").append(inner_Text);  // 渲染畫面
                        totalUsers_i++;                                     // 計算通知筆數++
                    })
                    totalUsers_length.innerText = totalUsers_i;             // 渲染通知筆數
                    resolve(true);                                          // 成功時執行myCallback，並解析為 true 
                });
            }


            // step.1 取得._todo非空值之變更作業健檢名單...參數:免
            async function p2_step1() {
                // ch.match(/[\^>V<]/);
                const load_changeTodo = await load_fun('load_changeTodo', 'load_changeTodo', 'return');  // load_fun查詢大PM bpm，並用step1找出email
                    console.log('p2_step1--load_changeTodo...', load_changeTodo);

                return(load_changeTodo); // 返回取得的資料
            }
            // step.2 將變更作業健檢名單的每一筆.todo內的Object.values(部門代號)取出成陣列...參數:由step.1取得的資料
            async function p2_step2(load_changeTodo) {
                return new Promise((resolve) => {
                    // 首先對每個員工資料使用 map()，然後透過 Object.values() 來提取 _todo 物件中的值。最後，使用 flat() 將嵌套陣列展平，得到一個包含所有 _todo 值的一維陣列。
                    const shorts = (load_changeTodo.length != 0 ) ? load_changeTodo.map(staff => Object.values(staff._todo)).flat() : [];
                    const shortsUniqueArr =  [...new Set(shorts)];                        // 年月去重
                        console.log('p2_step2--shortsUniqueArr...', shortsUniqueArr);
                
                    resolve(shortsUniqueArr); // 返回取得的資料
                });
            }
            // step.3 查找部門主管及訊息...參數:由step.2取得的資料(部門代號陣列)
            async function p2_step3(shortsUniqueArr) {
                const shortsUniqueStr = (shortsUniqueArr.length != 0 ) ? JSON.stringify(shortsUniqueArr).replace(/[\[\]]/g, '') : '';   // 把部門代號進行加工(多選)，去除外框
                    // console.log('p2_step3a--shortsUniqueStr...', shortsUniqueStr);
                const showSignDeptIn = (shortsUniqueStr != '' ) ? await load_API('showSignDeptIn', shortsUniqueStr, 'return') : [];     // load_fun查詢大PM bpm，並用step1找出email
                    console.log('p2_step3b--showSignDeptIn...', showSignDeptIn);
                
                return(showSignDeptIn); // 返回取得的資料
            }
            // step.4 找出簽核代理人...參數:由step.3取得的資料
            async function p2_step4(showSignDeptIn) {
                const staffEmpIdArr = (showSignDeptIn.length != 0 ) ? showSignDeptIn.map(staff => staff.emp_id) : [];
                    // console.log('p2_step4a--staffEmpIdArr...', staffEmpIdArr);
                const staffEmpIdStr = (staffEmpIdArr.length != 0 ) ? JSON.stringify(staffEmpIdArr).replace(/[\[\]]/g, '') : '';         // 把部門代號進行加工(多選)，去除外框
                const showDelegationIn = (staffEmpIdStr != '' ) ? await load_API('showDelegationIn', staffEmpIdStr, 'return') : [];     // load_fun查詢大PM bpm，並用step1找出email
                    console.log('p2_step4b--showDelegationIn...', showDelegationIn);
                
                return(showDelegationIn); // 返回取得的資料
            }
            // step.5 鋪設P2_table畫面 & 製作mail清單 
            async function p2_step5a(_change, _signDeptIn, _delegationIn) {
                // 停止並銷毀 DataTable
                // release_dataTable('p2_table');
                $('#p2_table tbody').empty();
                let mailArr     = [];       // 初始化mail清單

                if(_change.length === 0){
                    const table = $('#p2_table').DataTable();       // 獲取表格的 thead
                    const columnCount = table.columns().count();    // 獲取每行的欄位數量
                    const tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 沒有資料 ~ </td><tr>`;
                    $('#p2_table tbody').append(tr1);
        
                }else{
                        // div加工廠
                        function rework_todo(staff_i){
                            let _todoDIV    = {};
                                _todoDIV[0] = '';
                                _todoDIV[2] = '';
                                _todoDIV[3] = '';
                                _todoDIV[4] = '';
                                _todoDIV[5] = '';

                            if(staff_i) {
                                const { emp_id, _todo, _changeLogs } = staff_i;
                                for(const [targetMonth, OSHORT] of Object.entries(_todo)) {
                                    const _6shCheck = _changeLogs[targetMonth]._6shCheck ?? [];                 // 取得特作項目
                                    const _6shCheckStr = JSON.stringify(_6shCheck).replace(/[\[{"}\]]/g, '');   // 特作物件轉字串
                                    // 處理omager
                                    const OMAGER_i = _signDeptIn.find(omager_i => omager_i.sign_code === OSHORT);   // 從s_signDeptIn找出符合 OSHORT 的主管資料
                                    // 處理omager代簽
                                    const delegation_i = _delegationIn.find(deleg_i => deleg_i.APPLICATIONEMPID === OMAGER_i.emp_id);
                                    // 提取對應訊息
                                    let omagerDIV = []; 
                                    if (delegation_i !== undefined ){
                                        omagerDIV = {
                                            'title'  : '&nbsp;<sup class="text-danger">- 代理</sup>',
                                            'cname'  : delegation_i.DEPUTYCNAME,
                                            'emp_id' : delegation_i.DEPUTYEMPID,
                                            'email'  : delegation_i.comid2
                                        }
                                    }else{
                                        omagerDIV = {
                                            'title'  : '',  // 非代理，這裡清除
                                            'cname'  : OMAGER_i.cname,
                                            'emp_id' : OMAGER_i.emp_id,
                                            'email'  : OMAGER_i.email
                                        }
                                    }
                                    // 組合訊息
                                    _todoDIV[2] += `<div class=""           id="_todo_key,${emp_id},${targetMonth}" >${targetMonth}</div>`;                                 // 異動時間
                                    _todoDIV[3] += `<div class=""           id="_todo_value,${emp_id},${targetMonth}" >${OSHORT}&nbsp;${OMAGER_i.sign_dept ?? ''}</div>`;   // 異動部門
                                    _todoDIV[4] += `<div class="text-start" id="_6shCheck,${emp_id},${targetMonth}" >${_6shCheckStr}</div>`;                                // 特作項目
                                    _todoDIV[5] += `<div class="text-start" id="omager,${emp_id},${targetMonth}" >${omagerDIV.cname}&nbsp;(${omagerDIV.emp_id})${omagerDIV.title}</div>`;   // 部門主管
                                    _todoDIV[0] += `<div class="bg-success" id="result,${emp_id},${targetMonth}" ></div>`;
                                    // &nbsp;&nbsp;${omagerDIV.email}
                                    // 製作員工異動+特作項目訊息
                                    const staff_obj = {
                                        'cname'      : staff_i.cname,
                                        'emp_id'     : staff_i.emp_id,
                                        'changeTime' : targetMonth,
                                        'shCheck'    : _6shCheckStr,
                                        // '_docUrl'   : `${staff_i.emp_id},${targetMonth}`
                                    };
                                    // 合併到寄件訊息
                                    let mailIn = mailArr.find(omager_i => omager_i.sign_code === OSHORT);
                                    if(mailIn === undefined){   // || Object.entries(mailIn).length === 0 
                                        mailIn = {
                                            'cname'     : omagerDIV.cname,
                                            'emp_id'    : omagerDIV.emp_id,
                                            'email'     : omagerDIV.email,
                                            'sign_dept' : OMAGER_i.sign_dept,
                                            'sign_code' : OMAGER_i.sign_code,
                                            'staff_inf' : [staff_obj],
                                        }
                                        mailArr.push(mailIn);                   // 把新建的主管+員工訊息推進去
                                    }else{
                                        // mailIn['staff_inf'] = [...mailIn['staff_inf'] , ...staff_obj];
                                        mailIn['staff_inf'].push(staff_obj);    // 把新建的員工訊息推進去
                                    }
                                }
                            }
                            return {_todoDIV}; 
                        }

                    await _change.forEach((staff_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                        const {_todoDIV} = rework_todo(staff_i);
                        let tr1 = '<tr>';
                            tr1 += `<td class="" id="emp_id,${staff_i.emp_id}">${staff_i.cname ?? ''} (${staff_i.emp_id})</td>
                                    <td class="" id="_todo_key,${staff_i.emp_id}">${_todoDIV[2]}</td>
                                    <td class="" id="_todo_value,${staff_i.emp_id}">${_todoDIV[3]}</td>
                                    <td class="" id="_6shCheck,${staff_i.emp_id}">${_todoDIV[4]}</td>
                                    <td class="" id="omager,${staff_i.emp_id}">${_todoDIV[5]}</td>
                                    <td class="t-start" id="result,${staff_i.emp_id}" >${_todoDIV[0]}<div id="result_Badge,${staff_i.emp_id}"></div></td>
                                `;
                            tr1 += '</tr>';
                        $('#p2_table tbody').append(tr1);
                        // objKeys_ym = [...objKeys_ym, ...Object.keys(post_i["base"])];   // 把所有的base下的年月key蒐集起來
                        // thisMonth = targetMonth;                                        // 顯示月份&submit_btn

                        $('#p2totalUsers_length').empty().append(`${_change.length} 筆 / ${mailArr.length} 封`)
                    })
                }

                $('#nav-p2-tab').tab('show');

                // console.log('mailArr 3=>', mailArr );
                return { mailArr };
            }
            // step.6 
                        // async function mailFac( mailArr, sample_mail) {
                            
                        //     if(mailArr.length !==0){
                        //             function rework_itemA(rework_i) {
                        //                 return rework_i.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;')
                        //             }
                        //             function rework_itemB(rework_i) {
                        //                 return '<li>'+ rework_i.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;') + '</li>'
                        //             }

                        //         mailArr.forEach((mail_i) => {
                        //             const { staff_inf , email: to_email} = mail_i;
                        //             const staffDiv = staff_inf.map(staff_i =>
                        //                 `<li>${staff_i.cname} (${staff_i.emp_id}) = ${staff_i.shCheck.replace(/,/g, '、')}</li>`
                        //             );
                        //             const staffDivStr = JSON.stringify(staffDiv).replace(/[\[{",}\]]/g, '');

                        //             let mailInner = `<br>
                        //                 ${rework_itemA(sample_mail[1])}
                        //                 <ul>
                        //                     ${staffDivStr}
                        //                 </ul>
                        //                 ${rework_itemA(sample_mail[2])}<br>
                        //                 ${rework_itemA(sample_mail[3])}<br>
                        //                 ${rework_itemA(sample_mail[4])}<br>
                        //                 ${rework_itemA(sample_mail[5])}
                        //                 <ul>
                        //                     ${rework_itemB(sample_mail[61])}
                        //                     ${rework_itemB(sample_mail[62])}
                        //                     ${rework_itemB(sample_mail[71])}
                        //                     ${rework_itemB(sample_mail[72])}
                        //                     ${rework_itemB(sample_mail[73])}
                        //                     ${rework_itemB(sample_mail[81])}
                        //                     ${rework_itemB(sample_mail[82])}
                        //                 </ul>
                        //             `
                        //             $('#p2result').append(mailInner);

                        //             sendmail(to_email, sample_mail[0], mailInner)
                        //         })
                        //     }
                        // }
            async function mailFac( mailArr ) {
                
                if(mailArr.length !==0){
                        function rework_itemA(rework_i) {
                            return rework_i.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;')
                        }
                        function rework_itemB(rework_i) {
                            return '<li>'+ rework_i.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;') + '</li>'
                        }

                    const sample_mail = await load_jsonFile('sample_mail.json');

                    mailArr.forEach((mail_i) => {
                        const { staff_inf , email: to_email} = mail_i;
                        const staffDiv = staff_inf.map(staff_i =>
                            // `<li>${staff_i.cname} (${staff_i.emp_id}) = ${staff_i.shCheck.replace(/,/g, '、')}  <button type="button" title="${staff_i.cname}" onclick="window.open(this.value, '_blank', 'width=1024,height=768')" `
                            // +` value="http://tw059332n.cminl.oa/she/_downloadDoc/?emp_id=${staff_i.emp_id},${staff_i.changeTime}" >列印通知單</buton></li>`
                            `<li>${staff_i.cname} (${staff_i.emp_id}) = ${staff_i.shCheck.replace(/,/g, '、')}  <a title="${staff_i.cname}" target="_blank" `
                                +` href="http://tw059332n.cminl.oa/she/_downloadDoc/?emp_id=${staff_i.emp_id},${staff_i.changeTime}" >列印通知單</a></li>`
                        );
                        const staffDivStr = `<ul>${staffDiv.join('')}</ul>`;
                       
                        const mailInner = `${sample_mail[1]}${staffDivStr}${sample_mail[2]}${sample_mail[3]}${sample_mail[4]}${sample_mail[5]}${sample_mail[61]}${sample_mail[62]}${sample_mail[71]}${sample_mail[72]}${sample_mail[73]}${sample_mail[81]}${sample_mail[82]}`
                            // console.log(mailInner)
                        $('#p2result').append(mailInner);
                        
                        sendmail(to_email, sample_mail[0], mailInner);
                    })
                }
            }

// // 主技能--發報用 be await
    // 20240314 將訊息推送到TN PPC(mapp)給對的人~
    function push_mapp(to_emp_id, mg_msg) {
        if(fun == 'debug'){
            return true;
        }
        return new Promise((resolve, reject) => {
            $.ajax({
                url:'http://tneship.cminl.oa/api/pushmapp/index.php',       // 正式2024新版
                method:'post',
                async: false,                                               // ajax取得數據包後，可以return的重要參數
                dataType:'json',
                data:{
                    uuid    : uuid,                                         // invest
                    // eid     : to_emp_id,                                  // 傳送對象
                    eid     : '10008048',                                   // 傳送對象
                    message : mg_msg                                        // 傳送訊息
                },
                success: function(res){
                    resolve(true);                                          // 成功時解析為 true 
                },
                error: function(res){
                    console.log("push_mapp -- error：",res);
                    reject(false);                                          // 失敗時拒絕 Promise
                }
            });
        });
    }
    // 20240314 將訊息郵件發送給對的人~
    function sendmail(to_email, int_msg1_title, mg_msg){
        if(fun == 'debug'){
            return true;
        }
        return new Promise((resolve, reject) => {
            var formData = new FormData();  // 創建 FormData 物件
            // 將已有的參數加入 FormData
                formData.append('uuid', uuid);              // nurse
                formData.append('sysName', 'SHE');          // 貫名
                // formData.append('to', to_email);            // 傳送對象
                formData.append('to', 'leong.chen');           // 傳送對象
                formData.append('subject', int_msg1_title); // 信件標題
                formData.append('body', mg_msg);            // 訊息內容

            // 假設你有一個檔案輸入框，其 ID 是 'fileInput'
                var fileInput = document.getElementById('fileInput');
                if (fileInput && fileInput.files.length > 0) {
                    formData.append('file', fileInput.files[0]);  // 把檔案添加到 FormData
                }

            $.ajax({
                url:'http://tneship.cminl.oa/api/sendmail/index.php',       // 正式 202503可夾檔+html內文
                // url:'http://tneship.cminl.oa/apiTest/sendmail/index.php',               // 測式 202503可夾檔+html內文
                method:'post',
                async: false,                                               // ajax取得數據包後，可以return的重要參數
                dataType:'json',
                data: formData,
                processData: false,                                         // 不處理資料
                contentType: false,                                         // 不設置 Content-Type，讓瀏覽器自動設置
                success: function(res){
                    resolve(true);                                          // 成功時解析為 true 
                },
                error: function(res){
                    console.error("send_mail -- error：",res);
                    reject(false);                                          // 失敗時拒絕 Promise
                }
            });
        });
    }


// 主技能
    // 2024/07/23 notify_process()整理訊息、發送、顯示發送結果。
    async function notify_process(){
        mloading("show");                                                       // 啟用mLoading
        $('#result').empty();                                                   // 清空執行訊息欄位
        
        // step0.init
            var invest_url   = '事故訪談系統：'+ uri +'/invest/dashboard/';
            var int_msg1     = '【tnESH事故訪談系統】待您處理文件提醒';
            var int_msg2     = '您共有 ';
            var int_msg3     = ' 件訪問單尚未完成申報';
            var int_msg4     = '，如已處理完畢，請忽略此訊息！\n\n** 請至以下連結查看待處理文件：\n';
            var srt_msg4     = '，如已處理完畢，請忽略此訊息！\n\n';
            var int_msg5     = '\n\n溫馨提示：\n    1.登錄過程中如出現提示輸入帳號密碼，請以cminl\\NT帳號格式\n';
    
            var push_result  = {                                                // count push time to show_swal_fun
                'mapp' : {
                    'success' : 0,
                    'error'   : 0
                },
                'email' : {
                    'success' : 0,
                    'error'   : 0
                }
            }

            var totalUsers = Object.keys(notifyLists).length;                   // 獲取總用戶數量
            var completedUsers = 0;                                             // 已完成发送操作的用户数量
            var user_logs = [];                                                 // 宣告儲存Log用的 大-陣列Logs

                // _fun1.製作主要信息
                function make_msg(_value_obj){
                    // _fun1.step0. init 
                        let i         = 0;                                          // 計算anis_no陣列下的anis件數
                        let nok       = 0;                                          // 未結案
                        let emergency = 0;                                          // 小於等於 0天的急件
                        const { anis_no } = _value_obj;                             // 取出ANIS_NO這一個陣列
                        var anis_msg = '';                                          // 初始化ANIS訊息值
                    // _fun1.step1. 分拆出ANIS訊息 &#9
                        for (const [anis_k, anis_v] of Object.entries(anis_no)){     
                            const { fab_title, short_name, due_date, remaining_day, idty } = anis_v;
                            // anis信息組合
                            anis_msg += (i > 0 ? '\r\n\r\n':'') +'事故廠區/類別：'+ fab_title +' / '+ short_name +'\nANIS單號：'+ anis_k
                                    + '\n申報截止日：'+ due_date +'\n剩餘天數：'+ remaining_day + '天' +'\n表單狀態：'+ (idty == '10_結案' ? '未申報' : '未申報 / 未完成訪談' );
                            i++;
                            nok += (idty !='10_結案') ? 1 : 0 ;             // 未結案統計
                            emergency += (remaining_day <= 0 ) ? 1 : 0;     // 統計小於等於 0天的急件
                        }
                    // _fun1.step2. 組合訊息文字
                        var base_anis_msg =  int_msg2 + i + int_msg3 + (nok !=0 ? ' (其中 '+ nok + ' 件尚未完成訪談)' : '')+'\n\n'+ anis_msg;
                        var mg_msg = int_msg1 +"\r\n"+ base_anis_msg +'\n\n'+ int_msg4 + invest_url + int_msg5;
                        // 定義每一封mail title
                        var int_msg1_title = int_msg1 + " (未完成申報共"+ i +"件"+ (nok !=0 ? '，其中'+ nok +'件尚未完成訪談)' : ')');
                    // _fun1.step3. 訊息打包 
                        var mg_arr = {
                            title     : int_msg1_title,                     // 信件title
                            anis_msg  : base_anis_msg,                      // 核心訊息
                            mg_msg    : mg_msg,                             // 組合信件
                            emergency : emergency                           // 急件統計
                        }
                    return mg_arr;
                }

            var promises = [];                                                  // 存储所有异步操作的 Promise

        // step1. 將notifyLists逐筆進行分拆作業
        for (const [_key, _value] of Object.entries(notifyLists)){              // 表頭1.外層
            // step.1-0 init
            const to_cname  = String(_value.cname).trim();
            const to_email  = String(_value.email).trim();                      // 定義 to_email + 去空白
            const to_emp_id = String(_key).trim();                              // 定義 to_emp_id + 去空白
            const to_action = _value.action;

            // step.1-1 確認工號是否有誤
            if(to_emp_id.length < 8){
                // alert("工號字數有誤 !!");                                    // 避免無人職守時被alert中斷，所以取消改console.log
                // $("body").mLoading("hide");
                console.log("工號字數有誤：", user_emp_id);
                push_result['mapp']['error']++; 
                push_result['email']['error']++; 
                continue;                                                       // 使用 continue 代替 return false 以便繼續處理其他用戶

            } else if(to_emp_id >= 90000000 && to_emp_id.includes("9000000")){  // 排除管理員+測試帳號
                push_result['mapp']['success']++
                push_result['email']['success']++
                continue; 
                
            } else {
                // 宣告儲存Log內的單筆 小-物件log
                let user_log = { 
                    emp_id          : to_emp_id,
                    cname           : to_cname,
                    email           : to_email,
                    thisTime        : thisTime                                      // 小-物件log 紀錄thisTime
                };

                // step.1-2 調用_fun make_msg 帶入個人單筆紀錄進行訊息製作
                mail_msg_arr = make_msg(_value);                                
                // var logs_source = mail_msg_arr.anis_msg.replace(int_msg1, "");      // 20240514...縮減log文字內容
                // user_log['mg_msg']   = logs_source;                                 // 小-物件log 紀錄mg_msg訊息 // 20240514...縮減log文字內容
                user_log['mg_msg']    = mail_msg_arr.anis_msg;                         // 小-物件log 紀錄mg_msg訊息
                user_log['emergency'] = mail_msg_arr.emergency;                        // 小-物件log 紀錄emergency訊息
                
                // step.2 執行通知 --
                // *** 2-1 發送mail     // *** call fun.step_1 將訊息推送到TN PPC(mail)給對的人~
                    const mail_result_check = async () => {
                        let mail_result_check = (to_action.includes('email') && to_email) ? await sendmail(to_email, mail_msg_arr.title, mail_msg_arr.mg_msg) : false;
                        return mail_result_check;
                    };
                // *** 2-2 發送mapp     // *** call fun.step_1 將訊息推送到TN PPC(mapp)給對的人~
                    const mapp_result_check = async () => {
                        let mapp_result_check = (to_action.includes('mapp') && to_emp_id) ? await push_mapp(to_emp_id, mail_msg_arr.mg_msg) : false;
                        return mapp_result_check;
                    };

                // step.3 等待每個異步操作Promise...
                promises.push(
                    // 等待mapp_result_check() 和mail_result_check()都完成后再執行自定義工作...table渲染完成icon、執行訊息渲染
                    Promise.all([mapp_result_check(), mail_result_check()])
                    .then(results => {
                        const [mappResult, mailResult] = results;
                        var console_log = '';                                   // 初始化下方執行訊息
                        // 處理 mapp/mail 结果 // 標記結果顯示OK或NG，並顯示執行訊息
                        // mail處理
                            if(to_action.includes('email') && to_email){
                                user_log.mail_res = mailResult ? 'OK' : 'NG';
                                mailResult ? push_result['email']['success']++ : push_result['email']['error']++; 
                                let id_mail = document.getElementById(to_emp_id +'_email');
                                let fa_icon_mail = window['mail_' + user_log.mail_res];
                                id_mail.innerHTML = fa_icon_mail;
                                console_log = to_cname + " (" + to_emp_id + ")" + ' ...  sendMail：' + fa_icon_mail + user_log.mail_res;
                            }
                        // mapp處理
                            if(to_action.includes('mapp') && to_emp_id){
                                user_log.mapp_res = mappResult ? 'OK' : 'NG';
                                mappResult ? push_result['mapp']['success']++ : push_result['mapp']['error']++; 
                                let id_mapp = document.getElementById(to_emp_id +'_mapp');
                                let fa_icon_mapp = window['mapp_' + user_log.mapp_res];
                                id_mapp.innerHTML = fa_icon_mapp;
                                console_log += '  /  pushMapp：' + fa_icon_mapp + user_log.mapp_res;
                            }
                        // 其他自定義操作
                        $('#result').append(console_log + '</br>');                  // 自定義代碼执行 -- 執行訊息渲染 
                        user_logs.push(user_log);                                    // 將log單筆小物件 塞入 logs大陣列中
                        completedUsers++;                                            // 增加已完成发送操作的用户数量
                    })
                    .catch(error => {
                        console.log('Error:', error);
                    })
                );
            }
        }
        // step.4 等待所有異步操作完成后再向下執行...
        await Promise.all(promises);
        // step.5 確認發送筆數完成，並調用swap_toLog 將user_logs寫入autoLog
        if (completedUsers == totalUsers) {                          // 检查是否所有用户的发送操作都已完成
            swap_toLog(user_logs);                                   // 所有发送操作完成后调用 swap_toLog
        }
        // step.6 調用 show_swal_fun帶入push_result統計
        show_swal_fun(push_result);                                                         // 调用 show_swal_fun
        // 將其歸零，避免汙染
            user_logs = [];
            push_result = {
                'mapp' : {
                    'success' : 0,
                    'error'   : 0
                },
                'email' : {
                    'success' : 0,
                    'error'   : 0
                }
            }

            // $("body").mLoading("hide");                                                         // 關閉mLoading圖示
        return;
    }

    async function load_init(action){
        const _method = check3hourse(action);
        const _type = action ?  "_db" : _method;            // action來決定 false=自動判斷check3hourse 或 true=強制_db
        try {
            mloading("show");                               // 啟用mLoading

            await load_fun(_type, 'bpm, true',     step1);  // load_fun查詢大PM bpm，並用step1找出email
            await load_fun(_type, 'notify, true' , step2);  // load_fun先抓json，沒有then抓db(true/false 輸出json檔)，取得highlight內容後用step2把所有名單上的人頭代上emai
            await step3(doc_lists, step4);                  // step3資料清洗，後用step4鋪設內容

            // op_tab('user_lists');                        // 關閉清單
            $('#result').append('等待發報 : ');

            if(check_ip && fun){
                switch (fun) {
                    case 'debug':                               // debug mode，mapp&mail=>return true
                    case 'notify_process':                      // notify_process待簽發報auto_run
                        await delayedLoop(3, 'notify_process'); // delayedLoop延遲3秒後執行 notify_process：整理訊息、發送、顯示發送結果。
                        CountDown(15);                          // 倒數 15秒自動關閉視窗~
                        break;
                    default:
                        $('#result').append('function error!</br>');
                }
            }else{
                $('#result').append(' ...standBy...</br>');
            }
            $("body").mLoading("hide");

        } catch (error) {
            console.error(error);
        }
    }

    async function p2_init(action){

        const load_changeTodo  = await p2_step1();                  // step.1 取得需要體檢的員工名單 (_change._todo == 非空值)
        const shortsUniqueArr  = await p2_step2(load_changeTodo);   // step.2 把_todo下的部門代號取出來存成陣列
        const showSignDeptIn   = await p2_step3(shortsUniqueArr);   // step.3 用部門代號陣列找出部門主管簽核名單
        const showDelegationIn = await p2_step4(showSignDeptIn);    // step.4 把部門主管名單去找代理人...

        const { mailArr } = await p2_step5a(load_changeTodo, showSignDeptIn, showDelegationIn);
        console.log('mailArr 3=>', mailArr );

        const p2_send_btn = document.getElementById('p2_send_btn');
        p2_send_btn.addEventListener('click', function () {
            mailFac( mailArr );
        });

        // const _method = check3hourse(action);
        // const _type = action ?  "_db" : _method;            // action來決定 false=自動判斷check3hourse 或 true=強制_db
        try {
            // mloading("show");                               // 啟用mLoading

            // await load_fun(_type, 'notify, true' , step2);  // load_fun先抓json，沒有then抓db(true/false 輸出json檔)，取得highlight內容後用step2把所有名單上的人頭代上emai
            // await step3(doc_lists, step4);                  // step3資料清洗，後用step4鋪設內容

            // // op_tab('user_lists');                        // 關閉清單
            // $('#result').append('等待發報 : ');

            // if(check_ip && fun){
            //     switch (fun) {
            //         case 'debug':                               // debug mode，mapp&mail=>return true
            //         case 'notify_process':                      // notify_process待簽發報auto_run
            //             await delayedLoop(3, 'notify_process'); // delayedLoop延遲3秒後執行 notify_process：整理訊息、發送、顯示發送結果。
            //             CountDown(15);                          // 倒數 15秒自動關閉視窗~
            //             break;
            //         default:
            //             $('#result').append('function error!</br>');
            //     }
            // }else{
            //     $('#result').append(' ...standBy...</br>');
            // }


            $("body").mLoading("hide");

        } catch (error) {
            console.error(error);
        }
    }
    
    // document.ready啟動自動執行fun
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();             // 在任何地方啟用工具提示框
        checkPopup();                                       // 確認自己是否為彈出視窗 
        // load_init(false);
        p2_init(true);
    })
