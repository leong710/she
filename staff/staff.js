
// // // utility fun
    // Bootstrap Alarm function
    function alert(message, type) {
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

// 20231128 以下為上傳後"iframe"的部分
    // 阻止檔案未上傳導致的錯誤。
    // 請注意設置時的"onsubmit"與"onclick"。
    function shLocalExcelForm() {
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
            "OSHORT"        : "部門代碼",
            "OSTEXT_30"     : "廠區",
            "OSTEXT"        : "部門名稱",
            "HE_CATE"       : "類別",
            "AVG_VOL"       : "均能音量",
            "AVG_8HR"       : "工作日8小時平均音壓值",
            "MONIT_NO"      : "監測編號",
            "MONIT_LOCAL"   : "監測處所",
            "WORK_DESC"     : "作業描述",
            "flag"          : "開關",
            "created_at"    : "建檔日期",
            "updated_at"    : "最後更新",
            "updated_cname" : "最後編輯",
        };
        let sort_listData = [];                         // 建立整理陣列
        // const shLocals = <?=json_encode($shLocals)?>;    // 引入shLocal資料
        for(let i=0; i < shLocals.length; i++){
            sort_listData[i] = {};                      // 建立物件
            Object.keys(item_keys).forEach(function(i_key){
                sort_listData[i][item_keys[i_key]] = shLocals[i][i_key];
            })
        }
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

    async function eventListener(){
        return new Promise((resolve) => { 
            // 在任何地方啟用工具提示框
                $('[data-toggle="tooltip"]').tooltip();
            // dataTable 2 https://ithelp.ithome.com.tw/articles/10272439
                $('#shLocal').DataTable({
                    "autoWidth": false,
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
                excelUpload.addEventListener('click', function() {
                    iframeLoadAction();
                    shLocalExcelForm();
                });
                // 監控按下送出鍵後，打開"iframe"，"load"後，執行抓取資料
                iframe.addEventListener('load', function(){
                    iframeLoadAction();
                });
                // 監控按下[載入]鍵後----呼叫Excel載入
                import_excel_btn.addEventListener('click', function() {
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
            // 文件載入成功，resolve
            resolve();
        });
    }

    async function loadData() {
        try {
            mloading(); 
            await eventListener();                      // step_1-2 eventListener();
        } catch (error) {
            console.error(error);
        }

        let message  = '*** <b>請注意</b> 後續維護對象須釐清：<b><u>護理師大PM</u></b>&nbsp;或&nbsp;<b><u>現場工安幹事、廠助理</u></b>&nbsp;需要特別注意權限設定範圍&nbsp;~&nbsp;';
        alert( message, 'warning')

        $("body").mLoading("hide");
    }

    $(function(){
        loadData();
    })