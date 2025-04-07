    
    // [p2 函數-4] 建立監聽~shLocalTable的HE_CATE td for p-2特作欄位 // 檢查類別代號 開啟 importShLocal_modal
    let HECateClickListener;
    async function reload_HECateTable_Listeners() {
        return new Promise((resolve) => {
            const HECate = document.querySelectorAll('[class="HE_CATE"]');      //  定義出範圍
            // 檢查並移除已經存在的監聽器
            if (HECateClickListener) {
                HECate.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                    tdItem.removeEventListener('click', HECateClickListener);   // 將每一個tdItem移除監聽, 當按下click
                })
            }
            // 定義新的監聽器函數
            HECateClickListener = function () {
                const this_id_arr = this.id.split(',')                  // 分割this.id成陣列
                const edit_cname  = this_id_arr[0];                     // 取出陣列0=cname
                const edit_emp_id = this_id_arr[1];                     // 取出陣列1=emp_id
                $('#import_shLocal #import_shLocal_empId').empty().append(`${edit_cname},${edit_emp_id}`); // 清空+填上工號

                // 250407_限制只有檢查類別的項目可用...
                    const empData = staff_inf.find(emp => emp.emp_id === edit_emp_id);
                    const _yearHe = empData?.['_content']?.[empData.year_key]?.['import']?.['yearHe'] ?? '';
                    const _yearHe_obj = {};
                    _yearHe.split(',').forEach(item => {        // 1.炸成陣列
                        const [key, value] = item.split(':');   // 2.炸成物件
                        _yearHe_obj[key] = value;               // 3.物件組成
                    });
                    const selectedOptsValues = Array.from(document.querySelectorAll('#import_shLocal #shLocal_table input[type="checkbox"]'));
                    // 遍歷所有checkbox，並根據值來控制disabled屬性
                    selectedOptsValues.forEach(checkbox => {
                        const HE_CATE_id_arr = Object.keys(shLocal_inf[checkbox.value]['HE_CATE']); // 從shLocal_inf中對應的this_i取出它的HE_CATE內容(物件的key=HE_CATE_id)
                        for (const HE_CATE_id of HE_CATE_id_arr){                               // 把HE_CATE_id_arr繞出來...假動作
                            if (Object.keys(_yearHe_obj).includes(HE_CATE_id)) {
                                checkbox.disabled = false;   // 如果checkbox的value在obj的值裡，啟用checkbox
                            } else {
                                checkbox.disabled = true;    // 否則，禁用checkbox
                            }
                        }   
                    });

                // 241203 這裡要加上原本已選的項目...暫時不做
                // const selectedOptsValues = Array.from(document.querySelectorAll('#import_shLocal #shLocal_table input[type="checkbox"]:checked'));

                importShLocal_modal.show();
            }
            // 添加新的監聽器
            HECate.forEach(tdItem => {                                      // 遍歷範圍內容給tdItem
                tdItem.addEventListener('click', HECateClickListener);      // 將每一個tdItem增加監聽, 當按下click
            })
            resolve();
        });
    }
    // 241108 改變HE_CATE calss吃css的狀態；主要是主管以上不需要底色編輯提示
    function changeHE_CATEmode(){
        const isHECate = userInfo.role <= 3 && _docsIdty_inf < 4;
        const targetCate = document.querySelectorAll(isHECate ? '.xHE_CATE' : '.HE_CATE');  
        targetCate.forEach(tdItem => {
            tdItem.classList.toggle(isHECate ? 'HE_CATE'  : 'xHE_CATE');
            tdItem.classList.toggle(isHECate ? 'xHE_CATE' : 'HE_CATE');
        });
    }
