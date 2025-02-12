    
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

                // const empData = staff_inf.find(emp => emp.emp_id === edit_emp_id);
                
                // 241203 這裡要加上原本已選的項目...做不到
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
