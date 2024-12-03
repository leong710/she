
                // 根據 select_empId 清空對應的 DOM區域 for p-2特作欄位
                async function clearDOM(empId, targetYear) {
                    return new Promise((resolve) => {
                        targetYear = (targetYear == undefined) ? currentYear : targetYear;
                        // 使用屬性選擇器選取所有包含 empId 的 td 元素 // 遍歷這些選取到的元素並清空內容
                        document.querySelectorAll(`div[id*=",${empId},${targetYear}"]`).forEach(div => div.innerHTML = '');
                        resolve();  // 當所有設置完成後，resolve Promise
                    });
                }
                // 241022 陣列去重：
                function arr_de_double(arr){
                    return [...new Set(arr)];
                }
                // 241022 物件去重：
                async function obj_de_double(obj){
                    for (let key in obj) {
                        obj[key] = [...new Set(obj[key])];  // 使用 Set 去除重複，然後轉回陣列
                    }
                    return obj;
                }
                // 240912 取php in_array功能，查詢部門代號是否在[特危場所]的部門代號物件中...返回 true、false
                function in_arrayKey(searchKey) {
                    return new Promise((resolve) => {
                        const OSHORTsArr = JSON.parse(OSHORTsObj);
                        const found = Object.values(OSHORTsArr).some(subObj => {    // 遍歷物件中的每個屬性
                            if (typeof subObj === 'object' && subObj !== null) {    // 確認每個子屬性是否為物件，並搜尋該物件內的 key
                                return Object.keys(subObj).includes(searchKey);
                            }
                            return false;
                        });
                        resolve(found);     // 當搜尋完成後，回傳結果
                    });
                }


        // 240827 check fun-1 驗證[噪音]是否符合   
            // eh_time：每日暴露時數(t)、 avg_vol：均能音量(dBA)、 avg_8hr：工作日八小時平均音值(dBA)
            // 樣本編號（A）換算Dose≧50% ； 樣本編號（B）八小時平均音值(dBA)≧50
            function checkNoise(eh_time, avg_vol, avg_8hr) {
                const result = {
                    aSample : '不適用',
                    bSample : avg_8hr !== false ? (avg_8hr >= 50 ? '符合' : '未達') : '不適用',
                    cCheck  : '不適用',
                };
                if (eh_time && avg_vol) {
                    const TC = (8 / Math.pow(2, (avg_vol - 90) / 5)).toFixed(2);    // TC：T換算  // 計算 TC 並四捨五入
                    const DOSE = ((eh_time / TC) * 100).toFixed(0);                 // 計算 DOSE 並四捨五入
                    result.aSample = DOSE >= 50 ? '符合' : '未達';
                }
                if (result.bSample === '符合' || (result.bSample === '不適用' && result.aSample === '符合')) {
                    result.cCheck = '是';
                } else if (result.bSample === '未達' || result.aSample === '未達') {
                    result.cCheck = '否';
                }
                return result;
            }
            // 240906 check fun-2 驗證[新進特殊]是否符合   // 241030--特檢資格串接3_newOne
            function checkNewOne(hiredDate) {
                return new Date(hiredDate).getFullYear() === currentYear ? String(currentYear) : false;
            }
            // 240906 check fun-3 驗證[變更檢查]是否符合   
            function checkChange(asIs_deptNo, toBe_deptNo) {
                return asIs_deptNo !== toBe_deptNo;        // 比較 dept_no 前後是否一致
                // return asIs_deptNo !== toBe_deptNo  ? String(asIs_deptNo) : false;        // 比較 dept_no 前後是否一致
            }
            // 240906 check fun-4 驗證[定期檢查]是否符合
            function checkRegular(shCase) {
                return shCase.length > 0;
            }

            function do_checkChange(empData){
                // step.4 進行部門代號dept_no的變更檢查 // 241022----深層比對調部門這件事: 加強版
                let asIs_deptNo_arr = {};
                // step.4a1 取個人[外層]部門代號: (今年)目前的所屬部門代號
                const toBe_deptNo = (empData.dept_no !== undefined) ? empData.dept_no : false;

                    empData['shCondition']['change'] = [];
                    empData['shCondition']['regular'] = [];

                // step.4b1 取個人[shCase]部門代號: (今年)待過的特作場所
                if((empData.shCase != undefined) && empData.shCase.length > 0){
                    if(asIs_deptNo_arr[currentYear] == undefined){ asIs_deptNo_arr[currentYear] = []; }
                    // step.4b2 取個人[shCase]部門代號工作：(每一筆) currentYear
                    for (const [ec_key, ec_value] of Object.entries(empData.shCase)) {
                        asIs_deptNo_arr[currentYear].push((ec_value.OSHORT) ? ec_value.OSHORT : 'undefined_b1')
                        
                        let HE_CATE_value = Object.values(ec_value.HE_CATE)[0];         // 241030--特檢資格串接4c_change_前置作業
                        if(checkChange(ec_value.OSHORT, toBe_deptNo)){
                            empData['shCondition']['change'].push(HE_CATE_value);  // 241030--特檢資格串接4b_change
                        }else{
                            empData['shCondition']['regular'].push(HE_CATE_value);  // 241030--特檢資格串接4b_change
                        }
                    }
                }
                // step.4c 取shCase_logs裡的部門代號工作：preYear
                if(empData.shCase_logs !== undefined && Object.keys(empData.shCase_logs).length > 0){
                    // // 只取今年 currentYear 、去年 preYear
                    const getYearArr = [currentYear, preYear];
                    for (const getYear of getYearArr) {
                        // 確認年分紀錄存在 且 有內容
                        if(empData.shCase_logs[getYear] != undefined && Object.keys(empData.shCase_logs[getYear]).length > 0 ){
                            if(asIs_deptNo_arr[getYear] == undefined){ asIs_deptNo_arr[getYear] = []; }
                            // step.4c1 取shCase_logs裡的[外層]部門代號工作：
                            asIs_deptNo_arr[getYear].push((empData.shCase_logs[getYear].dept_no) ? empData.shCase_logs[getYear].dept_no : 'undefined_c1')

                            // step.4c2 取shCase_logs裡的[shCase]部門代號工作：
                            if(empData.shCase_logs[getYear].shCase != undefined){
                                let preYearChange = (getYear !== currentYear) ? '_轉出':'';             // 241030--特檢資格串接4c_change_前置作業

                                for (const [log_sc_key, log_sc_value] of Object.entries(empData.shCase_logs[getYear].shCase)) {
                                    asIs_deptNo_arr[getYear].push((log_sc_value.OSHORT) ? log_sc_value.OSHORT : 'undefined_c2')
                                    
                                    let HE_CATE_value = Object.values(log_sc_value.HE_CATE)[0];
                                    if(checkChange(log_sc_value.OSHORT, toBe_deptNo)){
                                        empData['shCondition']['change'].push(HE_CATE_value + preYearChange);  // 241030--特檢資格串接4c_change
                                    }else{
                                        empData['shCondition']['regular'].push(HE_CATE_value + preYearChange);  // 241030--特檢資格串接4c_change
                                    }
                                }
                            }
                        }
                    }
                }

                empData['shCondition']['change']  = arr_de_double(empData['shCondition']['change']);         // 241101 陣列去重：
                empData['shCondition']['regular'] = arr_de_double(empData['shCondition']['regular']);        // 241101 陣列去重：
                empData['shCondition']['change']  = empData['shCondition']['change'].join('; ');             // 241113 陣列轉字串：
                empData['shCondition']['regular'] = empData['shCondition']['regular'].join('; ');            // 241113 陣列轉字串：
                // console.log(empData['shCondition']['change']);
                // console.log(empData['shCondition']['regular']);

                asIs_deptNo_arr = obj_de_double(asIs_deptNo_arr)        // 241022 物件去重：
                let asIs_deptNo_check = [];
                // console.log('emp_shCase...asIs_deptNo_arr', (asIs_deptNo_arr));

                // step.4d 進行輪番驗證:
                if(Object.keys(asIs_deptNo_arr).length > 0 && toBe_deptNo){
                    for (const [asIs_deptNo_key, asIs_deptNo_value] of Object.entries(asIs_deptNo_arr)) {
                        if(asIs_deptNo_value.length > 0){
                            for (const asIs_deptNo of asIs_deptNo_value) {
                                // 240906 check fun-3 驗證[變更檢查]是否符合        // 取得當前年份currentYear -1 = 去年preYear  ** asIs_deptNo / toBe_deptNo：要注意是否in_array(特作區域) 
                                if(checkChange(asIs_deptNo, toBe_deptNo)){        // 240906 check fun-3 驗證[變更檢查]是否符合
                                    // console.log(asIs_deptNo_key+' : '+asIs_deptNo+(toBe_deptNo != asIs_deptNo));
                                    // empData['shCondition']['change'] = true;        // 驗證並帶入shCondidion.change      // 241030--特檢資格串接4c_change_配合作業-暫停
                                    // asIs_deptNo_check = await in_arrayKey(asIs_deptNo) ? `${asIs_deptNo} 特危轉出` : `${asIs_deptNo} 轉出`;    // 確認是否在[特危場所名單]
                                    // break;
                                    asIs_deptNo_check.push(in_arrayKey(asIs_deptNo) ? `${asIs_deptNo} 特危轉出` : `${asIs_deptNo} 轉出`);    // 確認是否在[特危場所名單]
                                } 
                            }
                        }
                    }
                }

                asIs_deptNo_check = arr_de_double(asIs_deptNo_check);        // 241101 陣列去重：
                asIs_deptNo_check = asIs_deptNo_check.join('; ');            // 241113 陣列轉字串：

                // step.4e 假如真的是轉調單位： 渲染轉調     // 241029 [轉調]渲染unblock
                if(empData['shCondition']['change'] !== ''){
                    const toBe_deptNo_check = in_arrayKey(toBe_deptNo) ? `轉入特危 ${toBe_deptNo}` : `轉入 ${toBe_deptNo}`;    // 確認是否在[特危場所名單]
                    // 組合轉調訊息
                    const change_inner_Value = asIs_deptNo_check !== '' ? `<div class="change_">${asIs_deptNo_check}`+(asIs_deptNo_check !== '' ? '<br>':'')+`${toBe_deptNo_check}</div>`:'';
                    // document.getElementById(`change,${select_empId},${currentYear}`).innerText = '';                                // 清空innerText內容
                    // document.getElementById(`change,${select_empId},${currentYear}`).insertAdjacentHTML('beforeend', change_inner_Value);     // 渲染轉調
                    console.log('change_inner_Value...',change_inner_Value);
                }
            // step.5 進行定期檢查驗證
                // const shCase = (empData['shCase'] != undefined) ? empData['shCase'] : false;
                // empData['shCondition']['regular']  = (shCase) ? checkRegular(shCase) : false;                                       // 240906 check fun-4 驗證[定期檢查]是否符合
                // console.log(asIs_deptNo, toBe_deptNo, checkChange(asIs_deptNo, toBe_deptNo), empData['shCondition']);

                return empData;
            }


        // 通用的函數，用於更新 DOM (1by1) for p-2特作欄位 (含 1.噪音、新人特殊 驗證)
        async function updateDOM(sh_value, select_empId, sh_key_up) {
            return new Promise((resolve) => {
                // step.1 先取得select_empId的個人資料=>empData
                const empData = staff_inf.find(emp => emp.emp_id === select_empId);
                // 防止套入時錯誤，建立[資格驗證]shCondition紀錄判斷物件
                if(empData['shCondition'] == undefined || empData['shCondition'].length == 0){
                    empData.shCondition = {
                        "noise"   : false,          // 噪音判定
                        "newOne"  : false,          // 新人
                        "regular" : false,          // 定期
                        "change"  : false           // 變更
                    };   
                }
                const empData_shCase_Noise = Object.values(empData.shCase[sh_key_up]['HE_CATE']).includes('噪音');

                // step.2 欲更新的欄位陣列
                const shLocal_item_arr = ['MONIT_LOCAL', 'WORK_DESC', 'HE_CATE', 'AVG_VOL', 'AVG_8HR', 'eh_time'];
                // step.2 將shLocal_item_arr循環逐項進行更新
                shLocal_item_arr.forEach((sh_item) => {
                    // step.2a 項目渲染...
                    const br = sh_key_up > 0 ? '<br>' : ''; // 判斷 1以上=換行
                    let inner_Value = '';
                    if (sh_item === 'HE_CATE'){             // 3.類別代號 特別處理：1.物件轉字串、2.去除符號
                        let he_cate_str = JSON.stringify(sh_value[sh_item]).replace(/[{"}]/g, '');
                        inner_Value = `${br}${he_cate_str}`;

                    }else if(sh_item.includes('AVG')){      // 4.5.均能音壓AVG_VOL、平均音壓AVG_8HR 特別處理：判斷是空值，就給他一個$nbsp;佔位
                        let avg_str = sh_value[sh_item] ? sh_value[sh_item] : '&nbsp;';
                        inner_Value = `${br}${avg_str}`;

                    }else if(sh_item.includes('eh_time') && empData_shCase_Noise ){      // 4.5.每日暴露時間：判斷是空值，就給他一個$nbsp;佔位
                        let eh_time = sh_value[sh_item] ? sh_value[sh_item] : '';
                        let eh_time_input = `<snap><input type="number" id="eh_time,${select_empId},${currentYear},${sh_key_up}" name="eh_time" class="form-control" value="${eh_time}" 
                                                min="0" max="12" onchange="this.value = Math.min(Math.max(this.value, this.min), this.max); change_eh_time(this.id, this.value)" ></snap>`;
                        inner_Value = `${br}${eh_time_input}`;

                    }else if(sh_item === 'MONIT_LOCAL'){      // 特別處理：MONIT_LOCAL
                        inner_Value = `${br}${sh_value['OSTEXT_30']}&nbsp;` + (sh_value[sh_item] !== undefined ? sh_value[sh_item] : sh_value['OSTEXT']);

                    }else{                                  // 1.6
                        // 確認 sh_item 是否有定義的值
                        inner_Value = (sh_value[sh_item] !== undefined) ? `${br}${sh_value[sh_item]}` : (() => {
                            switch (sh_item) {
                                case 'WORK_DESC':
                                    return `${br}${sh_value['HE_CATE_KEY']}`;
                                default:
                                    return ''; // 預設空值
                            }
                        })();
                    }
                    document.getElementById(`${sh_item},${select_empId},${currentYear}`).insertAdjacentHTML('beforeend', inner_Value);     // 渲染各項目

                    // step.2b 噪音驗證
                    if (sh_item === 'HE_CATE' && Object.values(sh_value['HE_CATE']).includes('噪音') && (sh_value['AVG_VOL'] || sh_value['AVG_8HR'])) {
                        const eh_time_input = document.querySelector(`input[id="eh_time,${select_empId},${currentYear},${sh_key_up}"]`);
                        // 2b1. 檢查元素是否存在+是否有值
                            // eh_time_input.removeAttribute('disabled');
                            const eh_time_input_value = (eh_time_input && eh_time_input.value) ? eh_time_input.value : null;
                        // 2b2. 個人shCase的噪音中，假如有含eh_time值，就導入使用。
                            // const eh_time = (empData['eh_time'])  ? empData['eh_time']  : eh_time_input_value;
                            const avg_vol = (sh_value['AVG_VOL']) ? sh_value['AVG_VOL'] : false;
                            const avg_8hr = (sh_value['AVG_8HR']) ? sh_value['AVG_8HR'] : false;
                            const eh_time = (sh_value['eh_time']) ? sh_value['eh_time'] : eh_time_input_value;
                            // eh_time_input.value = (!eh_time_input_value) ? eh_time : eh_time_input_value;    // 判斷eh_time輸入格是否一致，強行帶入顯示~

                        // 2b3. 呼叫[fun]checkNoise 取得判斷結果
                            const noise_check = checkNoise(eh_time, avg_vol, avg_8hr);     
                            // const noise_check_str = `${br}${sh_key_up}:&nbsp;A-${noise_check.aSample}&nbsp;B-${noise_check.bSample}&nbsp;C-${noise_check.cCheck}`; // 停用顯示 aSample bSample
                            const noise_check_str = `${br}${noise_check.cCheck}`;   // 這裡只顯示cCheck判斷結果
                        document.getElementById(`NC,${select_empId},${currentYear}`).insertAdjacentHTML('beforeend', noise_check_str);     // 渲染噪音判斷

                        // 2b4. 紀錄個人(噪音)特檢資格shCondition['Noise']...是=true；未達、不適用=false
                            // empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : empData['shCondition']['noise'];
                        // empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : false;

                    // } else if (sh_item === 'HE_CATE' && !Object.values(sh_value['HE_CATE']).includes('噪音')){
                        // if(empData['shCondition']['noise'] != undefined ){empData['shCondition']['noise'] = false;}
                        // eh_time_input.setAttribute('disabled', 'true');
                        // eh_time_input.value = "";
                    }
                });

                resolve();  // 當所有設置完成後，resolve Promise
            });
        }
        // 更新驗證項目(1by1)   3 新人特殊驗證、4 進行部門代號dept_no的變更檢查
        async function doCheck(select_empId){
            // step.1 先取得select_empId的個人資料=>empData
                const empData = staff_inf.find(emp => emp.emp_id === select_empId);

            // step.3 新人特殊驗證：呼叫[fun]checkNewOne 取得判斷結果
                const hired = (empData['HIRED'] != undefined) ? empData['HIRED'] : false;
                empData['shCondition']['newOne'] = (hired) ? checkNewOne(hired)  : false;                            // 240906 check fun-2 驗證[新進特殊]是否符合
                
            // step.4 進行部門代號dept_no的變更檢查
                do_checkChange(empData);
        }
        // 更新資格驗證(1by1)
        async function updateShCondition(ShCondition_value, select_empId, targetYear) {
            return new Promise((resolve) => {
                // step1.處理[資格驗證]shCondition欄位
                // 241029 [資格驗證]渲染unblock
                let inner_Value = JSON.stringify(ShCondition_value).replace(/[\[\]{"}]/g, '');
                    inner_Value = inner_Value.replace(/,/g, '<br>');
                    inner_Value = inner_Value.replace(/true/g, '&nbsp;<span class="badge bg-info">true</span>');
                document.getElementById(`shCondition,${select_empId},${targetYear}`).insertAdjacentHTML('beforeend', inner_Value);
                
                // step2.處理[特檢資格]shIdentity欄位 // 球型標籤方式：
                // 'title':'對應名稱', 'bgc':'球型顏色', 'inScop':'成立項目'
                // const shCondition_style = {
                //     'noise'  : {'title':'噪音', 'bgc':'bg-secondary',         'inScop':'' },
                //     'newOne' : {'title':'新人', 'bgc':'bg-success',           'inScop':'' },
                //     'regular': {'title':'定期', 'bgc':'bg-primary',           'inScop':'' },
                //     'change' : {'title':'變更', 'bgc':'bg-warning text-dark', 'inScop':'' }
                // }

                //     // step.1 先取得select_empId的個人資料=>empData
                //     // const empData = staff_inf.find(emp => emp.emp_id === select_empId);

                // document.getElementById(`shIdentity,${select_empId},${targetYear}`).innerHTML = '';
                // for (const [item, value] of Object.entries(ShCondition_value)) {
                //     if(value){
                //         // const inner_item = `<span class="badge rounded-pill bg-success">${item}</span>`;
                //         const inner_item = `<span class="badge rounded-pill ${shCondition_style[item]['bgc']}">${shCondition_style[item]['title']}</span>`;
                //         document.getElementById(`shIdentity,${select_empId},${targetYear}`).insertAdjacentHTML('beforeend', inner_item);
                //     }
                // }

                    // // 240913 整合型的作法
                        // let shIdentity_pill = '';
                        // let shCondition_str = '';
                        // for (const [item, value] of Object.entries(ShCondition_value)) {
                        //     if(value){
                        //         // 特檢資格：
                        //         const inner_item = `<span class="badge rounded-pill ${shCondition_style[item]['bgc']}">${shCondition_style[item]['title']}</span>`;
                        //         shIdentity_pill = (shIdentity_pill) ? shIdentity_pill + '&nbsp;' + inner_item : inner_item;
                        //         // 資格驗證：
                        //         const shCondition_item = value ? (item +'：'+ `&nbsp;<span class="badge bg-info">${value}</span>`) : (item +'：'+ value);
                        //         shCondition_str = (shCondition_str) ? shCondition_str + '<br>' + shCondition_item : shCondition_item;
                        //     }
                        // }
                        // document.getElementById(`shIdentity,${select_empId},${targetYear}`).insertAdjacentHTML('beforeend', shIdentity_pill);   // 特檢資格：
                        // document.getElementById(`shCondition,${select_empId},${targetYear}`).insertAdjacentHTML('beforeend', shCondition_str);  // 資格驗證：

                resolve();  // 當所有設置完成後，resolve Promise
            });
        }


