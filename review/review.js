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
                    // // 240823 將匯入資料合併到shLocal_inf
                    // async function mgInto_shLocal_inf(new_shLocal_arr){
                    //     Object.keys(new_shLocal_arr).forEach((new_sh_key) => {
                    //         new_shLocal_arr[new_sh_key]['HE_CATE'] = JSON.parse(new_shLocal_arr[new_sh_key]['HE_CATE']);
                    //     })
                    //     // 240826 進行shLocal_inf重複值的比對並合併
                    //     shLocal_inf = shLocal_inf.concat(new_shLocal_arr);   // 合併
                    //     let uniqueMap = new Map();                           // 使用 Map 來去重
            
                    //     shLocal_inf.forEach(item => {
                    //         let key = `${item.id}-${item.OSHORT}`;
                    //         if (!uniqueMap.has(key)) {
                    //             uniqueMap.set(key, item);
                    //         }
                    //     });
                    //     // 將結果轉換為陣列
                    //     shLocal_inf = Array.from(uniqueMap.values());
                    //     await post_shLocal(shLocal_inf)
                    // }
                    // // 240904 shCase 去重...
                    // async function removeDuplicateShCase(shCaseArray) {
                    //     const uniqueShCaseMap = new Map();
                    //     await shCaseArray.forEach(item => {
                    //         // 建立一個唯一標識符，根據所有屬性值來生成
                    //         const uniqueKey = JSON.stringify(item);
                    //         // 如果唯一標識符已存在，則忽略此項目；否則，將其添加到Map中
                    //         if (!uniqueShCaseMap.has(uniqueKey)) {
                    //             uniqueShCaseMap.set(uniqueKey, item);
                    //         }
                    //     });
                    //     // 將 Map 轉換回陣列
                    //     return Array.from(uniqueShCaseMap.values());
                    // }
                    // // 240822 將匯入資料合併到staff_inf
                    // async function mgInto_staff_inf(source_json_value_arr){
                    //     const addIn_arr1 = ['HE_CATE', 'HE_CATE_KEY', 'no' ];                                        // 合併陣列1
                    //     const addIn_arr2 = {'OSTEXT_30':'emp_sub_scope', 'OSHORT':'dept_no', 'OSTEXT':'emp_dept'};   // 合併陣列2
                    //     const addIn_arr3 = ['yearHe', 'yearCurrent', 'yearPre'];                                     // 合併陣列3 匯入1、2、3
                    //     const source_OSHORT_arr = [];

                    //     for (const e_key of Object.keys(source_json_value_arr)) {
                    //         // 初始化 shCase 陣列
                    //         if (!source_json_value_arr[e_key]['shCase']) { source_json_value_arr[e_key]['shCase'] = []; }           // 特作案件紀錄陣列建立
                    //         if (!source_json_value_arr[e_key]['_content']) { source_json_value_arr[e_key]['_content'] = {}; }       // 1.通聯紀錄陣列建立
                    //         if (!source_json_value_arr[e_key]['_content'][`${currentYear}`]) { source_json_value_arr[e_key]['_content'][`${currentYear}`] = {}; }   // 2.'年度'通聯紀錄陣列建立
                    //         if (!source_json_value_arr[e_key]['_content'][`${currentYear}`]['import']) { source_json_value_arr[e_key]['_content'][`${currentYear}`]['import'] = {}; }   // 3.年度通聯-匯入紀錄陣列建立
                    //         // 建立一個新的物件來儲存合併的資料
                    //         let mergedData = {};
                    //         let importData = {};
                    //         // 遍歷合併陣列1 addIn_arr1 並合併數據
                    //         addIn_arr1.forEach((addIn_i) => {
                    //             if (source_json_value_arr[e_key][addIn_i]) {
                    //                 mergedData[addIn_i] = source_json_value_arr[e_key][addIn_i];     // 合併
                    //                 delete source_json_value_arr[e_key][addIn_i];                    // 刪除合併後的屬性
                    //             }
                    //         });
                            
                    //         // 遍歷合併陣列2 addIn_arr2 並合併數據
                    //         for (const [a2_key, a2_value] of Object.entries(addIn_arr2)) {
                    //             if (source_json_value_arr[e_key][a2_value]) {
                    //                 mergedData[a2_key] = source_json_value_arr[e_key][a2_value];     // 合併...有bug
                    //                 if(a2_key == 'OSHORT'){
                    //                     source_OSHORT_arr.push(source_json_value_arr[e_key][a2_value])  // extra: 取得部門代號 => 抓特危場所清單用
                    //                 }
                    //             }
                    //         }

                    //         // 遍歷合併陣列3 addIn_arr3 並合併數據
                    //         addIn_arr3.forEach((addIn_i) => {
                    //             if (source_json_value_arr[e_key][addIn_i]) {
                    //                 importData[addIn_i] = source_json_value_arr[e_key][addIn_i];     // 合併
                    //                 delete source_json_value_arr[e_key][addIn_i];                    // 刪除合併後的屬性
                    //             }
                    //         });

                    //         // 241028 補強提取資料後原本只抓最外層的部門代號'shCase，補上shCase_logs內當年度'shCase
                    //         if(source_json_value_arr[e_key]['shCase_logs'] !== undefined && source_json_value_arr[e_key]['shCase_logs'][currentYear]){
                    //             if(source_json_value_arr[e_key]['shCase_logs'][currentYear]['dept_no']){
                    //                 source_OSHORT_arr.push(source_json_value_arr[e_key]['shCase_logs'][currentYear]['dept_no']);    // 241104 抓取shCase_logs 年度 下的部門代號 => 抓特危場所清單用
                    //             }
                    //             let i_shCase = source_json_value_arr[e_key]['shCase_logs'][currentYear]['shCase'];
                    //             if(i_shCase != null && i_shCase.length > 0){
                    //                 for (const [i_shCase_key, i_shCase_value] of Object.entries(i_shCase)) {
                    //                     source_OSHORT_arr.push(i_shCase_value.OSHORT)               // extra: 取得部門代號 => 抓特危場所清單用
                    //                 }
                    //             }
                    //         }

                    //         // 將合併後的物件加入 shCase 陣列中
                    //         if( Object.keys(mergedData).length > 0 && mergedData['HE_CATE']){       // 限制要有'HE_CATE'檢查類別代號才能合併
                    //             source_json_value_arr[e_key]['shCase'].push(mergedData);
                    //             // 使用 await 調用 removeDuplicateShCase 去重
                    //             source_json_value_arr[e_key]['shCase'] = await removeDuplicateShCase(source_json_value_arr[e_key]['shCase']);
                    //         }

                    //         // 將合併後的物件加入 _content/import 陣列中
                    //         if( Object.keys(importData).length > 0 ){       
                    //             // source_json_value_arr[e_key]['_content'][`${currentYear}`]['import'].push(importData);   // 堆疊法
                    //             source_json_value_arr[e_key]['_content'][`${currentYear}`]['import'] = importData;          // 覆蓋法
                    //             // // 使用 await 調用 removeDuplicateShCase 去重
                    //             // source_json_value_arr[e_key]['_content'][`${currentYear}`]['import'] = await removeDuplicateShCase(source_json_value_arr[e_key]['_content'][`${currentYear}`]['import']);
                    //         }
                    //     };

                    //     // 240826 進行emp_id重複值的比對並合併
                    //         let combined = staff_inf.concat(source_json_value_arr);                                  // 合併2個陣列到combined
                    //         let uniqueStaffMap = new Map();                                                         // 創建一個 Map 來去除重複的 emp_id 並合併 shCase
                    //         await combined.forEach(item => {
                    //             if (uniqueStaffMap.has(item.emp_id)) {
                    //                 // 如果 emp_id 已經存在，則合併 shCase 和 shCondition
                    //                 let existingShCase       = uniqueStaffMap.get(item.emp_id).shCase;
                    //                 let existingShCondition  = uniqueStaffMap.get(item.emp_id).shCondition || {};    // 初始化 shCondition 為空物件
                    //                 let existingShCase_logs  = uniqueStaffMap.get(item.emp_id).shCase_logs || {};    // 初始化 shCase_logs 為空物件
                    //                 let existing_content     = uniqueStaffMap.get(item.emp_id)._content || {};       // 初始化 _content 為空物件

                    //                 // 合併 shCase
                    //                 uniqueStaffMap.get(item.emp_id).shCase = existingShCase.concat(item.shCase);

                    //                 // 合併 shCondition
                    //                 if (item.shCondition) {
                    //                     Object.assign(existingShCondition, item.shCondition);
                    //                     uniqueStaffMap.get(item.emp_id).shCondition = existingShCondition;
                    //                 }
                    //                 // 合併 shCase_logs
                    //                 if (item.shCase_logs) {
                    //                     Object.assign(existingShCase_logs, item.shCase_logs);
                    //                     uniqueStaffMap.get(item.emp_id).shCase_logs = existingShCase_logs;
                    //                 }
                    //                 // 合併 _content
                    //                 if (item._content) {
                    //                     Object.assign(existing_content, item._content);
                    //                     uniqueStaffMap.get(item.emp_id)._content = existing_content;
                    //                 }

                    //             } else {
                    //                 // 如果 emp_id 不存在，則新增
                    //                 uniqueStaffMap.set(item.emp_id, item);

                    //                 // 確保 shCondition 被初始化
                    //                 // 獲取當年年份currentYear
                    //                 if (!item.shCondition) {  item.shCondition = {};  }
                    //                 if (!item.shCase_logs) {  item.shCase_logs = {};  }
                    //                 if (!item._content) {  item._content = {};  }
                    //                 if (!item._content[`${currentYear}`]) {  item._content[`${currentYear}`] = {};  }
                    //                 if (!item._content[`${currentYear}`]['import']) {  item._content[`${currentYear}`]['import'] = {};  }
                    //             }
                    //         });
                    //         // 將 Map 轉換回陣列
                    //         staff_inf = Array.from(uniqueStaffMap.values());
                    //         console.log('2.mgInto_staff_inf--staff_inf...', staff_inf);

                    //     // *** 精煉 shLocal 
                    //         const source_OSHORTs_str = (JSON.stringify([...new Set(source_OSHORT_arr)])).replace(/[\[\]]/g, ''); // 過濾重複部門代號 + 轉字串
                    //         if(source_OSHORTs_str !==''){
                    //             await load_fun('load_shLocal', source_OSHORTs_str, mgInto_shLocal_inf);         // 呼叫load_fun 用 部門代號字串 取得 特作清單 => mgInto_shLocal_inf合併shLocal_inf
                    //         }

                    //     resetINF(false);    // 重新架構：停止並銷毀 DataTable、step-1.選染到畫面 hrdb_table、step-1-2.重新渲染 shCase&判斷、重新定義HE_CATE td、讓指定按鈕 依照staff_inf.length 啟停 
                    // }
                    // // 240904 load_staff_byDeptNo       ；call from mk_dept_nos_btn()...load_fun(myCallback)...
                    // async function rework_loadStaff(loadStaff_arr){
                    //     loadStaff_tmp = [];     // 清空臨時陣列...
                    //     // step2.等待上面搜尋與合併臨時欄位loadStaff_tmp完成後...
                    //     for (const [s_index, s_value] of Object.entries(loadStaff_arr)) {
                    //         const select_empId = (s_value['emp_id'] !== undefined) ? s_value['emp_id'] : null;      // step2-1.取出emp_id
                    //         let empData = loadStaff_arr.find(emp => emp.emp_id === select_empId);                   // step2-2. 先取得select_empId的個人資料=>empData
                    //         // empData = empData.concat(loadStaff_tmp[s_index]);                                       // 合併2個陣列
                    //         empData = empData ? empData : {};                                                       // step2-3. 確保 empData 是陣列，否則初始化為空陣列
                    //         // Object.assign(empData, loadStaff_tmp[s_index]);                                         // step2-4. 如果 empData 是一個物件而不是陣列，需要將其轉換成陣列或合併物件 241101 暫停取用hrdb進行更新。???
                    //         // 241101 暫停取用hrdb進行更新。 改用下面：
                    //             empData.gesch    = s_value.gesch;
                    //             empData.natiotxt = s_value.natiotxt;
                    //             empData.HIRED    = s_value.HIRED;
                    //             empData.dept_no  = s_value.dept_no;                 // 部門代號
                    //             empData.emp_sub_scope  = s_value.emp_sub_scope;     // 人事子範圍
                    //             empData.emp_dept = s_value.emp_dept;                // 部門名稱
                    //     }
                    //     mgInto_staff_inf(loadStaff_arr);
                    //     inside_toast('彙整&nbsp;員工資料...Done&nbsp;!!');
                    //     $('#nav-p2-tab').tab('show');                                       // 切換頁面
                    // }
                    // 240904 將loadStaff進行欄位篩選與合併到臨時陣列loadStaff_tmp    ；call from search_fun()
                    async function rework_staff(loadStaff_arr){
                        return new Promise((resolve) => {
                            Object.entries(loadStaff_arr).forEach(([index, staffValue]) => {
                                const age = staffValue.year_key;

                                loadStaff_arr[index].HIRED            = staffValue.shCase_logs[age].HIRED
                                loadStaff_arr[index].dept_no          = staffValue.shCase_logs[age].dept_no
                                loadStaff_arr[index].emp_dept         = staffValue.shCase_logs[age].emp_dept
                                loadStaff_arr[index].emp_sub_scope    = staffValue.shCase_logs[age].emp_sub_scope
                                loadStaff_arr[index].gesch            = staffValue.shCase_logs[age].gesch
                                loadStaff_arr[index].natiotxt         = staffValue.shCase_logs[age].natiotxt
                                
                                console.log(loadStaff_arr);
                                resetINF(false);    // 重新架構：停止並銷毀 DataTable、step-1.選染到畫面 hrdb_table、step-1-2.重新渲染 shCase&判斷、重新定義HE_CATE td、讓指定按鈕 依照staff_inf.length 啟停 
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
                    _docsIdty_inf = null;
                }
                await release_dataTable();                  // 停止並銷毀 DataTable
                await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
                // await post_preYearShCase(staff_inf);        // step-1-1.重新渲染去年 shCase&判斷  // 241024 停止撲到下面
                await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷

                // if(sys_role <= '3' && !(_docsIdty_inf >= 4) ){                        // 限制role <= 3 現場窗口以下...排除主管和路人
                //     await reload_HECateTable_Listeners();   // 重新定義HE_CATE td   // 關閉可防止更動 for簽核
                //     await reload_shConditionTable_Listeners();
                //     await reload_yearHeTable_Listeners();
                // }else{
                //     changeHE_CATEmode();                    // 241108 改變HE_CATE calss吃css的狀態；主要是主管以上不需要底色編輯提示
                //     changeShConditionMode();
                //     changeYearHeMode();
                // }
                await btn_disabled();                       // 讓指定按鈕 依照staff_inf.length 啟停 
            }
            // 讓指定按鈕 依照staff_inf.length 啟停
            function btn_disabled(){
                return new Promise((resolve) => {
                    download_excel_btn.disabled  = staff_inf.length === 0;  // 讓 下載 按鈕啟停
                    resetINF_btn.disabled        = staff_inf.length === 0;  // 讓 清除 按鈕啟停
                    // bat_storeStaff_btn.disabled  = staff_inf.length === 0 || (_docsIdty_inf >= 4);  // 讓 儲存 按鈕啟停
                    // SubmitForReview_btn.disabled = staff_inf.length === 0 || (_docsIdty_inf >= 4);  // 讓 送審 按鈕啟停
    
                    // loadExcel_btn.disabled   = (_docsIdty_inf >= 4);  // 讓 新增 按鈕啟停
                    // importStaff_btn.disabled = (_docsIdty_inf >= 4);  // 讓 上傳 按鈕啟停
                    resolve();
                });
            }


        // 渲染 今年目前特危項目 for p-2特作欄位(arr_All)
        async function post_shCase(emp_arr){
            for (const emp_i of emp_arr) {      // 使用 for...of 替代 forEach 因為 forEach 不會等待 await 的執行
                const { emp_id: select_empId, shCase ,shCondition} = emp_i;
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
                        // step.2 欲更新的欄位陣列 - 對應欄位4,5,6,7,8,9
                        const shLocal_item_arr = ['MONIT_LOCAL', 'WORK_DESC', 'HE_CATE', 'AVG_VOL', 'AVG_8HR', 'eh_time'];
                        let index = 1;
                        for (const [sh_key, sh_value] of Object.entries(shCase)) {
                            
                            const empData_shCase_Noise = Object.values(sh_value['HE_CATE']).includes('噪音');

                            // step.2 將shLocal_item_arr循環逐項進行更新
                            shLocal_item_arr.forEach((sh_item) => {
                                // step.2a 項目渲染...
                                const br = index > 1 ? '<br>' : '';         // 判斷 1以上=換行
                                let inner_Value = '';
                                if (sh_value[sh_item] !== undefined) {      // 確認不是找不到的項目
                                    if (sh_item === 'HE_CATE'){             // 6.類別代號 特別處理：1.物件轉字串、2.去除符號
                                        let he_cate_str = JSON.stringify(sh_value[sh_item]).replace(/[{"}]/g, '');
                                        inner_Value = `${br}${he_cate_str}`;

                                    }else if(sh_item.includes('AVG')){      // 7.8.均能音壓、平均音壓 特別處理：判斷是空值，就給他一個$nbsp;佔位
                                        let avg_str = sh_value[sh_item] ? sh_value[sh_item] : '&nbsp;';
                                        inner_Value = `${br}${avg_str}`;

                                    }else if(sh_item.includes('eh_time') && empData_shCase_Noise ){      // 4.5.每日暴露時間：判斷是空值，就給他一個$nbsp;佔位
                                        let eh_time = sh_value[sh_item] ? sh_value[sh_item] : '&nbsp;';
                                        let eh_time_input = `<snap id="eh_time,${select_empId},${preYear},${sh_key}" >${eh_time}</snap>`;
                                        inner_Value = `${br}${eh_time_input}`;

                                    }else if(sh_item === 'MONIT_LOCAL'){    // 4.特別處理：MONIT_LOCAL
                                        inner_Value = `${br}${sh_value['OSTEXT_30']}&nbsp;${sh_value[sh_item]}`;

                                    }else{                                  // 5.9
                                        // inner_Value = `${br}${sh_value[sh_item]}`;
                                        // 確認 sh_item 是否有定義的值
                                        inner_Value = (sh_value[sh_item] !== undefined) ? `${br}${sh_value[sh_item]}` : (() => {
                                            switch (sh_item) {
                                                case 'WORK_DESC':
                                                    return `${br}${sh_value['HE_CATE_KEY']}`;
                                                default:
                                                    return ''; // 預設空值
                                            }
                                        })();
                                    }

                                    // step.2b 噪音驗證 對應欄位9,10
                                    if (sh_item === 'HE_CATE' && empData_shCase_Noise && (sh_value['AVG_VOL'] || sh_value['AVG_8HR'])) {
                                        // 2b1. 檢查元素是否存在+是否有值
                                            // const eh_time_input = document.querySelector(`snap[id="eh_time,${select_empId},${preYear}"]`);
                                            const eh_time = sh_value[sh_item] ? sh_value[sh_item] : '';
                                        // 2b2. 個人shCase的噪音中，假如有含eh_time值，就導入使用。
                                            // eh_time_input.innerText = (empData['eh_time']) ? (empData['eh_time']) : null;    // 強行帶入顯示~
                                            // eh_time_input.innerText = (sh_value['eh_time']) ? (sh_value['eh_time']) : null;    // 強行帶入顯示~

                                            const avg_vol = (sh_value['AVG_VOL']) ? sh_value['AVG_VOL'] : false;
                                            const avg_8hr = (sh_value['AVG_8HR']) ? sh_value['AVG_8HR'] : false;
    
                                        // 2b3. 呼叫[fun]checkNoise 取得判斷結果
                                            const noise_check = checkNoise(eh_time, avg_vol, avg_8hr);     
                                            const noise_check_str = `${br}${noise_check.cCheck}`;   // 這裡只顯示cCheck判斷結果
                                            document.getElementById(`NC,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', noise_check_str);     // 渲染噪音判斷
                
                                        // 2b4. 紀錄個人(噪音)特檢資格shCondition['Noise']...是=true；未達、不適用=false
                                            // empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : false;   // 照理說應該不需要...因為是直接抓舊紀錄鋪設，不需要任何判斷
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
            // await reload_shLocalTable_Listeners();      // 重新建立監聽~shLocalTable的checkbox
            $("body").mLoading("hide");
        }

    // [p3 函數-1-2] 動態生成所有按鈕，並重新綁定事件監聽器
    function mk_deptNos_btn(docDeptNo) {
        return new Promise((resolve) => {
            // init
            $('#deptNo_opts_inside').empty();
            _docs_inf = docDeptNo;
            // step-1. 鋪設按鈕
            if(Object.entries(docDeptNo).length > 0){     // 判斷使否有長度值
                Object.entries(docDeptNo).forEach(([emp_sub_scope, oh_value]) => {
                    let ostext_btns = `
                        <div class="col-lm-3">
                            <div class="card">
                                <div class="card-header">${emp_sub_scope}</div>
                                <div class="card-body p-2">
                                    ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                        `<div class="form-check px-1">
                                            <button type="button" name="deptNo[]" id="${emp_sub_scope},${o_key}" value="${o_value.uuid}" class="btn btn-outline-secondary add_btn " >
                                            ${o_key}&nbsp;${o_value.OSTEXT}&nbsp;${o_value.check_list.length}人<sup class="text-danger" name="sup_${o_key}[]"> (${o_value.idty})</sup></button>
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
            const deptNo_btns = document.querySelectorAll('#deptNo_opts_inside button[name="deptNo[]"]');
            deptNo_btns.forEach(deptNo_btn => {
                deptNo_btn.addEventListener('click', function() {
                    // 工作一 清空暫存
                        resetINF(true); // 清空
                    // 工作二 依部門代號撈取員工資料 後 進行鋪設
                        const selectedValues_str = JSON.stringify(this.value).replace(/[\[\]]/g, '');
                        load_fun('load_staff_byDeptNo', selectedValues_str, rework_staff);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                    // 工作三 
                        const thisValue_arr = this.value.split(',')       // 分割this.value成陣列
                        const select_year     = thisValue_arr[0];         // 取出陣列0=年份
                        const select_deptNo   = thisValue_arr[1];         // 取出陣列1=部門代號
                        const select_subScope = thisValue_arr[2];         // 取出陣列1=人事子範圍
                        const _doc = _docs_inf[select_subScope][select_deptNo];
                        
                        _docsIdty_inf = _doc.idty;

                    // if(_docsIdty_inf >= 4){
                    //     bat_storeStaff_btn.disabled  = true;  // 讓 儲存 按鈕啟停
                    //     SubmitForReview_btn.disabled = true;  // 讓 送審 按鈕啟停
                    // }
                    // bat_storeStaff_btn.disabled  = (_docsIdty_inf >= 4);  // 讓 儲存 按鈕啟停
                    // SubmitForReview_btn.disabled = (_docsIdty_inf >= 4);  // 讓 送審 按鈕啟停
                    $('#nav-p2-tab').tab('show');
                });
            });

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }

    function phase1() {
        return new Promise((resolve) => {

            let parm = {
                _year : currentYear
            }
            let parm_str = JSON.stringify(parm);
            load_fun('load_doc_deptNos', parm_str, mk_deptNos_btn);

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

        // [p1 函數-6] 渲染hrdb
        async function post_hrdb(emp_arr){
            $('#hrdb_table tbody').empty();
            if(emp_arr.length === 0){
                $('#hrdb_table tbody').append('<div class="text-center text-dnager">沒有資料</div>');
            }else{
                // 停止並銷毀 DataTable
                release_dataTable();
                const importItem_arr = ['yearHe', 'yearCurrent', 'yearPre'];
                await Object(emp_arr).forEach((emp_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                    let tr1 = '<tr>';
                    const empId_currentYear = `,${emp_i.emp_id},${currentYear}">`;
                    const _content_import = emp_i._content[`${currentYear}`]['import'] !== undefined ? emp_i._content[`${currentYear}`]['import'] : {};

                    tr1 += `<td class="">
                                <div class="col-12 p-0">${emp_i.emp_id}</br><button type="button" class="btn btn-outline-primary add_btn " name="emp_id" value="${emp_i.cname},${emp_i.emp_id}" `
                                    + (emp_i.HIRED ? ` title="到職日：${emp_i.HIRED}" ` : ``) +` data-bs-toggle="modal" data-bs-target="#aboutStaff" aria-controls="aboutStaff">${emp_i.cname}</button></div>`
                                + `</td>`;
                    tr1 += `<td><b>${currentYear}：</b><br>`+ ((emp_i.emp_sub_scope != undefined ? emp_i.emp_sub_scope : emp_i.shCase_logs[currentYear].emp_sub_scope )) +`</td>`;
                    tr1 += `<td>`+ ((emp_i.dept_no != undefined ? emp_i.dept_no : emp_i.shCase_logs[currentYear].dept_no )) +`<br>`
                                    + ((emp_i.emp_dept != undefined ? emp_i.emp_dept : emp_i.shCase_logs[currentYear].emp_dept )) +`</td>`;
                    tr1 += `<td><div id="MONIT_LOCAL` + empId_currentYear + `</div></td>`;
                    tr1 += `<td><div id="WORK_DESC` + empId_currentYear + `</div></td>`;
                    // 240918 因應流程圖三需求，將選擇特作功能移到[工作內容]...
                    tr1 += `<td class="HE_CATE" id="${emp_i.cname},${emp_i.emp_id},HE_CATE"><div id="HE_CATE` + empId_currentYear + `</div></td>`;
                    tr1 += `<td><div id="AVG_VOL` + empId_currentYear + `</div></td>`;
                    tr1 += `<td><div id="AVG_8HR` + empId_currentYear + `</div></td>`;
                    tr1 += `<td><div id="eh_time` + empId_currentYear + `</div></td>`;
                    tr1 += `<td><div id="NC` + empId_currentYear + `</div></td>`;
                    tr1 += `<td class="shCondition`+(sys_role <='1' ? '':' unblock')+`" id="${emp_i.cname},${emp_i.emp_id},shCondition"><div id="shCondition` + empId_currentYear + `</div></td>`;           // 特檢資格

                    importItem_arr.forEach((importItem) => {
                        let importItem_value = (_content_import[importItem] != undefined ? _content_import[importItem] :'').replace(/,/g, '<br>');
                        tr1 += `<td class="${importItem}`+(sys_role <='3' ? '':' unblock')+`" id="${emp_i.cname},${emp_i.emp_id},${importItem}">${importItem_value}</td>`;
                    })

                    tr1 += '</tr>';
                    $('#hrdb_table tbody').append(tr1);
                })
                await reload_dataTable(emp_arr);               // 倒參數(陣列)，直接由dataTable渲染
            }
            // 240905 [轉調]欄位增加[紀錄].btn：1.建立offcanvas_arr陣列。2.建立canva_btn監聽。3.執行fun，顯示於側邊浮動欄位offcanva。
                const offcanvas_arr = Array.from(document.querySelectorAll('button[aria-controls="aboutStaff"]'));
                offcanvas_arr.forEach(canva_btn => {
                    canva_btn.addEventListener('click', function() {
                        const this_value_arr = this.value.split(',')       // 分割this.value成陣列
                        const select_cname = this_value_arr[0];            // 取出陣列0=cname
                        const select_empId = this_value_arr[1];            // 取出陣列1=emp_id
                        $('#aboutStaff #aboutStaff_title').empty().append('( '+ this.value +' )');     // 更新 header title  
                        // const empData = staff_inf.find(emp => emp.emp_id === select_empId);
                        // let emp_shCase_log = '< ~ 無儲存紀錄 ~ >';
                        // if(empData && empData.shCase_logs != undefined && ( Object.keys(empData.shCase_logs).length > 0 )){
                        //     // 使用 JSON.stringify 來轉換物件成為格式化的JSON字符串，第二個參數設為null，第三個參數 2 表示每層縮進兩個空格。
                        //     // 使用 <pre> 標籤來確保格式化的結果在 HTML 中正確顯示。這樣的輸出會與 PHP 的 print_r 效果相似。
                        //     emp_shCase_log = JSON.stringify(empData.shCase_logs, null ,3);
                        // }
                        // $('#shCase_table tbody').empty().append('<pre>' + emp_shCase_log + '</pre>');
                        // $('#shCase_table tbody').empty().append(emp_shCase_log);
                        show_preYearShCase(select_empId);
                    });
                });

            $("body").mLoading("hide");
        }

// [default fun]
    $(function() {
        // [步驟-1] 初始化設置
        // mk_deptNos_btn(deptNosObj);             // 呼叫函數-2 生成p1部門slt按鈕
        phase1();
        // p1_eventListener();                     // 呼叫函數-3 建立監聽
        // p2_eventListener();                     // 呼叫函數-3 建立監聽

        // let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        // let message  = '*** 本系統螢幕解析度建議：1920 x 1080 dpi，低於此解析度將會影響操作體驗&nbsp;~';
        let message  = `<b>STEP 1.名單建立(匯入Excel、建立名單)：</b>總窗護理師  <b>2.工作維護(勾選特危、填暴露時數)：</b>單位窗口,護理師,ESH工安  <b>3.名單送審(100%的名單按下送審)：</b>單位窗口,護理師</br><b>4.簽核審查(簽核主管可微調暴露時數)：</b>上層主管,單位窗口,護理師  <b>5.收單review(檢查名單及特檢資料是否完備)：</b>ESH工安,護理師  <b>6.名單總匯整(輸出健檢名單)：</b>總窗護理師`;
        if(message) {
            Balert( message, 'warning')
        }



    });