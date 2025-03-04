// // 
    // P-3
    // function post_staff(){


        
    // }
    // 
    async function preProcess_staff(shLocalDept_in, targetMonth){
        staff_inf = [];
        shLocalDept_in.forEach((post_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
            const inCare  = post_i["inCare"]       ?? [];
            const inCare_arr = inCare[targetMonth] ?? [] ;  // 取得 本月名單 或 上月名單
            staff_inf = [...staff_inf, ...inCare_arr];
        });
            // console.log('1.preProcess_staff...', staff_inf);
       // 使用 map() 和 Object.keys() 來取得所有的 key
        const empIDKeys = staff_inf.map(staff => Object.keys(staff)[0]);
            // console.log('2.empIDKeys...', empIDKeys);
        const empIDKeys_str = JSON.stringify(empIDKeys).replace(/[\[\]]/g, '');       // 部門代號加工(多選)
            // console.log('3.empIDKeys_str...', empIDKeys_str);

            const test = await preCheckStaffData(empIDKeys_str, empIDKeys)
            console.log('preCheckStaffData =>', test)
    }


            // fun-2 當shLocalDept_inf沒有符合的deptData時...給他一個新的
            function bomNewStaff(notExistingStaffs_str, _staff_inf){
                return new Promise((resolve) => {
                    // 初始化新生成staff陣列..返回用
                    let bomNewStaffArr = [];
                    
                    if(notExistingStaffs_str !== ''){
                        const selectStaffArr = notExistingStaffs_str.split(',')       // 分割deptStr成陣列
                        if(selectStaffArr.length > 0){
                            selectStaffArr.forEach((empId) => {
                                let newStaffData = {};                                               // 初始化新生成dept物件
                                empId = empId.replace(/"/g, '');                                  // 去除前後"符號..
                                const staffStr = _staff_inf.find(item => item.includes(empId));      // 從_dept_inf找出符合 empId 的原始字串
                                if(staffStr){
                                    const staffArr = staffStr.split(',')                              // 分割staffStr成陣列
                                    newStaffData["OSTEXT_30"] = staffArr[0] ?? '';                    // 取出陣列 0 = 廠區
                                    newStaffData["emp_id"]    = staffArr[1] ?? '';                    // 取出陣列 1 = 部門代號
                                    newStaffData["cname"]     = staffArr[2] ?? '';                    // 取出陣列 2 = 部門名稱
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
            // fun-3 檢查load_fun('load_change') 是否都有存在，不然就生成staff預設值
            async function preCheckStaffData(selectStaffStr, _staff_inf){
                if(selectStaffStr == '') return(false);

                    const load_change = await load_fun('load_change', selectStaffStr, 'return');                    // step-1. 先從db撈現有的資料
                    const existingStaffStrs = load_change.map(staff => staff.emp_id);                               // step-2. 提取load_change中所有的emp_id值
                    defaultStaff_inf = [...defaultStaff_inf, ...load_change];                                       // step-2. 合併load_change
    
                    const selectStaffArr = selectStaffStr.replace(/"/g, '').split(',')                              // step-3. 去除前後"符號..分割staffStr成陣列
                    const notExistingStaffs = selectStaffArr.filter(emp_id => !existingStaffStrs.includes(emp_id)); // step-4. 找出不存在於load_shLocalDepts中的部門代號
                    console.log('notExistingStaffs...', notExistingStaffs)
                    if(notExistingStaffs.length > 0) {
                        const notExistingStaffs_str = JSON.stringify(notExistingStaffs).replace(/[\[\]]/g, '');     // step-5. 把不在的部門代號進行加工(多選)，去除外框
                        const bomNewDeptArr = await bomNewStaff(notExistingStaffs_str, _staff_inf);                 // step-6. 生成staff預設值
                        defaultStaff_inf = [...defaultStaff_inf, ...bomNewDeptArr];                                 // step-6. 合併bomNewDeptArr
                    }
    
                return(defaultStaff_inf);
                // post_hrdb(defaultStaff_inf);                                                                     // step-8. 送出進行渲染
            };