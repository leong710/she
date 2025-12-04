
    // 根據 select_empId 清空對應的 DOM區域 for p-2特作欄位
    async function clearDOM(empId, targetYear) {
        return new Promise((resolve) => {
            targetYear = (targetYear == undefined) ? currentYear : targetYear;
            // 使用屬性選擇器選取所有包含 empId 的 td 元素 // 遍歷這些選取到的元素並清空內容
            document.querySelectorAll(`div[id*=",${empId},${targetYear}"]`).forEach(div => {
                if(!div.id.includes('eh_time')){
                    div.innerHTML = ''
                }
            });

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
        // 防呆1.強迫轉數字
            avg_vol = Number(avg_vol);
            avg_8hr = Number(avg_8hr);
        // 防呆2.確認數值使否有效
            avg_vol = (Number.isFinite(avg_vol) && avg_vol !== '') ? avg_vol : false;
            avg_8hr = (Number.isFinite(avg_8hr) && avg_8hr !== '') ? avg_8hr : false;
        // 定義預設值
        const result = {
            aSample : '不適用',
            bSample : avg_8hr !== false ? (avg_8hr >= 50 ? '符合' : '未達') : '不適用',
            cCheck  : '不適用',
        };
        // 計算
        if (eh_time && avg_vol) {
            const TC = (8 / Math.pow(2, (avg_vol - 90) / 5)).toFixed(2);    // TC：T換算  // 計算 TC 並四捨五入
            const DOSE = ((eh_time / TC) * 100).toFixed(0);                 // 計算 DOSE 並四捨五入
            result.aSample = DOSE >= 50 ? '符合' : '未達';
        }
        // 判定
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
                    };   
                }
                const empData_ehTime = (empData['eh_time'] !== undefined);   // 250204 改回每一筆都要有一個 eh_time
            
            // step.2 欲更新的欄位陣列
                const shLocal_item_arr = ['HE_CATE', 'MONIT_LOCAL', 'WORK_DESC', 'AVG_VOL', 'AVG_8HR', 'eh_time'];     // , 'eh_time' ==> 250204 改回每一筆都要有一個 eh_time
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

                    }else if(sh_item == 'eh_time' && empData_ehTime ){      // 4.5.每日暴露時間：判斷是空值，就給他一個$nbsp;佔位  // 250204 改回每一筆都要有一個 eh_time

                        const eh_time_input = document.querySelector(`input[id="eh_time,${select_empId},${currentYear}"]`);
                        if(!eh_time_input){
                            let eh_time = empData['eh_time'] ?? '';
                            let eh_time_input = `<snap><input type="number" id="eh_time,${select_empId},${currentYear}" name="eh_time" class="form-control text-center" value="${eh_time}" 
                                                    min="0" max="12" onchange="this.value = Math.min(Math.max(this.value, this.min), this.max); change_eh_time(this.id, this.value)" ></snap>`;
                            inner_Value = `${eh_time_input}`;
                        }

                    }else if(sh_item === 'MONIT_LOCAL'){      // 特別處理：MONIT_LOCAL
                        inner_Value = `${br}` + (sh_value[sh_item] !== undefined ? sh_value[sh_item] : sh_value['OSTEXT']);     // 250310 她不要

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

                    // step.2b 噪音驗證 .contains('噪音')
                    if (sh_item === 'HE_CATE' && (Object.values(sh_value['HE_CATE']).some(value => value.includes('噪音'))) && (sh_value['AVG_VOL'] || sh_value['AVG_8HR'])) {
                        const eh_time_input = document.querySelector(`input[id="eh_time,${select_empId},${currentYear}"]`);
                        // 2b1. 檢查元素是否存在+是否有值
                            const eh_time_input_value = (eh_time_input && eh_time_input.value) ? eh_time_input.value : null;
                        // 2b2. 個人shCase的噪音中，假如有含eh_time值，就導入使用。
                            const avg_vol = (sh_value['AVG_VOL']) ? sh_value['AVG_VOL'] : false;
                            const avg_8hr = (sh_value['AVG_8HR']) ? sh_value['AVG_8HR'] : false;
                            const eh_time = (empData['eh_time'])  ? empData['eh_time']  : eh_time_input_value;

                        // 2b3. 呼叫[fun]checkNoise 取得判斷結果
                            const noise_check = checkNoise(eh_time, avg_vol, avg_8hr);     
                            const noise_check_str = `${br}${noise_check.cCheck}`;   // 這裡只顯示cCheck判斷結果
                        document.getElementById(`NC,${select_empId},${currentYear}`).insertAdjacentHTML('beforeend', noise_check_str);     // 渲染噪音判斷

                        // 2b4. 紀錄個人(噪音)特檢資格shCondition['Noise']...是=true；未達、不適用=false
                        empData['shCondition']['noise'] = (noise_check['cCheck'] == '是') ? true : false;
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
    }
    // 更新資格驗證(1by1)
    async function updateShCondition(ShCondition_value, select_empId, targetYear) {
        return new Promise((resolve) => {
            // step1.處理[資格驗證]shCondition欄位
            // 241029 [資格驗證]渲染unblock
            let inner_Value = JSON.stringify(ShCondition_value).replace(/[\[\]{"}]/g, '');
                inner_Value = inner_Value.replace(/,/g, '<br>');
                inner_Value = inner_Value.replace(/true/g, '&nbsp;<span class="badge bg-info">true</span>');
            const this_shCondition = document.getElementById(`shCondition,${select_empId},${targetYear}`);
            if(this_shCondition){
                this_shCondition.insertAdjacentHTML('beforeend', inner_Value);
            }
            
            resolve();  // 當所有設置完成後，resolve Promise
        });
    }

    async function renewYearCurrent(empData){
        let yearCurrent = []
        for (const [key, shCase_i] of Object.entries(empData.shCase)) {
            if(Object.entries(shCase_i.HE_CATE).length > 0){
                for(const [he_cate_key, he_cate_value] of Object.entries(shCase_i.HE_CATE)){
                    yearCurrent.push(he_cate_key);               // 以array_key方式帶入替代陣列
                }
            }
        }
        let yearCurrent_str = JSON.stringify(yearCurrent).replace(/[\[\]\{"}]/g, '');  // 轉字串並去除特定符號~
        empData['_content'][currentYear]['import']['yearCurrent'] = yearCurrent_str;   // 覆蓋
        yearCurrent_str = yearCurrent_str.replace(/,/g, '<br>');                       // 轉字串並去除特定符號~
        document.getElementById(`${empData['cname']},${empData['emp_id']},yearCurrent`).innerHTML = yearCurrent_str;     // 渲染 匯入2-項目
    }
