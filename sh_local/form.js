
    // 吐司顯示字條 // init toast
    function inside_toast(sinn){
        let toastLiveExample = document.getElementById('liveToast');
        let toast = new bootstrap.Toast(toastLiveExample);
        let toast_body = document.getElementById('toast-body');
        toast_body.innerHTML = sinn;
        toast.show();
    }
    
    // 240809 清除'噪音'AVG_VOL和AVG_8HR classList
    var HE_CATEDiv  = document.getElementById('HE_CATE');
    var avgVolInput = document.getElementById('AVG_VOL');
    var avg8HrInput = document.getElementById('AVG_8HR');
        function remove_invalid(){
            avgVolInput.classList.remove('is-invalid');
            avg8HrInput.classList.remove('is-invalid');

            avgVolInput.classList.remove('is-valid');
            avg8HrInput.classList.remove('is-valid');

            HE_CATEDiv.classList.remove('is-valid');
            HE_CATEDiv.classList.add('is-invalid');
        }
        function checkAVG(noiseCheckbox){
            if(noiseCheckbox){
                if(avgVolInput.value){
                    avgVolInput.classList.add('is-valid');
                }
                if(avg8HrInput.value){
                    avg8HrInput.classList.add('is-valid');
                }
            }
        }

    // 240815 清除he_cate required
    function remove_required(){
        const heCateContainer = document.getElementById('HE_CATE');
        const heCates = Array.from(heCateContainer.querySelectorAll('input[type="checkbox"]'));
        const selectedItems = {};
        // const selectedValues = heCates.filter(cb => cb.checked).map(cb => cb.value);
        heCates.forEach((cb) => {
            if (cb.checked) {
                const key = cb.getAttribute('data-key');
                const value = cb.value;
                selectedItems[key] = value;
            }
        });
        console.log(selectedItems);
        
        if (Object.keys(selectedItems).length > 0) { // 有選
            heCateContainer.classList.remove('is-invalid');
            heCateContainer.classList.add('is-valid');
            heCates.forEach(cb => {
                cb.required = false;
                cb.disabled = !cb.checked;              // 241126 多選checkbox改單選radio
            });
        } else { // 沒選
            heCateContainer.classList.remove('is-valid');
            heCateContainer.classList.add('is-invalid');
            heCates.forEach(cb => {
                cb.required = true;
                cb.disabled = false;                    // 241126 多選checkbox改單選radio
            });
        }
    }


    // 20240506 saveSubmit modal添加save功能
    function saveSubmit_modal(idty_title){
        $('#modal_action').empty().append(idty_title);              // 清除model標題 和 炫染model標題
        if(action == 'edit'){
            $('#saveSubmit .modal-header').removeClass('bg-success bg-warning text-dark').addClass("bg-primary text-white");    // 切換標題底色-綠
        }else{
            $('#saveSubmit .modal-header').removeClass('bg-primary bg-warning text-dark').addClass("bg-success text-white");    // 切換標題底色-藍
        }
    }

// // searchModal function 
    // fun_0.清除searchModal
    function resetMain(){
        $("#result").removeClass("border rounded bg-white");
        $('#result_table').empty();                                 // 搜尋清單
    }
    // fun_1.search Key_word
    function search_fun(fun){
        mloading("show");                                           // 啟用mLoading

        if(fun=='search'){
            var search = $('#user').val().trim();                       // search keyword取自user欄位
            if(!search || (search.length < 2)){
                $("body").mLoading("hide");
                alert("查詢字數最少 2 個字以上!!");
                return false;
            } 
            var request = {
                functionname : 'search',                                // 操作功能
                uuid         : uuid,                                    // ppe
                search       : search                                   // 查詢對象key_word
            }

        }else if(fun=='showSignCode'){
            var search = $('#OSHORT').val().trim();               // search keyword取自user欄位
            if(!search || (search.length < 5)){
                $("body").mLoading("hide");
                alert("查詢字數最少 5 個字以上!!");
                return false;
            } 
            var request = {
                functionname : fun,                                 // 操作功能
                uuid         : uuid,                                // ppe
                sign_code    : search                               // 查詢對象key_word
            }

        }else{
            return false;
        }

        $.ajax({
            url: 'http://tneship.cminl.oa/api/hrdb/index.php',      // 正式2024新版
            method: 'post',
            dataType: 'json',
            data: request,
            success: function(res){
                let res_r = res["result"];
                postList(res_r);                                    // 將結果轉給postList進行渲染
            },
            error (err){
                console.log("search error:", err);
                alert("查詢錯誤!!");
            }
        })
        $("body").mLoading("hide");                                 // 關閉mLoading
    }
    // fun_2.渲染功能
    function postList(res_r){
        // 清除表頭
        $('#result_table').empty();
        $("#result").addClass("bg-white");
        // 定義表格頭段
        let div_result_table = document.querySelector('.result table');
        let Rinner = "<thead><tr>"+"<th>部門代號</th>" + "<th>部門名稱</th>"+"<th>OSTEXT_20</th>"+"<th>OFTEXT</th>"+"<th>select</th>" + "</tr></thead>" + "<tbody id='tbody'>"+"</tbody>";
        // 鋪設表格頭段thead
        div_result_table.innerHTML += Rinner;
        // 定義表格中段tbody
        let div_result_tbody = document.querySelector('.result table tbody');
        $('#tbody').empty();
        for (let i=0; i < res_r.length; i++) {
            // 把user訊息包成json字串以便夾帶
            let user_json = {
                    'OSHORT'   : res_r[i].OSHORT.trim(),
                    'OSTEXT'   : res_r[i].OSTEXT.trim(),
                };
            div_result_tbody.innerHTML += 
                '<tr>' +
                    '<td>' + res_r[i].OSHORT + '</td>' + '<td>' + res_r[i].OSTEXT + '</td>' + '<td>' + res_r[i].OSTEXT_20 + '</td>' + '<td>' + res_r[i].OFTEXT + '</td>' +
                    '<td>' + '<button type="button" class="btn btn-outline-primary btn-xs add_btn" id="'+res_r[i].emp_id+'" value=\''+ JSON.stringify(user_json) +'\' onclick="tagsInput_me(this.value)">'+
                    '<i class="fa-regular fa-circle"></i></button>' + '</td>' +
                '</tr>';
        }
        $("body").mLoading("hide");                                 // 關閉mLoading
        searchModal.show();                                    // 切到searchModal頁面
    }
    // fun_3.點選、渲染模組
    function tagsInput_me(val) {
        if (val !== '') {
            let obj_val = JSON.parse(val);
            // 渲染
            Object.entries(obj_val).forEach(function([o_key, o_value]){
                let tag_key = document.getElementById(o_key);
                if(tag_key){
                    tag_key.value = o_value;
                    $("#"+o_key).addClass("autoinput");
                }
            })
            resetMain();
            searchModal.hide();      // 切到searchModal頁面
        }
    }
// // searchModal function 

    async function eventListener(){
        return new Promise((resolve) => { 
            // 在任何地方啟用工具提示框
            $('[data-toggle="tooltip"]').tooltip();
            // 20230817 禁用Enter鍵表單自動提交 
            document.onkeydown = function(event) { 
                var target, code, tag; 
                if (!event) { 
                    event = window.event;       //針對ie瀏覽器 
                    target = event.srcElement; 
                    code = event.keyCode; 
                    if (code == 13) { 
                        tag = target.tagName; 
                        if (tag == "TEXTAREA") { return true; } 
                        else { return false; } 
                    } 
                } else { 
                    target = event.target;      //針對遵循w3c標準的瀏覽器，如Firefox 
                    code = event.keyCode; 
                    if (code == 13) { 
                        tag = target.tagName; 
                        if (tag == "INPUT") { return false; } 
                        else { return true; } 
                    } 
                } 
            };
            // 監聽表單內的 OSHORT 和 OSTEXT 變更事件--外框提示
                $('#OSHORT, #OSTEXT').on('change', function() {
                    updateParentBorder(this);
                });
            // 監聽所有 name="OSHORT" 和 name="OSTEXT" 的元素變更事件--外框提示
                document.querySelectorAll('[name="OSHORT"], [name="OSTEXT"]').forEach((element) => {
                    element.addEventListener('change', function() {
                        updateParentBorder(this);
                    });
                });
            // 共用的更新函數--外框提示
                function updateParentBorder(element) {
                    $(element).removeClass('autoinput');  // 移除自身的 autoinput 類
                    const parentElement = element.closest('.some-parent-class'); // 查找最近的父元素 (需要替換 .some-parent-class 為實際的 class)
                    if (parentElement) {
                        parentElement.classList.add('border');  // 父元素添加 border 類
                        parentElement.classList.remove('autoinput');  // 父元素移除 autoinput 類
                    }
                }

            // 240813 監聽 checkbox 是否有值
                const heCateContainer = document.getElementById('HE_CATE');
                const heCates = Array.from(heCateContainer.querySelectorAll('input[type="checkbox"]'));
                heCates.forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        const selectedValues = heCates.filter(cb => cb.checked).map(cb => cb.value);
                        // console.log('he_cate...', this.value, this.checked);
                        if (selectedValues.length > 0) { // 有選
                            heCateContainer.classList.remove('is-invalid');
                            heCateContainer.classList.add('is-valid');
                            heCates.forEach(cb => {
                                cb.required = false;
                                cb.disabled = !cb.checked;              // 241126 多選checkbox改單選radio
                            });
                        } else { // 沒選
                            heCateContainer.classList.remove('is-valid');
                            heCateContainer.classList.add('is-invalid');
                            heCates.forEach(cb => {
                                cb.required = true;
                                cb.disabled = false;                    // 241126 多選checkbox改單選radio
                            });
                        }
                    });
                });
            // 240813 監聽 checkbox 是否有值
            // 240809 監聽'噪音'checkbox 
                // 选择 noiseCheckbox、AVG_VOL 和 AVG_8HR 元素
                const noiseCheckbox = document.querySelector('#HE_CATE input[type="checkbox"][value="噪音"]');
                // 定义一个函数来检查输入框的状态
                function checkInputs() {
                    if (avgVolInput.value.trim() !== "" || avg8HrInput.value.trim() !== "") {
                        // 如果任意一个有值，移除两个元素的 is-invalid class
                            avgVolInput.classList.remove('is-invalid');
                            avg8HrInput.classList.remove('is-invalid');
                            avgVolInput.classList.remove('is-valid');
                            avg8HrInput.classList.remove('is-valid');
                        // 然后在有值的元素中添加 is-valid class
                            if (avgVolInput.value.trim() !== "") {
                                avgVolInput.classList.add('is-valid');
                            }
                            if (avg8HrInput.value.trim() !== "") {
                                avg8HrInput.classList.add('is-valid');
                            }
                    } else {
                        // 移除 is-valid class
                            avgVolInput.classList.remove('is-valid');
                            avg8HrInput.classList.remove('is-valid');
                        // 如果两个都没有值，重新添加 is-invalid class
                            avgVolInput.classList.add('is-invalid');
                            avg8HrInput.classList.add('is-invalid');
                    }
                }
                // 定义一个函数来添加输入框的事件监听器
                function addInputListeners() {
                    avgVolInput.addEventListener('input', checkInputs);
                    avg8HrInput.addEventListener('input', checkInputs);
                }
                // 定义一个函数来移除输入框的事件监听器
                function removeInputListeners() {
                    avgVolInput.removeEventListener('input', checkInputs);
                    avg8HrInput.removeEventListener('input', checkInputs);
                }
                // 监听 noiseCheckbox 的 change 事件
                if (noiseCheckbox) {
                    noiseCheckbox.addEventListener('change', function() {
                        if (this.checked) {
                            // 如果噪音checkbox被选中，添加输入框的事件监听器并检查状态
                            addInputListeners();
                            checkInputs();
                        } else {
                            // 如果噪音checkbox未被选中，移除所有相关的 class 和事件监听器
                            avgVolInput.classList.remove('is-invalid', 'is-valid');
                            avg8HrInput.classList.remove('is-invalid', 'is-valid');
                            removeInputListeners();
                        }
                    });
                }
            // 240809 監聽'噪音'checkbox 
            // 文件載入成功，resolve
            resolve();
        });
    }


// // step_2 文件填入 function 
    // edit 主函數
    function edit_show(shLocal_row){
        // edit 內容呈現
            const OSTEXT30_select = document.querySelectorAll('#OSTEXT_30 option');
            const he_cate_input = document.querySelectorAll('#HE_CATE input');
            for (const [sh_key, sh_value] of Object.entries(shLocal_row)) {
                if(sh_value !== null){                          // 預防空值null
                    if(typeof sh_value === 'object'){           // 特例處理1.for checkBox he_cate類別
                        Object.entries(sh_value).forEach(([item_key ,item_value])=>{
                            he_cate_input.forEach((he_cate_i)=>{
                                if (item_value.includes(he_cate_i.value) || (item_value == he_cate_i.value)) {
                                    he_cate_i.checked = true;
                                    // const heCateDiv = document.getElementById('HE_CATE');
                                    // heCateDiv.classList.remove('is-invalid');
                                    // heCateDiv.classList.add('is-valid');
                                }
                            })
                        })
                        remove_required();
                    }else if(sh_key == "OSTEXT_30"){            // 特例處理2.for select 棟別
                        OSTEXT30_select.forEach((OSTEXT30_i)=>{
                            OSTEXT30_i.selected = (OSTEXT30_i.value.includes(sh_value));
                        })
                    }else if(sh_key == "flag"){                // 特例處理3.for flag 開關
                        document.querySelector('#flag_'+sh_value).checked = true;
                    }else{                                      // 非combo選項，直接帶入value
                        $('#'+sh_key).val(sh_value); 
                    }
                }
            }
            const noiseCheckbox = document.querySelector('#HE_CATE input[type="checkbox"][value="噪音"]');
            checkAVG(noiseCheckbox.checked);

        // 確認權限是否呈現submitBtn...
            const actionRole = shLocal_row.OSHORT == userInfo.signCode && (userInfo.role <= 3 && userInfo.role >= 0 && userInfo.role != '');
            if(!actionRole){
                const submitBtn = document.getElementById("submitBtn");
                submitBtn.classList.add('unblock');
            }

        let sinn = action + '&nbsp模式開啟，表單套用成功&nbsp!!';
        inside_toast(sinn);
        return true;
    }

    // 0-0.多功能擷取fun 新版改用fetch
    async function load_fun(fun, parm, myCallback) {        // parm = 參數
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
                                                            // myCallback：form = bring_form() 、document = edit_show() 、locals = ? 還沒寫好
        } catch (error) {
            throw error;                                    // 載入失敗，reject
        }
    }

// 20240502 -- (document).ready(()=> await 依序執行step 1 2 3
    async function loadData() {
        try {
                mloading(); 
                await eventListener();                      // step_1-2 eventListener();
            if(action == "edit" || action == "review" ){
                await load_fun('edit_shLocal', id, console.log);   // step_2 load_shLocal(id);
                await load_fun('edit_shLocal', id, edit_show);   // step_2 load_shLocal(id);
            }
        } catch (error) {
            console.error(error);
        }
        $("body").mLoading("hide");
    }

    // 20240529 確認自己是否為彈出視窗 !! 只在完整url中可運行 = tw123456p.cminl.oa
    function checkPopup() {
        const urlParams = new URLSearchParams(window.location.search);
        if ((urlParams.has('popup') && urlParams.get('popup') === 'true') || (window.opener)) {
            // console.log('这是 弹窗');
            let rtn_btns = document.querySelectorAll('.rtn_btn');   // 獲取所有帶有 'rtn_btn' class 的按鈕
            rtn_btns.forEach(function(btn) {                        // 遍歷這些按鈕，並設置 onclick 事件
                btn.onclick = function() {
                    closeWindow(true);                                  // true=更新 / false=不更新
                };
            });
        }
    }
    
    $(function () {
        // 確認是主頁面或popup
        checkPopup();   
        loadData();
    })
