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
                                            <input class="form-check-input" type="checkbox" name="sh_check[]" id="${i_id},sh_check,${o_value}" value="${o_value}" >
                                            <label class="form-check-label" for="${i_id},sh_check,${o_value}">${o_value}</label></div>`;
                                    }
                            td6 += '</snap>';
                            tdObj['6'] = td6;
                    
                        // 生成-8:是否補檢 - checkbox-switch
                            let td8 = `<snap><div class="form-check form-switch"> 
                                        <input class="form-check-input" type="checkbox" name="is_check" id="${i_id},is_check" checked >
                                        <label class="form-check-label" for="${i_id}">是</label></div></snap>`;
                            tdObj['8'] = td8;

                        // 生成-10:備註說明 - textarea
                            let td10 = `<snap><textarea class="form-control" placeholder="備註說明" id="${i_id},change_remark"></textarea></snap>`;
                            tdObj['10'] = td10;
        
                        // 生成-11變更原因(補檢必填) - select
                            let td11 = `<snap><select class="form-select form-select-sm" aria-label=".form-select-sm example" name="why_change" id="${i_id},why_change">
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
                    const staffArr = post_arr.find(staff => staff.emp_id == i_empId);   // 從post_arr找出符合 empId 的原始字串

                    if(staffArr){
                        const tdObj = mkTD(staffArr, case_iArr);
                        
                        let tr1 = '<tr>';
                            tr1 += `<td class="" id="">${i_targetMonth ?? ''}</td>
                                    <td class="" id="">${i_OSTEXT_30}</td>
                                    <td class="" id="">${staffArr["emp_id"] }</td>
                                    <td class="" id="">${staffArr["cname"] }</td>
                                    <td class="" id="">${i_OSHORT}<br>${i_OSTEXT}</td>
    
                                    <td class="" id="">${tdObj['6']}</td>
                                    <td class="" id="">7</td>
                                    <td class="" id="">${tdObj['8']}</td>
                                    <td class="edit2" id="">2025/03/07</td>
                                    <td class="" id="">${tdObj['10']}</td>
                                    
                                    <td class="" id="">${tdObj['11']}</td>
                                    <td class="edit2" id="">2025/03/07</td>
                                    <td class="edit2" id="">2025/03/07</td>
                                    <td class="edit2" id="">2025/03/07</td>
                                    <td class="edit2" id="">15 input</td>
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