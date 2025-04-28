
    // 吐司顯示字條 // init toast
    function inside_toast(sinn){
        let toastLiveExample = document.getElementById('liveToast');
        let toast = new bootstrap.Toast(toastLiveExample);
        let toast_body = document.getElementById('toast-body');
        toast_body.innerHTML = sinn;
        toast.show();
    }

    // 240814 監聽 HE_CATE_json 是否異動
        const heCateJson = document.getElementById('HE_CATE_json').innerText;   // 取得row_json
        const heCateObj  = JSON.parse(heCateJson);                              // row_json轉row_obj
    // 240814 監聽 HE_CATE_json 是否異動

    // 240814 new append 呼叫 delete
        function append_delete(this_name, this_value){
            delete heCateObj[this_value];                   // 刪除陣列的某值
            $('#HE_CATE_json').empty().append(JSON.stringify(heCateObj)); // 更新畫面中json
            $('#'+this_name).remove();                      // 畫面中清除某值
            let sinn = '**&nbsp;移除危害類別[ '+this_value+' ]&nbsp;!!';
            inside_toast(sinn);
        }
    // 240814 new append 呼叫 delete

    function eventListener(){
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
        // 240813 監聽 delete 是否有點擊
            const heCateContainer = document.getElementById('HE_CATE');
            const heCates_delete = Array.from(heCateContainer.querySelectorAll('button[type="delete"]'));
            heCates_delete.forEach(heCates_del => {
                heCates_del.addEventListener('click', function() {
                    delete heCateObj[this.value];                   // 刪除陣列的某值
                    $('#HE_CATE_json').empty().append(JSON.stringify(heCateObj)); // 更新畫面中json
                    $('#'+this.name).remove();                      // 畫面中清除某值
                    let sinn = '**&nbsp;移除危害類別[ '+this.value+' ]&nbsp;!!';
                    inside_toast(sinn);
                });
            });
        // 240813 監聽 delete 是否有點擊
        // 240814 監聽 append 是否有點擊
            const heCateAppend = document.getElementById('HE_CATE_append');
            const heCates_append = Array.from(heCateAppend.querySelectorAll('button[type="append"]'));
            heCates_append.forEach(heCates_app => {
                heCates_app.addEventListener('click', function() {
                    const app_key = $("#"+this.value+"_key").val();             // 取得內為內容
                    const app_value = $("#"+this.value+"_value").val();         
                    const missingValues = [];                                   // 建立確認陣列
                    if (!app_key) missingValues.push('代碼 沒有填值');          // 確認app_key
                    if (!app_value) missingValues.push('類別 沒有填值');        // 確認app_value
                    if (missingValues.length > 0) {
                        alert(missingValues.join('、'));                        // 警示
                    } else {
                        if(app_key in heCateObj){
                            alert('代碼[ '+app_key+' ]已存在，請重新確認!!\r\n\n本次添加無效!!');
                        }else{
                            heCateObj[app_key] = app_value;                     // 添加陣列的某值
                            $('#HE_CATE_json').empty().append(JSON.stringify(heCateObj)); // 更新畫面中json
                            const append_item = '<div class="input-group p-1" id="HE_CATE_'+app_key+'" >'
                                    + '<span class="form-control autoinput mb-0 text-center" >'+app_key+'</span>'
                                    + '<span class="form-control autoinput mb-0 w50" >'+app_value+'</span>'
                                    + '<button type="delete" class="btn btn-outline-danger" name="HE_CATE_'+app_key+'" value="'+app_key+'" title="刪除" onclick="append_delete(this.name, this.value)">&nbsp;<i class="fa-solid fa-xmark"></i>&nbsp;</button>'
                                    + '</div>';
                            $('#HE_CATE').append(append_item);                          // 渲染
                            $("#"+this.value+"_key, #"+this.value+"_value").val('');    // 清除input內值
                            let sinn = '**&nbsp;添加危害類別[ '+app_key+'：'+app_value+' ]&nbsp;!!';
                            inside_toast(sinn);
                        }
                    }
                });
            });
        // 240814 監聽 append 是否有點擊
        // 240814 監聽 append_submit 是否有點擊
            const append_submit = document.getElementById('append_submit');
            append_submit.addEventListener('click', () => {
                const heCateStr = JSON.stringify(heCateObj);
                load_fun('update_heCate', heCateStr, show_swal_fun);   // step_2 load_shLocal(id);
            })
        // 240814 監聽 append_submit 是否有點擊
    }
    // 20240314 配合await將swal外移
    function show_swal_fun(swal_value){
        return new Promise((resolve) => {  
            $("body").mLoading("hide");
            if(swal_value && swal_value['fun'] && swal_value['content'] && swal_value['action']){
                if(swal_value['action'] == 'success'){
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{location.href = url});     // n秒后回首頁
                    // swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action']).then(()=>{closeWindow(true)});        // 手動關閉畫面
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{closeWindow(true); resolve();});  // 2秒自動關閉畫面; 載入成功，resolve
                
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
        // step_1-2 eventListener();
        eventListener();
    })
