        // 常數定義
        const SH_LOCAL_ITEM_KEYS = ['MONIT_LOCAL', 'WORK_DESC', 'HE_CATE', 'AVG_VOL', 'AVG_8HR', 'eh_time'];
        const SH_CONDITION_STYLE = {
            noise: { title: '噪音', bgc: 'bg-secondary' },
            newOne: { title: '新人', bgc: 'bg-success' },
            regular: { title: '定期', bgc: 'bg-primary' },
            change: { title: '變更', bgc: 'bg-warning text-dark' }
        };

                        // 根據 select_empId 清空對應的 DOM 區域
                        function clearDOM(empId, targetYear = currentYear) {
                            document.querySelectorAll(`div[id*=",${empId},${targetYear}"]`).forEach(div => div.innerHTML = '');
                        }

                        // 陣列去重
                        const arrDeDuplicate = arr => [...new Set(arr)];

                        // 物件去重
                        function objDeDuplicate(obj) {
                            for (let key in obj) {
                                obj[key] = arrDeDuplicate(obj[key]);
                            }
                            return obj;
                        }

                        // 檢查部門代號是否在特危場所名單中
                        function inArrayKey(searchKey) {
                            const OSHORTsArr = JSON.parse(OSHORTsObj);
                            return Object.values(OSHORTsArr).some(subObj => subObj && typeof subObj === 'object' && Object.keys(subObj).includes(searchKey));
                        }

                        // 驗證噪音條件
                        function checkNoise(eh_time, avg_vol, avg_8hr) {
                            const result = { aSample: '不適用', bSample: avg_8hr >= 50 ? '符合' : '未達', cCheck: '不適用' };
                            if (eh_time && avg_vol) {
                                const TC = (8 / Math.pow(2, (avg_vol - 90) / 5)).toFixed(2);
                                const DOSE = ((eh_time / TC) * 100).toFixed(0);
                                result.aSample = DOSE >= 50 ? '符合' : '未達';
                            }
                            result.cCheck = (result.bSample === '符合' || (result.bSample === '不適用' && result.aSample === '符合')) ? '是' : '否';
                            return result;
                        }

                        // 驗證新進特殊是否符合
                        function checkNewOne(hiredDate) {
                            return new Date(hiredDate).getFullYear() === currentYear ? String(currentYear) : false;
                        }

                        // 驗證變更檢查
                        function checkChange(asIsDeptNo, toBeDeptNo) {
                            return asIsDeptNo !== toBeDeptNo;
                        }

    // 更新DOM
    function updateDOM(shValue, selectEmpId, shKeyUp) {
        const empData = staff_inf.find(emp => emp.emp_id === selectEmpId);
        if (!empData.shCondition) {
            empData.shCondition = { noise: false, newOne: false, regular: false, change: false };
        }

        SH_LOCAL_ITEM_KEYS.forEach(shItem => {
            const innerValue = getInnerValue(shValue, shItem, shKeyUp);
            document.getElementById(`${shItem},${selectEmpId},${currentYear}`).insertAdjacentHTML('beforeend', innerValue);
        });

        // 噪音驗證
        if (shValue['HE_CATE'] && shValue['HE_CATE'].includes('噪音')) {
            const eh_time = empData.eh_time || document.querySelector(`input[id="eh_time,${selectEmpId},${currentYear}"]`).value;
            const noiseCheck = checkNoise(eh_time, shValue.AVG_VOL, shValue.AVG_8HR);
            document.getElementById(`NC,${selectEmpId},${currentYear}`).insertAdjacentHTML('beforeend', noiseCheck.cCheck);
            empData.shCondition.noise = noiseCheck.cCheck === '是';
        }
    }

    // 獲取 DOM 更新值
    function getInnerValue(shValue, shItem, shKeyUp) {
        const br = shKeyUp > 0 ? '<br>' : '';
        switch(shItem) {
            case 'HE_CATE':
                return `${br}${JSON.stringify(shValue[shItem]).replace(/[{"}]/g, '')}`;
            case 'AVG_VOL':
            case 'AVG_8HR':
                return `${br}${shValue[shItem] || '&nbsp;'}`;
            case 'MONIT_LOCAL':
                return `${br}${shValue['OSTEXT_30']}&nbsp;${shValue[shItem] || shValue['OSTEXT']}`;
            default:
                return shValue[shItem] !== undefined ? `${br}${shValue[shItem]}` : '';
        }
    }

                    // 處理並更新資格驗證
                    function updateShCondition(shConditionValue, selectEmpId, targetYear) {
                        let innerValue = JSON.stringify(shConditionValue).replace(/[\[\]{"}]/g, '').replace(/,/g, '<br>').replace(/true/g, '<span class="badge bg-info">true</span>');
                        document.getElementById(`shCondition,${selectEmpId},${targetYear}`).insertAdjacentHTML('beforeend', innerValue);
                    }

    // 簡化的 doCheck 函數
    function doCheck(selectEmpId) {
        const empData = staff_inf.find(emp => emp.emp_id === selectEmpId);
        empData.shCondition.newOne = empData.HIRED ? checkNewOne(empData.HIRED) : false;

        // 檢查部門變更
        const toBeDeptNo = empData.dept_no;
        let asIsDeptNoArr = empData.shCase ? empData.shCase.map(caseData => caseData.OSHORT || 'undefined') : [];
        if (empData.shCase_logs) {
            asIsDeptNoArr.push(...Object.values(empData.shCase_logs).map(log => log.dept_no || 'undefined'));
        }
        asIsDeptNoArr = arrDeDuplicate(asIsDeptNoArr);
        empData.shCondition.change = asIsDeptNoArr.some(asIsDeptNo => checkChange(asIsDeptNo, toBeDeptNo));
    }
