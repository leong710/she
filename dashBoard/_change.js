    // from dashBoard fun drawEchart2()-step.2 從step1整理出inCare在指定年份的名單::
    // step.2.1 預先處理員工資料
    async function preProcess_staff(shLocalDept_in, _yearValue){
        // console.log('2.1a.shLocalDept_in...' ,shLocalDept_in)
        // s.2.1.0 陣列初始化
        let empIDKeys         = [];                         // 收集所有指定年度的inCare工號
        let mergedData        = [];                         // 存放員工合併訊息，for preCheckStaffData時參考套用訊息
        

        // s.2.1.1 把變更部門清單繞出來，取得員工ID清單empIDKeys
        for(const[index, dept_i] of Object.entries(shLocalDept_in)){
            const inCare = dept_i["inCare"] ?? [];
            for(const[targetMonth_i, staff_i] of Object.entries(inCare)){
                // 250313 篩選年分功能
                if(targetMonth_i.includes(_yearValue)){
                    staff_i.forEach((staff) => {
                        // step.1 取得所有的 key = emp_id
                            empIDKeys = [...empIDKeys , Object.keys(staff)[0]];
                        // step.2 合併鍵和值
                            let key = Object.keys(staff)[0];        // 獲取鍵
                            let value = staff[key];               // 獲取相應的值
                            mergedData.push(`${key},${value},${dept_i["OSTEXT_30"]},${dept_i["OSHORT"]},${dept_i["OSTEXT"]},${targetMonth_i}`);
                    })
                }
            }
        }
        empIDKeys  = [...new Set(empIDKeys)]; 
        mergedData = [...new Set(mergedData)]; 
        
        // s.2.1.2 把員工ID清單empIDKeys進行處理，撈出IN empIDKeys的所有員工資料
        const empIDKeys_str = JSON.stringify(empIDKeys).replace(/[\[\]]/g, '');                 // 工號加工
        const staffData_result = await preCheckStaffData(empIDKeys_str, mergedData);        // 呼叫 fun-2 preCheckStaffData 檢查staff是否都有存在，不然就生成staff預設值
                // console.log('2.1.empIDKeys =>',  empIDKeys)
                // console.log('2.3.empIDKeys_str =>', empIDKeys_str)
                // console.log('2.2.mergedData =>', mergedData)
                // console.log('2.4.staffData_result =>', staffData_result)

        // s.2.1.3 陣列初始化 countData:統計用
        let countData = [];
        // s.2.1.4 將mergedData逐筆繞出來
        mergedData.map((emp_i) => {
            const emp_i_Arr        = emp_i.split(',');      // 分割staffStr成陣列
            const empI_emp_id      = emp_i_Arr[0] ?? '';    // 取出陣列 0 = 工號
            const empI_OSTEXT_30   = emp_i_Arr[2] ?? '';    // 取出陣列 2 = 廠別
            const empI_OSHORT      = emp_i_Arr[3] ?? '';    // 取出陣列 3 = 部門代號
            const empI_targetMonth = emp_i_Arr[5] ?? '';    // 取出陣列 5 = 作業年月
            // 找出該筆員工資料，並分類取出要項
            const staffData = staffData_result.find(staffData_i => staffData_i.emp_id === empI_emp_id);
            const { _changeLogs, _content, _todo } = staffData;
            const _cLogs      = _changeLogs?.[empI_targetMonth] ?? {};
            const _7isCheck   = _cLogs?.['_7isCheck'] ?? '';
            const _9checkDate = _cLogs?.['_9checkDate'] ?? '';
            const _cNotify    = _content?.[empI_targetMonth]?.['notify'] ?? [];
            // s.2.1.4a 陣列初始化 countData:統計用--廠區細項
            countData[empI_OSTEXT_30] = countData?.[empI_OSTEXT_30] ?? {'success':0, 'primary':0, 'warning':0, 'danger':0};
            // 計算條件 ((_7isCheck === true) && (_9checkDate === '' || _9checkDate === undefined) && (Object.entries(_todo).length !== 0))
            if((_7isCheck === true) && (_9checkDate === '' || _9checkDate === undefined) && (Object.entries(_todo).length !== 0)){
                // 有資格 & 未完成檢查 & todo進行中 ==> success || warning || danger
                const { dayDiff, bgClass } = getFirstNotification(_cNotify);      // 取得最早的第一筆通報時間至今的日期差 & 背景色
                if(bgClass.includes('warning')){
                    countData[empI_OSTEXT_30]['warning']++;
                }else if(bgClass.includes('danger')){
                    countData[empI_OSTEXT_30]['danger']++;
                }else{
                    countData[empI_OSTEXT_30]['success']++;
                }
            }else if((_7isCheck === true) && (_9checkDate !== '' || _9checkDate !== undefined) && (Object.entries(_todo).length === 0)){
                // 有資格 & 已完成檢查 & todo已完成 ==> primary
                countData[empI_OSTEXT_30]['primary']++;
            }
        })
        console.log('countData',countData)
        
        // s.2.1.5 陣列初始化 result: 畫圖用
        const result = {
            'fab_title' : [],
            'primary'   : [],
            'success'   : [],
            'warning'   : [],
            'danger'    : []
        };
        // s.2.1.5 將countData逐筆繞出來，帶入result以便畫圖
        for(const [fab_title , item] of Object.entries(countData)){
            result['fab_title'].push(fab_title);
            for(const [item_key , item_value] of Object.entries(item)){
                result[`${item_key}`].push(item_value);
            }
        }
        // console.log('2.5.result =>', result)
        
        return(result);
    }


    // fun-2 檢查load_fun('load_change') 是否都有存在，不然就生成staff預設值 :: call from step.2.1
    async function preCheckStaffData(empIDKeys_str, mergedData){
        if(empIDKeys_str == '') return(false);
            const load_change = await load_fun('load_change', empIDKeys_str, 'return');                     // step-1. 先從db撈現有的資料
            const existingStaffStrs = load_change.map(staff => staff.emp_id);                               // step-2. 提取load_change中所有的emp_id值
            let defaultStaff_inf = [];
            defaultStaff_inf = [...new Set([...defaultStaff_inf, ...load_change])];                         // step-2. 合併load_change+去重

            const selectStaffArr = empIDKeys_str.replace(/"/g, '').split(',')                               // step-3. 去除前後"符號..分割staffStr成陣列
            const notExistingStaffs = selectStaffArr.filter(emp_id => !existingStaffStrs.includes(emp_id)); // step-4. 找出不存在於load_shLocalDepts中的部門代號

            if(notExistingStaffs.length > 0) {
                const notExistingStaffs_str = JSON.stringify(notExistingStaffs).replace(/[\[\]]/g, '');     // step-5. 把不在的部門代號進行加工(多選)，去除外框
                const bomNewDeptArr = await bomNewStaff(notExistingStaffs_str, mergedData);                 // step-6. 呼叫fun-3 bomNewStaff 生成staff預設值
                defaultStaff_inf = [...new Set([...defaultStaff_inf, ...bomNewDeptArr])];                   // step-6. 合併bomNewDeptArr+去重
            }

        return(defaultStaff_inf);
        // post_hrdb(defaultStaff_inf);                                                                     // step-8. 送出進行渲染
    };
    // fun-3 當staff_inf沒有符合的員工時時...給他一個新的 :: call from fun-2
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
                        
                        empId = empId.replace(/"/g, '');                                     // 去除前後"符號..
                        const staffStr = mergedData.find(item => item.includes(empId));      // 從_dept_inf找出符合 empId 的原始字串
                        if(staffStr){
                            const staffArr = staffStr.split(',')                             // 分割staffStr成陣列
                            newStaffData["emp_id"] = staffArr[0] ?? '';                      // 取出陣列 0 = 工號
                            newStaffData["cname"]  = staffArr[1] ?? '';                      // 取出陣列 1 = 名稱
                            const targetMonth      = staffArr[5] ?? '';                      // 取出陣列 5 = 作業年月

                            newStaffData["_changeLogs"][targetMonth] = { 'OSHORT' : staffArr[3] ?? '' };
                            newStaffData["_content"][targetMonth]    = { 'notify' : [] };
                        }else{
                            newStaffData["emp_id"]      = empId; 
                        }
                        bomNewStaffArr.push(newStaffData);
                    })
                }
            }
            resolve(bomNewStaffArr);
        });
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