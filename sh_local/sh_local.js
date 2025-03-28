
// // // utility fun
    // Bootstrap Alarm function
    function Balert(message, type) {
        var alertPlaceholder = document.getElementById("liveAlertPlaceholder")      // Bootstrap Alarm
        var wrapper = document.createElement('div')
        wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message 
                            + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        alertPlaceholder.append(wrapper)
    }
    // fun3-3：吐司顯示字條 // init toast
    function inside_toast(sinn){
        var toastLiveExample = document.getElementById('liveToast');
        var toast = new bootstrap.Toast(toastLiveExample);
        var toast_body = document.getElementById('toast-body');
        toast_body.innerHTML = sinn;
        toast.show();
    }
    // 20240314 配合await將swal外移
    function show_swal_fun(swal_value){
        return new Promise((resolve) => {  
            $("body").mLoading("hide");
            if(swal_value && swal_value['fun'] && swal_value['content'] && swal_value['action']){
                if(swal_value['action'] == 'success'){
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.href = url});          // n秒后回首頁
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{closeWindow(true)});                                          // 手動關閉畫面
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{closeWindow(true); resolve();});  // 2秒自動關閉畫面; 載入成功，resolve
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.reload(); resolve();});  // 2秒自動 刷新页面;載入成功，resolve
                
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
// 20231128 以下為上傳後"iframe"的部分
    // 阻止檔案未上傳導致的錯誤。
    // 請注意設置時的"onsubmit"與"onclick"。
    function loadExcelForm() {
        // 如果檔案長度等於"0"。
        if (excelFile.files.length === 0) {
            // 如果沒有選擇文件，顯示警告訊息並阻止表單提交
            warningText_1.style.display = "block";
            return false;
        }
        // 如果已選擇文件，允許表單提交
        iframe.style.display = 'block'; 
        // 以下為編輯特有
        // showTrainList.style.display = 'none';
        return true;
    }

    function iframeLoadAction() {
        iframe.style.height = '0px';
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        var iframeContent = iframeDocument.documentElement;
        var newHeight = iframeContent.scrollHeight + 'px';
        iframe.style.height = newHeight;

        var excel_json = iframeDocument.getElementById('excel_json');
        var stopUpload = iframeDocument.getElementById('stopUpload');
        // 在此處對找到的 <textarea> 元素進行相應的操作
        if (excel_json) {
            // 手动触发input事件
            var inputEvent = new Event('input', { bubbles: true });
            warningText_1.style.display = "none";           // 警告文字--隱藏
            warningText_2.style.display = "none";
            import_excel_btn.style.display = "block";       // 載入按鈕--顯示
            
        } else if(stopUpload) {
            // 沒有找到 <textarea> 元素
            console.log('請確認資料是否正確');
            warningText_1.style.display = "block";          // 警告文字--顯示
            warningText_2.style.display = "block";
            import_excel_btn.style.display = "none";        // 載入按鈕--隱藏

        }else{
            // console.log('找不到 < ? > 元素');
        }
    };
    // 20231128_下載Excel
    function downloadExcel(to_module) {
        // 定義要抓的key=>value
        const item_keys = {
            // "id"            : "aid",
            "OSTEXT_30"     : "廠區",
            "OSHORT"        : "部門代碼",
            "OSTEXT"        : "部門名稱",
            "HE_CATE"       : "類別",
            "MONIT_NO"      : "監測編號",
            "MONIT_LOCAL"   : "監測處所",
            "WORK_DESC"     : "作業描述",
            "AVG_VOL"       : "A權音壓級(dBA)",
            "AVG_8HR"       : "日時量平均(dBA)",
            "flag"          : "開關",
            "created_at"    : "建檔日期",
            "updated_at"    : "最後更新",
            "updated_cname" : "最後編輯",
        };
        let sort_listData = [];                         // 建立整理陣列

        const OSHORTs_opts_arr = Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[name="OSHORTs[]"]'));
        const selectedValues = OSHORTs_opts_arr.filter(cb => cb.checked).map(cb => cb.value);
        console.log('selectedValues...', selectedValues);
        // *** 這裡要加過濾空值，防止刪除錯誤 -- 待處理
        if(selectedValues.length > 0){
            for (let i = 0; i < shLocals.length; i++) {
                // 這裡修改成 includes，檢查 shLocals[i]['OSHORT'] 是否存在於 selectedValues 中
                if (selectedValues.includes(shLocals[i]['OSHORT'])) {
                    let sortedItem = {}; // 建立物件
                    Object.keys(item_keys).forEach(function (i_key) {
                        // 處理 HE_CATE 的格式
                        sortedItem[item_keys[i_key]] = (i_key === "HE_CATE") ? shLocals[i][i_key].replace(/[{"}]/g, '') : shLocals[i][i_key];
                    });
                    sort_listData.push(sortedItem); // 將有資料的物件加入陣列
                }
            }  
        }else{
            for(let i=0; i < shLocals.length; i++){
                let sortedItem = {}; // 建立物件
                Object.keys(item_keys).forEach(function(i_key){
                    // 處理 HE_CATE 的格式
                    sortedItem[item_keys[i_key]] = (i_key === "HE_CATE") ? shLocals[i][i_key].replace(/[{"}]/g, '') : shLocals[i][i_key];
                });
                sort_listData.push(sortedItem); // 將所有物件加入陣列
            }    
        }            
        console.log('aaa...sort_listData...', sort_listData);

        // 240813-直接擷取畫面上的table內數值~省去引入資料的大筆訊息~
            // const table = document.getElementById(to_module);
            // const headers = Array.from(table.querySelectorAll('thead th')).map(header => header.textContent.trim());
            // const rows = Array.from(table.querySelectorAll('tbody tr'));
        
            // const sort_listData = rows.map(row => {
            //     const cells = Array.from(row.querySelectorAll('td'));
            //     let rowData = {};
            //     cells.forEach((cell, index) => {
            //         rowData[headers[index]] = cell.textContent.trim();
            //     });
            //     return rowData;
            // });
            // console.log(sort_listData);

        let htmlTableValue = JSON.stringify(sort_listData);
        document.getElementById(to_module+'_htmlTable').value = htmlTableValue;
    }
// function
    // [p1 函數-1-1] 動態生成步驟2的所有按鈕，並重新綁定事件監聽器
    function mk_OSHORTs_btn(selectedOSHORTs) {
        console.log('selectedOSHORTs...',selectedOSHORTs);
        $('#OSHORTs_opts_inside').empty();
        if(Object.entries(selectedOSHORTs).length > 0){     // 判斷使否有長度值
            Object.entries(selectedOSHORTs).forEach(([ohtext_30, oh_value]) => {
                let ostext_btns = `
                    <div class="col-lm-3 p-1">
                        <div class="card">
                            <div class="card-header"><button type="button" name="scope[]" value="${ohtext_30}" class="add_btn">${ohtext_30}</button></div>
                            <div class="card-body p-2">
                                ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                    // <label for="${ohtext_30},${o_key}" class="form-check-label">${o_key} (${o_value.OSTEXT}) ${o_value._count}件</label>
                                    `<div class="form-check pl-5">
                                        <input type="checkbox" name="OSHORTs[]" id="${ohtext_30},${o_key}" value="${o_key}" class="form-check-input" data-toggle="tooltip" data-placement="bottom" title="勾選for刪除用">
                                        <button type="button" name="OSHORTs[]" value="${o_key}" class="btn btn-outline-success add_btn my-1" style="width: 100%; text-align: start;" >${o_key} ${o_value.OSTEXT} ${o_value._count}件</button>
                                    </div>`
                                ).join('')}
                            </div>
                        </div>
                    </div>`;
                $('#OSHORTs_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<OSHORTs_opts_inside>元素中
            });
        }else{
            let ostext_btns = `
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-header">!! 空值注意 !!</div>
                        <div class="card-body">
                            ~ 目前沒有任何特危健康場所資料 ~
                        </div>
                    </div>
                </div>`;
            $('#OSHORTs_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<OSHORTs_opts_inside>元素中
        }
    }

    async function eventListener(){
        return new Promise((resolve) => { 
            // 在任何地方啟用工具提示框
                $('[data-toggle="tooltip"]').tooltip();
            // dataTable 2 https://ithelp.ithome.com.tw/articles/10272439
                $('#shLocal').DataTable({
                    "autoWidth": true,
                    // 排序
                    "order": [[ 0, "asc" ], [ 1, "asc" ]],
                    // 顯示長度
                    "pageLength": 25,
                    // 中文化
                    "language": {
                        url: "../../libs/dataTables/dataTable_zh.json"
                    }
                });
            // 20231128 以下為上傳後"iframe"的部分
                // 監控按下送出鍵後，打開"iframe"
                excelUpload.addEventListener('click', ()=> {
                    iframeLoadAction();
                    loadExcelForm();
                });
                // 監控按下送出鍵後，打開"iframe"，"load"後，執行抓取資料
                iframe.addEventListener('load', ()=> {
                    iframeLoadAction();
                });
                // 監控按下[載入]鍵後----呼叫Excel載入
                import_excel_btn.addEventListener('click', ()=> {
                    var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    var excel_json = iframeDocument.getElementById('excel_json');
                    var stopUpload = iframeDocument.getElementById('stopUpload');

                    if (excel_json) {
                        document.getElementById('excelTable').value = excel_json.value;
                    } else if(stopUpload) {
                        console.log('請確認資料是否正確');
                    }else{
                        console.log('找不到 ? 元素');
                    }
                });
                // 監控按下[清空]鍵後----呼叫清除Table
                truncate_shLocal_btn.addEventListener('click', ()=> {
                    const OSHORTs_opts_arr = Array.from(document.querySelectorAll('#OSHORTs_opts_inside input[name="OSHORTs[]"]'));
                    const selectedValues = OSHORTs_opts_arr.filter(cb => cb.checked).map(cb => cb.value);
                    // console.log('selectedValues...', selectedValues);
                    // *** 這裡要加過濾空值，防止刪除錯誤 -- 待處理
                    if(selectedValues.length > 0){
                        const selectedValues_str = JSON.stringify(selectedValues).replace(/[\[\]]/g, '');
                        // console.log('selectedValues_str...', selectedValues_str);
                        if(confirm(`確認要刪除以下部門特危作業？\n`+selectedValues_str)){
                            // load_fun('truncate_shLocal','truncate_shLocal',show_swal_fun);   // 241018 舊[清空]按鈕功能暫停
                            // load_fun('load_staff_byDeptNo', selectedValues_str, rework_loadStaff);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff
                            load_fun('deleteSelected_shLocal',selectedValues_str,show_swal_fun);   // 241018 舊[清空]按鈕功能暫停
                        }
                    }else{
                        alert('請勾選要刪除的部門代號!');
                    }
                });
                // 按鈕監聽
                const shLocal_table = $('#shLocal').DataTable();
                const OSHORTs_btns = document.querySelectorAll('#OSHORTs_opts_inside button[name="OSHORTs[]"]');
                OSHORTs_btns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        // console.log(this.value)
                        shLocal_table.search(this.value).draw();     // 在特危作業清單的search帶入部門代號，他會過濾出符合的清單
                        $('#nav-p2-tab').tab('show');                // 挑轉頁面到[特危作業清單]
                    })
                })
                // step-3. 綁定scope_btns事件監聽器 => card head上的全選btn
                const scope_btns = document.querySelectorAll('#OSHORTs_opts_inside button[name="scope[]"]');
                scope_btns.forEach(scope_btn => {
                    scope_btn.addEventListener('click', async function() {
                        const target_scope_cbs = document.querySelectorAll(`#OSHORTs_opts_inside input[id*="${this.value},"]`);
                        // 檢查第一個 checkbox 是否被選中，然後根據它的狀態全選或全部取消
                        let allChecked = Array.from(target_scope_cbs).every(checkbox => checkbox.checked);
                        target_scope_cbs.forEach(checkbox => {
                            checkbox.checked = !allChecked; // 如果 allChecked 為 true，則取消選擇，否則全選
                            // 手動觸發 change 事件
                            checkbox.dispatchEvent(new Event('change'));
                        });
                    });
                });

            // 文件載入成功，resolve
            resolve();
        });
    }
    // 0-0.多功能擷取fun 新版改用fetch
    async function load_fun(fun, parm, myCallback) {        // parm = 參數
        mloading(); 
        try {
            let formData = new FormData();
                formData.append('fun', fun);
                formData.append('parm', parm);                  // 後端依照fun進行parm參數的採用

            let response = await fetch('load_fun.php', {
                method : 'POST',
                body   : formData
            });

            if (!response.ok) {
                $("body").mLoading("hide");
                throw new Error('fun load ' + fun + ' failed. Please try again.');
            }

            let responseData = await response.json();
            let result_obj = responseData['result_obj'];    // 擷取主要物件

            return myCallback(result_obj);                  // resolve(true) = 表單載入成功，then 呼叫--myCallback
                                                            // myCallback：form = bring_form() 、document = edit_show() 、locals = ? 還沒寫好
        } catch (error) {
            $("body").mLoading("hide");
            throw error;                                    // 載入失敗，reject
        }
    }

    async function loadData() {
        try {
            mloading(); 
            
            mk_OSHORTs_btn(OSHORTsObj);                 // 呼叫函數-P-1

            await eventListener();                      // step_1-2 eventListener();

        } catch (error) {
            console.error(error);
        }

        let message  = '*** <b>請注意</b> 後續維護對象：<b><u>site工安</u></b>&nbsp;~&nbsp;';
        let message2  = '<h4>*** <b>請注意&nbsp;特作點位上傳：<u>step.1：先完成作業環境測定。 step.2：上傳職安署。 step.3：上傳到此系統前請主管完成Review清單!</u></b></h4>';
        Balert( message2, 'danger');
        Balert( message, 'warning');

        $("body").mLoading("hide");
    }

    $(function(){
        loadData();
    })