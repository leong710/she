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
                console.log('1.empIDKeys =>',  empIDKeys)
                console.log('2.mergedData =>', mergedData)
                console.log('3.empIDKeys_str =>', empIDKeys_str)
                console.log('4.preCheckStaffData_result =>', preCheckStaffData_result)

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