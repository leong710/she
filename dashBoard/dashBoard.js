    // Bootstrap Alarm function
    function Balert(message, type) {
        var alertPlaceholder = document.getElementById("liveAlertPlaceholder")      // Bootstrap Alarm
        var wrapper = document.createElement('div')
        wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message 
                            + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        alertPlaceholder.append(wrapper)
    }
    // Bootstrap 吐司顯示字條
    function inside_toast(sinn){
        var toastLiveExample = document.getElementById('liveToast');
        var toast = new bootstrap.Toast(toastLiveExample);
        var toast_body = document.getElementById('toast-body');
        toast_body.innerHTML = sinn;
        toast.show();
    }
    // 0-0.多功能擷取fun 新版改用fetch
    async function load_fun(fun, parm, myCallback) { // parm = 參數
        // mloading(); 
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
    function check3hourse(action){
        return new Promise((resolve) => { 
            let currentDate = new Date();                               // 取得今天日期時間
            let reloadTime  = new Date(reload_time.innerText);          // 取得reloadTime時間
    
            let timeDifference = currentDate - reloadTime;              // 計算兩個時間之間的毫秒差異
            let hoursDifference = timeDifference / (1000 * 60 * 60);    // 將毫秒差異轉換為小時數
            let result = hoursDifference >= 3 ;                         // 判斷相差時間是否大於3小時，並顯示結果
            let _method = result ? '_db' : '_json';
            if(result || action){
                recordTime();       // 1.取得目前時間，並格式化；2.更新reloadTime.txt時間；完成後=>3.更新畫面上reload_time時間
            }
            const _title = ('時間差：'+ Number(hoursDifference.toFixed(2)) +'（小時）>= 3小時：'+ result +' => '+ _method);
            document.getElementById('reload_time').title = _title;

            // 文件載入成功，resolve
            resolve(_method);
        });
    }
    // 0-2.取得目前時間，並格式化；2.更新reloadTime.txt時間；完成後=>3.更新畫面上reload_time時間          // 呼叫來源：check3hourse
    async function recordTime(){
        let rightNow = new Date().toLocaleString('zh-TW', { hour12: false });                     // 取得今天日期時間
        try {
            await load_fun('urt' , rightNow+', true' , update_reloadTime);      
        } catch (error) {
            console.error(error);
        }
    }
    // 0-3.更新畫面上reload_time時間                  // 呼叫來源：recordTime
    function update_reloadTime(rightNow){
        reload_time.innerText = rightNow;       // 更新畫面上reload_time時間
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
    async function p2drawChart() {
        // // S.0 防止重複畫圖...
            const p2drawChart_div = document.querySelector('#p2drawChart');
            if(p2drawChart_div !== null) return;

        // // S.1 取得資料
            const action = false;                                                                       // 模擬更新狀態：false=被動/true=強迫
            const _method = await check3hourse(action);                                                 // _db/_json
                console.log('_method =>', _method)
            const _type = action ?  "_db" : _method;                                                    // action來決定 false=自動判斷check3hourse 或 true=強制_db
            // load_fun 先抓json，沒有then抓db(true/false 輸出json檔)
            const _shLocal = await load_fun(_type, '_shLocal, true' , 'return');                        // step.1 取得_shLocal(load_shLocal_OSHORTs)內容
            const _OSHORTsObj = await process_p2dB1(_shLocal);                                          // step.1a 統計_shLocal內容
                // console.log('p2drawChart _OSHORTsObj...', _OSHORTsObj)

        // // S.2 定義一個數據陣列for繪圖用 {role: 'annotation'} == 資料標籤
            // var myData = [[('string', 'month_系統'), ('number','月統計') ,{role: 'style'}, ('number','User'),{role: 'style'}, ('number','Guest'),{role: 'style'} ]];
            var myChart_data = [[('string', 'FAB_廠區') ,('number','特危場所'),{role: 'annotation'}]]    // 繪圖專用陣列~ 同時初始定義[0]的標籤

        // // S.3 整理資料：把_OSHORTsObj統計數據倒進來繞，組合成指定格式=> [廠區, 數據, 文字標籤]
            for (const [i_fab, i_count] of Object.entries(_OSHORTsObj)) {
                if(i_fab !== 'total' ){        // 跳過total
                    myChart_data.push([i_fab, i_count, i_count]);
                }
            }
            // console.log('myChart_data', myChart_data )


        // 將數據陣列傳遞給arrayToDataTable()函數以創建數據表格
        var data = google.visualization.arrayToDataTable(myChart_data);

        var options = {
            animation: {  //載入動畫
                        startup  : true,
                        duration : 1000,
                        easing   : 'out',
                    },
            title: '統計件數',
            isStacked: true,                    // 堆疊選項  == > 這個是關鍵
            vAxis: {        
                        0: {scaleType: 'log'},
                        format: '#'             // 刻度不要有小數點
                    },
            // vAxes: {    
                        // 雙Y軸 標題 + 樣式
                        // 0: {title: 'click count(月計)', maxValue: (hit_maxVal * 1.1)}
                        // 1: {title: 'Hit (次)'}            // , textStyle: {color: 'green'}, minValue: 200, maxValue: (hit_maxVal * 1.1)
                    // },
            hAxis: { title: '特殊危害健康作業場所統計'}, // ,format: '####'
            seriesType: 'bars',
            bars: 'vertical',
            // series: {
                        // 0: {targetAxisIndex: 0, type: 'line', pointSize: 5, pointShape: 'circle' }                         // pointSize: 圓點的大小、pointShape: 圓點的形狀
                        // 1: {targetAxisIndex: 0, type: 'line', visibleInLegend: false},                                      // visibleInLegend: 圖例
                        // 2: {targetAxisIndex: 1, type: 'line', lineDashStyle: [4, 4], pointSize: 5, pointShape: 'circle'}    // lineDashStyle: 虛線
                    // },

            colors: [ '#4682b4', '#a3c2db' , '#0a9bf5' , '#87cefa',  '#7FFF00', '#2E8B57', 'blue'],                      // 自訂顏色
            legend: { position: 'right' },                          // 圖例設置在底部 bottom；right
            // chartArea: { left: '5%', top: '15%', right: '5%'}    // 設置圖表區域大小和位置
            annotations: {                                          // 對應 {role: 'annotation'} == 資料標籤
                textStyle: {
                    fontName: 'Arial',
                    fontSize: 12,
                    color: 'black',
                },
                alwaysOutside: false,
                stem: {
                    length: 10,
                    color: 'none'
                },
                highContrast: true,
                datum: {
                    color: '#000',
                    fontSize: 12,
                }
            }
        };

        // // S.4 定義圖表外框並貼上 
        let temp_div = '<div class="col-12 border rounded bg-white p-1" style="height: 300px;" id="p2drawChart"></div>';
        $('#p2chart_div').empty().append(temp_div);
                
        // 創建一個新的ColumnChart對象，並將數據表格和選項傳遞給它
        var cunt_chart = new google.visualization.ColumnChart(document.getElementById('p2drawChart'));
        // 繪製圖表
        cunt_chart.draw(data, options);
        // 監聽窗口大小改變事件，調整圖表的大小
        window.addEventListener('resize', (function(cunt_chart, data, options) {
            return function() {
                cunt_chart.draw(data, options);
            }
        })(cunt_chart, data, options));
    }
    
    async function p2chart_init(action) {
        // const _method = await check3hourse(action);
        // const _type = action ?  "_db" : _method;      // action來決定 false=自動判斷check3hourse 或 true=強制_db
        try {
            mloading(); 
                // await load_fun('_db',   'formcase,'       , bring_form);     // step_1 直接抓db(true/false 輸出json檔)，取得 formcase 內容後鋪設內容
                // await load_fun('_json', 'formcase, true'  , bring_form);     // step_1 先抓json，沒有then抓db(true/false 輸出json檔)，取得 formcase 內容後鋪設內容
                // await load_fun(_type,   'formcase, true'  , bring_form);     // step_1 先抓json，沒有then抓db(true/false 輸出json檔)，取得 formcase 內容後鋪設內容
    
            // // // load_fun 先抓json，沒有then抓db(true/false 輸出json檔)
            // const _shLocal   = await load_fun(_type, '_shLocal, true' , 'return');      // step.1 取得_shLocal(load_shLocal_OSHORTs)內容
            //     // console.log('step.1 _shLocal =>', _shLocal);
            // const OSHORTsObj = await process_p2dB1(_shLocal);                                 // step.1a 統計_shLocal內容
            //     // console.log('step.2 OSHORTsObj =>', OSHORTsObj);
    
            // <!-- 在JavaScript中繪製堆疊圖 3/3-->
            // await google.charts.load('current', {'packages':['corechart']});
            // await google.charts.setOnLoadCallback(p2drawChart);
    
        } catch (error) {
            console.error(error);
        }
    
        await $("body").mLoading("hide");
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
                console.log('p2_btn click...')
            // p2_init(false);
            // p2chart_init(false);
            await google.charts.load('current', {'packages':['corechart']});
            await google.charts.setOnLoadCallback(p2drawChart);
            
            $("body").mLoading("hide");
        }

        // 添加新的監聽器
        // if(userInfo.role <= 1){
            navP2tab_btn.addEventListener('click', navP2tabClickListener);  // 增加監聽p2_btn
        // }
    }



    $(function () {         // $(document).ready()

        // ready.1 在任何地方啟用工具提示框
            $('[data-toggle="tooltip"]').tooltip();

        // ready.2 定義nav-tab [nav-p2-tab]鈕功能，並建立監聽
            reload_navTab_Listeners();
        
        // ready.3 產生警告橫幅
            let message  = '*** <b>請注意&nbsp<u>網頁改版測試中</u>!!</b>&nbsp;~&nbsp;';
            Balert( message, 'success');
        
    })