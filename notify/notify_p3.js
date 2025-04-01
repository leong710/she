



        // step.1 取得_document代處理清單idty > 3 AND < 10； 參數:免
        async function p3_step1() {
            // ch.match(/[\^>V<]/);
            const P3Notify_list = await local_load_fun('showP3Notify_list', 'showP3Notify_list', 'return');  // load_fun查詢大PM bpm，並用step1找出email
                    console.log('p3_step1...', P3Notify_list);
            return(P3Notify_list); // 返回取得的資料
        }
        // step.2 將_document的每一筆in_sign取出成陣列...參數:由step.1取得的資料
        async function p3_step2(P3Notify_list) {
            return new Promise((resolve) => {
                // 首先對每個員工資料使用 map()，然後透過 Object.values() 來提取 _todo 物件中的值。最後，使用 flat() 將嵌套陣列展平，得到一個包含所有 _todo 值的一維陣列。
                const inSignLists = (P3Notify_list.length != 0) ? P3Notify_list.map(_doc => _doc.in_sign).flat() : [];
                const inSignListsUniqueArr =  [...new Set(inSignLists)];                        // 去重
                    console.log('p3_step2--inSignListsUniqueArr...', inSignListsUniqueArr);
            
                resolve(inSignListsUniqueArr); // 返回取得的資料
            });
        }
        // step.3 查找簽核人員訊息...參數:由step.2取得的資料(工號陣列)
        async function p3_step3(inSignListsUniqueArr) {
            const inSignListsUniqueStr = (inSignListsUniqueArr.length != 0 ) ? JSON.stringify(inSignListsUniqueArr).replace(/[\[\]]/g, '') : '';   // 把部門代號進行加工(多選)，去除外框
                console.log('p3_step3a--inSignListsUniqueStr...', inSignListsUniqueStr);
            const showStaffIn = (inSignListsUniqueStr != '' ) ? await load_API('showStaffIn', inSignListsUniqueStr, 'return') : [];     // load_fun查詢大PM bpm，並用step1找出email
                console.log('p3_step3b--showStaffIn...', showStaffIn);
            
            return(showStaffIn); // 返回取得的資料
        }
        // step.4 找出簽核代理人...參數:由step.3取得的資料
        async function p3_step4(inSignLists) {
            const staffEmpIdArr = (inSignLists.length != 0 ) ? inSignLists.map(staff => staff.emp_id) : [];
                console.log('p3_step4a--staffEmpIdArr...', staffEmpIdArr);
            const staffEmpIdStr = (staffEmpIdArr.length != 0 ) ? JSON.stringify(staffEmpIdArr).replace(/[\[\]]/g, '') : '';         // 把工號進行加工(多選)，去除外框
            const showDelegationIn = (staffEmpIdStr != '' ) ? await load_API('showDelegationIn', staffEmpIdStr, 'return') : [];     // load_API查詢休假代理人
                console.log('p3_step4b--showDelegationIn...', showDelegationIn);
            
            return(showDelegationIn); // 返回取得的資料
        }
        // step.5 鋪設p3notify_table畫面 & 製作mail清單 
        async function p3_step5(P3Notify_list, _inSignLists, _delegationIn) {
            // console.log('_inSignLists =>', _inSignLists);
            // 停止並銷毀 DataTable
            release_dataTable('p3notify_table');
            $('#p3notify_table tbody').empty();
            let mailArr     = [];       // 初始化mail清單

            if(P3Notify_list.length === 0){
                const table = $('#p3notify_table').DataTable();       // 獲取表格的 thead
                const columnCount = table.columns().count();    // 獲取每行的欄位數量
                const tr1 = `<tr><td class="text-center" colspan="${columnCount}"> ~ 沒有資料 ~ </td><tr>`;
                $('#p3notify_table tbody').append(tr1);
    
            }else{
                    // div加工廠
                    function rework_content(doc_i){
                        let _p3DIV    = {};
                            _p3DIV[5] = '';   // 部門主管
                            _p3DIV['inSign'] = '';

                        if(doc_i) {
                            const { in_sign, id } = doc_i;
                            // 處理inSign
                            const INSIGN_i = _inSignLists.find(inSign_i => inSign_i.emp_id === in_sign);   // 從s_inSignLists找出符合in_sign的簽核者資料
                            // console.log('INSIGN_i =>', INSIGN_i);
                            // 處理INSIGN代簽
                            const delegation_i = _delegationIn.find(deleg_i => deleg_i.APPLICATIONEMPID === INSIGN_i.emp_id);
                            // 提取對應訊息
                            let inSignDIV = []; 
                            if (delegation_i !== undefined && delegation_i.SINGFLAG === 'Y'){       // Y=啟動代理簽核
                                inSignDIV = {
                                    'title'  : '&nbsp;<sup class="text-danger">- 代理</sup>',
                                    'cname'  : delegation_i.DEPUTYCNAME,
                                    'emp_id' : delegation_i.DEPUTYEMPID,
                                    'email'  : delegation_i.comid2
                                }
                            }else{
                                inSignDIV = {
                                    'title'  : '~',  // 非代理，這裡清除
                                    'cname'  : INSIGN_i.cname,
                                    'emp_id' : INSIGN_i.emp_id,
                                    'email'  : INSIGN_i.comid2
                                }
                            }
                            // 組合訊息
                            _p3DIV[5] += `<div class="text-start" id="inSign,${id},${inSignDIV.emp_id}" >${inSignDIV.cname}&nbsp;(${inSignDIV.emp_id})${inSignDIV.title}</div>`;   // 部門主管
                            _p3DIV['inSign'] = inSignDIV.emp_id;

                            // &nbsp;&nbsp;${inSignDIV.email}
                            // 製作員工異動+特作項目訊息
                            const _docObj = {
                                'age'       : doc_i.age,        // 年
                                'sub_scope' : doc_i.sub_scope,  // 廠區
                                'dept_no'   : doc_i.dept_no,    // 部門代號
                                'emp_dept'  : doc_i.emp_dept,   // 部門名稱
                                'idty'      : doc_i.idty,
                                'flow'      : doc_i.flow,
                                'uuid'      : doc_i.uuid
                            };
                            // 合併到寄件訊息
                            let mailIn = mailArr.find(inSign_i => inSign_i.emp_id === in_sign);
                            if(mailIn === undefined){   // || Object.entries(mailIn).length === 0 
                                mailIn = {
                                    'cname'     : inSignDIV.cname,
                                    'emp_id'    : inSignDIV.emp_id,
                                    'email'     : inSignDIV.email,
                                    'doc_inf'   : [_docObj]
                                }
                                mailArr.push(mailIn);                   // 把新建的主管+員工訊息推進去
                            }else{
                                // mailIn['staff_inf'] = [...mailIn['staff_inf'] , ...staff_obj];
                                mailIn['doc_inf'].push(_docObj);    // 把新建的員工訊息推進去
                            }
                        }

                        return {_p3DIV}; 
                    }
                    // 部門代號加工+去除[]符號/[{"}]/g, ''
                    function doReplace(_arr){
                        const newObj = Object.fromEntries(
                            Object.entries(_arr).map(([key, value]) => [key, value.replace(/,/g, "、")])
                        );
                        return JSON.stringify(newObj).replace(/[\[{"}\]]/g, '').replace(/:/g, ' : ').replace(/,/g, '<br>'); 
                    }

                await P3Notify_list.forEach((doc_i)=>{        // 分解參數(陣列)，手工渲染，再掛載dataTable...
                    const { _p3DIV } = rework_content(doc_i);
                    const flow_remark = doReplace(JSON.parse(doc_i.flow_remark));

                    let tr1 = '<tr>';
                        tr1 += `<td class=""        id="" >${doc_i.age ?? ''}</td>
                                <td class=""        id="" >${doc_i.sub_scope ?? ''} (${doc_i.BTRTL ?? ''})</td>
                                <td class=""        id="" >${doc_i.dept_no ?? ''} ${doc_i.emp_dept ?? ''}</td>
                                <td class=""        id="" >${doc_i.idty ?? ''} ${doc_i.flow ?? ''}</td>
                                <td class=""        id="" >${doc_i.in_signName ?? ''} (${doc_i.in_sign ?? ''})<br>${_p3DIV[5]}</td>
                                <td class="t-start" id="" >${flow_remark}</td>
                            `;
                        tr1 += '</tr>';
                    $('#p3notify_table tbody').append(tr1);
                    // objKeys_ym = [...objKeys_ym, ...Object.keys(post_i["base"])];   // 把所有的base下的年月key蒐集起來
                    // thisMonth = targetMonth;                                        // 顯示月份&submit_btn
                })
                p3notify_btn.disabled = mailArr.length === 0;
                $('#p3notify_table').DataTable();
            }

            $('#p3totalUsers_length').empty().append(`${P3Notify_list.length} 筆 / ${mailArr.length} 封`);
            // $('#nav-p3-tab').tab('show');   // 跳頁
            console.log('mailArr 3=>', mailArr );

            return { mailArr };
        }
        // step.6 信件工廠：生成通知信，並沒有寄出...
        async function p3mailFac(mailArr) {
            let mailFab_Arr = [];    
            if(mailArr.length !==0){
                const sample_mail = await load_jsonFile('../notify/p3sample_mail.json');    // 取得mail範本
                mailArr.forEach((mail_i) => {
                    const { doc_inf , email: to_email, emp_id: to_emp_id, cname: to_cname } = mail_i;
                    // 把員工繞出來 +上li
                    const docDiv = doc_inf.map(doc_i =>
                        `<li>${doc_i.age}年 ${doc_i.sub_scope}&nbsp;${doc_i.dept_no}&nbsp;${doc_i.emp_dept} 表單狀態 = ${doc_i.idty}.${doc_i.flow}</li>`
                    );
                    // 員工打包後 +上外層ul
                    const docDivStr = `<ul class="mb-0">${docDiv.join('')}</ul>`;
                    // 組合信件 
                    const mailInner = `${sample_mail[1]}${docDivStr}${sample_mail[2]}<br>&nbsp;&nbsp;※ 特殊健檢系統(SHE)  <a href="${uri}/she/review/" target="_blank">定期特殊健檢名單審核</a>`
                        // console.log(mailInner)
                        // 鋪設選染在畫面p2result
                        // $('#p2result').append(mailInner);
                        // 將mail寄出(每次一封，直到forEach完畢)
                        // sendmail(to_email, sample_mail[0], mailInner);
                    // 打包mail成mailFab_Arr
                    mailFab_Arr.push({
                        'to_cname'  : to_cname,
                        'to_emp_id' : to_emp_id,
                        'to_email'  : to_email,
                        'title'     : sample_mail[0],
                        'mailInner' : mailInner,
                        'docList'   : docDivStr,
                        'doc_inf'   : doc_inf
                    })
                })
            }
            return mailFab_Arr;
        }


    // 主技能
    // 2025/04/01 p3notify_process()整理訊息、發送、顯示發送結果。
    async function p3notify_process(msgArr){
        mloading("show");                                                       // 啟用mLoading
        $('#p2result').empty();                                                 // 清空執行訊息欄位 (共用p2result)

        // step0.init  
            var push_result  = {                                                // count push time to show_swal_fun
                'mapp' : {
                    'success' : 0,
                    'error'   : 0
                },
                'email' : {
                    'success' : 0,
                    'error'   : 0
                }
            }

            var totalUsers = msgArr.length;                                    // 獲取總用戶數量
            var completedUsers = 0;                                             // 已完成发送操作的用户数量
            var to_logs = [];                                                  // 宣告儲存Log用的 大-陣列Logs
            var doc_mailResult = [];

        // step1. 將notifyLists逐筆進行分拆作業
        for (const _value of msgArr){              // 表頭1.外層
            // step.1-0 init
            const { to_cname, to_emp_id, to_email, title, mailInner, docList, doc_inf } = _value;

            // step.1-1 確認工號是否有誤
            if(to_email === '' || to_email == undefined || to_email == null){
                console.error("1-1.to_email有誤：", to_email);
                push_result['email']['error']++; 
                continue;                                                       // 使用 continue 代替 return false 以便繼續處理其他用戶
                
            } else if(title === '' || title == undefined || title == null) {
                console.error("1-2.title有誤：", title);
                push_result['email']['error']++; 
                continue;                                                       // 使用 continue 代替 return false 以便繼續處理其他用戶

            } else if(mailInner === '' || mailInner == undefined || mailInner == null) {
                console.error("1-3.mailInner有誤：", mailInner);
                push_result['email']['error']++; 
                continue;                                                       // 使用 continue 代替 return false 以便繼續處理其他用戶

            } else {
                // 宣告儲存Log內的單筆 小-物件log
                let to_log = { 
                    cname           : to_cname,
                    emp_id          : to_emp_id,
                    email           : to_email,
                    thisTime        : thisTime                                      // 小-物件log 紀錄thisTime
                };

                // step.1-2 調用_fun make_msg 帶入個人單筆紀錄進行訊息製作
                to_log['mg_msg']    = docList;                         // 小-物件log 紀錄mg_msg訊息
                
                // step.2 執行通知 --
                // *** 2-1 發送mail
                // const mailResult = await sendmail(to_email, title, mailInner);   // 正式要打開才能發信
                const mailResult = true;    // 測試用bypass

                // 執行-mail處理-訊息渲染
                    to_log.mail_res = mailResult ? 'OK' : 'NG';
                    mailResult ? push_result['email']['success']++ : push_result['email']['error']++; 
                    let fa_icon_mail = window['mail_' + to_log.mail_res];
                    var console_log = `${to_cname}(${to_emp_id}) ... sendMail：${getTimeStamp()} ... ${fa_icon_mail} ${to_log.mail_res}`;    // 初始化下方執行訊息
                    $('#p2result').append(console_log + '</br>');                                           // 執行訊息渲染1下方

                    const inSignDivs = document.querySelectorAll(`#p3notify_table snap[id*=",${to_emp_id}"]`);
                            console.log('inSignDivs:', inSignDivs)
                        // inSignDivs.forEach((omagerDiv) => omagerDiv.innerHTML = fa_icon_mail );                         // 執行訊息渲染2尾部a
                        inSignDivs.forEach((omagerDiv) => omagerDiv.insertAdjacentHTML('beforeend', fa_icon_mail));     // 執行訊息渲染2尾部b

                // 其他自定義操作
                to_logs.push(to_log);                                    // 將log單筆小物件 塞入 logs大陣列中
                // 製作成功清單
                Object.entries(doc_inf).forEach(([index, doc]) => {
                    doc.from_cname = userInfo.cname,  // 誰通知
                    doc.to_cname   = to_cname,        // 通知誰
                    doc.to_emp_id  = to_emp_id,       // 誰的工號
                    // doc.to_email = to_email,       // 誰的信箱
                    doc.dateTime = getTimeStamp();    // 通知時間
                    doc.result = mailResult;          // 通知結果

                    doc_mailResult.push(doc);       // 推到主要陣列
                });

                completedUsers++;                                            // 增加已完成发送操作的用户数量
            }
        }

        // step.5 確認發送筆數完成，並調用swap_toLog 將to_logs寫入autoLog
        if (completedUsers == totalUsers) {                          // 检查是否所有用户的发送操作都已完成
            swap_toLog(to_logs);                                   // 所有发送操作完成后调用 swap_toLog
        }
        // step.6 調用 show_swal_fun帶入push_result統計
        show_swal_fun(push_result);                                                         // 调用 show_swal_fun
        // 將其歸零，避免汙染
            to_logs = [];
            push_result = {
                'mapp' : {
                    'success' : 0,
                    'error'   : 0
                },
                'email' : {
                    'success' : 0,
                    'error'   : 0
                }
            }

            // $("body").mLoading("hide");                                                         // 關閉mLoading圖示
        return doc_mailResult;    // 返回特作員工清單
    }

    async function p3_init(){
        mloading("show");                               // 啟用mLoading

        try {
            const P3Notify_list        = await p3_step1();      // step.1 取得p3待簽名單
            // const load_changeTodo14 = await p3_step1a(load_changeTodo);
            const inSignListsUniqueArr = await p3_step2(P3Notify_list);   // step.2 將_document的每一筆in_sign取出成陣列
            const inSignLists          = await p3_step3(inSignListsUniqueArr);   // step.3 查找簽核人員訊息
            const delegationIn         = await p3_step4(inSignLists);    // step.4 找出簽核代理人...
            const { mailArr }          = await p3_step5(P3Notify_list, inSignLists, delegationIn); // 鋪設p3notify_table畫面 & 製作mail清單

            const p3notify_btn         = document.getElementById('p3notify_btn');
            p3notify_btn.addEventListener('click', async function () {
                // if(confirm('確認發報？')){
                    mloading("show");                               // 啟用mLoading
                    const msgArr = await p3mailFac( mailArr );                                                // step1.生成mail
                        console.log('msgArr...', msgArr)
                    const doc_mailResult = (msgArr.length !== 0) ? await p3notify_process(msgArr) : [];   // step2.發送處理
                    if(doc_mailResult.length !== 0){
                        // 打包同仁的發報紀錄
                        const doc_inf_str = JSON.stringify({ doc_inf : doc_mailResult });
                        // 儲存同仁的發報紀錄
                        const result = await load_fun('bat_updateDocumentNotify', doc_inf_str, 'return');   // load_fun的變數傳遞要用字串
                        inside_toast(result.content, 3000, result.action);
                        
                        // if(result.action === 'success'){
                        //     post_staff(staff_inf, mergedData_inf, shItemArr_inf);    // 更新畫面=重新鋪設Page3
                        // }
                    }
                // }
                
                $("body").mLoading("hide");
            });
            
        } catch (error) {
            console.error(error);
        }

        $("body").mLoading("hide");
    }