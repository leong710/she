// modal：[load_excel] 以下為上傳後"iframe"的部分
    // fun.2-1a 阻止檔案未上傳導致的錯誤。 // 請注意設置時的"onsubmit"與"onclick"。
        // loadExcelForm()保留在staff_excel.js
    // fun.2-1b
        // iframeLoadAction()保留在staff_excel.js
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
                        let _changeValue = (iKey === 'yearPre') ? staff._changeValue : '';  // 250407 連動變更作業項目 主要for下載作業年度 (3部分: 1.staff.js>mgInto_staff_inf、2.utility.js>show_preYearShCase、3.excel.js>downloadExcel)
                        if(value !== undefined){
                            let yearPre_str = JSON.stringify(value).replace(/[{"}]/g, '').replace(/,/g, ',\r\n')
                            if(iKey === 'yearPre'){
                                yearPre_str += (yearPre_str !== '' && _changeValue !== '' ) ? ',\r\n' + _changeValue : _changeValue ;
                            }
                            sortedData[iLabel] = yearPre_str;
                        }else{
                            sortedData[iLabel] = ''+_changeValue;
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
// modal：[load_excel] 以上為上傳後"iframe"的部分

// p2_eventListener() step-3-3. p-2 監控按下[載入]鍵後----呼叫Excel載入
// modal：[searchStaff]
    // fun.2-2a：search Key_word
    async function search_fun(fun, searchkeyWord){
        return new Promise((resolve) => {
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
                searchkeyWord = (searchkeyWord).trim();
                if(!searchkeyWord || (searchkeyWord.length < 8)){
                    $("body").mLoading("hide");
                    alert("查詢工號字數最少 8 個字!!");
                    resolve(false);
                    return false;
                }
                // 製作查詢包裝：
                request['functionname'] = 'search';         // 將fun切換功能成search
                request['search']       = searchkeyWord;    // 將searchkeyWord帶入search

            }else if(fun=='in_sign' || fun=='assignOmager'){      // from in_sign
                if(!searchkeyWord || (searchkeyWord.length < 8)){
                    $("body").mLoading("hide");
                    alert("查詢工號字數最少 8 個字!!");
                    resolve(false);
                    return false;
                }
                // 製作查詢包裝：
                request['functionname'] = 'search';                // 將fun切換功能成in_sign
                request['search']       = searchkeyWord.trim();     // 將searchkeyWord帶入search

                $('#'+fun+'Badge', '#'+fun+'Name').empty();

            }else if(fun=='showSignCode'){          // from 搜尋部門主管
                searchkeyWord = (searchkeyWord).trim();
                if(!searchkeyWord || (searchkeyWord.length < 8)){
                    $("body").mLoading("hide");
                    alert("查詢字數最少 8 個字以上!!");
                    resolve(false);
                    return false;
                } 
                // 製作查詢包裝：
                request['sign_code'] = searchkeyWord;    // 將searchkeyWord帶入search

            }else if(fun=='showEmpInfo'){          // from 搜尋員工資料
                searchkeyWord = (searchkeyWord).trim();
                if(!searchkeyWord || (searchkeyWord.length < 8)){
                    $("body").mLoading("hide");
                    alert("查詢字數最少 8 個字以上!!");
                    resolve(false);
                    return false;
                } 
                // 製作查詢包裝：
                request['functionname'] = 'search';         // 將fun切換功能成search
                request['search'] = searchkeyWord;    // 將searchkeyWord帶入search

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
                        rework_staff(res["result"]).then(() => {
                            resolve();  // 等待 rework_staff 完成後再解析 Promise
                        });

                    }else if(fun=='in_sign' || fun=='assignOmager'){      // from in_sign
                        let res_r = res["result"];
                        // 將結果進行渲染
                        if (res_r.length !== 0) {
                            let obj_val = res_r[0];                                         // 取Object物件0
                            $('#'+fun+'Badge').append('<div class="tag">' + obj_val.cname + '<span class="remove">x</span></div>');
                            document.getElementById(fun+'Name').value = obj_val.cname;   // 帶入待簽人姓名
                        }else{
                            alert('查無工號：'+ search +' !!');
                        }
                        $("body").mLoading("hide");

                    }else if(fun=='showSignCode'){
                        resolve(res["result"]);  // 等待  完成後再解析 Promise

                    }else if(fun=='showEmpInfo'){
                        resolve(res["result"]);  // 等待  完成後再解析 Promise
                    }
                },
                error (err){
                    console.error("search error:", err);
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
                        // 'emp_sub_scope' : res_r[i].emp_sub_scope,
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
            val = '['+val+']';
            const tagsInput_me_arr = JSON.parse(val);   // 將物件字串轉成陣列
            mgInto_staff_inf(tagsInput_me_arr);         // 呼叫[...]進行 合併+渲染
            $('#searchkeyWord').val('');                // 清除searchkeyWord
            $('#result_table').empty();                 // 清除搜尋頁面資料
            inside_toast(`新增單筆資料...Done&nbsp;!!`); // [fun.0-2]
            searchUser_modal.hide();                    // 關閉頁面
        }
    }

    // fun3-2：in_sign上層主管：移除單項模組
    $('#in_signBadge').on('click', '.remove', function() {
        $(this).closest('.tag').remove();                         // 自畫面中移除
        document.getElementById('in_sign').value = '';            // 將欄位cname清除
        document.getElementById('in_signName').value = '';        // 將欄位in_signName清除
        $('#in_signBadge').empty();
    });
    $('#assignOmagerBadge').on('click', '.remove', function() {
        $(this).closest('.tag').remove();                         // 自畫面中移除
        document.getElementById('assignOmager').value = '';       // 將欄位cname清除
        document.getElementById('assignOmagerName').value = '';   // 將欄位assignOmagerName清除
        $('#assignOmagerBadge').empty();
    });

