    // 重新架構
    async function resetINF(request){
        if(request){
            staff_inf     = [];
            shLocal_inf   = [];
            loadStaff_tmp = [];
            _doc_inf      = [];
            _doc_inf.idty = null;

            await release_dataTable();
            $('#form_btn_div').empty();
            $('#hrdb_table tbody').empty();
            $('#logs_div .logs tbody').empty();
            $('#reviewInfo').empty();
            $('#logsInfo').empty();

        }else{
            // await release_dataTable();                  // 停止並銷毀 DataTable
            // await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
            // await post_preYearShCase(staff_inf);        // step-1-1.重新渲染去年 shCase&判斷  // 241024 停止撲到下面
            // await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
        }

        if(userInfo.role <= '2.2' && _doc_inf.idty <= 4 ){                        // 限制role <= 3 現場窗口以下...排除主管和路人
            // await reload_HECateTable_Listeners();   // 重新定義HE_CATE td   // 關閉可防止更動 for簽核
            await reload_shConditionTable_Listeners();
            await reload_yearHeTable_Listeners();
            await reload_yearPreTable_Listeners();
        }else{
            // changeHE_CATEmode();                    // 241108 改變HE_CATE calss吃css的狀態；主要是主管以上不需要底色編輯提示
            changeShConditionMode();
            changeYearHeMode();
            changeYearPreMode();
        }
        await btn_disabled();                       // 讓指定按鈕 依照staff_inf.length 啟停 
    }
    // 讓指定按鈕 依照staff_inf.length 啟停
    function btn_disabled(){
        return new Promise((resolve) => {
            download_excel_btn.disabled  = staff_inf.length === 0;  // 讓 下載 按鈕啟停
            resetINF_btn.disabled        = staff_inf.length === 0;  // 讓 清除 按鈕啟停
            // bat_storeStaff_btn.disabled  = staff_inf.length === 0 || (_doc_inf.idty >= 4);   // 讓 儲存 按鈕啟停
            // SubmitForReview_btn.disabled = staff_inf.length === 0 || (_doc_inf.idty >= 4);   // 讓 送審 按鈕啟停

            // loadExcel_btn.disabled       = (_doc_inf.idty >= 4) || (userInfo.role >= 2);     // 讓 新增 按鈕啟停
            // importStaff_btn.disabled     = (_doc_inf.idty >= 4) || (userInfo.role >= 2);     // 讓 上傳 按鈕啟停

            // if(_doc_inf.idty >= 4){
            //     bat_storeStaff_btn.disabled  = true;  // 讓 儲存 按鈕啟停
            //     SubmitForReview_btn.disabled = true;  // 讓 送審 按鈕啟停
            // }
            
            document.querySelectorAll(`#hrdb_table input[id*="eh_time,"]`).forEach(input => input.disabled   = (_doc_inf.idty >= 5 || _doc_inf.in_sign != userInfo.empId ));   // 讓所有eh_time 輸入欄位啟停 = 主要for已送審
            document.querySelectorAll(`#hrdb_table button[class*="eraseStaff"]`).forEach(btn => btn.disabled = (_doc_inf.idty >= 5 || _doc_inf.in_sign != userInfo.empId ));   // 讓所有eraseStaff btn啟停 = 主要for已送審
            postMemoMsg_btn.disabled     = (_doc_inf.idty >= 4);    // 讓 貼上備註 按鈕啟停
            memoMsg_input.disabled       = (_doc_inf.idty >= 4)

            resolve();
        });
    }

// 備註說明模組 START
    // 開啟memoModal的預設工作
    async function memoModal(this_id){
        // step.1 標題列顯示姓名工號
        $('#memoTitle').empty().append(`(${this_id})`);         // 清空+填上工號
        const this_id_arr = this_id.split(',');                 // 分割this.id成陣列
        const edit_empId  = this_id_arr[1];                     // 取出陣列1=emp_id
        postMemoMsg_btn.value = edit_empId;
        // step.2 取得個人今年的memo，並轉成陣列
        const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
        const { _content } = empData;
        const _memo = _content[`${currentYear}`]['memo'] !== undefined ? _content[`${currentYear}`]['memo'] : [];
        // step.3 取得memoBody
        const memoBody = document.getElementById('memoBody');
        memoBody.innerHTML = '';
        // step.4 有memo筆數
        if(_memo.length !== 0){
            let memoCard = '';
            for (const [memo_index, memo_value] of Object.entries(_memo)) {
                memoCard += await mk_memoMsg(memo_index, memo_value);
            }
            // step.4.2 鋪設個人今年的memo
            memoBody.insertAdjacentHTML('beforeend', memoCard);
                scrollToBottom(); // 自動捲動到底部
        }
        
        await reload_eraseMemoCarListeners();

    }
    // 生成單一memoCard
    function mk_memoMsg(_index, memo_i){
        return new Promise((resolve) => {
            const memoCard = `<tr><td><div class="row g-0" id="memo_i_${_index}">
                                <div class="col-md-3 p-1 cover rounded"><img src="../image/nurse.png" alt="小護士" class="img-thumbnail" onerror="this.onerror=null; this.src='../image/lvl.png';"></div>
                                <div class="col-md-9 p-1">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <h5 class="card-title mb-0" title="${memo_i.emp_id}" >${memo_i.cname}</h5>
                                        <button class="btn btn-link add_btn eraseMemoCar_btn `+ (memo_i.emp_id !== userInfo.empId && userInfo.role > 1 ? 'unblock':'')+`" value="${_index}" title="Erase it: ${_index}" `
                                            + (memo_i.emp_id !== userInfo.empId && userInfo.role > 1 ? 'disabled':'')+`><i class="fa-solid fa-delete-left"></i></button>
                                    </div>
                                    <div class="border rounded p-2 bg-white word_bk">${memo_i.msg}</div><p class="card-text"><small class="text-muted">${memo_i.timeStamp}</small></p></div></div></td></tr>`;
            resolve(memoCard);      // 當所有設置完成後，resolve Promise
        });
    }
    // 241226 建立PostMemoMsg_btn監聽功能 for 編輯 = [個案備註]
    let postMemoMsg_btnClickListener;
    async function reload_postMemoMsg_btn_Listeners() {
        return new Promise((resolve) => {
            // 檢查並移除已經存在的監聽器
            if (postMemoMsg_btnClickListener) {
                postMemoMsg_btn.removeEventListener('click', postMemoMsg_btnClickListener);   // 將每一個tdItem移除監聽, 當按下click
            }
            // 定義新的監聽器函數
            postMemoMsg_btnClickListener = async function () {
                const memoMsg_input = document.getElementById('memoMsg');
                if(memoMsg_input.value.length == 0){
                    alert("沒有MemoMsg內容...");
                    return false;
                }
                //打包物件
                const memoObj = {
                    'cname'     : userInfo.cname,
                    'emp_id'    : userInfo.empId,
                    'msg'       : (memoMsg_input.value).trim(),
                    'timeStamp' : getTimeStamp()
                }

                // *** 這裡要補上把訊息塞進去個人資料內...
                const edit_empId = postMemoMsg_btn.value;
                // 取得個人今年的memo，並轉成陣列
                    const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
                    empData._content[`${currentYear}`]['memo'] = empData._content[`${currentYear}`]['memo'] ?? [];
                    empData._content[`${currentYear}`]['memo'].push(memoObj);
                    console.log('staff_inf =>', staff_inf);
                // 生成完整memo
                const memoCard_index = empData._content[`${currentYear}`]['memo'].length - 1;
                const memoCard = await mk_memoMsg(memoCard_index, memoObj)
                // step.2.2 鋪設個人今年的memo
                const memoBody = document.getElementById('memoBody');
                memoBody.insertAdjacentHTML('beforeend', memoCard);
                    scrollToBottom(); // 自動捲動到底部
                memoMsg_input.value = '';

                await reload_eraseMemoCarListeners();

            }
            // 添加新的監聽器
            postMemoMsg_btn.addEventListener('click', postMemoMsg_btnClickListener);      // 將每一個tdItem增加監聽, 當按下click

            resolve();
        });
    }
    // 生成時間戳章 for memoCard
    function getTimeStamp(){
        var Today       = new Date();
        const thisToday = Today.getFullYear() +'/'+ String(Today.getMonth()+1).padStart(2,'0') +'/'+ String(Today.getDate()).padStart(2,'0');  // 20230406_bug-fix: 定義出今天日期，padStart(2,'0'))=未滿2位數補0
        const thisTime  = String(Today.getHours()).padStart(2,'0') +':'+ String(Today.getMinutes()).padStart(2,'0') +':'+ String(Today.getSeconds()).padStart(2,'0');                           // 20230406_bug-fix: 定義出今天日期，padStart(2,'0'))=未滿2位數補0
        const timeStamp = thisToday+' '+thisTime;
        return timeStamp;
    }
    // memoModal自動捲動到底部
    function scrollToBottom() {
        var offcanvasBody = $('#offcanvasRight .offcanvas-body');
        offcanvasBody.scrollTop(offcanvasBody[0].scrollHeight);
    }
    // 241227 建立eraseMemoCar_btn監聽功能 for 編輯 = [個案備註]
    let eraseMemoCarListener;
    function reload_eraseMemoCarListeners() {
        return new Promise((resolve) => {
            const eraseMemoCarBtns = document.querySelectorAll('#memoBody button[class*="eraseMemoCar_btn"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (eraseMemoCarListener) {
                eraseMemoCarBtns.forEach(eraseBtn => {                                      // 遍歷範圍內容給eraseBtn
                    eraseBtn.removeEventListener('click', eraseMemoCarListener);   // 將每一個eraseBtn移除監聽, 當按下click
                })
            }
            // 定義新的監聽器函數
            eraseMemoCarListener = async function () {
                // *** 把訊息移出去個人資料內...
                const edit_empId = postMemoMsg_btn.value;
                    // 取得個人今年的memo，並轉成陣列後進行splice移除...
                    const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
                    empData._content[`${currentYear}`]['memo'] = empData._content[`${currentYear}`]['memo'] ?? [];
                    if(empData._content[`${currentYear}`]['memo'].length > 0){
                        await empData._content[`${currentYear}`]['memo'].splice(this.value, 1);
                        console.log('staff_inf =>', staff_inf);  
                        
                        // *** 把畫面上的訊息移除...
                            // var element = document.getElementById(`memo_i_${this.value}`);
                            // if (element) {
                            //     element.parentNode.removeChild(element);
                            // }
                        // step.3 取得memoBody
                        const memoBody = document.getElementById('memoBody');
                        memoBody.innerHTML = '';
                        
                        const _memo = empData._content[`${currentYear}`]['memo'] ?? [];
                        // step.4 有memo筆數
                        if(_memo.length !== 0){
                            let memoCard = '';
                            for (const [memo_index, memo_value] of Object.entries(_memo)) {
                                memoCard += await mk_memoMsg(memo_index, memo_value);
                            }
                            // step.4.2 鋪設個人今年的memo
                            memoBody.insertAdjacentHTML('beforeend', memoCard);
                                scrollToBottom(); // 自動捲動到底部
                        }
                    }
                await reload_eraseMemoCarListeners();
                // await memoModal(['',edit_empId])
            }

            // 添加新的監聽器
            eraseMemoCarBtns.forEach(eraseBtn => {                                      // 遍歷範圍內容給eraseBtn
                eraseBtn.addEventListener('click', eraseMemoCarListener);      // 將每一個eraseBtn增加監聽, 當按下click
            })

            resolve();
        });
    }
// 備註說明模組 END

// // phase 2 -- 鋪設
async function post_hrdb(emp_arr){
    // 停止並銷毀 DataTable
        release_dataTable();
        // $('#hrdb_table tbody').empty();

    if(emp_arr.length === 0){
        const table = $('#hrdb_table').DataTable();                     // 獲取表格的 thead
        const columnCount = table.columns().count();                    // 獲取每行的欄位數量
        const tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 沒有資料 ~ </td><tr>`;
        $('#hrdb_table tbody').append(tr1);

    }else{
        const importItem_arr = ['yearHe', 'yearCurrent', 'yearPre'];
        await Object(emp_arr).forEach((emp_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
            let tr1 = '<tr>';
            const empId_currentYear = `,${emp_i.emp_id},${currentYear}">`;
            const _content_import = emp_i._content[`${currentYear}`]['import'] !== undefined ? emp_i._content[`${currentYear}`]['import'] : {};
            const _content_memo   = emp_i._content[`${currentYear}`]['memo']   !== undefined ? emp_i._content[`${currentYear}`]['memo']   : [];     // 目的for無訊息就不顯示按鈕
            tr1 += `<td class="">
                        <div class="col-12 p-0">${emp_i.emp_id}</br><button type="button" class="btn btn-outline-primary add_btn " name="emp_id" value="${emp_i.cname},${emp_i.emp_id}" `
                            + (emp_i.HIRED ? ` title="到職日：${emp_i.HIRED}" ` : ``) +` data-bs-toggle="modal" data-bs-target="#aboutStaff" aria-controls="aboutStaff">${emp_i.cname}</button></div>`
                            + (_content_memo.length !== 0  ? `<div class="col-12 pt-1 pb-0 px-0" >
                                <button type="button" class="btn btn-outline-success btn-sm btn-xs add_btn " value="${emp_i.cname},${emp_i.emp_id}" data-toggle="tooltip" data-placement="bottom" title="總窗 備註/有話說"
                                    onclick="memoModal(this.value)" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight"><i class="fa-regular fa-rectangle-list"></i></button>
                            </div>` : ``)
                        +`</td>`;
            tr1 += `<td><b>${currentYear}：</b><br>`+ ((emp_i.emp_sub_scope != undefined ? emp_i.emp_sub_scope : emp_i._logs[currentYear].emp_sub_scope )) +`</td>`;
                                            
            tr1 += `<td>`+ ((emp_i.dept_no != undefined ? emp_i.dept_no : emp_i._logs[currentYear].dept_no )) +`<br>`
                            + ((emp_i.emp_dept != undefined ? emp_i.emp_dept : emp_i._logs[currentYear].emp_dept )) +`</td>`;

            tr1 += `<td class="HE_CATE" id="${emp_i.cname},${emp_i.emp_id},HE_CATE"><div id="HE_CATE${empId_currentYear}</div></td>`;
            tr1 += `<td><div id="MONIT_LOCAL${empId_currentYear}</div></td>`;
            tr1 += `<td><div id="WORK_DESC${empId_currentYear}</div></td>`;

            tr1 += `<td><div id="AVG_VOL${empId_currentYear}</div></td>`;
            tr1 += `<td><div id="AVG_8HR${empId_currentYear}</div></td>`;

            tr1 += `<td><div id="eh_time${empId_currentYear}</div></td>`;
            tr1 += `<td><div id="NC${empId_currentYear}</div></td>`;

            tr1 += `<td class="shCondition`+(userInfo.role <='2' ? '':' unblock')+`" id="${emp_i.cname},${emp_i.emp_id},shCondition"><div id="shCondition${empId_currentYear}</div></td>`;           // 特檢資格

            importItem_arr.forEach((importItem) => {
                let importItem_value = (_content_import[importItem] != undefined ? _content_import[importItem] :'').replace(/,/g, '<br>');
                tr1 += `<td class="${importItem}`+(userInfo.role <='3' ? '':' unblock')+`" id="${emp_i.cname},${emp_i.emp_id},${importItem}">${importItem_value}</td>`;
            })

            tr1 += '</tr>';
            $('#hrdb_table tbody').append(tr1);
            // 250206 補上大PM想要的eh_time
            let eh_time_input = `<snap><input type="number" id="eh_time,${emp_i.emp_id},${currentYear}" name="eh_time" class="form-control text-center" value="${emp_i._logs[currentYear]['eh_time']}"
                            min="0" max="12" onchange="this.value = Math.min(Math.max(this.value, this.min), this.max); change_eh_time(this.id, this.value)" ></snap>`;
            document.getElementById(`eh_time,${emp_i.emp_id},${currentYear}`).insertAdjacentHTML('beforeend', eh_time_input);     // 渲染eh_time項目
        })
    }
    // await reload_dataTable();               // 倒參數(陣列)，直接由dataTable渲染

    // 240905 [轉調]欄位增加[紀錄].btn：1.建立offcanvas_arr陣列。2.建立canva_btn監聽。3.執行fun，顯示於側邊浮動欄位offcanva。
        const offcanvas_arr = Array.from(document.querySelectorAll('button[aria-controls="aboutStaff"]'));
        offcanvas_arr.forEach(canva_btn => {
            canva_btn.addEventListener('click', function() {
                const this_value_arr = this.value.split(',')       // 分割this.value成陣列
                // const select_cname = this_value_arr[0];            // 取出陣列0=cname
                const select_empId = this_value_arr[1];            // 取出陣列1=emp_id
                $('#aboutStaff #aboutStaff_title').empty().append('( '+ this.value +' )');     // 更新 header title  
                show_preYearShCase(select_empId);
            });
        });

    $("body").mLoading("hide");
}



// // phase 1 -- 生成按鈕
    // [p1 函數-2] 動態生成所有按鈕，並重新綁定事件監聽器
    function mk_deptNos_btn(docDeptNo) {
        return new Promise((resolve) => {
            _docs_inf = docDeptNo;      // 套取docs
            console.log('docDeptNo =>',docDeptNo);
            // init
            $('#deptNo_opts_inside').empty();
            // step-1. 鋪設按鈕
            if(docDeptNo.length > 0){     // 判斷使否有長度值
                for (const _item of docDeptNo) {
                    Object.entries(_item).forEach(([emp_sub_scope, oh_value]) => {
                        // console.log(emp_sub_scope,oh_value)
                        let ostext_btns = `
                            <div class="col-lm-3 p-1">
                                <div class="card">
                                    <div class="card-header"><button type="button" name="scope[]" value="${emp_sub_scope}" class="add_btn">${emp_sub_scope}</button></div>
                                    <div class="card-body p-2">
                                        ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                            `<div class="form-check px-4">
                                                <input type="checkbox" name="subScope[]" id="cb,${emp_sub_scope},${o_key}" value="${o_key}" class="form-check-input" >
                                                <button type="button" name="deptNo[]" id="${emp_sub_scope},${o_key}" value="${o_key}" class="btn btn-info add_btn my-1" style="width: 100%;text-align: start;" `
                                                + ` >${o_key}&nbsp;${o_value.OSTEXT}</button>
                                            </div>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>`;
                        $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
                    });
                };
            }else{
                let ostext_btns = `
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-header">!! 空值注意 !!</div>
                            <div class="card-body">
                                ~ 目前沒有待簽核資料 ~
                            </div>
                        </div>
                    </div>`;
                $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
            }

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }

            // [p1 函數-2] 241213 將送審的百分比改成送審中
            async function filtApprove(_docs) {
                const reviewStep = await load_fun('reviewStep', 'return');     // 呼叫通用函數load_fun+ p1 函數-2 生成btn
                const _step = reviewStep.step;
        
                for (const _doc of _docs) {
                            // console.log('_doc =>',_doc);
                    for (const [emp_sub_scope, dept_no_value] of Object.entries(_doc)) {
                        for (const [dept_no, value] of Object.entries(dept_no_value)) {
                                    // console.log(dept_no,' => value:',value);
                            const deptNo_sups = document.querySelectorAll(`#deptNo_opts_inside button[id="${emp_sub_scope},${dept_no}"] sup[name="sup_${dept_no}[]"]`);
                            const innerHTMLValue = (value.idty == 2) ? "退回編輯" : _step[value.idty].approvalStep;
                            // 更新所有符合條件的節點的 innerHTML
                            deptNo_sups.forEach(node => { node.innerHTML = `(${value.idty}-${innerHTMLValue})`; });
        
                            // 決定開啟的權限
                            const doc_Role_bool = !( 
                                    (userInfo.role <= 1) ||                  // 大PM.1 => 全開
                                    // (dept_no == userInfo.signCode) ||     // 同部門 ??    
                                    // (value.BTRTL == userInfo.BTRTL) ||    // 同建物 = 廠護理師.2 /廠工安.2.5
                                    ((userInfo.role == 2 || userInfo.role == 2.2 || userInfo.role == 2.5) && (userInfo.BTRTL.includes(value.BTRTL))) ||  // (廠護理師.2 || 廠工安.2.5) & 同建物
                                    (value.in_sign == userInfo.empId) ||     // 待簽人員 = 上層主管 /轉呈
                                    (value.omager  == userInfo.empId)        // 部門主管 = 自己
                                );
                
                            const deptNo_btns = document.querySelectorAll(`#deptNo_opts_inside button[id="${emp_sub_scope},${dept_no}"]`);
                            deptNo_btns.forEach(deptNo_btn => {
                                // 如果 idty 大於 4，則更新按鈕樣式
                                if (value.idty == 5) {
                                    deptNo_btn.classList.remove('btn-info');
                                    deptNo_btn.classList.remove('add_btn');
                                    deptNo_btn.classList.add('btn-success');
        
                                } else if (value.idty == 6) {
                                    deptNo_btn.classList.remove('btn-info');
                                    deptNo_btn.classList.add('btn-primary');
                                    
                                } else if (value.idty == 10) {
                                    deptNo_btn.classList.remove('btn-info');
                                    deptNo_btn.classList.add('btn-outline-secondary');
                                }
                                // 點擊編輯權限
                                deptNo_btn.disabled = doc_Role_bool;
                            });
        
                            const subScopes_opts_arr = Array.from(document.querySelectorAll(`#deptNo_opts_inside input[id*="cb,${emp_sub_scope},${dept_no}"]`));
                            // 點擊閱讀權限
                            subScopes_opts_arr.forEach(subScope_opt => subScope_opt.disabled = doc_Role_bool );
                            // deptNo_btns.forEach(deptNo_btn => {
                            // })
                        }
                    }
                }
                // 名單總匯整_btn
                const load_subScopes_btn = document.getElementById('load_subScopes_btn');
                if(userInfo.role <= 2.2) load_subScopes_btn.classList.remove('unblock');
            }

    // [p1 函數-1] 取得危害地圖...並callBack mk_deptNos_btn進行鋪設
    async function p1_init() {
        await load_fun('load_shLocal_OSHORTs', 'load_shLocal_OSHORTs', mk_deptNos_btn);
    }
    // [p1 函數-3] 設置p1事件監聽器和
    async function p1_eventListener() {
        return new Promise((resolve) => {
            // step-p1-1. 綁定deptNo_opts事件監聽器
                const deptNo_btns = document.querySelectorAll('#deptNo_opts_inside button[name="deptNo[]"]');
                deptNo_btns.forEach(deptNo_btn => {
                    deptNo_btn.addEventListener('click', async function() {
                        console.log(this.value)
                        // 工作一 清空暫存
                            // await resetINF(true); // 清空

                        // // 工作二 
                        //     let thisValue_arr   = this.value.split(',')       // 分割this.value成陣列
                        //     // const select_year  = thisValue_arr[0];           // 取出陣列0=年份
                        //     const select_deptNo   = thisValue_arr[1];           // 取出陣列1=部門代號
                        //     const select_subScope = thisValue_arr[2];           // 取出陣列1=人事子範圍

                        //     // // // ***** 250206 這裡已重寫....要重新抓db裡的_doc文件....避免抄寫衝突
                        //         // 使用 .find() 找到滿足條件的物件
                        //         // const result = await _docs_inf.map(doc => doc[select_subScope]).find(value => value !== undefined);
                        //     const parm = { uuid : this.value };
                        //     const result = await load_fun('load_doc', JSON.stringify(parm), 'return');   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff

                        //     // 從 result 中取出對應的廠區/部門代號
                        //         // const _doc = result ? result[select_deptNo] : undefined;  // 確保 result 存在 // 從_docs_inf中取出對應 廠區/部門代號 的表單
                        //     const _doc = result ? result[select_subScope][select_deptNo] : undefined;  // 確保 result 存在 // 從_docs_inf中取出對應 廠區/部門代號 的表單
                            
                        //     // 採用淺拷貝的方式來合併物件
                        //     // _doc_inf = Object.assign( {}, _doc_inf, _doc );
                        //     _doc_inf = _doc;
                        //     _doc_inf['subScope'] = select_subScope;
                        //     _doc_inf['deptNo']   = select_deptNo;
                        //     _docsIdty_inf = _doc ? (_doc.idty ?? null) : null;

                        //     // 工作三 依部門代號撈取員工資料 後 進行鋪設
                        //     let checkList = JSON.stringify(_doc['check_list']).replace(/[\/\[\]]/g, '');
                        //         checkList = checkList.replace(/\,/g, ';').replace(/\"/g, "'");

                        //     thisValue_arr.push(checkList)
                        //     const selectedValues_str = JSON.stringify(thisValue_arr).replace(/[\[\]]/g, '');
                        //     console.log('selectedValues_str =>',selectedValues_str);
                            
                        //     // 增加判斷式，取_doc_inf.in_sign == userInfo.empId 來啟閉簽核按鈕
                        //     const reviewRole = (
                        //             ((userInfo.role <= 2 || _doc_inf.in_sign == userInfo.empId) && _doc_inf.idty <= 5) ||
                        //             (userInfo.role <= 1 && _doc_inf.idty == 6) 
                        //         );

                        //     await load_fun('load_staff_byCheckList', selectedValues_str, rework_staff);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff

                        //     await mk_form_btn(reviewRole);        // 建立簽核按鈕
                        //     await post_reviewInfo(_doc_inf);      // 鋪設表頭訊息及待簽人員
                        //     await post_logs(_doc_inf.logs);       // 鋪設文件歷程
                        //     await reload_dataTable();             // 呼叫dataTable

                        $('#nav-p2-tab').tab('show');
                    });
                });

            // step-p1-2. 綁定scope_btns事件監聽器 => card head上的全選btn
                const scope_btns = document.querySelectorAll('#deptNo_opts_inside button[name="scope[]"]');
                scope_btns.forEach(scope_btn => {
                    scope_btn.addEventListener('click', async function() {
                        const target_scope_cbs = document.querySelectorAll(`#deptNo_opts_inside input[id*="cb,${this.value},"]`);
                        // 檢查第一個 checkbox 是否被選中，然後根據它的狀態全選或全部取消
                        let allChecked = Array.from(target_scope_cbs).every(checkbox => checkbox.checked);
                        target_scope_cbs.forEach(checkbox => {
                            checkbox.checked = !allChecked; // 如果 allChecked 為 true，則取消選擇，否則全選
                            // 手動觸發 change 事件
                            checkbox.dispatchEvent(new Event('change'));
                        });
                    });
                });

            // step-p1-3. 驗證提醒監聽 => for [提取勾選部門]驗證提醒
                const subScopes_opts_arr = Array.from(document.querySelectorAll('#deptNo_opts_inside input[id*="cb,"]'));
                subScopes_opts_arr.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        const selectedOptsValues = subScopes_opts_arr.filter(cb => cb.checked).map(cb => cb.value);
                        // 更新驗證標籤
                        load_subScopes_btn.classList.toggle('is-invalid', selectedOptsValues.length === 0);
                        load_subScopes_btn.classList.toggle('is-valid',   selectedOptsValues.length > 0);
                        load_subScopes_btn.disabled = selectedOptsValues.length === 0;
                    });
                });

            // step-p1-4. 綁定load_subScopes_btn[提取勾選部門]進行撈取員工資料
                const load_subScopes_btn = document.getElementById('load_subScopes_btn');
                load_subScopes_btn.addEventListener('click', async function() {
                    const selectedValues = subScopes_opts_arr.filter(cb => cb.checked).map(cb => cb.value);
                    // const selectedValues_str = JSON.stringify(selectedValues).replace(/[\[\]]/g, '');
                    // 工作一 清空暫存
                    // await resetINF(true);               // 清空
                    // 工作二 
                    await release_dataTable();

                    for (const [index, selectedValue] of Object.entries(selectedValues)) {
                        console.log(index, selectedValue)
                        // await load_staff_byCheckList(selectedValue);
                    }

                    await reload_dataTable();

                    // $('logsInfo').empty();
                    // console.log('staff_inf...', staff_inf);

                    $('#nav-p2-tab').tab('show');
                })

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }


// [default fun]
    $(async function() {
        await p1_init();
        await p1_eventListener();                     // 呼叫函數-3 建立監聽

        // let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        // let message  = `<b>STEP 1.名單建立(匯入Excel、建立名單)：</b>總窗護理師  <b>2.工作維護(勾選特危、填暴露時數)：</b>課副理,護理師,ESH工安  <b>3.名單送審(100%的名單按下送審)：</b>課副理,護理師</br><b>4.簽核審查(簽核主管可微調暴露時數)：</b>上層主管,課副理,護理師  <b>5.收單review(檢查名單及特檢資料是否完備)：</b>ESH工安,護理師  <b>6.名單總匯整(輸出健檢名單)：</b>總窗護理師`;
        let message  = `userInfo.signCode：${userInfo.signCode}、.role：${userInfo.role}、.BTRTL：${userInfo.BTRTL}`;
        if(message) {
            // Balert( message, 'warning')
            document.getElementById(`debug`).insertAdjacentHTML('beforeend', message);     // 渲染各項目
        }

        // p1. [通用]在任何地方啟用工具提示框
        $('[data-toggle="tooltip"]').tooltip();
    
        $("body").mLoading("hide");

    });
