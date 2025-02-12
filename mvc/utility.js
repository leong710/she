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
    function inside_toast(sinn, delayTime, type){
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
    // fun.0-3: swal
    function show_swal_fun(swal_value){
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
    function release_dataTable(){
        return new Promise((resolve) => {
            let table = $('#hrdb_table').DataTable();
                table.destroy();
            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    // fun.0-4a: dataTable
    async function reload_dataTable(){
        // dataTable 2 https://ithelp.ithome.com.tw/articles/10272439
        return new Promise((resolve) => {
            release_dataTable();        // 呼叫[fun.0-4b] 停止並銷毀 DataTable
            // 重新初始化 DataTable
            $('#hrdb_table').DataTable({
                "language": { url: "../../libs/dataTables/dataTable_zh.json" }, // 中文化
                "autoWidth": false,                                              // 自動寬度
                "order": [[ 2, "asc" ], [ 1, "asc" ], [ 0, "asc" ]],            // 排序
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
                    formData.append('parm', parm);                  // 後端依照fun進行parm參數的採用

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


    async function postBanner(a, b, pic) {
        const reviewStep = await load_fun('reviewStep', 'reviewStep', 'return');     // 呼叫通用函數load_fun+ p1 函數-2 生成btn
        let banner = 'sorry! reviewStep error ...';
        if(reviewStep){
            const banS = '<span><h5><ul class="mb-0">';
            const banM = '&nbsp;<sup class="text-danger">- ';
            const banli= '</sup></li>';
            const banE = '</ul></h5></span>';
            banner = banS;
            for (let i = a; i <= b; i++) {
                if(reviewStep.step[i] != undefined){
                    banner += `<li>step.${reviewStep.step[i].idty}&nbsp;${reviewStep.step[i].approvalStep}&nbsp;(${reviewStep.step[i].remark})`+ banM + `${reviewStep.step[i].group}` + banli ;
                }
            }
            // banner += banE + `<img src="../image/banner-1-2.png" alt="banner pic" class="img-thumbnail banner-img" onerror="this.onerror=null; this.src='../image/lvl.png';">`;
            // banner += banE + `<img src="../image/pic-2-2.png" alt="banner pic" class="banner-img rounded" onerror="this.onerror=null; this.src='../image/lvl.png';">`;
            banner += banE + `<img src="../image/${pic}" alt="banner pic" class="banner-img rounded" onerror="this.onerror=null; this.src='../image/lvl.png';">`;
        }
        document.getElementById(`banner`).insertAdjacentHTML('beforeend', banner);     // 渲染各項目
    }


    // 點擊姓名鋪設到下面 渲染preYear去年特危項目 for p-2特作欄位(select_empId)     // 241024 
    async function show_preYearShCase(select_empId){
        const empData = staff_inf.find(emp => emp.emp_id === select_empId);
            const thead = document.querySelector('#shCase_table thead');        // 獲取表格的 thead
            const columnCount = thead.rows[0].cells.length;                     // 獲取每行的欄位數量

        let tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 無 ${preYear} 儲存紀錄 ~ </td><tr>`;
        if(empData._logs != undefined && (empData._logs[preYear] != undefined)){
            // console.log('show_preYearShCase...empData...', empData._logs);
            // 鋪設t-body
            const tdClass = `<td><div class="bottom-half"`;
            const empId_preYear = `,${select_empId},${preYear}"></div></div></td>`;
                tr1 = '<tr>';
                tr1 += tdClass + ` id="emp_id`        + empId_preYear;
                tr1 += tdClass + ` id="emp_sub_scope` + empId_preYear;
                tr1 += tdClass + ` id="emp_dept`      + empId_preYear;
                tr1 += tdClass + ` id="HE_CATE`       + empId_preYear;
                tr1 += tdClass + ` id="MONIT_LOCAL`   + empId_preYear;
                tr1 += tdClass + ` id="WORK_DESC`     + empId_preYear;

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

            const { _logs , _content } = empData;
            const preYear_logs = _logs[preYear];

            if(preYear_logs){
                const { shCase ,shCondition, emp_dept, emp_sub_scope, dept_no, eh_time } = preYear_logs;
                clearDOM(select_empId, preYear);            // 你需要根據 select_empId 來清空對應的 DOM
                // step.1 欄位1,2,3
                document.getElementById(`emp_id,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', `<b>${empData.emp_id}</b><br>${empData.cname}`); 
                document.getElementById(`emp_sub_scope,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', `<b>${preYear}：</b><br>${emp_sub_scope}`); 
                document.getElementById(`emp_dept,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', `${dept_no}<br>${emp_dept}`);              
                document.getElementById(`eh_time,${select_empId},${preYear}`).insertAdjacentHTML('beforeend', `${eh_time}`);

                // step.2 更新shCase欄位4,5,6,7,8,9,10
                if (shCase) {
                    // step.2 欲更新的欄位陣列 - 對應欄位4,5,6,7,8,9
                    const shLocal_item_arr = ['MONIT_LOCAL', 'WORK_DESC', 'HE_CATE', 'AVG_VOL', 'AVG_8HR'];     // , 'eh_time'
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

                                // }else if(sh_item.includes('eh_time') && empData_shCase_Noise ){      // 4.5.每日暴露時間：判斷是空值，就給他一個$nbsp;佔位
                                //     let eh_time = sh_value[sh_item] ? sh_value[sh_item] : '&nbsp;';
                                //     let eh_time_input = `<snap id="eh_time,${select_empId},${preYear},${sh_key}" >${eh_time}</snap>`;
                                //     inner_Value = `${br}${eh_time_input}`;

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
                                    // 2b2. 個人shCase的噪音中，假如有含eh_time值，就導入使用。
                                        // eh_time_input.innerText = (empData['eh_time'])  ? (empData['eh_time'])  : null;    // 強行帶入顯示~
                                        // eh_time_input.innerText = (sh_value['eh_time']) ? (sh_value['eh_time']) : null;    // 強行帶入顯示~
                                        const eh_time = preYear_logs['eh_time'] ? Number(preYear_logs['eh_time']) : false;
                                        const avg_vol = sh_value['AVG_VOL']     ? Number(sh_value['AVG_VOL'])     : false;
                                        const avg_8hr = sh_value['AVG_8HR']     ? Number(sh_value['AVG_8HR'])     : false;

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
        // // 渲染 今年目前特危項目 for p-2特作欄位(arr_All)
            // async function post_shCase(emp_arr){
            //     for (const emp_i of emp_arr) {      // 使用 for...of 替代 forEach 因為 forEach 不會等待 await 的執行
            //         const { emp_id: select_empId, shCase, shCondition} = emp_i;

            //         // doCheck(select_empId);          // 更新驗證項目(1by1)
            //         await clearDOM(select_empId);         // 你需要根據 select_empId 來清空對應的 DOM
            //         if (shCase) {
            //             Object.entries(shCase).forEach(([sh_key, sh_value], index) => {
            //                 await updateDOM(sh_value, select_empId, index);
            //             });             
            //         }
            //         // 更新資格驗證(1by1)
            //         if (shCondition) {
            //             await updateShCondition(shCondition, select_empId, currentYear);
            //         }
            //     };
            // }

    // 渲染 今年目前特危項目 for p-2特作欄位(arr_All)
    async function post_shCase(emp_arr){
        const emp_arr_length = emp_arr.length;                                              // 百分比#1
        let loading_pre = 0;                                                                // 百分比#2
        // for (const emp_i of emp_arr) {      // 使用 for...of 替代 forEach 因為 forEach 不會等待 await 的執行
        for (const [emp_key, emp_i] of emp_arr.entries() ) {        // 分解參數(陣列)，手工渲染，再掛載dataTable...
            const loading = Math.round(((Number(emp_key) + 1) / emp_arr_length) * 100);     // 百分比#3
            if(loading !== loading_pre){                                                    // 百分比#4
                loading_pre = loading;
                Adj_mLoading('post_shCase', loading); // 呼叫：土法煉鋼法--修改mLoading提示訊息...str1=訊息文字, str2=百分比%
            }

            const { emp_id: select_empId, shCase ,shCondition} = emp_i;
            // doCheck(select_empId);          // 更新驗證項目(1by1)
            await clearDOM(select_empId);         // 你需要根據 select_empId 來清空對應的 DOM
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
    // 渲染到shLocal互動視窗 for shLocal modal互動視窗
    async function post_shLocal(shLocal_arr){
        const shLocal_keys = ['id', 'OSTEXT_30', 'OSHORT', 'OSTEXT', 'HE_CATE', 'MONIT_NO', 'MONIT_LOCAL', 'WORK_DESC', 'AVG_VOL', 'AVG_8HR'];
        $('#shLocal_table tbody').empty();
        if(shLocal_arr.length === 0){
            const thead = document.querySelector('#shLocal_table thead');        // 獲取表格的 thead
            const columnCount = thead.rows[0].cells.length;                      // 獲取每行的欄位數量
            const tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 沒有資料 ~ </td><tr>`;
            $('#shLocal_table tbody').append(tr1);
        }else{
            shLocal_inf = shLocal_arr;                                           // 把shLocal_inf建立起來
            Object.entries(shLocal_arr).forEach(([sh_key, sh_i])=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                let tr = '<tr>';
                for (const s_key of shLocal_keys) {
                    let s_value = sh_i[s_key];
                    if(s_key == 'HE_CATE'){
                        s_value = JSON.stringify(s_value).replace(/[{"}]/g, '');
                        s_value = s_value.replace(/,/g, '<br>');
                    }else if(s_key == 'eh_time'){          // mgInto_shLocal_inf(new_shLocal_arr) 在二次導入時有摻雜到"eh_time"...應予以排除
                        return;
                    }
                    tr += '<td>' + s_value + '</td>';
                }
                tr += `<td class="text-center"><input type="checkbox" name="shLocal_id[]" value="${sh_key}" class="form-check-input" check ></td>`;
                tr += '</tr>';
                $('#shLocal_table tbody').append(tr);
            })
        }
        await reload_shLocalTable_Listeners();      // 重新建立監聽~shLocalTable的checkbox
        $("body").mLoading("hide");
    }
    // p-2 當有輸入每日暴露時數eh_time時...
    async function change_eh_time(this_id, this_value){    // this.id, this.value
        const this_id_arr = this_id.split(',')       // 分割this.id成陣列
        const select_empId = this_id_arr[1];         // 取出陣列1=emp_id
        const select_year  = this_id_arr[2];         // 取出陣列2=year
        const shCase_index = this_id_arr[3];         // 取出陣列3=shCase_index
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
                // empData.shCase[shCase_index]['eh_time'] = Number(this_value);
                empData['eh_time'] = Number(this_value);
            }
            // console.log('change_eh_time--staff_inf..', empData);

        // step-2 更新噪音資格 // 取自 post_shCase(empData); 其中一段
            const { shCase, shCondition } = empData;
            // 更新驗證項目(1by1)
            // doCheck(select_empId);
            clearDOM(select_empId);                 // 你需要根據 select_empId 來清空對應的 DOM
            if (shCase) {
                Object.entries(shCase).forEach(([sh_key, sh_value], index) => {
                    updateDOM(sh_value, select_empId, index);
                });
            }
            // 更新資格驗證(1by1)
            if (shCondition) {
                // await edit_shCondition_submit(select_empId);
                await updateShCondition(shCondition, select_empId, currentYear);
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