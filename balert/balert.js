
    // 吐司顯示字條 // init toast
    function inside_toast(sinn){
        let toastLiveExample = document.getElementById('liveToast');
        let toast = new bootstrap.Toast(toastLiveExample);
        let toast_body = document.getElementById('toast-body');
        toast_body.innerHTML = sinn;
        toast.show();
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

            if(parm === 'return' || myCallback === 'return'){
                return result_obj;                          // resolve(true) = 表單載入成功，then 直接返回值
            }else{
                return myCallback(result_obj);                  // resolve(true) = 表單載入成功，then 呼叫--myCallback
            }                                               // myCallback：form = bring_form() 、document = edit_show() 、locals = ? 還沒寫好

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


    
    // step.1 抓json數值 + 生成數值+渲染
    async function step1_make_inValue(){
        balertArr = await load_fun('load_balert','load_balert','return');
        // console.log('balertArr...', balertArr)
        balertObj = [...balertObj, ...balertArr];
        make_inValue(balertArr, false);
    }
        // 生成數值+渲染
        function make_inValue(balertArr, newOne){
            if(balertArr.length !== 0){
                let autoinput = newOne ? 'autoinput' : '';
                balertArr.forEach((item, key) => {
                    let append_item = `<div class="input-group p-1" id="balert_${key}" >`
                        + `<span class="form-control ${autoinput} mb-0 text-center alert-${item._type}" >${item._type}</span>`
                        + `<span class="form-control ${autoinput} mb-0 w70" >${item._value}</span>`;
                    if (userInfo.role <= 1){
                        append_item += `<button type="delete" class="btn btn-outline-danger" name="balert_${key}" value="${key}" title="刪除" >&nbsp;<i class="fa-solid fa-xmark"></i>&nbsp;</button>`;
                    }
                    append_item += `</div>`;
                    $('#balert').append(append_item); // 渲染
                })
            }
        }

    // step.2 
    function eventListener(){

        // 240813 監聽 delete 是否有點擊
            const balertContainer = document.getElementById('balert');
            const balerts_delete = Array.from(balertContainer.querySelectorAll('button[type="delete"]'));
            balerts_delete.forEach(balerts_del => {
                balerts_del.addEventListener('click', function() {
                    // console.log('delete...', this.name);
                    delete balertObj[this.value];                   // 刪除陣列的某值
                    // console.log('balertObj...', balertObj);
                    $('#balert_json').empty().append(JSON.stringify(balertObj)); // 更新畫面中json
                    $(`#${this.name}`).remove();                      // 畫面中清除某值
                    let sinn = `**&nbsp;移除index[ ${this.value} ]&nbsp;!!`;
                    inside_toast(sinn);
                });
            });
        // 240813 監聽 delete 是否有點擊

        // 240814 監聽 append 是否有點擊
            const balertAppend = document.getElementById('balert_append');
            const balerts_append = Array.from(balertAppend.querySelectorAll('button[type="append"]'));
            balerts_append.forEach(balerts_app => {
                balerts_app.addEventListener('click', function() {
                    const app_type = $(`#${this.value}_type`).val();             // 取得內為內容
                    const app_value = $(`#${this.value}_value`).val();         

                    const missingValues = [];                                   // 建立確認陣列
                    if (!app_type) missingValues.push('代碼 沒有選值');          // 確認app_type
                    if (!app_value) missingValues.push('類別 沒有填值');        // 確認app_value
            
                    if (missingValues.length > 0) {
                        alert(missingValues.join('、'));                        // 警示
                    } else {
                        // console.log('append...', this.value, app_type, app_value);
                        // balertObj[app_type] = app_value;                     // 添加陣列的某值
                        balertObj.push({"_type" : app_type, "_value" : app_value});                     // 添加陣列的某值
                        console.log('balertObj...', balertObj);
                        // 獲取該物件的索引
                        let key = balertObj.length - 1; // 這裡 index 就是新加物件的索引


                        $('#balert_json').empty().append(JSON.stringify(balertObj)); // 更新畫面中json

                        const append_item = `<div class="input-group p-1" id="balert_${key}" >`
                                + `<span class="form-control autoinput mb-0 text-center alert-${app_type}" >${app_type}</span>`
                                + `<span class="form-control autoinput mb-0 w70" >${app_value}</span>`
                                + `<button type="delete" class="btn btn-outline-danger" name="balert_${key}" value="${key}" title="刪除" onclick="append_delete(this.name, this.value)">&nbsp;<i class="fa-solid fa-xmark"></i>&nbsp;</button>`
                                + `</div>`;
                        $('#balert').append(append_item);                          // 渲染
                        $(`#${this.value}_key, #${this.value}_value`).val('');    // 清除input內值
                        let sinn = `**&nbsp;添加訊息[ ${key} => ${app_type}：${app_value} ]&nbsp;!!`;
                        inside_toast(sinn);
                    }
                });
            });
        // 240814 監聽 append 是否有點擊
        
        // 240814 監聽 append_submit 是否有點擊
            const append_submit = document.getElementById('append_submit');
            append_submit.addEventListener('click', () => {
                // console.log('append_submit...',balertObj);
                let balertObj_filter = balertObj.filter(item => item !== undefined);    // 去除空白
                const balertStr = JSON.stringify(balertObj_filter);
                load_fun('update_balert', balertStr, show_swal_fun);   // step_2 load_shLocal(id);
            })
        // 240814 監聽 append_submit 是否有點擊

    }

    // 250331 定義nav-tab [nav-p2-tab]+[nav-p3-tab]鈕功能~~
    let balerts_deleteClickListener;
    let navP3tabClickListener;
    async function reload_notify2_Listeners() {
        const balerts_delete_btn = document.querySelector('#nav-tab #nav-p2-tab');   //  定義出p2_btn範圍
        const navP3tab_btn = document.querySelector('#nav-tab #nav-p3-tab');   //  定義出p3_btn範圍
        // 檢查並移除已經存在的監聽器
            if (balerts_deleteClickListener) {
                balerts_delete_btn.removeEventListener('click', balerts_deleteClickListener);   // 移除監聽p2_btn
            }   
            if (navP3tabClickListener) {
                navP3tab_btn.removeEventListener('click', navP3tabClickListener);   // 移除監聽p3_btn
            }   
    
        // 定義新的監聽器函數p2_btn
        balerts_deleteClickListener = async function () {
                console.log('p2_btn click...')
            await p2_init(false);
        }
        // 定義新的監聽器函數p3_btn
        navP3tabClickListener = async function () {
                console.log('p3_btn click...')
            await p3_init();
        }

        // 添加新的監聽器
        if(userInfo.role <= 1){
            balerts_delete_btn.addEventListener('click', balerts_deleteClickListener);  // 增加監聽p2_btn
            navP3tab_btn.addEventListener('click', navP3tabClickListener);  // 增加監聽p3_btn
        }
    }
                            // // 240814 new append 呼叫 delete
                            // function append_delete(this_name, this_value){
                            //     // console.log('append_delete...', this_name, this_value);
                            //     delete balertObj[this_value];                   // 刪除陣列的某值
                            //     // console.log('balertObj...', balertObj);
                            //     $('#balert_json').empty().append(JSON.stringify(balertObj)); // 更新畫面中json
                            //     $('#'+this_name).remove();                      // 畫面中清除某值
                            //     let sinn = `**&nbsp;移除index[ ${this_value} ]&nbsp;!!`;
                            //     inside_toast(sinn);
                            // }
                            // // 240814 new append 呼叫 delete

    let balertArr = [];     // int.1 定義全域變數：arr
    let balertObj = [];     // int.1 定義全域變數：obj
    $(async function () {
        // 在任何地方啟用工具提示框
            $('[data-toggle="tooltip"]').tooltip();

        // 確認是主頁面或popup
            checkPopup();

        // step.1
        await step1_make_inValue();

        // step_1-2 eventListener();
        eventListener();


    })
