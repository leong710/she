
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
    // fun.2-1c 下載Excel
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
            "eh_time"       : "每日暴露時數",
            "shCondition"   : "資格驗證",
        };
        const shCase_keys = {
            "MONIT_LOCAL"   : "工作場所",
            "WORK_DESC"     : "工作內容",
            "HE_CATE"       : "檢查類別代號",
            "AVG_VOL"       : "均能音量",
            "AVG_8HR"       : "平均音壓"
        };
        const import_keys = {
            "yearHe"        : "項目類別代號",
            "yearCurrent"   : "檢查項目",
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
                                } else if(value !== undefined){                                 // 240909 這裡要追加過濾 沒有HE_CATE的項目...
                                    sortedData[subLabel] = sortedData[subLabel] ? `${sortedData[subLabel]}\r\n${(value || '')}` : (value || '');
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
                    sortedData[label] = staff[key] ? staff[key] : staff['shCase_logs'][currentYear][key];
                }
            });
    
            return sortedData;
        });
    
        let htmlTableValue = JSON.stringify(sort_listData);
        document.getElementById(to_module + '_htmlTable').value = htmlTableValue;
    }
    // p2_eventListener() step-3-3. p-2 監控按下[載入]鍵後----呼叫Excel載入

// modal：[searchStaff]
    // fun.2-2a：search Key_word
    async function search_fun(fun, searchkeyWord){
        return new Promise((resolve) => {
            mloading("show");                                               // 啟用mLoading
            // 製作查詢包裝：
            var request = {
                uuid         : 'e65fccd1-79e7-11ee-92f1-1c697a98a75f',      // nurse
                functionname : fun,                                         // 操作功能
                // search       : search                                    // 查詢對象key_word
            }

            // 功能與需求判斷：
            if(fun=='search'){                      // from 單筆新增>搜尋
                var search = $('#searchkeyWord').val().trim();              // search keyword取自user欄位
                    if(!search || (search.length < 2)){
                        $("body").mLoading("hide");
                        alert("查詢字數最少 2 個字以上!!");
                        resolve(false);
                        return false;
                    } 
                // 製作查詢包裝：
                request['search']       = search;

            }else if(fun=='rework_loadStaff'){      // from rework_loadStaff
                if(!searchkeyWord || (searchkeyWord.length < 8)){
                    $("body").mLoading("hide");
                    alert("查詢工號字數最少 8 個字!!");
                    resolve(false);
                    return false;
                }else{
                    // 製作查詢包裝：
                    request['functionname'] = 'search';         // 將fun切換功能成search
                    request['search']       = searchkeyWord;    // 將searchkeyWord帶入search
                }

            }else{                                  // fun錯誤返回
                resolve(false);
                return false;
            }

            // api主功能
            $.ajax({
                url: 'http://tneship.cminl.oa/api/hrdb/index.php',          // 正式2024新版
                method: 'post',
                dataType: 'json',
                data: request,
                success: function(res){
                    if(fun=='search'){
                        // 呼叫[fun.2-2b]將結果給postList進行渲染
                        postList(res["result"]).then(() => {
                            resolve();  // 等待 rework_staff 完成後再解析 Promise
                        });                           

                    }else if(fun=='rework_loadStaff'){
                        // rework_staff(res["result"]);
                        rework_staff(res["result"]).then(() => {
                            resolve();  // 等待 rework_staff 完成後再解析 Promise
                        });
                    }
                },
                error (err){
                    console.log("search error:", err);
                    $("body").mLoading("hide");
                    alert("查詢錯誤!!");
                    resolve();      // 當所有設置完成後，resolve Promise
                }
            })
        });
    }
    // fun.2-2b：渲染功能
    async function postList(res_r){
        return new Promise((resolve) => {
            // 定義表格頭段
            let div_result_table = document.getElementById('result_table');
                div_result_table.innerHTML = '';
            // 鋪設表格頭段thead
            let Rinner = "<thead><tr>"+ "<th>廠區</th>"+"<th>工號</th>"+"<th>姓名</th>"+"<th>職稱</th>"+"<th>部門代號</th>"+"<th>部門名稱</th>"+"<th>select</th>"+ "</tr></thead>" + "<tbody id='result_tbody'>"+"</tbody>";
                div_result_table.innerHTML += Rinner;
            // 定義表格中段tbody
            let div_result_tbody = document.getElementById('result_tbody');
                div_result_tbody.innerHTML = '';
            let len = res_r.length;
            for (let i=0; i < len; i++) {
                // 把user訊息包成json字串以便夾帶
                let user_json = JSON.stringify({
                        'emp_sub_scope' : res_r[i].emp_sub_scope.replace(/ /g, ''),
                        // 'emp_sub_scope' : res_r[i].emp_sub_scope,     // 人事子範圍名稱
                        'emp_id'        : res_r[i].emp_id,
                        'cname'         : res_r[i].cname,
                        'dept_no'       : res_r[i].dept_no,
                        'emp_dept'      : res_r[i].emp_dept,
                        'HIRED'         : res_r[i].HIRED,
                        'cstext'        : res_r[i].cstext,
                        'gesch'         : res_r[i].gesch,
                        'natiotxt'      : res_r[i].natiotxt,
                        'schkztxt'      : res_r[i].schkztxt,
                    });
                div_result_tbody.innerHTML += 
                    '<tr>' +
                        '<td>' + res_r[i].emp_sub_scope + '</td>' +
                        '<td>' + res_r[i].emp_id +'</td>' +
                        '<td>' + res_r[i].cname + '</td>' +
                        '<td>' + res_r[i].cstext + '</td>' +
                        '<td>' + res_r[i].dept_no + '</td>' +
                        '<td>' + res_r[i].emp_dept+ '</td>' +
                        '<td class="text-center">' + '<button type="button" class="btn btn-default btn-xs" id="'+res_r[i].emp_id+'" value='+user_json+' onclick="tagsInput_me(this.value)">'+
                        '<i class="fa-regular fa-circle"></i></button>' + '</td>' +
                    '</tr>';
            }
            $("body").mLoading("hide");                                 // 關閉mLoading
            // 當所有設置完成後，resolve Promise
            resolve();
        });
    }
    // fun.2-2c：點選、渲染模組+套入
    function tagsInput_me(val) {
        if (val !== '') {
            val = `[${val}]`;
            const tagsInput_me_arr = JSON.parse(val);   // 將物件字串轉成陣列
            mgInto_staff_inf(tagsInput_me_arr);         // 呼叫[...]進行 合併+渲染
            $('#searchkeyWord').val('');                // 清除searchkeyWord
            $('#result_table').empty();                 // 清除搜尋頁面資料
            inside_toast(`新增單筆資料...Done&nbsp;!!`); // [fun.0-2]
            searchUser_modal.hide();                    // 關閉頁面
        }
    }