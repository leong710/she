// // 1. 工具函數 (Utility Functions)
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
                "order": [[ 0, "asc" ], [ 1, "asc" ], [ 2, "asc" ]],            // 排序
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
                        mergedData[a2_key] = source_json_value_arr[e_key][a2_value];     // 合併
                        if(a2_key=='OSHORT'){
                            source_OSHORT_arr.push(source_json_value_arr[e_key][a2_value])  // extra: 取得部門代號 => 抓特危場所清單用
                        }
                    }
                }

                // 將合併後的物件加入 shCase 陣列中
                if( Object.keys(mergedData).length > 0 ){
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
                        // console.log('2.mgInto_staff_inf--staff_inf...', staff_inf);

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
        async function clearDOM(empId) {
            return new Promise((resolve) => {
                // 使用屬性選擇器選取所有包含 empId 的 td 元素
                const tdsToClear = document.querySelectorAll(`td[id*=",${empId}"]`);
                // 遍歷這些選取到的元素並清空內容
                tdsToClear.forEach(td => {
                    td.innerHTML = '';
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
                        "regular" : false,          // 常態
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
                        }else{                                  // 1.2.6
                            inner_Value = `${br}${sh_value[sh_item]}`;
                        }
                        document.getElementById(`${sh_item},${select_empId}`).insertAdjacentHTML('beforeend', inner_Value);     // 渲染各項目
    
                        // step.2b 噪音驗證
                        if (sh_item === 'HE_CATE' && Object.values(sh_value['HE_CATE']).includes('噪音') && (sh_value['AVG_VOL'] || sh_value['AVG_8HR'])) {
                            // 2b1. 檢查元素是否存在+是否有值
                                const eh_time_input = document.querySelector(`input[id="eh_time,${select_empId}"]`);
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
                            document.getElementById(`NC,${select_empId}`).insertAdjacentHTML('beforeend', noise_check_str);     // 渲染噪音判斷
    
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
            return new Promise((resolve) => {
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
                        const emp_sub_scope = empData.shCase_logs[preYear]['emp_sub_scope'];    // 取得去年廠別
                        const emp_dept      = empData.shCase_logs[preYear]['emp_dept'];         // 取得去年部門名稱
                        const Transition_inner_Value = emp_sub_scope+'_'+emp_dept+'('+asIs_deptNo+')轉出';  // 組合轉調訊息
                        document.getElementById(`Transition,${select_empId}`).innerText = '';               // 清空innerText內容
                        document.getElementById(`Transition,${select_empId}`).insertAdjacentHTML('beforeend', Transition_inner_Value);     // 渲染轉調

                        
                    }
                // console.log(asIs_deptNo, toBe_deptNo, checkChange(asIs_deptNo, toBe_deptNo), empData['shCondition']);
                resolve();  // 當所有設置完成後，resolve Promise
            });
        }
        // 更新資格驗證(1by1)
        async function updateShCondition(ShCondition_value, select_empId) {
            return new Promise((resolve) => {
                // step1.處理[資格驗證]shCondition欄位
                // let inner_Value = JSON.stringify(ShCondition_value).replace(/[{"}]/g, '');
                let inner_Value = JSON.stringify(ShCondition_value).replace(/[\[\]{"}]/g, '');
                    inner_Value = inner_Value.replace(/,/g, '<br>');
                    inner_Value = inner_Value.replace(/true/g, '&nbsp;<span class="badge bg-success">true</span>');
                document.getElementById(`shCondition,${select_empId}`).insertAdjacentHTML('beforeend', inner_Value);
                
                // step2.處理[特檢資格]shIdentity欄位
                        // 文字串方式：
                        // let ShCondition_arr = [];
                        // Object.entries(ShCondition_value).forEach(([item, value]) => {
                        //     if(value){
                        //         ShCondition_arr.push(item)
                        //     }
                        //     const ShCondition_str = JSON.stringify(ShCondition_arr).replace(/[\[\]{"}]/g, '');
                        //     document.getElementById(`shIdentity,${select_empId}`).innerHTML = '';
                        //     document.getElementById(`shIdentity,${select_empId}`).insertAdjacentHTML('beforeend', ShCondition_str);
                        // })
                // 球型標籤方式：
                document.getElementById(`shIdentity,${select_empId}`).innerHTML = '';
                Object.entries(ShCondition_value).forEach(([item, value]) => {
                    if(value){
                        const inner_item = `<span class="badge rounded-pill bg-success">${item}</span>`;
                        document.getElementById(`shIdentity,${select_empId}`).insertAdjacentHTML('beforeend', inner_item);
                    }
                })
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
            // 取得當前年份currentYear
            const hiredDate = new Date(HIRED);              // 將 HIRED 字串轉換為日期物件
            const hiredYear = hiredDate.getFullYear();      // 取得 HIRED 的年份
            return hiredYear === currentYear;               // 比較 HIRED 的年份與當前年份
        }
        // 240906 check fun-3 驗證[變更檢查]是否符合   
        function checkChange(asIs_deptNo, toBe_deptNo) {
            return asIs_deptNo !== toBe_deptNo;        // 比較 dept_no 前後是否一致
        }

        // 渲染特危項目 for p-2特作欄位(arr_All)
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
                    await updateShCondition(shCondition, select_empId);
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
                    const select_empId = document.querySelector('#import_shLocal #import_shLocal_empId').innerText;
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
                                        "regular" : false,          // 常態
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
                                    const eh_time_input = document.querySelector(`input[id="eh_time,${select_empId}"]`);
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
                            updateShCondition(empData.shCondition, select_empId);
                        }
                        // console.log('reload_shLocalTable_Listeners--empData...', empData);      // 這裡會顯示一筆empData
                    }
                };
                // 添加新的監聽器
                importShLocalBtn.addEventListener('click', importShLocalBtnListener);
                resolve();
            });
        }

        
    // [p-1]
        // [p1 函數-1] 動態生成部門代號字串並貼在#OSHORTs位置
        function mk_OSHORTs(selectedValues) {
            const selectedOSHORTs = selectedValues.reduce((acc, value) => {
                if (OSHORTsObj[value]) { // 檢查選擇的值是否存在於OSHORTsObj中
                    acc[value] = OSHORTsObj[value];
                }
                return acc;
            }, {});
            const selectedOSHORTs_str = JSON.stringify(selectedOSHORTs).replace(/[\[\]]/g, '');
            $('#OSHORTs').empty().append(selectedOSHORTs_str);                                                          // 將生成的字串貼在<OSHORTs>元素中
            mk_OSHORTs_btn(selectedOSHORTs);                                                                            // 呼叫函數-1-1來生成按鈕
            mk_select_OSHORTs(Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[type="checkbox"]')));    // 更新 select_OSHORTs 的內容
        }
        // [p1 函數-1-1] 動態生成步驟2的所有按鈕，並重新綁定事件監聽器
        function mk_OSHORTs_btn(selectedOSHORTs) {
            $('#OSHORTs_opts_inside').empty();
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

            // 重新綁定事件監聽器
            rebindOSHORTsOptsListeners();
        }

        // [p1 函數-2] 根據步驟2的選擇動態生成部門代號字串
        function mk_select_OSHORTs(OSHORTs_opts_arr) {
            const selectedOptsValues = OSHORTs_opts_arr.filter(cb => cb.checked).map(cb => cb.value);

            OSHORTs_opts.classList.toggle('is-invalid', selectedOptsValues.length === 0);
            OSHORTs_opts.classList.toggle('is-valid', selectedOptsValues.length > 0);
            
            load_hrdb_btn.classList.toggle('is-invalid', selectedOptsValues.length === 0);
            load_hrdb_btn.disabled = selectedOptsValues.length === 0 ;                  // 取得人事資料庫btn
            
            const selectedOptsValues_str = JSON.stringify(selectedOptsValues).replace(/[\[\]]/g, '');
            $('#select_OSHORTs').empty().append(selectedOptsValues_str); // 將生成的字串貼在<select_OSHORTs>元素中
        }
        // [p1 函數-4] 重新綁定事件監聽器給#OSHORTs_opts內的checkbox
        function rebindOSHORTsOptsListeners() {
            const OSHORTs_opts_arr = Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[type="checkbox"]'));
            OSHORTs_opts_arr.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    mk_select_OSHORTs(OSHORTs_opts_arr); // 呼叫函數-2
                });
            });
        }

        // [p1 函數-3] 設置事件監聽器和MutationObserver
        async function p1_eventListener() {
            return new Promise((resolve) => {
                // p1. [通用]在任何地方啟用工具提示框
                $('[data-toggle="tooltip"]').tooltip();

                // p1-1a. 監聽步驟1[棟別]的checkbox變化
                    const OSHORTsDiv = document.getElementById('OSHORTs');               // 定義OSHORTsDiv變量
                    const OSHORTs_opts = document.getElementById('OSHORTs_opts_inside'); // 定義OSHORTs_opts變量
                    OSTEXT_30s.forEach(checkbox => {
                        checkbox.addEventListener('change', function() {
                            if (this.value === 'All') {
                                OSTEXT_30s.forEach(cb => cb.checked = this.checked); // 全選或取消全選
                            } else {
                                const allCheckbox = OSTEXT_30s.find(cb => cb.value === 'All');
                                const nonAllCheckboxes = OSTEXT_30s.filter(cb => cb.value !== 'All');
                                allCheckbox.checked = nonAllCheckboxes.every(cb => cb.checked); // 更新"All"狀態
                            }

                            const selectedValues = OSTEXT_30s.filter(cb => cb.checked).map(cb => cb.value);
                            OSTEXT_30_Out.classList.toggle('is-invalid', selectedValues.length === 0);
                            OSTEXT_30_Out.classList.toggle('is-valid', selectedValues.length > 0);

                            mk_OSHORTs(selectedValues); // 呼叫函數-1生成部門代號字串
                        });
                    });
                    // p1-1b. 初始化監聽器
                    rebindOSHORTsOptsListeners();

                // p1-2a. 使用MutationObserver監控OSHORTs區域內文本變化
                    const observer = new MutationObserver(() => {
                        const isEmpty = OSHORTsDiv.innerText.trim() === '';
                        OSHORTs_opts.classList.toggle('is-invalid', isEmpty);
                        OSHORTs_opts.classList.toggle('is-valid', !isEmpty);
                        // 每次 OSHORTs 變動時也更新 select_OSHORTs 的內容
                        mk_select_OSHORTs(Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[type="checkbox"]')));
                    });
                    // p1-2b. 設置觀察選項並開始監控
                    observer.observe(OSHORTsDiv, { childList: true, subtree: true }); 

                // p1-3. 監聽 load_hrdb_btn 取得人事資料庫
                load_hrdb_btn.addEventListener('click', function() {
                    const select_OSHORTs_str = document.getElementById('select_OSHORTs').innerText; // 取得部門代號字串
                    // load_fun('load_hrdb', select_OSHORTs_str, post_hrdb);               // 呼叫load_fun 用 部門代號字串 取得 人員清單 => post_hrdb渲染
                    load_fun('load_hrdb', select_OSHORTs_str, mgInto_staff_inf);         // 呼叫load_fun 用 部門代號字串 取得 人員清單 => 合併到mgInto_staff_inf post_hrdb渲染
                    inside_toast('取得&nbsp;hrdb員工清單...Done&nbsp;!!');
                    $('#nav-p2-tab').tab('show');                                       // 切換頁面
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
                    let tr = '<tr>';
                    tr += `<td>${emp_i.emp_sub_scope}</td> <td>${emp_i.dept_no}</br>${emp_i.emp_dept}</td>`;

                    tr += `<td>${emp_i.emp_id}</br><button type="button" class="btn btn-outline-primary add_btn " name="emp_id" value="${emp_i.emp_id}" `;
                        tr += emp_i.HIRED ? ` title="到職日：${emp_i.HIRED}" ` : ``;
                        tr += `data-bs-toggle="modal" data-bs-target="#import_shLocal" onclick="reNew_empId(this.value)">${emp_i.cname}</button></td>`;
                    // tr += `<td>${emp_i.emp_id}</br><span ` + (emp_i.HIRED ? ` title="到職日：${emp_i.HIRED}" ` : ``) + `>${emp_i.cname}</span></td>`;        // 檢查類別代號 開啟 importShLocal_modal

                    tr += `<td><p id="MONIT_LOCAL,${emp_i.emp_id},${currentYear}"></p><p id="MONIT_LOCAL,${emp_i.emp_id},${preYear}"></p></td>
                           <td><p id="WORK_DESC,${emp_i.emp_id},${currentYear}"></p><p id="WORK_DESC,${emp_i.emp_id},${preYear}"></p></td>
                           <td class="HE_CATE"><p id="HE_CATE,${emp_i.emp_id},${currentYear}"></p><p id="HE_CATE,${emp_i.emp_id},${preYear}"></p></td>
                           <td><p id="AVG_VOL,${emp_i.emp_id},${currentYear}"></p><p id="AVG_VOL,${emp_i.emp_id},${preYear}"></p></td>
                           <td><p id="AVG_8HR,${emp_i.emp_id},${currentYear}"></p><p id="AVG_8HR,${emp_i.emp_id},${preYear}"></p></td>`;
                    tr += `<td><input type="number" id="eh_time,${emp_i.emp_id},${currentYear}" name="eh_time" class="form-control" onchange="change_eh_time(this.id, this.value)" >`;
                        tr += `<input type="number" id="eh_time,${emp_i.emp_id},${preYear}" name="eh_time" class="form-control" onchange="change_eh_time(this.id, this.value)" ></td>`;
                    tr += `<td><p id="NC,${emp_i.emp_id},${currentYear}"></p><p id="NC,${emp_i.emp_id},${preYear}"></p></td>`;

                    tr += `<td><input type="checkbox" id="SH3,${emp_i.emp_id},${currentYear}" name="emp_ids[]" value="${emp_i.emp_id}" class="form-check-input" >`;
                        tr += `<input type="checkbox" id="SH3,${emp_i.emp_id},${preYear}" name="emp_ids[]" value="${emp_i.emp_id}" class="form-check-input" >`;
                        tr += `&nbsp;&nbsp;<button type="button" class="btn btn-outline-danger btn-sm btn-xs add_btn" value="${emp_i.emp_id}" onclick="eraseStaff(this.value)">刪除</button>`;
                        tr += `<br><p id="shIdentity,${emp_i.emp_id},${currentYear}"></p><p id="shIdentity,${emp_i.emp_id},${preYear}"></p></td>`;
                    
                    // tr += emp_i.HIRED ? `<td>${emp_i.HIRED}</td>` : `<td> -- </td>`;
                    tr += `<td><p id="shCondition,${emp_i.emp_id},${currentYear}"></p><p id="shCondition,${emp_i.emp_id},${preYear}"></p></td>`;
                    tr += `<td><button class="btn btn-primary btn-sm btn-xs" type="button" value="${emp_i.cname},${emp_i.emp_id}" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">紀錄</button>`;
                        tr += `<br><p id="Transition,${emp_i.emp_id},${currentYear}"></p><p id="Transition,${emp_i.emp_id},${preYear}"></p></td>`;

                    tr += '</tr>';
                    $('#hrdb_table tbody').append(tr);
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
                    const edit_emp_id = this_id_arr[1];                     // 取出陣列1=emp_id
                    $('#import_shLocal #import_shLocal_empId').empty().append(edit_emp_id); // 清空+填上工號
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
                    updateShCondition(shCondition, select_empId);
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
                    import_excel_btn.addEventListener('click', ()=> {
                        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                        var excel_json = iframeDocument.getElementById('excel_json');           // 正確載入
                        var stopUpload = iframeDocument.getElementById('stopUpload');           // 錯誤訊息

                        if (excel_json) {
                            document.getElementById('excelTable').value = excel_json.value;
                            const excel_json_value_arr = JSON.parse(excel_json.value);
                            
                            // rework_loadStaff(excel_json_value_arr)      // 呼叫[fun] rework_loadStaff() 這個會呼叫hrdb更新資料
                            mgInto_staff_inf(excel_json_value_arr)      // 呼叫[fun] 
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
        function mk_dept_nos_btn(selecteddept_no) {
            $('#dept_no_opts_inside').empty();
            if(Object.entries(selecteddept_no).length > 0){     // 判斷使否有長度值
                Object.entries(selecteddept_no).forEach(([emp_sub_scope, oh_value]) => {
                    let ostext_btns = `
                        <div class="col-lm-3">
                            <div class="card">
                                <div class="card-header">${emp_sub_scope}</div>
                                <div class="card-body p-2">
                                    ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                        `<div class="form-check px-1">
                                            <button type="button" class="btn btn-outline-success add_btn " name="dept_no[]" value="${o_key}" >${o_key} (${o_value.OSTEXT}) ${o_value._count}件</button>
                                        </div>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>`;
                    $('#dept_no_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<dept_no_opts_inside>元素中
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
                $('#dept_no_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<dept_no_opts_inside>元素中
            }
            // 重新綁定dept_no_opts事件監聽器
            const dept_no_opts_arr = Array.from(document.querySelectorAll('#dept_no_opts_inside button[name="dept_no[]"]'));
            dept_no_opts_arr.forEach(dept_no_btn => {
                dept_no_btn.addEventListener('click', function() {
                    load_fun('load_staff_byDeptNo', this.value, rework_loadStaff);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                });
            });

        }
    // p-3：[load_staff]


    $(function() {
        // [步驟-1] 初始化設置
        const selectedValues = OSTEXT_30s.filter(cb => cb.checked).map(cb => cb.value);
        mk_OSHORTs(selectedValues);     // 呼叫函數-1 生成p1廠區按鈕
        mk_dept_nos_btn(dept_nosObj);   // 呼叫函數-2 生成p3部門按鈕
        p1_eventListener();                // 呼叫函數-3 建立監聽
        p2_eventListener();                // 呼叫函數-3 建立監聽

        // let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        let message  = '*** 完成員工存檔、更新與呼出還原功能! ... 歷史資料檢視在側邊顯示&nbsp;~';
        Balert( message, 'warning')

    });
