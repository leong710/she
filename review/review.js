// // 1. 工具函數 (Utility Functions)

    // fun.0-1: Bootstrap Alarm function
    function Balert(message, type) {
        var alertPlaceholder = document.getElementById("liveAlertPlaceholder")      // Bootstrap Alarm
        var wrapper = document.createElement('div')
        wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message 
                            + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        alertPlaceholder.append(wrapper)
    }
    // fun.0-2：吐司顯示字條 +堆疊
    function inside_toast(sinn){
        // 創建一個新的 toast 元素
        var newToast = document.createElement('div');
            newToast.className = 'toast align-items-center bg-warning';
            newToast.setAttribute('role', 'alert');
            newToast.setAttribute('aria-live', 'assertive');
            newToast.setAttribute('aria-atomic', 'true');
            newToast.setAttribute('autohide', 'true');
            newToast.setAttribute('delay', '1000');
            // 設置 toast 的內部 HTML
            newToast.innerHTML = `<div class="d-flex"><div class="toast-body">${sinn}</div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
        // 將新 toast 添加到容器中
        document.getElementById('toastContainer').appendChild(newToast);
        // 初始化並顯示 toast
        var toast = new bootstrap.Toast(newToast);
        toast.show();
        // 選擇性地，在 toast 隱藏後將其從 DOM 中移除
        newToast.addEventListener('hidden.bs.toast', function () {
            newToast.remove();
        });
    }
    // fun.0-3: swal
    function show_swal_fun(swal_value){
        return new Promise((resolve) => {  
            $("body").mLoading("hide");
            if(swal_value && swal_value['fun'] && swal_value['content'] && swal_value['action']){
                if(swal_value['action'] == 'success'){
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.href = url});          // n秒后回首頁
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{closeWindow(true)});                                          // 手動關閉畫面
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{closeWindow(true); resolve();});  // 2秒自動關閉畫面; 載入成功，resolve
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.reload(); resolve();});  // 2秒自動 刷新页面;載入成功，resolve
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{resolve();});  // 2秒自動 載入成功，resolve
                } else if(swal_value['action'] == 'warning' || swal_value['action'] == 'info'){   // warning、info
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{resolve();}); // 載入成功，resolve

                } else {                                        // error
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{history.back();resolve();}); // 手動回上頁; 載入成功，resolve
                }
            }else{
                console.error("Invalid swal_value:", swal_value);
                location.href = url;
                resolve(); // 異常情況下也需要resolve
            }
        });
    }
    // fun.0-4b: 停止並銷毀 DataTable
    function release_dataTable(){
        return new Promise((resolve) => {
            let table = $('#hrdb_table').DataTable();
                table.destroy();
            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    // fun.0-4a: dataTable  // https://ithelp.ithome.com.tw/articles/10272439
    async function reload_dataTable(hrdb_data){
        return new Promise((resolve) => {
            release_dataTable();                                                // 呼叫[fun.0-4b] 停止並銷毀 DataTable
            $('#hrdb_table').DataTable({                                        // 重新初始化 DataTable
                "language": { url: "../../libs/dataTables/dataTable_zh.json" }, // 中文化
                "autoWidth": false,                                             // 自動寬度
                "order": [[ 2, "asc" ], [ 1, "asc" ], [ 0, "asc" ]],            // 排序
                "pageLength": 25,                                               // 顯示長度
            });
            resolve();                                                          // 當所有設置完成後，resolve Promise
        });
    }
    // fun.0-5 多功能擷取fun 新版改用fetch
    async function load_fun(fun, parm, myCallback) {        // parm = 參數
        mloading(); 
        if(parm){
            try {
                let formData = new FormData();
                    formData.append('fun', fun);
                    formData.append('parm', parm);                  // 後端依照fun進行parm參數的採用
                let response = await fetch('load_fun.php', {
                    method : 'POST',
                    body   : formData
                });

                if (!response.ok) {
                    throw new Error('fun load ' + fun + ' failed. Please try again.');
                }
                let responseData = await response.json();
                let result_obj = responseData['result_obj'];    // 擷取主要物件
                return myCallback(result_obj);                  // resolve(true) = 表單載入成功，then 呼叫--myCallback
                                                                // myCallback：form = bring_form() 、document = edit_show() 、
            } catch (error) {
                $("body").mLoading("hide");
                throw error;                                    // 載入失敗，reject
            }
        }
    }

// // 2. 數據操作函數 (Data Manipulation Functions)
    // [p-0]

    // [p3 函數-1-2] 動態生成所有按鈕，並重新綁定事件監聽器
    function mk_deptNos_btn(selectedDeptNo) {
        console.log('selectedDeptNo...',selectedDeptNo);
        return new Promise((resolve) => {
            // init
            $('#deptNo_opts_inside').empty();
            // step-1. 鋪設按鈕
            if(Object.entries(selectedDeptNo).length > 0){     // 判斷使否有長度值
                Object.entries(selectedDeptNo).forEach(([emp_sub_scope, oh_value]) => {
                    let ostext_btns = `
                        <div class="col-lm-3">
                            <div class="card">
                                <div class="card-header">${emp_sub_scope}</div>
                                <div class="card-body p-2">
                                    ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                        `<div class="form-check px-1">
                                            <button type="button" name="deptNo[]" id="${emp_sub_scope},${o_key}" value="${o_key}" class="btn btn-outline-secondary add_btn " >
                                            ${o_key}&nbsp;${o_value.OSTEXT}&nbsp;${o_value._count}件<sup class="text-danger" name="sup_${o_key}[]"> (${o_value.shCaseNotNull_pc}%)</sup></button>
                                        </div>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>`;
                    $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
                });
            }else{
                let ostext_btns = `
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-header">!! 空值注意 !!</div>
                            <div class="card-body">
                                ~ 目前沒有任何已存檔的員工資料 ~
                            </div>
                        </div>
                    </div>`;
                $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
            }
            // step-2. 綁定deptNo_opts事件監聽器
            const deptNo_btns = document.querySelectorAll('#deptNo_opts_inside button[name="deptNo[]"]');
            deptNo_btns.forEach(deptNo_btn => {
                deptNo_btn.addEventListener('click', function() {
                    // 工作一 清空暫存
                        resetINF(true); // 清空
                    // 工作二 依部門代號撈取員工資料 後 進行鋪設
                        const selectedValues_str = JSON.stringify(this.value).replace(/[\[\]]/g, '');
                        load_fun('load_staff_byDeptNo', selectedValues_str, rework_loadStaff);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                    // 工作三 
                        const _doc = _docs_inf.find(_doc => _doc.dept_no === this.value);
                        _docsIdty_inf = _doc.idty;
                    // if(_docsIdty_inf >= 4){
                    //     bat_storeStaff_btn.disabled  = true;  // 讓 儲存 按鈕啟停
                    //     SubmitForReview_btn.disabled = true;  // 讓 送審 按鈕啟停
                    // }
                    // bat_storeStaff_btn.disabled  = (_docsIdty_inf >= 4);  // 讓 儲存 按鈕啟停
                    // SubmitForReview_btn.disabled = (_docsIdty_inf >= 4);  // 讓 送審 按鈕啟停
                    $('#nav-p2-tab').tab('show');
                });
            });

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }


    // [p1 函數-2] 設置事件監聽器和MutationObserver
    async function p1_eventListener() {
        return new Promise((resolve) => {
            // p1. [通用]在任何地方啟用工具提示框
            $('[data-toggle="tooltip"]').tooltip();

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }

// [default fun]
    $(function() {
        // [步驟-1] 初始化設置
        mk_deptNos_btn(deptNosObj);             // 呼叫函數-2 生成p1部門slt按鈕

        p1_eventListener();                     // 呼叫函數-3 建立監聽
        // p2_eventListener();                     // 呼叫函數-3 建立監聽

        // let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        // let message  = '*** 本系統螢幕解析度建議：1920 x 1080 dpi，低於此解析度將會影響操作體驗&nbsp;~';
        let message  = `<b>STEP 1.名單建立(匯入Excel、建立名單)：</b>總窗護理師  <b>2.工作維護(勾選特危、填暴露時數)：</b>單位窗口,護理師,ESH工安  <b>3.名單送審(100%的名單按下送審)：</b>單位窗口,護理師</br><b>4.簽核審查(簽核主管可微調暴露時數)：</b>上層主管,單位窗口,護理師  <b>5.收單review(檢查名單及特檢資料是否完備)：</b>ESH工安,護理師  <b>6.名單總匯整(輸出健檢名單)：</b>總窗護理師`;
        if(message) {
            Balert( message, 'warning')
        }

    });