// // 
    // P-3
    async function post_staff(post_arr, dateString, shItemArr){
        // 停止並銷毀 DataTable
            release_dataTable('staff_table');
            $('#staff_table tbody').empty();
            post_arr = post_arr ?? [];
            console.log("post_arr =>", post_arr);

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
                    function mkTD6(post_i){
                        const i_OSHORT          = post_i["OSHORT"];
                        const i_emp_id          = post_i["emp_id"];
                        const i_OSHORTshItemArr = shItemArr[i_OSHORT] ?? [];
                        let sh_check = '<snap>';
                        for(const [o_key, o_value] of Object.entries(i_OSHORTshItemArr)){
                            sh_check += `<div class="form-check m-0">` 
                                      + `<input class="form-check-input" type="checkbox" name="sh_check[]" id="${i_OSHORT},${dateString},${i_emp_id},${o_value}" value="${o_value}" >`
                                      + `<label class="form-check-label" for="${i_OSHORT},${dateString},${i_emp_id},${o_value}">${o_value}</label>` + `</div>`;
                        }
                        sh_check += '</snap>';
                        // console.log(sh_check);
                        return (sh_check);
                    }
                    function mkTD8(post_i){
                        const i_OSHORT          = post_i["OSHORT"];
                        const i_emp_id          = post_i["emp_id"];
                        let ih_check = '<snap>'
                                      + `<div class="form-check form-switch">` 
                                      + `<input class="form-check-input" type="checkbox" name="is_check[]" id="${i_OSHORT},${dateString},${i_emp_id},is_check" checked >`
                                      + `<label class="form-check-label" for="${i_OSHORT},${dateString},${i_emp_id}">是</label>` + `</div>` + '</snap>';

                        return (ih_check);
                    }
                    function mkTD11(post_i){
                        const i_OSHORT          = post_i["OSHORT"];
                        const i_emp_id          = post_i["emp_id"];
                        let ih_check = '<snap>'
                                     +  `<select class="form-select form-select-sm" aria-label=".form-select-sm example" id="${i_OSHORT},${dateString},${i_emp_id},TD11">
                                            <option hidden selected>選擇變更原因(補檢必填)</option>
                                            <option value="作業場所異動">作業場所異動</option>
                                            <option value="新增危害場所">新增危害場所</option>
                                            <option value="新進移工">新進移工</option>
                                            <option value="其他(←備註說明)">其他(←備註說明)</option>
                                        </select>` + '</snap>';
                        return (ih_check);
                    }

                const workListTD_json = await load_jsonFile('workList.json');   // 提取指定json_file內容
                    // console.log('workList_json...', workListTD_json)

                await post_arr.forEach((post_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...    
                    let tr1 = '<tr>';
                        tr1 += `<td class="" id="">${dateString ?? ''}</td>
                                <td class="" id="">${post_i["OSTEXT_30"] ?? ''}</td>
                                <td class="" id="">${post_i["emp_id"] ?? ''}</td>
                                <td class="" id="">${post_i["cname"] ?? ''}</td>
                                <td class="" id="">${post_i["OSHORT"] ?? ''}<br>${post_i["OSTEXT"] ?? ''}</td>

                                <td class="" id="">${mkTD6(post_i)}</td>
                                <td class="" id="">7</td>
                                <td class="" id="">${mkTD8(post_i)}</td>
                                <td class="" id="">9 date</td>
                                <td class="" id="">10 textArea</td>
                                
                                <td class="" id="">${mkTD11(post_i)}</td>
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
    // 預先處理員工資料 for post_staff()
    async function preProcess_staff(shLocalDept_in, targetMonth){
                // console.log('1a.shLocalDept_in...' ,shLocalDept_in)
        let empIDKeys         = [];
        let mergedData        = [];                         // 存放員工合併訊息，for preCheckStaffData時參考套用訊息
        let source_OSHORT_arr = [];                         // 存放所有部門代號，for 提取特危工作場所內的 工作項目。
        shLocalDept_in.forEach((post_i)=>{                  // 分解參數(陣列)，手工渲染
            const inCare     = post_i["inCare"]    ?? [];
            const inCare_arr = inCare[targetMonth] ?? [] ;  // 取得 本月名單 或 上月名單
            inCare_arr.forEach((staff_i) => {
                // step.1 取得所有的 key
                    empIDKeys.push(Object.keys(staff_i)[0]);
                // step.2 合併鍵和值
                    let key = Object.keys(staff_i)[0];      // 獲取鍵
                    let value = staff_i[key];               // 獲取相應的值
                    mergedData.push(`${key},${value},${post_i["OSTEXT_30"]},${post_i["OSHORT"]},${post_i["OSTEXT"]}`);
            } )
            source_OSHORT_arr.push(post_i["OSHORT"]);       // 存放所有部門代號，for 提取特危工作場所內的 工作項目。
        });

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

        post_staff(preCheckStaffData_result, targetMonth, shItemArr);           // 渲染..帶(員工, 指定年月, 特作項目)
        
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