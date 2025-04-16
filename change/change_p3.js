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
            staff_inf      = post_arr;      // 帶入全域變數
            mergedData_inf = mergedData;    // 帶入全域變數
            shItemArr_inf  = shItemArr;     // 帶入全域變數
 
            if(post_arr.length === 0){
                const table = $('#staff_table').DataTable();                    // 獲取表格的 thead
                const columnCount = table.columns().count();                    // 獲取每行的欄位數量
                const tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 沒有資料 ~ </td><tr>`;
                $('#staff_table tbody').append(tr1);
                
            }else{
                    // 通報數據加工+去除[]符號/[{"}]/g, ''
                    function doReplace(_arr){
                        return JSON.stringify(_arr).replace(/[\[{"}\]]/g, '').replace(/:/g, ' : ').replace(/,/g, '<br>'); 
                    }
                    // 表格工場-
                    function mkTD(post_i , case_iArr){
                        let tdObj = [];
                        const i_emp_id      = post_i["emp_id"];
                        const i_OSHORT      = case_iArr[3] ?? '';                                       // 取出陣列 3 = 部門代號
                        const i_targetMonth = case_iArr[5] ?? '';                                       // 取出陣列 5 = 目標年月
                        const i_id          = `${i_OSHORT},${i_targetMonth},${i_emp_id}`;               // 預設id字串
                        const i_cLogs       = post_i['_changeLogs'][i_targetMonth]            ?? {};       
                        const i_cNotify     = post_i['_content']?.[i_targetMonth]?.['notify'] ?? [];
                        const to_disabled   = (i_cNotify.length > 0 || (i_cLogs._9checkDate !== '' && i_cLogs._9checkDate !== undefined )) ? 'disabled' : '';
                        const sys_role2     = (userInfo.role <= 2) ? '' : 'disabled';

                        // 生成-6:變更體檢項目 - checkbox
                            const i_OSHORTshItemArr = shItemArr[i_OSHORT] ?? [];
                            let td6 = '<snap>';
                                for(const [o_key, o_value] of Object.entries(i_OSHORTshItemArr)){
                                    const ifValue = ((i_cLogs['_6shCheck']) && i_cLogs['_6shCheck'].includes(o_value)) ? "checked" : "";
                                    td6 += `<div class="form-check m-0"> 
                                            <input class="form-check-input" type="checkbox" name="_6shCheck" id="${i_id},_6shCheck,${o_value}" value="${o_value}" ${ifValue} ${to_disabled} ${sys_role2}>
                                            <label class="form-check-label" for="${i_id},_6shCheck,${o_value}">${o_value}</label></div>`;
                                    }
                            td6 += '</snap>';
                            tdObj['6'] = td6;
                    
                        // 生成-7:是否補檢 - checkbox-switch
                            const ifValue = ((i_cLogs['_7isCheck']) && i_cLogs['_7isCheck']) ? "checked" : "";
                            let td7 = `<snap><div class="form-check form-switch"> 
                                        <input class="form-check-input" type="checkbox" name="_7isCheck" id="${i_id},_7isCheck" ${ifValue} ${to_disabled} ${sys_role2}>
                                        <label class="form-check-label" for="${i_id},_7isCheck">${ifValue ? "是":"否"}</label></div></snap>`;
                            tdObj['7'] = td7;
        
                        return (tdObj);
                    }

                // const workListTD_json = await load_jsonFile('workList.json');   // 提取指定json_file內容
                    // console.log('workList_json...', workListTD_json)
                
                await mergedData.forEach((case_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...    
                    const case_iArr         = case_i.split(',');                         // 分割staffStr成陣列
                        const i_empId       = case_iArr[0] ?? '';                       // 取出陣列 0 = 工號
                        const i_OSTEXT_30   = case_iArr[2] ?? '';                       // 取出陣列 2 = 廠區
                        const i_OSHORT      = case_iArr[3] ?? '';                       // 取出陣列 3 = 部門代號
                        const i_OSTEXT      = case_iArr[4] ?? '';                       // 取出陣列 4 = 部門名稱
                        const i_targetMonth = case_iArr[5] ?? '';                       // 取出陣列 5 = 目標年月
                        const i_id = `${i_OSHORT},${i_targetMonth},${i_empId}`;         // 預設id字串
                    const staffArr = post_arr.find(staff => staff.emp_id == i_empId);   // 從post_arr找出符合 empId 的原始字串

                    if(staffArr){
                        const tdObj = mkTD(staffArr, case_iArr);

                        const _cLogs      = staffArr['_changeLogs']?.[i_targetMonth] ?? {};
                        const _9checkDate = _cLogs?.['_9checkDate'] ?? '';
                        const _cNotify    = staffArr['_content']?.[i_targetMonth]?.['notify'] ?? [];
                        const { dayDiff, bgClass } = (_cNotify.length !== 0) ? getFirstNotification(_cNotify) : {dayDiff:0, bgClass:''};      // 取得最早的第一筆通報時間至今的日期差 & 背景色
                            const dayDiff_str = ((_9checkDate === '' || _9checkDate === undefined) && (_cNotify.length !== 0)) ? `<br><span class="${dayDiff >= 7 ? "text-danger":"text-primary"}"><b>dayDiff：${dayDiff}day</b></span>` : '';
                            const bgClass_str = ((_9checkDate === '' || _9checkDate === undefined) && (_cNotify.length !== 0)) ? bgClass : '';
                                // console.log('dayDiff =>', dayDiff)
                                // console.log('bgClass =>', bgClass)
                                // console.log('1.dayDiff_str =>', dayDiff_str)
                                // console.log('2.bgClass_str =>', bgClass_str)
                            
                        const _cNotifyLast         = (_cNotify.length !== 0) ? getLatestNotification(_cNotify) : [];     // 取得最後一筆通知訊息
                            var _cNotifyLast_str = doReplace(_cNotifyLast);                   // 通知紀錄轉字串
                                _cNotifyLast_str = (_cNotifyLast_str !== 'null' ) ? _cNotifyLast_str : '';

                        const editRole = _9checkDate === '' || userInfo.role <= 1 ? 'edit2' : '';            // 預設edit權限

                        let tr1 = `<tr class="">`;
                            tr1 += `<td class=""              id="">${i_targetMonth ?? ''}</td>
                                    <td class=""              id="">${i_OSTEXT_30}</td>
                                    <td class=""              id="">${staffArr["emp_id"] }</td>
                                    <td class=""              id="">${staffArr["cname"] }</td>
                                    <td class=""              id="">${i_OSHORT}<br>${i_OSTEXT}</td>
    
                                    <td class=""              id="">${tdObj['6']}</td>
                                    <td class=""              id="">${tdObj['7']}</td>
                                    <td class="edit2 word_bk" id="${i_id},_8Remark">${_cLogs['_8Remark'] ?? ''}</td>
                                    <td class="${editRole} ${bgClass_str}" id="${i_id},_9checkDate" >${_9checkDate}</td>
                                    <td class="edit2 word_bk" id="${i_id},_10bpmRemark" >${_cLogs['_10bpmRemark'] ?? ''}</td>

                                    <td class="${editRole} notify_log" id="${i_id},_content" >${_cNotifyLast_str ?? ''}${dayDiff_str}</td>`;
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
            // await reload_staffP3WhyChangeOnchange_Listeners();      // 11
            if(userInfo.role <= 2 ) {
                await reload_edit2TD_Listeners();
            }else{
                changEdit2TDmode();                     // 250416 改變edit2 class吃css的狀態；主要是主管以上不需要底色編輯提示
            }

            await btn_disabled();                       // 讓指定按鈕 依照shLocalDept_inf.length 啟停 

            $("body").mLoading("hide");
        
    }
            // 返回最新的一筆通報數據  (原本在post_staff裡面)
            function getLatestNotification(notifyArray) {
                if (!Array.isArray(notifyArray) || notifyArray.length === 0) {
                    return null; // 如果不是陣列或陣列為空，返回 null
                }
                // 將陣列按照 to_notify 進行排序，最新的在最前面
                notifyArray.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
                // 返回最新的前一筆數據
                return notifyArray[0];
            }
            // 返回最早的第一筆通報數據  (原本在post_staff裡面)
            function getFirstNotification(notifyArray) {
                if (!Array.isArray(notifyArray) || notifyArray.length === 0) {
                    return null; // 如果不是陣列或陣列為空，返回 null
                }
                // 將陣列按照 to_notify 進行排序，最舊的在最前面
                notifyArray.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
                // 返回最早的第一筆數據-dateTime日期時間
                const _cNotifyFirst = notifyArray[0].dateTime;

                var timeDiff = 0;
                if(_cNotifyFirst !== undefined){
                    const firstDay = new Date(_cNotifyFirst);
                    const today = new Date().setHours(0, 0, 0, 0); // 設置時間為 00:00:00
                    // 計算時間戳（毫秒）
                    timeDiff = today - firstDay;
                }
                // 將毫秒轉換為天數，1天 = 24小時 * 60分鐘 * 60秒 * 1000毫秒
                const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                // 判斷背景樣式  // 超過12天，使用 bg-danger// 超過7天，使用 bg-warning   alert_it
                const bgClass = dayDiff >= 12 ? 'table-danger' : (dayDiff >= 7 ? 'table-warning' : '');

                return { dayDiff, bgClass };
            }

    // 預先處理員工資料 for post_staff()
    async function preProcess_staff(shLocalDept_in, _yearMonthValue){
                // console.log('1a.shLocalDept_in...' ,shLocalDept_in)
        let empIDKeys         = [];
        let mergedData        = [];                         // 存放員工合併訊息，for preCheckStaffData時參考套用訊息
        let source_OSHORT_arr = [];                         // 存放所有部門代號，for 提取特危工作場所內的 工作項目。

        for(const[index, post_i] of Object.entries(shLocalDept_in)){
            const inCare     = post_i["inCare"] ?? [];
            for(const[targetMonth_i, staff_i] of Object.entries(inCare)){
                // 250313 篩選年分功能
                if(targetMonth_i.includes(_yearMonthValue)){
                    staff_i.forEach((staff) => {
                        // step.1 取得所有的 key
                            empIDKeys = [...empIDKeys , Object.keys(staff)[0]];
    
                        // step.2 合併鍵和值
                            let key = Object.keys(staff)[0];        // 獲取鍵
                            let value = staff[key];               // 獲取相應的值
                            mergedData.push(`${key},${value},${post_i["OSTEXT_30"]},${post_i["OSHORT"]},${post_i["OSTEXT"]},${targetMonth_i}`);
                    })
                }
            }
            source_OSHORT_arr.push(post_i["OSHORT"]);       // 存放所有部門代號，for 提取特危工作場所內的 工作項目。
        }
        empIDKeys  = [...new Set(empIDKeys)]; 
        mergedData = [...new Set(mergedData)]; 

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
                    const load_change = await load_fun('load_change', selectStaffStr, 'return');                      // step-1. 先從db撈現有的資料
                    const existingStaffStrs = load_change.map(staff => staff.emp_id);                               // step-2. 提取load_change中所有的emp_id值
 
                    defaultStaff_inf = [...new Set([...defaultStaff_inf, ...load_change])];                         // step-2. 合併load_change+去重
                    // defaultStaff_inf = uniqueArr(defaultStaff_inf, load_change);
                        // console.log('1.defaultStaff_inf...', defaultStaff_inf)

                    const selectStaffArr = selectStaffStr.replace(/"/g, '').split(',')                              // step-3. 去除前後"符號..分割staffStr成陣列
                    const notExistingStaffs = selectStaffArr.filter(emp_id => !existingStaffStrs.includes(emp_id)); // step-4. 找出不存在於load_shLocalDepts中的部門代號
                        // console.log('2.notExistingStaffs...', notExistingStaffs)

                    if(notExistingStaffs.length > 0) {
                        const notExistingStaffs_str = JSON.stringify(notExistingStaffs).replace(/[\[\]]/g, '');     // step-5. 把不在的部門代號進行加工(多選)，去除外框
                        const bomNewDeptArr = await bomNewStaff(notExistingStaffs_str, mergedData);                 // step-6. 呼叫fun-3 bomNewStaff 生成staff預設值
                        defaultStaff_inf = [...new Set([...defaultStaff_inf, ...bomNewDeptArr])];                   // step-6. 合併bomNewDeptArr+去重
                        // defaultStaff_inf = uniqueArr(defaultStaff_inf, bomNewDeptArr);
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
                                newStaffData["_changeLogs"] = {};
                                newStaffData["_content"]    = {};
                                newStaffData["_todo"]       = {};
                                // newStaffData["created_at"] = getTimeStamp();
                                empId = empId.replace(/"/g, '');                                     // 去除前後"符號..
                                const staffStr = mergedData.find(item => item.includes(empId));      // 從_dept_inf找出符合 empId 的原始字串

                                if(staffStr){
                                    const staffArr = staffStr.split(',')                              // 分割staffStr成陣列
                                    newStaffData["emp_id"]    = staffArr[0] ?? '';                    // 取出陣列 0 = 工號
                                    newStaffData["cname"]     = staffArr[1] ?? '';                    // 取出陣列 1 = 名稱
                                    // newStaffData["OSTEXT_30"] = staffArr[2] ?? '';                    // 取出陣列 2 = 廠區
                                    // newStaffData["OSHORT"]    = staffArr[3] ?? '';                    // 取出陣列 3 = 部門代號
                                    // newStaffData["OSTEXT"]    = staffArr[4] ?? '';                    // 取出陣列 4 = 部門名稱
                                    const targetMonth  = staffArr[5] ?? '';                    // 取出陣列 5 = 作業年月
                                    newStaffData["_changeLogs"][targetMonth] = {
                                        "OSHORT" : staffArr[3] ?? '',
                                        // "_0isClose" : false
                                    };
                                    newStaffData["_content"][targetMonth] = {
                                        'notify' : []
                                    };
                                }else{
                                    newStaffData["emp_id"]      = empId; 
                                }
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
                        staffData['_changeLogs'][i_targetMonth] = staffData['_changeLogs'][i_targetMonth] ?? {};    // 防呆
                        const thisValue = staffData['_changeLogs']?.[i_targetMonth]?.[i_targetTD] ?? '';              // 賦予內容值
                        let thisTD = '';
                            if(i_targetTD.includes('Date')){
                                thisTD +=  `<div class="row">`;
                                thisTD +=  `<div class="col-12 py-0 px-3">
                                                <div class="form-floating">
                                                    <input type="date" name="${i_targetTD}" id="${this.id},edit2" class="form-control" value="${thisValue}" place_holder >
                                                    <label for="${this.id},edit2" class="form-label">${i_targetTD}：</label>
                                                </div>
                                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                                    <button type="button" onclick="setTodayBtn('${this.id},edit2')"  class="btn btn-sm btn-primary">取今天日期</button>
                                                    <button type="button" onclick="clearDateBtn('${this.id},edit2')" class="btn btn-sm btn-secondary">清除日期</button>
                                                </div>
                                            </div>`;

                            }else if(i_targetTD.includes('Remark')){
                                thisTD +=  `<div class="row">`;
                                thisTD +=  `<div class="col-12 py-0 px-3">
                                                <label for="${this.id},edit2" class="form-label">${i_targetTD}：</label>
                                                <textarea name="${i_targetTD}" id="${this.id},edit2" class="form-control " style="height: 100px" placeholder="${i_targetTD}">${thisValue}</textarea>
                                            </div>`;
        
                            }else if(i_targetTD.includes('_content')){  // 通知紀錄

                                staffData['_content'][i_targetMonth] = staffData['_content'][i_targetMonth] ?? {};    // 防呆
                                const thisNotifys = staffData['_content']?.[i_targetMonth]?.['notify'] ?? [];         // 賦予內容值
                                if(userInfo.role <= 1){
                                    thisTD +=  `<div class="row">
                                                    <div class="col-2 col-md-2 p-1 mcc">
                                                        <snap data-toggle="tooltip" data-placement="bottom" title="全選" class="p-1">
                                                            <button type="button" id="selectAll_notify_btn" class="btn btn-outline-danger btn-sm btn-xs add_btn"
                                                                onclick="" ><i class="fa-solid fa-check-double"></i></button>
                                                        </snap>
                                                        <snap data-toggle="tooltip" data-placement="bottom" title="刪除" class="p-1">
                                                            <button type="button" id="delete_notify_btn"    class="btn btn-outline-danger btn-sm btn-xs add_btn"
                                                                onclick="" ><i class="fa-solid fa-xmark"></i></button>
                                                        </snap>
                                                    </div>
                                                    <div class="col-10 col-md-10 border rounded p-1 notify_log mcc">-- Notify logs --</div>
                                                </div>`;
                                }

                                thisNotifys.forEach((thisNotify,index) => {
                                    // 通報數據加工+去除[]符號/[{"}]/g, ''
                                    const thisNotifyStr = JSON.stringify(thisNotify).replace(/[\[{"}\]]/g, '').replace(/:/g, ' : ').replace(/,/g, '<br>'); 
                                    thisTD += `<div class="row"><div class="col-2 col-md-2 mcc"><input type="checkbox" id="notify,${i_empId},${i_targetMonth},${index}" value="${index}" class="form-check-input"></div><div class="col-10 col-md-10 border rounded py-1 notify_log">${thisNotifyStr}</div></div>`;
                                })
                            }

                        thisTD += '</div>';
                        $('#edit2_modal .modal-body').empty().append(thisTD);     // 定義搜尋input欄// 賦予內容值

                    }else{
                        console.error(`staff empID：${i_empId} is undefined!!`)
                    }


                    if(i_targetTD.includes('_content')){
                        reload_notify2_Listeners();     // 定義edit2_modal[全選]+[刪除]鈕功能
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
    // 250416 改變edit2 class吃css的狀態；主要是主管以上不需要底色編輯提示
    function changEdit2TDmode(){
        console.log('changEdit2TDmode...')
        // const isEdit2 = userInfo.role <= 2;
        // const targetTD = document.querySelectorAll(isEdit2 ? '.edit2' : '.xedit2');  
        const targetTD = document.querySelectorAll('.edit2');  
        targetTD.forEach(tdItem => {
            tdItem.classList.toggle('edit2');
            // tdItem.classList.toggle(isEdit2 ? 'edit2'  : 'xedit2');
            // tdItem.classList.toggle(isEdit2 ? 'xedit2' : 'edit2');
        });
    }

    // 250312 modal-edit2 指定今天日期
    function setTodayBtn(thisID) {
        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = String(today.getMonth() + 1).padStart(2, '0'); // 獲取月份並補零
        let dd = String(today.getDate()).padStart(2, '0');      // 獲取日期並補零
        let formattedDate = `${yyyy}-${mm}-${dd}`;              // 格式化日期為 yyyy-mm-dd
        document.getElementById(thisID).value = formattedDate;  // 設置 input 的值
    };
    // 250312 modal-edit2 清除日期
    function clearDateBtn(thisID) {
        document.getElementById(thisID).value = '';             // 清空 input 的值
    };

    // 250326 定義edit2_modal[全選]+[刪除]鈕功能~~；from edit2_modal裡[更新]鈕的呼叫...
    let selectAllNotify2ClickListener;
    let deleteNotify2ClickListener;
    async function reload_notify2_Listeners() {
        const selectAll_notify_btn = document.querySelector('#edit2_modal #selectAll_notify_btn');   //  定義出範圍1
        const delete_notify_btn    = document.querySelector('#edit2_modal #delete_notify_btn');      //  定義出範圍2
        // 檢查並移除已經存在的監聽器
        if (selectAllNotify2ClickListener) {
            selectAll_notify_btn.removeEventListener('click', selectAllNotify2ClickListener);   // 將每一個tdItem移除監聽1
        }   
        if (deleteNotify2ClickListener) {
            delete_notify_btn.removeEventListener('click', deleteNotify2ClickListener);         // 將每一個tdItem移除監聽2
        }   
    
        // 定義新的監聽器函數1
        selectAllNotify2ClickListener = async function () {
            const target_notify_cbs = document.querySelectorAll(`#edit2_modal input[id*="notify,"]`);
            // 檢查第一個 checkbox 是否被選中，然後根據它的狀態全選或全部取消
            let allChecked = Array.from(target_notify_cbs).every(checkbox => checkbox.checked);
            target_notify_cbs.forEach(checkbox => {
                checkbox.checked = !allChecked; // 如果 allChecked 為 true，則取消選擇，否則全選
            });
        }
        // 定義新的監聽器函數2
        deleteNotify2ClickListener = async function () {
            const target_notify_cbs = Array.from(document.querySelectorAll(`#edit2_modal input[id*="notify,"]`));
            const selectedItems = target_notify_cbs.filter(cb => cb.checked).map(cb => cb);         // 取得所選的NotifyItem(多選)
                // console.log('2.selectedItems...', selectedItems);
            selectedItems.map(cb => {
                var row = cb.parentNode.parentNode; 
                row.parentNode.removeChild(row);                                    // 刪除在畫面上的該行
            })
        }

        // 添加新的監聽器
        if(userInfo.role <= 1){
            selectAll_notify_btn.addEventListener('click', selectAllNotify2ClickListener);  // 將每一個tdItem增加監聽1
            delete_notify_btn.addEventListener('click', deleteNotify2ClickListener);        // 將每一個tdItem增加監聽2
        }
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

            const thisId_arr = this.value.split(',');               // 分割this.id成陣列
                const i_OSHORT      = thisId_arr[0] ?? '';          // 取出陣列 0 = 部門代號
                const i_targetMonth = thisId_arr[1] ?? '';          // 取出陣列 1 = 目標年月
                const i_empId       = thisId_arr[2] ?? '';          // 取出陣列 2 = 工號
                const i_targetTD    = thisId_arr[3] ?? '';          // 取出陣列 3 = 目標TD

            // // 撈出該staff資料
            const staffData = staff_inf.find(staff => staff.emp_id === i_empId);    // 翻出staff來
            if(staffData){
                if(i_targetTD.includes('_content')){    // for notify的刪除
                        // notify過濾小工具...
                        function filterNotifyByIndexes(target_arr, indexes) {
                            return target_arr.filter((item, index) => indexes.includes(index.toString()));
                        }
                    // 定義notify cb的範圍
                    const target_notify_cbs = Array.from(document.querySelectorAll(`#edit2_modal input[id*="notify,"]`));
                    // 取得每一個checkbox的value=index
                    const selectedValues = target_notify_cbs.map(cb => cb.value);  // 取得所選的NotifyItem(多選)
                        console.log('3.selectedValues...', selectedValues);
                    // 取得員工紀錄裡(年月)的notify紀錄陣列
                    const i_notify = staffData['_content'][i_targetMonth]['notify'] ?? [];
                    // 1.將取得的紀錄送去過濾 2.返回帶入原來位置。
                    staffData['_content'][i_targetMonth]['notify'] = filterNotifyByIndexes(i_notify, selectedValues);

                    post_staff(staff_inf, mergedData_inf, shItemArr_inf);    // 更新畫面=重新鋪設Page3

                }else{
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
                }
                console.log('staffData...', staffData);

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
        // 使用合併的函式
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
                        if (type === 'checkbox') {                  // 250310 在p3table上建立_6ShCheck監聽功能 for ._6ShCheck = array
                            const selectedOptsValues = Array.from(document.querySelectorAll(`#staff_table input[type="checkbox"]:checked[id*="${i_OSHORT},${i_targetMonth},${i_empId},${i_targetTD},"]`))
                                .map(cb => cb.value);
                            staffData['_changeLogs'][i_targetMonth][i_targetTD] = selectedOptsValues;
                            // 連動_7isCheck
                            const _7isCheck = document.getElementById(`${i_OSHORT},${i_targetMonth},${i_empId},_7isCheck`);
                            if(_7isCheck){
                                _7isCheck.checked = (selectedOptsValues.length > 0);                                    // 更新畫面
                                let label = _7isCheck.nextElementSibling;            //  250322 switch true=是/false=否
                                label.textContent = (selectedOptsValues.length > 0) ? "是" : "否";

                                staffData['_changeLogs'][i_targetMonth]['_7isCheck'] = (selectedOptsValues.length > 0); // 更新暫存
                            } 

                        } else if (type === 'checkbox-boolean') {   // 250310 在p3table上建立_8isCheck監聽功能 for ._8isCheck = true/false
                            staffData['_changeLogs'][i_targetMonth][i_targetTD] = this.checked;

                            let label = this.nextElementSibling;            //  250322 switch true=是/false=否
                            label.textContent = this.checked ? "是" : "否";
                        }
                        // console.log('staffData...', staffData);
        
                    } else {
                        console.error(`staff empID：${i_empId} is undefined!!`);
                    }
                    // console.log('staff_inf...', staff_inf);

                };
        
                // 添加新的監聽器
                elements.forEach(element => {
                    element.addEventListener('change', listener);
                });
        
                resolve();
            });
        }
        // // 250310 在p3table上建立_6ShCheck監聽功能 for ._6ShCheck = array...
        async function reload_staffP3ShCheckOnchange_Listeners() {
            await reload_staffP3ChangeListeners('checkbox', '_6shCheck', false);
        }
        // // 250310 在p3table上建立_8isCheck監聽功能 for ._8isCheck = true/false...
        async function reload_staffP3IsCheckOnchange_Listeners() {
            await reload_staffP3ChangeListeners('checkbox-boolean', '_7isCheck', false);
        }

    // p-3 批次儲存變更作業員工清單...
    async function bat_storeChangeStaff(){
        // 250317 儲存前確認是否有沒有結案的項目...
        for(const [index, staff] of Object.entries(staff_inf)){
            let { _todo } = staff;                                                  // 確保 _todo 存在
            if(_todo.length == 0){
                _todo = {};
            }
            for(const[targetYear, logs] of Object.entries(staff._changeLogs)){
                if((logs._9checkDate === '' || logs._9checkDate === undefined ) && logs._7isCheck === true && logs._6shCheck.length !== 0){     // 沒有結案...建立--未結案的年月:異動後部門代號
                    _todo[targetYear] = _todo[targetYear] ?? {
                            'OSHORT' : logs.OSHORT                          // 新增未結案的年月
                        }
                }else{                                                      // 已經結案...找到對應的位置於以刪除
                    delete _todo[targetYear];                            // 刪除對應的項目...這裡要注意~~~~~~~~~~~~~~~~~!!!!!!!!!
                }
            }
            staff_inf[index]['_todo'] = _todo;                               // 更新 _todo 屬性
        }
            // console.log('bat_storeChangeStaff--staff_inf',staff_inf);
        const bat_storeChangeStaff_value = JSON.stringify({
                staff_inf : staff_inf
            });
            // console.log('bat_storeChangeStaff_value',bat_storeChangeStaff_value);
        const result = await load_fun('bat_storeChangeStaff', bat_storeChangeStaff_value, 'return');   // load_fun的變數傳遞要用字串
        inside_toast(result.content, 3000, result.action);

        if(result.action === 'success'){
            post_staff(staff_inf, mergedData_inf, shItemArr_inf);    // 更新畫面=重新鋪設Page3
        }
        // location.reload();
    }