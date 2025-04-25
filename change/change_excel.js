
// modal：[load_excel] 以下為上傳後"iframe"的部分
    // fun.2-1a 阻止檔案未上傳導致的錯誤。 // 請注意設置時的"onsubmit"與"onclick"。
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
    // fun.2-1b
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
            console.error('請確認資料是否正確');
            warningText_1.style.display = "block";          // 警告文字--顯示
            warningText_2.style.display = "block";
            import_excel_btn.style.display = "none";        // 載入按鈕--隱藏

        }else{
            // console.log('找不到 < ? > 元素');
        }
    };
    // fun.2-1c 下載Excel...要修正
    function P3downloadExcel(to_module) {
        if(staff_inf.length === 0 || mergedData_inf.length === 0){
            return;
        }
        const item_keys = {
            "i_targetMonth" : "年月份",
            "i_OSTEXT_30"   : "廠區",
            "emp_id"        : "工號",
            "cname"         : "姓名",
            "i_OSHORT"      : "部門代碼",
            "i_OSTEXT"      : "部門名稱",

            "_6shCheck"     : "檢查類別",
            "_7isCheck"     : "是否檢查",
            "_9checkDate"   : "檢查日",
            "_10content"    : "定檢資格"
        };

        let sort_listData = mergedData_inf.map((case_i) => {
            const case_iArr         = case_i.split(',');                        // 分割staffStr成陣列
                const i_empId       = case_iArr[0] ?? '';                       // 取出陣列 0 = 工號
                // const i_cname       = case_iArr[1] ?? '';                       // 取出陣列 1 = 姓名
                const i_OSTEXT_30   = case_iArr[2] ?? '';                       // 取出陣列 2 = 廠區
                const i_OSHORT      = case_iArr[3] ?? '';                       // 取出陣列 3 = 部門代號
                const i_OSTEXT      = case_iArr[4] ?? '';                       // 取出陣列 4 = 部門名稱
                const i_targetMonth = case_iArr[5] ?? '';                       // 取出陣列 5 = 目標年月
                
            let sortedData = {};
            const staff = staff_inf.find(staff_i => staff_i.emp_id == i_empId);   // 從staff_inf找出符合 empId 的原始字串

            if(staff){
                // 獲取變更日誌
                const _cgLog = staff['_changeLogs'][i_targetMonth] ?? {};
                // 處理主欄位
                Object.entries(item_keys).forEach(([key, label]) => {
                    switch (key) {
                        case 'i_targetMonth':   sortedData[label] = i_targetMonth;          break;
                        case 'i_OSTEXT_30'  :   sortedData[label] = i_OSTEXT_30;            break;
                        case 'emp_id'       :   sortedData[label] = staff['emp_id'] ?? '';  break;
                        case 'cname'        :   sortedData[label] = staff['cname']  ?? '';  break;
                        case 'i_OSHORT'     :   sortedData[label] = i_OSHORT;               break;
                        case 'i_OSTEXT'     :   sortedData[label] = i_OSTEXT;               break;
                        case '_6shCheck'    :   // 處理檢查類別
                            sortedData[label] = _cgLog['_6shCheck']?.length > 0 
                                ? JSON.stringify(_cgLog['_6shCheck']).replace(/[\[{"}\]]/g, '').replace(/,/g, ';') : '';
                            break;
                        case '_7isCheck'    :   sortedData[label] = _cgLog['_7isCheck'] ? '是' : '否'; break;
                        case '_10content'   :   // 處理定檢資格
                            sortedData[label] = _cgLog['_6shCheck']?.length > 0 
                                ? `變更(${JSON.stringify(_cgLog['_6shCheck'].map(caseItem => caseItem.split(':')[1] ?? '')).replace(/[\[{"}\]]/g, '')})` : '';
                            break;
                        default             :   sortedData[label] = _cgLog[key] ?? ''; // 其他欄位處理
                    }
                });
            }
    
            return sortedData;
        });
    
        let htmlTableValue = JSON.stringify(sort_listData);
        document.getElementById(to_module + '_htmlTable').value = htmlTableValue;
    }