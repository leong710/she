    // 備註說明模組 START
        // 開啟memoModal的預設工作
        async function memoModal(this_id){
            // step.1 標題列顯示姓名工號
            $('#memoTitle').empty().append(`(${this_id})`);         // 清空+填上工號
            const this_id_arr = this_id.split(',');                 // 分割this.id成陣列
            const edit_empId  = this_id_arr[1];                     // 取出陣列1=emp_id
            postMemoMsg_btn.value = edit_empId;
            // step.2 取得個人今年的memo，並轉成陣列
            const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
            const { _content } = empData;
            const _memo = _content[`${currentYear}`]['memo'] !== undefined ? _content[`${currentYear}`]['memo'] : [];
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

                    // *** 這裡要補上把訊息塞進去個人資料內...
                    const edit_empId = postMemoMsg_btn.value;
                    // 取得個人今年的memo，並轉成陣列
                        const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
                        empData._content[`${currentYear}`]['memo'] = empData._content[`${currentYear}`]['memo'] ?? [];
                        empData._content[`${currentYear}`]['memo'].push(memoObj);
                        console.log('staff_inf =>', staff_inf);
                    // 生成完整memo
                    const memoCard_index = empData._content[`${currentYear}`]['memo'].length - 1;
                    const memoCard = await mk_memoMsg(memoCard_index, memoObj)
                    // step.2.2 鋪設個人今年的memo
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
                    const edit_empId = postMemoMsg_btn.value;
                        // 取得個人今年的memo，並轉成陣列後進行splice移除...
                        const empData = staff_inf.find(emp => emp.emp_id === edit_empId);
                        empData._content[`${currentYear}`]['memo'] = empData._content[`${currentYear}`]['memo'] ?? [];
                        if(empData._content[`${currentYear}`]['memo'].length > 0){
                            await empData._content[`${currentYear}`]['memo'].splice(this.value, 1);
                            console.log('staff_inf =>', staff_inf);  
                            
                            // *** 把畫面上的訊息移除...
                                // var element = document.getElementById(`memo_i_${this.value}`);
                                // if (element) {
                                //     element.parentNode.removeChild(element);
                                // }
                            // step.3 取得memoBody
                            const memoBody = document.getElementById('memoBody');
                            memoBody.innerHTML = '';
                        
                            const _memo = empData._content[`${currentYear}`]['memo'] ?? [];
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