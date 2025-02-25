
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
            console.log('請確認資料是否正確');
            warningText_1.style.display = "block";          // 警告文字--顯示
            warningText_2.style.display = "block";
            import_excel_btn.style.display = "none";        // 載入按鈕--隱藏

        }else{
            // console.log('找不到 < ? > 元素');
        }
    };
    // fun.2-1c 下載Excel...要修正
    function downloadExcel(to_module) {
        if(staff_inf.length === 0){
            return;
        }
        const item_keys = {
            "emp_sub_scope" : "廠區",
            "dept_no"       : "部門代碼",
            "emp_dept"      : "部門名稱",
            "emp_id"        : "工號",
            "cname"         : "姓名",
            "shCase"        : "特作項目",
            "shCondition"   : "資格驗證",
            "_content"      : "import"
        };
        const shCase_keys = {
            "OSTEXT_30"     : "工作廠區",
            "HE_CATE"       : "檢查類別代號",
            "MONIT_LOCAL"   : "工作場所",
            "WORK_DESC"     : "工作內容",
            "AVG_VOL"       : "A權音壓級(dBA)",
            "AVG_8HR"       : "日時量平均(dBA)",
            "eh_time"       : "每日暴露時數"
        };
        const import_keys = {
            "yearHe"        : "檢查類別",
            "yearCurrent"   : "檢查代號",
            "yearPre"       : "去年檢查項目"
        };
        let sort_listData = staff_inf.map((staff) => {
            let sortedData = {};
            // 處理主欄位
            Object.entries(item_keys).forEach(([key, label]) => {
                if (key === 'shCase') {
                    if(staff['shCase'].length >0){
                        staff['shCase'].forEach((caseItem) => {
                            // 處理 shCase 的子欄位
                            Object.entries(shCase_keys).forEach(([subKey, subLabel]) => {       
                                const value = caseItem[subKey];
                                if (subKey === 'HE_CATE' && value !== undefined) {
                                    const heCate = JSON.stringify(value).replace(/[{"}]/g, '');
                                    sortedData[subLabel] = sortedData[subLabel] ? `${sortedData[subLabel]}\r\n${heCate}` : heCate;

                                }else if (subKey === 'eh_time') {
                                    const eh_time = staff.eh_time ?? null;
                                    // sortedData[subLabel] = sortedData[subLabel] ? `${sortedData[subLabel]}\r\n${eh_time}` : eh_time;
                                    sortedData[subLabel] = eh_time;

                                } else if(value !== undefined){                                 // 240909 這裡要追加過濾 沒有HE_CATE的項目...
                                    sortedData[subLabel] = sortedData[subLabel] ? `${sortedData[subLabel]}\r\n${(value || '')}` : (value || '');

                                } else if(value === undefined) {
                                    sortedData[subLabel] = sortedData[subLabel] ? `${sortedData[subLabel]}\r\n${''}` : '';
                                }
                            });
                        });
                        
                    }else{  // 預防shCase是空值，仍必須把表頭寫入。
                        Object.entries(shCase_keys).forEach(([subKey, subLabel]) => {
                            sortedData[subLabel] = '';
                        });
                    }

                } else if (key === 'shCondition') {
                    const shCondition = staff[key];
                    // 過濾出 value = true 的鍵值對
                    let shCondition_true = Object.fromEntries(
                        Object.entries(shCondition).filter(([key, value]) => value === true)        // 這裡不能用;結尾...要注意!
                    );
                    shCondition_true = JSON.stringify(shCondition_true).replace(/[{"}]/g, '').replace(/,/g, ',\r\n');
                    sortedData[label] = shCondition_true;

                } else if (key === '_content') {
                    const _import = staff[key][currentYear][label];
                    Object.entries(import_keys).forEach(([iKey, iLabel]) => {       
                        const value = _import[iKey];
                        if(value !== undefined){
                            sortedData[iLabel] = JSON.stringify(value).replace(/[{"}]/g, '').replace(/,/g, ',\r\n');
                        }else{
                            sortedData[iLabel] = '';
                        }
                    });

                } else {
                    sortedData[label] = staff[key] ? staff[key] : staff['_logs'][currentYear][key];
                }
            });
    
            return sortedData;
        });
    
        let htmlTableValue = JSON.stringify(sort_listData);
        document.getElementById(to_module + '_htmlTable').value = htmlTableValue;
    }