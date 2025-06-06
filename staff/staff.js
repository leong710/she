
    // 重新架構
    async function resetINF(request){
        if(request){
            staff_inf     = [];
            shLocal_inf   = [];
            loadStaff_tmp = [];
            _docsIdty_inf = null;
            document.querySelector(`#nav-p2_table snap[id="newOmager"]`).innerText = '';    // 清空newOmager指派主管內容；

        }else{
            // await release_dataTable();                  // 停止並銷毀 DataTable
            // await post_preYearShCase(staff_inf);        // step-1-1.重新渲染去年 shCase&判斷  // 241024 停止撲到下面
        }

        await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
        await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷

        if(userInfo.role <= '3' && !(_docsIdty_inf >= 4) ){                        // 限制role <= 3 現場窗口以下...排除主管和路人
            await reload_HECateTable_Listeners();       // 重新定義HE_CATE td   // 關閉可防止更動 for簽核
            await reload_shConditionTable_Listeners();  // td 特檢資格
            await reload_yearHeTable_Listeners();       // td 檢查類別
            await reload_yearPreTable_Listeners();      // td 去年檢查項目
        }else{
            changeHE_CATEmode();                    // 241108 改變HE_CATE calss吃css的狀態；主要是主管以上不需要底色編輯提示
            changeShConditionMode();
            changeYearHeMode();
            changeYearPreMode();
        }

        await btn_disabled();                       // 讓指定按鈕 依照staff_inf.length 啟停 

        await reload_selectShLocalListeners();      // 250214 HE_CATE同一個item只能多選一
    }
    // 讓指定按鈕 依照staff_inf.length 啟停
    function btn_disabled(){
        return new Promise((resolve) => {
            download_excel_btn.disabled  = staff_inf.length === 0;  // 讓 下載 按鈕啟停
            resetINF_btn.disabled        = staff_inf.length === 0;  // 讓 清除 按鈕啟停
            batDelete_btn.disabled       = staff_inf.length === 0;  // 讓 刪除 按鈕啟停
            bat_storeStaff_btn.disabled  = staff_inf.length === 0 || (_docsIdty_inf >= 4);  // 讓 儲存 按鈕啟停
            // 改在post_hrdb下進行判斷
            // SubmitForReview_btn.disabled = staff_inf.length === 0 || (_docsIdty_inf >= 4);  // 讓 送審 按鈕啟停
            loadExcel_btn.disabled       = (_docsIdty_inf >= 4) || (userInfo.role >= 2);    // 讓 新增 按鈕啟停
            importStaff_btn.disabled     = (_docsIdty_inf >= 4) || (userInfo.role >= 2);    // 讓 上傳 按鈕啟停

            document.querySelectorAll(`#hrdb_table input[id*="eh_time,"]`).forEach(input => input.disabled = (_docsIdty_inf >= 4));     // 讓所有eh_time 輸入欄位啟停 = 主要for已送審
            document.querySelectorAll(`#hrdb_table button[class*="eraseStaff"]`).forEach(btn => btn.disabled = (_docsIdty_inf >= 4));   // 讓所有eraseStaff btn啟停 = 主要for已送審
            postMemoMsg_btn.disabled     = (_docsIdty_inf >= 4);  // 讓 貼上備註 按鈕啟停
            memoMsg_input.disabled       = (_docsIdty_inf >= 4)

            resolve();
        });
    }

// // phase 4 -- 
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
                const useImportShLocal_value = document.getElementById('useImportShLocal');     // 保留沿用選項值(保留選項)
                if (empData) {
                    empData.shCase = [];            // 特檢項目：直接清空，讓後面重新帶入
                    // 清空目前顯示的 DOM
                    clearDOM(select_empId);         // 你需要根據 select_empId 來清空對應的 DOM
                    if(selectedOptsValues.length === 0){    // 1.這裡是全部沒勾選...
                        empData.shCondition['noise'] = false;   // 清除噪音判定
                    }else{                                  // 裡是有勾選，然後將新勾選的項目進行更新
                        selectedOptsValues.forEach((sov_value, index) => {
                            empData.shCase[index] = shLocal_inf[sov_value];
                            const eh_time_input = document.querySelector(`input[id="eh_time,${select_empId},${currentYear}"]`);
                            if(!eh_time_input){
                                let eh_time_input = `<snap><input type="number" id="eh_time,${select_empId},${currentYear}" name="eh_time" class="form-control text-center" value=""
                                            min="0" max="12" onchange="this.value = Math.min(Math.max(this.value, this.min), this.max); change_eh_time(this.id, this.value)" ></snap>`;
                                document.getElementById(`eh_time,${select_empId},${currentYear}`).insertAdjacentHTML('beforeend', eh_time_input);     // 渲染各項目
                            }
                            updateDOM(shLocal_inf[sov_value], select_empId, index);
                        });
                    }
                    renewYearCurrent(empData);  // 250210 更新匯入2，生成檢查代碼
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

    // 250214 HE_CATE同一個item只能多選一、單選
    let selectShLocalListener;
    async function reload_selectShLocalListeners() {
        return new Promise((resolve) => {
            const shLocal_table = document.getElementById('shLocal_table');
            const shLocal_cd_arr = Array.from(shLocal_table.querySelectorAll('#shLocal_table input[name="shLocal_id[]"]'));      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (selectShLocalListener) {
                shLocal_cd_arr.forEach(shLocal_cd => {                                // 遍歷範圍內容給shLocal_id
                    shLocal_cd.removeEventListener('click', selectShLocalListener);   // 將每一個shLocal_id移除監聽, 當按下click
                })
            }
            // 定義新的監聽器函數
            selectShLocalListener = function () {
                const this_index     = this.value;                                      // 取得已change的value值=index
                const this_checked   = this.checked;                                    // 取得這次change的true/false
                const HE_CATE_id_arr = Object.keys(shLocal_inf[this_index]['HE_CATE']); // 從shLocal_inf中對應的this_i取出它的HE_CATE內容(物件的key=HE_CATE_id)
                let doDisabled_arr   = [];
                for (const HE_CATE_id of HE_CATE_id_arr){                               // 把HE_CATE_id_arr繞出來...假動作
                    doDisabled_arr = shLocal_inf.map((item, index) => Object.keys(item.HE_CATE).includes(HE_CATE_id) ? index : -1 ).filter(index => index !== -1);    // 找出shLocal_inf中相同HE_CATE_id的array key
                }   
                for (const doDisabled_index of doDisabled_arr) {
                    if(doDisabled_index != this_index){
                        shLocal_table.querySelector(`#shLocal_table input[value="${doDisabled_index}"]`).disabled = this_checked;
                    }
                }
            }
            // 添加新的監聽器
            shLocal_cd_arr.forEach(shLocal_cd => {                                      // 遍歷範圍內容給shLocal_cd
                shLocal_cd.addEventListener('change', selectShLocalListener);           // 將每一個shLocal_id增加監聽, 當按下click
            })
            
            resolve();
        });
    }

    // p-2 批次儲存員工清單...
    async function bat_storeStaff(){
        const bat_storeStaff_value = JSON.stringify({
                staff_inf   : staff_inf,
                currentYear : currentYear
            });
        await load_fun('bat_storeStaff', bat_storeStaff_value, show_swal_fun);   // load_fun的變數傳遞要用字串
        location.reload();
    }
    // p-2 自db中批次刪除員工資料...
    async function bat_deleteStaff(){
        // *** 精煉 empId 
        const all_empId = Object.values(staff_inf).map(i_value => i_value.emp_id);
        const all_empId_str = (JSON.stringify(all_empId)).replace(/[\[\]]/g, ''); // 過濾 + 轉字串
        if(all_empId_str !== ''){
            await load_fun('bat_deleteStaff', all_empId_str, show_swal_fun);         // 
        }
        // await load_fun('bat_storeStaff', bat_storeStaff_value, show_swal_fun);   // load_fun的變數傳遞要用字串
        // location.reload();
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
                    mloading("show");                                               // 啟用mLoading
                    var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    var excel_json = iframeDocument.getElementById('excel_json');           // 正確載入
                    var stopUpload = iframeDocument.getElementById('stopUpload');           // 錯誤訊息
                    if (excel_json) {
                        document.getElementById('excelTable').value = excel_json.value;
                        const excel_json_value_arr = JSON.parse(excel_json.value);
                        // 250203 在匯入的時候就直接補上對應欄位資料
                        await rework_omager(excel_json_value_arr);
                        await mgInto_staff_inf(excel_json_value_arr)         // 呼叫[fun] 
                        inside_toast(`批次匯入Excel資料...Done&nbsp;!!`, 1000, 'info');

                    } else if(stopUpload) {
                        console.log('請確認資料是否正確');
                    }else{
                        console.error('找不到 ? 元素');
                    }
                });

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    
// // phase 3 -- 渲染與鋪設
    // [p1 函數-6] 渲染hrdb
    async function post_hrdb(emp_arr){
        // 停止並銷毀 DataTable
        let table = $('#hrdb_table').DataTable();
        if(table) {
           await release_dataTable();        // 呼叫[fun.0-4b] 停止並銷毀 DataTable
        }
        $('#hrdb_table tbody').empty();
        let emp_i_omager = false;
        const emp_arr_length = emp_arr.length;                                                  // 百分比#1
        if(emp_arr_length === 0){
            const table = $('#hrdb_table').DataTable();                     // 獲取表格的 thead
            const columnCount = table.columns().count();                    // 獲取每行的欄位數量
            const tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 沒有資料 ~ </td><tr>`;
            $('#hrdb_table tbody').append(tr1);
        }else{
            const importItem_arr = ['yearHe', 'yearCurrent', 'yearPre'];    // 檢查類別、檢查代號、去年檢查項目
            let loading_pre = 0;                                                                // 百分比#2
            for (const [emp_key, emp_i] of emp_arr.entries() ) {        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                const loading = Math.round(((Number(emp_key) + 1) / emp_arr_length) * 100);     // 百分比#3
                if(loading !== loading_pre){                                                    // 百分比#4
                    loading_pre = loading;
                    Adj_mLoading('post_hrdb', loading); // 呼叫：土法煉鋼法--修改mLoading提示訊息...str1=訊息文字, str2=百分比%
                }
                let tr1 = '<tr>';
                const empId_currentYear = `,${emp_i.emp_id},${currentYear}">`;
                const _content_import = emp_i._content[`${currentYear}`]['import'] !== undefined ? emp_i._content[`${currentYear}`]['import'] : {};

                tr1 += `<td class="">
                            <div class="col-12 p-0 ">${emp_i.emp_id}</br><button type="button" class="btn `+ (emp_i.stat2txt ? `btn-outline-primary add_btn` : `bg-warning`)+`" name="emp_id" value="${emp_i.cname},${emp_i.emp_id}" `
                            + `title="`+(emp_i.HIRED ? `到職日：${emp_i.HIRED}` : `已離職`) +`" data-bs-toggle="modal" data-bs-target="#aboutStaff" aria-controls="aboutStaff">${emp_i.cname}</button></div>`
                            + `<div class="col-12 pt-1 pb-0 px-0" >
                                <button type="button" class="btn btn-outline-danger btn-sm btn-xs add_btn eraseStaff" value="${emp_i.emp_id}" data-toggle="tooltip" data-placement="bottom" title="移除名單"
                                    onclick="eraseStaff(this)"><i class="fa-regular fa-rectangle-xmark"></i></button>&nbsp;&nbsp;
                                <button type="button" class="btn btn-outline-success btn-sm btn-xs add_btn " value="${emp_i.cname},${emp_i.emp_id}" data-toggle="tooltip" data-placement="bottom" title="總窗 備註/有話說"
                                    onclick="memoModal(this.value)" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight"><i class="fa-regular fa-rectangle-list"></i></button>
                            </div>
                        </td>`;
                tr1 += `<td><b>${currentYear}：</b><br>`+ ((emp_i.emp_sub_scope != undefined ? emp_i.emp_sub_scope : emp_i._logs[currentYear].emp_sub_scope )) +`</td>`;
                tr1 += `<td>`+ ((emp_i.dept_no != undefined ? emp_i.dept_no : emp_i._logs[currentYear].dept_no )) +`<br>`
                                + ((emp_i.emp_dept != undefined ? emp_i.emp_dept : emp_i._logs[currentYear].emp_dept )) +`</td>`;
                tr1 += `<td class="HE_CATE" id="${emp_i.cname},${emp_i.emp_id},HE_CATE"><div id="HE_CATE${empId_currentYear}</div></td>`;
                tr1 += `<td><div id="MONIT_LOCAL${empId_currentYear}</div></td>`;
                tr1 += `<td><div id="WORK_DESC${empId_currentYear}</div></td>`;
                // 240918 因應流程圖三需求，將選擇特作功能移到[工作內容]...
                tr1 += `<td><div id="AVG_VOL${empId_currentYear}</div></td>`;
                tr1 += `<td><div id="AVG_8HR${empId_currentYear}</div></td>`;
                tr1 += `<td><div id="eh_time${empId_currentYear}</div></td>`;
                tr1 += `<td><div id="NC${empId_currentYear}</div></td>`;
                tr1 += `<td class="shCondition`+(userInfo.role <='2.2' ? '':' unblock')+`" id="${emp_i.cname},${emp_i.emp_id},shCondition"><div id="shCondition${empId_currentYear}</div></td>`;           // 特檢資格
                importItem_arr.forEach((importItem) => {
                    let importItem_value = (_content_import[importItem] != undefined ? _content_import[importItem] :'').replace(/,/g, '<br>');
                    // step.5 250407 連動變更作業項目
                        if(importItem === 'yearPre'){
                            importItem_value += ( importItem_value === '' ? '' : '<br>' ) + emp_i._changeValue;
                        }
                    tr1 += `<td class="${importItem}`+(userInfo.role <='3' ? '':' unblock')+`" id="${emp_i.cname},${emp_i.emp_id},${importItem}">${importItem_value}</td>`;
                })
                tr1 += '</tr>';
                $('#hrdb_table tbody').append(tr1);
                // 增加判斷式，取staff.omager = user.empId 來啟閉SubmitForReview_btn
                if(!emp_i_omager){
                    emp_i_omager = (emp_i._logs[currentYear] != undefined) ? (emp_i._logs[currentYear].omager == userInfo.empId) : emp_i_omager;
                }
            };
        }
        await reload_dataTable();               // 倒參數(陣列)，直接由dataTable渲染
        // 240905 [轉調]欄位增加[紀錄].btn：1.建立offcanvas_arr陣列。2.建立canva_btn監聽。3.執行fun，顯示於側邊浮動欄位offcanva。
            const offcanvas_arr = Array.from(document.querySelectorAll('button[aria-controls="aboutStaff"]'));
            offcanvas_arr.forEach(canva_btn => {
                canva_btn.addEventListener('click', function() {
                    const this_value_arr = this.value.split(',')       // 分割this.value成陣列
                    const select_cname = this_value_arr[0];            // 取出陣列0=cname
                    const select_empId = this_value_arr[1];            // 取出陣列1=emp_id
                    $('#aboutStaff #aboutStaff_title').empty().append('( '+ this.value +' )');     // 更新 header title  
                    show_preYearShCase(select_empId);
                });
            });
        // 取emp_i_omager及其他判斷式，來啟閉SubmitForReview_btn
        SubmitForReview_btn.disabled = !(userInfo.role <= 2.2 || emp_i_omager) || (emp_arr.length === 0 || _docsIdty_inf >= 4 );  // 讓 送審 按鈕啟停
    }

// // phase 2 -- 數據操作函數 (Data Manipulation Functions)
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
        Adj_mLoading('Data Sorting', ''); // 呼叫：土法煉鋼法--修改mLoading提示訊息...str1=訊息文字, str2=百分比%
        const addIn_arr1 = ['HE_CATE', 'HE_CATE_KEY', 'no' ];                                        // 合併陣列1
        const addIn_arr2 = {'OSTEXT_30':'emp_sub_scope', 'OSHORT':'dept_no', 'OSTEXT':'emp_dept'};   // 合併陣列2
        const addIn_arr3 = ['yearHe', 'yearCurrent', 'yearPre'];                                     // 合併陣列3 匯入1、2、3
        const source_OSHORT_arr = [];
        for (const e_key of Object.keys(source_json_value_arr)) {
            // 初始化 shCase 陣列
            if (!source_json_value_arr[e_key]['shCase']) { source_json_value_arr[e_key]['shCase'] = []; }         // 特作案件紀錄陣列建立
            if (!source_json_value_arr[e_key]['_content']) { source_json_value_arr[e_key]['_content'] = {}; }     // 1.通聯紀錄陣列建立
            if (!source_json_value_arr[e_key]['_content'][`${currentYear}`]) { source_json_value_arr[e_key]['_content'][`${currentYear}`] = {}; }   // 2.'年度'通聯紀錄陣列建立
            if (!source_json_value_arr[e_key]['_content'][`${currentYear}`]['import']) { source_json_value_arr[e_key]['_content'][`${currentYear}`]['import'] = {}; }   // 3.年度通聯-匯入紀錄陣列建立
            if (!source_json_value_arr[e_key]['_changeValue']) { source_json_value_arr[e_key]['_changeValue'] = ''; }                               // 4a.連動變更管理
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
            // step.3 250407 連動變更作業項目 主要for作業年度 (3部分: 1.staff.js>mgInto_staff_inf、2.utility.js>show_preYearShCase、3.excel.js>downloadExcel)
            const { _changeLogs, year_key } = source_json_value_arr[e_key];
            const changeYear = String(Number(year_key) - 1 );   // 這裡要定義作業年度的去年，所以是-1
            let _6shCheck_str = '';
            if(_changeLogs !== null && _changeLogs !== undefined){
                let _6shCheck_arr = [];
                for(const [i_key, i_value] of Object.entries(_changeLogs)){
                    if (i_key.includes(changeYear) && (i_value._7isCheck === true) && (i_value._6shCheck.length > 0)){
                        i_value._6shCheck.forEach(item => {        // 1.繞出來
                            const [key, value] = item.split(':');  // 2.炸成陣列
                            _6shCheck_arr.push(value);             // 3.物件組成
                        });
                    }
                }
                _6shCheck_str = JSON.stringify(_6shCheck_arr).replace(/[\[\]{"}]/g, '').replace(/,/g, ';'); // 4.轉換字串
            }
            source_json_value_arr[e_key]['_changeValue'] = _6shCheck_str !== '' ? `變更(${_6shCheck_str})` : _6shCheck_str;
            // 241028 補強提取資料後原本只抓最外層的部門代號'shCase，補上_logs內當年度'shCase
            if(source_json_value_arr[e_key]['_logs'] !== undefined && source_json_value_arr[e_key]['_logs'][currentYear]){
                if(source_json_value_arr[e_key]['_logs'][currentYear]['dept_no']){
                    source_OSHORT_arr.push(source_json_value_arr[e_key]['_logs'][currentYear]['dept_no']);    // 241104 抓取_logs 年度 下的部門代號 => 抓特危場所清單用
                }
                if(source_json_value_arr[e_key]['eh_time'] == undefined){
                    source_json_value_arr[e_key]['eh_time'] = source_json_value_arr[e_key]['_logs'][currentYear]['eh_time'] ?? null;
                }
                let i_shCase = source_json_value_arr[e_key]['_logs'][currentYear]['shCase'];
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
                source_json_value_arr[e_key]['_content'][`${currentYear}`]['import'] = importData;          // 覆蓋法
            }
        };
        // 240826 進行emp_id重複值的比對並合併
            let combined = staff_inf.concat(source_json_value_arr);                                  // 合併2個陣列到combined
            let uniqueStaffMap = new Map();                                                          // 創建一個 Map 來去除重複的 emp_id 並合併 shCase
            await combined.forEach(item => {
                if (uniqueStaffMap.has(item.emp_id)) {
                    // 如果 emp_id 已經存在，則合併 shCase 和 shCondition
                    let existingShCase       = uniqueStaffMap.get(item.emp_id).shCase;
                    let existingShCondition  = uniqueStaffMap.get(item.emp_id).shCondition || {};    // 初始化 shCondition 為空物件
                    let existing_logs        = uniqueStaffMap.get(item.emp_id)._logs || {};          // 初始化 _logs 為空物件
                    let existing_content     = uniqueStaffMap.get(item.emp_id)._content || {};       // 初始化 _content 為空物件
                    // 合併 shCase
                    uniqueStaffMap.get(item.emp_id).shCase = existingShCase.concat(item.shCase);
                    // 合併 shCondition
                    if (item.shCondition) {
                        Object.assign(existingShCondition, item.shCondition);
                        uniqueStaffMap.get(item.emp_id).shCondition = existingShCondition;
                    }
                    // 合併 _logs
                    if (item._logs) {
                        Object.assign(existing_logs, item._logs);
                        uniqueStaffMap.get(item.emp_id)._logs = existing_logs;
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
                    if (!item._logs)       {  item._logs       = {};  }
                    if (!item._content)    {  item._content    = {};  }
                    if (!item._content[`${currentYear}`]) {  item._content[`${currentYear}`] = {};  }
                    if (!item._content[`${currentYear}`]['import']) {  item._content[`${currentYear}`]['import'] = {};  }
                }
            });
            // 將 Map 轉換回陣列
            staff_inf = Array.from(uniqueStaffMap.values());
        // *** 精煉 shLocal 
            const source_OSHORTs_str = (JSON.stringify([...new Set(source_OSHORT_arr)])).replace(/[\[\]]/g, ''); // 過濾重複部門代號 + 轉字串
            if(source_OSHORTs_str !==''){
                await load_fun('load_shLocal', source_OSHORTs_str, mgInto_shLocal_inf);         // 呼叫load_fun 用 部門代號字串 取得 特作清單 => mgInto_shLocal_inf合併shLocal_inf
            }
            
        await resetINF(false);    // 重新架構：停止並銷毀 DataTable、step-1.選染到畫面 hrdb_table、step-1-2.重新渲染 shCase&判斷、重新定義HE_CATE td、讓指定按鈕 依照staff_inf.length 啟停 
    }
    // 240826 單筆刪除Staff資料
    async function eraseStaff(removeEmp){
        if(!confirm(`確認移除此筆(${removeEmp.value})資料？`)){
            return;
        }else{
            // 創建一個 Map 來去除重複的 emp_id 並合併 shCase
            let uniqueStaffMap = new Map();
            staff_inf.forEach(item => {
                if (item.emp_id === removeEmp.value) {      // 跳過這個 emp_id，達到刪除的效果
                    return;
                }
                if (uniqueStaffMap.has(item.emp_id)) {  // 如果 emp_id 已經存在，則合併 shCase
                    let existingShCase = uniqueStaffMap.get(item.emp_id).shCase;
                    uniqueStaffMap.get(item.emp_id).shCase = existingShCase.concat(item.shCase);
                } else {                                // 如果 emp_id 不存在，則新增
                    uniqueStaffMap.set(item.emp_id, item);
                }
            });
            // 將 Map 轉換回陣列
            staff_inf = Array.from(uniqueStaffMap.values());
            let table = $('#hrdb_table').DataTable();
            if(table) {
                await release_dataTable();                                            // 銷毀dataTable
            }
            var row = removeEmp.parentNode.parentNode.parentNode;       // 找到按鈕所在的行
            row.parentNode.removeChild(row);                            // 刪除該行
            inside_toast(`刪除單筆資料${removeEmp.value}...Done&nbsp;!!`, 1000, 'info');
            await reload_dataTable();                                       // 重新載入dataTable   
        }
    }
    // 240904 load_staff_byDeptNo       ；call from mk_dept_nos_btn()...load_fun(myCallback)...
    async function rework_loadStaff(loadStaff_arr){
        loadStaff_tmp = [];     // 清空臨時陣列...
        //step1. 依工號查找hrdb，帶入最新員工資訊 到 staff_inf
        for (const [s_index, s_value] of Object.entries(loadStaff_arr)) {
            const select_empId = (s_value['emp_id'] !== undefined) ? s_value['emp_id'] : null;      // step1-1.取出emp_id
            let empData = staff_inf.find(emp => emp.emp_id === select_empId);                     // step1-2.查找staff_inf內該員工是否存在
            // 241022 -- 為了套入Excel後儲存原始資料，不進行強制套用hrdb資料....主要For T6/FAB6
            // 250217 為了確認員工是否仍在職...
            if(!empData){                                                                           // step1-3.沒資料就進行hrdb查詢..241101 暫停取用hrdb進行更新。??? 250203停更
                const showEmpInfo = await search_fun('showEmpInfo', select_empId);                  // 依功號搜尋人事資料庫...
                const showEmp = showEmpInfo.find(emp => emp.emp_id === select_empId);               // 從返回的陣列中取得正確的員工資料
                if(showEmp){
                    loadStaff_tmp = loadStaff_tmp.concat(showEmpInfo);   // 合併2個陣列到loadStaff_tmp
                }
            }
        }
        // step2.等待上面搜尋與合併臨時欄位loadStaff_tmp完成後...
        for (const [s_index, s_value] of Object.entries(loadStaff_tmp)) {
            const select_empId = (s_value['emp_id'] !== undefined) ? s_value['emp_id'] : null;      // step2-1.取出emp_id
            let empData = loadStaff_arr.find(emp => emp.emp_id === select_empId);                   // step2-2. 先取得select_empId的個人資料=>empData
            //  empData = empData.concat(loadStaff_tmp[s_index]);                                       // 合併2個陣列
            empData = empData ? empData : {};                                                       // step2-3. 確保 empData 是陣列，否則初始化為空陣列
            // Object.assign(empData, loadStaff_tmp[s_index]);                                         // step2-4. 如果 empData 是一個物件而不是陣列，需要將其轉換成陣列或合併物件 241101 暫停取用hrdb進行更新。???
            // 241101 暫停取用hrdb進行更新。 改用下面：
            // empData.BTRTL          = s_value.BTRTL;                   // 人事子範圍-建物代號
            // empData.dept_no        = s_value.dept_no;                 // 部門代號
            // empData.emp_dept       = s_value.emp_dept;                // 部門名稱
            // empData.emp_sub_scope  = s_value.emp_sub_scope.replace(/ /g, '');     // 人事子範圍名稱
            // empData.omager         = s_value.omager;
               empData.stat2txt       = s_value.stat2txt;                // 在職中
            // empData.currentYear    = currentYear;                     // 作業年度
        }
        await mgInto_staff_inf(loadStaff_arr);
        inside_toast('彙整&nbsp;員工資料...Done&nbsp;!!', 1000, 'info');
    }
    // 240904 將loadStaff進行欄位篩選與合併到臨時陣列loadStaff_tmp    ；call from search_fun()
    async function rework_staff(searchStaff_arr){
        return new Promise((resolve) => {
            Object.entries(searchStaff_arr).forEach(([index, staffValue]) => {
                const rework_staff = {
                    // 'emp_sub_scope' : staffValue.emp_sub_scope.replace(/ /g, '&nbsp;'),
                    'BTRTL'         : staffValue.BTRTL,             // 人事子範圍-建物代號
                    'cname'         : staffValue.cname,
                    'cstext'        : staffValue.cstext,            // 職稱物件長名
                    'dept_no'       : staffValue.dept_no,           // 簽核部門代碼
                    'emp_id'        : staffValue.emp_id,
                    'emp_dept'      : staffValue.emp_dept,          // 簽核部門物件長名
                    'emp_group'     : staffValue.emp_group,         // 員工群組名稱
                    'emp_sub_scope' : staffValue.emp_sub_scope,     // 人事子範圍名稱
                    'gesch'         : staffValue.gesch,             // 性別
                    'HIRED'         : staffValue.HIRED,             // 到職日
                    'natiotxt'      : staffValue.natiotxt,          // 國籍名稱
                    'schkztxt'      : staffValue.schkztxt,          // 工作時程表規則名稱
                    'omager'        : staffValue.omager,            // 上級主管
                    'currentYear'   : currentYear                   // 作業年度
                };
                loadStaff_tmp = loadStaff_tmp.concat(rework_staff);   // 合併2個陣列到combined
            })

            resolve();  // 當所有設置完成後，resolve Promise
        });
    }

    // 250203 在匯入的時候就直接補上對應欄位資料
    async function rework_omager(excelStaff_arr){
        const excelStaff_arr_length = excelStaff_arr.length;                                        // 百分比#1
        if(excelStaff_arr_length > 0){
            let signDept_tmp = [];
            const _fabs = await load_fun('loadFabs', 'return', 'return' );                  // 呼叫通用函數load_fun 取得建物編號
            let loading_pre = 0;                                                                    // 百分比#2
            for(const [index, i_value] of excelStaff_arr.entries()) {
                const loading = Math.round(((Number(index) + 1) / excelStaff_arr_length) * 100);    // 百分比#3
                if(loading !== loading_pre){                                                        // 百分比#4
                    loading_pre = loading;
                    Adj_mLoading('rework', loading); // 呼叫：土法煉鋼法--修改mLoading提示訊息...str1=訊息文字, str2=百分比%
                }
                // step.1 匯入時套上部門代號所屬主管
                if(i_value.dept_no){
                    let this_signDept_i = signDept_tmp.find(signDept_i => signDept_i.OSHORT === i_value.dept_no);               // step1-2.查找staff_inf內該員工是否存在
                    if(this_signDept_i) {
                        excelStaff_arr[index]['omager'] = this_signDept_i['OMAGER'] ?? null;
                    }else{
                        const signDept = await search_fun('showSignCode', i_value.dept_no);     // 確保每次search_fun都等待完成
                        signDept_tmp = [...signDept_tmp, ...signDept];                           // 合併2個陣列
                        if(signDept.length > 0 && signDept[0]['OMAGER'] != undefined) {
                            excelStaff_arr[index]['omager'] = signDept[0]['OMAGER'] ?? null;
                        }
                    }
                }
                // step.2 匯入時套上最最基本的訊息
                const select_empId = i_value.emp_id ?? null;        // step1-1.取出emp_id
                if(select_empId){
                    const empInfo = await search_fun('showEmpInfo', i_value.emp_id);                // 確保每次search_fun都等待完成
                    const empData = empInfo.find(emp => emp.emp_id === select_empId);               // step1-2.查找staff_inf內該員工是否存在
                    if(empData) {
                        // excelStaff_arr[index]['gesch']    = empData.gesch ?? null;              // 性別
                        // excelStaff_arr[index]['HIRED']    = empData.HIRED ?? null;              // 到職日
                        // excelStaff_arr[index]['natiotxt'] = empData.natiotxt ?? null;           // 國籍名稱
                        const { gesch = null, HIRED = null, natiotxt = null } = empData;
                        excelStaff_arr[index] = { ...excelStaff_arr[index], gesch, HIRED, natiotxt };
                    }
                    // 250210 匯入時補上建物編號...
                    const thisFab = _fabs.find(_fab => _fab['fab_title'].includes(i_value.emp_sub_scope));
                    if(thisFab && thisFab.BTRTL != undefined) {
                        excelStaff_arr[index]['BTRTL'] = thisFab.BTRTL ?? null;                 // 建物編號
                    }
                }
            }
        }
        loadStaff_tmp = [...loadStaff_tmp, ...excelStaff_arr];   // 合併2個陣列到combined
    }

    // 240912 將Obj物件進行Key的排列...call from searchWorkCaseAll()
    function sortObjKey(originalObj){
        return new Promise((resolve) => {
            const sortedKeys = Object.keys(originalObj).sort();     // 取得排序後的 key 陣列
            const sortedObj = {};
            sortedKeys.forEach(key => {
                sortedObj[key] = originalObj[key];                  // 根據排序後的 key 陣列重建新物件
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
            // 將合併後的物件mergedData加入 shCase 陣列中，使用 await 調用 removeDuplicateShCase 去重
            empData['shCase'] = await removeDuplicateShCase(empData_shCase);
        };
        await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
    }
    // 240912 從Excel匯入時，自動篩選合適對應的特作項目，並崁入...
    function searchWorkCase(OSHORT, HE_CATE_str) {               // 帶入參數：特危部門代號、特危類別
        return new Promise((resolve) => {
            const [cateKey, cateValue] = HE_CATE_str.split(":"); // 解析 HE_CATE_str，得到 key 和 value
            for (const obj of shLocal_inf) {                     // 遍歷陣列，尋找符合條件的物件
                if (obj.OSHORT === OSHORT) {                     // 比對 OSHORT
                    if (obj.HE_CATE[cateKey] === cateValue) {    // 比對 HE_CATE 的 key 和 value
                        resolve(obj);                            // 找到符合的物件，resolve 該物件
                        return;                                  // 結束函數
                    }
                }
            }
            resolve(null);                                       // 如果沒有找到，resolve null
        });
    }


// // phase 1 -- 生成按鈕
    // [p1 函數-1] 動態生成所有按鈕，並重新綁定事件監聽器
    function mk_deptNos_btn(selectedDeptNo) {
        return new Promise((resolve) => {
                let countNoOmager = 0;  // 250214 增加無主管noOmgaer的計數
                // 驗證並取得開啟btn的權限disabled or none  // oKey:部門代號, oValue:單筆部門資料, iBTRTL:建物代碼, uInfo:userInfo
                function getButtonDisabledStatus(oKey, oValue, iBTRTL, uInfo) {
                    if (uInfo.role <= 1) {
                        return "";
                    } 
                    if ((uInfo.role == 2 || uInfo.role == 2.2) && (uInfo.BTRTL.includes(oValue.BTRTL) || uInfo.BTRTL.includes(iBTRTL))) {
                        return "";
                    } else if ((uInfo.role == 2.5) && (oKey == uInfo.signCode)) {
                        return "";
                    } else if ((uInfo.role == 3)   && (oKey == uInfo.signCode) && (oValue.omager == uInfo.empId)) {
                        return "";
                    } else if ((uInfo.role <= 3)   && (oValue.omager == uInfo.empId)) {
                        return "";
                    }
                    return "disabled";
                }
                // 驗證是否有omager回饋noOmager or none
                function checkOmager(oValue) {
                    return ((oValue.omager == undefined) || (oValue.omager == null) || (oValue.omager == 'null')) ? 'noOmager' : '';
                }
            // init
            $('#deptNo_opts_inside').empty();
            // step-1. 鋪設按鈕
            if(selectedDeptNo.length > 0){     // 判斷使否有長度值
                for (const _item of selectedDeptNo) {
                    Object.entries(_item).forEach(([emp_sub_scope, oh_value]) => {
                        // 獲取有效的 BTRTL
                        const i_BTRTL = Object.values(oh_value).map(i_value => i_value.BTRTL).find(btrtl => btrtl !== 'null');
                        let ostext_btns = `
                            <div class="col-lm-3 p-1">
                                <div class="card">
                                    <div class="card-header"><b>>>&nbsp;${emp_sub_scope}</b></div>
                                    <div class="card-body p-2">
                                        ${Object.entries(oh_value).map(([o_key, o_value]) =>{
                                            const disabledStatus = getButtonDisabledStatus(o_key, o_value, i_BTRTL, userInfo);
                                            const noOmager = checkOmager(o_value);
                                            if(noOmager){ countNoOmager++; }    // 250214 增加無主管noOmgaer的計數
                                            return `
                                                <button type="button" name="deptNo[]" id="${currentYear},${emp_sub_scope},${o_key}" value="${o_key}" class="btn btn-info my-1 add_btn ${noOmager}" 
                                                    style="width: 100%; text-align: start;" data-toggle="tooltip" data-placement="bottom" title="omager: ${o_value.omager}" ${disabledStatus}>
                                                    ${o_key}&nbsp;${o_value.OSTEXT}&nbsp;${o_value._count}件<sup class="text-danger" name="sup_${o_key},${emp_sub_scope}[]"> (${o_value.shCaseNotNull_pc}%)</sup>
                                                </button>`;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>`;
                        $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
                    })
                };
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
                deptNo_btn.addEventListener('click', async function() {
                    mloading();                                               // 啟用mLoading
                    // 工作一 清空暫存
                        await resetINF(true); // 清空
                    // 工作二
                        const thisId_arr    = this.id.split(',');   // 分割this.id成陣列
                        const emp_sub_scope = thisId_arr[1];        // 取出陣列 1=emp_sub_scope
                        const dept_no       = thisId_arr[2];        // 取出陣列 2=dept_no
                        const _doc = _docs_inf.find(_d => _d.dept_no == dept_no && _d.emp_sub_scope == emp_sub_scope );
                        _docsIdty_inf = _doc ? (_doc.idty ?? null) : null;
                    // 工作三 依部門代號撈取員工資料 後 進行鋪設
                        const selectedValues_str = JSON.stringify(this.id).replace(/[\[\]\ ]/g, '');
                        await load_fun('load_staff_byDeptNo', selectedValues_str, rework_loadStaff);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                    // 250213 指派主管開關                        
                        const noOmager = this.classList.contains('noOmager');   // 使用 classList.contains 檢查類別
                        assignOmager_btn.classList.toggle('block',   noOmager);  // 當 noOmager 為 true  時添加 'block'   類別
                        assignOmager_btn.classList.toggle('unblock', !noOmager); // 當 noOmager 為 false 時添加 'unblock' 類別
                        assignOmager_btn.disabled = !noOmager;                   // 啟閉指派主管
                    $('#nav-p2-tab').tab('show');
                    // $("body").mLoading("hide");
                });
            });
            // p1. [通用]在任何地方啟用工具提示框
            $('[data-toggle="tooltip"]').tooltip();
            // 250214 增加無主管noOmgaer的橫幅提醒
            if(countNoOmager && userInfo.role <= 2){
                Balert( `注意：目前有 ${countNoOmager} 個部門沒有主管(部門代號錯誤或已消滅)，如紅色粗框標示，請務必前往確認或指派主管！`, 'danger')
            }

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    // [p1 函數-2] 241213 將送審的百分比改成送審中
    async function filtApprove(_docs) {
        _docs_inf = _docs;      // 帶入inf
        const reviewStep = await load_fun('reviewStep', 'return', );     // 呼叫通用函數load_fun+ p1 函數-2 生成btn
        const _step = reviewStep.step;
        let rejectList = '!! 退回編輯：';
        _docs.forEach( _doc => {
            const deptNo_sups = document.querySelectorAll(`#deptNo_opts_inside sup[name="sup_${_doc.dept_no},${_doc.emp_sub_scope}[]"]`);
            const innerHTMLValue = (_doc.idty == 2) ? "退回編輯" : _step[_doc.idty].approvalStep;
                if(_doc.idty == 2){
                    rejectList += `${_doc.emp_sub_scope}&nbsp;${_doc.dept_no},${_doc.emp_dept}&nbsp;`
                }
            // 更新所有符合條件的節點的 innerHTML
            deptNo_sups.forEach( node => { node.innerHTML = `(${innerHTMLValue})`; });
            const deptNo_btns = document.querySelectorAll(`#deptNo_opts_inside button[id*=",${_doc.emp_sub_scope},${_doc.dept_no}"]`);
            deptNo_btns.forEach(deptNo_btn => {
                // 如果 idty 等於 2 退件，則更新按鈕樣式
                if (_doc.idty == 2) {
                    deptNo_btn.classList.remove('btn-info');
                    deptNo_btn.classList.remove('add_btn');
                    deptNo_btn.classList.add('btn-warning');
                }
                // 如果 idty 大於 4，則更新按鈕樣式
                if (_doc.idty >= 4) {
                    deptNo_btn.classList.remove('btn-info');
                    deptNo_btn.classList.add('btn-outline-secondary');
                }
                // 點擊編輯權限 --- 250210 這裡改到mk_deptNos_btn()裡面用getButtonDisabledStatus()去決定開關...
                // deptNo_btn.disabled = doc_Role_bool;
            })
        })
        if(rejectList !== '!! 退回編輯：'){
            Balert( rejectList, 'warning');
            inside_toast(rejectList, 5000, 'warning');
        }
    }
    // [p1 函數-1] 設置事件監聽器和MutationObserver
    async function p1_init(deptNosObj) {
        postBanner('reviewStep', 1, 3, 'pic-1-2.png');
        await mk_deptNos_btn(deptNosObj);             // 呼叫函數-2 生成p3部門slt按鈕
    }
    // [p1 函數-3] 設置事件監聽器和MutationObserver
    async function p1_eventListener() {
            // p1. [通用]在任何地方啟用工具提示框
            $('[data-toggle="tooltip"]').tooltip();
            // [步驟-1] 初始化設置
            let parm = { _year : currentYear };
            await load_fun('load_staff_dept_nos', JSON.stringify(parm), p1_init);     // 呼叫通用函數load_fun+ p1 函數-2 生成btn
            await load_fun('load_document', JSON.stringify(parm), filtApprove);       // load_fun的變數傳遞要用字串
            await reload_postMemoMsg_btn_Listeners();
            // p1-3. 增加簽核[Agree]鈕的監聽動作...// p-2 批次儲存員工清單...
            reviewSubmit_btn.addEventListener('click', async function() {
                mloading();
                const action = this.getAttribute('value');              // 使用 getAttribute 獲取 value
                const getCommValue  = id => document.querySelector(`#submitModal textarea[id="${id}"]`).value;
                const submitValue   = JSON.stringify({
                        updated_emp_id  : userInfo.empId,
                        updated_cname   : userInfo.cname,
                        currentYear     : currentYear,
                        action          : action,
                        sign_comm       : getCommValue('sign_comm'),
                        staff_inf       : staff_inf
                    })
                const result = await load_fun('bat_storeStaff', submitValue, 'return');     // step1.先進行儲存
                if(result.action === 'success') {
                    await load_fun('storeForReview', submitValue, show_swal_fun);           // step2a.如果成功--進行送審...
                }else{
                    alert(result.content+' & 尚未提交 !!');                                 // step2b.儲存失敗即返回
                }
                $("body").mLoading("hide");
                submit_modal.hide();
                // location.reload();
            })

            // p1-3. 增加指派主管鈕的監聽動作...
            assignOmagerSubmit_btn.addEventListener('click', async function() {
                mloading();
                const getValue = id => document.querySelector(`#assignOmagerModal input[id="${id}"]`).value;                            // 取得數值
                const setValue = newOmger_str => document.querySelector(`#nav-p2_table snap[id="newOmager"]`).innerText = newOmger_str; // 指定內容
                const newOmagerEmpID = getValue('assignOmager');        // 取得新主管工號
                if (newOmagerEmpID) {
                    // 每一筆繞出來更新omager
                    for (const staff of await staff_inf) {
                        const yearKey = staff['year_key']; // 取得作業年度
                        const currentOmager = staff['_logs']?.[yearKey]?.['omager']; // 使用可選鏈結運算子取得omager
                        if (currentOmager == null || userInfo.role <= 2.2) { // 合併檢查條件
                            staff['_logs'][yearKey]['omager'] = newOmagerEmpID; // 更新omager -- 這裡改的是logs...
                        }
                        staff['omager'] = newOmagerEmpID; // 更新omager -- 這裡直接改在外層...儲存時會以這個值為主
                    }
                    const newOmagerName = getValue('assignOmagerName'); // 取得新主管姓名
                    const newOmger_str = `指派主管：${newOmagerName} (${newOmagerEmpID})`; // 組合字串
                    setValue(newOmger_str);                         // 指定snap顯示新主管訊息內容
                    inside_toast(newOmger_str, 5000, 'warning');    // 調用toast顯示新主管訊息內容
                    assignOmager_modal.hide();                      // 關閉modal
                } else {
                    alert('沒有新主管工號訊息 !!');
                }
                $('#assignOmagerBadge').empty();                    // 清除modal畫面中Badge
                $('#assignOmager, #assignOmagerName').val('');      // 清除modal中empId&cName
                $("body").mLoading("hide");
            })

    }


// [default fun]
    $(async function() {
        
        await p1_eventListener();                     // 呼叫函數-3 建立監聽
        await p2_eventListener();                     // 呼叫函數-3 建立監聽

        $("body").mLoading("hide");
        
    });
