// // 
    // P-3
    async function post_staff(post_arr, dateString){
        // 停止並銷毀 DataTable
            release_dataTable('staff_table');
            $('#staff_table tbody').empty();
            post_arr = post_arr ?? [];
            console.log("post_staff-post_arr =>", post_arr);

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
                await post_arr.forEach((post_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...    
                    let tr1 = '<tr>';
                        tr1 += `<td class="" id="">${dateString ?? ''}</td>
                                <td class="" id="">${post_i["OSTEXT_30"] ?? ''}</td>
                                <td class="" id="">${post_i["emp_id"] ?? ''}</td>
                                <td class="" id="">${post_i["cname"] ?? ''}</td>
                                <td class="" id="">${post_i["OSHORT"] ?? ''}</td>

                                <td class="" id="">6</td>
                                <td class="" id="">7</td>
                                <td class="" id="">8 on/off</td>
                                <td class="" id="">9 date</td>
                                <td class="" id="">10 textArea</td>

                                <td class="" id="">11 select</td>
                                <td class="" id="">12 date</td>
                                <td class="" id="">13 date</td>
                                <td class="" id="">14 date</td>
                                <td class="" id="">15 input</td>
                                ;`
                        tr1 += '</tr>';
    
                    $('#staff_table tbody').append(tr1);

                })
                // thisMonth = (dateString != undefined) ? dateString : thisMonth;     // 
                // const uniqueArr =  [...new Set(objKeys_ym)];                        // 年月去重
                // mk_selectOpt_ym(uniqueArr, thisMonth);                              // 生成並渲染到select
                // SubmitForReview_btn.value = thisMonth;                              // 餵年月給submit_btn
            }
            await reload_dataTable('staff_table');                   // 倒參數(陣列)，直接由dataTable渲染
    
            $("body").mLoading("hide");
        
    }
    // 
    async function preProcess_staff(shLocalDept_in, targetMonth){
        let empIDKeys  = [];
        let mergedData = [];
        shLocalDept_in.forEach((post_i)=>{                  // 分解參數(陣列)，手工渲染，再掛載dataTable...
            const inCare     = post_i["inCare"]    ?? [];
            const inCare_arr = inCare[targetMonth] ?? [] ;  // 取得 本月名單 或 上月名單
            inCare_arr.forEach((staff_i) => {
                // step.1 取得所有的 key
                empIDKeys.push(Object.keys(staff_i)[0]);
                // step.2 合併鍵和值
                let key = Object.keys(staff_i)[0];    // 獲取鍵
                let value = staff_i[key];             // 獲取相應的值
                mergedData.push(`${key},${value},${post_i["OSTEXT_30"]},${post_i["OSHORT"]},${post_i["OSTEXT"]}`);
            } )

        });
        const empIDKeys_str = JSON.stringify(empIDKeys).replace(/[\[\]]/g, '');       // 部門代號加工(多選)
        const preCheckStaffData_result = await preCheckStaffData(empIDKeys_str, mergedData);
                // console.log('1.empIDKeys =>',  empIDKeys)
                // console.log('2.mergedData =>', mergedData)
                // console.log('3.empIDKeys_str =>', empIDKeys_str)
                // console.log('4.preCheckStaffData_result =>', preCheckStaffData_result)

        post_staff(preCheckStaffData_result, targetMonth)
    }



            // fun-2 檢查load_fun('load_change') 是否都有存在，不然就生成staff預設值
            async function preCheckStaffData(selectStaffStr, mergedData){
                if(selectStaffStr == '') return(false);
                    let load_change = await load_fun('load_change', selectStaffStr, 'return');                      // step-1. 先從db撈現有的資料
                    const existingStaffStrs = load_change.map(staff => staff.emp_id);                               // step-2. 提取load_change中所有的emp_id值
                        if(load_change.length > 0){
                            for (const [index, staff] of Object.entries(load_change)) {
                                empId = staff['emp_id'];                                            // 去除前後"符號..
                                const staffStr = mergedData.find(item => item.includes(empId));     // 從_dept_inf找出符合 empId 的原始字串
                                const staffArr = (staffStr) ? staffStr.split(',') : [];             // 分割staffStr成陣列
                                load_change[index]["OSTEXT_30"] = staffArr[2] ?? '';                // 取出陣列 2 = 廠區
                                load_change[index]["OSHORT"]    = staffArr[3] ?? '';                // 取出陣列 3 = 部門代號
                                load_change[index]["OSTEXT"]    = staffArr[4] ?? '';                // 取出陣列 4 = 部門名稱
                            }
                        }
                    defaultStaff_inf = [...defaultStaff_inf, ...load_change];                                       // step-2. 合併load_change
    
                    const selectStaffArr = selectStaffStr.replace(/"/g, '').split(',')                              // step-3. 去除前後"符號..分割staffStr成陣列
                    const notExistingStaffs = selectStaffArr.filter(emp_id => !existingStaffStrs.includes(emp_id)); // step-4. 找出不存在於load_shLocalDepts中的部門代號
                    console.log('notExistingStaffs...', notExistingStaffs)

                    if(notExistingStaffs.length > 0) {
                        const notExistingStaffs_str = JSON.stringify(notExistingStaffs).replace(/[\[\]]/g, '');     // step-5. 把不在的部門代號進行加工(多選)，去除外框
                        const bomNewDeptArr = await bomNewStaff(notExistingStaffs_str, mergedData);                 // step-6. 生成staff預設值
                        defaultStaff_inf = [...defaultStaff_inf, ...bomNewDeptArr];                                 // step-6. 合併bomNewDeptArr
                    }
    
                return(defaultStaff_inf);
                // post_hrdb(defaultStaff_inf);                                                                     // step-8. 送出進行渲染
            };

            // fun-3 當shLocalDept_inf沒有符合的deptData時...給他一個新的
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
                                    newStaffData["OSTEXT_30"] = staffArr[2] ?? '';                    // 取出陣列 2 = 廠區
                                    newStaffData["OSHORT"]    = staffArr[3] ?? '';                    // 取出陣列 3 = 部門代號
                                    newStaffData["OSTEXT"]    = staffArr[4] ?? '';                    // 取出陣列 4 = 部門名稱
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