
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
                    swal(swal_value['fun'] ,swal_value['content'] ,swal_value['action'], {buttons: false, timer:2000}).then(()=>{resolve();});  // 2秒自動關閉畫面; 載入成功，resolve
                
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
        balertObj = [...balertObj, ...balertArr];

        if(balertArr.length !== 0){
            balertArr.forEach((item, key) => {
                make_inValue(item, key, false);     // false=存檔的舊資料
            })
        }
    }

        // step.1a 生成數值+渲染
        function make_inValue(item, key, newOne){
            let autoinput = newOne ? 'autoinput' : '';
            let append_item = `<div class="input-group p-1" id="balert_${key}" >`
                + `<span class="form-control ${autoinput} mb-0 text-center alert-${item._type}" >${item._type}</span>`
                + `<span class="form-control ${autoinput} mb-0 w70" >${item._value}</span>`;
            if (userInfo.role <= 1){
                append_item += `<button type="delete" class="btn btn-outline-danger" name="balert_${key}" value="${key}" title="刪除" >&nbsp;<i class="fa-solid fa-xmark"></i>&nbsp;</button>`;
            }
            append_item += `</div>`;
            $('#balert').append(append_item); // 渲染
        }

    // step.2 
    function eventListener(){
        // 240814 監聽 append 是否有點擊
            const balerts_append = document.querySelector('#balert_append button[type="append"]');
            balerts_append.addEventListener('click', function() {
                const app_type = $(`#${this.value}_type`).val();                // 取得內為內容
                const app_value = $(`#${this.value}_value`).val();         

                const missingValues = [];                                       // 建立確認陣列
                if (!app_type) missingValues.push('底色 沒有選值');              // 確認app_type
                if (!app_value) missingValues.push('內容 沒有填值');             // 確認app_value
        
                if (missingValues.length > 0) {
                    alert(missingValues.join('、'));                            // 警示

                } else {
                    const item = {
                        "_type"  : app_type,
                        "_value" : app_value
                    }
                    balertObj.push(item);                                       // 添加陣列的某值
                    let key = balertObj.length - 1;                             // 這裡 key 就是新加物件的索引
                    make_inValue(item, key, true);                              // true = 新增項目
                    $(`#${this.value}_type, #${this.value}_value`).val('');     // 清除input內值

                    let sinn = `**&nbsp;添加訊息[ ${key} => ${app_type}：${app_value} ]&nbsp;!!`;
                    inside_toast(sinn);

                    reload_delete_Listeners();                                  // 更新delete監聽
                }
            });
        // 240814 監聽 append 是否有點擊
        
        // 240814 監聽 append_submit 是否有點擊
            const append_submit = document.getElementById('append_submit');
            append_submit.addEventListener('click', () => {
                const balertObj_filter = balertObj.filter(item => item !== undefined);    // 去除空白
                const balertStr = JSON.stringify(balertObj_filter);
                load_fun('update_balert', balertStr, show_swal_fun);
            })
        // 240814 監聽 append_submit 是否有點擊

        reload_delete_Listeners();  // 呼叫建立delete監聽
    }

    // 250331 定義delete鈕功能~~
    let deleteClickListener;
    async function reload_delete_Listeners() {
        const balerts_delete_btn = Array.from(document.querySelectorAll('#balert button[type="delete"]'));   //  定義出delete_btn範圍
        // 檢查並移除已經存在的監聽器
        if (deleteClickListener) {
            balerts_delete_btn.forEach( del_btn => {
                del_btn.removeEventListener('click', deleteClickListener);   // 移除監聽delete_btn
            })
        }   
        // 定義新的監聽器函數delete_btn
        deleteClickListener = async function () {
            delete balertObj[this.value];                                   // 刪除陣列的某值
            $(`#${this.name}`).remove();                                    // 畫面中清除某值

            let sinn = `**&nbsp;移除index[ ${this.value} ]&nbsp;!!`;
            inside_toast(sinn);
        }
        // 添加新的監聽器
        if(userInfo.role <= 1){
            balerts_delete_btn.forEach( del_btn => {
                del_btn.addEventListener('click', deleteClickListener);  // 增加監聽delete_btn
            })
        }
    }


    let balertArr = [];     // int.1 定義全域變數：arr
    let balertObj = [];     // int.1 定義全域變數：obj
    $(async function () {
        // 在任何地方啟用工具提示框
            $('[data-toggle="tooltip"]').tooltip();
        // 確認是主頁面或popup
            checkPopup();
        // step.1 抓json數值 + 生成數值+渲染
            await step1_make_inValue();
        // step.2 建立append+submit+delete監聽
            eventListener();
    })
