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
    function reload_dataTable(){
        return new Promise((resolve) => {
            // release_dataTable();                                                // 呼叫[fun.0-4b] 停止並銷毀 DataTable
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

                if(parm === 'return' || myCallback === 'return'){
                    return result_obj;                          // resolve(true) = 表單載入成功，then 直接返回值
                }else{
                    return myCallback(result_obj);              // resolve(true) = 表單載入成功，then 呼叫--myCallback
                                                                // myCallback：form = bring_form() 、document = edit_show() 、
                }   
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
    // 重新架構
    async function resetINF(request){
        if(request){
            staff_inf     = [];
            shLocal_inf   = [];
            loadStaff_tmp = [];
            _doc_inf      = [];
            // _doc_inf.idty = null;

            await release_dataTable();
            $('#form_btn_div').empty();
            $('#hrdb_table tbody').empty();
            $('#logs_div .logs tbody').empty();
            $('#reviewInfo').empty();
        }
        // await release_dataTable();                  // 停止並銷毀 DataTable
        // await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
        // await post_preYearShCase(staff_inf);        // step-1-1.重新渲染去年 shCase&判斷  // 241024 停止撲到下面
        // await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷

        if(userInfo.role <= '2.2' && _doc_inf.idty <= 4 ){                        // 限制role <= 3 現場窗口以下...排除主管和路人
            // await reload_HECateTable_Listeners();   // 重新定義HE_CATE td   // 關閉可防止更動 for簽核
            await reload_shConditionTable_Listeners();
            await reload_yearHeTable_Listeners();
        }else{
            // changeHE_CATEmode();                    // 241108 改變HE_CATE calss吃css的狀態；主要是主管以上不需要底色編輯提示
            changeShConditionMode();
            changeYearHeMode();
        }
        await btn_disabled();                       // 讓指定按鈕 依照staff_inf.length 啟停 
    }
    // 讓指定按鈕 依照staff_inf.length 啟停
    function btn_disabled(){
        return new Promise((resolve) => {
            download_excel_btn.disabled  = staff_inf.length === 0;  // 讓 下載 按鈕啟停
            resetINF_btn.disabled        = staff_inf.length === 0;  // 讓 清除 按鈕啟停
            // bat_storeStaff_btn.disabled  = staff_inf.length === 0 || (_doc_inf.idty >= 4);   // 讓 儲存 按鈕啟停
            // SubmitForReview_btn.disabled = staff_inf.length === 0 || (_doc_inf.idty >= 4);   // 讓 送審 按鈕啟停

            // loadExcel_btn.disabled       = (_doc_inf.idty >= 4) || (userInfo.role >= 2);     // 讓 新增 按鈕啟停
            // importStaff_btn.disabled     = (_doc_inf.idty >= 4) || (userInfo.role >= 2);     // 讓 上傳 按鈕啟停

            // if(_doc_inf.idty >= 4){
            //     bat_storeStaff_btn.disabled  = true;  // 讓 儲存 按鈕啟停
            //     SubmitForReview_btn.disabled = true;  // 讓 送審 按鈕啟停
            // }
            
            document.querySelectorAll(`#hrdb_table input[id*="eh_time,"]`).forEach(input => input.disabled   = (_doc_inf.idty >= 5 || _doc_inf.in_sign != userInfo.empId ));     // 讓所有eh_time 輸入欄位啟停 = 主要for已送審
            document.querySelectorAll(`#hrdb_table button[class*="eraseStaff"]`).forEach(btn => btn.disabled = (_doc_inf.idty >= 5 || _doc_inf.in_sign != userInfo.empId ));   // 讓所有eraseStaff btn啟停 = 主要for已送審
            postMemoMsg_btn.disabled     = (_doc_inf.idty >= 4);    // 讓 貼上備註 按鈕啟停
            memoMsg_input.disabled       = (_doc_inf.idty >= 4)
            resolve();
        });
    }

// // phase 4 -- 
    // p-2 當有輸入每日暴露時數eh_time時...
    async function change_eh_time(this_id, this_value){    // this.id, this.value
        const this_id_arr = this_id.split(',')       // 分割this.id成陣列
        const select_empId = this_id_arr[1];         // 取出陣列1=emp_id
        const select_year  = this_id_arr[2];         // 取出陣列2=year
        const shCase_index = this_id_arr[3];         // 取出陣列3=shCase_index
        // step-1 將每日暴露時數eh_time存到指定staff_inf
            const empData = staff_inf.find(emp => emp.emp_id === select_empId);
            if (empData) {
                empData.shCase[shCase_index]['eh_time'] = Number(this_value);
            }

        // step-2 更新噪音資格 // 取自 post_shCase(empData); 其中一段
            const { shCase, shCondition } = empData;

            // 更新驗證項目(1by1)
            clearDOM(select_empId);                 // 你需要根據 select_empId 來清空對應的 DOM
            if (shCase) {
                Object.entries(shCase).forEach(([sh_key, sh_value], index) => {
                    updateDOM(sh_value, select_empId, index);
                });
            }
            // 更新資格驗證(1by1)
            if (shCondition) {
                await updateShCondition(shCondition, select_empId, currentYear);
            }
    }
    // p-2 處理審查工作...
    async function storeForReview(){
        const bat_storeStaff_value = JSON.stringify(staff_inf);
        await load_fun('bat_storeStaff', bat_storeStaff_value, 'return');           // load_fun的變數傳遞要用字串
        await load_fun('storeForReview', bat_storeStaff_value, show_swal_fun);      // load_fun的變數傳遞要用字串
        location.reload();
    }
    // 
    async function processSubmit(action){   // 已崁入監聽中

        const getInputValue = id => document.querySelector(`#submitModal #forwarded input[id="${id}"]`).value;
        const getCommValue  = id => document.querySelector(`#submitModal textarea[id="${id}"]`).value;
        const submitValue   = {
            updated_emp_id  : userInfo.empId,
            updated_cname   : userInfo.cname,
            action          : action,
            forwarded       : {
                in_sign     : (action == '5') ? getInputValue('in_sign')     : null ,
                in_signName : (action == '5') ? getInputValue('in_signName') : null
            },
            sign_comm       : getCommValue('sign_comm'),
            _doc            : _doc_inf,
            _staff          : staff_inf
        }
            console.log('submitValue =>', submitValue);

        submit_modal.hide();

    }


// // phase 3 -- 渲染與鋪設
    // [p1 函數-6] 渲染hrdb
    async function post_hrdb(emp_arr){
        // 停止並銷毀 DataTable
            release_dataTable();
            $('#hrdb_table tbody').empty();

        if(emp_arr.length === 0){
            $('#hrdb_table tbody').append('<div class="text-center text-dnager">沒有資料</div>');
        }else{
            const importItem_arr = ['yearHe', 'yearCurrent', 'yearPre'];
            await Object(emp_arr).forEach((emp_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                let tr1 = '<tr>';
                const empId_currentYear = `,${emp_i.emp_id},${currentYear}">`;
                const _content_import = emp_i._content[`${currentYear}`]['import'] !== undefined ? emp_i._content[`${currentYear}`]['import'] : {};
                const _content_memo   = emp_i._content[`${currentYear}`]['memo']   !== undefined ? emp_i._content[`${currentYear}`]['memo']   : [];
                tr1 += `<td class="">
                            <div class="col-12 p-0">${emp_i.emp_id}</br><button type="button" class="btn btn-outline-primary add_btn " name="emp_id" value="${emp_i.cname},${emp_i.emp_id}" `
                                + (emp_i.HIRED ? ` title="到職日：${emp_i.HIRED}" ` : ``) +` data-bs-toggle="modal" data-bs-target="#aboutStaff" aria-controls="aboutStaff">${emp_i.cname}</button></div>`
                                + (_content_memo.length !== 0  ? `<div class="col-12 pt-1 pb-0 px-0" >
                                    <button type="button" class="btn btn-outline-success btn-sm btn-xs add_btn " value="${emp_i.cname},${emp_i.emp_id}" data-toggle="tooltip" data-placement="bottom" title="總窗 備註/有話說"
                                        onclick="memoModal(this.value)" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight"><i class="fa-regular fa-rectangle-list"></i></button>
                                </div>` : ``)
                            +`</td>`;
                tr1 += `<td><b>${currentYear}：</b><br>`+ ((emp_i.emp_sub_scope != undefined ? emp_i.emp_sub_scope : emp_i.shCase_logs[currentYear].emp_sub_scope )) +`</td>`;
                                                
                tr1 += `<td>`+ ((emp_i.dept_no != undefined ? emp_i.dept_no : emp_i.shCase_logs[currentYear].dept_no )) +`<br>`
                                + ((emp_i.emp_dept != undefined ? emp_i.emp_dept : emp_i.shCase_logs[currentYear].emp_dept )) +`</td>`;
                tr1 += `<td><div id="MONIT_LOCAL` + empId_currentYear + `</div></td>`;
                tr1 += `<td><div id="WORK_DESC` + empId_currentYear + `</div></td>`;

                tr1 += `<td class="HE_CATE" id="${emp_i.cname},${emp_i.emp_id},HE_CATE"><div id="HE_CATE` + empId_currentYear + `</div></td>`;
                tr1 += `<td><div id="AVG_VOL` + empId_currentYear + `</div></td>`;
                tr1 += `<td><div id="AVG_8HR` + empId_currentYear + `</div></td>`;

                tr1 += `<td><div id="eh_time` + empId_currentYear + `</div></td>`;
                tr1 += `<td><div id="NC` + empId_currentYear + `</div></td>`;

                tr1 += `<td class="shCondition`+(userInfo.role <='2' ? '':' unblock')+`" id="${emp_i.cname},${emp_i.emp_id},shCondition"><div id="shCondition` + empId_currentYear + `</div></td>`;           // 特檢資格

                importItem_arr.forEach((importItem) => {
                    let importItem_value = (_content_import[importItem] != undefined ? _content_import[importItem] :'').replace(/,/g, '<br>');
                    tr1 += `<td class="${importItem}`+(userInfo.role <='3' ? '':' unblock')+`" id="${emp_i.cname},${emp_i.emp_id},${importItem}">${importItem_value}</td>`;
                })

                tr1 += '</tr>';
                $('#hrdb_table tbody').append(tr1);
            })
        }
        await reload_dataTable();               // 倒參數(陣列)，直接由dataTable渲染

        // 240905 [轉調]欄位增加[紀錄].btn：1.建立offcanvas_arr陣列。2.建立canva_btn監聽。3.執行fun，顯示於側邊浮動欄位offcanva。
        const offcanvas_arr = Array.from(document.querySelectorAll('button[aria-controls="aboutStaff"]'));
        offcanvas_arr.forEach(canva_btn => {
            canva_btn.addEventListener('click', function() {
                const this_value_arr = this.value.split(',')       // 分割this.value成陣列
                // const select_cname = this_value_arr[0];            // 取出陣列0=cname
                const select_empId = this_value_arr[1];            // 取出陣列1=emp_id
                $('#aboutStaff #aboutStaff_title').empty().append('( '+ this.value +' )');     // 更新 header title  
                show_preYearShCase(select_empId);
            });
        });

        $("body").mLoading("hide");
    }

    // 渲染 今年目前特危項目 for p-2特作欄位(arr_All)
    async function post_shCase(emp_arr){
        for (const emp_i of emp_arr) {      // 使用 for...of 替代 forEach 因為 forEach 不會等待 await 的執行
            const { emp_id: select_empId, shCase, shCondition} = emp_i;

            // doCheck(select_empId);          // 更新驗證項目(1by1)
            clearDOM(select_empId);         // 你需要根據 select_empId 來清空對應的 DOM
            if (shCase) {
                Object.entries(shCase).forEach(([sh_key, sh_value], index) => {
                    updateDOM(sh_value, select_empId, index);
                });             
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
            const thead = document.querySelector('#shCase_table thead');        // 獲取表格的 thead
            const columnCount = thead.rows[0].cells.length;                     // 獲取每行的欄位數量

        let tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 無 ${preYear} 儲存紀錄 ~ </td><tr>`;
        if(empData.shCase_logs != undefined && (empData.shCase_logs[preYear] != undefined)){
            // console.log('show_preYearShCase...empData...', empData.shCase_logs);
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

            const { shCase_logs , _content } = empData;
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
                const _content_import = _content[`${preYear}`] != undefined ? (_content[`${preYear}`].import ?? {}) : {};
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
    // 鋪設logs紀錄
    async function post_logs(logsJson){
        const logsTable = document.querySelector('#logs_div .logs tbody');
        logsTable.innerHTML = '';
        for (let i = 0, len = logsJson.length; i < len; i++) {
            logsJson[i].remark = logsJson[i].remark.replaceAll('_rn_', '<br>');   // *20231205 加入換行符號
            logsTable.innerHTML += 
                '<tr><td>' + logsJson[i].step + '</td><td>' + logsJson[i].cname + '</td><td>' + logsJson[i].datetime + '</td><td>' + logsJson[i].action + 
                    '</td><td style="text-align: left; word-break: break-all;">' + logsJson[i].remark + '</td></tr>';
        }
        // targetDiv.insertAdjacentHTML('beforeend', importItem_value);
    }
    // 鋪設表頭訊息及待簽人員
    function post_reviewInfo(_doc_inf){
        return new Promise((resolve) => {
            const divs = '<div class="row p-2">';
            const divm = '<div class="col-md-6 bg-light border rounded">';
            const reviewItem_txt   = `<b>Step：</b>${_doc_inf.idty}<br><b>審核：</b>${_doc_inf.subScope} -- ${_doc_inf.deptNo}&nbsp;${_doc_inf.OSTEXT}`;
            const reviewInsign_txt = `<b>待簽：</b>`+((_doc_inf.idty > 0 && _doc_inf.idty <= 6) && _doc_inf.in_sign !='' ? `${_doc_inf.in_signName}&nbsp;(${_doc_inf.in_sign})`:``);
            const reviewflow_txt   = `<b>Flow：</b>${_doc_inf.flow}<br><b>Remark：</b>${_doc_inf.flow_remark.remark}<br><b>Group：</b>${_doc_inf.flow_remark.group}`;
            $('#reviewInfo').empty().append(divs +divm+reviewItem_txt+'<br>'+reviewInsign_txt+'</div>' +divm+reviewflow_txt+'</div></div>');

            resolve();  // 當所有設置完成後，resolve Promise
        });
    }


    // 開啟memoModal的預設工作
    async function memoModal(this_id){
        // step.1 標題列顯示姓名工號
        $('#memoTitle').empty().append(`(${this_id})`);         // 清空+填上工號
        const this_id_arr = this_id.split(',');                 // 分割this.id成陣列
        const edit_empId  = this_id_arr[1];                     // 取出陣列1=emp_id
        postMemoMsg_btn.value = edit_empId;
        // step.2 取得個人今年的memo，並轉成陣列
        const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
        const { _content } = empData;
        const _memo = _content[`${currentYear}`]['memo'] !== undefined ? _content[`${currentYear}`]['memo'] : [];
        // step.3 取得memoBody
        const memoBody = document.getElementById('memoBody');
        memoBody.innerHTML = '';
        // step.4 有memo筆數
        if(_memo.length !== 0){
            let memoCard = '';
            for (const [memo_index, memo_value] of Object.entries(_memo)) {
                memoCard += await mk_memoMsg(memo_index, memo_value);
            }
            // step.4.2 鋪設個人今年的memo
            memoBody.insertAdjacentHTML('beforeend', memoCard);
                scrollToBottom(); // 自動捲動到底部
        }
    }
    // 生成單一memoCard
    function mk_memoMsg(_index, memo_i){
        return new Promise((resolve) => {
            const memoCard = `<tr><td><div class="row g-0" id="memo_i_${_index}">
                                <div class="col-md-3 p-1 cover rounded"><img src="../image/nurse.png" alt="小護士" class="img-thumbnail" onerror="this.onerror=null; this.src='../image/lvl.png';"></div>
                                <div class="col-md-9 p-1">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <h5 class="card-title mb-0" title="${memo_i.emp_id}" >${memo_i.cname}</h5>
                                    </div>
                                    <div class="border rounded p-2 bg-white word_bk">${memo_i.msg}</div><p class="card-text"><small class="text-muted">${memo_i.timeStamp}</small></p></div></div></td></tr>`;
            resolve(memoCard);      // 當所有設置完成後，resolve Promise
        });
    }
    // memoModal自動捲動到底部
    function scrollToBottom() {
        var offcanvasBody = $('#offcanvasRight .offcanvas-body');
        offcanvasBody.scrollTop(offcanvasBody[0].scrollHeight);
    }


// // phase 2 -- 數據操作函數 (Data Manipulation Functions)
    // 240904 將loadStaff進行欄位篩選與合併到臨時陣列loadStaff_tmp    ；call from search_fun()
    async function rework_staff(loadStaff_arr){
        // return new Promise((resolve) => {
            for (const [index, staffValue] of Object.entries(loadStaff_arr)) {
                const age = staffValue.year_key;    // 提取資料年分
                // 將指定的欄位提取到最外圍
                    loadStaff_arr[index].HIRED         = staffValue.shCase_logs[age].HIRED
                    loadStaff_arr[index].dept_no       = staffValue.shCase_logs[age].dept_no
                    loadStaff_arr[index].emp_dept      = staffValue.shCase_logs[age].emp_dept
                    loadStaff_arr[index].emp_sub_scope = staffValue.shCase_logs[age].emp_sub_scope
                    loadStaff_arr[index].gesch         = staffValue.shCase_logs[age].gesch
                    loadStaff_arr[index].natiotxt      = staffValue.shCase_logs[age].natiotxt
            }
            staff_inf = loadStaff_arr;      // 套取staff的表單
            // 套取staff的表單 = for 比對功能，來決定是否儲存
                // loadStaff_tmp = loadStaff_arr;  
            loadStaff_tmp = Object.assign( {}, loadStaff_arr ); // 淺拷貝

            // console.log('loadStaff_arr...',loadStaff_arr);
            await post_hrdb(loadStaff_arr);       // 鋪設--人員資料
            await post_shCase(loadStaff_arr);     // 鋪設--特作資料
            await post_reviewInfo(_doc_inf);              // 鋪設表頭訊息及待簽人員

            await resetINF(false);    // 重新架構：停止並銷毀 DataTable、step-1.選染到畫面 hrdb_table、step-1-2.重新渲染 shCase&判斷、重新定義HE_CATE td、讓指定按鈕 依照staff_inf.length 啟停 

            // resolve();  // 當所有設置完成後，resolve Promise
        // });
    }

    
// // phase 1 -- 生成按鈕
    // [p1 函數-2] 動態生成所有按鈕，並重新綁定事件監聽器
    function mk_deptNos_btn(docDeptNo) {
        return new Promise((resolve) => {
            _docs_inf = docDeptNo;      // 套取docs
            // console.log('docDeptNo =>',docDeptNo);
            // init
            $('#deptNo_opts_inside').empty();
            // step-1. 鋪設按鈕
            if(docDeptNo.length > 0){     // 判斷使否有長度值
                for (const _item of docDeptNo) {
                    Object.entries(_item).forEach(([emp_sub_scope, oh_value]) => {
                        // console.log(emp_sub_scope,oh_value)
                        let ostext_btns = `
                            <div class="col-lm-3 p-1">
                                <div class="card">
                                    <div class="card-header">${emp_sub_scope}</div>
                                    <div class="card-body p-2">
                                        ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                            `<button type="button" name="deptNo[]" id="${emp_sub_scope},${o_key}" value="${o_value.uuid}" class="btn btn-info add_btn my-1" style="width: 100%;text-align: start;" `
                                                // + ((userInfo.role <= 1) ? "": "disabled") +` >
                                                + ` disabled >
                                                ${o_key}&nbsp;${o_value.OSTEXT}&nbsp;${o_value.check_list.length}人<sup class="text-danger" name="sup_${o_key}[]"> (${o_value.idty})</sup></button>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>`;
                        $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
                    });
                };
            }else{
                let ostext_btns = `
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-header">!! 空值注意 !!</div>
                            <div class="card-body">
                                ~ 目前沒有待簽核資料 ~
                            </div>
                        </div>
                    </div>`;
                $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
            }

            // step-2. 綁定deptNo_opts事件監聽器
            const deptNo_btns = document.querySelectorAll('#deptNo_opts_inside button[name="deptNo[]"]');
            deptNo_btns.forEach(deptNo_btn => {
                deptNo_btn.addEventListener('click', async function() {
                    // 工作一 清空暫存
                        await resetINF(true); // 清空

                    // 工作二 
                        let thisValue_arr   = this.value.split(',')       // 分割this.value成陣列
                        // const select_year  = thisValue_arr[0];           // 取出陣列0=年份
                        const select_deptNo   = thisValue_arr[1];           // 取出陣列1=部門代號
                        const select_subScope = thisValue_arr[2];           // 取出陣列1=人事子範圍
                        // 使用 .find() 找到滿足條件的物件
                        const result = _docs_inf.map(doc => doc[select_subScope]).find(value => value !== undefined);
                        // 從 result 中取出對應的廠區/部門代號
                        const _doc = result ? result[select_deptNo] : undefined;  // 確保 result 存在 // 從_docs_inf中取出對應 廠區/部門代號 的表單
                        // console.log('result =>',result);
                        // 採用淺拷貝的方式來合併物件
                        // _doc_inf = Object.assign( {}, _doc_inf, _doc );
                        _doc_inf = _doc;
                        _doc_inf['subScope'] = select_subScope;
                        _doc_inf['deptNo']   = select_deptNo;

                        // 工作三 依部門代號撈取員工資料 後 進行鋪設
                        let checkList = JSON.stringify(_doc['check_list']).replace(/[\/\[\]]/g, '');
                            checkList = checkList.replace(/\,/g, ';').replace(/\"/g, "'");

                        thisValue_arr.push(checkList)
                        const selectedValues_str = JSON.stringify(thisValue_arr).replace(/[\[\]]/g, '');
                        // console.log('selectedValues_str =>',selectedValues_str);
                        
                        // 增加判斷式，取_doc_inf.in_sign == userInfo.empId 來啟閉簽核按鈕
                        const reviewRole = (userInfo.role <= 2 || _doc_inf.in_sign == userInfo.empId )

                        await load_fun('load_staff_byCheckList', selectedValues_str, rework_staff);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                        await mk_form_btn(reviewRole);        // 建立簽核按鈕
                        await post_logs(_doc_inf.logs);       // 鋪設文件歷程

                    $('#nav-p2-tab').tab('show');
                });
            });

            filtApprove(docDeptNo);

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    // [p1 函數-2] 241213 將送審的百分比改成送審中
    async function filtApprove(_docs) {
        const reviewStep = await load_fun('reviewStep', 'return');     // 呼叫通用函數load_fun+ p1 函數-2 生成btn
        const _step = reviewStep.step;

        for (const _doc of _docs) {
                    console.log('_doc =>',_doc);
            for (const [emp_sub_scope, dept_no_value] of Object.entries(_doc)) {
                for (const [dept_no, value] of Object.entries(dept_no_value)) {
                            console.log(dept_no,' => value:',value);
                    const deptNo_sups = document.querySelectorAll(`#deptNo_opts_inside button[id="${emp_sub_scope},${dept_no}"] sup[name="sup_${dept_no}[]"]`);
                    const innerHTMLValue = (value.idty == 2) ? "退回編輯" : _step[value.idty].approvalStep;
                    // 更新所有符合條件的節點的 innerHTML
                    deptNo_sups.forEach(node => { node.innerHTML = `(${value.idty}-${innerHTMLValue})`; });

                    // 決定開啟的權限
                    const doc_Role = !( 
                                    (userInfo.role <= 1) ||                  // 大PM.1 => 全開
                                    // (dept_no == userInfo.signCode) ||      // 同部門 ??    
                                    // (value.BTRTL == userInfo.BTRTL) ||       // 同建物 = 廠護理師.2 /廠工安.2.5
                                    ((userInfo.role == 2 || userInfo.role == 2.2 || userInfo.role == 2.5) && (userInfo.BTRTL.includes(value.BTRTL))) ||  // (廠護理師.2 || 廠工安.2.5) & 同建物
                                    (value.in_sign == userInfo.empId)      // 待簽人員 = 上層主管 /轉呈
                                );
        
                    const deptNo_btns = document.querySelectorAll(`#deptNo_opts_inside button[id="${emp_sub_scope},${dept_no}"]`);
                    deptNo_btns.forEach(deptNo_btn => {
                        // 如果 idty 大於 4，則更新按鈕樣式
                        if (value.idty == 5) {
                            deptNo_btn.classList.remove('btn-info');
                            deptNo_btn.classList.remove('add_btn');
                            deptNo_btn.classList.add('btn-success');
                        } else if (value.idty == 6) {
                            deptNo_btn.classList.remove('btn-info');
                            deptNo_btn.classList.add('btn-outline-secondary');
                        }
                        // 點擊編輯權限
                        deptNo_btn.disabled = doc_Role;
                    });
                    // deptNo_btns.forEach(deptNo_btn => {
                    // })
                }
            }
        }
    }
    // [p1 函數-1] 設置事件監聽器和MutationObserver
    async function p1_init() {
        // p1-1. 取得_docs裡的所有部門代號，並生成btn
            let parm = { _year : currentYear };
            await load_fun('load_doc_deptNos', JSON.stringify(parm), mk_deptNos_btn);     // 呼叫通用函數load_fun+ p1 函數-2 生成btn
    }
    // [p1 函數-3] 設置事件監聽器和MutationObserver
    async function p1_eventListener() {
        return new Promise((resolve) => {
            // p1-2. [通用]在任何地方啟用工具提示框
                $('[data-toggle="tooltip"]').tooltip();
            // p1-3. 增加簽核[Agree]鈕的監聽動作...
                reviewSubmit_btn.addEventListener('click', async function() {
                    // const buttonValue = this.getAttribute('value'); // 使用 getAttribute 獲取 value
                    // console.log('EventListener -- submit! =>', buttonValue);
                    // processSubmit(buttonValue);
                    
                    const action = this.getAttribute('value'); // 使用 getAttribute 獲取 value
                    const getInputValue = id => document.querySelector(`#submitModal #forwarded input[id="${id}"]`).value;
                    const getCommValue  = id => document.querySelector(`#submitModal textarea[id="${id}"]`).value;
                    const submitValue   = JSON.stringify({
                            updated_emp_id  : userInfo.empId,
                            updated_cname   : userInfo.cname,
                            currentYear     : currentYear,
                            action          : action,
                            forwarded       : {
                                in_sign     : (action == '5') ? getInputValue('in_sign')     : null ,
                                in_signName : (action == '5') ? getInputValue('in_signName') : null
                            },
                            sign_comm       : getCommValue('sign_comm'),
                            _doc            : _doc_inf,
                            _staff          : staff_inf
                        })
                        // console.log('submitValue =>', JSON.parse(submitValue)); 
                    
                    if( staff_inf != loadStaff_tmp){   // for 比對功能，來決定是否儲存
                        await load_fun('bat_storeStaff', submitValue, show_swal_fun);      // load_fun的變數傳遞要用字串
                    }
                    await load_fun('processReview', submitValue, show_swal_fun);      // load_fun的變數傳遞要用字串
            
                    submit_modal.hide();
                    location.reload();

                })

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    // 生成簽核btn
    async function mk_form_btn (reviewRole) {
        const formBtnDiv = document.getElementById("form_btn_div");
        formBtnDiv.innerHTML = "";
        if(reviewRole){
            const btn_s = `<button type="button" class="btn `;
            const btn_m = ` add_btn" data-bs-toggle="modal" data-bs-target="#submitModal" value="`;
            const btn_e = `" onclick="mk_submitItem(this.value, this.innerHTML);" disable>`;
        
            const btn_0  = btn_s +"btn-outline-danger"  + btn_m +"0" + btn_e +"作廢 (Abort)</button>";
            const btn_4  = btn_s +"btn-outline-warning" + btn_m +"4" + btn_e +"退回 (Reject)</button>";
            const btn_5  = btn_s +"btn-outline-info"    + btn_m +"5" + btn_e +"轉呈 (Forwarded)</button>";
            const btn_6  = btn_s +"btn-outline-success" + btn_m +"6" + btn_e +"同意 (Approve)</button>";
            const btn_11 = btn_s +"btn-outline-primary" + btn_m +"11"+ btn_e +"承辦同意 (Approve)</button>";
            const btn_10 = btn_s +"btn-outline-primary" + btn_m +"10"+ btn_e +"主管同意 (Approve)</button>";
    
            formBtnDiv.insertAdjacentHTML('beforeend', btn_6 +'&nbsp;'+ btn_5 +'&nbsp;'+ btn_4);
        }
    }
    // 簽核類型渲染
    function mk_submitItem(idty, idty_title){
        $('#idty_title').empty().append(idty_title);
        reviewSubmit_btn.value = idty;

        const forwarded_div = document.getElementById('forwarded'); // 轉呈
        if(forwarded_div && (idty == 5)){
            forwarded_div.classList.remove('unblock');           // 按下轉呈 = 解除 加簽
        }else{
            forwarded_div.classList.add('unblock');              // 按下其他 = 隱藏
        }
    }


// [default fun]
    $(async function() {
        // [步驟-1] 初始化設置
        await p1_init();                              // 呼叫p1 函數-1 生成部門按鈕
        await p1_eventListener();                     // 呼叫p1 函數-3 預設工作+建立監聽
        
        // p2_eventListener();                     // 呼叫函數-3 建立監聽

        // let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        // let message  = '*** 本系統螢幕解析度建議：1920 x 1080 dpi，低於此解析度將會影響操作體驗&nbsp;~';
        // let message  = `<b>STEP 1.名單建立(匯入Excel、建立名單)：</b>總窗護理師  <b>2.工作維護(勾選特危、填暴露時數)：</b>課副理,護理師,ESH工安  <b>3.名單送審(100%的名單按下送審)：</b>課副理,護理師</br><b>4.簽核審查(簽核主管可微調暴露時數)：</b>上層主管,課副理,護理師  <b>5.收單review(檢查名單及特檢資料是否完備)：</b>ESH工安,護理師  <b>6.名單總匯整(輸出健檢名單)：</b>總窗護理師`;
        let message  = `userInfo.signCode：${userInfo.signCode}、.role：${userInfo.role}、.BTRTL：${userInfo.BTRTL}`;
        if(message) {
            Balert( message, 'warning')
        }
        $("body").mLoading("hide");

    });