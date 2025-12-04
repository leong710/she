// // 子技能--C
    const uuid      = 'e65fccd1-79e7-11ee-92f1-1c697a98a75f';    // nurse
    const Today     = new Date();
    const thisToday = Today.getFullYear() +'/'+ String(Today.getMonth()+1).padStart(2,'0') +'/'+ String(Today.getDate()).padStart(2,'0');  // 20230406_bug-fix: 定義出今天日期，padStart(2,'0'))=未滿2位數補0
    const thisTime  = String(Today.getHours()).padStart(2,'0') +':'+ String(Today.getMinutes()).padStart(2,'0');                           // 20230406_bug-fix: 定義出今天日期，padStart(2,'0'))=未滿2位數補0
    var fa_OK       = '<snap class="fa_check">&nbsp<i class="fa fa-check" aria-hidden="true"></i></snap>';    // 打勾符號
    var fa_NG       = '<snap class="fa_remove">&nbsp<i class="fa fa-remove" aria-hidden="true"></i></snap>';  // 打叉符號
    var mail_OK     = '<snap class="fa_check"><i class="fa-solid fa-paper-plane"></i> </snap>';               // 寄信符號
    var mail_NG     = '<snap class="fa_remove"><i class="fa-solid fa-triangle-exclamation"></i></snap>';      // 警告符號
    var mapp_OK     = '<snap class="fa_check"><i class="fa-solid fa-comment-sms"></i> </snap>';               // 簡訊符號
    var mapp_NG     = '<snap class="fa_remove"><i class="fa-solid fa-triangle-exclamation"></i></snap>';      // 警告符號

    // 20240515 整理log記錄檔並轉拋toLog
    async function swap_toLog(to_logs){
        // 打包整理Logs的陣列
        to_logs_obj = {
            thisDay  : thisToday,
            autoLogs : to_logs
        }
        to_logs_json = JSON.stringify(to_logs_obj);                                   // logs大陣列轉JSON字串
        await toLog(to_logs_json);                                                            // *** call fun.step_2 寫入log記錄檔
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
                    sys      : 'she',
                    logs     : logs_msg,
                    t_stamp  : ''
                },
                success: function(res){
                    resolve(true);                                          // 成功時解析為 true 
                },
                error: function(res){
                    console.error("toLog -- error：", res);
                    reject(false);                                          // 失敗時拒絕 Promise
                }
            });
        });
    }
    // fun.0-9 多功能API新版改用fetch
    async function load_API(fun, parm, myCallback) {        // parm = 參數
        if(parm){
            try {
                let formData = new FormData();
                    formData.append('functionname', fun);
                    formData.append('uuid', uuid);          // nurse
                    formData.append('parm', parm);          // 後端依照fun進行parm參數的採用

                let response = await fetch('http://tneship.cminl.oa/api/hrdb/', {
                    method : 'POST',
                    body   : formData
                });

                if (!response.ok) {
                    throw new Error('fun load ' + fun + ' failed. Please try again.');
                }

                let responseData = await response.json();
                let result_obj = responseData['result'];        // 擷取主要物件

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
            console.error('error: parm lost...');
            alert('error: parm lost...');
            $("body").mLoading("hide");
        }
    }
    // 提取URL參數...呼叫getUrlParm
    function getUrlParm(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)', 'i');
        const results = regex.exec(window.location.href);
        const urlParm = results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));

        return(urlParm); // 異常情況下也需要resolve
    }
    const fun = getUrlParm('fun');    // 解析url指定參數值
    // 取得指定天數(14)後的日期(dueDay)
    async function getAddDay(thisDay , addDay){
        return new Promise((resolve) => {
            thisDay = thisDay ?? thisToday;         // 預設日期今天
            addDay  = addDay  ?? 14;                // 預設天數14天
            let date = new Date(thisToday);         // 將字符串轉換為 Date 對象
            date.setDate(date.getDate() + addDay);  // 在當前日期上加addDay天
            // 格式化結果為 YYYY/MM/DD
                let year = date.getFullYear();
                let month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是從0開始的，所以要加1
                let day = String(date.getDate()).padStart(2, '0');
            // 獲取星期幾
                let weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
                let weekDay = weekDays[date.getDay()];  // 獲取星期幾的數字，並找到對應的中文名稱
            // 組合結果日期
                let resultDate = `${year}/${month}/${day} ${weekDay}`; // 在結果中加入星期幾
            resolve(resultDate);    // 返回取得的日期
        });

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
                    eid     : to_emp_id,                                    // 傳送對象
                    // eid     : '10008048',                                   // 傳送對象
                    message : mg_msg                                        // 傳送訊息
                },
                success: function(res){
                    resolve(true);                                          // 成功時解析為 true 
                },
                error: function(res){
                    console.error("push_mapp -- error：",res);
                    reject(false);                                          // 失敗時拒絕 Promise
                }
            });
        });
    }
    // 20240314 將訊息郵件發送給對的人~
    function sendmail(to_email, int_msg1_title, mg_msg){
        if(fun == 'debug'){
            console.log('debug mode:',to_email, int_msg1_title, mg_msg);
            return true;
        }
        return new Promise((resolve, reject) => {
            var formData = new FormData();  // 創建 FormData 物件
            // 將已有的參數加入 FormData
                formData.append('uuid', uuid);              // nurse
                formData.append('sysName', 'SHE');          // 貫名
                formData.append('to', to_email);            // 1.傳送對象
                // formData.append('to', `leong.chen`);     // 3.送件-傳送測試對象
                // formData.append('cc', `leong.chen; vivi.lee; HUIHSU.HSIAO; PINK.TSA; ISHU.LIN;`);     // 4.附件-傳送測試對象
                if(userInfo.user !== undefined) {
                // formData.append('cc', `${userInfo.user};`);  // 4.副件-傳送寄件人(操作人)
                    formData.append('bcc', `leong.chen;`);      // 5.密件-傳送-管理員
                }else{
                    formData.append('cc', `leong.chen;`);       // 4.副件-傳送-管理員
                }
                console.log(int_msg1_title); 
                formData.append('subject', `${int_msg1_title}`); // 信件標題
                formData.append('body', mg_msg);            // 訊息內容

            // 假設你有一個檔案輸入框，其 ID 是 'fileInput'
                var fileInput = document.getElementById('fileInput');
                if (fileInput && fileInput.files.length > 0) {
                    formData.append('file', fileInput.files[0]);  // 把檔案添加到 FormData
                }

            $.ajax({
                url:'http://tneship.cminl.oa/api/sendmail/index.php',       // 正式 202503可夾檔+html內文
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


        // step.1 取得._todo非空值之變更作業健檢名單...參數:免
        async function p2_step1(staff_inf) {
            // ch.match(/[\^>V<]/);
            var load_changeTodo;
            if(staff_inf === false){
                load_changeTodo = await load_fun('load_changeTodo', 'load_changeTodo', 'return');   // load_fun查詢大PM bpm，並用step1找出email

            }else{
                const emp_id_lists = staff_inf.map(staff => staff.emp_id);
                const emp_id_lists_str = JSON.stringify(emp_id_lists).replace(/[\[\]]/g, '');       // 過濾重複部門代號 + 轉字串
                load_changeTodo = await load_fun('load_changeTodo', emp_id_lists_str, 'return');    // load_fun查詢大PM bpm，並用step1找出email
            }

            return(load_changeTodo); // 返回取得的資料
        }
        // 排除dDay天
        async function p2_step1a(staff_arr, dDay) {
            staff_arr.forEach((staff_i, index) => {
                const i_keys = (staff_i._todo.length != 0) ? Object.keys(staff_i._todo) : [];
                i_keys.forEach((i_targetMonth) => {
                    const _cNotify = staff_i['_content']?.[i_targetMonth]?.['notify'] ?? [];
                    if(_cNotify.length !== 0) {
                        const { dayDiff } = getFirstNotification(_cNotify);         // 取得最早的第一筆通報時間至今的日期差 & 背景色
                        if(dayDiff < dDay) {                                        // 過濾小於指定dDay天數
                            delete staff_arr[index];
                        }
                    }
                })
            })
            // 重新排序陣列，移除 undefined
            staff_arr = staff_arr.filter(item => item !== undefined);

            return staff_arr;
        }
        // step.2 將變更作業健檢名單的每一筆.todo內的Object.values(部門代號)取出成陣列...參數:由step.1取得的資料
        async function p2_step2(load_changeTodo) {
            return new Promise((resolve) => {
                // 首先對每個員工資料使用 map()，然後透過 Object.values() 來提取 _todo 物件中的值。最後，使用 flat() 將嵌套陣列展平，得到一個包含所有 _todo 值的一維陣列。
                const shorts = (load_changeTodo.length != 0) ? load_changeTodo.map(staff => Object.values(staff._todo).map(item => item.OSHORT)).flat() : [];
                const shortsUniqueArr =  [...new Set(shorts)];                        // 年月去重
            
                resolve(shortsUniqueArr); // 返回取得的資料
            });
        }
        // step.3 查找部門主管及訊息...參數:由step.2取得的資料(部門代號陣列)
        async function p2_step3(shortsUniqueArr) {
            const shortsUniqueStr = (shortsUniqueArr.length != 0 ) ? JSON.stringify(shortsUniqueArr).replace(/[\[\]]/g, '') : '';   // 把部門代號進行加工(多選)，去除外框
            const showSignDeptIn = (shortsUniqueStr != '' ) ? await load_API('showSignDeptIn', shortsUniqueStr, 'return') : [];     // load_fun查詢大PM bpm，並用step1找出email
            
            return(showSignDeptIn); // 返回取得的資料
        }
        // step.4 找出簽核代理人...參數:由step.3取得的資料
        async function p2_step4(showSignDeptIn) {
            const staffEmpIdArr = (showSignDeptIn.length != 0 ) ? showSignDeptIn.map(staff => staff.emp_id) : [];
            const staffEmpIdStr = (staffEmpIdArr.length != 0 ) ? JSON.stringify(staffEmpIdArr).replace(/[\[\]]/g, '') : '';         // 把部門代號進行加工(多選)，去除外框
            const showDelegationIn = (staffEmpIdStr != '' ) ? await load_API('showDelegationIn', staffEmpIdStr, 'return') : [];     // load_fun查詢大PM bpm，並用step1找出email
            return(showDelegationIn); // 返回取得的資料
        }
        // step.5 鋪設p2notify_table畫面 & 製作mail清單 
        async function p2_step5(_change, _signDeptIn, _delegationIn) {
            // 停止並銷毀 DataTable
            release_dataTable('p2notify_table');
            $('#p2notify_table tbody').empty();
            let mailArr     = [];       // 初始化mail清單

            if(_change.length === 0){
                const table = $('#p2notify_table').DataTable();     // 獲取表格的 thead
                const columnCount = table.columns().count();        // 獲取每行的欄位數量
                const tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 沒有資料 ~ </td><tr>`;
                $('#p2notify_table tbody').append(tr1);
    
            }else{
                // div加工廠
                function rework_content(staff_i){
                    let _todoDIV    = {};
                        _todoDIV[2] = '';   // 異動時間
                        _todoDIV[3] = '';   // 異動部門
                        _todoDIV[4] = '';   // 特作項目
                        _todoDIV[5] = '';   // 部門主管
                        _todoDIV[6] = '';
                        _todoDIV['omager'] = '';

                    if(staff_i) {
                        const { emp_id, _todo, _changeLogs } = staff_i;
                        for(const [targetMonth, { OSHORT , notify }] of Object.entries(_todo)) {
                            const _6shCheck = _changeLogs[targetMonth]._6shCheck ?? [];                 // 取得特作項目
                            const _6shCheckStr = JSON.stringify(_6shCheck).replace(/[\[{"}\]]/g, '');   // 特作物件轉字串
                            // 處理omager
                            const OMAGER_i = _signDeptIn.find(omager_i => omager_i.sign_code === OSHORT);   // 從s_signDeptIn找出符合 OSHORT 的主管資料
                            // 處理omager代簽
                            const delegation_i = _delegationIn.find(deleg_i => deleg_i.APPLICATIONEMPID === OMAGER_i.emp_id);
                            // 提取對應訊息
                            let omagerDIV = []; 
                            if (delegation_i !== undefined && delegation_i.SINGFLAG === 'Y'){           // Y=啟動代理簽核
                                omagerDIV = {
                                    'title'  : '&nbsp;<sup class="text-danger">- 代理</sup>',
                                    'cname'  : delegation_i.DEPUTYCNAME,
                                    'emp_id' : delegation_i.DEPUTYEMPID,
                                    'email'  : delegation_i.comid2
                                }
                            }else{
                                omagerDIV = {
                                    'title'  : '',  // 非代理，這裡清除
                                    'cname'  : OMAGER_i.cname  ?? null,
                                    'emp_id' : OMAGER_i.emp_id ?? null,
                                    'email'  : OMAGER_i.email  ?? null
                                }
                            }
                            // 組合訊息
                            _todoDIV[2] += `<div class=""           id="_todo_key,${emp_id},${targetMonth}" >${targetMonth}</div>`;                                 // 異動時間
                            _todoDIV[3] += `<div class=""           id="_todo_value,${emp_id},${targetMonth}" >${OSHORT}&nbsp;${OMAGER_i.sign_dept ?? ''}</div>`;   // 異動部門
                            _todoDIV[4] += `<div class="text-start" id="_6shCheck,${emp_id},${targetMonth}" >${_6shCheckStr}</div>`;                                // 特作項目
                            _todoDIV[5] += `<div class="text-start" id="omager,${emp_id},${targetMonth}" >${omagerDIV.cname}&nbsp;(${omagerDIV.emp_id})${omagerDIV.title}</div>`;   // 部門主管
                            _todoDIV[6] += `<snap class=""          id="result,${emp_id},${targetMonth},${omagerDIV.emp_id}"></snap>`;
                            _todoDIV['omager'] = omagerDIV.emp_id;

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
                                mailIn['staff_inf'].push(staff_obj);    // 把新建的員工訊息推進去
                            }
                        }
                    }
                    
                    return {_todoDIV}; 
                }

                await _change.forEach((staff_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                    const {_todoDIV} = rework_content(staff_i);
                    let tr1 = '<tr>';
                        tr1 += `<td class=""        id="emp_id,${staff_i.emp_id}">${staff_i.cname ?? ''} (${staff_i.emp_id})</td>
                                <td class=""        id="_todo_key,${staff_i.emp_id}">${_todoDIV[2]}</td>
                                <td class=""        id="_todo_value,${staff_i.emp_id}">${_todoDIV[3]}</td>
                                <td class=""        id="_6shCheck,${staff_i.emp_id}">${_todoDIV[4]}</td>
                                <td class=""        id="omager,${staff_i.emp_id}">${_todoDIV[5]}</td>
                                <td class="t-start" id="result,${staff_i.emp_id}" >${_todoDIV[6]}</td>
                            `;
                        tr1 += '</tr>';
                    $('#p2notify_table tbody').append(tr1);
                })
                p2notify_btn.disabled = mailArr.length === 0;
                reload_dataTable('p2notify_table');
            }

            $('#p2totalUsers_length').empty().append(`${_change.length} 筆 / ${mailArr.length} 封`);
            // $('#nav-p2-tab').tab('show');   // 跳頁

            return { mailArr };
        }
        // step.6 信件工廠：生成通知信，並沒有寄出...
        async function mailFac( mailArr ) {
            let mailFab_Arr = [];    
            if(mailArr.length !==0){
                const dueDay = await getAddDay() +'前';     // 取得指定天數(14)後的日期(dueDay)
                let sample_mail = await load_jsonFile('../notify/p2sample_mail.json');    // 取得mail範本
                // 替換%YMDW% 加上dueDay
                    sample_mail[0] = sample_mail[0].replace(/\%YMDW\%/g, dueDay);
                    sample_mail[2] = sample_mail[2].replace(/\%YMDW\%/g, dueDay);

                mailArr.forEach((mail_i) => {
                    const { staff_inf , email: to_email, emp_id: to_emp_id, cname: to_cname } = mail_i;
                    // 把員工繞出來 +上li
                    const staffDiv = staff_inf.map(staff_i =>
                        `<li>${staff_i.cname} (${staff_i.emp_id}) = ${staff_i.shCheck.replace(/,/g, '、')}  <a title="${staff_i.cname}" target="_blank" `
                            +` href="${uri}/she/_downloadDoc/?emp_id=${staff_i.emp_id},${staff_i.changeTime}" >列印通知單</a></li>`
                    );
                    // 員工打包後 +上外層ul
                    const staffDivStr = `<ul class="mb-0">${staffDiv.join('')}</ul>`;
                    // 組合信件 
                    const mailInner = `${sample_mail[1]}${staffDivStr}${sample_mail[2]}${sample_mail[3]}${sample_mail[4]}${sample_mail[5]}${sample_mail[61]}${sample_mail[62]}${sample_mail[71]}${sample_mail[72]}${sample_mail[73]}${sample_mail[81]}${sample_mail[82]}`
                    // 打包mail成mailFab_Arr
                    mailFab_Arr.push({
                        'to_cname'  : to_cname,
                        'to_emp_id' : to_emp_id,
                        'to_email'  : to_email,
                        'title'     : sample_mail[0],
                        'mailInner' : mailInner,
                        'staffList' : staffDivStr,
                        'staff_inf' : staff_inf
                    })
                })
            }

            return mailFab_Arr;
        }
        // step.7 2025/03/24 p2notify_process()整理訊息、發送、顯示發送結果。
        async function p2notify_process(msgArr){
            $('#notifyResult').empty();                                             // 清空執行訊息欄位
            // step0.init  
                var totalUsers = msgArr.length;                                     // 獲取總用戶數量
                var completedUsers = 0;                                             // 已完成发送操作的用户数量
                var to_logs = [];                                                   // 宣告儲存Log用的 大-陣列Logs
                var satff_mailResult = [];
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
    
            // step1. 將notifyLists逐筆進行分拆作業
            for (const _value of msgArr){              // 表頭1.外層
                // step.1-0 init
                const { to_cname, to_emp_id, to_email, title, mailInner, staffList, staff_inf } = _value;
    
                // step.1-1 確認工號是否有誤
                if(to_email === '' || to_email == undefined || to_email == null){
                    console.error("1-1.to_email有誤：", to_email);
                    alert(`1-1.to_email有誤：${to_email}`);
                    push_result['email']['error']++; 
                    continue;                                                       // 使用 continue 代替 return false 以便繼續處理其他用戶
                    
                } else if(title === '' || title == undefined || title == null) {
                    console.error("1-2.title有誤：", title);
                    alert(`1-2.title有誤：${title}`);
                    push_result['email']['error']++; 
                    continue;                                                       // 使用 continue 代替 return false 以便繼續處理其他用戶
    
                } else if(mailInner === '' || mailInner == undefined || mailInner == null) {
                    console.error("1-3.mailInner有誤：", mailInner);
                    alert(`1-3.mailInner有誤：${mailInner}`);
                    push_result['email']['error']++; 
                    continue;                                                       // 使用 continue 代替 return false 以便繼續處理其他用戶
    
                } else {
                    // 宣告儲存Log內的單筆 小-物件log
                    let to_log = { 
                        cname           : to_cname,
                        emp_id          : to_emp_id,
                        email           : to_email,
                        thisTime        : thisTime                                      // 小-物件log 紀錄thisTime
                    };
    
                    // step.1-2 調用_fun make_msg 帶入個人單筆紀錄進行訊息製作
                    to_log['mg_msg']    = staffList;                         // 小-物件log 紀錄mg_msg訊息
                    
                    // step.2 執行通知 --
                    // *** 2-1 發送mail
                    const mailResult = await sendmail(to_email, title, mailInner);   // 666很重要 -- 正式要打開才能發信
                    // const mailResult = true;    // 666很重要 -- 測試用bypass
    
                    // 執行-mail處理-訊息渲染
                        to_log.mail_res = mailResult ? 'OK' : 'NG';
                        mailResult ? push_result['email']['success']++ : push_result['email']['error']++; 
                        let fa_icon_mail = window['mail_' + to_log.mail_res];
                        var console_log = `${to_cname}(${to_emp_id}) ... sendMail：${getTimeStamp()} ... ${fa_icon_mail} ${to_log.mail_res}`;    // 初始化下方執行訊息
                        $('#notifyResult').append(console_log + '</br>');                                                   // 執行訊息渲染1下方
    
                        const omagerDivs = document.querySelectorAll(`#p2notify_table snap[id*=",${to_emp_id}"]`);
                        omagerDivs.forEach((omagerDiv) => omagerDiv.insertAdjacentHTML('beforeend', fa_icon_mail));     // 執行訊息渲染2尾部b
    
                    // 其他自定義操作
                    to_logs.push(to_log);                   // 將log單筆小物件 塞入 logs大陣列中
                    // 製作成功清單
                    Object.entries(staff_inf).forEach(([index, staff]) => {
                        staff.from_cname = userInfo.cname,  // 誰通知
                        staff.to_cname   = to_cname,        // 通知誰
                        staff.to_emp_id  = to_emp_id,       // 誰的工號
                        // staff.to_email = to_email,       // 誰的信箱
                        staff.dateTime = getTimeStamp();    // 通知時間
                        staff.result = mailResult;          // 通知結果
    
                        satff_mailResult.push(staff);       // 推到主要陣列
                    });
    
                    completedUsers++;                       // 增加已完成发送操作的用户数量
                }
            }
    
            // step.5 確認發送筆數完成，並調用swap_toLog 將to_logs寫入autoLog
            if (completedUsers == totalUsers) {             // 检查是否所有用户的发送操作都已完成
                swap_toLog(to_logs);                        // 所有发送操作完成后调用 swap_toLog
            }
            // step.6 調用 show_swal_fun帶入push_result統計
            show_swal_fun(push_result);                     // 调用 show_swal_fun
            // 將其歸零，避免汙染
                to_logs = [];
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
    
            return satff_mailResult;    // 返回特作員工清單
        }


    // 主技能
    // step.5A 執行mail生成+寄送
    async function p2notify_mailSend(mailArr, parm){
        mloading("show");
        const msgArr = await mailFac( mailArr );                                                // step.6 生成mail
        const satff_mailResult = (msgArr.length !== 0) ? await p2notify_process(msgArr) : [];   // step.7 發送處理
        if(satff_mailResult.length !== 0){
            const staff_inf_str = JSON.stringify({ staff_inf : satff_mailResult });             // 打包同仁的發報紀錄
            const result = await load_fun('bat_updateStaffNotify', staff_inf_str, 'return');    // 儲存同仁的發報紀錄 ** load_fun的變數傳遞要用字串
            inside_toast(result.content, 3000, result.action);
            
            if(result.action === 'success' && parm !== false ){
                post_staff(staff_inf, mergedData_inf, shItemArr_inf);                           // 更新畫面=重新鋪設Page3
            }
        }
        $("body").mLoading("hide");
    }

    async function p2_init(parm){
        mloading("show");
        const request = parm ? staff_inf : false;

        if(parm){ // 清除頁面上逗留的訊息
            $('#p2notify_table tbody').empty();
        }

        try {
            // a1.前置作業...
            const p2_tbody = Array.from(document.querySelectorAll('#p2notify_table tbody tr'));                 // 取得tbody內容
            if(p2_tbody.length === 0){                                                                          // 確認tbody是否有內容：沒有=就建立；有=沒事
                const load_changeTodo   = await p2_step1(request);                                              // step.1 取得需要體檢的員工名單 (_change._todo == 非空值)
                const load_changeTodo14 = await p2_step1a(load_changeTodo, 14);                                 // step.1a 排除14天dDay
                const shortsUniqueArr   = await p2_step2(load_changeTodo14);                                    // step.2 把_todo下的部門代號取出來存成陣列
                const showSignDeptIn    = await p2_step3(shortsUniqueArr);                                      // step.3 用部門代號陣列找出部門主管簽核名單
                const showDelegationIn  = await p2_step4(showSignDeptIn);                                       // step.4 把部門主管名單去找代理人...
                const { mailArr }       = await p2_step5(load_changeTodo14, showSignDeptIn, showDelegationIn);  // 鋪設p2notify_table畫面 & 製作mail清單
                const p2notify_btn      = document.getElementById('p2notify_btn');
                p2notify_btn.addEventListener('click', async function () {
                    p2notify_mailSend(mailArr, parm);                                                           // step.5A 執行mail生成+寄送; parm=true=>更新畫面
                });
                $('#notifyResult').append(' ...P2 standBy...</br>');
            }

            // a2.確認後續作業...是否自動進行寄送mail
            const check_ipp = true;                 // 假設check_id=true
            if(check_ipp && fun){                   // 卡關
                // step.1 張貼橫幅
                let message  = `*** <b>請注意&nbsp已啟動&nbsp;<u>${fun}</u>&nbsp;功能執行!!</b>&nbsp;~`;
                Balert( message, 'warning');

                switch (fun) {                      // 篩選功能
                    case 'debug':                               // debug mode，mapp&mail=>return true
                    case 'p2notify_mailSend':                   // p2notify_mailSend待簽發報auto_run
                        // await delayedLoop(3, 'p3notify_mailSend');                   // delayedLoop延遲3秒後執行 p3notify_mailSend：整理訊息、發送、顯示發送結果。
                        // step.2 觸發傳送mail功能
                        const p2notify_btn = document.getElementById('p2notify_btn');   // 定義出p2notify_btn範圍
                              p2notify_btn.dispatchEvent(new Event('click'));           // 手動觸發 click 事件
                              
                        CountDown(15);                                                  // 倒數 15秒自動關閉視窗~
                        break;

                    default:
                        $('#notifyResult').append('function error!</br>');
                }
            }
            
        } catch (error) {
            console.error(error);
        }

        $("body").mLoading("hide");
    }