    // 重新架構
    async function resetINF(request){
        if(request){
            shLocalDept_inf  = [];
            // staff_inf     = [];
            // loadStaff_tmp = [];
            // _doc_inf      = [];
            // _doc_inf.idty = null;

            await release_dataTable();
            resetMaintainDept();
            $('#hrdb_table tbody').empty();

            // $('#form_btn_div').empty();
            // $('#logs_div .logs tbody').empty();
            // $('#reviewInfo').empty();
            // $('#logsInfo').empty();

        }else{
            // await release_dataTable();                  // 停止並銷毀 DataTable
            // await post_hrdb(staff_inf);                 // step-1.選染到畫面 hrdb_table
            // await post_preYearShCase(staff_inf);        // step-1-1.重新渲染去年 shCase&判斷  // 241024 停止撲到下面
            // await post_shCase(staff_inf);               // step-1-2.重新渲染 shCase&判斷
        }

        // if(userInfo.role <= '2.2' && _doc_inf.idty <= 4 ){                        // 限制role <= 3 現場窗口以下...排除主管和路人
        //     // await reload_HECateTable_Listeners();   // 重新定義HE_CATE td   // 關閉可防止更動 for簽核
        //     await reload_shConditionTable_Listeners();
        //     await reload_yearHeTable_Listeners();
        //     await reload_yearPreTable_Listeners();
        // }else{
        //     // changeHE_CATEmode();                    // 241108 改變HE_CATE calss吃css的狀態；主要是主管以上不需要底色編輯提示
        //     changeShConditionMode();
        //     changeYearHeMode();
        //     changeYearPreMode();
        // }
        
        await reload_postMemoMsg_btn_Listeners();
        await btn_disabled();                       // 讓指定按鈕 依照shLocalDept_inf.length 啟停 
    }
    // 讓指定按鈕 依照shLocalDept_inf.length 啟停
    function btn_disabled(){
        return new Promise((resolve) => {
            console.log('shLocalDept_inf.length =>', shLocalDept_inf.length)
            download_excel_btn.disabled = shLocalDept_inf.length === 0;  // 讓 下載 按鈕啟停
            resetINF_btn.disabled       = shLocalDept_inf.length === 0;  // 讓 清除 按鈕啟停
            bat_storeDept_btn.disabled  = shLocalDept_inf.length === 0;  // 讓 儲存 按鈕啟停
            // SubmitForReview_btn.disabled = shLocalDept_inf.length === 0 || (_doc_inf.idty >= 4);   // 讓 送審 按鈕啟停

            // loadExcel_btn.disabled       = (_doc_inf.idty >= 4) || (userInfo.role >= 2);     // 讓 新增 按鈕啟停
            // importStaff_btn.disabled     = (_doc_inf.idty >= 4) || (userInfo.role >= 2);     // 讓 上傳 按鈕啟停

            // if(_doc_inf.idty >= 4){
            //     bat_storeStaff_btn.disabled  = true;  // 讓 儲存 按鈕啟停
            //     SubmitForReview_btn.disabled = true;  // 讓 送審 按鈕啟停
            // }
            
            // document.querySelectorAll(`#hrdb_table input[id*="eh_time,"]`).forEach(input => input.disabled   = (_doc_inf.idty >= 5 || _doc_inf.in_sign != userInfo.empId ));   // 讓所有eh_time 輸入欄位啟停 = 主要for已送審
            // document.querySelectorAll(`#hrdb_table button[class*="eraseStaff"]`).forEach(btn => btn.disabled = (_doc_inf.idty >= 5 || _doc_inf.in_sign != userInfo.empId ));   // 讓所有eraseStaff btn啟停 = 主要for已送審
            // postMemoMsg_btn.disabled     = (_doc_inf.idty >= 4);    // 讓 貼上備註 按鈕啟停
            // memoMsg_input.disabled       = (_doc_inf.idty >= 4)

            resolve();
        });
    }
    // 250220 取得本月份及上個月份
    function getCurrentAndLastMonth() {
        const currentDate = new Date();
        // 取得目前的年和月份
            const currentYear  = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1; // 月份從 0 開始，因此要 +1
        // 計算上個月的年和月份
            let lastMonth = currentMonth - 1;
            let lastYear  = currentYear;
        // 年份進退計算
            if (lastMonth === 0) {
                lastMonth = 12; // 上個月為 12 月
                lastYear -= 1;  // 年份減一
            }
        // 格式化成 YYYYMM
            const currentYearMonth = `${currentYear}${String(currentMonth).padStart(2, '0')}`;  // 本月
            const lastYearMonth    = `${lastYear}${String(lastMonth).padStart(2, '0')}`;        // 上月
        // 返回數據
        return { currentYearMonth, lastYearMonth };
    }
    // 250220 fun-2.函式：去重保留唯一值
    function uniqueArr(arr1, arr2){
        arr1 = arr1 ?? [];
        arr2 = arr2 ?? [];
        const arr3 = [...arr1, ...arr2];
        const uniqueArr = arr3.reduce((acc, current) => {
                                const key = Object.keys(current)[0]; // 取得物件的鍵
                                // 檢查該鍵是否已經存在於結果陣列中
                                if (!acc.some(item => Object.keys(item)[0] === key)) {
                                    acc.push(current); // 如果不存在則將該項目加入結果中
                                }
                                return acc;
                            }, []);
        return uniqueArr;
    }


    // p-2 批次儲存員工清單...
    async function bat_storeDept(){
        const bat_storeDept_value = JSON.stringify({
                shLocalDept_inf : shLocalDept_inf
            });
            // console.log('bat_storeDept_value',bat_storeDept_value);
        await load_fun('bat_storeDept', bat_storeDept_value, show_swal_fun);   // load_fun的變數傳遞要用字串
        location.reload();
    }


    // 備註說明模組 START
        // 開啟memoModal的預設工作
        async function memoModal(thisId){
            // step.1 標題列顯示姓名工號
            // $('#memoTitle').empty().append(`(${thisId})`);         // 清空+填上工號
            const thisId_arr = thisId.split(',');                 // 分割this.id成陣列
            const deptNo     = thisId_arr[1];                     // 取出陣列1=deptNo
            postMemoMsg_btn.value = deptNo;
            // step.2 取得dept的memo，並轉成陣列
            const deptData = shLocalDept_inf.find(dept => dept.OSHORT === deptNo);
                // const { remark } = deptData;
                // const _memo = remark['memo'] !== undefined ? remark['memo'] : [];
            if(deptData.remark == null){
                deptData.remark = {
                    'memo' : []
                }
            }
            const _memo = deptData.remark['memo'] ?? [];
                // console.log('deptData.remark...',deptData.remark)
                // console.log('_memo...',_memo)
            // step.3 取得memoBody
            const memoBody = document.getElementById('memoBody');
            memoBody.innerHTML = '';
            // step.4 有memo筆數
            if(_memo.length !== 0){
                let memoCard = '';
                for (const [memo_index, memo_value] of Object.entries(_memo)) {
                    memoCard += await mk_memoMsg(memo_index, memo_value);
                }
                // step.4.2 鋪設個人今年的memo
                memoBody.insertAdjacentHTML('beforeend', memoCard);
                    scrollToBottom(); // 自動捲動到底部
            }
            
            await reload_eraseMemoCarListeners();

        }
        // 生成單一memoCard
        function mk_memoMsg(_index, memo_i){
            return new Promise((resolve) => {
                const memoCard = `<tr><td><div class="row g-0" id="memo_i_${_index}">
                                    <div class="col-md-3 p-1 cover rounded"><img src="../image/nurse.png" alt="小護士" class="img-thumbnail" onerror="this.onerror=null; this.src='../image/lvl.png';"></div>
                                    <div class="col-md-9 p-1">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <h5 class="card-title mb-0" title="${memo_i.emp_id}" >${memo_i.cname}</h5>
                                            <button class="btn btn-link add_btn eraseMemoCar_btn `+ (memo_i.emp_id !== userInfo.empId && userInfo.role > 1 ? 'unblock':'')+`" value="${_index}" title="Erase it: ${_index}" `
                                                + (memo_i.emp_id !== userInfo.empId && userInfo.role > 1 ? 'disabled':'')+`><i class="fa-solid fa-delete-left"></i></button>
                                        </div>
                                        <div class="border rounded p-2 bg-white word_bk">${memo_i.msg}</div><p class="card-text"><small class="text-muted">${memo_i.timeStamp}</small></p></div></div></td></tr>`;
                resolve(memoCard);      // 當所有設置完成後，resolve Promise
            });
        }
        // 241226 建立PostMemoMsg_btn監聽功能 for 編輯 = [個案備註]
        let postMemoMsg_btnClickListener;
        async function reload_postMemoMsg_btn_Listeners() {
            return new Promise((resolve) => {
                // 檢查並移除已經存在的監聽器
                if (postMemoMsg_btnClickListener) {
                    postMemoMsg_btn.removeEventListener('click', postMemoMsg_btnClickListener);   // 將每一個tdItem移除監聽, 當按下click
                }
                // 定義新的監聽器函數
                postMemoMsg_btnClickListener = async function () {
                    const memoMsg_input = document.getElementById('memoMsg');
                    if(memoMsg_input.value.length == 0){
                        alert("沒有MemoMsg內容...");
                        return false;
                    }
                    //打包物件
                    const memoObj = {
                        'cname'     : userInfo.cname,
                        'emp_id'    : userInfo.empId,
                        'msg'       : (memoMsg_input.value).trim(),
                        'timeStamp' : getTimeStamp()
                    }

                    // *** 這裡要補上把訊息塞進去資料內...
                    const deptNo = postMemoMsg_btn.value;
                    // 取得個人今年的memo，並轉成陣列
                        const deptData = shLocalDept_inf.find(dept => dept.OSHORT === deptNo);
                        if(Object.entries(deptData.remark).length == 0){
                            deptData.remark = {
                                'memo' : []
                            }
                        }
                        deptData.remark['memo'].push(memoObj);
                            console.log('deptData.remark =>', deptData);
                    // 生成完整memo
                    const memoCard_index = deptData.remark['memo'].length - 1;
                    const memoCard = await mk_memoMsg(memoCard_index, memoObj)
                    // step.2.2 鋪設dept的memo
                    const memoBody = document.getElementById('memoBody');
                    memoBody.insertAdjacentHTML('beforeend', memoCard);
                        scrollToBottom(); // 自動捲動到底部
                    memoMsg_input.value = '';

                    await reload_eraseMemoCarListeners();

                }
                // 添加新的監聽器
                postMemoMsg_btn.addEventListener('click', postMemoMsg_btnClickListener);      // 將每一個tdItem增加監聽, 當按下click

                resolve();
            });
        }
        // 生成時間戳章 for memoCard
        function getTimeStamp(){
            var Today       = new Date();
            const thisToday = Today.getFullYear() +'/'+ String(Today.getMonth()+1).padStart(2,'0') +'/'+ String(Today.getDate()).padStart(2,'0');  // 20230406_bug-fix: 定義出今天日期，padStart(2,'0'))=未滿2位數補0
            const thisTime  = String(Today.getHours()).padStart(2,'0') +':'+ String(Today.getMinutes()).padStart(2,'0') +':'+ String(Today.getSeconds()).padStart(2,'0');                           // 20230406_bug-fix: 定義出今天日期，padStart(2,'0'))=未滿2位數補0
            const timeStamp = thisToday+' '+thisTime;
            return timeStamp;
        }
        // memoModal自動捲動到底部
        function scrollToBottom() {
            var offcanvasBody = $('#offcanvasRight .offcanvas-body');
            offcanvasBody.scrollTop(offcanvasBody[0].scrollHeight);
        }
        // 241227 建立eraseMemoCar_btn監聽功能 for 編輯 = [個案備註]
        let eraseMemoCarListener;
        function reload_eraseMemoCarListeners() {
            return new Promise((resolve) => {
                const eraseMemoCarBtns = document.querySelectorAll('#memoBody button[class*="eraseMemoCar_btn"]');      //  定義出範圍
                // 檢查並移除已經存在的監聽器
                if (eraseMemoCarListener) {
                    eraseMemoCarBtns.forEach(eraseBtn => {                                      // 遍歷範圍內容給eraseBtn
                        eraseBtn.removeEventListener('click', eraseMemoCarListener);   // 將每一個eraseBtn移除監聽, 當按下click
                    })
                }
                // 定義新的監聽器函數
                eraseMemoCarListener = async function () {
                    // *** 把訊息移出去個人資料內...
                    const deptNo = postMemoMsg_btn.value;
                        // 取得個人今年的memo，並轉成陣列後進行splice移除...
                        const deptData = shLocalDept_inf.find(dept => dept.OSHORT === deptNo);

                        deptData.remark['memo'] = deptData.remark['memo'] ?? [];
                        if(deptData.remark['memo'].length > 0){
                            await deptData.remark['memo'].splice(this.value, 1);
                                console.log('deptData =>', deptData);
                            
                            // *** 把畫面上的訊息移除...
                                // var element = document.getElementById(`memo_i_${this.value}`);
                                // if (element) {
                                //     element.parentNode.removeChild(element);
                                // }
                            // step.3 取得memoBody
                            const memoBody = document.getElementById('memoBody');
                            memoBody.innerHTML = '';
                            
                            const _memo = deptData.remark['memo'] ?? [];
                            // step.4 有memo筆數
                            if(_memo.length !== 0){
                                let memoCard = '';
                                for (const [memo_index, memo_value] of Object.entries(_memo)) {
                                    memoCard += await mk_memoMsg(memo_index, memo_value);
                                }
                                // step.4.2 鋪設個人今年的memo
                                memoBody.insertAdjacentHTML('beforeend', memoCard);
                                    scrollToBottom(); // 自動捲動到底部
                            }
                        }
                    await reload_eraseMemoCarListeners();
                    // await memoModal(['',edit_empId])
                }

                // 添加新的監聽器
                eraseMemoCarBtns.forEach(eraseBtn => {                                      // 遍歷範圍內容給eraseBtn
                    eraseBtn.addEventListener('click', eraseMemoCarListener);      // 將每一個eraseBtn增加監聽, 當按下click
                })

                resolve();
            });
        }
    // 備註說明模組 END

// // phase 2 -- 鋪設
    async function post_hrdb(post_arr){
        // 停止並銷毀 DataTable
            release_dataTable();
            $('#hrdb_table tbody').empty();
            shLocalDept_inf = post_arr;
            console.log("post_arr =>", post_arr);
            // await goTest(post_arr);


        if(post_arr.length === 0){
            const table = $('#hrdb_table').DataTable();                     // 獲取表格的 thead
            const columnCount = table.columns().count();                    // 獲取每行的欄位數量
            const tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 沒有資料 ~ </td><tr>`;
            $('#hrdb_table tbody').append(tr1);

        }else{
                // 部門代號加工+去除[]符號/[{"}]/g, ''
                function doReplace(_arr){
                    return JSON.stringify(_arr).replace(/[\[{"}\]]/g, '').replace(/:/g, ' : ').replace(/,/g, '<br>'); 
                }

            await post_arr.forEach((post_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                const { getTargetBase, baseAll_arr, getOut_arr, getIn_arr } = reworkBase(post_i["base"]);
                const baseAll_str = doReplace(baseAll_arr);      
                const getOut_str  = doReplace(getOut_arr);
                const getIn_str   = doReplace(getIn_arr);
                    // console.log('baseAll_arr...',baseAll_arr);
                const { getTargetInCare, inCare_arr } = reworkInCare(post_i["inCare"]);
                const inCare_str = doReplace(inCare_arr);       // 部門代號加工+去除[]符號/[{"}]/g, ''
                    // console.log('inCare_arr...',inCare_arr)
                let tr1 = '<tr>';
                    tr1 += `<td class="t-center" id="OSTEXT_30"     >${post_i["OSTEXT_30"] ?? ''}</td>
                            <td class="t-center" id="OSHORT/OSTEXT" >${post_i["OSHORT"]}<br>${post_i["OSTEXT"] ?? ''}</td>

                            <td class="word_bk import" id="base,${post_i.OSHORT}"  ><b>${getTargetBase}：${baseAll_arr.length}人</b><br>...(以下略)...<div id="base_Badge"></div></td>
                            
                            <td class="word_bk import" id="getOut/getIn" >
                                <b>${getTargetBase}：${getOut_arr.length}人轉出</b><br>${getOut_str}
                                <hr>
                                <b>${getTargetBase}：${getIn_arr.length}人轉入</b><br>${getIn_str}
                                <div id="base_Badge"></div>
                            </td>

                            <td class="word_bk import" id="inCare,${post_i.OSHORT}"><b>${getTargetInCare}：${inCare_arr.length}人</b><br>${inCare_str}<div id="inCare_Badge"></div></td>

                            <td class="text-center">
                                <div class="row">
                                    <div class="col-md-4 px-1">
                                        <button type="button" class="btn btn-outline-success btn-sm btn-xs add_btn " id="remark,${post_i.OSHORT}" value="remark,${post_i.OSHORT}" data-toggle="tooltip" data-placement="bottom" title="總窗 備註/有話說"
                                            onclick="memoModal(this.value)" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight"><i class="fa-regular fa-rectangle-list"></i></button>
                                    </div>
                                    <div class="col-md-8 px-1">
                                        <div class="form-check form-switch inb">
                                            <input class="form-check-input" type="checkbox" id="flag,${post_i.OSHORT}" ${ post_i['flag'] ? "checked" : ""} >
                                            <label class="form-check-label" for="flag,${post_i.OSHORT}">啟用</label>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            
                            <td class="t-start px-3" id="created_at/updated_at/updated_cname"         >
                                ${post_i["created_at"] ?? ''}<br>${post_i["updated_at"] ?? ''}<br>${post_i["updated_cname"] ?? ''}
                            </td>
                            ;`

                    tr1 += '</tr>';

                $('#hrdb_table tbody').append(tr1);

                // mk_Badge(post_i["base"]  , 'base'  , true);
                // mk_Badge(post_i["inCare"], 'inCare', false);
            })
        }

        await reload_dataTable();                   // 倒參數(陣列)，直接由dataTable渲染
        await reload_baseInCareTD_Listeners();      // 呼叫監聽[base]、[inCare]這兩格td
        await reload_deptFlagOnchange_Listeners();  // 呼叫監聽[flag]這個inpute改變的狀態，並直接更新到dept的資料

        await btn_disabled();                       // 讓指定按鈕 依照shLocalDept_inf.length 啟停 

        $("body").mLoading("hide");
    }


        // 250220 從getBase(整批外層不分年月)中取得並整理出可以顯示的值 callFrom post_hrdb
        function reworkBase(getBase) {
            const { currentYearMonth, lastYearMonth } = getCurrentAndLastMonth(); // 執行函式--取得年月
            const targetMonth = getBase[currentYearMonth] ? currentYearMonth : (getBase[lastYearMonth] ? lastYearMonth : null); // 取得base的年月key
            const base_arr    = getBase[targetMonth] ?? null ;  // 取得 本月名單 或 上月名單

            let getTargetBase;
            if(getBase[currentYearMonth] != undefined) {
                getTargetBase = `本月 ${targetMonth}`;
                baseAll_arr = uniqueArr(base_arr['keepGoing'], base_arr['getIn'])
            }else{
                getTargetBase = `上月 ${targetMonth}`;
                baseAll_arr = uniqueArr(base_arr['keepGoing'], base_arr['getOut'])
            }
            const getIn_arr   = base_arr['getIn'];
            const getOut_arr  = base_arr['getOut'];

            return { getTargetBase, baseAll_arr, getOut_arr, getIn_arr };  // getTargetBase = 確認抓取的月份, baseAll_arr = 所有在職員工
        }
        // 250220 從getInCare(整批外層不分年月)中取得並整理出可以顯示的值 callFrom post_hrdb
        function reworkInCare(getInCare) {
            const { currentYearMonth, lastYearMonth } = getCurrentAndLastMonth(); // 執行函式--取得年月
            const targetMonth = getInCare[currentYearMonth] ? currentYearMonth : (getInCare[lastYearMonth] ? lastYearMonth : null); // 取得base的年月key
            const inCare_arr  = getInCare[targetMonth] ?? null ;  // 取得 本月名單 或 上月名單

            let getTargetInCare;
            if(getInCare[currentYearMonth] != undefined) {
                getTargetInCare = `本月 ${targetMonth}`;
            }else{
                getTargetInCare = `上月 ${targetMonth}`;
            }

            return { getTargetInCare, inCare_arr };
        }
        // fun-1.函式：找出全部鍵，並計算差異 (arr1=本月名單, arr2=上月名單)
        function getDifferencesAndKeys(arr1, arr2) {
            // step-1.提取名單key
                const keys1 = new Set(arr1.map(obj => Object.keys(obj)[0]));    // 本月名單key
                const keys2 = new Set(arr2.map(obj => Object.keys(obj)[0]));    // 上月名單key
            // step-2.找出異動清單
                const differenceOutKeys = Array.from(keys2).filter(key => !keys1.has(key)); // 轉出keys
                const differenceInKeys  = Array.from(keys1).filter(key => !keys2.has(key)); // 轉入keys
                // step-2a.找出轉出或轉入的完整名單 (base_arr=要找的陣列, differenceKeys=要找出來的keys)
                const differenceOut = arr2.filter(item => differenceOutKeys.includes(Object.keys(item)[0])); // 輸出結果 會得到符合條件的物件陣列
                const differenceIn  = arr1.filter(item => differenceInKeys.includes(Object.keys(item)[0]));  
            // step-3.找出上月+本月沒有異動的名單
                // step-3a.去重的函式，保留唯一值
                const arr3unique = uniqueArr(arr1, arr2)
                // step-3b.找出不在 keys1本月 和 keys2上月 的名單
                const differenceKeepGoing = arr3unique.filter(item => {
                                                const key = Object.keys(item)[0]; // 取得物件中的鍵
                                                // return !keys1.has(key) && !differenceOutKeys.includes(key);
                                                return !differenceInKeys.includes(key) && !differenceOutKeys.includes(key);
                                            });
 
                    console.log('轉出 differenceOut =>', differenceOut);
                    console.log('轉入 differenceIn =>', differenceIn, );
                    console.log('未動 differenceKeepGoing =>', differenceKeepGoing);
            // step-4.返回resilt變數
            return { differenceOut, differenceIn, differenceKeepGoing };
        }



    // 241121 在p2table上建立baseInCare監聽功能 for 開啟MaintainDept編輯deptStaff名單...未完
    let baseInCareClickListener;
    async function reload_baseInCareTD_Listeners() {
        return new Promise((resolve) => {
            const baseInCare = document.querySelectorAll('#hrdb_table td[id*="base,"] ,#hrdb_table td[id*="inCare,"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (baseInCareClickListener) {
                baseInCare.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                    tdItem.removeEventListener('click', baseInCareClickListener);   // 將每一個tdItem移除監聽, 當按下click
                })
            }
                // 整理陣列成我要的格式2....
                function reworkArr(dataIn){
                    return new Promise((resolve) => {
                        let rework_arr = [];
                        dataIn.forEach((emp_i) => {
                            const this_arr = emp_i.split(',')       // 分割this.id成陣列
                            const this_emp_id = this_arr[0];        // 取出陣列 0 = emp_id
                            const this_cname  = this_arr[1];        // 取出陣列 1 = cname
                                // rework_arr.push({                // 傳統陣列...
                                //         'cname'     : this_cname,
                                //         'emp_id'    : this_emp_id
                                //     })
                            let obj = {};                           // 陣列包物件
                            obj[this_emp_id] = this_cname;
                            rework_arr.push(obj);
                        })
                        const rework_str = JSON.stringify(rework_arr).replace(/[\[\]]/g, '');       // 部門代號加工+去除[]符號

                        resolve(rework_str);
                    });
                }
                // 反解:把混和陣列包物件，轉換成一般陣列..
                function decode_Obj(_obj){
                    let newArr = [];
                    _obj.forEach((obj_i) => {
                        for(const [emp_id , cname] of Object.entries(obj_i)){
                            newArr.push({
                                'emp_id' : emp_id,
                                'cname'  : cname
                            })
                        }
                    })
                    // console.log('newArr', newArr);
                    return newArr;
                }
                // 單獨取出特檢員工的empId
                function getEmpId_Arr(_obj){
                    let newArr = [];
                    _obj.forEach((obj_i) => {
                        for(const [emp_id , cname] of Object.entries(obj_i)){
                            newArr.push(emp_id)
                        }
                    })
                    // console.log('newArr', newArr);
                    return newArr;
                }
                // 
                function toCheckedOpt(_arr , result_title){
                    if(_arr){
                        const target_staff_cbs = document.querySelectorAll(`#maintainDept #result_tbody input[name="deptStaff[]"]`);
                        target_staff_cbs.forEach(input => {
                            if (_arr.includes(input.id)) {
                                input.checked = true;
                            }
                        });
                    }

                    if(result_title){
                        const resultInfo = document.querySelector('#maintainDept #result_info');       // 定義表頭info id
                        resultInfo.innerHTML = result_title;
                    }
                }


            // 定義新的監聽器函數
            baseInCareClickListener = async function () {
                // console.log("click this =>", this.id);
                // step.1 標題列顯示姓名工號
                const thisId_arr = this.id.split(',')                 // 分割this.id成陣列
                const thisTD     = thisId_arr[0];                     // 取出陣列0=target
                const thisDeptNO = thisId_arr[1];                     // 取出陣列1=部門代號
                // 在maintainDept input上帶入部門代號
                let fromInput = document.querySelector('#maintainDept #searchkeyWord');     // 定義搜尋input欄
                fromInput.value = thisDeptNO;                                           // 賦予內容值
                // 撈出該部門資料
                const deptData = shLocalDept_inf.find(dept => dept.OSHORT === thisDeptNO);

                if(deptData){
                    const { getTargetBase, baseAll_arr }  = reworkBase(deptData.base);      // 取得部門全部員工
                    const { getTargetInCare, inCare_arr } = reworkInCare(deptData.inCare);  // 取得特檢員工
                    const dec_baseAll_arr = decode_Obj(baseAll_arr);        // 將部門全部員工obj轉換成正常的arr
                    await postResultTo_maintainDeptTable(dec_baseAll_arr);  // 將正常arr的部門全部員工清單交給postResultTo_maintainDeptTable進行鋪設

                    const get_inCare_arr = getEmpId_Arr(inCare_arr);        // 單獨取出特檢員工的empId
                    toCheckedOpt(get_inCare_arr , getTargetInCare);                           // 將table裡的特檢員工選上[打勾]

                }else{
                    console.log('無deptData...套用新[]')
                }
                


                maintainDept_modal.show()
                // const edit_fun    = 'yearHe';                      // 指定功能
                // $('#edit_modal #edit_modal_empId').empty().append(`${edit_fun}, ${edit_cname}, ${edit_empId}`); // 清空+填上工號
                
                // // step.2.0 取得 post_yearHe / 順便渲染到modal
                // await load_fun('load_heCate','load_heCate', post_heCate);
                
                // // step.2.1 取得個人今年的_yearHe，並轉成陣列
                // const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
                // const { shCase, shCondition, _content } = empData;
                // const _yearHe = _content[`${currentYear}`]['import']['yearHe'] !== undefined ? _content[`${currentYear}`]['import']['yearHe'] : '';
                // const _yearHe_arr = _yearHe.includes(',') ? _yearHe.split(',') : [];
                // // step.2.2 讓存在既有名單的清單打勾
                // const heCate_arr = Array.from(document.querySelectorAll('#edit_modal .modal-body input[name="heCate[]"]'));
                // heCate_arr.forEach(heCate_checkbox => {
                //     heCate_checkbox.checked = _yearHe_arr.includes(heCate_checkbox.value)
                // })
                // // step.3 顯示互動視窗
                // edit_modal.show();                               // 顯示互動視窗
                // $("body").mLoading("hide");
            }

            // 添加新的監聽器
            baseInCare.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                tdItem.addEventListener('click', baseInCareClickListener);      // 將每一個tdItem增加監聽, 當按下click
            })

            resolve();
        });
    }
    // 241121 在p2table上建立flag監聽功能 for dept.flag = true/false...
    let deptFlagOnchangeListener;
    async function reload_deptFlagOnchange_Listeners() {
        return new Promise((resolve) => {
            const deptFlags = document.querySelectorAll('#hrdb_table input[id*="flag,"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
                if (deptFlagOnchangeListener) {
                    deptFlags.forEach(flag_i => {                                      // 遍歷範圍內容給flag_i
                        flag_i.removeEventListener('change', deptFlagOnchangeListener);   // 將每一個flag_i移除監聽, 當按下click
                    })
                }
            // 定義新的監聽器函數
                deptFlagOnchangeListener = async function () {
                    // step.1 標題列顯示姓名工號
                    const thisId_arr = this.id.split(',')                 // 分割this.id成陣列
                    // const thisFu     = thisId_arr[0];                     // 取出陣列0=Fu
                    const thisDeptNO = thisId_arr[1];                     // 取出陣列1=部門代號
                    const thisFlag = document.getElementById(this.id);
                    const deptData = shLocalDept_inf.find(dept => dept.OSHORT === thisDeptNO);
                        deptData.flag = thisFlag.checked;                                   // 賦予內容值
                }
            // 添加新的監聽器
                deptFlags.forEach(flag_i => {                                      // 遍歷範圍內容給flag_i
                    flag_i.addEventListener('change', deptFlagOnchangeListener);      // 將每一個flag_i增加監聽, 當按下click
                })

            resolve();
        });
    }




        // 驅動搜尋部門代號下的員工； fun = 功能, fromId = 查詢來源ID；from maintainDept_modal裡[搜尋]鈕的呼叫...
        async function load_deptStaff(fun, fromId){
            const from = document.getElementById(fromId);       // 定義來源id
            const searchkeyWord = (from.value).trim();          // search keyword取自from欄位
            console.log('searchkeyWord =>', searchkeyWord);
            await load_fun(fun, searchkeyWord, console_log);
            await load_fun(fun, searchkeyWord, postResultTo_maintainDeptTable);
        }

        // 將 部門代號下的員工 搜尋結果渲染到maintainDept_modal裡的table；from maintainDept function load_deptStaff()
        async function postResultTo_maintainDeptTable(res_r){
            return new Promise((resolve) => {
                // console.log('res_r...', res_r);
                // release_dataTable('maintainDept_table');

                // 鋪設表格thead
                let Rinner = `<thead>
                                <tr>
                                    <th>廠區</th>
                                    <th>工號</th>
                                    <th>姓名</th>
                                    <th>職稱</th>
                                    <th>部門代號</th>
                                    <th>部門名稱</th>
                                    <th class"import" id="select_deptStaff"><i class="fa-regular fa-square-check"></i>&nbsp;select</th>
                                </tr>
                            </thead>
                            <tbody id='result_tbody'></tbody>`;
                // 定義表格table
                let div_result_table = document.getElementById('maintainDept_table');
                    div_result_table.innerHTML = Rinner;
                // 定義表格中段tbody
                let div_result_tbody = document.getElementById('result_tbody');
                    div_result_tbody.innerHTML = '';

                res_r.forEach((empt) => {
                    div_result_tbody.innerHTML += 
                        `<tr>
                            <td class="text-center">${empt.emp_sub_scope ?? ''}</td>
                            <td class="text-center">${empt.emp_id}</td>
                            <td class="text-center">${empt.cname}</td>
                            <td class="text-center">${empt.cstext ?? ''}</td>
                            <td class="text-center">${empt.dept_no ?? ''}</td>
                            <td class="text-center">${empt.emp_dept ?? ''}</td>
                            <td class="text-center">
                                <input type="checkbox" class="form-check-input" name="deptStaff[]" id="${empt.emp_id}" value="${empt.emp_id},${empt.cname}" >
                            </td>
                        </tr>`;
                })
                
                // 防止空值被帶入shLocalDept_inf
                    const selectDeptStaff_btn = document.querySelector('#maintainDept #select_deptStaff');     //  定義出[全選]範圍
                    const submitDeptStaff_btn = document.querySelector('#maintainDept #submitDeptStaff');      //  定義出[代入]範圍
                    if(res_r.length > 0) {
                        // 有2個監聽
                        reload_selectDeptStaff_Listeners();   // 呼叫監聽[select]全選功能...
                        reload_submitDeptStaff_Listeners();   // 呼叫監聽[代入]鈕功能

                    } else {
                        // 檢查並移除已經存在的監聽器
                        if (selectDeptStaffClickListener) {
                            selectDeptStaff_btn.removeEventListener('click', selectDeptStaffClickListener);   // 將每一個tdItem移除監聽, 當按下click
                        }
                        // 檢查並移除已經存在的監聽器
                        if (submitDeptStaffClickListener) {
                            submitDeptStaff_btn.removeEventListener('click', submitDeptStaffClickListener);   // 將每一個tdItem移除監聽, 當按下click
                        }   
                    }
                    submitDeptStaff_btn.disabled = (res_r.length == 0);
                    submitDeptStaff_btn.classList.toggle('unblock', res_r.length == 0);
                    
                // reload_dataTable('maintainDept_table');

                $("body").mLoading("hide");                                 // 關閉mLoading
                // 當所有設置完成後，resolve Promise
                resolve();
            });
        }
        // 清除MaintainDept；from maintainDept_modal裡[清除]鈕的呼叫
        function resetMaintainDept(){
            // let fromInput = document.querySelector('#maintainDept #searchkeyWord');       // 定義輸入來源id
                // fromInput.value = '';
            let resultInfo = document.querySelector('#maintainDept #result_info');       // 定義表頭info id
                resultInfo.innerHTML = '';
            let div_result_table = document.querySelector('#maintainDept #maintainDept_table');
                div_result_table.innerHTML = '';

            const submitDeptStaff_btn = document.querySelector('#maintainDept #submitDeptStaff');      //  定義出[代入]範圍
                submitDeptStaff_btn.disabled = true;
                submitDeptStaff_btn.classList.toggle('unblock', true);
        }
        // (MaintainDept非主要功能)綁定select_deptStaff_btns事件監聽器 => head上的select全選btn
        let selectDeptStaffClickListener;
        async function reload_selectDeptStaff_Listeners() {
                const selectDeptStaff_btn = document.querySelector('#maintainDept #select_deptStaff');      //  定義出範圍
                // 檢查並移除已經存在的監聽器
                if (selectDeptStaffClickListener) {
                    selectDeptStaff_btn.removeEventListener('click', selectDeptStaffClickListener);   // 將每一個tdItem移除監聽, 當按下click
                }
                // 定義新的監聽器函數
                selectDeptStaffClickListener = async function () {
                    const target_staff_cbs = document.querySelectorAll(`#maintainDept #result_tbody input[name="deptStaff[]"]`);
                    // 檢查第一個 checkbox 是否被選中，然後根據它的狀態全選或全部取消
                    let allChecked = Array.from(target_staff_cbs).every(checkbox => checkbox.checked);
                    target_staff_cbs.forEach(checkbox => {
                        checkbox.checked = !allChecked; // 如果 allChecked 為 true，則取消選擇，否則全選
                        // 手動觸發 change 事件
                        // checkbox.dispatchEvent(new Event('change'));
                    });
                }
    
                // 添加新的監聽器
                selectDeptStaff_btn.addEventListener('click', selectDeptStaffClickListener);      // 將每一個tdItem增加監聽, 當按下click
        }
    
        // 定義[代入]鈕功能~~；from maintainDept_modal裡[代入]鈕的呼叫...
        let submitDeptStaffClickListener;
        async function reload_submitDeptStaff_Listeners() {
            const submitDeptStaff_btn = document.querySelector('#maintainDept #submitDeptStaff');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (submitDeptStaffClickListener) {
                submitDeptStaff_btn.removeEventListener('click', submitDeptStaffClickListener);   // 將每一個tdItem移除監聽, 當按下click
            }   
                // 整理陣列成我要的格式1....顯示用
                function reworkArr(dataIn){
                    return new Promise((resolve) => {
                        let rework_arr = [];
                        dataIn.forEach((emp_i) => {
                            const this_arr = emp_i.split(',')       // 分割this.id成陣列
                            const this_emp_id = this_arr[0];        // 取出陣列 0 = emp_id
                            const this_cname  = this_arr[1];        // 取出陣列 1 = cname
                                // rework_arr.push({                // 傳統陣列...
                                //         'cname'     : this_cname,
                                //         'emp_id'    : this_emp_id
                                //     })
                            let obj = {};                           // 陣列包物件
                            obj[this_emp_id] = this_cname;
                            rework_arr.push(obj);
                        })
                        // const rework_str = JSON.stringify(rework_arr).replace(/[\[\]]/g, '');       // 部門代號加工+去除[]符號
                        // console.log(rework_arr);
                        // resolve(rework_str);
                        resolve(rework_arr);
                    });
                }
            // 定義新的監聽器函數
            submitDeptStaffClickListener = async function () {
                mloading(); 

                const deptStaff_opts_arr = Array.from(document.querySelectorAll(`#maintainDept #result_tbody input[name="deptStaff[]"]`));
                const table_baseAll_arr = deptStaff_opts_arr.map(cb => cb.value);                          // 取得所有員工名單(all...from table上所有名單)
                const table_inCare_arr  = deptStaff_opts_arr.filter(cb => cb.checked).map(cb => cb.value); // 取得已選員工名單(特檢多選)
                // 把取得的數據送去reworkArr整理...
                const reworkTableBaseAll_arr = await reworkArr(table_baseAll_arr);     // 將table上bassAll整理成我要的格式
                const reworkTableInCare_arr  = await reworkArr(table_inCare_arr);      // 將table上inCare整理成我要的格式
                    console.log('reworkTableBaseAll_arr...',reworkTableBaseAll_arr);

                const { currentYearMonth } = getCurrentAndLastMonth();      // 執行函式--取得年月

                const fromInput = document.querySelector('#maintainDept #searchkeyWord');       // 定義來源id
                const targetDeptNo = fromInput.value;                                           // 取得formInput = 部門代號
                let deptData = shLocalDept_inf.find(dept => dept.OSHORT === targetDeptNo);      // 自shLocalDept_inf找出對應的部門
                    console.log('shLocalDept_inf 1',shLocalDept_inf);

                if(deptData){
                    deptData.base = deptData.base ?? [];
                    const { getTargetBase, baseAll_arr }  = reworkBase(deptData.base);      // 取得dept部門在紀錄裡的全部員工
                    const { differenceOut, differenceIn, differenceKeepGoing } = getDifferencesAndKeys(reworkTableBaseAll_arr, baseAll_arr); // (arr1=本月名單, arr2=上月名單)

                    deptData.base[currentYearMonth] = {
                            'getOut'    : differenceOut       ?? [],
                            'getIn'     : differenceIn        ?? [],
                            'keepGoing' : differenceKeepGoing ?? (reworkTableBaseAll_arr ?? [])
                        }
                    
                    deptData.inCare = deptData.inCare  ?? {};
                    deptData.inCare[currentYearMonth] = reworkTableInCare_arr;

                } else {
                    let newDeptData = {};
                        newDeptData["OSHORT"] = targetDeptNo;
                        newDeptData["base"]   = {};
                        newDeptData["base"][currentYearMonth] = {
                                'getOut'    : [],
                                'getIn'     : [],
                                'keepGoing' : reworkTableBaseAll_arr ?? []
                            }
                        newDeptData["inCare"] = {};
                        newDeptData["inCare"][currentYearMonth] = reworkTableInCare_arr ?? [];
                        newDeptData["remark"] = {
                                'memo' : []
                            };
                        newDeptData["flag"] = true;
                        // newDeptData["created_at"] = getTimeStamp();

                        shLocalDept_inf.push(newDeptData);
                }

                console.log('shLocalDept_inf 2',shLocalDept_inf);

                post_hrdb(shLocalDept_inf); // 鋪設


                // const target_staff_cbs = document.querySelectorAll(`#maintainDept #result_tbody input[name="deptStaff[]"]`);
                // // 檢查第一個 checkbox 是否被選中，然後根據它的狀態全選或全部取消
                // let allChecked = Array.from(target_staff_cbs).every(checkbox => checkbox.checked);
                // target_staff_cbs.forEach(checkbox => {
                //     checkbox.checked = !allChecked; // 如果 allChecked 為 true，則取消選擇，否則全選
                //     // 手動觸發 change 事件
                //     // checkbox.dispatchEvent(new Event('change'));
                // });

                resetMaintainDept();        // 清除
                maintainDept_modal.hide();  // 關閉modal
                $("body").mLoading("hide");

            }

            // 添加新的監聽器
            submitDeptStaff_btn.addEventListener('click', submitDeptStaffClickListener);      // 將每一個tdItem增加監聽, 當按下click
        }

                    


// // phase 1 -- 生成按鈕
    // [p1 函數-2] 動態生成所有按鈕，並重新綁定事件監聽器
    function mk_deptNos_btn(docDeptNo) {
        return new Promise((resolve) => {
            _docs_inf = docDeptNo;      // 套取docs
            console.log('docDeptNo =>',docDeptNo);
            // init
            $('#deptNo_opts_inside').empty();
            // step-1. 鋪設按鈕
            if(docDeptNo.length > 0){     // 判斷使否有長度值
                for (const _item of docDeptNo) {
                    Object.entries(_item).forEach(([emp_sub_scope, oh_value]) => {
                        // console.log(emp_sub_scope,oh_value)
                        let ostext_btns = `
                            <div class="col-lm-3 p-1">
                                <div class="card">
                                    <div class="card-header"><button type="button" name="scope[]" value="${emp_sub_scope}" class="add_btn">${emp_sub_scope}</button></div>
                                    <div class="card-body p-2">
                                        ${Object.entries(oh_value).map(([o_key, o_value]) =>
                                            `<div class="form-check px-4">
                                                <input type="checkbox" name="subScope[]" id="cb,${emp_sub_scope},${o_key}" value="${o_key}" class="form-check-input" >
                                                <button type="button" name="deptNo[]" id="${emp_sub_scope},${o_key}" value="${o_key}" class="btn btn-info add_btn my-1" style="width: 100%;text-align: start;" `
                                                + ` >${o_key}&nbsp;${o_value.OSTEXT}</button>
                                            </div>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>`;
                        $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
                    });
                };
            }else{
                let ostext_btns = `
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-header">!! 空值注意 !!</div>
                            <div class="card-body">
                                ~ 目前沒有待簽核資料 ~
                            </div>
                        </div>
                    </div>`;
                $('#deptNo_opts_inside').append(ostext_btns); // 將生成的按鈕貼在<deptNo_opts_inside>元素中
            }

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }

            // [p1 函數-2] 241213 將送審的百分比改成送審中
            async function filtApprove(_docs) {
                const reviewStep = await load_fun('reviewStep', 'return');     // 呼叫通用函數load_fun+ p1 函數-2 生成btn
                const _step = reviewStep.step;
        
                for (const _doc of _docs) {
                            // console.log('_doc =>',_doc);
                    for (const [emp_sub_scope, dept_no_value] of Object.entries(_doc)) {
                        for (const [dept_no, value] of Object.entries(dept_no_value)) {
                                    // console.log(dept_no,' => value:',value);
                            const deptNo_sups = document.querySelectorAll(`#deptNo_opts_inside button[id="${emp_sub_scope},${dept_no}"] sup[name="sup_${dept_no}[]"]`);
                            const innerHTMLValue = (value.idty == 2) ? "退回編輯" : _step[value.idty].approvalStep;
                            // 更新所有符合條件的節點的 innerHTML
                            deptNo_sups.forEach(node => { node.innerHTML = `(${value.idty}-${innerHTMLValue})`; });
        
                            // 決定開啟的權限
                            const doc_Role_bool = !( 
                                    (userInfo.role <= 1) ||                  // 大PM.1 => 全開
                                    // (dept_no == userInfo.signCode) ||     // 同部門 ??    
                                    // (value.BTRTL == userInfo.BTRTL) ||    // 同建物 = 廠護理師.2 /廠工安.2.5
                                    ((userInfo.role == 2 || userInfo.role == 2.2 || userInfo.role == 2.5) && (userInfo.BTRTL.includes(value.BTRTL))) ||  // (廠護理師.2 || 廠工安.2.5) & 同建物
                                    (value.in_sign == userInfo.empId) ||     // 待簽人員 = 上層主管 /轉呈
                                    (value.omager  == userInfo.empId)        // 部門主管 = 自己
                                );
                
                            const deptNo_btns = document.querySelectorAll(`#deptNo_opts_inside button[id="${emp_sub_scope},${dept_no}"]`);
                            deptNo_btns.forEach(deptNo_btn => {
                                // 如果 idty 大於 4，則更新按鈕樣式
                                if (value.idty == 5) {
                                    deptNo_btn.classList.remove('btn-info');
                                    deptNo_btn.classList.remove('add_btn');
                                    deptNo_btn.classList.add('btn-success');
        
                                } else if (value.idty == 6) {
                                    deptNo_btn.classList.remove('btn-info');
                                    deptNo_btn.classList.add('btn-primary');
                                    
                                } else if (value.idty == 10) {
                                    deptNo_btn.classList.remove('btn-info');
                                    deptNo_btn.classList.add('btn-outline-secondary');
                                }
                                // 點擊編輯權限
                                deptNo_btn.disabled = doc_Role_bool;
                            });
        
                            const subScopes_opts_arr = Array.from(document.querySelectorAll(`#deptNo_opts_inside input[id*="cb,${emp_sub_scope},${dept_no}"]`));
                            // 點擊閱讀權限
                            subScopes_opts_arr.forEach(subScope_opt => subScope_opt.disabled = doc_Role_bool );
                            // deptNo_btns.forEach(deptNo_btn => {
                            // })
                        }
                    }
                }
                // 名單總匯整_btn
                const load_subScopes_btn = document.getElementById('load_subScopes_btn');
                if(userInfo.role <= 2.2) load_subScopes_btn.classList.remove('unblock');
            }

    // [p1 函數-1] 取得危害地圖...並callBack mk_deptNos_btn進行鋪設
    async function p1_init() {
        await load_fun('load_shLocal_OSHORTs', 'load_shLocal_OSHORTs', mk_deptNos_btn);
    }
    // [p1 函數-3] 設置p1事件監聽器和
    async function p1_eventListener() {
        return new Promise((resolve) => {
            // step-p1-1. 綁定deptNo_opts事件監聽器(單選)
                const deptNo_btns = document.querySelectorAll('#deptNo_opts_inside button[name="deptNo[]"]');
                deptNo_btns.forEach(deptNo_btn => {
                    deptNo_btn.addEventListener('click', async function() {
                        const thisValue   = '"'+this.value+'"';       // 取得部門代號並加工(單選)
                        console.log('單選 thisValue =>', thisValue)

                        // 工作一 清空暫存
                            await resetINF(true); // 清空

                        // 工作二 從 thisValue(加工後的部門代號)中取出對應的廠區/部門代號資料
                            await load_fun('load_shLocalDepts', thisValue, post_hrdb);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff

                            let fromInput = document.querySelector('#maintainDept #searchkeyWord');     // 定義maintainDept搜尋input欄
                                fromInput.value = this.value;                                           // 賦予內容值

                        //     await mk_form_btn(reviewRole);        // 建立簽核按鈕
                        //     await post_reviewInfo(_doc_inf);      // 鋪設表頭訊息及待簽人員
                        //     await post_logs(_doc_inf.logs);       // 鋪設文件歷程
                        //     await reload_dataTable();             // 呼叫dataTable                        

                        $('#nav-p2-tab').tab('show');
                    });
                });

            // step-p1-2. 綁定load_subScopes_btn[提取勾選部門]進行撈取員工資料(多選)
                const load_subScopes_btn = document.getElementById('load_subScopes_btn');
                load_subScopes_btn.addEventListener('click', async function() {
                    const selectedValues = subScopes_opts_arr.filter(cb => cb.checked).map(cb => cb.value); // 取得所選的部門代號(多選)
                    const selectedValues_str = JSON.stringify(selectedValues).replace(/[\[\]]/g, '');       // 部門代號加工(多選)
                    console.log('多選 selectedValues_str =>', selectedValues_str)
                    
                    // 工作一 清空暫存
                        await resetINF(true);               // 清空
                    // 工作二 從 thisValue(加工後的部門代號)中取出對應的廠區/部門代號資料
                        await load_fun('load_shLocalDepts', selectedValues_str, post_hrdb);   // 呼叫fun load_fun 進行撈取員工資料   // 呼叫[fun] rework_loadStaff

                    // await reload_dataTable();

                    // $('logsInfo').empty();
                    // console.log('staff_inf...', staff_inf);

                    $('#nav-p2-tab').tab('show');
                })

            // step-p1-3. (非主要功能)綁定scope_btns事件監聽器 => card head上的全選btn
                const scope_btns = document.querySelectorAll('#deptNo_opts_inside button[name="scope[]"]');
                scope_btns.forEach(scope_btn => {
                    scope_btn.addEventListener('click', async function() {
                        const target_scope_cbs = document.querySelectorAll(`#deptNo_opts_inside input[id*="cb,${this.value},"]`);
                        // 檢查第一個 checkbox 是否被選中，然後根據它的狀態全選或全部取消
                        let allChecked = Array.from(target_scope_cbs).every(checkbox => checkbox.checked);
                        target_scope_cbs.forEach(checkbox => {
                            checkbox.checked = !allChecked; // 如果 allChecked 為 true，則取消選擇，否則全選
                            // 手動觸發 change 事件
                            checkbox.dispatchEvent(new Event('change'));
                        });
                    });
                });

            // step-p1-4. (非主要功能)驗證提醒監聽 => for [提取勾選部門]驗證提醒
                const subScopes_opts_arr = Array.from(document.querySelectorAll('#deptNo_opts_inside input[id*="cb,"]'));
                subScopes_opts_arr.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        const selectedOptsValues = subScopes_opts_arr.filter(cb => cb.checked).map(cb => cb.value);
                        // 更新驗證標籤
                        load_subScopes_btn.classList.toggle('is-invalid', selectedOptsValues.length === 0);
                        load_subScopes_btn.classList.toggle('is-valid',   selectedOptsValues.length > 0);
                        load_subScopes_btn.disabled = selectedOptsValues.length === 0;
                    });
                });

            resolve();      // 當所有設置完成後，resolve Promise
        });
    }

                    // 未採用 -- 製造泡泡標籤 formArr = 功號陣列, toBadge = 鋪在哪裡?, method = true(add)/false(remove)
                    async function mk_Badge(formArr, toBadge, method){
                        return new Promise((resolve) => {
    
                            formArr.forEach((emp_id) => {
                                let bobb = method ? `<span class="add" value="${emp_id}">+</span>` : `<span class="remove" value="${emp_id}">x</span>`;
                                $('#'+toBadge+'_Badge').append(`<div class="tag">${emp_id}${bobb}</div>`);
                            })
                            if(method){
                                $('#'+toBadge+'_Badge').on('click', '.add', function() {
                                    console.log('this', this)
                                    $('#inCare_Badge').append(`<div class="tag">${this.value}<span class="remove" value="${this.value}">x</span></div>`);
                                })
                            }
                            $('#'+toBadge+'_Badge').on('click', '.remove', function() {
                                console.log('this', this)
                                $(this).closest('.tag').remove();                         // 自畫面中移除
                            })
    
                            resolve();      // 當所有設置完成後，resolve Promise
                        });
                    }
                        
                    function goTest(post_arr){
                        return new Promise((resolve) => {
                            if(post_arr.length > 0){


                                    // base = {"202502":{"getOut":[{"14088431":"林晏寧"},{"15046021":"謝佳宏"}],"getIn":[{"10018491":"曹源宏"},{"10008824":"陳正峰"}],"keepGoing":[{"19024496":"李永紝"},{"10126959":"鍾宜夏"},{"10089077":"李品萱"},{"10019391":"馬吉謙"},{"10019067":"李偉勝"},{"10013280":"陳裔仁"},{"10009068":"郭淑玲"},{"10007035":"涂明安"},{"10003202":"葉信男"},{"10002568":"葉炯廷"}]}}
                            
                                const deptData = post_arr.find(dept => dept.OSHORT == '9T041502');
                                console.log('deptData =>', deptData)

                                // 執行函式--取得年月
                                const { currentYearMonth, lastYearMonth } = getCurrentAndLastMonth();

                                const { base , inCare } = deptData;
                                // console.log('base =>', base)
                                const Current_base_arr = base[currentYearMonth];  // 本月名單
                                const Last_base_arr    = base[lastYearMonth];     // 上月名單
                                console.log('Current_base_arr =>', Current_base_arr)
                                console.log('Last_base_arr =>',    Last_base_arr)


                                
                                // // // fun-1.獲取差異和鍵 帶入(本月名單, 上月名單) = 得到 轉出, 轉入, 未異動
                                //     const { differenceOut, differenceIn, differenceKeepGoing } = getDifferencesAndKeys(Current_base_arr, Last_base_arr);

                                //     // console.log('key2', differenceOut, differenceIn, differenceKeepGoing);
                                //     console.log('轉出：', differenceOut); 
                                //     console.log('轉入：', differenceIn); 
                                //     console.log('未異動：', differenceKeepGoing)
                            }

                            resolve();      // 當所有設置完成後，resolve Promise
                        });
                    }


// [default fun]
    $(async function() {
        await p1_init();
        await p1_eventListener();                     // 呼叫函數-3 建立監聽

        // let message  = '*** 判斷依據1或2，二擇一符合條件：(1). 平均音壓 ≧ 85、 (2). 0.5(劑量, D)≧暴露時間(t)(P欄位)/法令規定時間(T)，法令規定時間(T)=8/2^((均能音量-90)/5)．&nbsp;~&nbsp;';
        // let message  = `<b>STEP 1.名單建立(匯入Excel、建立名單)：</b>總窗護理師  <b>2.工作維護(勾選特危、填暴露時數)：</b>課副理,護理師,ESH工安  <b>3.名單送審(100%的名單按下送審)：</b>課副理,護理師</br><b>4.簽核審查(簽核主管可微調暴露時數)：</b>上層主管,課副理,護理師  <b>5.收單review(檢查名單及特檢資料是否完備)：</b>ESH工安,護理師  <b>6.名單總匯整(輸出健檢名單)：</b>總窗護理師`;
        let message  = `userInfo.signCode：${userInfo.signCode}、.role：${userInfo.role}、.BTRTL：${userInfo.BTRTL}`;
        if(message) {
            // Balert( message, 'warning')
            document.getElementById(`debug`).insertAdjacentHTML('beforeend', message);     // 渲染各項目
        }

        // p1. [通用]在任何地方啟用工具提示框
        $('[data-toggle="tooltip"]').tooltip();
    
        $("body").mLoading("hide");

    });
