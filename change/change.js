    // 重新架構
    async function resetINF(request){
        if(request){
            shLocalDept_inf  = [];
            defaultDept_inf  = [];
            _dept_inf        = [];
            staff_inf        = [];
            mergedData_inf   = [];

            defaultStaff_inf = [];
            // loadStaff_tmp = [];
            // _doc_inf      = [];
            // _doc_inf.idty = null;

            resetMaintainDept();
            await release_dataTable();
            $('#hrdb_table tbody').empty();
            
            await release_dataTable('staff_table');
            $('#staff_table tbody').empty();

            // $('#form_btn_div').empty();
            // $('#logs_div .logs tbody').empty();
            // $('#reviewInfo').empty();
            // $('#logsInfo').empty();

        }else{
            // await release_dataTable();                  // 停止並銷毀 DataTable
            // await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
            // await post_preYearShCase(staff_inf);        // step-1-1.重新渲染去年 shCase&判斷  // 241024 停止撲到下面
            // await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
        }

        // if(userInfo.role <= '2.2' && _doc_inf.idty <= 4 ){                        // 限制role <= 3 現場窗口以下...排除主管和路人
        //     // await reload_HECateTable_Listeners();   // 重新定義HE_CATE td   // 關閉可防止更動 for簽核
        //     await reload_shConditionTable_Listeners();
        //     await reload_yearHeTable_Listeners();
        //     await reload_yearPreTable_Listeners();
        // }else{
        //     // changeHE_CATEmode();                    // 241108 改變HE_CATE calss吃css的狀態；主要是主管以上不需要底色編輯提示
        //     changeShConditionMode();
        //     changeYearHeMode();
        //     changeYearPreMode();
        // }
        
        await reload_postMemoMsg_btn_Listeners();
        await btn_disabled();                       // 讓指定按鈕 依照shLocalDept_inf.length 啟停 
    }
    // 讓指定按鈕 依照shLocalDept_inf.length 啟停
    function btn_disabled(){
        return new Promise((resolve) => {
            
            // console.log('shLocalDept_inf.length =>', shLocalDept_inf.length)
            const shLocalDept_inf_length0 = shLocalDept_inf.length === 0;
                resetINF_btn.disabled         = shLocalDept_inf_length0;  // 讓 p2清除 按鈕啟停
                bat_storeDept_btn.disabled    = shLocalDept_inf_length0;  // 讓 p2儲存 按鈕啟停
                // download_excel_btn.disabled = shLocalDept_inf_length0;  // 讓 p2下載 按鈕啟停

            const staff_inf_length0 = staff_inf.length === 0;
                P3resetINF_btn.disabled           = staff_inf_length0;  // 讓 p3清除 按鈕啟停
                bat_storeChangeStaff_btn.disabled = staff_inf_length0;  // 讓 p3儲存 按鈕啟停
                download_excel_btn.disabled       = staff_inf_length0;  // 讓 p3下載 按鈕啟停

                p2_send_btn.disabled              = staff_inf_length0;  // 讓 p3傳送通知 按鈕啟停
                // p2notify_btn.disabled             = staff_inf_length0;  // 讓 p3發出 按鈕啟停 => 改由p2_step5控制

            // SubmitForReview_btn.disabled = shLocalDept_inf.length === 0 || (_doc_inf.idty >= 4);   // 讓 送審 按鈕啟停

            // loadExcel_btn.disabled       = (_doc_inf.idty >= 4) || (userInfo.role >= 2);     // 讓 新增 按鈕啟停
            // importStaff_btn.disabled     = (_doc_inf.idty >= 4) || (userInfo.role >= 2);     // 讓 上傳 按鈕啟停

            // if(_doc_inf.idty >= 4){
            //     bat_storeStaff_btn.disabled  = true;  // 讓 儲存 按鈕啟停
            //     SubmitForReview_btn.disabled = true;  // 讓 送審 按鈕啟停
            // }
            
            // document.querySelectorAll(`#hrdb_table input[id*="eh_time,"]`).forEach(input => input.disabled   = (_doc_inf.idty >= 5 || _doc_inf.in_sign != userInfo.empId ));   // 讓所有eh_time 輸入欄位啟停 = 主要for已送審
            // document.querySelectorAll(`#hrdb_table button[class*="eraseStaff"]`).forEach(btn => btn.disabled = (_doc_inf.idty >= 5 || _doc_inf.in_sign != userInfo.empId ));   // 讓所有eraseStaff btn啟停 = 主要for已送審
            // postMemoMsg_btn.disabled     = (_doc_inf.idty >= 4);    // 讓 貼上備註 按鈕啟停
            // memoMsg_input.disabled       = (_doc_inf.idty >= 4)

            resolve();
        });
    }
    // 250220 取得本月份及上個月份-->參數dateString可以指定年月
    function getCurrentAndLastMonth(dateString) {
            let currentYear;
            let currentMonth;
        // 如果有傳入字串參數，則解析該字串
            if (dateString) {
                // 確保字串格式為 YYYYMM
                if (!/^\d{6}$/.test(dateString)) {
                    throw new Error("日期格式必須為 'YYYYMM'");
                }
                currentYear  = parseInt(dateString.substring(0, 4), 10);
                currentMonth = parseInt(dateString.substring(4, 6), 10);
            } else {
                const currentDate = new Date();
                // 取得目前的年和月份
                currentYear  = currentDate.getFullYear();
                currentMonth = currentDate.getMonth() + 1; // 月份從 0 開始，因此要 +1
            }
            // 計算上2個月的年和月份
                let lastTwoYear  = currentYear;
                let lastTwoMonth = currentMonth - 2;
            // 年份進退計算
                if (lastTwoMonth <= 0) {
                    lastTwoMonth = 12; // 上個月為 12 月
                    lastTwoYear -= 1;  // 年份減一
                }
            // 計算上個月的年和月份
                let lastYear  = currentYear;
                let lastMonth = currentMonth - 1;
            // 年份進退計算
                if (lastMonth === 0) {
                    lastMonth = 12; // 上個月為 12 月
                    lastYear -= 1;  // 年份減一
                }
            // 計算下個月的年和月份
                let preYear  = currentYear;
                let preMonth = currentMonth + 1;
            // 年份進退計算
                if (preMonth === 13) {
                    preMonth = 1;  // 下個月為 1 月
                    preYear += 1;  // 年份加一
                }
            // 格式化成 YYYYMM
                const preYearMonth     = `${preYear}${String(preMonth).padStart(2, '0')}`;          // 下月
                const currentYearMonth = `${currentYear}${String(currentMonth).padStart(2, '0')}`;  // 本月
                const lastYearMonth    = `${lastYear}${String(lastMonth).padStart(2, '0')}`;        // 上月
                const lastTwoYearMonth = `${lastTwoYear}${String(lastTwoMonth).padStart(2, '0')}`;  // 上2月
            // 返回數據

        return { preYearMonth, currentYearMonth, lastYearMonth, lastTwoYearMonth };
    }
    // 250220 fun-2.函式：去重保留唯一值
    function uniqueArr(arr1, arr2){
        arr1 = arr1 ?? [];
        arr2 = arr2 ?? [];
        const arr3 = [...arr1, ...arr2];
        const uniqueArr = arr3.reduce((acc, current) => {
                                const key = Object.keys(current)[0]; // 取得物件的鍵
                                // 檢查該鍵是否已經存在於結果陣列中
                                if (!acc.some(item => Object.keys(item)[0] === key)) {
                                    acc.push(current); // 如果不存在則將該項目加入結果中
                                }
                                return acc;
                            }, []);
        return uniqueArr;
    }


    // p-2 批次儲存員工清單...
    async function bat_storeDept(){
        const bat_storeDept_value = JSON.stringify({
                shLocalDept_inf : shLocalDept_inf
            });
            // console.log('bat_storeDept_value',bat_storeDept_value);
        await load_fun('bat_storeDept', bat_storeDept_value, show_swal_fun);   // load_fun的變數傳遞要用字串
        location.reload();
    }
    // 250226 單筆刪除Dept資料
    async function eraseDept(removeDept){
        if(!confirm(`確認移除此筆(${removeDept.value})資料？`)){
            return;
        }else{
            // 創建一個 Map 來去除重複的 dept 並合併 base & inCare
            let uniqueDeptMap = new Map();
            shLocalDept_inf.forEach(item => {
                if (item.OSHORT === removeDept.value) {      // 跳過這個 OSHORT，達到刪除的效果
                    return;
                }
                if (uniqueDeptMap.has(item.OSHORT)) {  // 如果 OSHORT 已經存在，則合併 base & inCare
                    let existingDept_base = uniqueDeptMap.get(item.OSHORT).base;
                    uniqueDeptMap.get(item.OSHORT).base = existingDept_base.concat(item.base);
                    let existingDept_inCare = uniqueDeptMap.get(item.OSHORT).inCare;
                    uniqueDeptMap.get(item.OSHORT).inCare = existingDept_inCare.concat(item.inCare);
                } else {                                // 如果 OSHORT 不存在，則新增
                    uniqueDeptMap.set(item.OSHORT, item);
                }
            });

            // 將 Map 轉換回陣列
            shLocalDept_inf = Array.from(uniqueDeptMap.values());

            let table = $('#hrdb_table').DataTable();
            if(table) { await release_dataTable(); }                            // 銷毀dataTable

            var row = removeDept.parentNode.parentNode.parentNode.parentNode;   // 找到按鈕所在的行...需要手動確認按鈕所在位置在第幾層
            row.parentNode.removeChild(row);                                    // 刪除該行

            inside_toast(`刪除單筆資料${removeDept.value}...Done&nbsp;!!`, 1000, 'info');
            await reload_dataTable();                                           // 重新載入dataTable   
        }
    }
    // 250226 從Excel匯入時要進行的處理工作
    async function processImportExcel(excelJsonArr){
            // console.log('excelJsonArr...', excelJsonArr)
        // step-1.將人員資料進行初步的整理，和_shlocaldept內容相似
            let processStaffs = {};     // 處理人員資料
            let processDeptInf = [];    // 處理部門資訊
            let emptyDeptInf   = [];    // 處理空部門資訊
            excelJsonArr.forEach((emp) => {
                // 防呆與確保
                processStaffs[emp.OSHORT]           = processStaffs[emp.OSHORT]           ?? {};
                processStaffs[emp.OSHORT]['inCare'] = processStaffs[emp.OSHORT]['inCare'] ?? {};
                processStaffs[emp.OSHORT]['inCare'][emp.targetYear] = processStaffs[emp.OSHORT]['inCare'][emp.targetYear] ?? [];
                processStaffs[emp.OSHORT]['base']   = processStaffs[emp.OSHORT]['base']   ?? {};
                processStaffs[emp.OSHORT]['base'][emp.targetYear] = processStaffs[emp.OSHORT]['base'][emp.targetYear] ?? {};
                processStaffs[emp.OSHORT]['base'][emp.targetYear]['getIn'] = processStaffs[emp.OSHORT]['base'][emp.targetYear]['getIn'] ?? [];
                // 處理與彙整-員工
                const empObj = {[emp.emp_id] : emp.cname};
                processStaffs[emp.OSHORT]['base'][emp.targetYear]['getIn'].push(empObj);
                processStaffs[emp.OSHORT]['inCare'][emp.targetYear].push(empObj);
                // 處理與彙整-DEPT
                processDeptInf.push(`${emp.OSTEXT_30},${emp.OSHORT},${emp.OSTEXT}`);
                // 處理與彙整-DEPT-沒有部門名稱
                if(emp.OSTEXT == null || emp.OSTEXT == undefined || emp.OSTEXT == ''){
                    emptyDeptInf.push(emp.OSHORT);
                }
            })
                // console.log('1.emptyDeptInf...', emptyDeptInf)

        // 將沒有部門資訊的清單進行查詢
            const uniqueEmptyDeptArr = [...new Set(emptyDeptInf)];   // 使用 Set 來移除emptyDeptInf重複值
            const uniqueEmptyDeptStr = JSON.stringify(uniqueEmptyDeptArr).replace(/[\[\]]/g, '');   // step-3. 把不在的部門代號進行加工(多選)，去除外框
                // console.log('1a.uniqueEmptyDeptArr...', uniqueEmptyDeptArr)
                // console.log('1b.uniqueEmptyDeptStr...', uniqueEmptyDeptStr)
            const EmptyDeptInf = uniqueEmptyDeptStr ? await load_fun('load_dept', uniqueEmptyDeptStr, 'return') : [];
                // console.log('1c.EmptyDeptInf...', EmptyDeptInf)

            // console.log('2.processStaffs...', processStaffs)
            // console.log('2.processDeptInf...', processDeptInf)
        let uniqueDeptArr = [...new Set(processDeptInf)];     // 使用 Set 來移除dept_inf重複值
            // console.log('3.uniqueDeptArr...', uniqueDeptArr)
            
        // 將沒有部門資訊的清單進行套用
            for(const [index, dept] of Object.entries(uniqueDeptArr)){
                const deptArr = (dept) ? dept.split(',') : [];          // 分割dept成陣列
                const dept_OSTEXT_30 = deptArr[0] ?? '';                // 取出陣列 2 = 廠區
                const dept_OSHORT    = deptArr[1] ?? '';                // 取出陣列 3 = 部門代號
                const dept_OSTEXT    = deptArr[2] ?? '';                // 取出陣列 4 = 部門名稱
                if(dept_OSTEXT == undefined || dept_OSTEXT == null || dept_OSTEXT == ''){
                    const deptInf = EmptyDeptInf.find(item => item.OSHORT === dept_OSHORT);     // 從_dept_inf找出符合 empId 的原始字串
                    const deptInf_OSTEXT = (deptInf) ? deptInf.OSTEXT : '(請注意--無資訊)';
                    // console.log(dept_OSHORT , ' == ',deptInf_OSTEXT)
                    uniqueDeptArr[index] = `${dept_OSTEXT_30},${dept_OSHORT},${deptInf_OSTEXT ?? ''}`;
                }
            }
            // console.log('3.uniqueDeptArr...', uniqueDeptArr)

        const excelDeptArr = [...new Set(excelJsonArr.map(empt => empt.OSHORT))];   // step-2. 提取load_shLocalDepts中所有的OSHORT值，並使用 Set 來移除OSHORT重複值
        const excelDeptStr = JSON.stringify(excelDeptArr).replace(/[\[\]]/g, '');   // step-3. 把不在的部門代號進行加工(多選)，去除外框
        const bomNewDeptArr = await preCheckDeptData(excelDeptStr, uniqueDeptArr);    // 呼叫預處理deptData 或 生成dept預設值

        for(const [index_OSHORT, value_i ] of Object.entries(processStaffs)){
            let deptData = bomNewDeptArr.find(dept => dept.OSHORT == index_OSHORT);
            // 合併 array1=value_i 到 array2=deptData
            for(const [key, value ] of Object.entries(value_i)){
                // 確保 array2 的相同鍵也存在
                if (deptData[key]) {
                    // 將內容合併
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        Object.entries(value).forEach(([innerKey, innerValue]) => {
                            // 將值合併到 array2 的對應鍵中
                                // console.log("0.index_OSHORT:", index_OSHORT);
                                // console.log("  1.key:", key);               // base/inCare
                                // console.log("  2.innerKey:", innerKey);     // 年月
                            // // // 這裡要區分inCare和base
                            if(key === 'base'){
                                // 防呆與確保--年
                                deptData[key][innerKey] = deptData[key][innerKey] ?? {};
                                Object.entries(innerValue).forEach(([innerInnerKey, innerInnerValue]) => {
                                        // console.log("  3.innerInnerKey:", innerInnerKey);       // inCare/base
                                        // console.log("  4.innerInnerValue:", innerInnerValue);
                                    // 防呆與確保--分類
                                    deptData[key][innerKey][innerInnerKey] = deptData[key][innerKey][innerInnerKey] ?? [];
                                    
                                    if (Array.isArray(innerInnerValue)) {
                                        // 合併陣列
                                        deptData[key][innerKey][innerInnerKey] = deptData[key][innerKey][innerInnerKey].concat(innerInnerValue);
                                        // 去重!
                                        deptData[key][innerKey][innerInnerKey] = deptData[key][innerKey][innerInnerKey].reduce((acc, current) => {
                                                                                        const key = Object.keys(current)[0]; // 取得物件的鍵
                                                                                        // 檢查該鍵是否已經存在於結果陣列中
                                                                                        if (!acc.some(item => Object.keys(item)[0] === key)) {
                                                                                            acc.push(current); // 如果不存在則將該項目加入結果中
                                                                                        }
                                                                                        return acc;
                                                                                    }, []);  
                                    } else {
                                        deptData[key][innerKey][innerInnerKey] = innerInnerValue;
                                    }
                                });

                            }else if(key === 'inCare'){
                                // 防呆與確保--年
                                deptData[key][innerKey] = deptData[key][innerKey] ?? [];
                                // console.log("  4.innerKey:", innerKey);
                                // console.log("  4.innerValue:", innerValue);
                                // console.log("  4.deptData[key][innerKey]:", deptData[key][innerKey]);
                                deptData[key][innerKey] = deptData[key][innerKey].concat(innerValue);
                                // 去重!
                                deptData[key][innerKey] = deptData[key][innerKey].reduce((acc, current) => {
                                                                const key = Object.keys(current)[0]; // 取得物件的鍵
                                                                // 檢查該鍵是否已經存在於結果陣列中
                                                                if (!acc.some(item => Object.keys(item)[0] === key)) {
                                                                    acc.push(current); // 如果不存在則將該項目加入結果中
                                                                }
                                                                return acc;
                                                            }, []);  

                                // deptData[key][innerKey] = innerValue;
                                // if (Array.isArray(innerValue)) {
                                //     // 合併陣列
                                //     deptData[key][innerKey] = deptData[key][innerKey].push(innerValue);
                                // } else {
                                //     deptData[key][innerKey] = innerValue;
                                // }
                            };
                        });
           
                    } else {
                        // 複製非物件的值
                        deptData[key] = value;
                    }
                } else {
                    // 如果 array2 中沒有相同鍵，則直接加入
                    deptData[key] = value;
                }
            }
        }
        // 工作一 清空暫存
        await resetINF(true);       // 清空 -- 不清空會導致數據疊加翻倍
        // console.log('bomNewDeptArr...2', bomNewDeptArr);
        post_hrdb(bomNewDeptArr);                                                                 // step-8. 送出進行渲染
    }



// // phase 2 -- 鋪設
    async function post_hrdb(post_arr, dateString){
        // 停止並銷毀 DataTable
            release_dataTable();
            $('#hrdb_table tbody').empty();
            shLocalDept_inf = (post_arr != '') ? post_arr : shLocalDept_inf;
            console.log("post_arr =>", post_arr);
            // console.log("shLocalDept_inf =>", shLocalDept_inf);
            // await goTest(post_arr);

        if(shLocalDept_inf.length === 0){
            const table = $('#hrdb_table').DataTable();                     // 獲取表格的 thead
            const columnCount = table.columns().count();                    // 獲取每行的欄位數量
            const tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 沒有資料 ~ </td><tr>`;
            $('#hrdb_table tbody').append(tr1);

        }else{
                // 部門代號加工+去除[]符號/[{"}]/g, ''
                function doReplace(_arr){
                    return JSON.stringify(_arr).replace(/[\[{"}\]]/g, '').replace(/:/g, ' : ').replace(/,/g, '<br>'); 
                }
            let objKeys_ym = [];    // 把所有的base下的年月key蒐集起來
            let thisMonth;          // 顯示月份&submit_btn
            const sys_role2 = (userInfo.role <= 2) ? '' : 'disabled';
            await shLocalDept_inf.forEach((post_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                const { targetMonth, baseAll_arr, getOut_arr, getIn_arr, inCare_arr } = reworkBaseInCare(post_i, dateString);
                    // const baseAll_str = (baseAll_arr) ? doReplace(baseAll_arr) : '';      
                    const getOut_str  = (getOut_arr ) ? doReplace(getOut_arr)  : '';
                    const getIn_str   = (getIn_arr  ) ? doReplace(getIn_arr)   : '';
                    const inCare_str  = (inCare_arr ) ? doReplace(inCare_arr)  : '';       // 部門代號加工+去除[]符號/[{"}]/g, ''

                let tr1 = '<tr>';
                    tr1 += `<td class="t-start edit1" id="OSTEXT_30/OSHORT/OSTEXT,${post_i.OSHORT}" >${post_i["OSTEXT_30"] ?? ''}<br>${post_i["OSHORT"]}<br>${post_i["OSTEXT"] ?? ''}</td>
                            <td class="word_bk import" id="base,${post_i.OSHORT},${targetMonth}"  ><b>${targetMonth}：${baseAll_arr.length ?? '0'}人</b><br>...(以下略)...</td>
                            <td class="word_bk" id="getOut" ><b>${targetMonth}：${getOut_arr.length ?? '0'}人轉出</b><br>${getOut_str}</td>
                            <td class="word_bk" id="getIn" ><b>${targetMonth}：${getIn_arr.length ?? '0'}人轉入</b><br>${getIn_str}</td>
                            <td class="word_bk" id="inCare,${post_i.OSHORT},${targetMonth}"><b>${targetMonth}：${inCare_arr.length ?? '0'}人</b><br>${inCare_str}</td>
                            <td class="text-center">
                                <div class="row">
                                    <div class="col-12 py-1">
                                        <button type="button" class="btn btn-outline-danger btn-sm btn-xs add_btn eraseDept" value="${post_i.OSHORT}" data-toggle="tooltip" data-placement="bottom" title="移除名單"
                                            onclick="eraseDept(this)"><i class="fa-regular fa-rectangle-xmark"></i></button>&nbsp;&nbsp;
                                        <button type="button" class="btn btn-outline-success btn-sm btn-xs add_btn " id="remark,${post_i.OSHORT}" value="remark,${post_i.OSHORT}" data-toggle="tooltip" data-placement="bottom" title="總窗 備註/有話說"
                                            onclick="memoModal(this.value)" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight"><i class="fa-regular fa-rectangle-list"></i></button>
                                    </div>
                                    <div class="col-12 py-1">
                                        <div class="form-check form-switch inb">
                                            <input class="form-check-input" type="checkbox" id="flag,${post_i.OSHORT}" ${ post_i['flag'] ? "checked" : ""} ${sys_role2}>
                                            <label class="form-check-label" for="flag,${post_i.OSHORT}">啟用</label>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            
                            <td class="t-start px-3 unblock" id="created_at/updated_at/updated_cname,${post_i.OSHORT}" >
                                ${post_i["created_at"] ?? ''}<br>${post_i["updated_at"] ?? ''}<br>${post_i["updated_cname"] ?? ''}
                            </td> ;`
                    tr1 += '</tr>';

                $('#hrdb_table tbody').append(tr1);

                // mk_Badge(post_i["base"]  , 'base'  , true);
                // mk_Badge(post_i["inCare"], 'inCare', false);
                objKeys_ym = [...objKeys_ym, ...Object.keys(post_i["base"])];   // 把所有的base下的年月key蒐集起來

                thisMonth = targetMonth;                                        // 顯示月份&submit_btn
            })
            thisMonth = (dateString != undefined) ? dateString : thisMonth;     // 
            const uniqueArr =  [...new Set(objKeys_ym)];                        // 年月去重
            mk_selectOpt_ym(uniqueArr, thisMonth);                              // 生成並渲染到select
            // SubmitForReview_btn.value = thisMonth;                              // 把[帶入維護]鈕 給上 年月字串值
        }

        await reload_dataTable();                   // 倒參數(陣列)，直接由dataTable渲染
        if(userInfo.role <= 2 ) {
            await reload_baseInCareTD_Listeners();      // 呼叫監聽[base]、[inCare]這兩格td
            await reload_deptFlagOnchange_Listeners();  // 呼叫監聽[flag]這個inpute改變的狀態，並直接更新到dept的資料
            await reload_edit1TD_Listeners();           // 呼叫監聽[廠區/部門代碼/名稱]，並直接更新到dept的資料
        }else{
            changBaseInCareTDmode();                // 250416 改變BaseInCare class吃css的狀態；主要是主管以上不需要底色編輯提示
            changEdit1TDmode();                     // 250416 改變edit1 class吃css的狀態；主要是主管以上不需要底色編輯提示
        }

        await btn_disabled();                       // 讓指定按鈕 依照shLocalDept_inf.length 啟停 

        $("body").mLoading("hide");
    }


        // 250303 從getBase(整批外層不分年月)中取得並整理出可以顯示的值 callFrom post_hrdb
        // 250220 從getInCare(整批外層不分年月)中取得並整理出可以顯示的值 callFrom post_hrdb
        function reworkBaseInCare(post_i, dateString) {
            let appointYearMonth;
            // 如果有傳入字串參數，則解析該字串
                if (dateString) {
                    // 確保字串格式為 YYYYMM
                    if (!/^\d{6}$/.test(dateString)) {
                        throw new Error("日期格式必須為 'YYYYMM'");
                    }
                    appointYearMonth = dateString;
                    // console.log('1.reworkBase...appointYearMonth:', appointYearMonth)
                }
                const { currentYearMonth, lastYearMonth, lastTwoYearMonth } = getCurrentAndLastMonth(appointYearMonth);       // 執行函式--取得年月
                const targetMonth = appointYearMonth ?? (currentYearMonth ?? (lastYearMonth ?? (lastTwoYearMonth ?? dateString)));  // 取得base的年月key
            // reworkBase
                const getBase   = post_i["base"]       ?? [];
                const base_arr  = getBase[targetMonth] ?? null ;  // 取得 本月名單 或 上月名單 或篩選月份名單
                let baseAll_arr = [];
                let getOut_arr  = [];
                let getIn_arr   = [];
                if (base_arr != undefined || base_arr != null){
                    baseAll_arr = uniqueArr(base_arr['keepGoing'], base_arr['getIn']);
                    getOut_arr  = base_arr['getOut'] ?? [];
                    getIn_arr   = base_arr['getIn']  ?? [];
                }
            // reworkInCare
                const getInCare  = post_i["inCare"]       ?? [];
                const inCare_arr = getInCare[targetMonth] ?? [] ;  // 取得 本月名單 或 上月名單
                
            return { targetMonth, baseAll_arr, getOut_arr, getIn_arr, inCare_arr };  // getTargetBase = 確認抓取的月份, baseAll_arr = 所有在職員工
        }
    
                // 250220 從getBase(整批外層不分年月)中取得並整理出可以顯示的值 callFrom post_hrdb
                async function reworkBase(getBase, dateString) {
                        let appointYearMonth = '';
                        // 如果有傳入字串參數，則解析該字串
                            if (dateString) {
                                // 確保字串格式為 YYYYMM
                                if (!/^\d{6}$/.test(dateString)) {
                                    throw new Error("日期格式必須為 'YYYYMM'");
                                }
                                appointYearMonth = dateString;
                                console.log('1.reworkBase...appointYearMonth:', appointYearMonth)
                            }
            
                        const { currentYearMonth, lastYearMonth } = getCurrentAndLastMonth(appointYearMonth); // 執行函式--取得年月
                        const targetMonth = appointYearMonth ?? (currentYearMonth ?? (lastYearMonth ?? dateString));    // 取得base的年月key
                        const base_arr    = getBase[targetMonth] ?? null ;  // 取得 本月名單 或 上月名單 或篩選月份名單
            
                        let getTargetBase = `${targetMonth}`;
                        let baseAll_arr   = [];
                        if (base_arr != undefined || base_arr != null){
                            baseAll_arr = uniqueArr(base_arr['keepGoing'], base_arr['getIn']);
                        }
                        const getIn_arr   = (base_arr != null) ? base_arr['getIn']  : [];
                        const getOut_arr  = (base_arr != null) ? base_arr['getOut'] : [];
                        console.log('1.reworkBase =>',{ getTargetBase, baseAll_arr, getOut_arr, getIn_arr })

                    return { getTargetBase, baseAll_arr, getOut_arr, getIn_arr };  // getTargetBase = 確認抓取的月份, baseAll_arr = 所有在職員工
                }
                // 250220 從getInCare(整批外層不分年月)中取得並整理出可以顯示的值 callFrom post_hrdb
                async function reworkInCare(post_i, dateString) {
                        let appointYearMonth = '';
                        // 如果有傳入字串參數，則解析該字串
                            if (dateString) {
                                // 確保字串格式為 YYYYMM
                                if (!/^\d{6}$/.test(dateString)) {
                                    throw new Error("日期格式必須為 'YYYYMM'");
                                }
                                appointYearMonth = dateString;
                                // console.log('2.reworkInCare...appointYearMonth:', appointYearMonth)
                            }
                            const { currentYearMonth, lastYearMonth, lastTwoYearMonth } = getCurrentAndLastMonth(appointYearMonth);       // 執行函式--取得年月
                            const targetMonth = appointYearMonth ?? (currentYearMonth ?? (lastYearMonth ?? (lastTwoYearMonth ?? dateString)));  // 取得base的年月key
                        //
                            const getInCare  = post_i["inCare"]       ?? [];
                            const inCare_arr = getInCare[targetMonth] ?? [] ;  // 取得 本月名單 或 上月名單
                            // console.log('2.reworkInCare =>', { targetMonth, inCare_arr })
                    return { targetMonth, inCare_arr };
                }
        // fun-1.函式：找出全部鍵，並計算差異 (arr1=本月名單, arr2=上月名單)
        function getDifferencesAndKeys(arr1, arr2) {
            // step-1.提取名單key
                const keys1 = new Set(arr1.map(obj => Object.keys(obj)[0]));    // 本月名單key
                const keys2 = new Set(arr2.map(obj => Object.keys(obj)[0]));    // 上月名單key
            // step-2.找出異動清單
                const differenceOutKeys = Array.from(keys2).filter(key => !keys1.has(key)); // 轉出keys
                const differenceInKeys  = Array.from(keys1).filter(key => !keys2.has(key)); // 轉入keys
                // step-2a.找出轉出或轉入的完整名單 (base_arr=要找的陣列, differenceKeys=要找出來的keys)
                const differenceOut = arr2.filter(item => differenceOutKeys.includes(Object.keys(item)[0])); // 輸出結果 會得到符合條件的物件陣列
                const differenceIn  = arr1.filter(item => differenceInKeys.includes(Object.keys(item)[0]));  
            // step-3.找出上月+本月沒有異動的名單
                // step-3a.去重的函式，保留唯一值
                const arr3unique = uniqueArr(arr1, arr2)
                // step-3b.找出不在 keys1本月 和 keys2上月 的名單
                const differenceKeepGoing = arr3unique.filter(item => {
                                                const key = Object.keys(item)[0]; // 取得物件中的鍵
                                                // return !keys1.has(key) && !differenceOutKeys.includes(key);
                                                return !differenceInKeys.includes(key) && !differenceOutKeys.includes(key);
                                            });
 
                    // console.log('轉出 differenceOut =>', differenceOut);
                    // console.log('轉入 differenceIn =>', differenceIn, );
                    // console.log('未動 differenceKeepGoing =>', differenceKeepGoing);
            // step-4.返回resilt變數
            return { differenceOut, differenceIn, differenceKeepGoing };
        }
        // fun-2 當shLocalDept_inf沒有符合的deptData時...給他一個新的
        function bomNewDept(selectDeptStr, _dept_inf){
            return new Promise((resolve) => {
                // 初始化新生成dept陣列..返回用
                let bomNewDeptArr = [];
                
                if(selectDeptStr !== ''){
                    const selectDeptArr = selectDeptStr.split(',')       // 分割deptStr成陣列
                    if(selectDeptArr.length > 0){
                        const { currentYearMonth, lastYearMonth } = getCurrentAndLastMonth();   // 執行函式--取得年月
                        selectDeptArr.forEach((deptNo) => {
                            let newDeptData = {};                                               // 初始化新生成dept物件
                            deptNo = deptNo.replace(/"/g, '');                                  // 去除前後"符號..
                            const deptStr = _dept_inf.find(item => item.includes(deptNo));      // 從_dept_inf找出符合 deptNo 的原始字串
                            if(deptStr){
                                const deptArr = deptStr.split(',')                              // 分割deptStr成陣列
                                newDeptData["OSTEXT_30"] = deptArr[0] ?? '';                    // 取出陣列 0 = 廠區
                                newDeptData["OSHORT"]    = deptArr[1] ?? '';                    // 取出陣列 1 = 部門代號
                                newDeptData["OSTEXT"]    = deptArr[2] ?? '';                    // 取出陣列 2 = 部門名稱
                            }else{
                                newDeptData["OSHORT"]    = deptNo; 
                            }
                            newDeptData["base"]      = {
                                    [currentYearMonth] : {
                                            'getOut'    : [],
                                            'getIn'     : [],
                                            'keepGoing' : []
                                        }
                                };
                            newDeptData["inCare"]    = { [currentYearMonth] : [] };
                            newDeptData["remark"]    = { 'memo' : [] };
                            newDeptData["flag"]      = true;
                            // newDeptData["created_at"] = getTimeStamp();
                            bomNewDeptArr.push(newDeptData);
                        })
                    }
                }

                resolve(bomNewDeptArr);
            });
            // return bomNewDeptArr;
        }
        // fun-3 檢查load_fun('load_shLocalDepts') 是否都有存在，不然就生成dept預設值
        async function preCheckDeptData(selectDeptStr, _dept_inf){
                const load_shLocalDepts = await load_fun('load_shLocalDepts', selectDeptStr, 'return');     // step-1. 先從db撈現有的資料
                const existingDeptStrs = load_shLocalDepts.map(dept => dept.OSHORT);                        // step-2. 提取load_shLocalDepts中所有的OSHORT值
                defaultDept_inf = [...defaultDept_inf, ...load_shLocalDepts];                               // step-2. 合併load_shLocalDepts

                const selectDeptArr = selectDeptStr.replace(/"/g, '').split(',')                            // step-3. 去除前後"符號..分割deptStr成陣列
                const notExistingDepts = selectDeptArr.filter(dept => !existingDeptStrs.includes(dept));    // step-4. 找出不存在於load_shLocalDepts中的部門代號

                if(notExistingDepts.length > 0) {
                    const notExistingDepts_str = JSON.stringify(notExistingDepts).replace(/[\[\]]/g, '');   // step-5. 把不在的部門代號進行加工(多選)，去除外框
                    const bomNewDeptArr = await bomNewDept(notExistingDepts_str, _dept_inf);                // step-6. 生成dept預設值
                    defaultDept_inf = [...defaultDept_inf, ...bomNewDeptArr];                               // step-6. 合併bomNewDeptArr
                }

            return(defaultDept_inf);
            // post_hrdb(defaultDept_inf);                                                                 // step-8. 送出進行渲染
        };

    // 241121 在p2table上建立flag監聽功能 for dept.flag = true/false...
    let deptFlagOnchangeListener;
    async function reload_deptFlagOnchange_Listeners() {
        return new Promise((resolve) => {
            const deptFlags = document.querySelectorAll('#hrdb_table input[id*="flag,"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
                if (deptFlagOnchangeListener) {
                    deptFlags.forEach(flag_i => {                                      // 遍歷範圍內容給flag_i
                        flag_i.removeEventListener('change', deptFlagOnchangeListener);   // 將每一個flag_i移除監聽, 當按下click
                    })
                }
            // 定義新的監聽器函數
                deptFlagOnchangeListener = async function () {
                    // step.1 標題列顯示姓名工號
                    const thisId_arr = this.id.split(',')                 // 分割this.id成陣列
                    // const thisFu     = thisId_arr[0];                     // 取出陣列0=Fu
                    const thisDeptNO = thisId_arr[1];                     // 取出陣列1=部門代號
                    const thisFlag = document.getElementById(this.id);
                    const deptData = shLocalDept_inf.find(dept => dept.OSHORT === thisDeptNO);
                        deptData.flag = thisFlag.checked;                                   // 賦予內容值
                }
            // 添加新的監聽器
                deptFlags.forEach(flag_i => {                                      // 遍歷範圍內容給flag_i
                    flag_i.addEventListener('change', deptFlagOnchangeListener);      // 將每一個flag_i增加監聽, 當按下click
                })

            resolve();
        });
    }
    // 250227 在p2table上建立edit1監聽功能 for 開啟MaintainDept編輯deptStaff名單...未完
    let edit1ClickListener;
    async function reload_edit1TD_Listeners() {
        return new Promise((resolve) => {
            const edit1 = document.querySelectorAll('#hrdb_table td[class*="edit1"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (edit1ClickListener) {
                edit1.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                    tdItem.removeEventListener('click', edit1ClickListener);   // 將每一個tdItem移除監聽, 當按下click
                })
            }

                // 生成每一個input
                function mk_input(item, oshort, itemValue){
                    let newArr =   `<div class="col-12 pb-0 px-3">
                                        <div class="form-floating">
                                            <input type="text" name="${item}" id="${item},${oshort},edit1" class="form-control" value="${itemValue}" place_holder ${ item == 'OSHORT' ? 'disabled':''}>
                                            <label for="${item},${oshort}" class="form-label">${item}：</label>
                                        </div>
                                    </div>`;
                    return newArr;
                }

            // 定義新的監聽器函數
            edit1ClickListener = async function () {
                // console.log("click this =>", this.id);
                // step.1 標題列顯示姓名工號
                const thisId_arr = this.id.split(',')                 // 分割this.id成陣列
                const thisTD     = thisId_arr[0];                     // 取出陣列0=target
                const thisDeptNO = thisId_arr[1];                     // 取出陣列1=部門代號

                // 在maintainDept input上帶入部門代號
                $('#edit_modal_title').empty().append(thisTD);     // 定義搜尋input欄// 賦予內容值
                const edit_modal_btn = document.getElementById('edit_modal_btn');
                edit_modal_btn.value = thisDeptNO;

                // // 撈出該部門資料
                const deptData = shLocalDept_inf.find(dept => dept.OSHORT === thisDeptNO);
                
                if(deptData){
                    const thisTd_arr = thisTD.split('/')                 // 分割this.id成陣列
                    let inputItem = '<div class="row">';
                    for(const item of thisTd_arr){
                        let itemValue = deptData[item] ?? '';
                        inputItem += mk_input(item, thisDeptNO, itemValue);
                    }
                    inputItem += '</div>';
                    $('#edit_modal .modal-body').empty().append(inputItem);     // 定義搜尋input欄// 賦予內容值

                }else{
                    console.log('無deptData...套用新[]')
                }

                reload_submitEdit1_Listeners();
                // step.3 顯示互動視窗
                edit_modal.show();
                // $("body").mLoading("hide");
            }

            // 添加新的監聽器
            edit1.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                tdItem.addEventListener('click', edit1ClickListener);      // 將每一個tdItem增加監聽, 當按下click
            })

            resolve();
        });
    }
    // 250416 改變edit1 class吃css的狀態；主要是主管以上不需要底色編輯提示
    function changEdit1TDmode(){
        console.log('changEdit1TDmode...')
        // const isEdit1 = userInfo.role <= 2;
        // const targetTD = document.querySelectorAll(isEdit1 ? '.edit1' : '.xedit1');  
        const targetTD = document.querySelectorAll('.edit1');  
        targetTD.forEach(tdItem => {
            tdItem.classList.toggle('edit1');
            // tdItem.classList.toggle(isEdit1 ? 'edit1'  : 'xedit1');
            // tdItem.classList.toggle(isEdit1 ? 'xedit1' : 'edit1');
        });
    }
    // 250227 定義edit_modal[更新]鈕功能~~；from edit_modal裡[更新]鈕的呼叫...
    let submitEdit1ClickListener;
    async function reload_submitEdit1_Listeners() {
        const submitEdit1_btn = document.querySelector('#edit_modal #edit_modal_btn');      //  定義出範圍
        // 檢查並移除已經存在的監聽器
        if (submitEdit1ClickListener) {
            submitEdit1_btn.removeEventListener('click', submitEdit1ClickListener);   // 將每一個tdItem移除監聽, 當按下click
        }   
 
        // 定義新的監聽器函數
        submitEdit1ClickListener = async function () {
            mloading(); 

            const thisDeptNO = this.value;
            // // 撈出該部門資料
            const deptData = shLocalDept_inf.find(dept => dept.OSHORT === thisDeptNO);
            // 取得modal上欄位
            const item_opts_arr = Array.from(document.querySelectorAll(`#edit_modal .modal-body input[id*=",edit1"]`));
            let renewItemID = '';   // 更新目標TD欄位ID
            let renewItem = '';     // 更新目標TD欄位內容
            // 繞出欄位上的值並更新deptData
            item_opts_arr.forEach(dept => {
                const thisItem = dept.id.split(',')[0];                         // 取出陣列0=target
                if (thisItem !== 'OSHORT') deptData[thisItem] = dept.value ?? '';  // 過濾不需要的項目OSHORT，其他存儲到指定
                renewItemID += ( renewItemID ? '/' : '' ) + thisItem;           // 組合TD欄位ID
                renewItem += ( renewItem ? '<br>' : '' ) + (dept.value ?? '');  // 組合TD欄位內容
                
            });
            renewItemID += ',' + thisDeptNO;                                    // 組合TD欄位ID
            let renewItemTD = document.getElementById(renewItemID);             // 指引TD欄位目標
            if(renewItemTD){
                renewItemTD.innerHTML = renewItem;                              // 更新TD欄位內容
            } 

            // console.log('shLocalDept_inf 2',shLocalDept_inf);
            // 手動觸發 change 事件
            // checkbox.dispatchEvent(new Event('change'));

            edit_modal.hide();  // 關閉modal
            $("body").mLoading("hide");

        }

        // 添加新的監聽器
        submitEdit1_btn.addEventListener('click', submitEdit1ClickListener);      // 將每一個tdItem增加監聽, 當按下click
    }


        // 驅動搜尋部門代號下的員工； fun = 功能, fromId = 查詢來源ID；from maintainDept_modal裡[搜尋]鈕的呼叫...
        async function load_deptStaff(fun, fromId){
            mloading(); 
            const from = document.getElementById(fromId);       // 定義來源id
            const searchkeyWord = (from.value).trim();          // search keyword取自from欄位
            console.log('searchkeyWord =>', searchkeyWord);
            await load_fun(fun, searchkeyWord, postResultTo_maintainDeptTable);
        }

        // 將 部門代號下的員工 搜尋結果渲染到maintainDept_modal裡的table；from maintainDept function load_deptStaff()
        async function postResultTo_maintainDeptTable(res_r, inArr){
            return new Promise((resolve) => {
                mloading(); 
                inArr = inArr ?? [];
                // console.log('res_r...', res_r);
                // release_dataTable('maintainDept_table');
                // daptStaff_length.insertAdjacentHTML('beforeend', `取得 ${res_r.length} 人`);
                daptStaffLength.innerHTML = `取得人數：${res_r.length} 人`;

                // 定義表格table
                const div_result_table = document.getElementById('maintainDept_table');
                    // 鋪設表格thead
                    const Rinner = `<thead>
                                    <tr>
                                        <th>廠區</th>
                                        <th>工號</th>
                                        <th>姓名</th>
                                        <th>職稱</th>
                                        <th>部門代號</th>
                                        <th>部門名稱</th>
                                        <th class"import" id="select_deptStaff"><i class="fa-regular fa-square-check"></i>&nbsp;select</th>
                                    </tr>
                                </thead>
                                <tbody id='result_tbody'></tbody>`;
                    div_result_table.innerHTML = Rinner;
                // 定義表格中段tbody
                const div_result_tbody = document.getElementById('result_tbody');
                    div_result_tbody.innerHTML = '';
                    // 鋪設表格tbaoy
                    res_r.forEach((empt) => {
                        div_result_tbody.innerHTML += 
                            `<tr>
                                <td class="text-center">${empt.emp_sub_scope ?? ''}</td>
                                <td class="text-center">${empt.emp_id}</td>
                                <td class="text-center ${inArr.includes(empt.emp_id) ? 'alert_it':''}">${empt.cname}${inArr.includes(empt.emp_id) ? ' (轉入)':''}</td>
                                <td class="text-center">${empt.cstext ?? ''}</td>
                                <td class="text-center">${empt.dept_no ?? ''}</td>
                                <td class="text-center">${empt.emp_dept ?? ''}</td>
                                <td class="text-center">
                                    <input type="checkbox" class="form-check-input" name="deptStaff[]" id="${empt.emp_id}" value="${empt.emp_id},${empt.cname}" >
                                </td>
                            </tr>`;
                    })
                
                // 防止空值被帶入shLocalDept_inf
                    const selectDeptStaff_btn = document.querySelector('#maintainDept #select_deptStaff');     //  定義出[全選]範圍
                    const submitDeptStaff_btn = document.querySelector('#maintainDept #submitDeptStaff');      //  定義出[代入]範圍
                    if(res_r.length > 0 && userInfo.role <= 2) {
                        // 有2個監聽
                        reload_selectDeptStaff_Listeners();   // 呼叫監聽[select]全選功能...
                        reload_submitDeptStaff_Listeners();   // 呼叫監聽[代入]鈕功能

                    } else {
                        // 檢查並移除已經存在的監聽器
                        if (selectDeptStaffClickListener) {
                            selectDeptStaff_btn.removeEventListener('click', selectDeptStaffClickListener);   // 將每一個tdItem移除監聽, 當按下click
                        }
                        // 檢查並移除已經存在的監聽器
                        if (submitDeptStaffClickListener) {
                            submitDeptStaff_btn.removeEventListener('click', submitDeptStaffClickListener);   // 將每一個tdItem移除監聽, 當按下click
                        }   
                    }
                    submitDeptStaff_btn.disabled = (res_r.length == 0 || userInfo.role > 2);
                    submitDeptStaff_btn.classList.toggle('unblock', res_r.length == 0 || userInfo.role > 2);
                    
                // reload_dataTable('maintainDept_table');

                $("body").mLoading("hide");                                 // 關閉mLoading
                // 當所有設置完成後，resolve Promise
                resolve();
            });
        }
        // 清除MaintainDept；from maintainDept_modal裡[清除]鈕的呼叫
        function resetMaintainDept(){
            // let fromInput = document.querySelector('#maintainDept #searchkeyWord');          // 定義輸入來源id
                // fromInput.value = '';
            const resultInfo = document.querySelector('#maintainDept #result_info');       // 定義modal表頭info id
                resultInfo.innerHTML = '';
            const div_result_table = document.querySelector('#maintainDept #maintainDept_table'); // 定義table
                div_result_table.innerHTML = '';

            const submitDeptStaff_btn = document.querySelector('#maintainDept #submitDeptStaff');      //  定義出[代入]範圍
                submitDeptStaff_btn.disabled = true;
                submitDeptStaff_btn.classList.toggle('unblock', true);
        }
        // (MaintainDept非主要功能)綁定select_deptStaff_btns事件監聽器 => head上的select全選btn
        let selectDeptStaffClickListener;
        async function reload_selectDeptStaff_Listeners() {
                const selectDeptStaff_btn = document.querySelector('#maintainDept #select_deptStaff');      //  定義出範圍
                // 檢查並移除已經存在的監聽器
                if (selectDeptStaffClickListener) {
                    selectDeptStaff_btn.removeEventListener('click', selectDeptStaffClickListener);   // 將每一個tdItem移除監聽, 當按下click
                }
                // 定義新的監聽器函數
                selectDeptStaffClickListener = async function () {
                    const target_staff_cbs = document.querySelectorAll(`#maintainDept #result_tbody input[name="deptStaff[]"]`);
                    // 檢查第一個 checkbox 是否被選中，然後根據它的狀態全選或全部取消
                    let allChecked = Array.from(target_staff_cbs).every(checkbox => checkbox.checked);
                    target_staff_cbs.forEach(checkbox => {
                        checkbox.checked = !allChecked; // 如果 allChecked 為 true，則取消選擇，否則全選
                        // 手動觸發 change 事件
                        // checkbox.dispatchEvent(new Event('change'));
                    });
                }
    
                // 添加新的監聽器
                selectDeptStaff_btn.addEventListener('click', selectDeptStaffClickListener);      // 將每一個tdItem增加監聽, 當按下click
        }
    
    // 241121 在p2table上建立baseInCare監聽功能 for 開啟MaintainDept編輯deptStaff名單...未完
    let baseInCareClickListener;
    async function reload_baseInCareTD_Listeners() {
        return new Promise((resolve) => {
            const baseInCare = document.querySelectorAll('#hrdb_table td[id*="base,"] ,#hrdb_table td[id*="inCare,"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (baseInCareClickListener) {
                baseInCare.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                    tdItem.removeEventListener('click', baseInCareClickListener);   // 將每一個tdItem移除監聽, 當按下click
                })
            }
                // 整理陣列成我要的格式2....
                function reworkArr(dataIn){
                    return new Promise((resolve) => {
                        let rework_arr = [];
                        dataIn.forEach((emp_i) => {
                            const this_arr = emp_i.split(',')       // 分割this.id成陣列
                            const this_emp_id = this_arr[0];        // 取出陣列 0 = emp_id
                            const this_cname  = this_arr[1];        // 取出陣列 1 = cname
                                // rework_arr.push({                // 傳統陣列...
                                //         'cname'     : this_cname,
                                //         'emp_id'    : this_emp_id
                                //     })
                            let obj = {};                           // 陣列包物件
                            obj[this_emp_id] = this_cname;
                            rework_arr.push(obj);
                        })
                        const rework_str = JSON.stringify(rework_arr).replace(/[\[\]]/g, '');       // 部門代號加工+去除[]符號

                        resolve(rework_str);
                    });
                }
                // 反解:把混和陣列包物件，轉換成一般陣列..
                function decode_Obj(_obj){
                    let newArr = [];
                    _obj.forEach((obj_i) => {
                        for(const [emp_id , cname] of Object.entries(obj_i)){
                            newArr.push({
                                'emp_id' : emp_id,
                                'cname'  : cname
                            })
                        }
                    })
                    // console.log('newArr', newArr);
                    return newArr;
                }
                // 單獨取出特檢員工的empId
                function getEmpId_Arr(_obj){
                    let newArr = [];
                    _obj.forEach((obj_i) => {
                        for(const [emp_id , cname] of Object.entries(obj_i)){
                            newArr.push(emp_id)
                        }
                    })
                    // console.log('newArr', newArr);
                    return newArr;
                }


            // 定義新的監聽器函數
            baseInCareClickListener = async function () {
                // console.log("click this =>", this.id);
                // step.1 標題列顯示姓名工號
                const thisId_arr = this.id.split(',')                 // 分割this.id成陣列
                const thisTD     = thisId_arr[0];                     // 取出陣列0=target
                const thisDeptNO = thisId_arr[1];                     // 取出陣列1=部門代號
                const thisMonth  = thisId_arr[2];                     // 取出陣列2=目標月份
                // 在maintainDept input上帶入部門代號
                let fromInput = document.querySelector('#maintainDept #searchkeyWord'); // 定義搜尋input欄
                fromInput.value = thisDeptNO;                                           // 賦予內容值
                let submitDeptStaff_btn = document.getElementById('submitDeptStaff');   // 定義出submitDeptStaff_btn範圍
                submitDeptStaff_btn.value = `${thisDeptNO},${thisMonth}`;               // 賦予內容值

                // 撈出該部門資料
                const deptData = shLocalDept_inf.find(dept => dept.OSHORT === thisDeptNO);

                if(deptData){
                    const { targetMonth, baseAll_arr, getOut_arr, getIn_arr, inCare_arr } = reworkBaseInCare(deptData, thisMonth);  // 取得部門全部員工 + 取得特檢員工

                    const dec_baseAll_arr = decode_Obj(baseAll_arr);                            // 將部門全部員工obj轉換成正常的arr
                    const getInEmpID_arr = getEmpId_Arr(getIn_arr);                             // 單獨取出轉入員工的empId
                    await postResultTo_maintainDeptTable(dec_baseAll_arr, getInEmpID_arr);      // 將正常arr的部門全部員工清單交給postResultTo_maintainDeptTable進行鋪設
                    
                    const get_inCareEmpID_arr = getEmpId_Arr(inCare_arr);                       // 單獨取出特檢員工的empId
                    toCheckedOpt(get_inCareEmpID_arr , targetMonth);                            // 將table裡的特檢員工選上[打勾]

                }else{
                    console.log('無deptData...套用新[]')
                }

                maintainDept_modal.show()

                // // step.3 顯示互動視窗
                // edit_modal.show();                               // 顯示互動視窗
                // $("body").mLoading("hide");
            }

            // 添加新的監聽器
            baseInCare.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                tdItem.addEventListener('click', baseInCareClickListener);      // 將每一個tdItem增加監聽, 當按下click
            })

            resolve();
        });
    }
    // 250416 改變BaseInCare class吃css的狀態；主要是主管以上不需要底色編輯提示
    function changBaseInCareTDmode(){
        console.log('changBaseInCareTDmode...')
        // const isBaseInCare = userInfo.role <= 2;
        // const targetTD = document.querySelectorAll(isBaseInCare ? '.import' : '.ximport');  
        const targetTD = document.querySelectorAll('.import');  
        targetTD.forEach(tdItem => {
            tdItem.classList.toggle('import');
            // tdItem.classList.toggle(isimport ? 'import'  : 'ximport');
            // tdItem.classList.toggle(isimport ? 'ximport' : 'import');
        });
    }
    // 定義[代入]鈕功能~~；from maintainDept_modal裡[代入]鈕的呼叫...
    let submitDeptStaffClickListener;
    async function reload_submitDeptStaff_Listeners() {
        const submitDeptStaff_btn = document.querySelector('#maintainDept #submitDeptStaff');      //  定義出範圍
        // 檢查並移除已經存在的監聽器
        if (submitDeptStaffClickListener) {
            submitDeptStaff_btn.removeEventListener('click', submitDeptStaffClickListener);   // 將每一個tdItem移除監聽, 當按下click
        }   
            // 整理陣列成我要的格式1....顯示用
            function reworkArr(dataIn){
                return new Promise((resolve) => {
                    let rework_arr = [];
                    dataIn.forEach((emp_i) => {
                        const this_arr = emp_i.split(',')       // 分割this.id成陣列
                        const this_emp_id = this_arr[0];        // 取出陣列 0 = emp_id
                        const this_cname  = this_arr[1];        // 取出陣列 1 = cname
                            // rework_arr.push({                // 傳統陣列...
                            //         'cname'     : this_cname,
                            //         'emp_id'    : this_emp_id
                            //     })
                        let obj = {};                           // 陣列包物件
                        obj[this_emp_id] = this_cname;
                        rework_arr.push(obj);
                    })
                    // const rework_str = JSON.stringify(rework_arr).replace(/[\[\]]/g, '');       // 部門代號加工+去除[]符號
                    // console.log(rework_arr);
                    // resolve(rework_str);
                    resolve(rework_arr);
                });
            }
        // 定義新的監聽器函數
        submitDeptStaffClickListener = async function () {
            mloading(); 

            const deptStaff_opts_arr = Array.from(document.querySelectorAll(`#maintainDept #result_tbody input[name="deptStaff[]"]`));
            const table_baseAll_arr = deptStaff_opts_arr.map(cb => cb.value);                          // 取得所有員工名單(all...from table上所有名單)
            const table_inCare_arr  = deptStaff_opts_arr.filter(cb => cb.checked).map(cb => cb.value); // 取得已選員工名單(特檢多選)
            // 把取得的數據送去reworkArr整理...
            const reworkTableBaseAll_arr = await reworkArr(table_baseAll_arr);     // 將table上bassAll整理成我要的格式
            const reworkTableInCare_arr  = await reworkArr(table_inCare_arr);      // 將table上inCare整理成我要的格式
                // console.log('reworkTableBaseAll_arr...',reworkTableBaseAll_arr);

            // const { currentYearMonth } = getCurrentAndLastMonth();                          // 執行函式--取得年月
            // const fromInput = document.querySelector('#maintainDept #searchkeyWord');       // 定義來源id
            // const targetDeptNo = fromInput.value;                                           // 取得formInput = 部門代號
            const thisValue_arr = this.value.split(',')                 // 分割this.id成陣列
            const targetDeptNo  = thisValue_arr[0];                     // 取出陣列0=部門代號
            const thisMonth     = thisValue_arr[1];                     // 取出陣列1=目標月份
            const { lastYearMonth } = getCurrentAndLastMonth(thisMonth) // 取得上個月的年月...

            let deptData = shLocalDept_inf.find(dept => dept.OSHORT === targetDeptNo);          // 自shLocalDept_inf找出對應的部門
                // console.log('shLocalDept_inf 1',shLocalDept_inf);
            if(deptData){
                deptData.base = deptData.base ?? [];
                const { baseAll_arr }  = reworkBaseInCare(deptData, lastYearMonth);                 // 取得上個月dept部門在紀錄裡的全部員工
                const { differenceOut, differenceIn, differenceKeepGoing } = getDifferencesAndKeys(reworkTableBaseAll_arr, baseAll_arr); // (arr1=本月名單, arr2=上月名單)

                deptData.base[thisMonth] = {
                        'getOut'    : differenceOut       ?? [],
                        'getIn'     : differenceIn        ?? [],
                        'keepGoing' : differenceKeepGoing ?? (reworkTableBaseAll_arr ?? [])
                    }
                
                deptData.inCare = deptData.inCare  ?? {};
                deptData.inCare[thisMonth] = reworkTableInCare_arr;

            } else {
                
                const bomNewDeptArr = await bomNewDept(targetDeptNo, _dept_inf);                // step-6. 生成dept預設值
                shLocalDept_inf = [...shLocalDept_inf, ...bomNewDeptArr];                       // step-6. 合併bomNewDeptArr

            }
            // console.log('shLocalDept_inf 2',shLocalDept_inf);
            post_hrdb(shLocalDept_inf, thisMonth); // 鋪設

            // const target_staff_cbs = document.querySelectorAll(`#maintainDept #result_tbody input[name="deptStaff[]"]`);
            // // 檢查第一個 checkbox 是否被選中，然後根據它的狀態全選或全部取消
            // let allChecked = Array.from(target_staff_cbs).every(checkbox => checkbox.checked);
            // target_staff_cbs.forEach(checkbox => {
            //     checkbox.checked = !allChecked; // 如果 allChecked 為 true，則取消選擇，否則全選
            //     // 手動觸發 change 事件
            //     // checkbox.dispatchEvent(new Event('change'));
            // });

            resetMaintainDept();        // 清除
            maintainDept_modal.hide();  // 關閉modal
            $("body").mLoading("hide");

        }

        // 添加新的監聽器
        submitDeptStaff_btn.addEventListener('click', submitDeptStaffClickListener);      // 將每一個tdItem增加監聽, 當按下click
    }
        // 套用特殊健檢名單[textArea]
        async function loadInCare(request){
            const loadInCare_div = document.getElementById('loadInCare_div');
            loadInCare_div.classList.toggle('show');
            if(request){
                const loadInCare = document.getElementById('loadInCare');
                let thisValue = loadInCare.value.replace(/\n/g, ',');
                // const thisArr = thisValue.split(',').filter(item => item !== "");           // 分割this.id成陣列
                const thisArr = thisValue.split(',').filter(item => {
                    return item.length === 8 && /^\d+$/.test(item);
                });
                console.log('thisValue...',thisArr)

                if(thisArr.length > 0){
                    let thisInfo = `帶入套用：${thisArr.length} 人`;
                    console.log('thisInfo...', thisInfo);
                    toCheckedOpt(thisArr ,thisInfo )
                }
            }
        }
        // 把特作名單給選上、套用月份資料...給arr名單，就打勾
        function toCheckedOpt(_arr , result_title){
            if(_arr){
                const target_staff_cbs = document.querySelectorAll(`#maintainDept #result_tbody input[name="deptStaff[]"]`);
                target_staff_cbs.forEach(input => {
                    if (_arr.includes(input.id)) {
                        input.checked = true;
                    }
                });
            }

            if(result_title){
                const resultInfo = document.querySelector('#maintainDept #result_info');       // 定義modal表頭info id
                resultInfo.innerHTML = result_title;
            }
        }

// // phase 1 -- 生成按鈕
    // [p1 函數-2] 動態生成所有按鈕，並重新綁定事件監聽器
    function mk_deptNos_btn(docDeptNo) {
        return new Promise((resolve) => {
            _docs_inf = docDeptNo;      // 套取docs
            console.log('docDeptNo =>',docDeptNo);
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
                                    <div class="card-header"><button type="button" name="scope[]" value="${emp_sub_scope}" class="add_btn">${emp_sub_scope}</button></div>
                                    <div class="card-body p-2">
                                        ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                            `<div class="form-check pl-5">
                                                <input type="checkbox" name="subScope[]" id="${o_value.flag ? 'cb' : 'cc'},${emp_sub_scope},${o_key},${o_value.OSTEXT}" value="${o_key}" class="form-check-input" ${o_value.flag ? '' : 'disabled'}>
                                                <button type="button" name="deptNo[]" id="${emp_sub_scope},${o_key},${o_value.OSTEXT}" value="${o_key}" class="btn ${o_value.flag ? 'btn-info add_btn' : 'btn-secondary'} my-1" style="width: 100%; text-align: start;" `
                                                + ` >${o_key}&nbsp;${o_value.OSTEXT}</button>
                                            </div>`
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

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    // p2 生成年月篩選項目...
    function mk_selectOpt_ym(objKeys_ym, dateString){
        const _yearMonthSelt = document.getElementById("_yearMonth");
        if(_yearMonthSelt){
            _yearMonthSelt.innerHTML = ``;
            const get_ym = getCurrentAndLastMonth();                // 取得近4個月的值 (上2+今1+下1)
                for(const [key, value] of Object.entries(get_ym)){  // 將4個月的值取出
                    objKeys_ym.push(value);                         // 並集中彙整
                }
            let uniqueArr =  [...new Set(objKeys_ym)];              // 年月去重
                uniqueArr.sort(function(a, b) {                     // 使用 sort() 方法進行排序，由大到小
                    return b - a;                                   // b - a 使得較大的數字排在前面
                });
            for(const [key, value] of Object.entries(uniqueArr)){
                const selt = (key === 'currentYearMonth' || value === dateString ) ? 'selected':''; 
                const selectOpt =`<option for="_yearMonth" value="${value}" ${selt} >${value}</option>`;
                _yearMonthSelt.insertAdjacentHTML('beforeend', selectOpt);
            }
        }
        // if(dateString != undefined){
        //     SubmitForReview_btn.value = dateString;     // 把[帶入維護]鈕 給上 年月字串值
        // }
    }

            // [p1 函數-2] 241213 將送審的百分比改成送審中
            async function filtApprove(_docs) {
                const reviewStep = await load_fun('reviewStep', 'return');     // 呼叫通用函數load_fun+ p1 函數-2 生成btn
                const _step = reviewStep.step;
        
                for (const _doc of _docs) {
                            // console.log('_doc =>',_doc);
                    for (const [emp_sub_scope, dept_no_value] of Object.entries(_doc)) {
                        for (const [dept_no, value] of Object.entries(dept_no_value)) {
                                    // console.log(dept_no,' => value:',value);
                            const deptNo_sups = document.querySelectorAll(`#deptNo_opts_inside button[id="${emp_sub_scope},${dept_no}"] sup[name="sup_${dept_no}[]"]`);
                            const innerHTMLValue = (value.idty == 2) ? "退回編輯" : _step[value.idty].approvalStep;
                            // 更新所有符合條件的節點的 innerHTML
                            deptNo_sups.forEach(node => { node.innerHTML = `(${value.idty}-${innerHTMLValue})`; });
        
                            // 決定開啟的權限
                            const doc_Role_bool = !( 
                                    (userInfo.role <= 1) ||                  // 大PM.1 => 全開
                                    // (dept_no == userInfo.signCode) ||     // 同部門 ??    
                                    // (value.BTRTL == userInfo.BTRTL) ||    // 同建物 = 廠護理師.2 /廠工安.2.5
                                    ((userInfo.role == 2 || userInfo.role == 2.2 || userInfo.role == 2.5) && (userInfo.BTRTL.includes(value.BTRTL))) ||  // (廠護理師.2 || 廠工安.2.5) & 同建物
                                    (value.in_sign == userInfo.empId) ||     // 待簽人員 = 上層主管 /轉呈
                                    (value.omager  == userInfo.empId)        // 部門主管 = 自己
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
                                    deptNo_btn.classList.add('btn-primary');
                                    
                                } else if (value.idty == 10) {
                                    deptNo_btn.classList.remove('btn-info');
                                    deptNo_btn.classList.add('btn-outline-secondary');
                                }
                                // 點擊編輯權限
                                deptNo_btn.disabled = doc_Role_bool;
                            });
        
                            const subScopes_opts_arr = Array.from(document.querySelectorAll(`#deptNo_opts_inside input[id*="cb,${emp_sub_scope},${dept_no}"]`));
                            // 點擊閱讀權限
                            subScopes_opts_arr.forEach(subScope_opt => subScope_opt.disabled = doc_Role_bool );
                            // deptNo_btns.forEach(deptNo_btn => {
                            // })
                        }
                    }
                }
                // 名單總匯整_btn
                if(userInfo.role <= 2.2) {
                    const load_subScopes_btn = document.getElementById('load_subScopes_btn');
                    load_subScopes_btn.classList.remove('unblock');
                    // SubmitForReview_btn.classList.remove('unblock');
                } 
            }

    // [p1 函數-1] 取得危害地圖...並callBack mk_deptNos_btn進行鋪設
    async function p1_init() {
        postBanner('changeStep', 1, 4, 'pic-3-2.png');
        await load_fun('load_shLocal_OSHORTs', 'load_shLocal_OSHORTs', mk_deptNos_btn);
    }
    // [p1 函數-3] 設置p1事件監聽器和
    async function p1_eventListener() {
        return new Promise((resolve) => {
            // step-p1-1. 綁定deptNo_opts事件監聽器(單選)
                const deptNo_btns = document.querySelectorAll('#deptNo_opts_inside button[name="deptNo[]"]');
                deptNo_btns.forEach(deptNo_btn => {
                    deptNo_btn.addEventListener('click', async function() {
                        const thisValue   = '"'+this.value+'"';       // 取得部門代號並加工(單選)
                                // console.log('單選 thisValue =>', thisValue)
                                // console.log('單選 thisID =>', this.id)
                                
                            daptStaffLength.innerHTML = '';                 // 清除取得人數提示
                            if(this.id){
                                deptInfo.innerHTML = this.id;               // 標題鋪設id值
                            }
                            let fromInput = document.querySelector('#maintainDept #searchkeyWord');     // 定義maintainDept搜尋input欄
                            fromInput.value = this.value;                                           // 賦予內容值

                        // 工作一 清空暫存
                            await resetINF(true); // 清空

                        // 工作二 把this.id推進去部門資訊arr 
                            _dept_inf.push(this.id);                        // 推入部門資訊arr     
                                console.log('單選_dept_inf...',_dept_inf)
                        // 工作三 從 thisValue(加工後的部門代號)中取出對應的廠區/部門代號資料
                            // await load_fun('load_shLocalDepts', thisValue, post_hrdb);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                            const defaultDept_inf = await preCheckDeptData(thisValue, _dept_inf);
                            post_hrdb(defaultDept_inf);                                                                 // step-8. 送出進行渲染

                            P2SubmitForReview_btn.disabled = defaultDept_inf.length === 0;
                        //     await mk_form_btn(reviewRole);        // 建立簽核按鈕
                        //     await post_reviewInfo(_doc_inf);      // 鋪設表頭訊息及待簽人員
                        //     await post_logs(_doc_inf.logs);       // 鋪設文件歷程
                        //     await reload_dataTable();             // 呼叫dataTable                        

                        $('#nav-p2-tab').tab('show');
                    });
                });

            // step-p1-A1. 綁定load_subScopes_btn[提取勾選部門]進行撈取員工資料(多選)
                const load_subScopes_btn = document.getElementById('load_subScopes_btn');
                load_subScopes_btn.addEventListener('click', async function() {
                    const selectedValues = subScopes_opts_arr.filter(cb => cb.checked).map(cb => cb.value); // 取得所選的部門代號(多選)
                    const selectedValues_str = JSON.stringify(selectedValues).replace(/[\[\]]/g, '');       // 部門代號加工(多選)
                    const selectedIDs = subScopes_opts_arr.filter(cb => cb.checked).map(cb => cb.id).map(value => value.replace(/cb,/g, '')); // 取得所選的部門代號(多選) ** 特別要去除cb,
                            console.log('多選 selectedValues_str =>', selectedValues_str)
                            console.log('多選 selectedIDs =>', selectedIDs)

                    // 工作一 清空暫存
                        await resetINF(true);               // 清空
                    // 工作二 把this.id合併進去部門資訊arr 
                        _dept_inf = [..._dept_inf, ...selectedIDs];                        // 合併入部門資訊arr    
                            console.log('多選_dept_inf...',_dept_inf)
                    // 工作二 從 thisValue(加工後的部門代號)中取出對應的廠區/部門代號資料
                        // await load_fun('load_shLocalDepts', selectedValues_str, post_hrdb);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                    const defaultDept_inf = await preCheckDeptData(selectedValues_str, _dept_inf);
                    post_hrdb(defaultDept_inf);                                                                 // step-8. 送出進行渲染

                    // await reload_dataTable();
                    // $('logsInfo').empty();
                    // console.log('staff_inf...', staff_inf);

                    $('#nav-p2-tab').tab('show');
                })

            // step-p1-A2. (非主要功能)綁定scope_btns事件監聽器 => card head上的全選btn
                const scope_btns = document.querySelectorAll('#deptNo_opts_inside button[name="scope[]"]');
                scope_btns.forEach(scope_btn => {
                    scope_btn.addEventListener('click', async function() {
                        const target_scope_cbs = document.querySelectorAll(`#deptNo_opts_inside input[id*="cb,${this.value},"]`);
                        // 檢查第一個 checkbox 是否被選中，然後根據它的狀態全選或全部取消
                        let allChecked = Array.from(target_scope_cbs).every(checkbox => checkbox.checked);
                        target_scope_cbs.forEach(checkbox => {
                            checkbox.checked = !allChecked; // 如果 allChecked 為 true，則取消選擇，否則全選
                            // 手動觸發 change 事件
                            checkbox.dispatchEvent(new Event('change'));
                        });
                    });
                });

            // step-p1-A3. (非主要功能)驗證提醒監聽 => for [提取勾選部門]驗證提醒
                const subScopes_opts_arr = Array.from(document.querySelectorAll('#deptNo_opts_inside input[id*="cb,"]'));
                subScopes_opts_arr.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        const selectedOptsValues = subScopes_opts_arr.filter(cb => cb.checked).map(cb => cb.value);
                        // 更新驗證標籤
                        load_subScopes_btn.classList.toggle('is-invalid', selectedOptsValues.length === 0);
                        load_subScopes_btn.classList.toggle('is-valid',   selectedOptsValues.length > 0);
                        load_subScopes_btn.disabled = selectedOptsValues.length === 0;

                        SubmitForReview_btn.classList.toggle('is-invalid', selectedOptsValues.length === 0);
                        SubmitForReview_btn.classList.toggle('is-valid',   selectedOptsValues.length > 0);
                        SubmitForReview_btn.disabled = selectedOptsValues.length === 0;
                    });
                });

            // step-p1-A4. 綁定selectAll_subScopes_btn事件監聽器(全選)
                const selectAll_subScopes_btn = document.getElementById('selectAll_subScopes_btn');
                selectAll_subScopes_btn.addEventListener('click', async function() {
                    const target_scope_cbs = document.querySelectorAll(`#deptNo_opts_inside input[id*="cb,"]`);
                    // 檢查第一個 checkbox 是否被選中，然後根據它的狀態全選或全部取消
                    let allChecked = Array.from(target_scope_cbs).every(checkbox => checkbox.checked);
                    target_scope_cbs.forEach(checkbox => {
                        checkbox.checked = !allChecked; // 如果 allChecked 為 true，則取消選擇，否則全選
                        // 手動觸發 change 事件
                        checkbox.dispatchEvent(new Event('change'));
                    });
                });

            // step-p1-A5. 綁定load_subScopes_btn[提取勾選部門]進行撈取員工資料(多選)
                SubmitForReview_btn.addEventListener('click', async function() {
                    const selectedValues = subScopes_opts_arr.filter(cb => cb.checked).map(cb => cb.value); // 取得所選的部門代號(多選)
                    const selectedValues_str = JSON.stringify(selectedValues).replace(/[\[\]]/g, '');       // 部門代號加工(多選)
                    const selectedIDs = subScopes_opts_arr.filter(cb => cb.checked).map(cb => cb.id).map(value => value.replace(/cb,/g, '')); // 取得所選的部門代號(多選) ** 特別要去除cb,

                    // 工作一 清空暫存
                    await resetINF(true);               // 清空
                    // 工作二 把this.id合併進去部門資訊arr 
                        _dept_inf = [..._dept_inf, ...selectedIDs];                        // 合併入部門資訊arr    
                        // console.log('P1-3-1.多選selectedValues_str...',selectedValues_str)
                        // console.log('P1-3-2.多選_dept_inf...',_dept_inf)

                    // 取得P1的年份篩選
                    const _yearDiv = document.getElementById('_year');
                    const _year = _yearDiv.value;
                            // console.log('P1-3-3.多選_year...',_year)
                    
                    // 工作二 從 thisValue(加工後的部門代號)中取出對應的廠區/部門代號資料
                    const defaultDept_in = await preCheckDeptData(selectedValues_str, _dept_inf);
                            console.log('defaultDept_in ==',defaultDept_in)
                    preProcess_staff(defaultDept_in, _year)

                    $('#nav-p3-tab').tab('show');
                })

            // step-p2-A1. 綁定load_subScopes_btn[提取勾選部門]進行撈取員工資料(p2單選)
                P2SubmitForReview_btn.addEventListener('click', async function() {
                    // // 工作一 清空暫存
                    // await resetINF(true);               // 清空

                    const _dept_i_arr = _dept_inf[0].split(',')
                    const thisValue = _dept_i_arr[1];
                    const selectedValues_str = JSON.stringify(thisValue).replace(/[\[\]]/g, '');       // 部門代號加工(單選)
                            // console.log('P2-3-1.selectedValues_str...', selectedValues_str)
                    // 工作二 把this.id合併進去部門資訊arr 
                        // _dept_inf = [..._dept_inf, ...selectedIDs];                        // 合併入部門資訊arr    
                            // console.log('P2-3-2.單選_dept_inf...',_dept_inf)
                            
                    // 取得p2年月篩選
                    const _yearMonth = document.getElementById("_yearMonth");
                    const _yearMonthValue = _yearMonth.value;
                            // console.log('P2-3-3.單選_yearMonth...',_yearMonthValue)

                    // 工作二 從 thisValue(加工後的部門代號)中取出對應的廠區/部門代號資料
                    const defaultDept_in = await preCheckDeptData(selectedValues_str, _dept_inf);
                            console.log('defaultDept_in ==',defaultDept_in)
                    preProcess_staff(defaultDept_in, _yearMonthValue)

                    $('#nav-p3-tab').tab('show');
                })
                
            resolve();      // 當所有設置完成後，resolve Promise
        });
    }

                    // 未採用 -- 製造泡泡標籤 formArr = 功號陣列, toBadge = 鋪在哪裡?, method = true(add)/false(remove)
                    async function mk_Badge(formArr, toBadge, method){
                        return new Promise((resolve) => {
    
                            formArr.forEach((emp_id) => {
                                let bobb = method ? `<span class="add" value="${emp_id}">+</span>` : `<span class="remove" value="${emp_id}">x</span>`;
                                $('#'+toBadge+'_Badge').append(`<div class="tag">${emp_id}${bobb}</div>`);
                            })
                            if(method){
                                $('#'+toBadge+'_Badge').on('click', '.add', function() {
                                    console.log('this', this)
                                    $('#inCare_Badge').append(`<div class="tag">${this.value}<span class="remove" value="${this.value}">x</span></div>`);
                                })
                            }
                            $('#'+toBadge+'_Badge').on('click', '.remove', function() {
                                console.log('this', this)
                                $(this).closest('.tag').remove();                         // 自畫面中移除
                            })
    
                            resolve();      // 當所有設置完成後，resolve Promise
                        });
                    }

    // [p2 函數-3] 設置事件監聽器for Excel上傳下載
    async function excel_eventListener() {
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
                        const excelJsonValueArr = JSON.parse(excel_json.value);
                        // console.log('excel_json.value...', excel_json.value)

                        // 250203 在匯入的時候就直接補上對應欄位資料
                        // await rework_omager(excelJsonValueArr);
                        // 250210 匯入時補上建物編號...
                        // await rework_BTRTL(excelJsonValueArr);
                        
                        // rework_loadStaff(excelJsonValueArr)      // 呼叫[fun] rework_loadStaff() 這個會呼叫hrdb更新資料
                        // await mgInto_staff_inf(excelJsonValueArr)         // 呼叫[fun] 
                        // *** 240911 這裡要套入function searchWorkCase( OSHORT, HE_CATE_str ) 從Excel匯入時，自動篩選合適對應的特作項目，並崁入...doing
                        // searchWorkCaseAll(excelJsonValueArr);
                        processImportExcel(excelJsonValueArr);

                        inside_toast(`批次匯入Excel資料...Done&nbsp;!!`, 1000, 'info');

                    } else if(stopUpload) {
                        console.log('請確認資料是否正確');
                    }else{
                        console.log('找不到 ? 元素');
                    }
                    
                    $("body").mLoading("hide");
                });

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }


// [default fun]
    $(async function() {
        await p1_init();
        await p1_eventListener();                     // 呼叫函數-3 建立監聽
        await excel_eventListener();

        // let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        // let message  = `<b>STEP 1.名單建立(匯入Excel、建立名單)：</b>總窗護理師  <b>2.工作維護(勾選特危、填暴露時數)：</b>課副理,護理師,ESH工安  <b>3.名單送審(100%的名單按下送審)：</b>課副理,護理師</br><b>4.簽核審查(簽核主管可微調暴露時數)：</b>上層主管,課副理,護理師  <b>5.收單review(檢查名單及特檢資料是否完備)：</b>ESH工安,護理師  <b>6.名單總匯整(輸出健檢名單)：</b>總窗護理師`;
        let message  = `userInfo.signCode：${userInfo.signCode}、.role：${userInfo.role}、.BTRTL：${userInfo.BTRTL}`;
        if(message) {
            // Balert( message, 'warning')
            document.getElementById(`debug`).insertAdjacentHTML('beforeend', message);     // 渲染各項目 到 footer
        }

        // p1. [通用]在任何地方啟用工具提示框
        $('[data-toggle="tooltip"]').tooltip();
    
        $("body").mLoading("hide");

    });
