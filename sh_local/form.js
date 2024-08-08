
    $(function () {
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
        // 監聽myModal被關閉時就執行--清除表格
        let searchUser_elm = document.getElementById('searchUser');
        searchUser_elm.addEventListener('hidden.bs.modal', function () {
            resetMain();                    // do something...清除欄位
            $('#modal_title').empty();      // 清除標題
        })
    })


    // 吐司顯示字條 // init toast
    function inside_toast(sinn){
        let toastLiveExample = document.getElementById('liveToast');
        let toast = new bootstrap.Toast(toastLiveExample);
        let toast_body = document.getElementById('toast-body');
        toast_body.innerHTML = sinn;
        toast.show();
    }

    // 20240506 local select生成
    function select_local(sortFab_id){
        $("#local_id").empty();
        $("#local_id").append('<option value="" hidden>-- [請選擇 廠別] --</option>');
        for (const [key, value] of Object.entries(locals)) {
            if(value['fab_id'] == sortFab_id){
                let lv = '<option value="'+value['id']+'" class="form-label" '+(value['flag'] == 'Off' ? 'disabled':'')+' >'+value['id']+'：'+value['local_title']+(value['flag'] == 'Off' ? ' -- disabled':'')+'</option>';
                $("#local_id").append(lv);
            }
        }
    }
    // 20240506 saveSubmit modal添加save功能
    function saveSubmit_modal(idty, idty_title){
        $('#modal_action, #submit_action').empty();         // 清除model標題和btn功能
        $('#modal_action').append(idty_title);                    // 炫染model標題
        $('#idty').val(idty);                               // 1 = 送出 // 3 = 取消 // 6 = 暫存

        if(idty == '1'){
            $('#saveSubmit .modal-header').removeClass('bg-success bg-warning text-dark').addClass("bg-primary text-white");    // 切換標題底色
            $('#modal_body').removeClass('unblock');        // 切換sign command
            var append_btn = '<button type="submit" value="Submit" name="submit_document" class="btn btn-primary" ><i class="fa fa-paper-plane" aria-hidden="true"></i> 送出 (Submit)</button>';
        }else if(idty == '3'){
            $('#saveSubmit .modal-header').removeClass('bg-primary bg-success text-white').addClass("bg-warning text-dark");    // 切換標題底色
            $('#modal_body').removeClass('unblock');        // 切換sign command
            var append_btn = '<button type="submit" value="Cancel" name="cancel_document" class="btn btn-warning text-dark" onclick="setFormBequired()" ><i class="fa-solid fa-ban"></i> 作廢 (Abort)</button>';
        }else if(idty == '6'){
            $('#saveSubmit .modal-header').removeClass('bg-primary bg-warning text-dark').addClass("bg-success text-white");    // 切換標題底色
            $('#modal_body').addClass("unblock");           // 切換sign command
            var append_btn = '<button type="submit" value="Save" name="save_document" class="btn btn-success" onclick="setFormBequired()" ><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> 儲存 (Save)</button>';
        }
        $('#submit_action').append(append_btn);           // model_btn功能
    }
    
    // tab_table的顯示關閉功能
    function op_tab(tab_value){
        $("#"+tab_value+"_btn .fa-chevron-circle-down").toggleClass("fa-chevron-circle-up");
        var tab_table = document.getElementById(tab_value+"_table");
        if (tab_table.style.display === "none") {
            tab_table.style.display = "table";
        } else {
            tab_table.style.display = "none";
        }
    }

// // searchUser function 
    // fun_0.清除searchUser_modal
    function resetMain(){
        $("#result").removeClass("border rounded bg-white");
        $('#result_table').empty();                                 // 搜尋清單
        // $('#modal_title').empty();                                  // 標題
        document.querySelector('#key_word').value = '';             // 搜尋key_word input
    }
    // fun_1.search Key_word
    function search_fun(){
        mloading("show");                                           // 啟用mLoading
        const uuid = '39aad298-a041-11ed-8ed4-2cfda183ef4f';        // hrdb
        let search = $('#key_word').val().trim();                   // search keyword取自user欄位
        let request = {
            functionname : 'search',                                // 操作功能
            uuid         : uuid,                                    // ppe
            search       : search                                   // 查詢對象key_word
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
                $("body").mLoading("hide");
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
        let Rinner = "<thead><tr>"+
                        "<th>工號 / 姓名</th>"+"<th>國籍 / 性別</th>"+"<th>user_ID / 職稱</th>"+"<th>部門名稱 (部門代號)</th>"+"<th>select</th>"+
                    "</tr></thead>" + "<tbody id='tbody'>"+"</tbody>";
        // 鋪設表格頭段thead
        div_result_table.innerHTML += Rinner;
        // 定義表格中段tbody
        let div_result_tbody = document.querySelector('.result table tbody');
        $('#tbody').empty();
        for (let i=0; i < res_r.length; i++) {
            // 把user訊息包成json字串以便夾帶
                let user_json = {
                        'emp_id'   : res_r[i].emp_id.trim(),
                        'cname'    : res_r[i].cname.trim(),
                        'cstext'   : res_r[i].cstext.trim(),
                        'omager'   : res_r[i].omager.trim(),
                        'gesch'    : res_r[i].gesch.trim(),
                        'natio'    : res_r[i].natio.trim(),
                        'natiotxt' : res_r[i].natiotxt.trim(),
                        'oftext'   : res_r[i].dept_no.trim() +'\/'+ res_r[i].oftext
                    };
            div_result_tbody.innerHTML += 
                '<tr>' +
                    '<td>' + res_r[i].emp_id.trim() +'</br>' + res_r[i].cname.trim() + '</td>' +
                    '<td>' + res_r[i].natio.trim() + '&nbsp' + res_r[i].natiotxt.trim() + '</br>' + ( res_r[i].gesch === "1" ? "男性(M)":"女性(F)" )+'</td>' +
                    '<td>' + (res_r[i].user.trim() !== "" ? res_r[i].user.trim():"--") + '</br>' + res_r[i].cstext.trim() + '</td>' +
                    '<td>' + res_r[i].oftext + '</br>( ' + res_r[i].dept_no.trim() + ' )</td>' +
                    '<td>' + '<button type="button" class="btn btn-outline-primary btn-xs add_btn" id="'+res_r[i].emp_id+'" value=\''+ JSON.stringify(user_json) +'\' onclick="tagsInput_me(this.value)">'+
                    '<i class="fa-regular fa-circle"></i></button>' + '</td>' +
                '</tr>';
        }

    }
    // fun_3.點選、渲染模組
    function tagsInput_me(val) {
        if (val !== '') {
            let personal_inf = JSON.parse(val);
            if(meeting_man_target == 'emp_id_btn'){     // *** 來自[事故者基本資訊] ***
                Object.keys(personal_inf).forEach((_key)=>{
                    let _key_elem = document.querySelector('#'+_key)
                    if(_key_elem){
                        _key_elem.value = personal_inf[_key]
                        _key_elem.classList.add('autoinput');
       
                    }else{
                        const mappings = {
                            gesch: {
                                '1': '男性',
                                '2': '女性'        // 假设 personal_inf[_key] 不是 '1' 时为女性
                            },
                            natio: {
                                'TW'     : '本籍',
                                'default': '外籍'  // 假设 personal_inf[_key] 不是 'TW' 时为外籍
                            }
                        };

                        if (mappings[_key]) {
                            const key = personal_inf[_key];
                            const value = mappings[_key][key] || mappings[_key]['default'];
                            const target_element = document.getElementById('s1_combo_' + _key.toUpperCase() + '_' + value);
                            target_element.checked = true;

                            const parentId = (target_element.parentElement).parentElement;        // 查詢 target_element 上一層的 ID
                            parentId.classList.add('autoinput');
                            parentId.classList.remove('border');
                        }
                    }
                })
                searchUser_modal.hide();                // 關閉searchUser_modal

            }else{                                      // *** 來自[與會人員] ***
                let emp_id = personal_inf['emp_id'];        // 指定emp_id 
                let cname  = personal_inf['cname'];         // 指定cname 
                val = JSON.stringify({
                    "cname"  : cname,
                    "emp_id" : emp_id
                })
                window[meeting_man_target].push(val);
                $('#'+meeting_man_target+'_show').append('<div class="tag">' + cname + ' / '+ emp_id + '<span class="remove">x</span></div>');
                let tag_user = document.getElementById(emp_id);
                if(tag_user){ tag_user.value = ''; }
                let meeting_man_target_select = document.getElementById(meeting_man_target+'_select');
                if(meeting_man_target_select){
                    meeting_man_target_select.value = window[meeting_man_target];
                }
            }
        }
        // resetMain();
        // searchUser_modal.hide();      // 切到searchUser頁面
    }
    // fun_4.移除單項模組
    $('#meeting_man_a_show, #meeting_man_o_show, #meeting_man_s_show ').on('click', '.remove', function() {
        let this_parent     = $(this).parent().parent();                // 取得爺層的元素
        let this_parent_id  = this_parent[0].id.replace('_show', '');   // 取得爺層的id，並去除_show
        let tagIndex        = $(this).closest('.tag').index();          // 取得點擊index位置
        let tagg            = window[this_parent_id][tagIndex];         // 取得目標數值 emp_id,cname
        let emp_id          = tagg.substr(0, tagg.search(','));         // 指定 emp_id
            let tag_user        = document.getElementById(emp_id);
            if(tag_user){ 
                tag_user.value = tagg; 
            }
        window[this_parent_id].splice(tagIndex, 1);                     // 自陣列中移除
        $(this).closest('.tag').remove();                               // 自畫面中移除
        let _select = document.getElementById(this_parent_id+'_select');
        if(_select){
            _select.value = window[this_parent_id];
        }
    });
// // searchUser function 

    // Option其他選項遮蔽：On、Off
    function onchange_option(name){
        var opts = document.querySelectorAll('[name="'+name+'"].other_item')
        opts.forEach((opt)=>{
            let opt_id_o = document.querySelector('#'+opt.id+'_o');
            if(opt.checked){
                opt_id_o.classList.remove('unblock');
                opt_id_o.removeAttribute("disabled");
                opt_id_o.focus();

                if ($("#"+opt.id).hasClass("only_option")){         // 唯一選項
                    let only_opts = document.querySelectorAll('[name="'+opt.name+'"]')
                    only_opts.forEach(function(checkbox) {
                        // Check if the current checkbox is not the fourth one and is checked
                        if ((checkbox.id !== opt.id ) && checkbox.checked) {
                            // If so, uncheck it
                            checkbox.checked = false;
                            $("#"+checkbox.id+'_o').addClass('unblock').prop('disabled', true);
                            opt_id_o.removeAttribute("disabled");
                        }
                    });
                }

            }else{
                // opt_id_o.value = "";
                opt_id_o.classList.add('unblock');
                opt_id_o.setAttribute("disabled", "disabled");
            }
        })
    }
    // a_pic/pdf 的 uploadFile 函数
    function uploadFile(key) {
        const formData = new FormData();
        const uploadDir = '../doc_temp/';
        const unlinkFile = document.getElementById(key).value;          // 取得 key    上的檔名
        const fileInput = document.getElementById(key + '_row');        // 取得 key_row上的檔名(選擇檔案裡)

        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            alert('No file selected.');
            return;
        }
        
        formData.append('fun_key', key);                // 呼叫功能來源
        formData.append('uploadDir', uploadDir);        // 上船路徑
        formData.append('file', fileInput.files[0]);    // 新的檔案
        formData.append('unlinkFile', unlinkFile);      // 舊的檔案

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'upload.php', true);

        xhr.onload = function () {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);      // 接收回傳

                var preview_modal = '';
                switch(key){
                    case "a_pic":
                        preview_modal = '<a href="' + response.filePath + '" target="_blank" >'
                                      +'<img src="' + response.filePath + '" class="img-thumbnail" style="width: 50%;"></a>'; // 套上a+img
                        break;
                    case "a_self_desc":    
                    case "a_others_desc":    
                        preview_modal = '<a href="' + response.filePath + '" target="_blank" class="btn text-danger add_btn">'
                                        + '<i class="fa-solid fa-file-pdf fa-2x"></i><p style="font-size:12px;">' + response.fileName + '</p>';
                        break;
                    default:
                        alert('Invalid key...2');
                        return;
                }
                document.getElementById('preview_' + key).innerHTML = preview_modal;
                document.getElementById(key).value = response.fileName;                                                 // a_pic加上時間搓

            } else {
                alert('Upload failed. Please try again.');
            }
        };
        xhr.onerror = function() {
            alert('Upload failed due to a network error. Please try again.');
        };
        xhr.onabort = function() {
            alert('Upload aborted. Please try again.');
        };
        xhr.send(formData);
    }
    // a_pic/pdf 的 unlinkFile 函数
    function unlinkFile(key) {
        const formData = new FormData();
        const uploadDir = '../doc_temp/';
        const unlinkFile = document.getElementById(key).value;           // 取得 key上的檔名
        const key_row_File = document.getElementById(key + '_row').value;        // 取得 key_row上的檔名(選擇檔案裡)
        const row_json  = document.getElementById('row_json').innerText; // 取得unlink_fileName

        console.log(key, unlinkFile, row_json);
        console.log('key_row_File...', key_row_File.length);
        
        if(key_row_File.length !== 0){                      // true = 移除temp上傳檔； false = 清除doc檔名  (移除的動作交給儲存時的function)
            // formData.append('fun_key', key);                // 呼叫功能來源
            // formData.append('file', fileInput.files[0]);    // 新的檔案
            formData.append('uploadDir', uploadDir);        // 上船路徑
            formData.append('unlinkFile', unlinkFile);      // 純檔名key上的檔名
            formData.append('row_json', row_json);          // 路徑封包
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'unlink.php', true);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    // let response = JSON.parse(xhr.responseText);                          // 接收回傳
                    document.getElementById('preview_' + key).innerHTML = '-- preView --';   // 清除preview
                    document.getElementById(key + '_row').value = '';                        // 清除選擇row檔案
                    document.getElementById(key).value = '';                                 // 清除a_pic
    
                } else {
                    alert('unlink failed. Please try again.');
                }
            };
            xhr.onerror = function() {
                alert('unlink failed due to a network error. Please try again.');
            };
            xhr.onabort = function() {
                alert('unlink aborted. Please try again.');
            };
            xhr.send(formData);

        }else{
            if(confirm('確認移除檔案：'+unlinkFile+'？') ){
                document.getElementById('preview_' + key).innerHTML = '-- preView --';       // 清除preview
                document.getElementById(key + '_row').value = '';                            // 清除選擇row檔案
                document.getElementById(key).value = '';                                     // 清除a_pic
            }
        }
    }
    // signature簽名板 // 240600-改用輸出PDF後簽名
    async function signature_canva() {
        return new Promise((resolve) => { 
            var signaturePads = {};
            // Initialize Signature Pad for each canvas
            var canvases = document.querySelectorAll('canvas');
            canvases.forEach((canvas, index)=>{
                var signaturePad = new SignaturePad(canvas);
                signaturePads[canvas.id] = signaturePad;
            })

            // Attach event listeners to clear and save buttons
            var clearButtons = document.querySelectorAll('.clear-btn');
            clearButtons.forEach(function(button) {
                button.addEventListener('click', function(event) {
                    var padNumber = button.dataset.pad;
                    var signaturePad = signaturePads[padNumber + '_signaturePad'];
                    var signatureImage = document.getElementById(padNumber + '_signature-image');
                    $('#' + padNumber + '_signature-input').val('');            // base64儲存格
                    signaturePad.clear();                                       // 手寫盤
                    // signatureImage.src = '../image/signin_empty.png';           // 清除預覽圖並給預設值
                });
            });
            var saveButtons = document.querySelectorAll('.save-btn');
            saveButtons.forEach(function(button) {
                button.addEventListener('click', function(event) {
                    var padNumber = button.dataset.pad;
                    var signaturePad = signaturePads[padNumber + '_signaturePad'];
                    var signatureImage = document.getElementById(padNumber + '_signature-image');
                    if (signaturePad.isEmpty()) {
                        alert("Please provide a signature first.");
                    } else {
                        var dataURL = signaturePad.toDataURL();
                        signatureImage.src = dataURL;                           // 預覽圖
                        $('#' + padNumber + '_signature-input').val(dataURL);   // base64儲存格
                    }
                });
            });
            resolve(); // 文件載入成功，resolve
        });
    };

    async function eventListener(){
        return new Promise((resolve) => { 
            // 定義+監聽按鈕for與會人員...search btn id
            let search_btns = Array.from(document.querySelectorAll(".search_btn"));
            search_btns.forEach((s_btn)=>{
                s_btn.addEventListener('mousedown',function(){
                    // 標籤
                    let modal_title
                    if(this.id == 'meeting_man_a'){
                        modal_title = '事故當事者(或其委任代理人)'
                    }else if(this.id == 'meeting_man_o'){
                        modal_title = '其他與會人員'
                    }else if(this.id == 'meeting_man_s'){
                        modal_title = '環安人員'
                    }else if(this.id == 'emp_id_btn'){
                        modal_title = '事故者基本資料'
                    }
                    $('#modal_title').append(modal_title)
                    meeting_man_target = this.id;               // 搜尋meeting_man_target
                })
            })    

            // 20240507 -- 監聽 negative_opts 負向選項;
            let radios_all    = Array.from(document.querySelectorAll("input[type='radio'], input[type='checkbox']"));   // 取得所有radio和checkbox
            let negative_opts = Array.from(document.querySelectorAll(".negative"));         // 負向選項
            let get_negatives = Array.from(document.querySelectorAll(".get_negative"));     // 負向to對象
            let radios        = radios_all.filter(radio => !get_negatives.includes(radio)); // 將所有radio和checkbox清單中移除 負向to對象，避免干擾
            // 监听单选按钮组中的任何一个单选按钮的 change 事件
                radios.forEach((rdo) => {
                    rdo.addEventListener('change', () => {
                        // 检查当前单选按钮是否是负向选项
                        // if (negative_opts.includes(rdo)) {       // 原本是過濾點選事件是否為[負向選項]，取消原因是要讓非[負向選項]也可以進行滾算
                            // 计算 negative_arr 数组
                            negative_arr = negative_opts.filter(opt => opt.checked).map(opt => opt.id);
                        // }
                        // 根据 negative_arr 数组的长度设置 get_negatives 的状态
                        get_negatives.forEach((get_n) => {
                            let isChecked = negative_arr.length > 0;
                            get_n.checked = isChecked;
                            $('#'+get_n.id+'_o').toggleClass('unblock', !isChecked).prop("disabled", !isChecked);
                        });
                    });
                });

            // 監聽工作起訖日欄位(id=a_work_e)，自動確認是否結束大於開始
            $('#a_work_s, #a_work_e').change(function() {
                let currentDate = new Date();                       // 取得今天日期
                let a_work_s = new Date($("#a_work_s").val());      // 取得起始
                let a_work_e = new Date($("#a_work_e").val());      // 取得訖止
                // 工作起始需不需要小於現在時間....需要確認
                if(this.id == 'a_work_s'){
                    $("#a_work_s").removeClass("is-valid is-invalid").addClass(a_work_s < currentDate ? "is-valid" : "is-invalid");
                }
                // 訖止時間需大於起始時間....
                $("#a_work_e").removeClass("is-valid is-invalid").addClass(a_work_s < a_work_e ? "is-valid" : "is-invalid");
            });
            
            // 監聽到職日欄位(id=hired)，自動計算年資並output(id=rload)
            // 監聽事故時間欄位(id=a_day)，自動確認是否結束大於開始
            $('#hired, #a_day').change(function() {
                let currentDate = new Date();                                        // 取得今天日期
                let hired = $("#hired").val() ? new Date($("#hired").val()) : null;  // 取得到職日
                let a_day = $("#a_day").val() ? new Date($("#a_day").val()) : null;  // 取得事故日期
        
                if (hired) {
                    if (hired > currentDate) {
                        $("#hired").removeClass("is-valid").addClass("is-invalid");
                    } else {
                        $("#hired").removeClass("is-invalid").addClass("is-valid");
                    }
                }
        
                if (a_day) {
                    if (a_day > currentDate) {
                        $("#a_day").removeClass("is-valid").addClass("is-invalid");
                    } else {
                        $("#a_day").removeClass("is-invalid").addClass("is-valid");
                    }
                }
        
                if (hired && a_day) {
                    if (a_day >= hired && a_day <= currentDate) {
                        // 計算年月日
                        let difference = a_day - hired;
                        let years  = Math.floor(difference / (365.25 * 24 * 60 * 60 * 1000));
                        let months = Math.floor((difference % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
                        let days   = Math.floor((difference % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
                        // 輸出結果
                        $("#rload").val("估算約：" + years + " 年 " + months + " 個月 " + days + " 天");
                        $("#rload").removeClass("is-invalid").addClass("is-valid");
                    } else {
                        $("#rload").val('(填完session_2 事故時間，此欄自動更新)').removeClass("is-valid").addClass("is-invalid");
                    }
                } else {
                    $("#rload").val('(填完session_2 事故時間，此欄自動更新)').removeClass("is-valid").addClass("is-invalid");
                }
            });
            // 監聽與驗證anis_no是否合規
            $('#anis_no').on('input', function() {
                let input = event.target;
                let value = input.value;
                let value_valid = '';
                // value = value.toUpperCase();                                      // 自動轉大寫
                value = value.replace(/[^A-Z0-9]/g, '');                             // 去掉所有非字母和數字的字符
                value_valid += (!value.startsWith('ANIS')) ? '大寫ANIS' : '';        // 檢查前四個字是否為'ANIS'
                if (value.length >= 21) {                                            // 限制字數為21個字符
                    value = value.substring(0, 21);
                    value_valid += '';
                }else{
                    if(value_valid.length > 0){
                        value_valid += '+';
                    }
                    value_valid += '數字流水號共21碼';
                }
                input.value = value;                                                // 更新輸入框的值
                if(value){                                                          // 更新驗證提示
                    $("#anis_no").removeClass("is-valid is-invalid").addClass((value_valid.length > 0) ? "is-invalid" : "is-valid");
                    $("#anis_no_feedback").empty().append(value_valid);
                }else{
                    $("#anis_no").removeClass("is-valid is-invalid")
                }
            })
            // 列印PDF時，渲染簽名欄+遮蔽部分欄位...
            $('#download_pdf').on('click', function() {

                $('#logs_div, #editions_div, .head_btn, #show_odd_div' ).addClass('unblock');         // 遮蔽頂部按鈕
                $('#confirm_sign').empty().removeClass('unblock');                    // 清除簽名欄內容+取消遮蔽簽名欄
                // 訂製簽名欄訊息
                let d1 ='<div class="col-12 border rounded bg-white mt-2">';
                let confirm_text = '<div class="confirm_text px-2 pt-0 pb-1" style="font-size: 12px;">●&nbsp以上各項均由當事人依照事實填具，且同意工傷判定之結果，如有不實，願負民事、刑事責任，並歸還溢領之勞保給付及工傷假天數，特此具結。</div>';
                let dx = '<div class="border rounded bg-light p-3"><div class="confirm_sign_div"><h3>&nbspX</h3></div><div class="pt-2 pb-0">';
                let d2 = '<div class="col-6 col-md-6 py-0">';
                let confirm_word = d1 + confirm_text + dx + '當事人' + '</div></div></div>';
                confirm_word += d1 + '<div class="row">' + d2 + dx + '環安人員' + '</div></div></div>' + d2 + dx + '勞工代表' + '</div></div></div>' + '</div></div>';
                // 渲染簽名欄內容
                // document.getElementById("confirm_sign").innerHTML = confirm_word;
                $('#confirm_sign').append(confirm_word);
                // 訂製檔案名稱
                document.title = document.getElementById('pdf_name').innerText + '_' + document.getElementById('anis_no').value
                // 列印畫面
                window.print();
        
            });
            // 監聽表單內 autoinput 變更事件
            $('#emp_id, #cname, #oftext, #cstext').change(function() {
                // 當有變更時，對該input加上指定的class
                $(this).removeClass('autoinput');
            });
            // 監聽表單內 autoinput 變更事件
            document.querySelectorAll('[name="s1_combo_NATIO[]"], [name="s1_combo_GESCH[]"]').forEach((element) => {
                element.addEventListener('change', function() {
                    const parentId = (this.parentElement).parentElement;        // 查詢 target_element 上一層的 ID
                    parentId.classList.add('border');
                    parentId.classList.remove('autoinput');
                })
            })
            resolve(); // 文件載入成功，resolve
        });
    }
    // 240613 correspond對應選項功能
    function eventListener_correspond(target_class){
        let corresponds = document.querySelectorAll(".correspond");
        corresponds.forEach((element)=> {
            element.hidden = true;
        });

        document.querySelectorAll("."+target_class).forEach((element) => {
            element.addEventListener('change', function() {
                corresponds.forEach((correspondElement) => {
                    correspondElement.hidden = true;
                });
                let this_flag = this.getAttribute('flag');                  // 用.getAttribute('flag')取得自訂
                document.querySelectorAll("." + this_flag).forEach((selectedElement) => {
                    selectedElement.hidden = false; 
                    let parentId = selectedElement.parentElement.id;        // 查詢 selectedElement 上一層的 ID
                    let parentElement = document.getElementById(parentId);
                    if (parentElement) {
                        parentElement.value = "";                           // 将 value 设为默认选项的 value
                    }
                });

            });
        });
    }

    // 240627 更新correspond對應選項功能
    function reflesh_correspond(target_class){
        // 获取target_class的所有radio按钮
        const radios = document.querySelectorAll('input[name="'+target_class+'[]"]');
        
        // 遍历radio按钮，找到选中的那一个
        let this_flag = null;
        radios.forEach(radio => {
            if (radio.checked) {
                this_flag = radio.getAttribute('flag'); // 用.getAttribute('flag')取得自訂
            }
        });
        document.querySelectorAll("." + this_flag).forEach((selectedElement) => {
            // selectedElement.removeAttribute('hidden'); 
            selectedElement.hidden = false;
        });
    }
    // 240614 chooseBoth以上皆是功能
    function eventListener_chooseBoth(target_name, target_value){
        let get_chooseBoth = Array.from(document.querySelectorAll("input[id^='"+target_name+"'][value='"+target_value+"']"));   // 取得 target_name 下 target_value 的node
        let chooseBoth_all = Array.from(document.querySelectorAll("input[id^='"+target_name+"']"));                             // 取得target_name下所有項，並将NodeList转换为数组
            chooseBoth_all = chooseBoth_all.filter(input => !input.id.includes('_o'));                                          // 过滤掉ID包含'_o'的輸入元素
        let chooseBoths    = chooseBoth_all.filter(item => !get_chooseBoth.includes(item));                                     // 將所有清單中移除 get_chooseBoth對象，避免干擾
        // 監聽-選項
        chooseBoths.forEach((cbx) => {
            cbx.addEventListener('change', () => {
                let check_both = true;
                chooseBoths.forEach((cbx_c) => {
                    check_both = check_both && cbx_c.checked;
                });
                // 当所有chooseBoths都被选中时，将get_chooseBoth设置为选中
                get_chooseBoth.forEach((g_cbx) => {
                    g_cbx.checked = check_both;
                });
            });
        });
        // 監聽-以上皆是
        get_chooseBoth.forEach((g_cbx) => {
            g_cbx.addEventListener('change', () => {
                chooseBoths.forEach((cbx_c) => {
                    cbx_c.checked = g_cbx.checked ? true : false ;
                    $('#'+cbx_c.id+'_o').toggleClass('unblock', !g_cbx.checked).prop("disabled", !g_cbx.checked);               // 把_o的input進行切換(顯示/隱藏)
                });
            });
        });

    }
    // 240614...鎖定option特定項目 for 生活工傷、廠內交傷
    function lock_opt(target_name, target_value){
        // let target_lock_opt = Array.from(document.querySelectorAll("input[id^='"+target_name+"'][value='"+target_value+"']"));   // 取得 target_name 下 target_value 的node
        let opt_all = Array.from(document.querySelectorAll("[id^='"+target_name+"']"));                                    // 取得target_name下所有項，並将NodeList转换为数组

        opt_all.forEach((opt)=>{
            if(opt.tagName == 'INPUT'){
                if(opt.value == target_value){
                    opt.checked = true;
                }else{
                    opt.disabled = true;
                }
            
            }else if(opt.tagName == 'SELECT'){
                // 240613 correspond對應選項功能
                Array.from(opt.options).forEach((item) => {
                    if (item.value == target_value) {
                        item.hidden = false; 
                        item.selected = true;
                    } else {
                        item.hidden = true;
                    }
                });
            }
            opt.classList.add('lock');
        })
    }

    // 20240517 -- 暫存表單
    function setFormBequired(){
        console.log('setFormBequired...');
        var form = document.getElementById('item_list');                // 獲取表單元素
        var requiredElements = form.querySelectorAll('[required]');     // 獲取表單內所有含有 required 屬性的元素
        requiredElements.forEach(function(element) {                    // 遍歷這些元素，移除 required 屬性並添加 bequired 屬性
            element.removeAttribute('required');
            element.setAttribute('bequired', 'true');
        });
    }

// // step_1 表單生成 function 
    // 動態表單主fun -- JSON轉表單；依據不同的key_type進行切換型別 HARD CODED
    function make_question(session_key, key_class, item_a) {        // 接收參數：session, class, 單一問項
        let int_a = '';
        let dcff = '<div class="form-floating">';
        // 共用部分的操作1 label標籤
        function commonPart() {
            let labelSuffix = item_a.required ? '<sup class="text-danger"> *</sup>' : '';
            return '<label for="' + item_a.name + '" class="form-label">' + item_a.label + '：' + labelSuffix +'</label>';
        }
        // 共用部分的操作2 驗證回饋
        function validPart() {
            return '<div class="invalid-feedback" id="' + item_a.name + '_feedback">數值填入錯誤 ~ </div>';
        }
        // 共用部分的操作3 info   有單文字和物件
        function infoPart() {
            let info_temp = '';
            if(typeof item_a.info !== 'object'){
                info_temp += ' >>> ' + item_a.info;
            }else{
                for (const [key_1, value_1] of Object.entries(item_a.info)) {
                    if(info_temp){
                        info_temp += '<br/>'
                    }
                    info_temp += key_1 + '.' + value_1
                }
            }
            return '<span class="info">' + info_temp + '</span>';
        }
        // 日期格式化函數
        function formatDate(date) {
            return date.toISOString().slice(0, item_a.type === 'date' ? 10 : 16);
        }
        // 主要fun：內層問項生成：根據字段類型生成相應的表單元素
        switch(item_a.type) {
            case 'text':
                int_a = '<input type="text" name="' + item_a.name + '" id="' + item_a.name + '" class="form-control mb-0" placeholder="' + item_a.label + '" '+ (item_a.required ? 'required' : '') + '>' + commonPart();
                if(item_a.name == 'emp_id'){
                    int_a = '<div class="input-group form-floating">' + int_a 
                        + '<button type="button" class="btn btn-outline-primary search_btn" id="emp_id_btn" data-toggle="tooltip" data-placement="bottom" title="以工號自動帶出其他資訊" '
                        + ' data-bs-target="#searchUser" data-bs-toggle="modal" >'+'<i class="fa-solid fa-magnifying-glass"></i> 搜尋</button>'+'</div>';
                }else{
                    int_a = dcff + int_a + '</div>';
                }
                break;
            case 'number':
                int_a = '<input type="number" name="' + item_a.name + '" id="' + item_a.name + '" class="form-control mb-0" placeholder="' + item_a.label + '" '+ (item_a.required ? 'required' : '') + '>' + commonPart();
                int_a = dcff + int_a + '</div>';
                break;
            case 'date':
            case 'datetime':
                int_a = dcff +
                        '<input type="' + (item_a.type === 'date' ? 'date' : 'datetime-local') + '" name="' + item_a.name + '" class="form-control " id="' + item_a.name + '" value="" ' +
                        (item_a.required ? 'required' : '') + '>' + commonPart() + (item_a.valid ? validPart() : '') + '</div>';
                break;
            case 'textarea':
                int_a = dcff +
                    '<textarea name="' + item_a.name + '" id="' + item_a.name + '" class="form-control " style="height: 100px" placeholder="' + item_a.label + '"' 
                    + (item_a.required ? ' required' : '') + '>' + '</textarea>' + commonPart() + '</div>';

                break;
            case 'radio':
            case 'checkbox':
                int_a = '<div class=" border rounded p-2"><snap title="'+item_a.name+'"><b>*** ' + item_a.label + '：' + (item_a.required ? '<sup class="text-danger"> *</sup>' : '') + '</b></snap><br>';
                Object(item_a.options).forEach((option)=>{
                    let object_type = ((typeof option.value == 'object') ? option.label : option.value);   // for other's value
                    int_a += '<div class="form-check bg-light rounded"><input type="' + item_a.type + '" name="' + item_a.name + '[]' + '" value="' + object_type + '" '
                          + ' id="' + item_a.name + '_' + object_type + '" ' + (item_a.required ? ' required ' : '') + 'onchange="onchange_option(this.name)" ' 
                          + ' class="form-check-input ' + item_a.name  
                            + ((typeof option.value === 'object') ? ' other_item ' : '') + (option.value.only ? ' only_option ' : '') 
                            + ((item_a.negative !== undefined && item_a.negative == object_type) ? ' negative ' : '') 
                            + ((item_a.get_negative !== undefined && item_a.get_negative == object_type) ? ' get_negative ' : '') 
                            + '" ' + ((option.flag  !== undefined) ? 'flag="'+option.flag+'"' : '')
                          + ' >' + '<label class="form-check-label '
                            + ((item_a.negative != undefined && item_a.negative == object_type) ? ' negative ' : '') 
                            + ((item_a.get_negative != undefined && item_a.get_negative == object_type) ? ' get_negative ' : '') 
                          + '" for="' + item_a.name + '_' + object_type + '">' + option.label + (typeof option.value === 'object' ? '：' : '') 
                          + '</label></div>';

                    if (typeof option.value === 'object' && option.value.type == 'text') {
                        int_a += '<input type="'+ option.value.type +'" name="' + option.value.name + '[]' + '" '
                            + ' placeholder="' + option.value.label + '" id="' + item_a.name + '_' + option.label + '_o" class="form-control unblock" disabled >';

                    }else if (typeof option.value === 'object' && option.value.type == 'number') {
                        int_a += '<input type="'+ option.value.type +'" name="' + option.value.name + '[]' + '" '
                            + ' placeholder="' + option.value.label + '" id="' + item_a.name + '_' + option.label + '_o" class="form-control unblock" disabled ';
                        if(option.value.limit != undefined){
                            int_a += option.value.limit;
                        }
                        int_a += ' >';
                        
                    }else if (typeof option.value === 'object' && option.value.type == 'select') {
                        int_a += '<div class="p-1">';
                        int_a += '<select name="' + option.value.name + '[]" id="' + item_a.name + '_' + option.label + '_o" class="form-select unblock" disabled >'
                                + '<option value="" hidden>-- [請選擇 ' + item_a.label + '] --</option>' 
                        Object(option.value.options).forEach((option)=>{
                            if (typeof option.value === 'object') {
                                Object(option.value).forEach((key_value)=>{
                                    int_a += '<option value="'+key_value['value']+'" class="'+option.label + ((item_a.correspond != undefined) ? ' correspond' : '')+'" >'
                                        + key_value['value'] + '</option>' 
                                } )
                            }else {
                                int_a += '<option value="'+option.value+'" class="'+option.label+'">'+option.value+'</option>' 
                            }
                        }) 
                        int_a += '</select>'+'</div>';
                    }
                }) 
                int_a += '</div>';
                break;
            case 'select':
                int_a = '<div class=" border rounded p-2"><snap title="'+item_a.name+'"><b>*** ' + item_a.label + '：' + (item_a.required ? '<sup class="text-danger"> *</sup>' : '') + '</b></snap><br>';
                int_a += '<select name="'+item_a.name+'" id="'+item_a.name+'" class="form-select" >'
                      + '<option value="" hidden>-- [請選擇 ' + item_a.label + '] --</option>' 

                Object(item_a.options).forEach((option)=>{
                    if (typeof option.value === 'object') {
                        Object(option.value).forEach((key_value)=>{
                            int_a += '<option value="'+key_value['value']+'" class="'+option.label + ((item_a.correspond != undefined) ? ' correspond' : '')+'" >'
                                + key_value['value'] + '</option>' 
                        } )
                    }else {
                        int_a += '<option value="'+option.value+'" class="'+option.label+'">'+option.label+'：'+option.value+'</option>' 
                    }
                }) 
                int_a += '</select>'+'</div>';
                break;
            case 'file':       // session_3 事故位置簡圖
            case 'file_pdf':       // session_3 目擊者+事故者自述
                int_a = check_action ? '<div class="row"><div class="col-12 ' : '<div class="row"><div class="col-6 col-md-6  ';         // create = 半開；review = 全開    py-1 px-2
                int_a += ' a_pic" id="preview_'+item_a.name+'"> -- preView -- </div><input type="hidden" name="' +item_a.name+'" id="'+item_a.name+'" '+(item_a.required ? 'required':'')+'>';
                if(!check_action){
                    int_a += '<div class="col-6 col-md-6 py-1 px-2"><div class="col-12 bg-white border rounded ">' + commonPart()
                        + '<div class="input-group "><input type="file" name="' + item_a.name + '_row" id="' + item_a.name + '_row" class="form-control mb-0" '+(item_a.accept ? 'accept="'+item_a.accept+'"':'')+' >'
                        + '<button type="button" class="btn btn-outline-success" onclick="uploadFile(\'' + item_a.name + '\')">上傳</button>' 
                        + '<button type="button" class="btn btn-outline-danger" onclick="unlinkFile(\'' + item_a.name + '\')">移除</button>' 
                        + '</div></div>' + '</div></div>'
                }
                break;  
            case 'signature':   // 簽名模組
                int_a = '<div class="col-12 border rounded ">'
                    + '<snap class="p-0" ><b>*** ' + item_a.label + '：' + (item_a.required ? '<sup class="text-danger"> *</sup>' : '') + '</b></snap>'
                    + '<div class="row">' 

                    + '<div class="col-12 col-md-6 text-center"><img id="' + item_a.name + '_signature-image" src="../image/signin_empty.png" alt="Signature Image" class="img-thumbnail" >'
                    + '<br><input type="hidden" name="' + item_a.name + '" id="' + item_a.name + '_signature-input" ' + (item_a.required ? 'required' : '' ) + '>'
                    +'</div>' 
                if(!check_action){
                    int_a += '<div class="col-12 col-md-6 text-center">'
                        + '<canvas id="' + item_a.name + '_signaturePad" width="400" height="250" class=" border rounded p-2 bg-light signature"></canvas>'
                        + '<div class="py-1">'
                        + '<button type="button" class="btn btn-outline-info clear-btn" data-pad="' + item_a.name + '">Clear</button>'+'&nbsp'
                        + '<button type="button" class="btn btn-outline-success save-btn" data-pad="' + item_a.name + '">Save Signature</button>'
                        + '</div>' + '</div>'
                }
                int_a += '</div>' + '</div>'
                break;
        }
        // 有info就呼叫fun崁入
        int_a += (item_a.info) ? infoPart() : '';
        // 外層session包裝 // 將表單元素添加到特定的容器中
        if(key_class && item_a.type != 'signature'){
            int_a = '<div class="'+ key_class +'">' + int_a + '</div>';
        }else if(item_a.type == 'signature'){
            int_a = '<div class="col-12 p-2">' + int_a + '</div>';
        }
        // 渲染form
        $('#' + session_key +' .accordion-body').append(int_a);     
        

        if(item_a.correspond !== undefined){                // 240613 判斷是否需要啟動對應選項 for 災害類型
            eventListener_correspond(item_a.correspond);
        };
        if(item_a.chooseBoth !== undefined){                // 240614 判斷是否需要以上皆是
            eventListener_chooseBoth(item_a.name, item_a.chooseBoth);
        };
        if(item_a.lock_opt !== undefined){                  // 240614 判斷是否需要lock option
            if(item_a.lock_opt == ""){
                reflesh_correspond(item_a.correspond);      // 240627 更新correspond對應選項功能
            }else{
                lock_opt(item_a.name, item_a.lock_opt );
            }
        };

    }
    // 20240501 -- // 動態表單主fun -- JSON轉表單
    function bring_form(form_json){
        let form_item     = form_json.form_item;            // 抓item項目for form item
        // step_0.前置工作、生成表頭
        if(form_json.form_title){ $('#form_title').empty().append(form_json.form_title);  }     // 文件標題
        if(form_json.dcc_no){     $('#dcc_no_head').empty().append(form_json.dcc_no); }         // DCC編號
        if(form_json.version){    $('#dcc_no_head').append('-' + form_json.version); }          // 文件版本
        let dcc_no_input = document.querySelector('#dcc_no');                                   // 
        if(dcc_no_input && form_json.dcc_no && form_json.version){ 
            dcc_no_input.value = form_json.dcc_no+'-'+form_json.version;
        }
        // let form_doc = document.getElementById('item_list');                                    // 定義動態表單id位置
        if(form_item){                                                                          // confirm form_item is't empty
            // console.log('step_1-2 make_question(key_1, value_1.class, item_value) -- ');
            for (const [key_1, value_1] of Object.entries(form_item)) {
                // step_1.生成session_title
                let match;
                const regex = new RegExp('session', 'gi');
                if ((match = regex.exec(key_1)) !== null) {
                    let int_1 = '<div class="accordion-item">';                 // 使用手風琴模組
                    if (value_1.label.length != 0) {
                        int_1 += '<h5 class="accordion-header" id="' + key_1 + '_head">'+
                            '<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#' + key_1 + '" aria-expanded="true" aria-controls="' + key_1 + '">'+
                            '<b>※&nbsp' + key_1 + '&nbsp' + value_1.label + '：</b>'+ '</button></h5>';
                    }
                    int_1 += '<div id="' + key_1 + '"  class="accordion-collapse collapse show" aria-labelledby="' + key_1 + '_head" > '
                        + (value_1.info ? '&nbsp' + value_1.info : '') 
                        +'<div class="row accordion-body">'
                        +'</div></div></div>'
    
                    $('#item_list').append(int_1);
                    // 20240531 增加 session_group
                    let int_2 = '<a class="list-group-item list-group-item-action" href="#'+ key_1 + '_head" data-toggle="tooltip" data-placement="right" title="'+ key_1 + '">'+ key_1 + '</a>';
                    $('#session-group').append(int_2);
                }
                // step_2.生成問項...將每一筆繞出來
                Object(value_1.item).forEach((item_value)=>{
                    make_question(key_1, value_1.class, item_value);
                })
            }

            let int_end = '<div class="col-12 mt-3 py-0 rounded bg-success text-white text-center">-- 問卷底部 --</div>'
            $('#item_list').append(int_end);
            return true;
        } else {
            return false;
        }
    }

// // step_2 文件填入 function 
    // edit 副函數：鋪設渲染_表頭
    function reShow_info(document_row){
        // 1.會議info
        let meeting_info1_arr = ['anis_no','fab_id', 'local_id', 'case_title', 'a_dept', 'meeting_time', 'meeting_local', 'uuid', 'meeting_man_d', 'omager'];
        meeting_info1_arr.forEach((meeting_info1)=>{
            if((document_row[meeting_info1] !== undefined) && (document_row[meeting_info1] != '0000-00-00 00:00:00')){
                document.querySelector('#'+meeting_info1).value = document_row[meeting_info1]; 
                if( meeting_info1 == "fab_id"){
                    select_local(document_row[meeting_info1]);          // 使用fab_id.value呼叫select_local生成select option
                }
            }
        })
        // 2.與會人員
        let meeting_info2_arr = ['meeting_man_a', 'meeting_man_o', 'meeting_man_s'];
        meeting_info2_arr.forEach((meeting_man)=>{
            // console.log(meeting_man, Object.keys(document_row[meeting_man]).length);
            if(Object.keys(document_row[meeting_man]).length >=1 ){
                meeting_man_target = meeting_man;                                 // let key => target
                meeting_man_val = JSON.parse('['+document_row[meeting_man]+']');  // 取出的字串藥先用 [ ] 包起來，再轉成JSON物件

                for(let i=0; i < meeting_man_val.length; i++){                    // 依照物件長度進行遶圈
                    tagsInput_me(JSON.stringify(meeting_man_val[i]));             // 轉成字串進行渲染
                }
            }
        })
    }
    // edit 主函數
    function edit_show(document_row){
        // console.log('step_2-1 edit_show(document_row)：', '填入表單');
        // edit step0.更換submit按鈕型態
            let update_btn = '<button type="submit" value="update" name="update_document" class="btn btn-primary" ><i class="fa fa-paper-plane" aria-hidden="true"></i> Update (Submit)</button>'
            $('#submit_action').empty();
            $('#submit_action').append(update_btn);
        
        // edit step1.呼叫fun鋪設渲染_表頭：'case_title','a_dept','meeting_time','meeting_local','meeting_man_a','meeting_man_o','meeting_man_s','uuid','id'
            // console.log('step_2-1-1 reShow_info(document_row) -- 渲染表頭');
            reShow_info(document_row);

        // edit step2.特例呈現：'confirm_sign','ruling_sign','a_pic'
            // console.log('step_2-1-2 special_items.forEach((special_item)=> -- 特例呈現');
            let special_items = ['ruling_sign','a_pic','_focus','_odd']
            special_items.forEach((special_item)=>{
                if(document_row[special_item] != null){
                    let files_path    = '../doc_files/'                                                                       // 指定pic路徑
                    let case_year     = document_row.created_at.substr(0, 4);
                    let anis_no       = document_row.anis_no;

                    if(special_item == 'a_pic'){        // 路線圖檔
                        let a_pic_val     = document_row[special_item];                                                             // 取得pic_value
                        if(a_pic_val){
                            let preview_modal = '<a  href="' + files_path + case_year + '/' + anis_no + '/' + a_pic_val + '" target="_blank" >';                          // 生成預覽按鈕a
                            let src_img       = '<img src="' + files_path + case_year + '/' + anis_no + '/' + a_pic_val + '" class="img-thumbnail" style="width: 50%;">'; // 生成img
                            let preview_item  = document.getElementById('preview_' + special_item); 
                            if(preview_item){
                                preview_item.innerHTML = preview_modal + src_img +'</a>';                                               // 套上a+img
                            }            
                            let input_item    = document.getElementById(special_item);
                            if(input_item){
                                input_item.value = a_pic_val;                                                                           // 欄位填上pic_value
                            }
                        }
                    }else if(special_item == '_focus'){                              // 240705 事故者+目擊者 自述
                        // let _focus = JSON.parse(document_row[special_item]);
                        let _focus = document_row[special_item];

                        for (const [_key, _value] of Object.entries(_focus)){
                            if(_value){
                                let preview_modal = '<a href="' + files_path + case_year + '/' + anis_no + '/' + _value + '" target="_blank" class="btn text-danger add_btn">';  // 生成預覽按鈕a
                                let file_info = '<i class="fa-solid fa-file-pdf fa-2x"></i><p style="font-size:12px;">'+_value+'</p>';
                                let preview_item = document.getElementById('preview_' + _key); 
                                if(preview_item){
                                    preview_item.innerHTML = preview_modal + file_info +'</a>';                                               // 套上a+img
                                }            
                                let input_item = document.getElementById(_key);
                                if(input_item){
                                    input_item.value = _value;                                                                           // 欄位填上pic_value
                                }
                            }
                        } 
                    }else if(special_item == '_odd'){                              // 240611 職災申報
                        let _odd = JSON.parse(document_row[special_item]);
                        let show_odd  = (_odd['due_day'] != undefined && _odd['due_day'] != null) ? "due_day："+_odd['due_day']+"/申報日：" : "";
                            show_odd += (_odd['od_day']  != undefined && _odd['od_day'] != null) ? _odd['od_day'] : "--";
                        $('#show_odd').append(show_odd);

                    }else{                              // 簽名
                        let base64_sign    = document_row[special_item];
                        let signatureImage = document.getElementById(special_item+'_signature-image');
                        signatureImage.src = base64_sign;                           // 渲染預覽圖
                        $('#'+special_item+'_signature-input').val(base64_sign);    // 填上base64儲存格
                    }
                }
            })

        // edit step3.內容呈現
            // console.log('step_2-1-3 document_row["_content"] -- 內容呈現');
            let _content = document_row['_content']
            let match;
            Object.keys(_content).forEach(function(content_key){        // 將原陣列_content逐筆繞出來
                let option_value = _content[content_key];
                    // console.log('_key, _value : ', content_key, option_value);
                const regex = new RegExp('combo', 'gi');                // 建立比對文字'combo'
                if ((match = regex.exec(content_key)) === null) {       // 非combo選項，直接帶入value
                    $('#'+content_key).val(option_value); 
                    
                }else{                                                  // combo選項，需要特例檢查，以便開啟其他輸入
                    if(option_value !== null){                          // 預防空值null
                        if(typeof option_value === 'object'){
                            option_value.forEach((item_value, index)=>{
                                // console.log(content_key, item_value);                                
                                let targetItemSelector = `${content_key}_${item_value}`;
                                let targetItem = document.querySelector(`[id^="${targetItemSelector}"]`);
                                if(targetItem){
                                    targetItem.checked = true;

                                    if ($('#'+ targetItemSelector ).hasClass("other_item")){                // 其他選項
                                        $('#'+ targetItemSelector + '_o').removeClass('unblock').removeAttr("disabled");
                                    }
                                }else if($('#' + content_key + '_' + option_value[index-1]).hasClass("other_item")){
                                    $('#' + content_key + '_' + option_value[index-1] + '_o').val(item_value);
                                }
                            })

                        }else{
                            // 240613 correspond對應選項功能
                            let check_option = document.querySelector("#"+content_key+" option[value='"+option_value+"']");     // 抓取該項value的option
                            option_classList_value = check_option.classList.value;                                              // 取得它的classList
                            if(option_classList_value.includes('correspond')){                                                  // 假如classList含有correspond
                                let unblack_option = document.querySelectorAll("#"+content_key+" option[class='"+option_classList_value+"']") //抓出所有含classList的option
                                unblack_option.forEach((correspondElement) => {                                                 // 繞出來
                                    correspondElement.hidden = false;                                                           // 取消隱藏
                                });
                            }
                            check_option.selected = true;
                        }
                    }
                }
            })

        // 240709 修正上傳路徑
        let currentYear = new Date().getFullYear(); // 获取当前年份
        let row_obj = {};
        row_obj.anis_no = ((document_row['anis_no'] !== undefined) ? document_row['anis_no'] : '');
        row_obj.case_year = (document_row.created_at) ? document_row.created_at.substr(0,4) : currentYear.toString();   // 例外處理
        let row_json = document.getElementById('row_json');
        if(row_json){
            row_json.innerHTML = JSON.stringify(row_obj);
        }

        // edit step9.鋪設logs紀錄
            let json     = JSON.parse(document_row["logs"]);
            let forTable = document.querySelector('.logs tbody');
            $('#logs_div').removeClass('unblock');                              // 解除隱藏
            for (let i = 0, len = json.length; i < len; i++) {
                json[i].remark = json[i].remark.replaceAll('_rn_', '<br>');     // *20231205 加入換行符號
                forTable.innerHTML += 
                    '<tr><td>' + json[i].step + '</td><td>' + json[i].cname + '</td><td>' + json[i].datetime + '</td><td>' + json[i].action + 
                        '</td><td style="text-align: left; word-break: break-all;">' + json[i].remark + '</td></tr>';
            }

        // edit step10.鋪設Editions紀錄
            let editions_arr = JSON.parse(document_row["editions"]);
            if(editions_arr != null && editions_arr.length >0){
                let editTable = document.querySelector('.editions tbody');
                $('#editions_div').removeClass('unblock');                              // 解除隱藏
                for (let i = 0; i < editions_arr.length;  i++) {
                    let content_item =''
                    for (const [u_key, u_value] of Object.entries(editions_arr[i].update_document)) {
                        if(typeof u_value == 'object'){
                            content_item += '<b>◎&nbsp'+u_key+'：</b></br>';
                            for (const [u_item_key, u_item_value] of Object.entries(u_value)) {
                                content_item += '&nbsp&nbsp&nbsp-&nbsp'+u_item_key+'：'+u_item_value+'</br>';
                            }
                        }else{
                            content_item += '<b>◎&nbsp'+u_key+'：</b>'+u_value+'</br>';
                        }
                    }
                    editTable.innerHTML += '<tr><td>' + (i+1) + '</td><td>' + editions_arr[i].updated_cname + '</td><td>' + editions_arr[i].updated_at 
                            + '</td><td style="text-align: left; word-break: break-all;">' + content_item + '</td></tr>';
                }
            }

        let sinn = action + '&nbsp模式開啟，表單套用成功&nbsp!!';
        inside_toast(sinn);
        return true;
    }
    
    // // 0-0.多功能擷取fun 舊版使用XMLHttpRequest()
        // async function old_load_fun(fun, parm, myCallback) {        // parm = 參數
        //     return new Promise((resolve, reject) => {
        //         let formData = new FormData();
        //         formData.append('fun', fun);
        //         formData.append('parm', parm);                  // 後端依照fun進行parm參數的採用
        //         let xhr = new XMLHttpRequest();
        //         xhr.open('POST', 'load_fun.php', true);
        //         xhr.onload = function () {
        //             if (xhr.status === 200) {
        //                 let response = JSON.parse(xhr.responseText);    // 接收回傳
        //                 let result_obj = response['result_obj'];        // 擷取主要物件
        //                 resolve(myCallback(result_obj))                 // resolve(true) = 表單載入成功，then 呼叫--myCallback
        //                                                                 // myCallback：form = bring_form() 、document = edit_show() 、locals = ? 還沒寫好
        //             } else {
        //                 alert('fun load_'+fun+' failed. Please try again.');
        //                 reject('fun load_'+fun+' failed. Please try again.'); // 載入失敗，reject
        //             }
        //         };
        //         xhr.send(formData);
        //     });
        // }
    // 0-0.多功能擷取fun 新版改用fetch
    async function load_fun(fun, parm, myCallback) {        // parm = 參數
        try {
            let formData = new FormData();
            formData.append('fun', fun);
            formData.append('parm', parm);                  // 後端依照fun進行parm參數的採用

            let response = await fetch('load_fun.php', {
                method: 'POST',
                body  : formData
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
// // 20240430 -- step_3 依cherk_action = true/false 啟閉表單特定元素
    async function setFormDisabled(cherk_action) {
        // console.log('step_3 setFormDisabled(cherk_action)：', cherk_action);
        // return true;
        return new Promise((resolve) => {  
            // 获取表单元素
            const mainForm = document.getElementById('mainForm');  
            // 获取表单中的所有可输入元素
            const formElements = mainForm.querySelectorAll('input, select, textarea, button');
            // 遍历每个表单元素，并根据cherk_action的值设置其disabled属性
            formElements.forEach(function(element) {
                // 例外處理：检查元素的类名是否包含"accordion-button"於以排除       // 排除lock項目
                if (!element.classList.contains("accordion-button") && !element.classList.contains("unblock") && !element.classList.contains("lock")) {
                    element.disabled = cherk_action;
                }
            });
            // 对于radio和checkbox，也需要分别处理
            const radioButtons = mainForm.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(function(radio) {
                // if (!radio.classList.contains("other_item")) {      // 排除other_item
                if(radio.disabled != true){
                    radio.disabled = cherk_action;
                }
                // }
            });
            const checkboxes = mainForm.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(function(checkbox) {
                // if (!checkbox.classList.contains("other_item")) {   // 排除other_item
                if(checkbox.disabled != true){
                    checkbox.disabled = cherk_action;
                }
                // }
            });
            // 例外處理：特別將與會人員的x關閉
            const spans = mainForm.querySelectorAll('span[class="remove"]');
            spans.forEach(function(span) {
                span.disabled = cherk_action;
            });
            // 唯讀模式下，移除特定對象elements
            if(cherk_action){
                $('#submit_btn, #delete_btn, #submit_action, #searchUser').empty();
            }
            resolve(); // 文件載入成功，resolve
        });
    }
// // 20240502 -- step_4 依cherk_action = true/false 啟閉表單特定元素


// 20240502 -- (document).ready(()=> await 依序執行step 1 2 3
    async function loadData() {
        try {
                mloading(); 
                // await load_fun('locals','', init_locals);   // step_0 load_form(dcc_no);             // 20240501 -- 改由後端取得 form_a 內容
                await load_fun('form', dcc_no, bring_form); // step_1 load_form(dcc_no);             // 20240501 -- 改由後端取得 form_a 內容
                await signature_canva();                    // step_1-1 signature_canva();           // 
                await eventListener();                      // step_1-2 eventListener();             // 
            if(action == "edit" || action == "review" ){
                await load_fun('document', uuid, edit_show);// step_2 load_document(uuid);           // 20240501 -- 改由後端取得 _document內容
            }
                await setFormDisabled(check_action);        // step_3 setFormDisabled(cherk_action); // 依cherk_action = true/false 啟閉表單特定元素

        } catch (error) {
            console.error(error);
        }
        $("body").mLoading("hide");

    }

    // 20240529 確認自己是否為彈出視窗 !! 只在完整url中可運行 = tw123456p.cminl.oa
    function checkPopup() {
        var urlParams = new URLSearchParams(window.location.search);
        if ((urlParams.has('popup') && urlParams.get('popup') === 'true') || (window.opener)) {
            // console.log('这是 弹窗');
            let nav = document.querySelector('nav');                // 獲取 <nav> 元素
            nav.classList.add('unblock');                           // 添加 'unblock' class
            let rtn_btns = document.querySelectorAll('.rtn_btn');   // 獲取所有帶有 'rtn_btn' class 的按鈕
            rtn_btns.forEach(function(btn) {                        // 遍歷這些按鈕，並設置 onclick 事件
                btn.onclick = function() {
                    // window.close();
                    closeWindow();                                  // true=更新 / false=不更新
                };
            });
        }
    }

    $(document).ready(function(){

        // 確認是主頁面或popup
        checkPopup();   

        // 20240502 -- 調用 loadData 函數來載入數據 await 依序執行step 1 2 3
        loadData();

    })
