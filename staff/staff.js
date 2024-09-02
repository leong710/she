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

    // [p-0]
        // 240823 將匯入資料合併到shLocal_inf
        async function mgInto_shLocal_inf(new_shLocal_arr){
            Object.keys(new_shLocal_arr).forEach((new_sh_key) => {
                new_shLocal_arr[new_sh_key]['HE_CATE'] = JSON.parse(new_shLocal_arr[new_sh_key]['HE_CATE']);
            })
            // 240826 進行shLocal_inf重複值的比對並合併
            shLocal_inf = shLocal_inf.concat(new_shLocal_arr);   // 合併
            let uniqueMap = new Map();      // 使用 Map 來去重

            shLocal_inf.forEach(item => {
                let key = `${item.id}-${item.OSHORT}`;
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, item);
                }
            });
            // 將結果轉換為陣列
            shLocal_inf = Array.from(uniqueMap.values());
                console.log('2-mgInto_shLocal_inf--shLocal_inf...', shLocal_inf);
            await post_shLocal(shLocal_inf)
        }
        // 240822 將匯入資料合併到staff_inf
        async function mgInto_staff_inf(excel_json_value_arr){
            // const excel_json_value_arr = JSON.parse(excel_json_value);
            // console.log('2.excel_json_value_arr...', excel_json_value_arr);
            const addIn_arr1 = ['HE_CATE', 'HE_CATE_KEY', 'no'];                                        // 合併陣列1
            const addIn_arr2 = {'OSTEXT_30':'emp_sub_scope', 'OSHORT':'dept_no', 'OSTEXT':'emp_dept'};  // 合併陣列2
            const excel_OSHORT_arr = [];
            Object.keys(excel_json_value_arr).forEach((e_key) => {      // 
                // 初始化 shCase 陣列
                if (!excel_json_value_arr[e_key]['shCase']) {
                    excel_json_value_arr[e_key]['shCase'] = [];
                }
                // 建立一個新的物件來儲存合併的資料
                let mergedData = {};
                // 遍歷 addIn_arr1 並合併數據
                addIn_arr1.forEach((addIn_i) => {
                    if (excel_json_value_arr[e_key][addIn_i]) {
                        mergedData[addIn_i] = excel_json_value_arr[e_key][addIn_i];  // 合併
                        // 刪除合併後的屬性
                        delete excel_json_value_arr[e_key][addIn_i];
                    }
                });
                // 遍歷 addIn_arr2 並合併數據
                for (const [a2_key, a2_value] of Object.entries(addIn_arr2)) {
                    if (excel_json_value_arr[e_key][a2_value]) {
                        mergedData[a2_key] = excel_json_value_arr[e_key][a2_value];  // 合併

                        if(a2_key=='OSHORT'){
                            excel_OSHORT_arr.push(excel_json_value_arr[e_key][a2_value])  // extra: 取得部門代號 => 抓特危場所清單用
                        }
                    }
                }
                // 將合併後的物件加入 shCase 陣列中
                excel_json_value_arr[e_key]['shCase'].push(mergedData);
            });
                // 240826 進行emp_id重複值的比對並合併
                    let combined = staff_inf.concat(excel_json_value_arr);   // 合併2個陣列到combined
                    let uniqueStaffMap = new Map();                         // 創建一個 Map 來去除重複的 emp_id 並合併 shCase
                    combined.forEach(item => {
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

            // *** 精煉 shLocal 
                const excel_OSHORTs_str = (JSON.stringify([...new Set(excel_OSHORT_arr)])).replace(/[\[\]]/g, ''); // 過濾重複部門代號 + 轉字串
                load_fun('load_shLocal', excel_OSHORTs_str, mgInto_shLocal_inf);         // 呼叫load_fun 用 部門代號字串 取得 特作清單 => mgInto_shLocal_inf合併shLocal_inf

            await release_dataTable();                  // 停止並銷毀 DataTable
            await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
            await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
            // await reload_HECateTable_Listeners();       // 重新定義HE_CATE td
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

                await release_dataTable();                  // 停止並銷毀 DataTable
                await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
                await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
                // await reload_HECateTable_Listeners();       // 重新定義HE_CATE td
                inside_toast(`刪除單筆資料${removeEmpId}...Done&nbsp;!!`);
            }
        }
        // 根據 select_empId 清空對應的 DOM區域 for p-2特作欄位
        async function clearDOM(empId) {
            // 使用屬性選擇器選取所有包含 empId 的 td 元素
            const tdsToClear = document.querySelectorAll(`td[id*=",${empId}"]`);
            // 遍歷這些選取到的元素並清空內容
            tdsToClear.forEach(td => {
                td.innerHTML = '';
            });
        }
        // 通用的函數，用於更新 DOM for p-2特作欄位
        async function updateDOM(sh_value, select_empId, sh_key_up) {
            // 欲更新的欄位陣列
            const shLocal_item_arr = ['MONIT_LOCAL', 'WORK_DESC', 'HE_CATE', 'AVG_VOL', 'AVG_8HR', 'eh_t'];
            shLocal_item_arr.forEach((sh_item) => {
                if (sh_value[sh_item] !== undefined) {
                    const br = sh_key_up > 1 ? '<br>' : '';
                    let inner_Value = '';
                    if (sh_item === 'HE_CATE'){             // 類別代號 特別處理：1.物件轉字串、2.去除符號
                        let he_cate_str = JSON.stringify(sh_value[sh_item]).replace(/[{"}]/g, '');
                        inner_Value = `${br}${he_cate_str}`;
                
                    }else if(sh_item.includes('AVG')){      // 均能音壓、平均音壓 特別處理：判斷是空值，就給他一個$nbsp;佔位
                        let avg_str = sh_value[sh_item] ? sh_value[sh_item] : '&nbsp;';
                        inner_Value = `${br}${avg_str}`;
                    }else{
                        inner_Value = `${br}${sh_value[sh_item]}`;
                    }
                    document.getElementById(`${sh_item},${select_empId}`).insertAdjacentHTML('beforeend', inner_Value);

                    // 噪音驗證
                    if (sh_item === 'HE_CATE' && Object.values(sh_value['HE_CATE']).includes('噪音') && (sh_value['AVG_VOL'] || sh_value['AVG_8HR'])) {
                        // 個人shCase的噪音中，假如有含eh_t值，就導入使用。
                            const eh_t_input = document.querySelector(`input[id="eh_t,${select_empId}"]`);
                            // 檢查元素是否存在+是否有值
                            const eh_t_input_value = (eh_t_input && eh_t_input.value) ? eh_t_input.value : false;

                        const eh_t    = (sh_value['eh_t'])    ? sh_value['eh_t']    : eh_t_input_value;
                        const avg_vol = (sh_value['AVG_VOL']) ? sh_value['AVG_VOL'] : false;
                        const avg_8hr = (sh_value['AVG_8HR']) ? sh_value['AVG_8HR'] : false;

                        const noise_check = checkNoise(eh_t, avg_vol, avg_8hr);     // 呼叫[fun]checkNoise
                        // const noise_check_str = `${br}${sh_key_up}:&nbsp;A-${noise_check.aSample}&nbsp;B-${noise_check.bSample}&nbsp;C-${noise_check.cCheck}`; // 停用顯示 aSample bSample
                        const noise_check_str = `${br}${noise_check.cCheck}`;
                        document.getElementById(`NC,${select_empId}`).insertAdjacentHTML('beforeend', noise_check_str);

                        eh_t_input.value = (eh_t_input_value != eh_t) ? eh_t : eh_t_input.value;    // 判斷eh_t輸入格是否一致，強行帶入顯示~

                        // 紀錄個人(噪音)特檢資格shCondition['Noise']...是=true；未達、不適用=false
                        const empData = staff_inf.find(emp => emp.emp_id === select_empId);
                        const i_index = sh_key_up - 1;
                        // empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : empData['shCondition']['noise'];
                        empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : false;
                    }
                }
            });
        }
        // 更新資格驗證(1by1)
        async function updateShCondition(ShCondition_value, select_empId) {
            let inner_Value = JSON.stringify(ShCondition_value).replace(/[{"}]/g, '');
                inner_Value = inner_Value.replace(/,/g, '<br>');
            document.getElementById(`shCondition,${select_empId}`).insertAdjacentHTML('beforeend', inner_Value);

            let ShCondition_arr = [];
            Object.entries(ShCondition_value).forEach(([item, value]) => {
                if(value){
                    ShCondition_arr.push(item)
                }
                ShCondition_str = JSON.stringify(ShCondition_arr).replace(/[\[\]{"}]/g, '');
                document.getElementById(`shIdentity,${select_empId}`).innerHTML = '';
                document.getElementById(`shIdentity,${select_empId}`).insertAdjacentHTML('beforeend', ShCondition_str);
            })
        }
        // 240827 驗證噪音是否符合   // eh_t：每日暴露時數(t)、 avg_vol：均能音量(dBA)、 avg_8hr：工作日八小時平均音值(dBA)
        // 樣本編號（A）換算Dose≧50% ； 樣本編號（B）八小時平均音值(dBA)≧50
        function checkNoise(eh_t, avg_vol, avg_8hr) {
            const result = {
                aSample : '不適用',
                bSample : avg_8hr !== false ? (avg_8hr >= 50 ? '符合' : '未達') : '不適用',
                cCheck  : '不適用',
            };
            if (eh_t && avg_vol) {
                const TC = (8 / Math.pow(2, (avg_vol - 90) / 5)).toFixed(2);    // TC：T換算  // 計算 TC 並四捨五入
                const DOSE = ((eh_t / TC) * 100).toFixed(0);                    // 計算 DOSE 並四捨五入
                result.aSample = DOSE >= 50 ? '符合' : '未達';
            }
            if (result.bSample === '符合' || (result.bSample === '不適用' && result.aSample === '符合')) {
                result.cCheck = '是';
            } else if (result.bSample === '未達' || result.aSample === '未達') {
                result.cCheck = '否';
            }
            return result;
        }
        // 渲染特危項目 for p-2特作欄位(1by1)
        async function post_shCase(emp_arr){
            emp_arr.forEach((emp_i) => {
                const { emp_id: select_empId, shCase ,shCondition} = emp_i;
                if (shCase) {
                    Object.entries(shCase).forEach(([sh_key, sh_value], index) => {
                        // console.log('post_shCase--sh_key, sh_value...', sh_key, sh_value);
                        updateDOM(sh_value, select_empId, index + 1);
                    });
                }
                // 更新資格驗證(1by1)
                if (shCondition) {
                    updateShCondition(shCondition, select_empId);
                }
            });
        }
        // [p1 函數-7] 渲染到shLocal互動視窗 for shLocal互動視窗
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
                            s_value = JSON.stringify(s_value);
                            s_value = s_value.replace(/[{"}]/g, '');
                            // // s_value = s_value.replace(/"/g, '');
                            s_value = s_value.replace(/,/g, '<br>');

                        }else if(s_key == 'eh_t'){          // mgInto_shLocal_inf(new_shLocal_arr) 在二次導入時有摻雜到"eh_t"...應予以排除
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
        // 更換shLocal_modal內的emp_id值 for shLocal互動視窗
        function reNew_empId(this_value){
            $('#import_shLocal #import_shLocal_empId').empty().append(this_value);
        }
        // [p1 函數-4] 建立監聽~shLocalTable的checkbox for shLocal互動視窗
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
                            empData.shCondition = {
                                "noise"   : false,
                                "newOne"  : false,
                                "regular" : false,
                                "change"  : false
                            };       
                        // 清空目前顯示的 DOM
                        clearDOM(select_empId);         // 你需要根據 select_empId 來清空對應的 DOM
                        // 然後將新勾選的項目進行更新
                        selectedOptsValues.forEach((sov_vaule, index) => {

                            empData.shCase[index] = shLocal_inf[sov_vaule];
                            if(empData.shCase[index]['HE_CATE'] && Object.values(empData.shCase[index]['HE_CATE']).includes('噪音')){
                                // 假如input有eh_t值，就導入使用。
                                const eh_t_input = document.querySelector(`input[id="eh_t,${select_empId}"]`);
                                // 檢查元素是否存在+是否有值
                                empData.shCase[index]['eh_t'] = (eh_t_input && eh_t_input.value) ? eh_t_input.value : false;
                            }
                            updateDOM(shLocal_inf[sov_vaule], select_empId, index + 1);
                            // [停用] 過濾...emp的部門代號 與 shLocal的部門代號是否一致...才准許導入
                            // if(empData.dept_no !== shLocal_inf[sov_vaule]['OSHORT']){
                            //     inside_toast(`選用之特危作業(${shLocal_inf[sov_vaule]['HE_CATE']}) 其部門代號(${shLocal_inf[sov_vaule]['OSHORT']})與員工部門代號(${empData.dept_no}) 不一致...返回&nbsp;!!`);
                            // }
                        });

                        // 更新資格驗證(1by1)
                        if (empData.shCondition) {
                            updateShCondition(empData.shCondition, select_empId);
                        }
                        console.log('reload_shLocalTable_Listeners--empData...', empData);      // 這裡會顯示一筆empData
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
        async function eventListener() {
            return new Promise((resolve) => {
                // step-1. 在任何地方啟用工具提示框
                $('[data-toggle="tooltip"]').tooltip();
                // step-1-1a. p-1 監聽步驟1[棟別]的checkbox變化
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
                    // step-1-1b. p-1 初始化監聽器
                    rebindOSHORTsOptsListeners();
                // step-1-2a. p-1 使用MutationObserver監控OSHORTs區域內文本變化
                const observer = new MutationObserver(() => {
                    const isEmpty = OSHORTsDiv.innerText.trim() === '';
                    OSHORTs_opts.classList.toggle('is-invalid', isEmpty);
                    OSHORTs_opts.classList.toggle('is-valid', !isEmpty);

                    // 每次 OSHORTs 變動時也更新 select_OSHORTs 的內容
                    mk_select_OSHORTs(Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[type="checkbox"]')));
                });
                    // step-1-2b. p-1 設置觀察選項並開始監控
                    observer.observe(OSHORTsDiv, { childList: true, subtree: true }); 
                // step-1-3. p-1 監聽 load_hrdb_btn 取得人事資料庫
                load_hrdb_btn.addEventListener('click', function() {
                    const select_OSHORTs_str = document.getElementById('select_OSHORTs').innerText; // 取得部門代號字串
                    // load_fun('load_hrdb', select_OSHORTs_str, post_hrdb);               // 呼叫load_fun 用 部門代號字串 取得 人員清單 => post_hrdb渲染
                    load_fun('load_hrdb', select_OSHORTs_str, mgInto_staff_inf);         // 呼叫load_fun 用 部門代號字串 取得 人員清單 => 合併到mgInto_staff_inf post_hrdb渲染
                    inside_toast('取得&nbsp;hrdb員工清單...Done&nbsp;!!');
                    $('#nav-p2-tab').tab('show');                                       // 切換頁面
                });
                // step-3.[load_excel] 以下為上傳後"iframe"的部分
                    // step-3-1. p-2 監控按下送出鍵後，打開"iframe"
                    excelUpload.addEventListener('click', ()=> {
                        iframeLoadAction();
                        loadExcelForm();
                    });
                    // step-3-2. p-2 監控按下送出鍵後，打開"iframe"，"load"後，執行抓取資料
                    iframe.addEventListener('load', ()=> {
                        iframeLoadAction();
                    });
                    // step-3-3. p-2 監控按下[載入]鍵後----呼叫Excel載入
                    import_excel_btn.addEventListener('click', ()=> {
                        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                        var excel_json = iframeDocument.getElementById('excel_json');           // 正確載入
                        var stopUpload = iframeDocument.getElementById('stopUpload');           // 錯誤訊息

                        if (excel_json) {
                            document.getElementById('excelTable').value = excel_json.value;
                            const excel_json_value_arr = JSON.parse(excel_json.value);
                            mgInto_staff_inf(excel_json_value_arr)      // 呼叫[fun] 
                            inside_toast(`批次匯入Excel資料...Done&nbsp;!!`);

                        } else if(stopUpload) {
                            console.log('請確認資料是否正確');
                        }else{
                            console.log('找不到 ? 元素');
                        }
                    });

                // 當所有設置完成後，resolve Promise
                resolve();
            });
        }
        // [p1 函數-5] 多功能擷取fun 新版改用fetch
        async function load_fun(fun, parm, myCallback) {        // parm = 參數
            mloading(); 
            // console.log(fun, parm);
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

                    tr += `<td id="MONIT_LOCAL,${emp_i.emp_id}"></td> <td id="WORK_DESC,${emp_i.emp_id}"></td> <td id="HE_CATE,${emp_i.emp_id}" class="HE_CATE"></td> <td id="AVG_VOL,${emp_i.emp_id}"></td> <td id="AVG_8HR,${emp_i.emp_id}"></td>`;
                    tr += `<td><input type="number" id="eh_t,${emp_i.emp_id}" name="eh_t" class="form-control" onchange="change_eh_t(this.id, this.value)" ></td> <td id="NC,${emp_i.emp_id}"></td>`;

                    tr += `<td><input type="checkbox" id="SH3,${emp_i.emp_id}" name="emp_ids[]" value="${emp_i.emp_id}" class="form-check-input" >`;
                        tr += `&nbsp;&nbsp;<button type="button" class="btn btn-outline-danger btn-sm btn-xs add_btn" value="${emp_i.emp_id}" onclick="eraseStaff(this.value)">刪除</button>`;
                        tr += `<br><span id="shIdentity,${emp_i.emp_id}"></span></td>`;
                    
                    // tr += emp_i.HIRED ? `<td>${emp_i.HIRED}</td>` : `<td> -- </td>`;
                    tr += `<td id="shCondition,${emp_i.emp_id}"></td>`;
                    tr += `<td id="Transition,${emp_i.emp_id}"></td>`;

                    tr += '</tr>';
                    $('#hrdb_table tbody').append(tr);
                })
                await reload_dataTable(emp_arr);               // 倒參數(陣列)，直接由dataTable渲染
            }
            $("body").mLoading("hide");
        }
    // p-2 當有輸入每日暴露時數eh_t時...
    function change_eh_t(this_id, this_value){       // this.id, this.value
        const this_id_arr = this_id.split(',')       // 分割this.id成陣列
        const select_empId = this_id_arr[1];         // 取出陣列1=emp_id
        // step-1 將每日暴露時數eh_t存到指定staff_inf
            const empData = staff_inf.find(emp => emp.emp_id === select_empId);
            if (empData) {
                empData.shCase = empData.shCase || [];
                // 然後將暴露時數eh_t值 進行更新對應的empId下shCase含'噪音'的項目中。
                empData.shCase.forEach((sh_v, sh_i) => {
                    if((sh_v['HE_CATE'] != undefined ) && Object.values(sh_v['HE_CATE']).includes('噪音')){
                        empData.shCase[sh_i]['eh_t'] = Number(this_value);
                    }
                });
            }
            // console.log('change_eh_t--staff_inf..', empData);
        // step-2 更新噪音資格 // 取自 post_shCase(empData); 其中一段
            clearDOM(select_empId);                 // 你需要根據 select_empId 來清空對應的 DOM
            const { shCase, shCondition } = empData;
            if (shCase) {
                Object.entries(shCase).forEach(([sh_key, sh_value], index) => {
                    updateDOM(sh_value, select_empId, index + 1);
                });
            }
            // 更新資格驗證(1by1)
            if (shCondition) {
                updateShCondition(shCondition, select_empId);
            }
    }

    function bat_storeStaff(){
        load_fun('bat_storeStaff', JSON.stringify(staff_inf), show_swal_fun);   // load_fun的變數傳遞要用字串
    }

    // [p-2]
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
                // 定義要抓的key=>value
                const item_keys = {
                    // "id"            : "aid",
                    "OSHORT"        : "部門代碼",
                    "OSTEXT_30"     : "廠區",
                    "OSTEXT"        : "部門名稱",
                    "HE_CATE"       : "類別",
                    "AVG_VOL"       : "均能音量",
                    "AVG_8HR"       : "工作日8小時平均音壓值",
                    "MONIT_NO"      : "監測編號",
                    "MONIT_LOCAL"   : "監測處所",
                    "WORK_DESC"     : "作業描述",
                    "flag"          : "開關",
                    "created_at"    : "建檔日期",
                    "updated_at"    : "最後更新",
                    "updated_cname" : "最後編輯",
                };
                let sort_listData = [];                         // 建立整理陣列
                for(let i=0; i < shLocals.length; i++){
                    sort_listData[i] = {};                      // 建立物件
                    Object.keys(item_keys).forEach(function(i_key){
                        sort_listData[i][item_keys[i_key]] = shLocals[i][i_key];
                    })
                }

                let htmlTableValue = JSON.stringify(sort_listData);
                document.getElementById(to_module+'_htmlTable').value = htmlTableValue;
            }

        // modal：[searchStaff]
            // fun.2-2a：search Key_word
            function search_fun(fun){
                mloading("show");                                               // 啟用mLoading
                if(fun=='search'){
                    var search = $('#searchkeyWord').val().trim();              // search keyword取自user欄位
                    if(!search || (search.length < 2)){
                        $("body").mLoading("hide");
                        alert("查詢字數最少 2 個字以上!!");
                        return false;
                    } 
                    var request = {
                        functionname : 'search',                                // 操作功能
                        uuid         : 'e65fccd1-79e7-11ee-92f1-1c697a98a75f',  // nurse
                        search       : search                                   // 查詢對象key_word
                    }
                }else{
                    return false;
                }

                $.ajax({
                    url: 'http://tneship.cminl.oa/api/hrdb/index.php',          // 正式2024新版
                    method: 'post',
                    dataType: 'json',
                    data: request,
                    success: function(res){
                        postList(res["result"]);                                // 呼叫[fun.2-2b]將結果給postList進行渲染
                    },
                    error (err){
                        console.log("search error:", err);
                        $("body").mLoading("hide");
                        alert("查詢錯誤!!");
                    }
                })
            }
            // fun.2-2b：渲染功能
            function postList(res_r){
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





    $(function() {
        // [步驟-1] 初始化設置
        const selectedValues = OSTEXT_30s.filter(cb => cb.checked).map(cb => cb.value);
        mk_OSHORTs(selectedValues); // 呼叫函數-1

        eventListener(); // 呼叫函數-3

        // let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        let message  = '*** mgInto_shLocal_inf(new_shLocal_arr) 在二次導入時有摻雜到"eh_t"...應於以排除! &nbsp;~&nbsp;';
        Balert( message, 'warning')

    });
