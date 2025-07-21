    // Bootstrap Alarm function
    function Balert(message, type) {
        var alertPlaceholder = document.getElementById("liveAlertPlaceholder")      // Bootstrap Alarm
        var wrapper = document.createElement('div')
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">${message}`
            + `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        alertPlaceholder.append(wrapper)
    }
    // Bootstrap 吐司顯示字條
    function inside_toast(sinn, delayTime, type){
        if(sinn){
            delayTime = delayTime ?? 3000;
            type      = type ?? 'warning';
            // 創建一個新的 toast 元素
            var newToast = document.createElement('div');
                newToast.className = 'toast align-items-center bg-'+type;
                newToast.setAttribute('role', 'alert');
                newToast.setAttribute('aria-live', 'assertive');
                newToast.setAttribute('aria-atomic', 'true');
                newToast.setAttribute('autohide', 'true');
                newToast.setAttribute('delay', delayTime);
                // 設置 toast 的內部 HTML
                newToast.innerHTML = `<div class="d-flex"><div class="toast-body ${(type == 'success' ? 'text-white':'')}">${sinn}</div>
                        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
            // 將新 toast 添加到容器中
            document.getElementById('toastContainer').appendChild(newToast);
            // 初始化並顯示 toast
            var toast = new bootstrap.Toast(newToast);
            toast.show();
            // 選擇性地，在 toast 隱藏後將其從 DOM 中移除
            newToast.addEventListener('hidden.bs.toast', function () {
                newToast.remove();
            });
        }
    }
    // 0-0.多功能擷取fun 新版改用fetch
    async function load_fun(fun, parm, myCallback) { // parm = 參數
        try {
            let formData = new FormData();
            formData.append('fun', fun);
            formData.append('parm', parm); // 後端依照fun進行parm參數的採用

            let response = await fetch('load_fun.php', {
                method: 'POST',
                body  : formData
            });

            if (!response.ok) {
                throw new Error('fun load ' + fun + ' failed. Please try again.');
            }

            let responseData = await response.json();
            let result_obj = responseData['result_obj']; // 擷取主要物件

            if(parm === 'return' || myCallback === 'return'){
                return result_obj;                          // resolve(true) = 表單載入成功，then 直接返回值
            }else{
                return myCallback(result_obj);              // resolve(true) = 表單載入成功，then 呼叫--myCallback
            }                                               // myCallback：form = bring_form() 、document = edit_show() 、locals = ? 還沒寫好
        } catch (error) {
            $("body").mLoading("hide");
            throw error;                                 // 載入失敗，reject
        }
    }
    // 0-1.確認是否超過3小時；true=_db/更新時間；false=_json          // 呼叫來源：p2chart_init
    function check3hourse(targetTimeId, action){
        return new Promise((resolve) => { 
            const targetTimeDiv = document.getElementById(targetTimeId);
            const targetTime_innerText = targetTimeDiv.innerText;
            if(targetTime_innerText == undefined) resolve('_db');

            let currentDate = new Date();                               // 取得今天日期時間
            let reloadTime  = new Date(targetTime_innerText);           // 取得reloadTime時間
    
            let timeDifference = currentDate - reloadTime;              // 計算兩個時間之間的毫秒差異
            let hoursDifference = timeDifference / (1000 * 60 * 60);    // 將毫秒差異轉換為小時數
            let result = hoursDifference >= 3 ;                         // 判斷相差時間是否大於3小時，並顯示結果
            let _method = result ? '_db' : '_json';
            if(result || action){
                recordTime(targetTimeId);       // 1.取得目前時間，並格式化；2.更新reloadTime.txt時間；完成後=>3.更新畫面上reload_time時間
                inside_toast(`--- ${targetTimeId}時間更新 ~`)
            }
            const _title = ('時間差：'+ Number(hoursDifference.toFixed(2)) +'（小時）>= 3小時：'+ result +' => '+ _method);
            targetTimeDiv.title = _title;

            // 文件載入成功，resolve
            resolve(_method);
        });
    }
    // 0-2.取得目前時間，並格式化；2.更新reloadTime.txt時間；完成後=>3.更新畫面上reload_time時間          // 呼叫來源：check3hourse
    async function recordTime(targetTimeId){
        let rightNow = new Date().toLocaleString('zh-TW', { hour12: false });                     // 取得今天日期時間
        try {
            const updateTime = await load_fun('urt' , `${targetTimeId}, ${rightNow}, true` , 'return');
            update_reloadTime(targetTimeId, updateTime);
            
        } catch (error) {
            console.error(error);
        }
    }
    // 0-3.更新畫面上reload_time時間                  // 呼叫來源：recordTime
    function update_reloadTime(targetTimeId, updateTime){
        const targetTimeDiv = document.getElementById(targetTimeId);
        targetTimeDiv.innerText = updateTime;       // 更新畫面上reload_time時間
    }

// // // 

    // step.1a 統計_shLocal內容，生成dashBoard統計數據1
    function process_p2dB1(_OSHORTsObj){
        return new Promise((resolve) => { 
            const countFabItem = {
                'total' : 0
            };
            for (const i_fab in _OSHORTsObj) {
                let totalCount = 0;
                for (const i_oshort in _OSHORTsObj[i_fab]) {
                    totalCount += _OSHORTsObj[i_fab][i_oshort]['_count'];
                }
                countFabItem[i_fab] = totalCount;
                countFabItem['total'] += totalCount;
            }

            // 文件載入成功，resolve
            resolve(countFabItem);
        });
    }
    // <!-- 在JavaScript中繪製堆疊圖 3/3-->
    async function drawEchart2(action) {
        // // S.0 防止重複畫圖...
            if (!action && document.querySelector('#eChart2') !== null) return;
        // // S.1 取得資料
            // const action = false;                                                                    // 模擬更新狀態：false=被動/true=強迫
            action = action ?? false;
            const _method = await check3hourse('p2reloadTime', action);                                 // _db/_json
            const _type = action ?  "_db" : _method;                                                    // action來決定 false=自動判斷check3hourse 或 true=強制_db
            // load_fun 先抓json，沒有then抓db(true/false 輸出json檔)
            const _shLocal = await load_fun(_type, '_shLocal, true' , 'return');                        // step.1 取得_shLocal(load_shLocal_OSHORTs)內容
            console.log('_shLocal =>',_shLocal)
            const _OSHORTsObj = await process_p2dB1(_shLocal);                                          // step.1a 統計_shLocal內容
            console.log('_OSHORTsObj =>',_OSHORTsObj)
        // // S.2 定義一個數據陣列for繪圖用 {role: 'annotation'} == 資料標籤
            var i_title = [];
            var i_value = [];
        // // S.3 整理資料：把_OSHORTsObj統計數據倒進來繞，組合成指定格式=> [廠區, 數據, 文字標籤]
            for (const [i_fab, i_count] of Object.entries(_OSHORTsObj)) {
                if(i_fab !== 'total' ){        // 跳過total
                    i_title.push(i_fab);
                    i_value.push(i_count);
                }
            }
            // 計算數據的最大值
            const maxDataValue = Math.max(...i_value);
            const yMaxValue = Math.round(maxDataValue * 1.2);   // 設定Y軸最大值1.2倍 + 四捨五入取整數
        // // S.4 定義圖表外框並貼上 
            const temp_div = '<div class="col-12 border rounded bg-white p-1" style="height: 300px;" id="eChart2"></div>';
            $('#p2chart_div').empty().append(temp_div);
        // 指定图表的配置项和数据
        var option = {
            title: {
                text: `特殊危害健康作業場所統計`,           // 1.主標題
                subtext: '件數統計'                        // 2.Y軸標題
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    var tar = params[1];
                    return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                splitLine: { show: false },
                // 以下放欄位-標籤
                // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                data: i_title
            },
            yAxis: {
                type: 'value',
                max: yMaxValue  // 設置 y 軸的最大值
            },
            series: [
                {
                    name: 'Placeholder',
                    type: 'bar',
                    stack: 'Total',
                    itemStyle: {
                        borderColor: 'transparent',
                        color: 'transparent'
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: 'transparent',
                            color: 'transparent'
                        }
                    },
                    data: [0, 0, 0, 0, 0, 0, 0]
                },
                {
                    name: '特作件數',
                    type: 'bar',
                    stack: 'Total',
                    label: {
                        show: true,
                        position: 'inside'
                    },
                    // 以下放欄位-數據
                    data: i_value
                }
            ]
        };
        // 基于准备好的dom，初始化echarts实例
        var eChart2 = echarts.init(document.getElementById('eChart2'));
        // 使用刚指定的配置项和数据显示图表。
        eChart2.setOption(option);
        // // 監聽窗口大小改變事件，調整圖表的大小
        charts.push(eChart2);
        addResizeListener(); // 添加監聽器
    }
    // <!-- 在JavaScript中繪製堆疊圖 3/3-->
    async function drawEchart1(action) {
        // // S.0 防止重複畫圖...
        if (!action && document.querySelector('#eChart1') !== null) return;
        // // S.1 取得資料
        // const action = false;                                                                    // 模擬更新狀態：false=被動/true=強迫
        action = action ?? false;
        const _method = await check3hourse('p1reloadTime', action);                                 // _db/_json
        const _type = action ?  "_db" : _method;                                                    // action來決定 false=自動判斷check3hourse 或 true=強制_db
        // load_fun 先抓json，沒有then抓db(true/false 輸出json檔)
        const _shLocalDepts = await load_fun(_type, '_shLocalDepts, true', 'return');               // step.1 提取變更部門清單
        const currentYear = String(new Date().getFullYear());   // 取得當前年份
        const result = await preProcess_staff(_shLocalDepts, currentYear, _type);                   // step.2 從step1整理出inCare在指定年份的名單 // 這裡要改成活的數值
        // // S.4 定義圖表外框並貼上 
        const temp_div = '<div class="col-12 border rounded bg-white p-1" style="height: 300px;" id="eChart1"></div>';
        $('#p1chart_div').empty().append(temp_div);
        // 指定图表的配置项和数据
        var option = {
            title: {
                text: `變更作業健檢統計`,                   // 1.主標題
                subtext: '統計件數'                         // 2.Y軸標題
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                // Use axis to trigger tooltip
                type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
              }
            },
            legend: {
                // bottom: 1  // 將圖例移到底部
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            yAxis: {
              type: 'value'
            },
            xAxis: {
              type: 'category',
              data: result['fab_title']
            },
            series: [
              {
                name: '已完成',
                type: 'bar',
                stack: 'total',
                label: {
                  show: true
                },
                emphasis: {
                  focus: 'series'
                },
                data: result['primary']
              },
              {
                name: '等待中-7天內',
                type: 'bar',
                stack: 'total',
                label: {
                  show: true
                },
                emphasis: {
                  focus: 'series'
                },
                data: result['success']
              },
              {
                name: '等待中-7天以上',
                type: 'bar',
                stack: 'total',
                label: {
                  show: true
                },
                emphasis: {
                  focus: 'series'
                },
                data: result['warning']
              },
              {
                name: '等待中-12天以上',
                type: 'bar',
                stack: 'total',
                label: {
                  show: true
                },
                emphasis: {
                  focus: 'series'
                },
                data: result['danger']
              }
            ]
        };
        // 基于准备好的dom，初始化echarts实例
        var eChart1 = echarts.init(document.getElementById('eChart1'));
        // 使用刚指定的配置项和数据显示图表。
        eChart1.setOption(option);
        // // 監聽窗口大小改變事件，調整圖表的大小
        charts.push(eChart1);
        addResizeListener(); // 添加監聽器
    }
    // 250422 定義監聽窗口大小改變事件，調整所有圖表的大小
    let charts = [];        // 存儲所有圖表實例
    function addResizeListener() {
        window.addEventListener('resize', function() {
            charts.forEach(chart => {
                chart.resize();
            });
        });
    }

// // // 

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
                await drawEchart2();
            } catch (error) {
                console.error(error);
            }
            $("body").mLoading("hide");
        }
        // 添加新的監聽器
        navP2tab_btn.addEventListener('click', navP2tabClickListener);  // 增加監聽p2_btn
    }
    // 250414 製造橫幅
    async function make_balert(){
        const balert_arr = await load_fun('load_balert','load_balert','return');
        if(balert_arr.length !==0 ){
            balert_arr.forEach(item => {
                Balert( item._value, item._type);                
            });
        }       
    }

    $(async function () {         // $(document).ready()
        // ready.1 在任何地方啟用工具提示框
            $('[data-toggle="tooltip"]').tooltip();
        // ready.2 產生警告橫幅
            make_balert();
            await drawEchart1();
        // ready.3 定義nav-tab [nav-p2-tab]鈕功能，並建立監聽
            reload_navTab_Listeners();
    })