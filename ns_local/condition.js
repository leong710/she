    
    // 吐司顯示字條 // init toast
    function inside_toast(sinn){
        let toastLiveExample = document.getElementById('liveToast');
        let toast = new bootstrap.Toast(toastLiveExample);
        let toast_body = document.getElementById('toast-body');
        toast_body.innerHTML = sinn;
        toast.show();
    }

    // 20231128_下載Excel
    // function submitDownloadExcel() {
        // 這裡的功能已經在post_result中的excel預備工作1~4完成，所以取消此FUN
    // }
    // 240717 取出不重複的dcc_no清單    // callFrom: post_result
    function getUniqueDccNoList(arr) {
        const uniqueDccNos = new Set(arr.map(item => item.dcc_no));
        return Array.from(uniqueDccNos);
    }
    // 240717 取出dcc_no表單            // callFrom: 
    async function getDccNoForm(dccNoList) {
        // console.log('getDccNoForm...', dccNoList)
        let dccNoListResult = {};
        // 確保 dccNoList 是一個數組
        if (!Array.isArray(dccNoList)) {
            dccNoList = [dccNoList];
        }

        const promises = dccNoList.map(async dccNo => {
            if (!dccNoListResult[dccNo]) {
                dccNoListResult[dccNo] = [];
            }
            let result = await load_fun('form', dccNo, gain_bigData);
            dccNoListResult[dccNo].push(result);
        });

        await Promise.all(promises); // 等待所有的 load_fun 調用完成
        return dccNoListResult; // 返回結果對象
    }
    // 240717 陣列排序                  // callFrom: post_result
    function sortArrayByDccNo(arr) {
        return arr.sort((a, b) => {
            if (a.dcc_no < b.dcc_no) {
                return -1;
            }
            if (a.dcc_no > b.dcc_no) {
                return 1;
            }
            return 0;
        });
    }

    // 240702 
    async function eventListener(){
        return new Promise((resolve) => { 
            // 監聽送出[查詢]按鈕
            document.getElementById('search_btn').addEventListener('click', function() {

                // step0.初始定義
                    mloading(); 
                    const btn_value = this.value;
                    const queryItem = document.getElementById('query_item');
                    const elements = queryItem.querySelectorAll('select, input');
                    const queryItem_obj = {};
                
                // step1.取出查詢條件並打包queryItem_obj：
                    elements.forEach(({ name, value, type, checked }) => {
                        if (name) {
                            if (type === 'radio') {                     // 個案處理：radio要找出被checked的項目才能帶入
                                if (checked) {              
                                    queryItem_obj[name] = value;
                                }
                            } else if (type === 'checkbox') {           // 個案處理：checkbox屬於陣列
                                if(queryItem_obj[name] === undefined){  // 初始建立[]
                                    queryItem_obj[name] = [];
                                }
                                if (checked) {                          // 找出被checked的項目才能帶入
                                    queryItem_obj[name].push(value);
                                }
                            } else {
                                queryItem_obj[name] = value ? value : null;
                            }
                        }
                    });

                // step2.清空result_table裡的內容
                    $('#result_table thead tr').empty();
                    $('#result_table tbody').empty();
                    $('#htmlTable').value = '';                         // excel預備工作 0.清空接收欄位

                // step3.強制檢查idty長度是否為空值，true= 給一個result_obj空陣列，以防止出錯。
                    if(queryItem_obj['idty[]'].length <= 0){
                        alert('idty / 結案狀態 is empty!!');
                        let result_obj = [];
                        post_result('condition', result_obj)

                    }else{
                        // step3.false= 呼叫load_fun，帶入查詢條件queryItem_obj，完成後callBack post_result進行渲染+鋪設
                            load_fun('condition', queryItem_obj, post_result);
                    }
            });

            // 監聽工作起訖日欄位(id=a_work_e)，自動確認是否結束大於開始
            $('#created_at_form, #created_at_to').change(function() {
                let currentDate = new Date().toISOString().split('T')[0];   // 取得今天的日期部分
                let created_at_form = $("#created_at_form").val();          // 取得起始
                let created_at_to   = $("#created_at_to").val();            // 取得訖止

                let pet_created_at_form = created_at_form ? new Date(created_at_form).toISOString().split('T')[0] : '2000-01-01';
                let pet_created_at_to   = created_at_to   ? new Date(created_at_to).toISOString().split('T')[0]   : currentDate;

                // 工作起始需不需要小於現在時間....需要確認
                if(this.id == 'created_at_form'){
                    let confirm_pet_from = pet_created_at_form <= currentDate ;
                    $("#created_at_form").removeClass("is-valid is-invalid").addClass(confirm_pet_from ? "is-valid" : "is-invalid");
                }
                // 訖止時間需大於起始時間....
                let confirm_pet_to = (pet_created_at_to <= currentDate && pet_created_at_to >= pet_created_at_form) ;
                $("#created_at_to").removeClass("is-valid is-invalid").addClass( confirm_pet_to ? "is-valid" : "is-invalid");
            });

            // 監聽廠區欄位(id=_site_id)，自動對應fab棟別
            $('#_site_id').change(function() {
                const site_value = document.getElementById('_site_id').value;
                document.querySelectorAll("._fab").forEach(element => {
                    element.hidden = !element.classList.contains(site_value);
                });
            });


            resolve(); // 文件載入成功，resolve
        });
    }
    // 240702 監聽[事故分類]選項對應出[災害類型]
    async function eventListener_correspond(target_class){
        return new Promise((resolve) => { 
            const corresponds = document.querySelectorAll(".correspond");
            const targetClass = document.querySelector('#'+target_class);
                corresponds.forEach(el => el.hidden = true);

            targetClass.addEventListener('change', function() {
                corresponds.forEach(el => el.hidden = true);

                const selectedOption = this.options[this.selectedIndex];    // 取得所選中的<option>元素
                const this_flag = selectedOption.getAttribute('flag');      // 用.getAttribute('flag')取得自訂flag屬性
                document.querySelectorAll("." + this_flag).forEach((selectedElement) => {
                    selectedElement.hidden = false; 
                    let parentId = selectedElement.parentElement.id;        // 查詢 selectedElement 上一層的 ID
                    let parentElement = document.getElementById(parentId);
                    if (parentElement) {
                        parentElement.value = "";                           // 将 value 设为默认选项的 value
                    }
                });
            });
            resolve(); // 文件載入成功，resolve
        });
    }
    // 240702 監聽[事件類別](表單類別)-對應選項功能
    async function eventListener_shortName(target_class){
        return new Promise((resolve) => { 
            const targetClass = document.querySelector('#'+target_class);
            const s2_combo_07 = document.getElementById('s2_combo_07');     // 事故分類
            const s2_combo_08 = document.getElementById('s2_combo_08');     // 災害類型
                
            targetClass.addEventListener('change', function() {
                if(this.value.includes('廠外交通')){   
                    s2_combo_07.value = "";
                    s2_combo_08.value = "";
                    s2_combo_07.setAttribute("disabled", "disabled");
                    s2_combo_08.setAttribute("disabled", "disabled");
                }else{
                    s2_combo_07.removeAttribute("disabled");
                    s2_combo_08.removeAttribute("disabled");
                }
            });
            resolve(); // 文件載入成功，resolve
        });
    }

    // 20240501 -- // 動態表單--JSON轉表單  // callFrom: loadData > load_fun
    function bring_form(fun, form_json){
        let combo_item = form_json.item;                                // 抓item項目for form item
        if(combo_item){                                                 // confirm form_item is't empty
            // step_2.生成問項...將每一筆繞出來
            Object(combo_item).forEach((item_value)=>{
                let int_a = '';
                Object(item_value.options).forEach((option)=>{
                    if (typeof option.value === 'object') {
                        Object(option.value).forEach((key_value)=>{
                            int_a += '<option value="'+key_value['label']+'" class="' + option.label + (item_value.correspond != undefined ? ' correspond' : '') + '" ' 
                                + ((option.flag !== undefined) ? 'flag="' + option.flag + '"' : '')
                                + ' >' + option.label + ' ' + key_value['label'] + '</option>' 
                        } )
                        
                    }else {
                        int_a += '<option value="'+option.label+'" class="' + item_value.name + '" '
                        + ((option.flag !== undefined) ? 'flag="' + option.flag + '"' : '') + ' id="' + item_value.name + '_' + option.value + '" '
                        + ' >' + option.value + ' ' + option.label + '</option>' 
                    }
                }) 

                $("#"+item_value.name).append(int_a);
                if(item_value.correspond !== undefined){                // 240613 判斷是否需要啟動對應選項 for 災害類型
                    eventListener_correspond(item_value.correspond);
                }
            })
            return true;
        } else {
            return false;
        }
    }
    // 主功能2.渲染/鋪設                    // callFrom: 
    async function gain_bigData(fun, gain_obj){
        switch(fun){
            case 'form':        // 鋪設DCC表單
                // console.log('fun: gain_bigData...form:' , fun , gain_obj);
                for (const [key, value] of Object.entries(gain_obj)) {
                    if (typeof value === 'object') {
                        for (const [o_key, o_value] of Object.entries(value)){
                            if (typeof o_value === 'object') {
                                o_value.item.forEach((o_value_item)=>{
                                    // doc_keys[o_value_item.name] = { 'label' : o_value_item.label};       // ** 建立表單key：主要是document中有可能填寫不完整，而造成缺項
                                    let ovv = (typeof o_value_item === 'object') ? o_value_item.label : o_value_item ;
                                    if(doc_keys[o_value_item.name] === undefined){
                                        doc_keys[o_value_item.name] = ovv;
                                    }else if(doc_keys[o_value_item.name] !== ovv){
                                        doc_keys[o_value_item.name] += ' / ' + ovv;
                                    }
                                }) 
                            }else {
                                // console.log('not-object_2:', o_key, o_value);
                            }
                        } 
                    }else {
                        // console.log('not-object_1: ',key, value);
                    }
                }
                break;

            default :
                throw new Error(`Unknown function: ${fun}`);
        }
    }
    // 主功能1.抓資料 新版改用fetch
    async function load_fun(fun, parm, myCallback) {        // parm = 參數
        try {
            let formData = new FormData();
            let fun_temp = (parm['_get_dccNo'] !== undefined && parm['_get_dccNo'] === true ) ? 'caseList' : fun;
            formData.append('fun', fun_temp);
            // 主要for doc多參數
                if (typeof parm === 'object') {
                    for (const [_key, _value] of Object.entries(parm)){
                        formData.append(_key, _value);              // 後端依照fun進行parm參數的採用
                    } 
                }else {
                    formData.append('parm', parm);                  // 後端依照fun進行parm參數的採用
                }

            let response = await fetch('load_fun.php', {
                method: 'POST',
                body  : formData
            });

            if (!response.ok) {
                $("body").mLoading("hide");
                throw new Error('fun load：' + fun + ' is failed. Please try again.');
            }

            let responseData = await response.json();
            let result_obj = responseData['result_obj'];    // 擷取主要物件
            return myCallback(fun, result_obj);             // resolve(true) = 表單載入成功，then 呼叫--myCallback
                                                            // myCallback：form = bring_form() 、document = edit_show() 、locals = ? 還沒寫好
        } catch (error) {
            throw error;                                    // 載入失敗，reject
        }
    }
    // 子功能：將查詢得到的資料進行整理與渲染   // callFrom: eventListener(search_btn) > load_fun
    async function post_result(fun, result_obj){
        // console.log('post_result...', result_obj);
        downloadExcel.setAttribute("disabled", "disabled");                         // 將匯出鈕加上 daiabled
        const result_obj_dccNo = getUniqueDccNoList(result_obj)                     // 取出不重複的dcc_no清單
        await getDccNoForm(result_obj_dccNo);                                       // 把dccForm取出所有的key/label => doc_keys
        const sort_doc_keys = await sortArrayByDccNo(doc_keys);
        let sort_listData = [];                                                     // excel預備工作 1.建立大陣列

        if(result_obj.length != 0){
            // step1.鋪表頭
                for (const [_key, _value] of Object.entries(doc_list_keys)){        // 表頭1.外層
                    $('#result_table thead tr').append('<th>'+_value+'</th>');
                }
                for (const [_key, _value] of Object.entries(content_keys)){         // 表頭2._content指定項目
                    $('#result_table thead tr').append('<th>'+_value+'</th>');
                }

            // step2.鋪body
                Object(result_obj).forEach((_doc)=>{
                    let o_doc_item = '';
                    let sort_listRow = {};      // excel預備工作 2.建立小物件
                    // step2-1.先處理doc外層doc_list_keys
                    for (const [list_key, _value] of Object.entries(doc_list_keys)){
                        if(list_key == 'anis_no'){
                            o_doc_item += '<td><button type="button" value="../interView/form.php?action=review&uuid='+_doc['uuid']+'" '
                            o_doc_item += 'class="tran_btn" onclick="openUrl(this.value)" data-toggle="tooltip" data-placement="bottom" title="檢視問卷">'+_doc[list_key]+'</button></td>';
                            // excel預備工作 3.採集資料
                            sort_listRow[_value] = (typeof _doc[list_key] === 'array' || typeof _doc[list_key] === 'object') ? _doc[list_key].toString() : _doc[list_key];

                        }else if(list_key == '_content'){
                            o_doc_item += '<td>'+_doc[list_key]['s2_combo_06']+'</td>';
                            // excel預備工作 3.採集資料
                            sort_listRow[_value] = (typeof _doc[list_key]['s2_combo_06'] === 'array' || typeof _doc[list_key]['s2_combo_06'] === 'object') ? _doc[list_key]['s2_combo_06'].toString() : _doc[list_key]['s2_combo_06'];
                        
                        }else if(list_key == 'idty'){
                            let _idty = _doc[list_key];
                            switch(_idty){
                                case '1':   _idty = '立案/簽核中';  break;
                                case '10':  _idty = '完成訪談';         break;
                                case '6':   _idty = '暫存';         break;
                                case '3':   _idty = '取消';         break;
                                default:
                            }
                            o_doc_item += '<td>'+_idty+'</td>';
                            // excel預備工作 3.採集資料
                            sort_listRow[_value] = _idty;
                        
                        }else{
                            o_doc_item += '<td>'+_doc[list_key]+'</td>';
                            // excel預備工作 3.採集資料
                            sort_listRow[_value] = (typeof _doc[list_key] === 'array' || typeof _doc[list_key] === 'object') ? _doc[list_key].toString() : _doc[list_key];
                        }
                    }
                    // step2-2.再處理doc內層content_keys
                    for (const [_key, _value] of Object.entries(content_keys)){
                        if (typeof _doc['_content'][_key] === 'string' && _doc['_content'][_key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
                            _doc['_content'][_key] = _doc['_content'][_key].replace('T', ' ');
                        }
                        o_doc_item += (_doc['_content'][_key] !== undefined) ? '<td>'+_doc['_content'][_key]+'</td>' : '<td>--</td>';
                    }
                    $('#result_table tbody').append('<tr>'+ o_doc_item +'</tr>');
                    // step2-3.再處理doc_keys
                    for (const [_key, _value] of Object.entries(sort_doc_keys)){
                        if (typeof _doc['_content'][_key] === 'string' && _doc['_content'][_key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
                            _doc['_content'][_key] = _doc['_content'][_key].replace('T', ' ');
                        }
                        // excel預備工作 3.採集資料
                        if(_doc['_content'][_key] !== undefined ){
                            sort_listRow[_value+'\r\n('+_key+')'] = (typeof _doc['_content'][_key] === 'array' || typeof _doc['_content'][_key] === 'object') ? _doc['_content'][_key].toString() : _doc['_content'][_key];
                        }else{
                            sort_listRow[_value+'\r\n('+_key+')'] = '--';
                        }
                    }
                    sort_listData.push(sort_listRow);                                   // excel預備工作 4.匯入採集資料
                })
            htmlTable.value = JSON.stringify(sort_listData);                            // excel預備工作 5.貼上採集資料到接收欄位

            downloadExcel.removeAttribute("disabled");                                  // 將匯出鈕取消 daiabled

        }else{
            $('#result_table tbody').append('-- 查無符合條件記錄 --');
        }
        $("body").mLoading("hide");
    }

    // 20240502 -- (document).ready(()=> await 依序執行step 1 2 3
    async function loadData() {
        try {
            // step_1 load_form(s2_combo) THEN bring_form(JSON轉表單) 帶入07事故分類、08災害類型，判斷增加eventListener_correspond(監聽[事故分類]選項對應出[災害類型])
            await load_fun('form', 's2_combo', bring_form); 
            await eventListener();                           // step_2 eventListener(監聽送出[查詢]按鈕);
            await eventListener_shortName('_short_name');    // step_3 eventListener(監聽[事件類別](表單類別)-對應選項功能);

        } catch (error) {
            console.error(error);
        }
    }
        
    $(function () {     // (document).ready
        // 在任何地方啟用工具提示框
        $('[data-toggle="tooltip"]').tooltip();

        // 20240502 -- 調用 loadData 函數來載入數據 await 依序執行step 1 2 3
        loadData();
    })