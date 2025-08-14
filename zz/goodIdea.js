// -- -- -- 回到dataTable的指定分頁，利用localStorage儲存訊息

        // 載入dataTable
        const catalog_table = $('#catalog_table').DataTable({
            "language": { url: "../../libs/dataTables/dataTable_zh.json" }, // 中文化
            "autoWidth": false,                                             // 自動寬度
            "pageLength": 25,                                               // 顯示長度
            // "order": [[ 4, "asc" ]],                                     // 排序
            "initComplete": async function() {                                      // 這裡是其他設定
                // 初始化時檢查 localStorage 是否有fabId
                const sortForm = getFormValue('sortForm');                    // 取得目前頁面上的fabId
                const fabIdKey = `nurseEM_${tableName}_fabId`;
                const pageKey  = `nurseEM_${tableName}_Page`;

                // 從 localStorage 獲取 fabId
                const _fabId = localStorage.getItem(fabIdKey);
                if (_fabId && _fabId != sortForm.fab_id) {
                    await remove_localStorageItem(pageKey);
                }
                localStorage.setItem(fabIdKey, sortForm.fab_id);
                
                // 初始化時檢查 localStorage 是否有頁碼
                const page = localStorage.getItem(pageKey);
                if (page) {
                    catalog_table.page(parseInt(page)).draw(false);
                }
            }
        });

        // 當頁面改變時，儲存當前頁碼
        catalog_table.on('page.dt', function() {
            const pageKey  = `nurseEM_${tableName}_Page`;
            const pageInfo = catalog_table.page.info();
            localStorage.setItem(pageKey, pageInfo.page);
        });

        // 按鈕監聽--for dataTable search
        const cateId_btns = document.querySelectorAll('#category_id .cate_id');
        cateId_btns.forEach(btn => {
            btn.addEventListener('click', function() {
                catalog_table.search(this.value).draw();     // 在特危作業清單的search帶入部門代號，他會過濾出符合的清單
            })
        })

// -- -- -- 回到dataTable的指定分頁，利用localStorage儲存訊息

    // 移除localStorage暫存項目
    function remove_localStorageItem(targetItem){
        return new Promise((resolve) => {
            // 初始化時檢查 localStorage 是否有頁碼
            var page = localStorage.getItem(`${targetItem}`);
            if (page) {
                localStorage.removeItem(`${targetItem}`);
            }
            resolve();      // 當所有設置完成後，resolve Promise
        });
    }
    
    // 移除sessionStorage暫存項目
    function clrSession(killAll){
        // console.log('sessionStorage...ASIS：',sessionStorage)
        if(killAll){
            sessionStorage.clear();
        }else{
            Object.keys(sessionStorage).forEach(ssKey => {
                if ((ssKey).includes(sys_id)){
                    // const value = sessionStorage.getItem(ssKey);
                    // console.log(ssKey, value);
                    sessionStorage.removeItem(ssKey);
                }
            });
        }
        // console.log('sessionStorage...TOBE：',sessionStorage)
        inside_toast('sessionStorage isCleared...', 0, 'info', 'clrSession');
    }

    // 取得篩選select內的value
    function getFormValue(targetForm) {
        const targetForm_arr = Array.from(document.querySelectorAll(`#${targetForm} select`));
        const selectedOptions = targetForm_arr.flatMap(select => 
            Array.from(select.options).filter(option => option.selected).map(option => ({
                [select.name] : option.value                                // 取得對應的 select 的 name 和 vale
            }))
        );
        const selectResult = Object.assign({}, ...selectedOptions);         // 將 selectedOptions 轉換成一個單一的物件
        return selectResult;
    }

    // tab-2.個人業務清單 切換上架/下架開關
    let flagBtns = [...document.querySelectorAll('.flagBtn')];
    for(let flagBtn of flagBtns){
        flagBtn.onclick = e => {
            // console.log('e', flagBtn.id, flagBtn.value);
            // document.querySelector('#edit_sitePm_'+sitePm_item).checked = true;
            let yess = confirm('確認要切換？');
            if(!yess){
                console.log(yess);
                if(flagBtn.value == 'Off'){
                    flagBtn.checked = true; 
                }else{
                    flagBtn.checked = false; 
                }
            }else{
                $.ajax({
                    url:'../api/index.php',
                    method:'post',
                    dataType:'json',
                    data:{
                        function: 'cheng_flag',           // 操作功能
                        table: 'mytodo',
                        id: flagBtn.id,
                        flag: flagBtn.value
                    },
                    success: function(res){
                        let res_r = res["result"];
                        let res_r_flag = res_r["flag"];
                        // console.log(res_r_flag);
                        if(res_r_flag == 'Off'){
                            // flagBtn.classList.remove('btn-success');
                            // flagBtn.classList.add('btn-warning');
                            flagBtn.value = 'Off';
                            document.getElementById('edit_btn_'+flagBtn.id).innerText = 'Off';
                            flagBtn.checked = true; 

                        }else{
                            // flagBtn.classList.remove('btn-warning');
                            // flagBtn.classList.add('btn-success');
                            flagBtn.value = 'On';
                            document.getElementById('edit_btn_'+flagBtn.id).innerText = 'On';
                            flagBtn.checked = false; 

                        }
                    },
                    error: function(e){
                        console.log("error");
                    }
                });
            }
        }
    }

// -- -- -- 回到nav-tab的指定分頁，利用localStorage儲存訊息(尚未完善)

    // 切換指定分頁 (PHP部分)
    if(isset($_REQUEST["activeTab"])){
        $activeTab = $_REQUEST["activeTab"];
    }else{
        $activeTab = "1";
    }


        // 250331 定義nav-tab [nav-p2-tab]鈕功能~~
        let navP2tabClickListener;
        async function reload_navTab_Listeners() {
            const navP2tab_btn = document.querySelector('#nav-tab #nav-p2-tab');   //  定義出p2_btn範圍
            // 檢查並移除已經存在的監聽器
                if (navP2tabClickListener) {
                    navP2tab_btn.removeEventListener('click', navP2tabClickListener);   // 移除監聽p2_btn
                }   
            // 定義新的監聽器函數p2_btn
            navP2tabClickListener = async function () {
                mloading(); 
                try {
                    await drawEchart21(true); 
    
                } catch (error) {
                    console.error(error);
                }
                $("body").mLoading("hide");
            }
            // 添加新的監聽器
            navP2tab_btn.addEventListener('click', navP2tabClickListener);  // 增加監聽p2_btn
        }

        // 切換指定NAV分頁
        // 设置要自动选中的选项卡的索引（从0开始）
        var activeTab = '<?=$activeTab;?>';
        // 激活选项卡
        $('.nav-tabs button:eq(' + activeTab + ')').tab('show');