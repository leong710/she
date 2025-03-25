        // fun
        async function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            const regex = new RegExp('[\\?&]' + name + '=([^&#]*)', 'i');
            const results = regex.exec(window.location.href);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        }
        // fun.0-5 多功能擷取fun 新版改用fetch
        async function load_fun(fun, parm, myCallback) {        // parm = 參數
            // mloading(); 
            if(parm){
                try {
                    let formData = new FormData();
                        formData.append('fun', fun);
                        formData.append('parm', parm);              // 後端依照fun進行parm參數的採用
    
                    let response = await fetch('../mvc/load_fun.php', {
                        method : 'POST',
                        body   : formData
                    });
    
                    if (!response.ok) {
                        throw new Error('fun load ' + fun + ' failed. Please try again.');
                    }
    
                    let responseData = await response.json();
                    let result_obj = responseData['result_obj'];    // 擷取主要物件
    
                    if(parm === 'return' || myCallback === 'return'){
                        return result_obj;                          // resolve(true) = 表單載入成功，then 直接返回值
                    }else{
                        return myCallback(result_obj);              // resolve(true) = 表單載入成功，then 呼叫--myCallback
                    }                                               // myCallback：form = bring_form() 、document = edit_show() 、
                } catch (error) {
                    $("body").mLoading("hide");
                    throw error;                                    // 載入失敗，reject
                }
            }else{
                console.log('error: parm lost...');
                alert('error: parm lost...');
                $("body").mLoading("hide");
            }
        }

    // step1.提取URL參數...呼叫getUrlParameter
    async function step1() {
        const parm = await getUrlParameter('emp_id');
        if(parm){
            // 根據emp_id的值進行相應的檢查：
            const parmArr     = parm.split(',');
                const emp_id      = parmArr[0];
                const targetMonth = parmArr[1];
            if (emp_id.length !== 8 || targetMonth.length !== 6) {
                console.error('step1.參數長度有誤!! ', parm)
                return false;
            }else{
                return parm;
            }
        }else{
            console.error('step1.參數有誤!! ', parm)
            return false;
        }
    }
    // step2.取得員工資料、提取指定月份資料、撈取部門資料、合併整理、返回精簡值
    async function step2(parm) {
        if(parm){
            // 根據emp_id的值進行相應的檢查：
            const parmArr     = parm.split(',');
            const emp_id      = parmArr[0];
            const targetMonth = parmArr[1];

            if (emp_id.length !== 8 || targetMonth.length !== 6) {
                console.error('step2.參數長度有誤!! ', parm)
                return false;
            }else{
                const _changeStaffs = await load_fun('load_change', emp_id, 'return');      // load_fun的變數傳遞要用字串
                const staff_inf = _changeStaffs.find(stafff => stafff.emp_id === emp_id);   // 從_dept_inf找出符合 empId 的原始字串
                if(staff_inf){
                    const showStaff     = await load_fun('showStaff', emp_id, 'return');        // load_fun的變數傳遞要用字串
                    const { _changeLogs } = staff_inf;
                    if(!_changeLogs[targetMonth]) return false;
                    const OSHORT_i = _changeLogs[targetMonth].OSHORT ?? null;
                            // console.log('step2.targetMonth_changeLogs.OSHORT', OSHORT_i)
                    const _shLocalDepts = await load_fun('load_shLocalDepts', '"'+OSHORT_i+'"', 'return');   // load_fun的變數傳遞要用字串
                    const dept_inf = _shLocalDepts.find(dept => dept.OSHORT === OSHORT_i);  // 從_dept_inf找出符合 empId 的原始字串
                            // console.log('step2.dept_inf', dept_inf)
                    // 合併整理
                        _changeLogs[targetMonth].cname       = staff_inf.cname    ?? '';
                        _changeLogs[targetMonth].emp_id      = staff_inf.emp_id   ?? '';
                        _changeLogs[targetMonth].HIRED       = showStaff.HIRED    ?? '';
                        _changeLogs[targetMonth].OSTEXT      = dept_inf.OSTEXT    ?? '';
                        _changeLogs[targetMonth].OSTEXT_30   = dept_inf.OSTEXT_30 ?? '';
                        _changeLogs[targetMonth].targetMonth = targetMonth        ?? '';
                    return _changeLogs[targetMonth];    // 返回精簡值
                }else{
                    return false;
                }
            }
        }else{
            console.error('step2.參數有誤!! ', parm)
            return false;
        }
    }
    // step3.渲染數值
    async function step3(parm) {
        if(parm){
            // const _6shCheckStr = JSON.stringify(parm._6shCheck).replace(/[\[{"}\]]/g, '');   // 特作物件轉字串
            const _6shCheckArr = parm._6shCheck.map(item => item.split(':')[1] + '作業').flat();                
            const _6shCheckStr = JSON.stringify(_6shCheckArr).replace(/[\[{"}\]]/g, '').replace(/,/g, '、');        // 特作物件轉字串

            $('#inputBox1').empty().append(`${parm.OSTEXT_30} (群創 　廠)`);      // 1.廠區
            $('#inputBox2').empty().append(`${parm.OSHORT}<br>${parm.OSTEXT}`); // 2.部門
            $('#inputBox3').empty().append(parm.emp_id);                        // 3.工號
            $('#inputBox4').empty().append(parm.cname);                         // 4.姓名
            $('#inputBox5').empty().append((parm.HIRED).replace(/-/g, '/'));    // 5.到職日
            $('#inputBox6').empty().append(_6shCheckStr);                       // 6.檢查項目
            return true;
        }else{
            console.error('step3.參數有誤!! ', parm)
            return false;
        }
    }

    document.addEventListener('DOMContentLoaded', async function() {
        mloading(); 
        const parm = await step1();                     // step1.提取URL參數
            // console.log('s1...', parm)
        const _changeStaff = await step2(parm);         // step2.取得員工資料、提取指定月份資料、撈取部門資料、合併整理、返回精簡值
            // console.log('s2...', _changeStaff)
        const result = await step3(_changeStaff);       // step3.渲染數值
            // console.log('s3...', result)
        if(result){
            document.title += `_${_changeStaff.cname}`; // 訂製檔案名稱加上cname
            window.print();                             // 列印畫面...記得打開!!
        }
        
        $("body").mLoading("hide");
    });
    