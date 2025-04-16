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