// // 
    // P-3
    // async function post_staff(post_arr, dateString, shItemArr){
    async function post_staff(post_arr, mergedData, shItemArr){
        // 停止並銷毀 DataTable
            release_dataTable('staff_table');
            $('#staff_table tbody').empty();
            post_arr   = post_arr   ?? [];
            mergedData = mergedData ?? [];
            shItemArr  = shItemArr  ?? [];
                console.log("post_arr =>", post_arr);
                console.log("mergedData =>", mergedData);
            staff_inf  = post_arr;
 
            if(post_arr.length === 0){
                const table = $('#staff_table').DataTable();                    // 獲取表格的 thead
                const columnCount = table.columns().count();                    // 獲取每行的欄位數量
                const tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 沒有資料 ~ </td><tr>`;
                $('#staff_table tbody').append(tr1);
                
            }else{
                    // 部門代號加工+去除[]符號/[{"}]/g, ''
                    function doReplace(_arr){
                        return JSON.stringify(_arr).replace(/[\[{"}\]]/g, '').replace(/:/g, ' : ').replace(/,/g, '<br>'); 
                    }
                    
                    function mkTD(post_i , case_iArr){
                        let tdObj = [];
                        const i_emp_id      = post_i["emp_id"];
                        const i_OSHORT      = case_iArr[3] ?? '';                           // 取出陣列 3 = 部門代號
                        const i_targetMonth = case_iArr[5] ?? '';                           // 取出陣列 5 = 目標年月
                        const i_id = `${i_OSHORT},${i_targetMonth},${i_emp_id}`;

                        // 生成-6:變更體檢項目 - checkbox
                            const i_OSHORTshItemArr = shItemArr[i_OSHORT] ?? [];
                            let td6 = '<snap>';
                                for(const [o_key, o_value] of Object.entries(i_OSHORTshItemArr)){
                                    td6 += `<div class="form-check m-0"> 
                                            <input class="form-check-input" type="checkbox" name="6_shCheck" id="${i_id},6_shCheck,${o_value}" value="${o_value}" >
                                            <label class="form-check-label" for="${i_id},6_shCheck,${o_value}">${o_value}</label></div>`;
                                    }
                            td6 += '</snap>';
                            tdObj['6'] = td6;
                    
                        // 生成-8:是否補檢 - checkbox-switch
                            let td8 = `<snap><div class="form-check form-switch"> 
                                        <input class="form-check-input" type="checkbox" name="8_isCheck" id="${i_id},8_isCheck" checked >
                                        <label class="form-check-label" for="${i_id},isCheck">是</label></div></snap>`;
                            tdObj['8'] = td8;
        
                        // 生成-11變更原因(補檢必填) - select
                            let td11 = `<snap><select class="form-select form-select-sm" aria-label=".form-select-sm example" name="11_whyChange" id="${i_id},11_whyChange">
                                            <option hidden selected>選擇變更原因(補檢必填)</option>
                                            <option value="1.作業場所異動">1.作業場所異動</option>
                                            <option value="2.新增危害場所">2.新增危害場所</option>
                                            <option value="3.新進移工">3.新進移工</option>
                                            <option value="4.其他(←備註說明)">4.其他(←備註說明)</option>
                                        </select></snap>`;
                            tdObj['11'] = td11;

                        // // 生成-9:備註說明 - input - date
                        //     const inputArr = {
                        //         '9'  : 'inCare_date',
                        //         '12' : 'check_date',
                        //         '13' : 'report_date',
                        //         '14' : 'notify_date'
                        //     }
                        //     for(const[index, name] of Object.entries(inputArr)){
                        //         let tdn = `<snap><input type="date" class="form-control form-control-sm" name="${name}" id="${i_id},${name}"></snap>`;
                        //         tdObj[index] = tdn;
                        //     }
                        // // 生成-10:備註說明 - textarea
                        //     let td10 = `<snap><textarea class="form-control" placeholder="備註說明" id="${i_id},change_remark"></textarea></snap>`;
                        //     tdObj['10'] = td10;

                        return (tdObj);
                    }

                // const workListTD_json = await load_jsonFile('workList.json');   // 提取指定json_file內容
                    // console.log('workList_json...', workListTD_json)

                await mergedData.forEach((case_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...    
                    const case_iArr         = case_i.split(',')                         // 分割staffStr成陣列
                        const i_empId       = case_iArr[0] ?? '';                       // 取出陣列 0 = 工號
                        const i_OSTEXT_30   = case_iArr[2] ?? '';                       // 取出陣列 2 = 廠區
                        const i_OSHORT      = case_iArr[3] ?? '';                       // 取出陣列 3 = 部門代號
                        const i_OSTEXT      = case_iArr[4] ?? '';                       // 取出陣列 4 = 部門名稱
                        const i_targetMonth = case_iArr[5] ?? '';                       // 取出陣列 5 = 目標年月
                        const i_id = `${i_OSHORT},${i_targetMonth},${i_empId}`;
                    const staffArr = post_arr.find(staff => staff.emp_id == i_empId);   // 從post_arr找出符合 empId 的原始字串

                    if(staffArr){
                        const tdObj = mkTD(staffArr, case_iArr);

                        const _cLogs = staffArr['_changeLogs'][i_targetMonth] ?? {};
                        
                        let tr1 = '<tr>';
                            tr1 += `<td class=""              id="">${i_targetMonth ?? ''}</td>
                                    <td class=""              id="">${i_OSTEXT_30}</td>
                                    <td class=""              id="">${staffArr["emp_id"] }</td>
                                    <td class=""              id="">${staffArr["cname"] }</td>
                                    <td class=""              id="">${i_OSHORT}<br>${i_OSTEXT}</td>
    
                                    <td class=""              id="${i_id},6_shCheck"    >${tdObj['6']}</td>
                                    <td class=""              id="${i_id},7_keyInMan"   >${_cLogs['7_keyInMan'] ?? ''}</td>
                                    <td class=""              id="${i_id},8_isCheck"    >${tdObj['8']}</td>

                                    <td class="edit2"         id="${i_id},9_inCareDate" >${_cLogs['9_inCareDate'] ?? ''}</td>
                                    <td class="edit2 word_bk" id="${i_id},10_changeRemark">${_cLogs['10_changeRemark'] ?? ''}</td>
                                    
                                    <td class=""              id="${i_id},11_whyChange" >${tdObj['11']}</td>

                                    <td class="edit2"         id="${i_id},12_checkDate" >${_cLogs['12_checkDate'] ?? ''}</td>
                                    <td class="edit2"         id="${i_id},13_reportDate">${_cLogs['13_reportDate'] ?? ''}</td>
                                    <td class="edit2"         id="${i_id},14_notifyDate">${_cLogs['14_notifyDate'] ?? ''}</td>
                                    <td class="edit2 word_bk" id="${i_id},15_bpmRemark" >${_cLogs['15_bpmRemark'] ?? ''}</td>
                                    `
                            tr1 += '</tr>';

                        $('#staff_table tbody').append(tr1);
                    }
                })
                // thisMonth = (dateString != undefined) ? dateString : thisMonth;     // 
                // const uniqueArr =  [...new Set(objKeys_ym)];                        // 年月去重
                // mk_selectOpt_ym(uniqueArr, thisMonth);                              // 生成並渲染到select
                // SubmitForReview_btn.value = thisMonth;                              // 餵年月給submit_btn
            }
            await reload_dataTable('staff_table');                   // 倒參數(陣列)，直接由dataTable渲染

            await reload_staffP3ShCheckOnchange_Listeners();        // 6
            await reload_staffP3IsCheckOnchange_Listeners();        // 8
            await reload_staffP3WhyChangeOnchange_Listeners();      // 11
            await reload_edit2TD_Listeners();

            $("body").mLoading("hide");
        
    }
    // 預先處理員工資料 for post_staff()
    async function preProcess_staff(shLocalDept_in){
                // console.log('1a.shLocalDept_in...' ,shLocalDept_in)
        let empIDKeys         = [];
        let mergedData        = [];                         // 存放員工合併訊息，for preCheckStaffData時參考套用訊息
        let source_OSHORT_arr = [];                         // 存放所有部門代號，for 提取特危工作場所內的 工作項目。

        for(const[index, post_i] of Object.entries(shLocalDept_in)){
            const inCare     = post_i["inCare"] ?? [];
            for(const[targetMonth_i, staff_i] of Object.entries(inCare)){
                staff_i.forEach((staff) => {
                    // step.1 取得所有的 key
                        empIDKeys = [...empIDKeys , Object.keys(staff)[0]];

                    // step.2 合併鍵和值
                        let key = Object.keys(staff)[0];        // 獲取鍵
                        let value = staff[key];               // 獲取相應的值
                        mergedData.push(`${key},${value},${post_i["OSTEXT_30"]},${post_i["OSHORT"]},${post_i["OSTEXT"]},${targetMonth_i}`);
                })

            }
            source_OSHORT_arr.push(post_i["OSHORT"]);       // 存放所有部門代號，for 提取特危工作場所內的 工作項目。
        }
        empIDKeys = [...new Set(empIDKeys)]; 

        // *** 精煉 shLocal for 提取特危工作場所內的 工作項目。
            const source_OSHORTs_str = (JSON.stringify([...new Set(source_OSHORT_arr)])).replace(/[\[\]]/g, ''); // 過濾重複部門代號 + 轉字串
            let shItemArr = []
            if(source_OSHORTs_str !==''){
                shItemArr = await load_fun('load_shLocal', source_OSHORTs_str, rework_shLocal_inf);         // 呼叫load_fun 用 部門代號字串 取得 特作清單, 呼叫fun-4 rework_shLocal_inf 整理特危工作場所項目
            }
                // console.log('2.shItemArr ... > ', shItemArr);

        const empIDKeys_str = JSON.stringify(empIDKeys).replace(/[\[\]]/g, '');                 // 工號加工
        const preCheckStaffData_result = await preCheckStaffData(empIDKeys_str, mergedData);    // 呼叫 fun-2 preCheckStaffData 檢查staff是否都有存在，不然就生成staff預設值
                // console.log('1.empIDKeys =>',  empIDKeys)
                // console.log('2.mergedData =>', mergedData)
                // console.log('3.empIDKeys_str =>', empIDKeys_str)
                // console.log('4.preCheckStaffData_result =>', preCheckStaffData_result)

        post_staff(preCheckStaffData_result, mergedData, shItemArr);           // 渲染..帶(員工, 指定年月, 特作項目)
        
    }


            // fun-2 檢查load_fun('load_change') 是否都有存在，不然就生成staff預設值
            async function preCheckStaffData(selectStaffStr, mergedData){
                if(selectStaffStr == '') return(false);
                    let load_change = await load_fun('load_change', selectStaffStr, 'return');                      // step-1. 先從db撈現有的資料
                    const existingStaffStrs = load_change.map(staff => staff.emp_id);                               // step-2. 提取load_change中所有的emp_id值
                        // if(load_change.length > 0){
                        //     for (const [index, staff] of Object.entries(load_change)) {
                        //         empId = staff['emp_id'];                                            // 去除前後"符號..
                        //         const staffStr = mergedData.find(item => item.includes(empId));     // 從_dept_inf找出符合 empId 的原始字串
                        //         const staffArr = (staffStr) ? staffStr.split(',') : [];             // 分割staffStr成陣列
                        //         load_change[index]["OSTEXT_30"] = staffArr[2] ?? '';                // 取出陣列 2 = 廠區
                        //         load_change[index]["OSHORT"]    = staffArr[3] ?? '';                // 取出陣列 3 = 部門代號
                        //         load_change[index]["OSTEXT"]    = staffArr[4] ?? '';                // 取出陣列 4 = 部門名稱
                        //     }
                        // }
                    defaultStaff_inf = [...defaultStaff_inf, ...load_change];                                       // step-2. 合併load_change
    
                    const selectStaffArr = selectStaffStr.replace(/"/g, '').split(',')                              // step-3. 去除前後"符號..分割staffStr成陣列
                    const notExistingStaffs = selectStaffArr.filter(emp_id => !existingStaffStrs.includes(emp_id)); // step-4. 找出不存在於load_shLocalDepts中的部門代號
                        // console.log('notExistingStaffs...', notExistingStaffs)

                    if(notExistingStaffs.length > 0) {
                        const notExistingStaffs_str = JSON.stringify(notExistingStaffs).replace(/[\[\]]/g, '');     // step-5. 把不在的部門代號進行加工(多選)，去除外框
                        const bomNewDeptArr = await bomNewStaff(notExistingStaffs_str, mergedData);                 // step-6. 呼叫fun-3 bomNewStaff 生成staff預設值
                        defaultStaff_inf = [...defaultStaff_inf, ...bomNewDeptArr];                                 // step-6. 合併bomNewDeptArr
                    }
    
                return(defaultStaff_inf);
                // post_hrdb(defaultStaff_inf);                                                                     // step-8. 送出進行渲染
            };
            // fun-3 當staff_inf沒有符合的員工時時...給他一個新的
            function bomNewStaff(notExistingStaffs_str, mergedData){
                return new Promise((resolve) => {
                    // 初始化新生成staff陣列..返回用
                    let bomNewStaffArr = [];
                    
                    if(notExistingStaffs_str !== ''){
                        const selectStaffArr = notExistingStaffs_str.split(',')       // 分割deptStr成陣列
                        if(selectStaffArr.length > 0){
                            selectStaffArr.forEach((empId) => {
                                let newStaffData = {};                                               // 初始化新生成dept物件
                                empId = empId.replace(/"/g, '');                                     // 去除前後"符號..
                                const staffStr = mergedData.find(item => item.includes(empId));      // 從_dept_inf找出符合 empId 的原始字串
                                if(staffStr){
                                    const staffArr = staffStr.split(',')                              // 分割staffStr成陣列
                                    newStaffData["emp_id"]    = staffArr[0] ?? '';                    // 取出陣列 0 = 工號
                                    newStaffData["cname"]     = staffArr[1] ?? '';                    // 取出陣列 1 = 名稱
                                    // newStaffData["OSTEXT_30"] = staffArr[2] ?? '';                    // 取出陣列 2 = 廠區
                                    // newStaffData["OSHORT"]    = staffArr[3] ?? '';                    // 取出陣列 3 = 部門代號
                                    // newStaffData["OSTEXT"]    = staffArr[4] ?? '';                    // 取出陣列 4 = 部門名稱
                                }else{
                                    newStaffData["emp_id"]    = empId; 
                                }
                                newStaffData["_changeLogs"]   = [];
                                newStaffData["_content"]      = {};
                                // newStaffData["created_at"] = getTimeStamp();
                                bomNewStaffArr.push(newStaffData);
                            })
                        }
                    }
    
                    resolve(bomNewStaffArr);
                });
                // return bomNewDeptArr;
            }
            // fun-4 整理特危工作場所項目
            async function rework_shLocal_inf(new_shLocal_arr){
                let shItemArr = []
                // step.1 逐筆取出HE_CATE，並收集到shItemArr，依OSHORT分層
                for(const [index, shItem] of Object.entries(new_shLocal_arr)){
                    shItemArr[shItem.OSHORT] = shItemArr[shItem.OSHORT] ?? [];
                    const HE_CATE = shItem['HE_CATE'].replace(/[\[{"}\]]/g, '');
                    shItemArr[shItem.OSHORT].push(HE_CATE);
                }
                // step.2 去重
                for(const [OSHORT, HE_CATE] of Object.entries(shItemArr)){
                    shItemArr[OSHORT] = [...new Set(HE_CATE)]; 
                }
                // step.3 返回
                return (shItemArr);
            }

        // 提取指定json_file內容
        async function load_jsonFile(json_fileName){
            let json_value;
            if(json_fileName != undefined && json_fileName != null){
                await fetch(json_fileName)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('網頁錯誤: ' + response.status);
                        }
                        return response.json();
                    })
                    .then(data => {
                        json_value = data;           // 將讀取的 JSON 資料放入變數
                    })
                    .catch(error => {
                        console.error('出現錯誤:', error);
                    });
            }
            
            return (json_value);
        }

    // 250310 在p3table上建立edit2監聽功能 for 開啟MaintainDept編輯staff名單...未完
    let edit2ClickListener;
    async function reload_edit2TD_Listeners() {
        return new Promise((resolve) => {
            const edit2 = document.querySelectorAll('#staff_table td[class*="edit2"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (edit2ClickListener) {
                edit2.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                    tdItem.removeEventListener('click', edit2ClickListener);   // 將每一個tdItem移除監聽, 當按下click
                })
            }

            // 定義新的監聽器函數
            edit2ClickListener = async function () {
                // console.log("click this =>", this.id);
                const thisId_arr = this.id.split(',')                   // 分割this.id成陣列
                    const i_OSHORT      = thisId_arr[0] ?? '';          // 取出陣列 0 = 部門代號
                    const i_targetMonth = thisId_arr[1] ?? '';          // 取出陣列 1 = 目標年月
                    const i_empId       = thisId_arr[2] ?? '';          // 取出陣列 2 = 工號
                    const i_targetTD    = thisId_arr[3] ?? '';          // 取出陣列 3 = 目標TD
                    // step.1 標題列顯示姓名工號
                    $('#edit2_modal_title').empty().append(`${i_empId}&nbsp;(${i_targetMonth})&nbsp;${i_targetTD}`);     // 定義搜尋input欄// 賦予內容值

                    // 在edit2_modal_btn input上帶入staff_id
                    const edit2_modal_btn = document.getElementById('edit2_modal_btn');
                    edit2_modal_btn.value = this.id;

                    // 撈出該staff資料
                    const staffData = staff_inf.find(staff => staff.emp_id === i_empId);    // 翻出staff來
                    if(staffData){
                        staffData['_changeLogs'][i_targetMonth] = staffData['_changeLogs'][i_targetMonth] ?? {};   // 防呆
                        const thisValue = staffData['_changeLogs'][i_targetMonth][i_targetTD] ?? '';     // 賦予內容值
                        let thisTD = '<div class="row">';
                            if(i_targetTD.includes('Date')){
                                thisTD +=  `<div class="col-12 py-0 px-3">
                                                <div class="form-floating">
                                                    <input type="date" name="${i_targetTD}" id="${this.id},edit2" class="form-control" value="${thisValue}" place_holder >
                                                    <label for="${this.id},edit2" class="form-label">${i_targetTD}：</label>
                                                </div>
                                            </div>`;
                            }else if(i_targetTD.includes('Remark')){
                                thisTD +=  `<div class="col-12 py-0 px-3">
                                                <label for="${this.id},edit2" class="form-label">${i_targetTD}：</label>
                                                <textarea name="${i_targetTD}" id="${this.id},edit2" class="form-control " style="height: 100px" placeholder="${i_targetTD}">${thisValue}</textarea>
                                            </div>`;
                            }
                        thisTD += '</div>';
                        $('#edit2_modal .modal-body').empty().append(thisTD);     // 定義搜尋input欄// 賦予內容值

                    }else{
                        consolr.error(`staff empID：${i_empId} is undefined!!`)
                    }

                    reload_submitEdit2_Listeners();

                // step.3 顯示互動視窗
                edit2_modal.show();
                // $("body").mLoading("hide");
            }

            // 添加新的監聽器
            edit2.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                tdItem.addEventListener('click', edit2ClickListener);      // 將每一個tdItem增加監聽, 當按下click
            })

            resolve();
        });
    }
    // 250227 定義edit2_modal[更新]鈕功能~~；from edit2_modal裡[更新]鈕的呼叫...
    let submitEdit2ClickListener;
    async function reload_submitEdit2_Listeners() {
        const submitEdit2_btn = document.querySelector('#edit2_modal #edit2_modal_btn');      //  定義出範圍
        // 檢查並移除已經存在的監聽器
        if (submitEdit2ClickListener) {
            submitEdit2_btn.removeEventListener('click', submitEdit2ClickListener);   // 將每一個tdItem移除監聽, 當按下click
        }   
    
        // 定義新的監聽器函數
        submitEdit2ClickListener = async function () {
            mloading(); 

            const thisId_arr = this.value.split(',')                   // 分割this.id成陣列
                const i_OSHORT      = thisId_arr[0] ?? '';          // 取出陣列 0 = 部門代號
                const i_targetMonth = thisId_arr[1] ?? '';          // 取出陣列 1 = 目標年月
                const i_empId       = thisId_arr[2] ?? '';          // 取出陣列 2 = 工號
                const i_targetTD    = thisId_arr[3] ?? '';          // 取出陣列 3 = 目標TD

            // // 撈出該staff資料
            const staffData = staff_inf.find(staff => staff.emp_id === i_empId);    // 翻出staff來
            if(staffData){
                staffData['_changeLogs'][i_targetMonth]             = staffData['_changeLogs'][i_targetMonth] ?? {};                // 防呆
                staffData['_changeLogs'][i_targetMonth][i_targetTD] = staffData['_changeLogs'][i_targetMonth][i_targetTD] ?? '';    // 防呆內容值

                // 取得modal上欄位
                const item_opts_arr = Array.from(document.querySelectorAll(`#edit2_modal .modal-body input[id*=",edit2"], #edit2_modal .modal-body textarea[id*=",edit2"]`));
                // 繞出欄位上的值並更新deptData
                item_opts_arr.forEach(i_td => {

                    // 準備更新個人satff內容數值
                    const tdId_arr = i_td.id.split(',')                   // 分割this.id成陣列
                        const ii_OSHORT      = tdId_arr[0] ?? '';           // 取出陣列 0 = 部門代號
                        const ii_targetMonth = tdId_arr[1] ?? '';           // 取出陣列 1 = 目標年月
                        const ii_empId       = tdId_arr[2] ?? '';           // 取出陣列 2 = 工號
                        const ii_targetTD    = tdId_arr[3] ?? '';           // 取出陣列 3 = 目標TD
                    staffData['_changeLogs'][ii_targetMonth][ii_targetTD] = i_td.value;     // 把更新值回填到stafData

                    // 準備更新畫面上數值
                        const renewItem = i_td.value;                       // 更新目標TD欄位內容
                        const renewItemID = `${ii_OSHORT},${ii_targetMonth},${ii_empId},${ii_targetTD}`;   // 更新目標TD欄位ID
                        const renewItemTD = document.getElementById(renewItemID);           // 指引TD欄位目標
                        if(renewItemTD){
                            renewItemTD.innerHTML = renewItem;                              // 更新TD欄位內容
                        } 
                });
                // console.log('staffData...', staffData);

            }else{
                consolr.error(`staff empID：${i_empId} is undefined!!`)
            }

            // // 手動觸發 change 事件
            // // checkbox.dispatchEvent(new Event('change'));

            edit2_modal.hide();  // 關閉modal2
            $("body").mLoading("hide");

        }

        // 添加新的監聽器
        submitEdit2_btn.addEventListener('click', submitEdit2ClickListener);      // 將每一個tdItem增加監聽, 當按下click
    }
    // *** 需要建立即時監聽更新的有三個~6、8、11
        // // 250310 在p3table上建立6_ShCheck監聽功能 for .6_ShCheck = true/false...
        // let staffP3ShCheckOnchangeListener;
        // async function reload_staffP3ShCheckOnchange_Listeners() {
        //     return new Promise((resolve) => {
        //         const staffShChecks = document.querySelectorAll('#staff_table input[id*=",6_shCheck"]');      //  定義出範圍
        //         // 檢查並移除已經存在的監聽器
        //             if (staffP3ShCheckOnchangeListener) {
        //                 staffShChecks.forEach(flag_i => {                                      // 遍歷範圍內容給flag_i
        //                     flag_i.removeEventListener('change', staffP3ShCheckOnchangeListener);   // 將每一個flag_i移除監聽, 當按下click
        //                 })
        //             }
        //         // 定義新的監聽器函數
        //             staffP3ShCheckOnchangeListener = async function () {
        //                 const thisId_arr = this.id.split(',')                   // 分割this.id成陣列
        //                     const i_OSHORT      = thisId_arr[0] ?? '';          // 取出陣列 0 = 部門代號
        //                     const i_targetMonth = thisId_arr[1] ?? '';          // 取出陣列 1 = 目標年月
        //                     const i_empId       = thisId_arr[2] ?? '';          // 取出陣列 2 = 工號
        //                     const i_targetTD    = thisId_arr[3] ?? '';          // 取出陣列 3 = 目標TD
                        
        //                 const staffData = staff_inf.find(staff => staff.emp_id === i_empId);    // 翻出staff來
        //                 if(staffData){
        //                     const selectedOptsValues = Array.from(document.querySelectorAll(`#staff_table input[type="checkbox"]:checked[id*="${i_OSHORT},${i_targetMonth},${i_empId},${i_targetTD},"]`))
        //                                                             .map(cb => cb.value);
        //                     // console.log('6_ShCheck...', selectedOptsValues);                     
        //                     staffData['_changeLogs'][i_targetMonth] = staffData['_changeLogs'][i_targetMonth] ?? {};   // 防呆
        //                     staffData['_changeLogs'][i_targetMonth][i_targetTD] = selectedOptsValues;     // 賦予內容值
        //                     console.log('staffData...', staffData);

        //                 }else{
        //                     consolr.error(`staff empID：${i_empId} is undefined!!`)
        //                 }
        //             }
        //         // 添加新的監聽器
        //             staffShChecks.forEach(flag_i => {                                      // 遍歷範圍內容給flag_i
        //                 flag_i.addEventListener('change', staffP3ShCheckOnchangeListener);      // 將每一個flag_i增加監聽, 當按下click
        //             })

        //         resolve();
        //     });
        // }
        // // 250310 在p3table上建立8_isCheck監聽功能 for .8_isCheck = true/false...
        // let staffP3IsCheckOnchangeListener;
        // async function reload_staffP3IsCheckOnchange_Listeners() {
        //     return new Promise((resolve) => {
        //         const staffIsChecks = document.querySelectorAll('#staff_table input[id*=",8_isCheck"]');      //  定義出範圍
        //         // 檢查並移除已經存在的監聽器
        //             if (staffP3IsCheckOnchangeListener) {
        //                 staffIsChecks.forEach(flag_i => {                                      // 遍歷範圍內容給flag_i
        //                     flag_i.removeEventListener('change', staffP3IsCheckOnchangeListener);   // 將每一個flag_i移除監聽, 當按下click
        //                 })
        //             }
        //         // 定義新的監聽器函數
        //             staffP3IsCheckOnchangeListener = async function () {
        //                 const thisId_arr = this.id.split(',')                   // 分割this.id成陣列
        //                     const i_OSHORT      = thisId_arr[0] ?? '';          // 取出陣列 0 = 部門代號
        //                     const i_targetMonth = thisId_arr[1] ?? '';          // 取出陣列 1 = 目標年月
        //                     const i_empId       = thisId_arr[2] ?? '';          // 取出陣列 2 = 工號
        //                     const i_targetTD    = thisId_arr[3] ?? '';          // 取出陣列 3 = 目標TD
                            
        //                 const staffData = staff_inf.find(staff => staff.emp_id === i_empId);    // 翻出staff來
        //                 if(staffData){
        //                     staffData['_changeLogs'][i_targetMonth] = staffData['_changeLogs'][i_targetMonth] ?? {};   // 防呆
        //                     staffData['_changeLogs'][i_targetMonth][i_targetTD] = this.checked;     // 賦予內容值
        //                     // console.log('staffData...', staffData);
        //                 }else{
        //                     consolr.error(`staff empID：${i_empId} is undefined!!`)
        //                 }
        //             }
        //         // 添加新的監聽器
        //             staffIsChecks.forEach(flag_i => {                                      // 遍歷範圍內容給flag_i
        //                 flag_i.addEventListener('change', staffP3IsCheckOnchangeListener);      // 將每一個flag_i增加監聽, 當按下click
        //             })

        //         resolve();
        //     });
        // }
        // // 250310 在p3table上建立11_whyChange監聽功能 for .11_whyChange = select.value...
        // let staffP3WhyChangeOnchangeListener;
        // async function reload_staffP3WhyChangeOnchange_Listeners() {
        //     return new Promise((resolve) => {
        //         const staffWhyChanges = document.querySelectorAll('#staff_table select[id*=",11_whyChange"]');      //  定義出範圍
        //         // 檢查並移除已經存在的監聽器
        //             if (staffP3WhyChangeOnchangeListener) {
        //                 staffWhyChanges.forEach(flag_i => {                                      // 遍歷範圍內容給flag_i
        //                     flag_i.removeEventListener('change', staffP3WhyChangeOnchangeListener);   // 將每一個flag_i移除監聽, 當按下click
        //                 })
        //             }
        //         // 定義新的監聽器函數
        //             staffP3WhyChangeOnchangeListener = async function () {
        //                 const thisId_arr = this.id.split(',')                   // 分割this.id成陣列
        //                     const i_OSHORT      = thisId_arr[0] ?? '';          // 取出陣列 0 = 部門代號
        //                     const i_targetMonth = thisId_arr[1] ?? '';          // 取出陣列 1 = 目標年月
        //                     const i_empId       = thisId_arr[2] ?? '';          // 取出陣列 2 = 工號
        //                     const i_targetTD    = thisId_arr[3] ?? '';          // 取出陣列 3 = 目標TD
                            
        //                 const staffData = staff_inf.find(staff => staff.emp_id === i_empId);    // 翻出staff來
        //                 if(staffData){
        //                     staffData['_changeLogs'][i_targetMonth] = staffData['_changeLogs'][i_targetMonth] ?? {};   // 防呆
        //                     staffData['_changeLogs'][i_targetMonth][i_targetTD] = this.value;     // 賦予內容值
        //                     console.log('staffData...', staffData);
        //                 }else{
        //                     consolr.error(`staff empID：${i_empId} is undefined!!`)
        //                 }
        //             }
        //         // 添加新的監聽器
        //             staffWhyChanges.forEach(flag_i => {                                      // 遍歷範圍內容給flag_i
        //                 flag_i.addEventListener('change', staffP3WhyChangeOnchangeListener);      // 將每一個flag_i增加監聽, 當按下click
        //             })

        //         resolve();
        //     });
        // }
        async function reload_staffP3ChangeListeners(type, idSubstring, logValue) {
            return new Promise((resolve) => {
                const elements = document.querySelectorAll(`#staff_table input[id*="${idSubstring}"], #staff_table select[id*="${idSubstring}"]`); // 定義範圍
        
                let listener;
                // 檢查並移除已經存在的監聽器
                if (listener) {
                    elements.forEach(element => {
                        element.removeEventListener('change', listener);
                    });
                }
        
                // 定義新的監聽器函數
                listener = async function () {
                    const thisId_arr = this.id.split(','); // 分割 this.id 成陣列
                    const i_OSHORT      = thisId_arr[0] ?? ''; // 部門代號
                    const i_targetMonth = thisId_arr[1] ?? ''; // 目標年月
                    const i_empId       = thisId_arr[2] ?? ''; // 工號
                    const i_targetTD    = thisId_arr[3] ?? ''; // 目標TD
                    
                    const staffData = staff_inf.find(staff => staff.emp_id === i_empId); // 翻出 staff 來
                    if (staffData) {
                        staffData['_changeLogs'][i_targetMonth] = staffData['_changeLogs'][i_targetMonth] ?? {}; // 防呆
                        
                        // 如果是 checkbox，則獲取所有被選中的值
                        if (type === 'checkbox') {
                            const selectedOptsValues = Array.from(document.querySelectorAll(`#staff_table input[type="checkbox"]:checked[id*="${i_OSHORT},${i_targetMonth},${i_empId},${i_targetTD},"]`))
                                .map(cb => cb.value);
                            staffData['_changeLogs'][i_targetMonth][i_targetTD] = selectedOptsValues;

                        } else if (type === 'checkbox-boolean') {
                            staffData['_changeLogs'][i_targetMonth][i_targetTD] = this.checked;

                        } else if (type === 'select') {
                            staffData['_changeLogs'][i_targetMonth][i_targetTD] = this.value;
                        }
                        console.log('staffData...', staffData);
        
                    } else {
                        console.error(`staff empID：${i_empId} is undefined!!`);
                    }
                };
        
                // 添加新的監聽器
                elements.forEach(element => {
                    element.addEventListener('change', listener);
                });
        
                resolve();
            });
        }
        
        // 使用合併的函式
        async function reload_staffP3ShCheckOnchange_Listeners() {
            await reload_staffP3ChangeListeners('checkbox', '6_shCheck', false);
        }
        
        async function reload_staffP3IsCheckOnchange_Listeners() {
            await reload_staffP3ChangeListeners('checkbox-boolean', '8_isCheck', false);
        }
        
        async function reload_staffP3WhyChangeOnchange_Listeners() {
            await reload_staffP3ChangeListeners('select', '11_whyChange', true);
        }