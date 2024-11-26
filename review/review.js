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
    // fun.0-4a: dataTable  // https://ithelp.ithome.com.tw/articles/10272439
    async function reload_dataTable(hrdb_data){
        return new Promise((resolve) => {
            release_dataTable();                                                // 呼叫[fun.0-4b] 停止並銷毀 DataTable
            $('#hrdb_table').DataTable({                                        // 重新初始化 DataTable
                "language": { url: "../../libs/dataTables/dataTable_zh.json" }, // 中文化
                "autoWidth": false,                                             // 自動寬度
                "order": [[ 2, "asc" ], [ 1, "asc" ], [ 0, "asc" ]],            // 排序
                "pageLength": 25,                                               // 顯示長度
            });
            resolve();                                                          // 當所有設置完成後，resolve Promise
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
                // console.log('removeDuplicateShCase...',shCaseArray);
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
                // console.log(Array.from(uniqueShCaseMap.values()));
                return Array.from(uniqueShCaseMap.values());
            }
        // 240822 將匯入資料合併到staff_inf
        async function mgInto_staff_inf(source_json_value_arr){
            // const source_json_value_arr = JSON.parse(source_json_value);
            // console.log('2.source_json_value_arr...', source_json_value_arr);
            const addIn_arr1 = ['HE_CATE', 'HE_CATE_KEY', 'no' ];                                        // 合併陣列1
            const addIn_arr2 = {'OSTEXT_30':'emp_sub_scope', 'OSHORT':'dept_no', 'OSTEXT':'emp_dept'};   // 合併陣列2
            const addIn_arr3 = ['yearHe', 'yearCurrent', 'yearPre'];                                     // 合併陣列3 匯入1、2、3
            const source_OSHORT_arr = [];

            for (const e_key of Object.keys(source_json_value_arr)) {
                // 初始化 shCase 陣列
                if (!source_json_value_arr[e_key]['shCase']) { source_json_value_arr[e_key]['shCase'] = []; }         // 特作案件紀錄陣列建立
                if (!source_json_value_arr[e_key]['eh_time']) { source_json_value_arr[e_key]['eh_time'] = null; }     // eh_time在這裡要先建立，避免驗證錯誤跳脫

                if (!source_json_value_arr[e_key]['_content']) { source_json_value_arr[e_key]['_content'] = {}; }         // 特作案件紀錄陣列建立
                if (!source_json_value_arr[e_key]['_content'][`${currentYear}`]) { source_json_value_arr[e_key]['_content'][`${currentYear}`] = {}; }         // 特作案件紀錄陣列建立
                if (!source_json_value_arr[e_key]['_content'][`${currentYear}`]['import']) { source_json_value_arr[e_key]['_content'][`${currentYear}`]['import'] = {}; }         // 特作案件紀錄陣列建立
                // 建立一個新的物件來儲存合併的資料
                let mergedData = {};
                let importData = {};
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
                        if(a2_key == 'OSHORT'){
                            source_OSHORT_arr.push(source_json_value_arr[e_key][a2_value])  // extra: 取得部門代號 => 抓特危場所清單用
                        }
                    }
                }

                // 遍歷合併陣列3 addIn_arr3 並合併數據
                addIn_arr3.forEach((addIn_i) => {
                    if (source_json_value_arr[e_key][addIn_i]) {
                        importData[addIn_i] = source_json_value_arr[e_key][addIn_i];     // 合併
                        delete source_json_value_arr[e_key][addIn_i];                    // 刪除合併後的屬性
                    }
                });

                // 241028 補強提取資料後原本只抓最外層的部門代號'shCase，補上shCase_logs內當年度'shCase
                if(source_json_value_arr[e_key]['shCase_logs'] !== undefined && source_json_value_arr[e_key]['shCase_logs'][currentYear]){
                    if(source_json_value_arr[e_key]['shCase_logs'][currentYear]['dept_no']){
                        source_OSHORT_arr.push(source_json_value_arr[e_key]['shCase_logs'][currentYear]['dept_no']);    // 241104 抓取shCase_logs 年度 下的部門代號 => 抓特危場所清單用
                    }
                    let i_shCase = source_json_value_arr[e_key]['shCase_logs'][currentYear]['shCase'];
                    if(i_shCase != null && i_shCase.length > 0){
                        for (const [i_shCase_key, i_shCase_value] of Object.entries(i_shCase)) {
                            source_OSHORT_arr.push(i_shCase_value.OSHORT)               // extra: 取得部門代號 => 抓特危場所清單用
                        }
                    }
                }

                // 將合併後的物件加入 shCase 陣列中
                if( Object.keys(mergedData).length > 0 && mergedData['HE_CATE']){       // 限制要有'HE_CATE'檢查類別代號才能合併
                    source_json_value_arr[e_key]['shCase'].push(mergedData);
                    // 使用 await 調用 removeDuplicateShCase 去重
                    source_json_value_arr[e_key]['shCase'] = await removeDuplicateShCase(source_json_value_arr[e_key]['shCase']);
                }

                // 將合併後的物件加入 _content/import 陣列中
                if( Object.keys(importData).length > 0 ){       
                    // source_json_value_arr[e_key]['_content'][`${currentYear}`]['import'].push(importData);
                    source_json_value_arr[e_key]['_content'][`${currentYear}`]['import'] = importData;
                    // 使用 await 調用 removeDuplicateShCase 去重
                    // source_json_value_arr[e_key]['_content'][`${currentYear}`]['import'] = await removeDuplicateShCase(source_json_value_arr[e_key]['_content'][`${currentYear}`]['import']);
                }
            };

            // 240826 進行emp_id重複值的比對並合併
                let combined = staff_inf.concat(source_json_value_arr);                                  // 合併2個陣列到combined
                let uniqueStaffMap = new Map();                                                         // 創建一個 Map 來去除重複的 emp_id 並合併 shCase
                await combined.forEach(item => {
                    if (uniqueStaffMap.has(item.emp_id)) {
                        // 如果 emp_id 已經存在，則合併 shCase 和 shCondition
                        let existingShCase       = uniqueStaffMap.get(item.emp_id).shCase;
                        let existingShCondition  = uniqueStaffMap.get(item.emp_id).shCondition || {};    // 初始化 shCondition 為空物件
                        let existingShCase_logs  = uniqueStaffMap.get(item.emp_id).shCase_logs || {};    // 初始化 shCase_logs 為空物件
                        let existing_content     = uniqueStaffMap.get(item.emp_id)._content || {};       // 初始化 _content 為空物件

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
                        if (!item._content[`${currentYear}`]) {  item._content[`${currentYear}`] = {};  }
                        if (!item._content[`${currentYear}`]['import']) {  item._content[`${currentYear}`]['import'] = {};  }

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
        // 240826 單筆放棄Staff資料
        async function eraseStaff(removeEmpId){
            if(!confirm(`確認放棄此筆(${removeEmpId})資料？`)){
                return;
            }else{
                // 創建一個 Map 來去除重複的 emp_id 並合併 shCase
                let uniqueStaffMap = new Map();
                staff_inf.forEach(item => {
                    if (item.emp_id === removeEmpId) {  // 跳過這個 emp_id，達到放棄的效果
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
                inside_toast(`放棄單筆資料${removeEmpId}...Done&nbsp;!!`);
            }
        }
        // 240904 load_staff_byDeptNo       ；call from mk_dept_nos_btn()...load_fun(myCallback)...
        async function rework_loadStaff(loadStaff_arr){
            loadStaff_tmp = [];     // 清空臨時陣列...
            //step1. 依工號查找hrdb，帶入最新員工資訊 到 staff_inf
            for (const [s_index, s_value] of Object.entries(loadStaff_arr)) {
                const select_empId = (s_value['emp_id'] !== undefined) ? s_value['emp_id'] : null;      // step1-1.取出emp_id
                const empData = staff_inf.find(emp => emp.emp_id === select_empId);                     // step1-2.查找staff_inf內該員工是否存在
                // 241022 -- 為了套入Excel後儲存原始資料，不進行強制套用hrdb資料....主要For T6
                if(!empData){                                                                           // step1-3.沒資料就進行hrdb查詢..241101 暫停取用hrdb進行更新。???
                    await search_fun('rework_loadStaff', select_empId);                                 // 確保每次search_fun都等待完成
                }
            }
            // step2.等待上面搜尋與合併臨時欄位loadStaff_tmp完成後...
            for (const [s_index, s_value] of Object.entries(loadStaff_tmp)) {
                const select_empId = (s_value['emp_id'] !== undefined) ? s_value['emp_id'] : null;      // step2-1.取出emp_id
                let empData = loadStaff_arr.find(emp => emp.emp_id === select_empId);                   // step2-2. 先取得select_empId的個人資料=>empData
                // empData = empData.concat(loadStaff_tmp[s_index]);                                       // 合併2個陣列
                empData = empData ? empData : {};                                                       // step2-3. 確保 empData 是陣列，否則初始化為空陣列
                // Object.assign(empData, loadStaff_tmp[s_index]);                                         // step2-4. 如果 empData 是一個物件而不是陣列，需要將其轉換成陣列或合併物件 241101 暫停取用hrdb進行更新。???
                // 241101 暫停取用hrdb進行更新。 改用下面：
                    empData.gesch    = s_value.gesch;
                    empData.natiotxt = s_value.natiotxt;
                    empData.HIRED    = s_value.HIRED;
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
                        'emp_sub_scope' : staffValue.emp_sub_scope,     // 人事子範圍名稱
                        'emp_id'        : staffValue.emp_id,
                        'cname'         : staffValue.cname,
                        'dept_no'       : staffValue.dept_no,           // 簽核部門代碼
                        'emp_dept'      : staffValue.emp_dept,          // 簽核部門物件長名
                        'HIRED'         : staffValue.HIRED,             // 到職日
                        'cstext'        : staffValue.cstext,            // 職稱物件長名
                        'gesch'         : staffValue.gesch,             // 性別
                        'emp_group'     : staffValue.emp_group,         // 員工群組名稱
                        'natiotxt'      : staffValue.natiotxt,          // 國籍名稱
                        'schkztxt'      : staffValue.schkztxt           // 工作時程表規則名稱
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
            // await post_preYearShCase(staff_inf);        // step-1-1.重新渲染去年 shCase&判斷  // 241024 停止撲到下面
            await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
            if(sys_role <= '3'){                        // 限制role <= 3 現場窗口以下...排除主管和路人
                await reload_HECateTable_Listeners();   // 重新定義HE_CATE td   // 關閉可防止更動 for簽核
                await reload_shConditionTable_Listeners();
            }else{
                changeHE_CATEmode();                    // 241108 改變HE_CATE calss吃css的狀態；主要是主管以上不需要底色編輯提示
                changeShConditionMode();
            }
            await btn_disabled();                       // 讓指定按鈕 依照staff_inf.length 啟停 
        }
        // 讓指定按鈕 依照staff_inf.length 啟停
        function btn_disabled(){
            return new Promise((resolve) => {
                download_excel_btn.disabled = staff_inf.length === 0;  // 讓下載按鈕啟停
                bat_storeStaff_btn.disabled = staff_inf.length === 0;  // 讓儲存按鈕啟停
                resetINF_btn.disabled       = staff_inf.length === 0;  // 讓清除按鈕啟停

                const form_btn_div = Array.from(document.querySelectorAll('#form_btn_div button'));
                form_btn_div.forEach(form_btn => {
                    form_btn.disabled = staff_inf.length === 0;
                })

                resolve();
            });
        }


        // 渲染 今年目前特危項目 for p-2特作欄位(arr_All)
        async function post_shCase(emp_arr){
            for (const emp_i of emp_arr) {      // 使用 for...of 替代 forEach 因為 forEach 不會等待 await 的執行
                const { emp_id: select_empId, shCase ,shCondition} = emp_i;
                // console.log('post_shCase--select_empId, shCase ,shCondition...', select_empId, shCase ,shCondition);
                // doCheck(select_empId);          // 更新驗證項目(1by1)
                clearDOM(select_empId);         // 你需要根據 select_empId 來清空對應的 DOM
                if (shCase) {
                    let index = 0;
                    for (const [sh_key, sh_value] of Object.entries(shCase)) {
                        await updateDOM(sh_value, select_empId, index);
                        index++;
                    }                
                }
                // 更新資格驗證(1by1)
                if (shCondition) {
                    await updateShCondition(shCondition, select_empId, currentYear);
                }
            };
        }
        // 點擊姓名鋪設到下面 渲染preYear去年特危項目 for p-2特作欄位(select_empId)     // 241024 
        async function show_preYearShCase(select_empId){
            const empData = staff_inf.find(emp => emp.emp_id === select_empId);
            let tr1 = `<div class="col-12 text-center"> ~ 無 ${preYear} 儲存紀錄 ~ </div>`;
            // console.log('show_preYearShCase...empData...', empData);
            if(empData.shCase_logs != undefined && (empData.shCase_logs[preYear] != undefined)){
                console.log('show_preYearShCase...empData...', empData.shCase_logs);
                // 鋪設t-body
                const tdClass = `<td><div class="bottom-half"`;
                const empId_preYear = `,${select_empId},${preYear}"></div></div></td>`;
                    tr1 = '<tr>';
                    tr1 += tdClass + ` id="emp_id`        + empId_preYear;
                    tr1 += tdClass + ` id="emp_sub_scope` + empId_preYear;
                    tr1 += tdClass + ` id="emp_dept`      + empId_preYear;
                    tr1 += tdClass + ` id="MONIT_LOCAL`   + empId_preYear;
                    tr1 += tdClass + ` id="WORK_DESC`     + empId_preYear;
                    tr1 += tdClass + ` id="HE_CATE`       + empId_preYear;
                    tr1 += tdClass + ` id="AVG_VOL`       + empId_preYear;
                    tr1 += tdClass + ` id="AVG_8HR`       + empId_preYear;
                    tr1 += tdClass + `><snap id="eh_time,${select_empId},${preYear}"></snap></div></td>`;
                    tr1 += tdClass + ` id="NC`            + empId_preYear;
                    tr1 += tdClass + ` id="shIdentity`    + empId_preYear;
                    tr1 += tdClass + ` id="shCondition`   + empId_preYear;
                    tr1 += tdClass + ` id="change,${select_empId},${currentYear}"></div></td>`;
                    tr1 += tdClass + ` id="yearHe`        + empId_preYear;
                    tr1 += tdClass + ` id="yearCurrent`   + empId_preYear;
                    tr1 += tdClass + ` id="yearPre`       + empId_preYear;
                    tr1 += '</tr>';
                $('#shCase_table tbody').empty().append(tr1);
    
                const { shCase_logs } = empData;
                const preYear_shCaseLog = shCase_logs[preYear];
    
                if(preYear_shCaseLog){
                    const { shCase ,shCondition, emp_dept, emp_sub_scope, dept_no } = preYear_shCaseLog;
                    clearDOM(select_empId, preYear);            // 你需要根據 select_empId 來清空對應的 DOM
                    // step.1 欄位1,2,3
                    document.getElementById(`emp_id,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', `<b>${empData.emp_id}</b><br>${empData.cname}`); 
                    document.getElementById(`emp_sub_scope,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', `<b>${preYear}：</b><br>${emp_sub_scope}`); 
                    document.getElementById(`emp_dept,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', `${dept_no}<br>${emp_dept}`);              
    
                    // step.2 更新shCase欄位4,5,6,7,8,9,10
                    if (shCase) {
                        // step.2 欲更新的欄位陣列 - 對應欄位4,5,6,7,8,9,10
                        const shLocal_item_arr = ['MONIT_LOCAL', 'WORK_DESC', 'HE_CATE', 'AVG_VOL', 'AVG_8HR', 'eh_time'];
                        let index = 1;
                        for (const [sh_key, sh_value] of Object.entries(shCase)) {
                            // step.2 將shLocal_item_arr循環逐項進行更新
                            shLocal_item_arr.forEach((sh_item) => {
                                // step.2a 項目渲染...
                                const br = index > 1 ? '<br>' : '';         // 判斷 1以上=換行
                                let inner_Value = '';
                                if (sh_value[sh_item] !== undefined) {      // 確認不是找不到的項目
                                    if (sh_item === 'HE_CATE'){             // 3.類別代號 特別處理：1.物件轉字串、2.去除符號
                                        let he_cate_str = JSON.stringify(sh_value[sh_item]).replace(/[{"}]/g, '');
                                        inner_Value = `${br}${he_cate_str}`;
                                    }else if(sh_item.includes('AVG')){      // 4.5.均能音壓、平均音壓 特別處理：判斷是空值，就給他一個$nbsp;佔位
                                        let avg_str = sh_value[sh_item] ? sh_value[sh_item] : '&nbsp;';
                                        inner_Value = `${br}${avg_str}`;
                                    }else if(sh_item === 'MONIT_LOCAL'){    // 特別處理：MONIT_LOCAL
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
                                            empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : false;
                                    }
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
                    // step.4 更新項目類別代號、檢查項目、去年檢查項目 - 對應欄位13,14,15
                    const _content_import = empData._content[`${preYear}`]['import'] !== undefined ? empData._content[`${preYear}`]['import'] : {};
                    if(_content_import){
                        const importItem_arr = ['yearHe', 'yearCurrent', 'yearPre'];
                        importItem_arr.forEach((importItem) => {
                            let importItem_value = (_content_import[importItem] != undefined ? _content_import[importItem] :'').replace(/,/g, '<br>');
                            document.getElementById(`${importItem},${select_empId},${preYear}`).insertAdjacentHTML('beforeend', importItem_value);     // 渲染各項目
                        })
                    }
                }
            }else{
                $('#shCase_table tbody').empty().append(tr1);       // ~ 無儲存紀錄 ~
            }
        }
        // 渲染到shLocal互動視窗 for shLocal modal互動視窗
        async function post_shLocal(shLocal_arr){
            $('#shLocal_table tbody').empty();
            if(shLocal_arr.length === 0){
                $('#shLocal_table tbody').append('<div class="text-center text-dnager">沒有資料</div>');
            }else{
                shLocal_inf = shLocal_arr;                                           // 把shLocal_inf建立起來
                Object.entries(shLocal_arr).forEach(([sh_key, sh_i])=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
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
                    const useImportShLocal_value = document.getElementById('useImportShLocal');     // 保留沿用選項值

                    if (empData) {
                        // empData.shCase = empData.shCase || [];
                        // empData.shCase = [];            // 特檢項目：直接清空，讓後面重新帶入
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
                            // 更新驗證項目(1by1)
                                // doCheck(select_empId);
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
                                        updateDOM(shLocal_inf[sov_vaule], select_empId, index);
                                                // [停用] 過濾...emp的部門代號 與 shLocal的部門代號是否一致...才准許導入
                                                    // if(empData.dept_no !== shLocal_inf[sov_vaule]['OSHORT']){
                                                    //     inside_toast(`選用之特危作業(${shLocal_inf[sov_vaule]['HE_CATE']}) 其部門代號(${shLocal_inf[sov_vaule]['OSHORT']})與員工部門代號(${empData.dept_no}) 不一致...返回&nbsp;!!`);
                                                    // }
                                    });
                                }
                        // 更新資格驗證(1by1)
                        if (empData.shCondition) {
                            updateShCondition(empData.shCondition, select_empId, currentYear);
                        }
                        console.log('reload_shLocalTable_Listeners--empData...', empData);      // 這裡會顯示一筆empData
                    }
                    // 241118 選擇特危項目之保留沿用
                    if(!useImportShLocal_value.checked){
                        const selectedOptsItems = Array.from(document.querySelectorAll('#import_shLocal #shLocal_table input[type="checkbox"]'));
                        selectedOptsItems.forEach(input => { if (input.checked) { input.checked = false; } });  // 清除已勾選的項目
                    }
                };
                // 添加新的監聽器
                importShLocalBtn.addEventListener('click', importShLocalBtnListener);
                resolve();
            });
        }

            // 240912 [子功能] 將Obj物件進行Key的排列...call from searchWorkCaseAll()
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
        









        
// [p-2]
        
    // [p2 函數-1] 渲染hrdb
    async function post_hrdb(emp_arr){
        $('#hrdb_table tbody').empty();
        if(emp_arr.length === 0){
            $('#hrdb_table tbody').append('<div class="text-center text-dnager">沒有資料</div>');
        }else{
            await release_dataTable();                            // 停止並銷毀 DataTable
            const importItem_arr = ['yearHe', 'yearCurrent', 'yearPre'];
            await Object(emp_arr).forEach((emp_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                let tr1 = '<tr>';
                const empId_currentYear = `,${emp_i.emp_id},${currentYear}">`;
                const _content_import = emp_i._content[`${currentYear}`]['import'] !== undefined ? emp_i._content[`${currentYear}`]['import'] : {};

                tr1 += `<td class="">
                            <div class="col-12 p-0">${emp_i.emp_id}</br><button type="button" class="btn btn-outline-primary add_btn " name="emp_id" value="${emp_i.cname},${emp_i.emp_id}" `
                                + (emp_i.HIRED ? ` title="到職日：${emp_i.HIRED}" ` : ``) +` data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">${emp_i.cname}</button></div>`
                            + `<div class="col-12 pt-1 pb-0 px-0" >
                                <input type="checkbox" id="SH3,${emp_i.emp_id},${currentYear}" name="emp_ids[]" value="${emp_i.emp_id}" class="form-check-input" >&nbsp;&nbsp;
                                <button type="button" class="btn btn-outline-danger btn-sm btn-xs add_btn" value="${emp_i.emp_id}" onclick="eraseStaff(this.value)">刪除</button></div>
                            </td>`;
                tr1 += `<td><b>${currentYear}：</b><br>`+ ((emp_i.emp_sub_scope != undefined ? emp_i.emp_sub_scope : emp_i.shCase_logs[currentYear].emp_sub_scope )) +`</td>`;
                                                
                tr1 += `<td>`+ ((emp_i.dept_no != undefined ? emp_i.dept_no : emp_i.shCase_logs[currentYear].dept_no )) +`<br>`
                                + ((emp_i.emp_dept != undefined ? emp_i.emp_dept : emp_i.shCase_logs[currentYear].emp_dept )) +`</td>`;
                tr1 += `<td><div id="MONIT_LOCAL` + empId_currentYear + `</div></td>`;
                tr1 += `<td><div id="WORK_DESC` + empId_currentYear + `</div></td>`;

                // 240918 因應流程圖三需求，將選擇特作功能移到[檢查類別代號]...
                tr1 += `<td class="HE_CATE" id="${emp_i.cname},${emp_i.emp_id}"><div id="HE_CATE` + empId_currentYear + `</div></td>`;
                tr1 += `<td><div id="AVG_VOL` + empId_currentYear + `</div></td>`;
                tr1 += `<td><div id="AVG_8HR` + empId_currentYear + `</div></td>`;

                tr1 += `<td><input type="number" id="eh_time,${emp_i.emp_id},${currentYear}" name="eh_time" class="form-control" min="0" max="12" onchange="this.value = Math.min(Math.max(this.value, this.min), this.max); change_eh_time(this.id, this.value)" disabled></td>`;
                tr1 += `<td><div id="NC` + empId_currentYear + `</div></td>`;

                tr1 += `<td class="shCondition" id="${emp_i.cname},${emp_i.emp_id}"><div id="shCondition` + empId_currentYear + `</div></td>`;       // 資格驗證
                tr1 += `<td><div id="process` + empId_currentYear + `</div></td>`;       // 特檢資格

                importItem_arr.forEach((importItem) => {
                    let importItem_value = (_content_import[importItem] != undefined ? _content_import[importItem] :'').replace(/,/g, '<br>');
                    tr1 += `<td `+(sys_role <='3' ? '':'class="unblock"')+`>`+ importItem_value +`</td>`;
                })

                tr1 += '</tr>';
                $('#hrdb_table tbody').append(tr1);
            })
            await reload_dataTable(emp_arr);                // 倒參數(陣列)，直接由dataTable渲染
        }
        // 240905 [轉調]欄位增加[紀錄].btn：1.建立offcanvas_arr陣列。2.建立canva_btn監聽。3.執行fun，顯示於側邊浮動欄位offcanva。
            const offcanvas_arr = Array.from(document.querySelectorAll('button[aria-controls="offcanvasTop"]'));
            offcanvas_arr.forEach(canva_btn => {
                canva_btn.addEventListener('click', function() {
                    const this_value_arr = this.value.split(',')       // 分割this.value成陣列
                    // const select_cname = this_value_arr[0];            // 取出陣列0=cname
                    const select_empId = this_value_arr[1];            // 取出陣列1=emp_id
                    $('#offcanvasTop #offcanvas_title').empty().append('( '+ this.value +' )');     // 更新 header title  
                    show_preYearShCase(select_empId);
                });
            });

        $("body").mLoading("hide");
    }

    // [p2 函數] 建立監聽~shLocalTable的HE_CATE td for p-2特作欄位 // 檢查類別代號 開啟 importShLocal_modal
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
                importShLocal_modal.show();                             // 顯示互動視窗
            }
            // 添加新的監聽器
            HECate.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                tdItem.addEventListener('click', HECateClickListener);      // 將每一個tdItem增加監聽, 當按下click
            })
            resolve();
        });
    }
    // 241108 改變HE_CATE calss吃css的狀態；主要是主管以上不需要底色編輯提示
    function changeHE_CATEmode(){
        const isHECate = sys_role <= 3;
        const targetCate = document.querySelectorAll(isHECate ? '.xHE_CATE' : '.HE_CATE');  
        targetCate.forEach(tdItem => {
            tdItem.classList.toggle(isHECate ? 'HE_CATE'  : 'xHE_CATE');
            tdItem.classList.toggle(isHECate ? 'xHE_CATE' : 'HE_CATE');
        });
    }


    // 241121 建立shCondition監聽功能 for 編輯
    let shConditionClickListener;
    async function reload_shConditionTable_Listeners() {
        return new Promise((resolve) => {
            const shCondition = document.querySelectorAll('[class="shCondition"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (shConditionClickListener) {
                shCondition.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                    tdItem.removeEventListener('click', shConditionClickListener);   // 將每一個tdItem移除監聽, 當按下click
                })
            }
            // 定義新的監聽器函數
            shConditionClickListener = function () {
                // step.1 標題列顯示姓名工號
                const this_id_arr = this.id.split(',')                  // 分割this.id成陣列
                const edit_cname  = this_id_arr[0];                     // 取出陣列0=cname
                const edit_empId  = this_id_arr[1];                     // 取出陣列1=emp_id
                $('#edit_shCondition #edit_shCondition_empId').empty().append(`${edit_cname},${edit_empId}`); // 清空+填上工號
                // step.2 顯示身段資料列
                $('#edit_shCondition_table tbody').empty();             // 清空tbody
                const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
                const { shCase, shCondition, _content } = empData;
                
                // step.2_0 蒐集shCase['HE_CATE']
                let he_cate_obj = {};
                for (const sc_Vitem of shCase) {
                    if(Object.keys(sc_Vitem['HE_CATE']).length > 0) {
                        for (const [he_cate_i, he_cate_v] of Object.entries(sc_Vitem['HE_CATE'])) {
                            he_cate_obj[he_cate_i] = he_cate_v;
                        }
                    }
                }
                // 取得 匯入一
                const currentYear_yearHe = _content[currentYear] != undefined ? ( _content[currentYear]['import'] != undefined ? _content[currentYear]['import']['yearHe'] : null) : null;
                // step.2_1 轉換成物件
                if(currentYear_yearHe != null) {
                    const currentYear_yearHe_obj = currentYear_yearHe.split(',').reduce((obj, pair) => {
                        const [key, value] = pair.split(':'); // 使用 ":" 分割鍵和值
                        obj[key] = value; // 將鍵值對加入物件中
                        return obj;
                    }, {});   
                    // step.2_2 
                    if(Object.keys(currentYear_yearHe_obj).length > 0) {
                        for (const [yearHe_i, yearHe_v] of Object.entries(currentYear_yearHe_obj)) {
                            he_cate_obj[yearHe_i] = yearHe_v;
                        }
                    }
                }

                // step.2-1 定義欄列分類
                const shCondition_key = {
                    'newOne'  : { 'item' : '新人', 'type' : 'checkbox' },
                    'noise'   : { 'item' : '噪音', 'type' : 'checkbox' },
                    'regular' : { 'item' : '定期', 'type' : 'text' },
                    'change'  : { 'item' : '變更', 'type' : 'text' },
                };
                // step.2-2 逐條逐項 組合TR/TD並渲染到身段
                for (const [sh_key, sh_Vitem] of Object.entries(shCondition_key)) {
                    let sh_value = shCondition[sh_key] !== undefined ? shCondition[sh_key] : '';

                    let tr = `<tr><td class="text-end">${sh_key}</td><td class="text-center">${sh_Vitem['item']}</td><td>`;
                    switch (sh_Vitem['type']) {
                        case 'checkbox':        // for newOne、noise
                            tr += `<div class="form-check form-check-inline">`;
                            tr += `<input name="${sh_key}" id="${sh_key}" value="true" type="${sh_Vitem['type']}" class="form-check-input" ` + (sh_value ? 'checked' : '');
                            tr += ` ><label class="form-check-label" for="${sh_key}">true</label></div></td></tr>`;
                            break;

                        case 'text':
                            
                            let sh_value_arr = sh_value.split(';').filter(e => e !== "");   // 去除空格
                            // console.log('sh_value_arr...',sh_value_arr)

                            // 生成 檢查類別代號+項目類別代號
                            // console.log('he_cate_obj...',he_cate_obj)
                            for (const [he_cate_i, he_cate_v] of Object.entries(he_cate_obj)) {
                                tr += `<div class="form-check form-check-inline">`;
                                tr += `<input name="${sh_key}[]" id="${sh_key},${he_cate_i},${he_cate_v}" value="${he_cate_v}" type="checkbox" class="form-check-input" `; 
                                
                                tr += ((Object.values(sh_value_arr).includes(`${he_cate_v}`)) ? 'checked' : '');

                                tr += ` ><label class="form-check-label" for="${sh_key},${he_cate_i},${he_cate_v}">${he_cate_v}</label></div>`;
                            }
                            // 生成 資格驗證裡的舊項目
                            for (const sh_v of sh_value_arr) {
                                if (!Object.values(he_cate_obj).includes(`${sh_v}`) && `${sh_v}` != 'undefined') {
                                    tr += `<div class="form-check form-check-inline">`;
                                    tr += `<input name="${sh_key}[]" id="${sh_key},${sh_v}" value="${sh_v}" type="checkbox" class="form-check-input" checked `; 
                                    tr += ` ><label class="form-check-label" for="${sh_key},${sh_v}">${sh_v}</label></div>`;
                                }
                            }
                            // // 生成 其他 的輸入項目
                            // tr += `<div class="form-check form-check-inline">`;
                            // tr += `<input name="${sh_key}[]" id="${sh_key},other" type="checkbox" class="form-check-input" >`; 
                            // tr += `<input type="text" class="form-check-label" placeholder="其他" name="${sh_key}[]" id="${sh_key},otherValue"></div>`;

                            tr += `</td></tr>`
                            break;
                        default:
                    }
                    $('#edit_shCondition_table tbody').append(tr);          // 填上各列資料
                }
                // step.3 顯示互動視窗
                editShCondition_modal.show();                               // 顯示互動視窗
            }

            // 添加新的監聽器
            shCondition.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                tdItem.addEventListener('click', shConditionClickListener);      // 將每一個tdItem增加監聽, 當按下click
            })
            resolve();
        });
    }
    // 241108 改變ShCondition calss吃css的狀態；主要是主管以上不需要底色編輯提示
    function changeShConditionMode(){
        const isShCondition = sys_role <= 3;
        const targetCate = document.querySelectorAll(isShCondition ? '.xshCondition' : '.shCondition');  
        targetCate.forEach(tdItem => {
            tdItem.classList.toggle(isShCondition ? 'shCondition'  : 'xshCondition');
            tdItem.classList.toggle(isShCondition ? 'xshCondition' : 'shCondition');
        });
    }

    // p2-3. 監控按下[更新]]鍵後----自編輯modal資料載入更新
    editShCondition_btn.addEventListener('click', async function() {
        let editShCondition_tbody = document.querySelector('#edit_shCondition_table tbody');
        // 初始化結果物件
        let result = {};
        // 遍歷每一列
        editShCondition_tbody.querySelectorAll('tr').forEach(row => {
            // 取得該列的所有儲存格
            let cells = row.querySelectorAll('td');
            // 確保有兩個儲存格（item 和 value）
            if (cells.length === 3) {
                let key = cells[0].textContent.trim();          // 第 0 個儲存格的值
                // let item = cells[1].textContent.trim();         // 第 1 個儲存格的值
                // let cell  = cells[2].querySelector('input');    // 第 2 個儲存格的type
                let cell;    // 第 2 個儲存格的type
                // let input_value = cells[1].querySelector('input').value.trim(); // 第 2 個儲存格的值
                let input_value; // 第 2 個儲存格的值

                if(key == 'newOne' || key == 'noise') {
                    cell = cells[2].querySelector('input');    // 第 2 個儲存格的type
                    input_value = cell.checked;

                } else {
                    cell = Array.from(cells[2].querySelectorAll('input'));    // 第 2 個儲存格的type

                    for (const cell_i of cell) {
                        let br = input_value != '' ? ';' : '';

                        if (cell_i.id.includes(`other`) && cell_i.checked) {
                            input_value += cell_i.checked ? br + cell_i.value : '';
                            // 這裡需要修正.....

                        } else {
                            input_value += cell_i.checked ? br + cell_i.value : '';
                        }
                    }
                    input_value = input_value.replace(/undefined;?/g, "");        // 去除undefined,
                }
                // console.log(key, input_value)

                // switch (cell.type) {
                //     case 'checkbox':
                //         input_value = cell.checked;
                //         break;
                //     default:
                //         input_value = cell.value.trim(); // 第 2 個儲存格的值
                //         if (!isNaN(input_value) && input_value !== '') {
                //             input_value = String(input_value); // 轉換為字串
                //         }
                // }
                result[key] = input_value; // 存入結果物件
            }else{
                return;
            }
        });
        // 進行強迫排序
        let sort_item = ['newOne', 'noise', 'regular', 'change'];
        let sorted_result = {};
        for (const sortKey of sort_item) {
            if((result[sortKey] !== undefined) || (result[sortKey] == false)){
                sorted_result[sortKey] = result[sortKey];
            }
        }
        // 回存empData
        let empDiv = document.querySelector('#edit_shCondition #edit_shCondition_empId').innerText;
        const this_id_arr = empDiv.split(',')                  // 分割this.id成陣列
        // const edit_cname  = this_id_arr[0];                     // 取出陣列0=cname
        const edit_empId  = this_id_arr[1];                    // 取出陣列1=emp_id
        const empData = staff_inf.find(emp => emp.emp_id === edit_empId);   // 取得個人資料
        empData.shCondition = sorted_result;                   // 把資料帶入
        // 清除指定的shCondition欄位
        document.getElementById(`shCondition,${edit_empId},${currentYear}`).innerHTML = '';
        // 更新資格驗證(1by1)
        updateShCondition(empData.shCondition, edit_empId, currentYear);

    })

                        // [p2 函數] 更換shLocal_modal內的emp_id值 for shLocal互動視窗
                        function reNew_empId(this_value){
                            $('#import_shLocal #import_shLocal_empId').empty().append(this_value);
                        }
    // [p2 函數] 當有輸入每日暴露時數eh_time時...
    function change_eh_time(this_id, this_value){    // this.id, this.value
        const this_id_arr = this_id.split(',')       // 分割this.id成陣列
        const select_empId = this_id_arr[1];         // 取出陣列1=emp_id
        // step-1 將每日暴露時數eh_time存到指定staff_inf
            const empData = staff_inf.find(emp => emp.emp_id === select_empId);
            if (empData) {  empData['eh_time'] = Number(this_value); }
        // step-2 更新噪音資格 // 取自 post_shCase(empData); 其中一段
            // doCheck(select_empId);                  // 更新驗證項目(1by1)
            clearDOM(select_empId);                 // 你需要根據 select_empId 來清空對應的 DOM
            const { shCase, shCondition } = empData;
            if (shCase) {
                Object.entries(shCase).forEach(([sh_key, sh_value], index) => {
                    updateDOM(sh_value, select_empId, index);
                });
            }
            // 更新資格驗證(1by1)
            if (shCondition) {
                updateShCondition(shCondition, select_empId, currentYear);
            }
    }
    // [p2 函數] 批次儲存員工清單...
    function bat_storeStaff(){
        load_fun('bat_storeStaff', JSON.stringify(staff_inf), show_swal_fun);   // load_fun的變數傳遞要用字串
    }








                        // [p2 函數] 設置事件監聽器和MutationObserver
                        async function p2_eventListener() {
                            return new Promise((resolve) => {

                                resolve();      // 當所有設置完成後，resolve Promise
                            });
                        }

// [p-1]
    // [p1 函數-1] 動態生成所有按鈕，並重新綁定事件監聽器
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
                                        `<div class="form-check">
                                            <input type="checkbox" name="deptNo[]" id="${emp_sub_scope},${o_key}" value="${o_key}" class="form-check-input px-0" ` + ( o_value.shCaseNotNull_pc == 100 ? '':'disable' ) +`>
                                            <label for="${emp_sub_scope},${o_key}" class="form-check-label" ` + ( o_value.shCaseNotNull_pc == 100 ? '':'data-toggle="tooltip" data-placement="bottom" title="未完成特危作業選定"' ) +`>
                                                ${o_key}&nbsp;${o_value.OSTEXT}&nbsp;${o_value._count}件<sup class="text-danger"> (${o_value.shCaseNotNull_pc}%)</sup></label>
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
                    load_deptNo_btn.disabled = selectedValues.length === 0 ;                        // [取得人事資料庫btn] 是否啟用 => 預防送出空值
                });
            });
            // step-3. 綁定load_deptNo_btn進行撈取員工資料
            const load_deptNo_btn = document.getElementById('load_deptNo_btn');
            load_deptNo_btn.addEventListener('click', function() {
                const selectedValues = deptNo_opts_arr.filter(cb => cb.checked).map(cb => cb.value);// 從清單中篩出以選擇的項目
                const selectedValues_str = JSON.stringify(selectedValues).replace(/[\[\]]/g, '');   // 去除特定符號、轉字串
                load_fun('load_staff_byDeptNo', selectedValues_str, rework_loadStaff);              // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                deptNo_opts_arr.forEach(input => { if (input.checked) { input.checked = false; } });// 清除已勾選的項目
            })
            resolve();      // 當所有設置完成後，resolve Promise
        });
    }

    // [p1 函數-2] 設置事件監聽器和MutationObserver
    async function p1_eventListener() {
        return new Promise((resolve) => {
            // p1. [通用]在任何地方啟用工具提示框
            $('[data-toggle="tooltip"]').tooltip();

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }


        // 簽核類型渲染
        function submit_item(idty, idty_title){
            $('#idty, #idty_title, #action').empty();
            document.getElementById('idty').value = idty;
            // idty=99 => return the goods
            // document.getElementById('action').value = (receive_row['idty'] == 10 && idty == 99 ) ? 'return' : 'sign';
            document.getElementById('action').value = 'sign';
            $('#idty_title').append(idty_title);
            var forwarded_div = document.getElementById('forwarded');
            if(forwarded_div && (idty == 5)){
                forwarded_div.classList.remove('unblock');           // 按下轉呈 = 解除 加簽
            }else{
                forwarded_div.classList.add('unblock');              // 按下其他 = 隱藏
            }
        }

// [default fun]
    $(function() {
        // [步驟-1] 初始化設置
        mk_deptNos_slt(deptNosObj);             // 呼叫函數-2 生成p1部門slt按鈕
        p1_eventListener();                     // 呼叫函數-3 建立監聽
        // p2_eventListener();                     // 呼叫函數-3 建立監聽

        // let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        // let message  = '*** 本系統螢幕解析度建議：1920 x 1080 dpi，低於此解析度將會影響操作體驗&nbsp;~';
        // Balert( message, 'warning')

    });
