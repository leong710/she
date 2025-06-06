    
    // [p2 函數-4] 建立監聽~shLocalTable的HE_CATE td for p-2特作欄位 // 檢查類別代號 開啟 importShLocal_modal
    // reload_HECateTable_Listeners()保留在staff_editModal.js

    // 241108 改變HE_CATE calss吃css的狀態；主要是主管以上不需要底色編輯提示
    // changeHE_CATEmode()保留在staff_editModal.js
    
    // 241121 建立shCondition監聽功能 for 編輯 = [特檢資格]
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
                const edit_fun    = 'shCondition';                      // 指定功能
                $('#edit_modal #edit_modal_empId').empty().append(`${edit_fun}, ${edit_cname}, ${edit_empId}`); // 清空+填上工號
                // step.2 顯示身段資料列
                const thead = `<table id="edit_modal_table" class="table table-striped table-hover"><thead><tr>
                                <th title="key">key</th><th title="item">項目</th><th title="value">value</th></tr></thead><tbody></tbody></table>`;

                $('#edit_modal .modal-body').empty().append(`${thead}`);     // 清空thead+鋪設表頭
                // $('#edit_modal_table tbody').empty();                   // 清空tbody
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
                if(currentYear_yearHe != null && currentYear_yearHe != '') {
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
                            let sh_value_arr = sh_value ? sh_value.split(';').filter(e => e !== "") : [];   // 去除空格
                                // 生成 檢查類別代號+項目類別代號
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
                            tr += `</td></tr>`
                            break;
                        default:
                    }
                    $('#edit_modal_table tbody').append(tr);          // 填上各列資料
                }
                // step.3 顯示互動視窗
                edit_modal.show();                               // 顯示互動視窗
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
        const isShCondition_bool = userInfo.role <= 3 && _docsIdty_inf <= 4;
        const targetCate = document.querySelectorAll(`#hrdb_table td[id*=",shCondition`);  
        targetCate.forEach(tdItem => {
            tdItem.classList.toggle(isShCondition_bool ? 'shCondition'  : 'xshCondition');
            tdItem.classList.toggle(isShCondition_bool ? 'xshCondition' : 'shCondition');
        });
    }


    // 241121 建立yearHe監聽功能 for 編輯 = [項目類別代號]
    let yearHeClickListener;
    async function reload_yearHeTable_Listeners() {
        return new Promise((resolve) => {
            const yearHe = document.querySelectorAll('[class="yearHe"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (yearHeClickListener) {
                yearHe.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                    tdItem.removeEventListener('click', yearHeClickListener);   // 將每一個tdItem移除監聽, 當按下click
                })
            }
            // 定義新的監聽器函數
            yearHeClickListener = async function () {
                // step.1 標題列顯示姓名工號
                const this_id_arr = this.id.split(',')                  // 分割this.id成陣列
                const edit_cname  = this_id_arr[0];                     // 取出陣列0=cname
                const edit_empId  = this_id_arr[1];                     // 取出陣列1=emp_id
                const edit_fun    = 'yearHe';                      // 指定功能
                $('#edit_modal #edit_modal_empId').empty().append(`${edit_fun}, ${edit_cname}, ${edit_empId}`); // 清空+填上工號
                // step.2.0 取得 post_yearHe / 順便渲染到modal
                await load_fun('load_heCate','load_heCate', post_heCate);
                // step.2.1 取得個人今年的_yearHe，並轉成陣列
                const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
                const { shCase, shCondition, _content } = empData;
                const _yearHe = _content[`${currentYear}`]['import']['yearHe'] !== undefined ? _content[`${currentYear}`]['import']['yearHe'] : '';
                const _yearHe_arr = _yearHe.includes(',') ? _yearHe.split(',') : [_yearHe];
                // step.2.2 讓存在既有名單的清單打勾
                const heCate_arr = Array.from(document.querySelectorAll('#edit_modal .modal-body input[name="heCate[]"]'));
                heCate_arr.forEach(heCate_checkbox => {
                    heCate_checkbox.checked = _yearHe_arr.includes(heCate_checkbox.value)
                })
                // step.3 顯示互動視窗
                edit_modal.show();                               // 顯示互動視窗
                $("body").mLoading("hide");
            }
            // 添加新的監聽器
            yearHe.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                tdItem.addEventListener('click', yearHeClickListener);      // 將每一個tdItem增加監聽, 當按下click
            })

            resolve();
        });
    }
    // 241108 改變yearHe calss吃css的狀態；主要是主管以上不需要底色編輯提示
    function changeYearHeMode(){
        const isYearHe_bool = userInfo.role <= 3 && _docsIdty_inf < 4 ;
        const targetCate = document.querySelectorAll(`#hrdb_table td[id*=",yearHe`);  
        targetCate.forEach(tdItem => {
            tdItem.classList.toggle(isYearHe_bool ? 'yearHe'  : 'xyearHe');
            tdItem.classList.toggle(isYearHe_bool ? 'xyearHe' : 'yearHe');
        });
    }

    // 250211 建立yearPre監聽功能 for 編輯 = [項目類別代號]
    let yearPreClickListener;
    async function reload_yearPreTable_Listeners() {
        return new Promise((resolve) => {
            const yearPre = document.querySelectorAll('[class="yearPre"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (yearPreClickListener) {
                yearPre.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                    tdItem.removeEventListener('click', yearPreClickListener);   // 將每一個tdItem移除監聽, 當按下click
                })
            }
            // 定義新的監聽器函數
            yearPreClickListener = async function () {
                // step.1 標題列顯示姓名工號
                const this_id_arr = this.id.split(',')                  // 分割this.id成陣列
                const edit_cname  = this_id_arr[0];                     // 取出陣列0=cname
                const edit_empId  = this_id_arr[1];                     // 取出陣列1=emp_id
                const edit_fun    = 'yearPre';                      // 指定功能
                $('#edit_modal #edit_modal_empId').empty().append(`${edit_fun}, ${edit_cname}, ${edit_empId}`); // 清空+填上工號
                // step.2 取得個人匯入3的_yearPre，// 並轉成陣列--有待評估
                const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
                const { _content } = empData;
                const _yearPre = _content[`${currentYear}`]['import']['yearPre'] !== undefined ? _content[`${currentYear}`]['import']['yearPre'] : '';
                // step.3 渲染內容
                post_yearPre(_yearPre)
                // step.4 顯示互動視窗
                edit_modal.show();                               // 顯示互動視窗
                $("body").mLoading("hide");
            }
            // 添加新的監聽器
            yearPre.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                tdItem.addEventListener('click', yearPreClickListener);      // 將每一個tdItem增加監聽, 當按下click
            })

            resolve();
        });
    }
    // 250211 改變yearPre calss吃css的狀態；主要是主管以上不需要底色編輯提示
    function changeYearPreMode(){
        const isYearPre_bool = userInfo.role <= 3 && _docsIdty_inf < 4 ;
        const targetCate = document.querySelectorAll(`#hrdb_table td[id*=",yearPre"]`);  
        targetCate.forEach(tdItem => {
            tdItem.classList.toggle(isYearPre_bool ? 'yearPre'  : 'xyearPre');
            tdItem.classList.toggle(isYearPre_bool ? 'xyearPre' : 'yearPre');
        });
    }

    
        function post_heCate(heCate_str) {
            return new Promise((resolve) => {
                const heCate_arr = JSON.parse(heCate_str);
                let tr = `<div class="col-12 text-start px-5">`;
                for (const [key, value] of Object.entries(heCate_arr)) {
                    tr += `<div class="form-check form-check-inline">`;
                    tr += `<input name="heCate[]" id="${key}" value="${key}:${value}" type="checkbox" class="form-check-input" ` // + (sh_value ? 'checked' : '');
                    tr += ` ><label class="form-check-label" for="${key}">${key}&nbsp;:&nbsp;${value}</label></div><br>`;
                }
                tr += `</div>`;
                $('#edit_modal .modal-body').empty().append(tr);             // 清空tbody
                
                resolve();
            });
        }

        function post_yearPre(yearPre_str) {
            return new Promise((resolve) => {
                let tr = `<div class="col-12 text-start p-1">`;
                    tr +=   `<div class="form-floating">
                                <textarea name="yearPre" id="yearPre" class="form-control" style="height: 150px">${yearPre_str}</textarea>
                                <label for="yearPre" class="form-label">yearPre/去年檢查項目：</label>
                            </div>`;
                    tr +=   `</div>`;

                $('#edit_modal .modal-body').empty().append(tr);             // 清空tbody
                
                resolve();
            });
        }


    // p2-3. 監控按下[更新]]鍵後----自編輯modal資料載入更新
    editModal_btn.addEventListener('click', async function() {
        // step.1 取得工號&個人資料
        const empDiv = document.querySelector('#edit_modal #edit_modal_empId').innerText;
        const this_id_arr = empDiv.split(',')                  // 分割this.id成陣列
        const edit_fun    = this_id_arr[0].trim();                     // 取出陣列0=fun
        // const edit_cname  = this_id_arr[1].trim();                     // 取出陣列1=cname
        const edit_empId  = this_id_arr[2].trim();                    // 取出陣列2=emp_id
        switch (edit_fun) {
            case 'shCondition':
                await edit_shCondition_submit(edit_empId);
                break;
            case 'yearHe':
                await edit_yearHe_submit(edit_empId);
                break;
            case 'yearPre':
                await edit_yearPre_submit(edit_empId);
                break;
            default:
        }
        edit_modal.hide();
    })
   
        function edit_shCondition_submit(empId) {
            return new Promise((resolve) => {
                let result = {};        // 初始化結果物件
                let editModal_tbody = document.querySelector('#edit_modal_table tbody');    // 定義table範圍
                // 遍歷每一列
                editModal_tbody.querySelectorAll('tr').forEach(row => {
                    let cells = row.querySelectorAll('td');             // 取得該列的所有儲存格
                    if (cells.length === 3) {                           // 確保有兩個儲存格（item 和 value）
                        let key = cells[0].textContent.trim();          // 第 0 個儲存格的值
                        let cell;    // 第 2 個儲存格的type
                        let input_value; // 第 2 個儲存格的值
                        if(key == 'newOne' || key == 'noise') {
                            cell = cells[2].querySelector('input');    // 第 2 個儲存格的type
                            input_value = cell.checked;
        
                        } else {
                            cell = Array.from(cells[2].querySelectorAll('input'));    // 第 2 個儲存格的type
                            for (const cell_i of cell) {
                                let br = input_value != '' ? ';' : '';
                                input_value += cell_i.checked ? br + cell_i.value : '';
                            }
                            if(input_value !== undefined){
                                input_value = input_value.replace(/undefined;?/g, "");        // 去除undefined,
                            }
                        }
                        result[key] = input_value; // 存入結果物件

                    }else{
                        return;
                    }
                });
                // 進行強迫排序
                let sort_item = ['newOne', 'noise'];
                let sorted_result = {};
                for (const sortKey of sort_item) {
                    if((result[sortKey] !== undefined) || (result[sortKey] == false)){
                        sorted_result[sortKey] = result[sortKey];
                    }
                }
                // 回存empData
                // step.1 取得工號&個人資料
                const empData = staff_inf.find(emp => emp.emp_id === empId);   // 取得個人資料
                empData.shCondition = sorted_result;                   // 把資料帶入
                // 清除指定的shCondition欄位
                document.getElementById(`shCondition,${empId},${currentYear}`).innerHTML = '';
                // 更新資格驗證(1by1)
                updateShCondition(empData.shCondition, empId, currentYear);

                resolve();
            });
        }
        function edit_yearHe_submit(empId) {
            return new Promise((resolve) => {
                const heCate_arr = Array.from(document.querySelectorAll('#edit_modal .modal-body input[name="heCate[]"]')); // 定義table範圍
                const selectedValues = heCate_arr.filter(cb => cb.checked).map(cb => cb.value);
                const ObjectValues = JSON.stringify(selectedValues).replace(/[\[{"}\]]/g, '');
                // 回存empData
                // step.1 取得工號&個人資料
                const empData = staff_inf.find(emp => emp.emp_id === empId);   // 取得個人資料
                // 採用淺拷貝的方式來合併物件
                empData._content[`${currentYear}`]['import'] = Object.assign(
                    {}, empData._content[`${currentYear}`]['import'], {
                        'yearHe': ObjectValues      // 把資料帶入Object{物件}
                    }
                );
                // 清除指定的yearHe欄位並更新
                const importItem_value = (ObjectValues != undefined ? ObjectValues :'').replace(/,/g, '<br>');
                const targetDiv = document.getElementById(`${empData.cname},${empId},yearHe`);
                targetDiv.innerHTML = '';
                targetDiv.insertAdjacentHTML('beforeend', importItem_value);

                resolve();
            });
        }
        function edit_yearPre_submit(empId) {
            return new Promise((resolve) => {
                const yearPre_textArea = document.querySelector('#edit_modal .modal-body textarea[name="yearPre"]'); // 定義textarea範圍
                const yearPre_value    = yearPre_textArea.value; // 定義textarea value
                // 回存empData
                // step.1 取得工號&個人資料
                const empData = staff_inf.find(emp => emp.emp_id === empId);   // 取得個人資料
                // 採用淺拷貝的方式來合併物件
                empData._content[`${currentYear}`]['import'] = Object.assign(
                    {}, empData._content[`${currentYear}`]['import'], {
                        'yearPre': yearPre_value      // 把資料帶入Object{物件}
                    }
                );
                // 清除指定的yearHe欄位並更新
                const targetDiv = document.getElementById(`${empData.cname},${empId},yearPre`);
                targetDiv.innerHTML = '';
                targetDiv.insertAdjacentHTML('beforeend', yearPre_value);

                resolve();
            });
        }
