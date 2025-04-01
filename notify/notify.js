// // 1. 工具函數 (Utility Functions)
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
                newToast.innerHTML = `<div class="d-flex"><div class="toast-body ${(type == 'success' ? 'text-white':'')}">${sinn}</div>
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
    // fun.0-5a 多功能擷取fun 新版改用fetch for local dir
    async function local_load_fun(fun, parm, myCallback) {        // parm = 參數
        // mloading(); 
        if(parm){
            try {
                let formData = new FormData();
                    formData.append('fun', fun);
                    formData.append('parm', parm);              // 後端依照fun進行parm參數的採用

                let response = await fetch('local_load_fun.php', {
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
    // 生成時間戳章 for memoCard
    function getTimeStamp(){
        var Today       = new Date();
        const thisToday = Today.getFullYear() +'/'+ String(Today.getMonth()+1).padStart(2,'0') +'/'+ String(Today.getDate()).padStart(2,'0');  // 20230406_bug-fix: 定義出今天日期，padStart(2,'0'))=未滿2位數補0
        const thisTime  = String(Today.getHours()).padStart(2,'0') +':'+ String(Today.getMinutes()).padStart(2,'0') +':'+ String(Today.getSeconds()).padStart(2,'0');                           // 20230406_bug-fix: 定義出今天日期，padStart(2,'0'))=未滿2位數補0
        const timeStamp = thisToday+' '+thisTime;
        return timeStamp;
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
            await local_load_fun('urt' , rightNow+', true' , update_reloadTime);      
        } catch (error) {
            console.error(error);
        }
    }
    // 0-3.更新畫面上reload_time時間                  // 呼叫來源：recordTime
    function update_reloadTime(rightNow){
        reload_time.innerText = rightNow;           // 更新畫面上reload_time時間
    }

    // 20240314 配合await將swal外移 +
    function show_swal_fun(push_result){
        // swal組合訊息，根據發送結果選用提示內容與符號
        var swal_title = '通知訊息';
        var swal_content = '';
        var swal_action = 'info'; // 預設為info

            function getResultContent(result, type) {
                if (result.error == 0 && result.success != 0) {
                    return `${type}成功：${result.success}`;
                } else if (result.error != 0 && result.success == 0) {
                    return `${type}失敗：${result.error}`;
                } else {
                    return `${type}成功：${result.success}、錯誤：${result.error}`;
                }
            }

        // 處理 email 部分
        swal_content += getResultContent(push_result.email, '寄送');
        swal_action = (push_result.email.error != 0 || push_result.mapp.error != 0) ? 'warning' : 'success';

        // 處理 mapp 部分
        swal_content += ' 、 ' + getResultContent(push_result.mapp, '推送');
        if (push_result.mapp.error != 0) {
            swal_action = 'warning'; // 如果有錯誤，設定為 warning
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
// // // --- 存在../change/change_notify.js    
    // // 子技能--C
        // 20240515 整理log記錄檔並轉拋toLog
            // async function swap_toLog(to_logs){}
        // 20231213 寫入log記錄檔~
            // function toLog(logs_msg){}
    // // 主技能--發報用 be await
        // 20240314 將訊息推送到TN PPC(mapp)給對的人~
            // function push_mapp(to_emp_id, mg_msg) { }
        // 20240314 將訊息郵件發送給對的人~
            // function sendmail(to_email, int_msg1_title, mg_msg){ }
    // 主技能
        // 2025/03/24 p2notify_process()整理訊息、發送、顯示發送結果。
            // async function p2notify_process(msgArr){ }
            // async function p2_init(action){ }

            // 返回最新的一筆通報數據  (原本在post_staff裡面)
            function getLatestNotification(notifyArray) {
                if (!Array.isArray(notifyArray) || notifyArray.length === 0) {
                    return null; // 如果不是陣列或陣列為空，返回 null
                }
                // 將陣列按照 to_notify 進行排序，最新的在最前面
                notifyArray.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
                // 返回最新的前一筆數據
                return notifyArray[0];
            }
            // 返回最早的第一筆通報數據  (原本在post_staff裡面)
            function getFirstNotification(notifyArray) {
                if (!Array.isArray(notifyArray) || notifyArray.length === 0) {
                    return null; // 如果不是陣列或陣列為空，返回 null
                }
                // 將陣列按照 to_notify 進行排序，最舊的在最前面
                notifyArray.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
                // 返回最早的第一筆數據-dateTime日期時間
                const _cNotifyFirst = notifyArray[0].dateTime;

                var timeDiff = 0;
                if(_cNotifyFirst !== undefined){
                    const firstDay = new Date(_cNotifyFirst);
                    const today = new Date().setHours(0, 0, 0, 0); // 設置時間為 00:00:00
                    // 計算時間戳（毫秒）
                    timeDiff = today - firstDay;
                }
                // 將毫秒轉換為天數，1天 = 24小時 * 60分鐘 * 60秒 * 1000毫秒
                const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                // 判斷背景樣式  // 超過12天，使用 bg-danger// 超過7天，使用 bg-warning   alert_it
                const bgClass = dayDiff >= 12 ? 'table-danger' : (dayDiff >= 7 ? 'table-warning' : '');

                return { dayDiff, bgClass };
            }



    // 250331 定義nav-tab [nav-p2-tab]+[nav-p3-tab]鈕功能~~
    let navP2tabClickListener;
    let navP3tabClickListener;
    async function reload_notify2_Listeners() {
        const navP2tab_btn = document.querySelector('#nav-tab #nav-p2-tab');   //  定義出p2_btn範圍
        const navP3tab_btn = document.querySelector('#nav-tab #nav-p3-tab');   //  定義出p3_btn範圍
        // 檢查並移除已經存在的監聽器
            if (navP2tabClickListener) {
                navP2tab_btn.removeEventListener('click', navP2tabClickListener);   // 移除監聽p2_btn
            }   
            if (navP3tabClickListener) {
                navP3tab_btn.removeEventListener('click', navP3tabClickListener);   // 移除監聽p3_btn
            }   
    
        // 定義新的監聽器函數p2_btn
        navP2tabClickListener = async function () {
            console.log('p2_btn')

            p2_init(false);




        }
        // 定義新的監聽器函數p3_btn
        navP3tabClickListener = async function () {
            console.log('p3_btn')






        }

        // 添加新的監聽器
        if(userInfo.role <= 1){
            navP2tab_btn.addEventListener('click', navP2tabClickListener);  // 增加監聽p2_btn
            navP3tab_btn.addEventListener('click', navP3tabClickListener);  // 增加監聽p3_btn
        }
    }

    async function load_init(action){
        const _method = check3hourse(action);
        const _type = action ?  "_db" : _method;            // action來決定 false=自動判斷check3hourse 或 true=強制_db
        try {
            mloading("show");                               // 啟用mLoading

            reload_notify2_Listeners();

            // await load_fun(_type, 'bpm, true',     step1);  // load_fun查詢大PM bpm，並用step1找出email
            // await load_fun(_type, 'notify, true' , step2);  // load_fun先抓json，沒有then抓db(true/false 輸出json檔)，取得highlight內容後用step2把所有名單上的人頭代上emai
            // await step3(doc_lists, step4);                  // step3資料清洗，後用step4鋪設內容

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
    
    // document.ready啟動自動執行fun
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();             // 在任何地方啟用工具提示框
        checkPopup();                                       // 確認自己是否為彈出視窗 
        load_init(false);
        // p2_init(true);
    })
