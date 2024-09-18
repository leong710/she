// // 1. 工具函數 (Utility Functions)
    const currentYear = String(new Date().getFullYear());                           // 取得當前年份
    const preYear     = String(currentYear - 1);                                    // 取得去年年份
    // fun.0-1: Bootstrap Alarm function
    function Balert(message, type) {
        var alertPlaceholder = document.getElementById("liveAlertPlaceholder")      // Bootstrap Alarm
        var wrapper = document.createElement('div')
        wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message 
                            + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        alertPlaceholder.append(wrapper)
    }
    // fun.0-2：吐司顯示字條 +堆疊
    function inside_toast(sinn){
        // 創建一個新的 toast 元素
        var newToast = document.createElement('div');
            newToast.className = 'toast align-items-center bg-warning';
            newToast.setAttribute('role', 'alert');
            newToast.setAttribute('aria-live', 'assertive');
            newToast.setAttribute('aria-atomic', 'true');
            newToast.setAttribute('autohide', 'true');
            newToast.setAttribute('delay', '1000');

            // 設置 toast 的內部 HTML
            newToast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">${sinn}</div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;

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
    // fun.0-3: swal
    function show_swal_fun(swal_value){
        return new Promise((resolve) => {  
            $("body").mLoading("hide");
            if(swal_value && swal_value['fun'] && swal_value['content'] && swal_value['action']){
                if(swal_value['action'] == 'success'){
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.href = url});          // n秒后回首頁
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{closeWindow(true)});                                          // 手動關閉畫面
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{closeWindow(true); resolve();});  // 2秒自動關閉畫面; 載入成功，resolve
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.reload(); resolve();});  // 2秒自動 刷新页面;載入成功，resolve
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{resolve();});  // 2秒自動 載入成功，resolve
                } else if(swal_value['action'] == 'warning' || swal_value['action'] == 'info'){   // warning、info
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{resolve();}); // 載入成功，resolve

                } else {                                        // error
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{history.back();resolve();}); // 手動回上頁; 載入成功，resolve
                }
            }else{
                console.error("Invalid swal_value:", swal_value);
                location.href = url;
                resolve(); // 異常情況下也需要resolve
            }
        });
    }
        // fun.0-4b: 停止並銷毀 DataTable
        function release_dataTable(){
            return new Promise((resolve) => {
                let table = $('#hrdb_table').DataTable();
                    table.destroy();
                resolve();      // 當所有設置完成後，resolve Promise
            });
        }
    // fun.0-4a: dataTable
    async function reload_dataTable(hrdb_data){
        // dataTable 2 https://ithelp.ithome.com.tw/articles/10272439
        return new Promise((resolve) => {
            release_dataTable();        // 呼叫[fun.0-4b] 停止並銷毀 DataTable
            // 重新初始化 DataTable
            $('#hrdb_table').DataTable({
                "language": { url: "../../libs/dataTables/dataTable_zh.json" }, // 中文化
                "autoWidth": false,                                             // 自動寬度
                "order": [[ 2, "asc" ], [ 1, "asc" ], [ 0, "asc" ]],            // 排序
                // "order": [[ 0, "asc" ], [ 1, "asc" ], [ 2, "asc" ]],            // 排序
                "pageLength": 25,                                               // 顯示長度
                    // "paging": false,                                             // 分頁
                    // "searching": false,                                          // 搜尋
                    // "data": hrdb_data,
                    // "columns": [
                    //             { data: 'emp_sub_scope' }, 
                    //             { data: 'dept_no' }, 
                    //             { data: 'emp_dept' }, 

                    //             { data: null , // title: 'emp_id', 
                    //                 render: function (data, type, row) {
                    //                     return `${emp_i.emp_id}</br><button type="button" class="btn btn-outline-primary add_btn " name="emp_id" value="${data.emp_id}" 
                    //                         data-bs-toggle="modal" data-bs-target="#import_shLocal" onclick="reNew_empId(this.value)">${data.cname}</button>`
                    //                 } }, 
                    //             { data: 'cname' }, 
                    //             { data: null , title: '工作場所', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } }, 
                    //             { data: null , title: '工作內容', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } }, 
                    //             { data: null , title: '均能音量', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } }, 
                    //             { data: null , title: '平均音壓', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } }, 
                    //             { data: null , title: '每日曝露時數', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } }, 
                    //             { data: null , title: '檢查類別代號', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } },
                    //             { data: null , title: '噪音作業判斷', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } },
                    //             { data: null , title: '特殊健檢資格驗證', 
                    //                 render: function (data, type, row) {
                    //                     return ``
                    //                 } },
                    //             { data: 'HIRED' , title: '到職日'},
                //     ]
            });
            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    // fun.0-5 多功能擷取fun 新版改用fetch
    async function load_fun(fun, parm, myCallback) {        // parm = 參數
        mloading(); 
        if(parm){
            try {
                let formData = new FormData();
                    formData.append('fun', fun);
                    formData.append('parm', parm);                  // 後端依照fun進行parm參數的採用

                let response = await fetch('load_fun.php', {
                    method : 'POST',
                    body   : formData
                });

                if (!response.ok) {
                    throw new Error('fun load ' + fun + ' failed. Please try again.');
                }

                let responseData = await response.json();
                let result_obj = responseData['result_obj'];    // 擷取主要物件
                return myCallback(result_obj);                  // resolve(true) = 表單載入成功，then 呼叫--myCallback
                                                                // myCallback：form = bring_form() 、document = edit_show() 、
            } catch (error) {
                $("body").mLoading("hide");
                throw error;                                    // 載入失敗，reject
            }
        }
    }

    
// // 2. 數據操作函數 (Data Manipulation Functions)
    // [p-0]
        // 240823 將匯入資料合併到shLocal_inf
        async function mgInto_shLocal_inf(new_shLocal_arr){
            Object.keys(new_shLocal_arr).forEach((new_sh_key) => {
                new_shLocal_arr[new_sh_key]['HE_CATE'] = JSON.parse(new_shLocal_arr[new_sh_key]['HE_CATE']);
            })
            // 240826 進行shLocal_inf重複值的比對並合併
            shLocal_inf = shLocal_inf.concat(new_shLocal_arr);   // 合併
            let uniqueMap = new Map();                           // 使用 Map 來去重

            shLocal_inf.forEach(item => {
                let key = `${item.id}-${item.OSHORT}`;
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, item);
                }
            });
            // 將結果轉換為陣列
            shLocal_inf = Array.from(uniqueMap.values());
                // console.log('2-mgInto_shLocal_inf--shLocal_inf...', shLocal_inf);
            await post_shLocal(shLocal_inf)
        }
            // 240904 shCase 去重...
            async function removeDuplicateShCase(shCaseArray) {
                console.log('removeDuplicateShCase...',shCaseArray);
                const uniqueShCaseMap = new Map();
                await shCaseArray.forEach(item => {
                    // 建立一個唯一標識符，根據所有屬性值來生成
                    const uniqueKey = JSON.stringify(item);
                    // 如果唯一標識符已存在，則忽略此項目；否則，將其添加到Map中
                    if (!uniqueShCaseMap.has(uniqueKey)) {
                        uniqueShCaseMap.set(uniqueKey, item);
                    }
                });
                // 將 Map 轉換回陣列
                console.log(Array.from(uniqueShCaseMap.values()));
                return Array.from(uniqueShCaseMap.values());
            }
        // 240822 將匯入資料合併到staff_inf
        async function mgInto_staff_inf(source_json_value_arr){
            // const source_json_value_arr = JSON.parse(source_json_value);
            // console.log('2.source_json_value_arr...', source_json_value_arr);
            const addIn_arr1 = ['HE_CATE', 'HE_CATE_KEY', 'no'];                                        // 合併陣列1
            const addIn_arr2 = {'OSTEXT_30':'emp_sub_scope', 'OSHORT':'dept_no', 'OSTEXT':'emp_dept'};  // 合併陣列2
            const source_OSHORT_arr = [];

            for (const e_key of Object.keys(source_json_value_arr)) {
                // 初始化 shCase 陣列
                if (!source_json_value_arr[e_key]['shCase']) { source_json_value_arr[e_key]['shCase'] = []; }         // 特作案件紀錄陣列建立
                if (!source_json_value_arr[e_key]['eh_time']) { source_json_value_arr[e_key]['eh_time'] = null; }     // eh_time在這裡要先建立，避免驗證錯誤跳脫
                // 建立一個新的物件來儲存合併的資料
                let mergedData = {};
                // 遍歷合併陣列1 addIn_arr1 並合併數據
                addIn_arr1.forEach((addIn_i) => {
                    if (source_json_value_arr[e_key][addIn_i]) {
                        mergedData[addIn_i] = source_json_value_arr[e_key][addIn_i];     // 合併
                        delete source_json_value_arr[e_key][addIn_i];                    // 刪除合併後的屬性
                    }
                });
                // 遍歷合併陣列2 addIn_arr2 並合併數據
                for (const [a2_key, a2_value] of Object.entries(addIn_arr2)) {
                    if (source_json_value_arr[e_key][a2_value]) {
                        mergedData[a2_key] = source_json_value_arr[e_key][a2_value];     // 合併...有bug
                        if(a2_key=='OSHORT'){
                            source_OSHORT_arr.push(source_json_value_arr[e_key][a2_value])  // extra: 取得部門代號 => 抓特危場所清單用
                        }
                    }
                }
                // 將合併後的物件加入 shCase 陣列中
                if( Object.keys(mergedData).length > 0 && mergedData['HE_CATE']){       // 限制要有'HE_CATE'檢查類別代號才能合併
                    source_json_value_arr[e_key]['shCase'].push(mergedData);
                    // 使用 await 調用 removeDuplicateShCase 去重
                    source_json_value_arr[e_key]['shCase'] = await removeDuplicateShCase(source_json_value_arr[e_key]['shCase']);
                }
            };
            // 240826 進行emp_id重複值的比對並合併
                let combined = staff_inf.concat(source_json_value_arr);                                  // 合併2個陣列到combined
                let uniqueStaffMap = new Map();                                                         // 創建一個 Map 來去除重複的 emp_id 並合併 shCase
                await combined.forEach(item => {
                    if (uniqueStaffMap.has(item.emp_id)) {
                        // 如果 emp_id 已經存在，則合併 shCase 和 shCondition
                        let existingShCase      = uniqueStaffMap.get(item.emp_id).shCase;
                        let existingShCondition = uniqueStaffMap.get(item.emp_id).shCondition || {};    // 初始化 shCondition 為空物件
                        let existingShCase_logs = uniqueStaffMap.get(item.emp_id).shCase_logs || {};    // 初始化 shCase_logs 為空物件
                        let existing_content    = uniqueStaffMap.get(item.emp_id)._content || {};       // 初始化 _content 為空物件
                        
                        // 合併 shCase
                        uniqueStaffMap.get(item.emp_id).shCase = existingShCase.concat(item.shCase);

                        // 合併 shCondition
                        if (item.shCondition) {
                            Object.assign(existingShCondition, item.shCondition);
                            uniqueStaffMap.get(item.emp_id).shCondition = existingShCondition;
                        }
                        // 合併 shCase_logs
                        if (item.shCase_logs) {
                            Object.assign(existingShCase_logs, item.shCase_logs);
                            uniqueStaffMap.get(item.emp_id).shCase_logs = existingShCase_logs;
                        }
                        // 合併 _content
                        if (item._content) {
                            Object.assign(existing_content, item._content);
                            uniqueStaffMap.get(item.emp_id)._content = existing_content;
                        }

                    } else {
                        // 如果 emp_id 不存在，則新增
                        uniqueStaffMap.set(item.emp_id, item);

                        // 確保 shCondition 被初始化
                        // 獲取當年年份currentYear
                        if (!item.shCondition) {  item.shCondition = {};  }
                        if (!item.shCase_logs) {  item.shCase_logs = {};  }
                        if (!item._content) {  item._content = {};  }
                        if (!item._content[`${currentYear}`]) {  item._content[`${currentYear}`] = [];  }
                    }
                });
                // 將 Map 轉換回陣列
                staff_inf = Array.from(uniqueStaffMap.values());
                        console.log('2.mgInto_staff_inf--staff_inf...', staff_inf);

            // *** 精煉 shLocal 
                const source_OSHORTs_str = (JSON.stringify([...new Set(source_OSHORT_arr)])).replace(/[\[\]]/g, ''); // 過濾重複部門代號 + 轉字串
                if(source_OSHORTs_str !==''){
                    await load_fun('load_shLocal', source_OSHORTs_str, mgInto_shLocal_inf);         // 呼叫load_fun 用 部門代號字串 取得 特作清單 => mgInto_shLocal_inf合併shLocal_inf
                }

            resetINF(false);    // 重新架構：停止並銷毀 DataTable、step-1.選染到畫面 hrdb_table、step-1-2.重新渲染 shCase&判斷、重新定義HE_CATE td、讓指定按鈕 依照staff_inf.length 啟停 
        }
        // 240826 單筆刪除Staff資料
        async function eraseStaff(removeEmpId){
            if(!confirm(`確認刪除此筆(${removeEmpId})資料？`)){
                return;
            }else{
                // 創建一個 Map 來去除重複的 emp_id 並合併 shCase
                let uniqueStaffMap = new Map();
                staff_inf.forEach(item => {
                    if (item.emp_id === removeEmpId) {  // 跳過這個 emp_id，達到刪除的效果
                        return;
                    }
                    if (uniqueStaffMap.has(item.emp_id)) {
                        // 如果 emp_id 已經存在，則合併 shCase
                        let existingShCase = uniqueStaffMap.get(item.emp_id).shCase;
                        uniqueStaffMap.get(item.emp_id).shCase = existingShCase.concat(item.shCase);
                    } else {
                        // 如果 emp_id 不存在，則新增
                        uniqueStaffMap.set(item.emp_id, item);
                    }
                });

                // 將 Map 轉換回陣列
                staff_inf = Array.from(uniqueStaffMap.values());

                resetINF(false);    // 重新架構：停止並銷毀 DataTable、step-1.選染到畫面 hrdb_table、step-1-2.重新渲染 shCase&判斷、重新定義HE_CATE td、讓指定按鈕 依照staff_inf.length 啟停 
                inside_toast(`刪除單筆資料${removeEmpId}...Done&nbsp;!!`);
            }
        }
        // 240904 load_staff_byDeptNo       ；call from mk_dept_nos_btn()...load_fun(myCallback)...
        async function rework_loadStaff(loadStaff_arr){
            loadStaff_tmp = [];     // 清空臨時陣列...
            //step1. 依工號查找hrdb，帶入最新員工資訊 到 staff_inf
            for (const [s_index, s_value] of Object.entries(loadStaff_arr)) {
                const select_empId = (s_value['emp_id'] !== undefined) ? s_value['emp_id'] : null;      // step1-1.取出emp_id
                const empData = staff_inf.find(emp => emp.emp_id === select_empId);                     // step1-2.查找staff_inf內該員工是否存在
                if(!empData){                                                                           // step1-3.沒資料就進行hrdb查詢
                    await search_fun('rework_loadStaff', select_empId);                                 // 確保每次search_fun都等待完成
                }
            }
            // step2.等待上面搜尋與合併臨時欄位loadStaff_tmp完成後...
            for (const [s_index, s_value] of Object.entries(loadStaff_tmp)) {
                const select_empId = (s_value['emp_id'] !== undefined) ? s_value['emp_id'] : null;      // step2-1.取出emp_id
                let empData = loadStaff_arr.find(emp => emp.emp_id === select_empId);                   // step2-2. 先取得select_empId的個人資料=>empData
                // empData = empData.concat(loadStaff_tmp[s_index]);                                        // 合併2個陣列
                empData = empData ? empData : {};                                                       // step2-3. 確保 empData 是陣列，否則初始化為空陣列
                Object.assign(empData, loadStaff_tmp[s_index]);                                         // step2-4. 如果 empData 是一個物件而不是陣列，需要將其轉換成陣列或合併物件
            }
            mgInto_staff_inf(loadStaff_arr);
            inside_toast('彙整&nbsp;員工資料...Done&nbsp;!!');
            $('#nav-p2-tab').tab('show');                                       // 切換頁面

        }
        // 240904 將loadStaff進行欄位篩選與合併到臨時陣列loadStaff_tmp    ；call from search_fun()
        async function rework_staff(searchStaff_arr){
            return new Promise((resolve) => {
                Object.entries(searchStaff_arr).forEach(([index, staffValue]) => {
                    const rework_staff = {
                        // 'emp_sub_scope' : staffValue.emp_sub_scope.replace(/ /g, '&nbsp;'),
                        'emp_sub_scope' : staffValue.emp_sub_scope,
                        'emp_id'        : staffValue.emp_id,
                        'cname'         : staffValue.cname,
                        'dept_no'       : staffValue.dept_no,
                        'emp_dept'      : staffValue.emp_dept,
                        'HIRED'         : staffValue.HIRED,
                        'cstext'        : staffValue.cstext,
                        'gesch'         : staffValue.gesch,
                        'emp_group'     : staffValue.emp_group,
                        'natiotxt'      : staffValue.natiotxt,
                        'schkztxt'      : staffValue.schkztxt
                    };
                    loadStaff_tmp = loadStaff_tmp.concat(rework_staff);   // 合併2個陣列到combined
                })
                resolve();  // 當所有設置完成後，resolve Promise
            });
        }
        // 重新架構
        async function resetINF(request){
            if(request){
                staff_inf     = [];
                shLocal_inf   = [];
                loadStaff_tmp = [];
            }
            await release_dataTable();                  // 停止並銷毀 DataTable
            await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
            await post_preYearShCase(staff_inf);        // step-1-1.重新渲染去年 shCase&判斷
            await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
            await reload_HECateTable_Listeners();       // 重新定義HE_CATE td
            await btn_disabled();                       // 讓指定按鈕 依照staff_inf.length 啟停 
        }
        // 讓指定按鈕 依照staff_inf.length 啟停
        function btn_disabled(){
            return new Promise((resolve) => {
                download_excel_btn.disabled = staff_inf.length === 0;  // 讓下載按鈕啟停
                bat_storeStaff_btn.disabled = staff_inf.length === 0;  // 讓儲存按鈕啟停
                resetINF_btn.disabled       = staff_inf.length === 0;  // 讓清除按鈕啟停
                resolve();
            });
        }

        // 根據 select_empId 清空對應的 DOM區域 for p-2特作欄位
        async function clearDOM(empId, targetYear) {
            return new Promise((resolve) => {
                targetYear = (targetYear == undefined) ? currentYear : targetYear;
                // 使用屬性選擇器選取所有包含 empId 的 td 元素
                const tdsToClear = document.querySelectorAll(`div[id*=",${empId},${targetYear}"]`);
                // 遍歷這些選取到的元素並清空內容
                tdsToClear.forEach(div => {
                    div.innerHTML = '';
                });
                resolve();  // 當所有設置完成後，resolve Promise
            });
        }
        // 通用的函數，用於更新 DOM (1by1) for p-2特作欄位 (含 噪音、新人特殊 驗證)
        async function updateDOM(sh_value, select_empId, sh_key_up) {
            return new Promise((resolve) => {
                // step.1 先取得select_empId的個人資料=>empData
                const empData = staff_inf.find(emp => emp.emp_id === select_empId);
                const i_index = sh_key_up - 1;  // ?
                // 防止套入時錯誤，建立[資格驗證]shCondition紀錄判斷物件
                if(empData['shCondition'] == undefined || empData['shCondition'].length == 0){
                    empData.shCondition = {
                        "noise"   : false,          // 噪音判定
                        "newOne"  : false,          // 新人
                        "regular" : false,          // 定期
                        "change"  : false           // 變更
                    };   
                }
                // step.2 欲更新的欄位陣列
                const shLocal_item_arr = ['MONIT_LOCAL', 'WORK_DESC', 'HE_CATE', 'AVG_VOL', 'AVG_8HR', 'eh_time'];
                // step.2 將shLocal_item_arr循環逐項進行更新
                shLocal_item_arr.forEach((sh_item) => {
                    if (sh_value[sh_item] !== undefined) {      // 確認不是找不到的項目
                        // step.2a 項目渲染...
                        const br = sh_key_up > 1 ? '<br>' : ''; // 判斷 1以上=換行
                        let inner_Value = '';
                        if (sh_item === 'HE_CATE'){             // 3.類別代號 特別處理：1.物件轉字串、2.去除符號
                            let he_cate_str = JSON.stringify(sh_value[sh_item]).replace(/[{"}]/g, '');
                            inner_Value = `${br}${he_cate_str}`;
                        }else if(sh_item.includes('AVG')){      // 4.5.均能音壓、平均音壓 特別處理：判斷是空值，就給他一個$nbsp;佔位
                            let avg_str = sh_value[sh_item] ? sh_value[sh_item] : '&nbsp;';
                            inner_Value = `${br}${avg_str}`;
                        }else if(sh_item === 'MONIT_LOCAL'){      // 特別處理：MONIT_LOCAL
                            inner_Value = `${br}${sh_value['OSTEXT_30']}&nbsp;${sh_value[sh_item]}`;
                        }else{                                  // 1.2.6
                            inner_Value = `${br}${sh_value[sh_item]}`;
                        }
                        document.getElementById(`${sh_item},${select_empId},${currentYear}`).insertAdjacentHTML('beforeend', inner_Value);     // 渲染各項目
    
                        // step.2b 噪音驗證
                        if (sh_item === 'HE_CATE' && Object.values(sh_value['HE_CATE']).includes('噪音') && (sh_value['AVG_VOL'] || sh_value['AVG_8HR'])) {
                            // 2b1. 檢查元素是否存在+是否有值
                                const eh_time_input = document.querySelector(`input[id="eh_time,${select_empId},${currentYear}"]`);
                                const eh_time_input_value = (eh_time_input && eh_time_input.value) ? eh_time_input.value : null;
                            // 2b2. 個人shCase的噪音中，假如有含eh_time值，就導入使用。
                                const eh_time = (empData['eh_time'])  ? empData['eh_time']  : eh_time_input_value;
                                const avg_vol = (sh_value['AVG_VOL']) ? sh_value['AVG_VOL'] : false;
                                const avg_8hr = (sh_value['AVG_8HR']) ? sh_value['AVG_8HR'] : false;
                                // console.log('eh_time, eh_time_input_value...', select_empId, eh_time, eh_time_input_value)
                                eh_time_input.value = (!eh_time_input_value) ? eh_time : eh_time_input_value;    // 判斷eh_time輸入格是否一致，強行帶入顯示~
                            // 2b3. 呼叫[fun]checkNoise 取得判斷結果
                                const noise_check = checkNoise(eh_time, avg_vol, avg_8hr);     
                                // const noise_check_str = `${br}${sh_key_up}:&nbsp;A-${noise_check.aSample}&nbsp;B-${noise_check.bSample}&nbsp;C-${noise_check.cCheck}`; // 停用顯示 aSample bSample
                                const noise_check_str = `${br}${noise_check.cCheck}`;   // 這裡只顯示cCheck判斷結果
                            document.getElementById(`NC,${select_empId},${currentYear}`).insertAdjacentHTML('beforeend', noise_check_str);     // 渲染噪音判斷
    
                            // 2b4. 紀錄個人(噪音)特檢資格shCondition['Noise']...是=true；未達、不適用=false
                                // empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : empData['shCondition']['noise'];
                            empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : false;
                        }
                    }
                });

                resolve();  // 當所有設置完成後，resolve Promise
            });
        }
        // 更新驗證項目(1by1)   3 新人特殊驗證、4 進行部門代號dept_no的變更檢查
        async function doCheck(select_empId){
            // step.1 先取得select_empId的個人資料=>empData
                const empData = staff_inf.find(emp => emp.emp_id === select_empId);

            // step.3 新人特殊驗證：呼叫[fun]checkNewOne 取得判斷結果
                const hired = (empData['HIRED'] != undefined) ? empData['HIRED'] : false;
                empData['shCondition']['newOne'] = (hired) ? checkNewOne(hired)  : false;

            // step.4 進行部門代號dept_no的變更檢查
                // 取得當前年份currentYear -1 = 去年preYear  ** asIs_deptNo / toBe_deptNo：要注意是否in_array(特作區域) 
                // 取得去年的部門代號：
                let asIs_deptNo = false;
                if(empData.shCase_logs[preYear] !== undefined){
                    asIs_deptNo = (empData.shCase_logs[preYear]['dept_no'] !== undefined) ? empData.shCase_logs[preYear]['dept_no'] : false;
                }
                // 取得今年的部門代號：
                const toBe_deptNo = (empData.dept_no !== undefined) ? empData.dept_no : false;
                // 驗證並帶入shCondidion.change
                empData['shCondition']['change'] = (asIs_deptNo && toBe_deptNo) ? checkChange(asIs_deptNo, toBe_deptNo) : false;
                // 假如真的是轉調單位：
                if(empData['shCondition']['change']){
                    // 1.渲染轉調
                    // const emp_sub_scope = empData.shCase_logs[preYear]['emp_sub_scope'];    // 取得去年廠別
                    // const emp_dept      = empData.shCase_logs[preYear]['emp_dept'];         // 取得去年部門名稱
                    // const change_inner_Value = emp_sub_scope+'_'+emp_dept+'('+asIs_deptNo+')轉出';  // 組合轉調訊息
                    const asIs_deptNo_check = await in_arrayKey(asIs_deptNo) ? `${asIs_deptNo} 特危轉出` : `${asIs_deptNo} 轉出`;    // 確認是否在[特危場所名單]
                    const toBe_deptNo_check = await in_arrayKey(toBe_deptNo) ? `轉入特危 ${toBe_deptNo}` : `轉入 ${toBe_deptNo}`;    // 確認是否在[特危場所名單]
                    const change_inner_Value = `<div class="change_">${asIs_deptNo_check}<br>${toBe_deptNo_check}</div>`;  // 組合轉調訊息
                    document.getElementById(`change,${select_empId},${currentYear}`).innerText = '';               // 清空innerText內容
                    document.getElementById(`change,${select_empId},${currentYear}`).insertAdjacentHTML('beforeend', change_inner_Value);     // 渲染轉調
                }
            // step.5 
            const shCase = (empData['shCase'] != undefined) ? empData['shCase'] : false;
            empData['shCondition']['regular']  = (shCase) ? checkRegular(shCase) : false;
            // console.log(asIs_deptNo, toBe_deptNo, checkChange(asIs_deptNo, toBe_deptNo), empData['shCondition']);
        }
        // 更新資格驗證(1by1)
        async function updateShCondition(ShCondition_value, select_empId, targetYear) {
            return new Promise((resolve) => {
                // step1.處理[資格驗證]shCondition欄位
                // let inner_Value = JSON.stringify(ShCondition_value).replace(/[{"}]/g, '');
                const shCondition_style = {
                    'noise'  : {'title':'噪音', 'bgc':'bg-secondary' },
                    'newOne' : {'title':'新人', 'bgc':'bg-success' },
                    'regular': {'title':'定期', 'bgc':'bg-primary' },
                    'change' : {'title':'變更', 'bgc':'bg-warning text-dark' }
                }
                let inner_Value = JSON.stringify(ShCondition_value).replace(/[\[\]{"}]/g, '');
                    inner_Value = inner_Value.replace(/,/g, '<br>');
                    inner_Value = inner_Value.replace(/true/g, '&nbsp;<span class="badge bg-info">true</span>');
                document.getElementById(`shCondition,${select_empId},${targetYear}`).insertAdjacentHTML('beforeend', inner_Value);
                
                // step2.處理[特檢資格]shIdentity欄位 // 球型標籤方式：
                document.getElementById(`shIdentity,${select_empId},${targetYear}`).innerHTML = '';
                for (const [item, value] of Object.entries(ShCondition_value)) {
                    if(value){
                        // const inner_item = `<span class="badge rounded-pill bg-success">${item}</span>`;
                        const inner_item = `<span class="badge rounded-pill ${shCondition_style[item]['bgc']}">${shCondition_style[item]['title']}</span>`;
                        document.getElementById(`shIdentity,${select_empId},${targetYear}`).insertAdjacentHTML('beforeend', inner_item);
                    }
                }

                        // // 240913 整合型的作法
                        // let shIdentity_pill = '';
                        // let shCondition_str = '';
                        // for (const [item, value] of Object.entries(ShCondition_value)) {
                        //     if(value){
                        //         // 特檢資格：
                        //         const inner_item = `<span class="badge rounded-pill ${shCondition_style[item]['bgc']}">${shCondition_style[item]['title']}</span>`;
                        //         shIdentity_pill = (shIdentity_pill) ? shIdentity_pill + '&nbsp;' + inner_item : inner_item;
                        //         // 資格驗證：
                        //         const shCondition_item = value ? (item +'：'+ `&nbsp;<span class="badge bg-info">${value}</span>`) : (item +'：'+ value);
                        //         shCondition_str = (shCondition_str) ? shCondition_str + '<br>' + shCondition_item : shCondition_item;
                        //     }
                        // }
                        // document.getElementById(`shIdentity,${select_empId},${targetYear}`).insertAdjacentHTML('beforeend', shIdentity_pill);   // 特檢資格：
                        // document.getElementById(`shCondition,${select_empId},${targetYear}`).insertAdjacentHTML('beforeend', shCondition_str);  // 資格驗證：

                resolve();  // 當所有設置完成後，resolve Promise
            });
        }

        // 240827 check fun-1 驗證[噪音]是否符合   
            // eh_time：每日暴露時數(t)、 avg_vol：均能音量(dBA)、 avg_8hr：工作日八小時平均音值(dBA)
            // 樣本編號（A）換算Dose≧50% ； 樣本編號（B）八小時平均音值(dBA)≧50
        function checkNoise(eh_time, avg_vol, avg_8hr) {
            const result = {
                aSample : '不適用',
                bSample : avg_8hr !== false ? (avg_8hr >= 50 ? '符合' : '未達') : '不適用',
                cCheck  : '不適用',
            };
            if (eh_time && avg_vol) {
                const TC = (8 / Math.pow(2, (avg_vol - 90) / 5)).toFixed(2);    // TC：T換算  // 計算 TC 並四捨五入
                const DOSE = ((eh_time / TC) * 100).toFixed(0);                 // 計算 DOSE 並四捨五入
                result.aSample = DOSE >= 50 ? '符合' : '未達';
            }
            if (result.bSample === '符合' || (result.bSample === '不適用' && result.aSample === '符合')) {
                result.cCheck = '是';
            } else if (result.bSample === '未達' || result.aSample === '未達') {
                result.cCheck = '否';
            }
            return result;
        }
        // 240906 check fun-2 驗證[新進特殊]是否符合   
        function checkNewOne(HIRED) {
            const hiredDate = new Date(HIRED);                  // 將 HIRED 字串轉換為日期物件
            const hiredYear = String(hiredDate.getFullYear());  // 取得 HIRED 的年份並轉呈字串
            return hiredYear === currentYear;                   // 比較 HIRED 的年份與當前年份currentYear !! 統屬性才能用 ===
        }
        // 240906 check fun-3 驗證[變更檢查]是否符合   
        function checkChange(asIs_deptNo, toBe_deptNo) {
            return asIs_deptNo !== toBe_deptNo;        // 比較 dept_no 前後是否一致
        }
        // 240906 check fun-4 驗證[定期檢查]是否符合
        function checkRegular(shCase){
            return shCase.length > 0;

        }
        // 240912 取php in_array功能，查詢部門代號是否在[特危場所]的部門代號物件中...返回 true、false
        function in_arrayKey(searchKey) {
            return new Promise((resolve) => {
                const found = Object.values(OSHORTsObj).some(subObj => {    // 遍歷物件中的每個屬性
                    if (typeof subObj === 'object' && subObj !== null) {    // 確認每個子屬性是否為物件，並搜尋該物件內的 key
                        return Object.keys(subObj).includes(searchKey);
                    }
                    return false;
                });
                resolve(found);     // 當搜尋完成後，回傳結果
            });
        }

        // 渲染 今年目前特危項目 for p-2特作欄位(arr_All)
        async function post_shCase(emp_arr){
            for (const emp_i of emp_arr) {  // 使用 for...of 替代 forEach 因為 forEach 不會等待 await 的執行
                const { emp_id: select_empId, shCase ,shCondition} = emp_i;
                // console.log('post_shCase--select_empId, shCase ,shCondition...', select_empId, shCase ,shCondition);
                clearDOM(select_empId);         // 你需要根據 select_empId 來清空對應的 DOM
                if (shCase) {
                    let index = 0;
                    for (const [sh_key, sh_value] of Object.entries(shCase)) {
                        await updateDOM(sh_value, select_empId, index + 1);
                        index++;
                    }                
                }
                // 更新驗證項目(1by1)
                doCheck(select_empId);
                // 更新資格驗證(1by1)
                if (shCondition) {
                    await updateShCondition(shCondition, select_empId, currentYear);
                }
            };
        }
        // 渲染preYear去年特危項目 for p-2特作欄位(arr_All)
        async function post_preYearShCase(emp_arr){
            for (const emp_i of emp_arr) {  // 使用 for...of 替代 forEach 因為 forEach 不會等待 await 的執行
                const { emp_id: select_empId, shCase_logs } = emp_i;
                const empData = shCase_logs[preYear];
                if(empData){
                    const { shCase ,shCondition, emp_dept, emp_sub_scope, dept_no } = empData;
                    // console.log('post_shCase--select_empId, shCase ,shCondition...', select_empId, shCase ,JSON.stringify(shCondition));
                    clearDOM(select_empId, preYear);         // 你需要根據 select_empId 來清空對應的 DOM
                    // step.1 欄位1,2,3
                    document.getElementById(`emp_sub_scope,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', `<b>${preYear}：</b>${emp_sub_scope}`); 
                    document.getElementById(`emp_dept,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', `${dept_no}&nbsp;${emp_dept}`);              

                    // step.2 更新shCase欄位4,5,6,7,8,9,10
                    if (shCase) {
                        // step.2 欲更新的欄位陣列 - 對應欄位4,5,6,7,8,9,10
                        const shLocal_item_arr = ['MONIT_LOCAL', 'WORK_DESC', 'HE_CATE', 'AVG_VOL', 'AVG_8HR', 'eh_time'];
                        let index = 1;
                        for (const [sh_key, sh_value] of Object.entries(shCase)) {
                            // step.2 將shLocal_item_arr循環逐項進行更新
                            shLocal_item_arr.forEach((sh_item) => {
                                // step.2a 項目渲染...
                                const br = index > 1 ? '<br>' : ''; // 判斷 1以上=換行
                                let inner_Value = '';
                                if (sh_value[sh_item] !== undefined) {      // 確認不是找不到的項目
                                    if (sh_item === 'HE_CATE'){             // 3.類別代號 特別處理：1.物件轉字串、2.去除符號
                                        let he_cate_str = JSON.stringify(sh_value[sh_item]).replace(/[{"}]/g, '');
                                        inner_Value = `${br}${he_cate_str}`;
                                    }else if(sh_item.includes('AVG')){      // 4.5.均能音壓、平均音壓 特別處理：判斷是空值，就給他一個$nbsp;佔位
                                        let avg_str = sh_value[sh_item] ? sh_value[sh_item] : '&nbsp;';
                                        inner_Value = `${br}${avg_str}`;
                                    }else if(sh_item === 'MONIT_LOCAL'){      // 特別處理：MONIT_LOCAL
                                        inner_Value = `${br}${sh_value['OSTEXT_30']}&nbsp;${sh_value[sh_item]}`;
                                    }else{                                  // 1.2.6
                                        inner_Value = `${br}${sh_value[sh_item]}`;
                                    }
                                    // step.2b 噪音驗證 對應欄位9,10
                                    if (sh_item === 'HE_CATE' && Object.values(sh_value['HE_CATE']).includes('噪音') && (sh_value['AVG_VOL'] || sh_value['AVG_8HR'])) {
                                        // 2b1. 檢查元素是否存在+是否有值
                                            const eh_time_input = document.querySelector(`snap[id="eh_time,${select_empId},${preYear}"]`);
                                        // 2b2. 個人shCase的噪音中，假如有含eh_time值，就導入使用。
                                            eh_time_input.innerText = (empData['eh_time']) ? (empData['eh_time']) : null;    // 強行帶入顯示~
                                            const avg_vol = (sh_value['AVG_VOL']) ? sh_value['AVG_VOL'] : false;
                                            const avg_8hr = (sh_value['AVG_8HR']) ? sh_value['AVG_8HR'] : false;

                                                // 2b3. 呼叫[fun]checkNoise 取得判斷結果
                                                    const noise_check = checkNoise(eh_time_input.innerText, avg_vol, avg_8hr);     
                                                    const noise_check_str = `${br}${noise_check.cCheck}`;   // 這裡只顯示cCheck判斷結果
                                                document.getElementById(`NC,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', noise_check_str);     // 渲染噪音判斷
                        
                                                // 2b4. 紀錄個人(噪音)特檢資格shCondition['Noise']...是=true；未達、不適用=false
                                                    // empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : empData['shCondition']['noise'];
                                                empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : false;
                                    }
                                // }else{
                                //     inner_Value = `${br}--`;
                                }
                                document.getElementById(`${sh_item},${select_empId},${preYear}`).insertAdjacentHTML('beforeend', inner_Value);     // 渲染各項目
            
                            });
                            index++;
                        }           
                    }
                    // step.3 更新資格驗證(1by1) - 對應欄位11,12
                    if(shCondition) {
                        await updateShCondition(shCondition, select_empId, preYear);    // 帶入參數：資格認證, 對象empId, 對應年份
                    }
                }
            };
        }
        // 渲染到shLocal互動視窗 for shLocal modal互動視窗
        async function post_shLocal(shLocal_arr){
            $('#shLocal_table tbody').empty();
            if(shLocal_arr.length === 0){
                $('#shLocal_table tbody').append('<div class="text-center text-dnager">沒有資料</div>');
            }else{
                shLocal_inf = shLocal_arr;                                           // 把shLocal_inf建立起來
                await Object.entries(shLocal_arr).forEach(([sh_key, sh_i])=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                    // console.log(sh_i);
                    let tr = '<tr>';
                    Object.entries(sh_i).forEach(([s_key, s_value]) => {
                        if(s_key == 'HE_CATE'){
                            s_value = JSON.stringify(s_value).replace(/[{"}]/g, '');
                            s_value = s_value.replace(/,/g, '<br>');

                        }else if(s_key == 'eh_time'){          // mgInto_shLocal_inf(new_shLocal_arr) 在二次導入時有摻雜到"eh_time"...應予以排除
                            return;
                        }
                        tr += '<td>' + s_value + '</td>';
                    })
                    tr += `<td class="text-center"><input type="checkbox" name="shLocal_id[]" value="${sh_key}" class="form-check-input" check ></td>`;
                    tr += '</tr>';
                    $('#shLocal_table tbody').append(tr);
                })
            }
            await reload_shLocalTable_Listeners();      // 重新建立監聽~shLocalTable的checkbox
            $("body").mLoading("hide");
        }

        // 建立監聽~shLocalTable的checkbox for shLocal互動視窗
        let importShLocalBtnListener;
        async function reload_shLocalTable_Listeners() {
            return new Promise((resolve) => {
                const importShLocalBtn = document.getElementById('import_shLocal_btn');
                // 檢查並移除已經存在的監聽器
                if (importShLocalBtnListener) {
                    importShLocalBtn.removeEventListener('click', importShLocalBtnListener);
                }
                // 定義新的監聽器函數
                importShLocalBtnListener = function () {
                    const this_value = document.querySelector('#import_shLocal #import_shLocal_empId').innerText;
                    const this_value_arr = this_value.split(',')       // 分割this.value成陣列
                    const select_empId = this_value_arr[1];            // 取出陣列1=emp_id
                    const selectedOptsValues = Array.from(document.querySelectorAll('#import_shLocal #shLocal_table input[type="checkbox"]:checked')).map(cb => cb.value);
                    const empData = staff_inf.find(emp => emp.emp_id === select_empId);

                    if (empData) {
                        // empData.shCase = empData.shCase || [];
                        empData.shCase = [];            // 特檢項目：直接清空，讓後面重新帶入
                            // 特檢資格：直接清空，讓後面重新帶入
                                // // 防止套入時錯誤，建立[資格驗證]shCondition紀錄判斷物件
                                if(empData['shCondition'] == undefined || empData['shCondition'].length == 0){
                                    empData.shCondition = {
                                        "noise"   : false,          // 噪音判定
                                        "newOne"  : false,          // 新人
                                        "regular" : false,          // 定期
                                        "change"  : false           // 變更
                                    }; 
                                };
                        // 清空目前顯示的 DOM
                        clearDOM(select_empId);         // 你需要根據 select_empId 來清空對應的 DOM
                        if(selectedOptsValues.length === 0){    // 1.這裡是全部沒勾選...
                            empData.shCondition['noise'] = false;   // 清除噪音判定
                        
                        }else{                                  // 2.裡是有勾選，然後將新勾選的項目進行更新
                            selectedOptsValues.forEach((sov_vaule, index) => {
                                empData.shCase[index] = shLocal_inf[sov_vaule];
                                if(empData.shCase[index]['HE_CATE'] && Object.values(empData.shCase[index]['HE_CATE']).includes('噪音')){
                                    // 假如input有eh_time值，就導入使用。
                                    const eh_time_input = document.querySelector(`input[id="eh_time,${select_empId},${currentYear}"]`);
                                    // 檢查元素是否存在+是否有值 then 存到個人訊息中
                                            // [改用] empData.shCase[index]['eh_time'] = (eh_time_input && eh_time_input.value) ? eh_time_input.value : false;
                                    empData['eh_time'] = (eh_time_input && eh_time_input.value) ? eh_time_input.value : null;
                                }
                                updateDOM(shLocal_inf[sov_vaule], select_empId, index + 1);
                                        // [停用] 過濾...emp的部門代號 與 shLocal的部門代號是否一致...才准許導入
                                            // if(empData.dept_no !== shLocal_inf[sov_vaule]['OSHORT']){
                                            //     inside_toast(`選用之特危作業(${shLocal_inf[sov_vaule]['HE_CATE']}) 其部門代號(${shLocal_inf[sov_vaule]['OSHORT']})與員工部門代號(${empData.dept_no}) 不一致...返回&nbsp;!!`);
                                            // }
                            });
                        }
                        // 更新驗證項目(1by1)
                        doCheck(select_empId);
                        // 更新資格驗證(1by1)
                        if (empData.shCondition) {
                            updateShCondition(empData.shCondition, select_empId, currentYear);
                        }
                        console.log('reload_shLocalTable_Listeners--empData...', empData);      // 這裡會顯示一筆empData
                    }
                };
                // 添加新的監聽器
                importShLocalBtn.addEventListener('click', importShLocalBtnListener);
                resolve();
            });
        }

            // 240912 將Obj物件進行Key的排列...call from searchWorkCaseAll()
        function sortObjKey(originalObj){
            return new Promise((resolve) => {
                // 取得排序後的 key 陣列
                const sortedKeys = Object.keys(originalObj).sort();
                // 根據排序後的 key 陣列重建新物件
                const sortedObj = {};
                sortedKeys.forEach(key => {
                    sortedObj[key] = originalObj[key];
                });
                resolve(sortedObj);     // 當搜尋完成後，回傳結果
            });
        }

        // 240912 從Excel匯入時，自動篩選合適對應的特作項目，並崁入...call from p2_eventListener()
        async function searchWorkCaseAll(excel_json_value_arr){
            for (const excel_emp_i of excel_json_value_arr) {  
                const { emp_id: i_empId, dept_no: i_OSHORT, shCase: i_shCase } = excel_emp_i;
                const empData = staff_inf.find(emp => emp.emp_id === i_empId);
                let { shCase: empData_shCase } = empData;
                // 使用 Promise.all 批量處理，減少迴圈內的 await 操作
                await Promise.all(i_shCase.map(async (i_shCase_i) => {
                    const he_cate_obj = await sortObjKey(i_shCase_i['HE_CATE']);
                    const he_cate_str = JSON.stringify(he_cate_obj).replace(/[{"}]/g, '').trim();
                    for (const shLocal_inf_i of shLocal_inf) {
                        const inf_OSHORT = shLocal_inf_i['OSHORT'];
                        const inf_he_cate_obj = await sortObjKey(shLocal_inf_i['HE_CATE']);
                        const inf_he_cate_str = JSON.stringify(inf_he_cate_obj).replace(/[{"}]/g, '').trim();
                        // 比較 OSHORT 和 HE_CATE
                        if ((i_OSHORT === inf_OSHORT) && (he_cate_str === inf_he_cate_str)) {
                            empData_shCase.push(shLocal_inf_i);  // 匹配後將物件推入 empData_shCase
                        }
                    }
                }));
                // console.log('searchWorkCaseAll--empData_shCase...', i_empId, empData_shCase);
                // 將合併後的物件mergedData加入 shCase 陣列中，使用 await 調用 removeDuplicateShCase 去重
                empData['shCase'] = await removeDuplicateShCase(empData_shCase);
                        // // 自製去重+去除MONIT_LOCAL&WORK_DESC空值...** 他會連同一開始的檢查類別代號都清除，導致無法判斷。
                        // const uniqueShCaseMap = new Map();
                        // await empData_shCase.forEach(item => {
                        //     const { MONIT_LOCAL: i_MONIT_LOCAL, WORK_DESC: i_WORK_DESC } = item;
                        //     if (i_MONIT_LOCAL && i_WORK_DESC) {                         // 檢查 MONIT_LOCAL 和 WORK_DESC 是否為空，如果是則跳過該項目
                        //         const uniqueKey = JSON.stringify(item);                 // 建立一個唯一標識符，根據所有屬性值來生成
                        //         if (!uniqueShCaseMap.has(uniqueKey)) {                  // 如果唯一標識符已存在，則忽略此項目；否則，將其添加到Map中
                        //             uniqueShCaseMap.set(uniqueKey, item);
                        //         }
                        //     }
                        // });
                        // empData['shCase'] = Array.from(uniqueShCaseMap.values());
            };
            // console.log('searchWorkCaseAll--staff_inf...', staff_inf);
            await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
        }

        // 240912 從Excel匯入時，自動篩選合適對應的特作項目，並崁入...
        function searchWorkCase(OSHORT, HE_CATE_str) {               // 帶入參數：特危部門代號、特危類別
            return new Promise((resolve) => {
                const [cateKey, cateValue] = HE_CATE_str.split(":"); // 解析 HE_CATE_str，得到 key 和 value
                for (const obj of shLocal_inf) {                     // 遍歷陣列，尋找符合條件的物件
                    if (obj.OSHORT === OSHORT) {                     // 比對 OSHORT
                        if (obj.HE_CATE[cateKey] === cateValue) {    // 比對 HE_CATE 的 key 和 value
                            console.log('searchWorkCase...', obj);
                            resolve(obj);                            // 找到符合的物件，resolve 該物件
                            return;                                  // 結束函數
                        }
                    }
                }
                resolve(null);                                       // 如果沒有找到，resolve null
            });
        }
        
    // [p-1]
        // [p1 函數-1] 動態生成step2的所有按鈕，並重新綁定事件監聽器
        function mk_step2_OSHORTs_btn(selectedValues) {
            // init 取得step1之選項值
            const selectedOSHORTs = selectedValues.reduce((acc, value) => {
                if (OSHORTsObj[value]) { // 檢查選擇的值是否存在於OSHORTsObj中
                    acc[value] = OSHORTsObj[value];
                }
                return acc;
            }, {});
            // init 清空範圍內按鈕
            $('#OSHORTs_opts_inside').empty();
            // step-1. 鋪設按鈕
            if(Object.entries(selectedOSHORTs).length > 0){     // 判斷使否有長度值
                Object.entries(selectedOSHORTs).forEach(([ohtext_30, oh_value]) => {
                    let ostext_btns = `
                        <div class="col-lm-3">
                            <div class="card">
                                <div class="card-header">${ohtext_30}</div>
                                <div class="card-body">
                                    ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                        `<div class="form-check px-4">
                                            <input type="checkbox" name="OSHORTs" id="${o_key}" value="${o_key}" class="form-check-input" check >
                                            <label for="${o_key}" class="form-check-label">${o_key} (${o_value})</label>
                                        </div>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>`;
                    $('#OSHORTs_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<OSHORTs_opts_inside>元素中
                });
            }else{
                let ostext_btns = `
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-header">空值注意</div>
                            <div class="card-body">
                                STEP-1.沒有選擇任何一個特危健康場所~ 本欄位無效!!
                            </div>
                        </div>
                    </div>`;
                $('#OSHORTs_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<OSHORTs_opts_inside>元素中
            }
            // step-2. 重新綁定事件監聽器給step2 #OSHORTs_opts內的checkbox；主要驗證step2、3，及step3的load_hrdb_btn的開、關
            rebindOSHORTsOptsListeners();
        }

        // [p1 函數-4] 重新綁定事件監聽器給step2 #OSHORTs_opts內的checkbox；主要驗證step2、3，及step3的load_hrdb_btn的開、關
        function rebindOSHORTsOptsListeners() {
            const OSHORTs_opts_arr = Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[type="checkbox"]'));
            OSHORTs_opts_arr.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const selectedOptsValues = OSHORTs_opts_arr.filter(cb => cb.checked).map(cb => cb.value);
                    // 更新step2 驗證標籤
                    OSHORTs_opts.classList.toggle('is-invalid', selectedOptsValues.length === 0);
                    OSHORTs_opts.classList.toggle('is-valid', selectedOptsValues.length > 0);
                    // 更新step3 驗證標籤
                    load_hrdb_btn.classList.toggle('is-invalid', selectedOptsValues.length === 0);
                    load_hrdb_btn.classList.toggle('is-valid', selectedOptsValues.length > 0);
                    load_hrdb_btn.disabled = selectedOptsValues.length === 0 ;                  // 取得人事資料庫btn
                });
            });
        }

        // [p1 函數-3] 設置事件監聽器和MutationObserver
        async function p1_eventListener() {
            return new Promise((resolve) => {
                // p1. [通用]在任何地方啟用工具提示框
                $('[data-toggle="tooltip"]').tooltip();

                // p1-1a. 監聽step1[棟別]的checkbox變化：驗證+呼叫生成step2 btn
                    OSTEXT_30s.forEach(checkbox => {
                        checkbox.addEventListener('change', function() {
                            // 更新step1 "All"狀態
                            if (this.value === 'All') {
                                OSTEXT_30s.forEach(cb => cb.checked = this.checked); // 全選或取消全選
                            } else {
                                const allCheckbox = OSTEXT_30s.find(cb => cb.value === 'All');
                                const nonAllCheckboxes = OSTEXT_30s.filter(cb => cb.value !== 'All');
                                allCheckbox.checked = nonAllCheckboxes.every(cb => cb.checked); // 更新"All"狀態
                            }
                            // 更新step1 驗證標籤
                            const selectedValues = OSTEXT_30s.filter(cb => cb.checked).map(cb => cb.value);
                            OSTEXT_30_Out.classList.toggle('is-invalid', selectedValues.length === 0);
                            OSTEXT_30_Out.classList.toggle('is-valid', selectedValues.length > 0);
                            // 假如遇到取消廠區...step2、step3就全關了
                            if(selectedValues.length === 0){
                                // 更新step2 驗證標籤
                                OSHORTs_opts.classList.remove('is-valid');
                                OSHORTs_opts.classList.add('is-invalid');
                                // 更新step3 驗證標籤
                                load_hrdb_btn.classList.remove('is-valid');
                                load_hrdb_btn.classList.add('is-invalid');
                                load_hrdb_btn.disabled = true ;                  // 關閉 取得人事資料庫btn
                            }
                            // 動態生成step2的所有按鈕，並重新綁定事件監聽器
                            mk_step2_OSHORTs_btn(selectedValues);
                        });
                    });
                    // p1-1b. 初始化監聽器，綁定事件監聽器給step2 #OSHORTs_opts內的checkbox；主要驗證step2、3，及step3的load_hrdb_btn的開、關
                    rebindOSHORTsOptsListeners();

                // p1-2. 監聽step3[load_hrdb_btn]取得人事資料庫
                load_hrdb_btn.addEventListener('click', function() {
                    const OSHORTs_opts_arr = Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[type="checkbox"]'));  // 定義step2 arr範圍
                    const selectedOptsValues = OSHORTs_opts_arr.filter(cb => cb.checked).map(cb => cb.value);                       // 過濾出有選定的value
                    const selectedOptsValues_str = JSON.stringify(selectedOptsValues).replace(/[\[\]]/g, '');                       // 陣列轉字串+過濾符號
                    load_fun('load_hrdb', selectedOptsValues_str, mgInto_staff_inf);            // 呼叫load_fun 用 部門代號字串 取得 人員清單 => 合併到mgInto_staff_inf post_hrdb渲染
                    inside_toast('取得&nbsp;hrdb員工清單...Done&nbsp;!!');
                    $('#nav-p2-tab').tab('show');                                               // 切換頁面
                });
                
                resolve();      // 當所有設置完成後，resolve Promise
            });
        }

        // [p1 函數-6] 渲染hrdb
        async function post_hrdb(emp_arr){
            // console.log('post_hrdb--emp_arr...', emp_arr);
            $('#hrdb_table tbody').empty();
            if(emp_arr.length === 0){
                $('#hrdb_table tbody').append('<div class="text-center text-dnager">沒有資料</div>');
            }else{
                // 停止並銷毀 DataTable
                release_dataTable();
                await Object(emp_arr).forEach((emp_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                    // console.log('emp_i', emp_i);
                    let tr1 = '<tr>';
                    tr1 += `<td class="text-center">${emp_i.emp_id}</br><button type="button" class="btn btn-outline-primary add_btn " name="emp_id" value="${emp_i.cname},${emp_i.emp_id}" `;
                        tr1 += (emp_i.HIRED ? ` title="到職日：${emp_i.HIRED}" ` : ``) +` data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">${emp_i.cname}</button></td>`;
                    
                    tr1 += `<td><div class="split-td"><div class="top-half" ><b>${currentYear}：</b>${emp_i.emp_sub_scope}</div>
                                                    <div class="bottom-half" id="emp_sub_scope,${emp_i.emp_id},${preYear}" ></div></div></td>`;
                    
                    tr1 += `<td><div class="split-td"><div class="top-half" >${emp_i.dept_no}&nbsp;${emp_i.emp_dept}</div>
                                                    <div class="bottom-half" id="emp_dept,${emp_i.emp_id},${preYear}" ></div></div></td>`;

                    tr1 += `<td><div class="split-td"><div class="top-half" id="MONIT_LOCAL,${emp_i.emp_id},${currentYear}"></div>
                                                   <div class="bottom-half" id="MONIT_LOCAL,${emp_i.emp_id},${preYear}"></div></div></td>`;
                            
                    tr1 += `<td class="HE_CATE" id="${emp_i.cname},${emp_i.emp_id}"><div class="split-td"><div class="top-half" id="WORK_DESC,${emp_i.emp_id},${currentYear}"></div>
                                                   <div class="bottom-half" id="WORK_DESC,${emp_i.emp_id},${preYear}"></div></div></td>`;
                    // 240918 因應流程圖三需求，將選擇特作功能移到[工作內容]...
                    tr1 += `<td><div class="split-td"><div class="top-half" id="HE_CATE,${emp_i.emp_id},${currentYear}"></div>
                                                                   <div class="bottom-half" id="HE_CATE,${emp_i.emp_id},${preYear}"></div></div></td>`;

                    tr1 += `<td><div class="split-td"><div class="top-half" id="AVG_VOL,${emp_i.emp_id},${currentYear}"></div>
                                                   <div class="bottom-half" id="AVG_VOL,${emp_i.emp_id},${preYear}"></div></div></td>`;

                    tr1 += `<td><div class="split-td"><div class="top-half" id="AVG_8HR,${emp_i.emp_id},${currentYear}"></div>
                                                   <div class="bottom-half" id="AVG_8HR,${emp_i.emp_id},${preYear}"></div></div></td>`;

                    tr1 += `<td><div class="split-td"><div class="top-half">
                                <input type="number" id="eh_time,${emp_i.emp_id},${currentYear}" name="eh_time" class="form-control " onchange="change_eh_time(this.id, this.value)" ></div>
                                            <div class="bottom-half"><snap id="eh_time,${emp_i.emp_id},${preYear}"></snap></div></div></td>`;

                    tr1 += `<td><div class="split-td"><div class="top-half" id="NC,${emp_i.emp_id},${currentYear}"></div>
                                                   <div class="bottom-half" id="NC,${emp_i.emp_id},${preYear}"></div></div></td>`;

                    tr1 += `<td>&nbsp;&nbsp;<input type="checkbox" id="SH3,${emp_i.emp_id},${currentYear}" name="emp_ids[]" value="${emp_i.emp_id}" class="form-check-input" >
                                <div class="split-td"><div class="top-half" id="shIdentity,${emp_i.emp_id},${currentYear}"></div>
                                                   <div class="bottom-half" id="shIdentity,${emp_i.emp_id},${preYear}"></div></div></td>`;

                    tr1 += `<td><div class="split-td"><div class="top-half" id="shCondition,${emp_i.emp_id},${currentYear}"></div>
                                                   <div class="bottom-half" id="shCondition,${emp_i.emp_id},${preYear}"></div></div></td>`;

                    // tr1 += `<td><div class="split-td"><div class="top-half" id="change,${emp_i.emp_id},${currentYear}"></div>
                    //                                <div class="bottom-half" id="change,${emp_i.emp_id},${preYear}"></div></div></td>`;
                    
                    tr1 += `<td><div class="split-td"><div class="top-half text-center" >
                                <button type="button" class="btn btn-outline-danger btn-sm btn-xs add_btn" value="${emp_i.emp_id}" onclick="eraseStaff(this.value)">刪除</button></div>
                                <div class="bottom-half" id="change,${emp_i.emp_id},${currentYear}"></div></div></td>`;

                    // tr1 += `<td><div class="text-center"><button type="button" class="btn btn-outline-danger btn-sm btn-xs add_btn" value="${emp_i.emp_id}" onclick="eraseStaff(this.value)">刪除</button>&nbsp;
                    //             <button class="btn btn-outline-success btn-sm btn-xs add_btn" type="button" value="${emp_i.cname},${emp_i.emp_id}" 
                    //             data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">紀錄</button></div></br>`;
                    // tr1 += `<div id="change,${emp_i.emp_id},${currentYear}"></div></td>`;

                    tr1 += '</tr>';
                    $('#hrdb_table tbody').append(tr1);
                })
                await reload_dataTable(emp_arr);               // 倒參數(陣列)，直接由dataTable渲染
            }
            // 240905 [轉調]欄位增加[紀錄].btn：1.建立offcanvas_arr陣列。2.建立canva_btn監聽。3.執行fun，顯示於側邊浮動欄位offcanva。
                    const offcanvas_arr = Array.from(document.querySelectorAll('button[aria-controls="offcanvasRight"]'));
                    offcanvas_arr.forEach(canva_btn => {
                        canva_btn.addEventListener('click', function() {
                            const this_value_arr = this.value.split(',')       // 分割this.value成陣列
                            const select_cname = this_value_arr[0];            // 取出陣列0=cname
                            const select_empId = this_value_arr[1];            // 取出陣列1=emp_id
                            $('#offcanvasRight #offcanvas_title').empty().append('( '+ this.value +' )');     // 更新 header title  

                            const empData = staff_inf.find(emp => emp.emp_id === select_empId);
                            let emp_shCase_log = '< ~ 無儲存紀錄 ~ >';
                            if(empData && empData.shCase_logs != undefined && ( Object.keys(empData.shCase_logs).length > 0 )){
                                // 使用 JSON.stringify 來轉換物件成為格式化的JSON字符串，第二個參數設為null，第三個參數 2 表示每層縮進兩個空格。
                                // 使用 <pre> 標籤來確保格式化的結果在 HTML 中正確顯示。這樣的輸出會與 PHP 的 print_r 效果相似。
                                emp_shCase_log = JSON.stringify(empData.shCase_logs, null ,3);
                            }
                            $('#offcanvasRight .offcanvas-body').empty().append('<pre>' + emp_shCase_log + '</pre>');
                        });
                    });

            $("body").mLoading("hide");
        }

    // [p-2]
        // [p2 函數-4] 建立監聽~shLocalTable的HE_CATE td for p-2特作欄位 // 檢查類別代號 開啟 importShLocal_modal
        let HECateClickListener;
        async function reload_HECateTable_Listeners() {
            return new Promise((resolve) => {
                const HECate = document.querySelectorAll('[class="HE_CATE"]');      //  定義出範圍
                // 檢查並移除已經存在的監聽器
                if (HECateClickListener) {
                    HECate.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                        tdItem.removeEventListener('click', HECateClickListener);   // 將每一個tdItem移除監聽, 當按下click
                    })
                }
                // 定義新的監聽器函數
                HECateClickListener = function () {
                    const this_id_arr = this.id.split(',')                  // 分割this.id成陣列
                    const edit_cname  = this_id_arr[0];                     // 取出陣列0=cname
                    const edit_emp_id = this_id_arr[1];                     // 取出陣列1=emp_id
                    $('#import_shLocal #import_shLocal_empId').empty().append(`${edit_cname},${edit_emp_id}`); // 清空+填上工號
                    importShLocal_modal.show();
                }
                // 添加新的監聽器
                HECate.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                    tdItem.addEventListener('click', HECateClickListener);      // 將每一個tdItem增加監聽, 當按下click
                })
                resolve();
            });
        }
        // 更換shLocal_modal內的emp_id值 for shLocal互動視窗
        function reNew_empId(this_value){
            $('#import_shLocal #import_shLocal_empId').empty().append(this_value);
        }
        // p-2 當有輸入每日暴露時數eh_time時...
        function change_eh_time(this_id, this_value){    // this.id, this.value
            const this_id_arr = this_id.split(',')       // 分割this.id成陣列
            const select_empId = this_id_arr[1];         // 取出陣列1=emp_id
            // step-1 將每日暴露時數eh_time存到指定staff_inf
                const empData = staff_inf.find(emp => emp.emp_id === select_empId);
                if (empData) {
                            // [改用] empData.shCase = empData.shCase || [];
                            // // 然後將暴露時數eh_time值 進行更新對應的empId下shCase含'噪音'的項目中。
                            // empData.shCase.forEach((sh_v, sh_i) => {
                            //     if((sh_v['HE_CATE'] != undefined ) && Object.values(sh_v['HE_CATE']).includes('噪音')){
                            //         empData.shCase[sh_i]['eh_time'] = Number(this_value);
                            //     }
                            // });
                    empData['eh_time'] = Number(this_value);
                }
                // console.log('change_eh_time--staff_inf..', empData);

            // step-2 更新噪音資格 // 取自 post_shCase(empData); 其中一段
                clearDOM(select_empId);                 // 你需要根據 select_empId 來清空對應的 DOM
                const { shCase, shCondition } = empData;
                if (shCase) {
                    Object.entries(shCase).forEach(([sh_key, sh_value], index) => {
                        updateDOM(sh_value, select_empId, index + 1);
                    });
                }
                // 更新驗證項目(1by1)
                doCheck(select_empId);
                // 更新資格驗證(1by1)
                if (shCondition) {
                    updateShCondition(shCondition, select_empId, currentYear);
                }
        }
        // p-2 批次儲存員工清單...
        function bat_storeStaff(){
            load_fun('bat_storeStaff', JSON.stringify(staff_inf), show_swal_fun);   // load_fun的變數傳遞要用字串
        }

        // modal：[load_excel] 以下為上傳後"iframe"的部分
            // fun.2-1a 阻止檔案未上傳導致的錯誤。 // 請注意設置時的"onsubmit"與"onclick"。
            function loadExcelForm() {
                // 如果檔案長度等於"0"。
                if (excelFile.files.length === 0) {
                    // 如果沒有選擇文件，顯示警告訊息並阻止表單提交
                    warningText_1.style.display = "block";
                    return false;
                }
                // 如果已選擇文件，允許表單提交
                iframe.style.display = 'block'; 
                // 以下為編輯特有
                // showTrainList.style.display = 'none';
                return true;
            }
            // fun.2-1b
            function iframeLoadAction() {
                iframe.style.height = '0px';
                var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                var iframeContent = iframeDocument.documentElement;
                var newHeight = iframeContent.scrollHeight + 'px';
                iframe.style.height = newHeight;

                var excel_json = iframeDocument.getElementById('excel_json');
                var stopUpload = iframeDocument.getElementById('stopUpload');
                // 在此處對找到的 <textarea> 元素進行相應的操作
                if (excel_json) {
                    // 手动触发input事件
                    var inputEvent = new Event('input', { bubbles: true });
                    warningText_1.style.display = "none";           // 警告文字--隱藏
                    warningText_2.style.display = "none";
                    import_excel_btn.style.display = "block";       // 載入按鈕--顯示
                    
                } else if(stopUpload) {
                    // 沒有找到 <textarea> 元素
                    console.log('請確認資料是否正確');
                    warningText_1.style.display = "block";          // 警告文字--顯示
                    warningText_2.style.display = "block";
                    import_excel_btn.style.display = "none";        // 載入按鈕--隱藏

                }else{
                    // console.log('找不到 < ? > 元素');
                }
            };
            // fun.2-1c 下載Excel
            function downloadExcel(to_module) {
                if(staff_inf.length === 0){
                    return;
                }
                const item_keys = {
                    "emp_sub_scope" : "廠區",
                    "dept_no"       : "部門代碼",
                    "emp_dept"      : "部門名稱",
                    "emp_id"        : "工號",
                    "cname"         : "姓名",
                    "shCase"        : "特作項目",
                    "eh_time"       : "每日暴露時數",
                    "shCondition"   : "資格驗證",
                };
                const shCase_keys = {
                    "MONIT_LOCAL"   : "工作場所",
                    "WORK_DESC"     : "工作內容",
                    "HE_CATE"       : "檢查類別代號",
                    "AVG_VOL"       : "均能音量",
                    "AVG_8HR"       : "平均音壓"
                };
                let sort_listData = staff_inf.map((staff) => {
                    let sortedData = {};
                    // 處理主欄位
                    Object.entries(item_keys).forEach(([key, label]) => {
                        if (key === 'shCase') {
                            staff['shCase'].forEach((caseItem) => {
                                // 處理 shCase 的子欄位
                                Object.entries(shCase_keys).forEach(([subKey, subLabel]) => {       
                                    const value = caseItem[subKey];
                                    if (subKey === 'HE_CATE' && value !== undefined) {
                                        const heCate = JSON.stringify(value).replace(/[{"}]/g, '');
                                        sortedData[subLabel] = sortedData[subLabel] ? `${sortedData[subLabel]}\r\n${heCate}` : heCate;
                                    } else if(value !== undefined){                                 // 240909 這裡要追加過濾 沒有HE_CATE的項目...
                                        sortedData[subLabel] = sortedData[subLabel] ? `${sortedData[subLabel]}\r\n${(value || '')}` : (value || '');
                                    }
                                });
                            });
                        } else if (key === 'shCondition') {
                            const shCondition = staff[key];
                            // 過濾出 value = true 的鍵值對
                            let shCondition_true = Object.fromEntries(
                                Object.entries(shCondition).filter(([key, value]) => value === true)        // 這裡不能用;結尾...要注意!
                            );

                            shCondition_true = JSON.stringify(shCondition_true).replace(/[{"}]/g, '').replace(/,/g, ',\r\n');
                            sortedData[label] = shCondition_true;
                        } else {
                            sortedData[label] = staff[key];
                        }
                    });
            
                    return sortedData;
                });
            
                let htmlTableValue = JSON.stringify(sort_listData);
                document.getElementById(to_module + '_htmlTable').value = htmlTableValue;
            }
            // p2_eventListener() step-3-3. p-2 監控按下[載入]鍵後----呼叫Excel載入

        // modal：[searchStaff]
            // fun.2-2a：search Key_word
            async function search_fun(fun, searchkeyWord){
                return new Promise((resolve) => {
                    mloading("show");                                               // 啟用mLoading
                    // 製作查詢包裝：
                    var request = {
                        uuid         : 'e65fccd1-79e7-11ee-92f1-1c697a98a75f',      // nurse
                        functionname : fun,                                         // 操作功能
                        // search       : search                                    // 查詢對象key_word
                    }
    
                    // 功能與需求判斷：
                    if(fun=='search'){                      // from 單筆新增>搜尋
                        var search = $('#searchkeyWord').val().trim();              // search keyword取自user欄位
                            if(!search || (search.length < 2)){
                                $("body").mLoading("hide");
                                alert("查詢字數最少 2 個字以上!!");
                                resolve(false);
                                return false;
                            } 
                        // 製作查詢包裝：
                        request['search']       = search;
    
                    }else if(fun=='rework_loadStaff'){      // from rework_loadStaff
                        if(!searchkeyWord || (searchkeyWord.length < 8)){
                            $("body").mLoading("hide");
                            alert("查詢工號字數最少 8 個字!!");
                            resolve(false);
                            return false;
                        }else{
                            // 製作查詢包裝：
                            request['functionname'] = 'search';         // 將fun切換功能成search
                            request['search']       = searchkeyWord;    // 將searchkeyWord帶入search
                        }
    
                    }else{                                  // fun錯誤返回
                        resolve(false);
                        return false;
                    }
    
                    // api主功能
                    $.ajax({
                        url: 'http://tneship.cminl.oa/api/hrdb/index.php',          // 正式2024新版
                        method: 'post',
                        dataType: 'json',
                        data: request,
                        success: function(res){
                            if(fun=='search'){
                                // 呼叫[fun.2-2b]將結果給postList進行渲染
                                postList(res["result"]).then(() => {
                                    resolve();  // 等待 rework_staff 完成後再解析 Promise
                                });                           
    
                            }else if(fun=='rework_loadStaff'){
                                // rework_staff(res["result"]);
                                rework_staff(res["result"]).then(() => {
                                    resolve();  // 等待 rework_staff 完成後再解析 Promise
                                });
                            }
                        },
                        error (err){
                            console.log("search error:", err);
                            $("body").mLoading("hide");
                            alert("查詢錯誤!!");
                            resolve();      // 當所有設置完成後，resolve Promise
                        }
                    })
                });
            }
            // fun.2-2b：渲染功能
            async function postList(res_r){
                return new Promise((resolve) => {
                    // 定義表格頭段
                    let div_result_table = document.getElementById('result_table');
                        div_result_table.innerHTML = '';
                    // 鋪設表格頭段thead
                    let Rinner = "<thead><tr>"+ "<th>廠區</th>"+"<th>工號</th>"+"<th>姓名</th>"+"<th>職稱</th>"+"<th>部門代號</th>"+"<th>部門名稱</th>"+"<th>select</th>"+ "</tr></thead>" + "<tbody id='result_tbody'>"+"</tbody>";
                        div_result_table.innerHTML += Rinner;
                    // 定義表格中段tbody
                    let div_result_tbody = document.getElementById('result_tbody');
                        div_result_tbody.innerHTML = '';
                    let len = res_r.length;
                    for (let i=0; i < len; i++) {
                        // 把user訊息包成json字串以便夾帶
                        let user_json = JSON.stringify({
                                'emp_sub_scope' : res_r[i].emp_sub_scope.replace(/ /g, '&nbsp;'),
                                'emp_id'        : res_r[i].emp_id,
                                'cname'         : res_r[i].cname,
                                'dept_no'       : res_r[i].dept_no,
                                'emp_dept'      : res_r[i].emp_dept,
                                'HIRED'         : res_r[i].HIRED,
                                'cstext'        : res_r[i].cstext,
                                'gesch'         : res_r[i].gesch,
                                'natiotxt'      : res_r[i].natiotxt,
                                'schkztxt'      : res_r[i].schkztxt,
                            });
                        div_result_tbody.innerHTML += 
                            '<tr>' +
                                '<td>' + res_r[i].emp_sub_scope + '</td>' +
                                '<td>' + res_r[i].emp_id +'</td>' +
                                '<td>' + res_r[i].cname + '</td>' +
                                '<td>' + res_r[i].cstext + '</td>' +
                                '<td>' + res_r[i].dept_no + '</td>' +
                                '<td>' + res_r[i].emp_dept+ '</td>' +
                                '<td class="text-center">' + '<button type="button" class="btn btn-default btn-xs" id="'+res_r[i].emp_id+'" value='+user_json+' onclick="tagsInput_me(this.value)">'+
                                '<i class="fa-regular fa-circle"></i></button>' + '</td>' +
                            '</tr>';
                    }
                    $("body").mLoading("hide");                                 // 關閉mLoading
                    // 當所有設置完成後，resolve Promise
                    resolve();
                });
            }
            // fun.2-2c：點選、渲染模組+套入
            function tagsInput_me(val) {
                if (val !== '') {
                    val = '['+val+']';
                    const tagsInput_me_arr = JSON.parse(val);   // 將物件字串轉成陣列
                    mgInto_staff_inf(tagsInput_me_arr);         // 呼叫[...]進行 合併+渲染
                    $('#searchkeyWord').val('');                // 清除searchkeyWord
                    $('#result_table').empty();                 // 清除搜尋頁面資料
                    inside_toast(`新增單筆資料...Done&nbsp;!!`); // [fun.0-2]
                    searchUser_modal.hide();                    // 關閉頁面
                }
            }

        // [p2 函數-3] 設置事件監聽器和MutationObserver
        async function p2_eventListener() {
            return new Promise((resolve) => {

                // p2.[load_excel] 以下為上傳後"iframe"的部分
                    // p2-1. 監控modal按下[上傳]鍵後，載入Excel
                    excelUpload.addEventListener('click', ()=> {
                        iframeLoadAction();
                        loadExcelForm();
                    });

                    // p2-2. 監控modal按下[上傳]鍵後，打開隱藏的"iframe"，"load"後執行抓取資料
                    iframe.addEventListener('load', ()=> {
                        iframeLoadAction();
                    });

                    // p2-3. 監控按下[載入]鍵後----呼叫Excel載入
                    import_excel_btn.addEventListener('click', async function() {
                        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                        var excel_json = iframeDocument.getElementById('excel_json');           // 正確載入
                        var stopUpload = iframeDocument.getElementById('stopUpload');           // 錯誤訊息

                        if (excel_json) {
                            document.getElementById('excelTable').value = excel_json.value;
                            const excel_json_value_arr = JSON.parse(excel_json.value);
                            
                            // rework_loadStaff(excel_json_value_arr)      // 呼叫[fun] rework_loadStaff() 這個會呼叫hrdb更新資料
                            await mgInto_staff_inf(excel_json_value_arr)         // 呼叫[fun] 
                            // *** 240911 這裡要套入function searchWorkCase( OSHORT, HE_CATE_str ) 從Excel匯入時，自動篩選合適對應的特作項目，並崁入...doing
                            searchWorkCaseAll(excel_json_value_arr);

                            inside_toast(`批次匯入Excel資料...Done&nbsp;!!`);

                        } else if(stopUpload) {
                            console.log('請確認資料是否正確');
                        }else{
                            console.log('找不到 ? 元素');
                        }
                    });

                resolve();      // 當所有設置完成後，resolve Promise
            });
        }

    // [p-3]
        // [p3 函數-1-2] 動態生成所有按鈕，並重新綁定事件監聽器
        function mk_deptNos_slt(selectedDeptNo) {
            return new Promise((resolve) => {
                // init
                $('#deptNo_opts_inside').empty();
                // step-1. 鋪設按鈕
                if(Object.entries(selectedDeptNo).length > 0){     // 判斷使否有長度值
                    Object.entries(selectedDeptNo).forEach(([emp_sub_scope, oh_value]) => {
                        let ostext_btns = `
                            <div class="col-lm-3">
                                <div class="card">
                                    <div class="card-header">${emp_sub_scope}</div>
                                    <div class="card-body p-2">
                                        ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                            `<div class="form-check px-4">
                                                 <input type="checkbox" name="deptNo[]" id="${emp_sub_scope},${o_key}" value="${o_key}" class="form-check-input" check >
                                                <label for="${emp_sub_scope},${o_key}" class="form-check-label">${o_key} (${o_value.OSTEXT}) ${o_value._count}件</label>
                                            </div>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>`;
                        $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
                    });
                }else{
                    let ostext_btns = `
                        <div class="col-md-3">
                            <div class="card">
                                <div class="card-header">!! 空值注意 !!</div>
                                <div class="card-body">
                                    ~ 目前沒有任何已存檔的員工資料 ~
                                </div>
                            </div>
                        </div>`;
                    $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
                }
                // step-2. 綁定deptNo_opts事件監聽器
                const deptNo_opts_arr = Array.from(document.querySelectorAll('#deptNo_opts_inside input[name="deptNo[]"]'));
                deptNo_opts_arr.forEach(deptNo_checkbox => {
                    deptNo_checkbox.addEventListener('change', function() {
                        const selectedValues = deptNo_opts_arr.filter(cb => cb.checked).map(cb => cb.value);
                        deptNo_opts.classList.toggle('is-invalid', selectedValues.length === 0);
                        deptNo_opts.classList.toggle('is-valid', selectedValues.length > 0);
                        load_deptNo_btn.classList.toggle('is-invalid', selectedValues.length === 0);
                        load_deptNo_btn.classList.toggle('is-valid', selectedValues.length > 0);
                        load_deptNo_btn.disabled = selectedValues.length === 0 ;                  // 取得人事資料庫btn
                        // load_fun('load_staff_byDeptNo', this.value, rework_loadStaff);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                    });
                });
                // step-3. 綁定load_deptNo_btn進行撈取員工資料
                const load_deptNo_btn = document.getElementById('load_deptNo_btn');
                load_deptNo_btn.addEventListener('click', function() {
                    const selectedValues = deptNo_opts_arr.filter(cb => cb.checked).map(cb => cb.value);
                    const selectedValues_str = JSON.stringify(selectedValues).replace(/[\[\]]/g, '');
                    load_fun('load_staff_byDeptNo', selectedValues_str, rework_loadStaff);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                })

                resolve();      // 當所有設置完成後，resolve Promise
            });

        }
    // p-3：[load_staff]


    $(function() {
        // [步驟-1] 初始化設置
        const selectedValues = OSTEXT_30s.filter(cb => cb.checked).map(cb => cb.value); // 取得step-1.廠區checkBox訊息
        mk_step2_OSHORTs_btn(selectedValues);   // 呼叫函數-1 生成p1廠區按鈕
        mk_deptNos_slt(deptNosObj);             // 呼叫函數-2 生成p3部門slt按鈕
        p1_eventListener();                     // 呼叫函數-3 建立監聽
        p2_eventListener();                     // 呼叫函數-3 建立監聽

        // let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        let message  = '*** 本系統螢幕解析度建議：1920 x 1080 dpi，低於此解析度將會影響操作體驗&nbsp;~';
        Balert( message, 'warning')

    });
