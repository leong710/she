
-- 方法一：兩次 JSON_EXTRACT
SELECT 
    JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(dept_logs), '$[0]')) AS year_key,
    JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(dept_logs, '$.2024')), '$.dept_no')) AS dept_no,
    JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(dept_logs, '$.2024')), '$.emp_dept')) AS emp_dept,
    COUNT(*) AS count
FROM 
    _staff
GROUP BY 
    dept_no,
    emp_dept;

-- 解釋：
-- JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(dept_logs, '$.2024')), '$.dept_no'))：這行程式碼首先提取 2024 的 JSON 字串，然後再次提取 dept_no。
-- dept_logs->'$.2024'->'$.dept_no'：這是一種更簡潔的方式來解析嵌套的 JSON 字段。
-- 這些方法應該可以解決你的問題，讓你能夠正確地提取 dept_no 和 emp_dept。


SELECT 
    JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(dept_logs), '$[0]')) AS year_key,
    JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(dept_logs, CONCAT('$.', JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(dept_logs), '$[0]'))))), '$.dept_no')) AS dept_no,
    JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(dept_logs, CONCAT('$.', JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(dept_logs), '$[0]'))))), '$.emp_dept')) AS emp_dept,
    COUNT(*) AS count
FROM 
    _staff
GROUP BY 
    year_key,
    dept_no,
    emp_dept;

-- 解釋：
-- JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(dept_logs), '$[0]'))：這行程式碼提取 JSON 鍵值數組中的第一個鍵，即年份（如 2024）。
-- CONCAT('$.', JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(dept_logs), '$[0]')))：動態生成 JSON 路徑字符串，如 '$.2024'。
-- GROUP BY year_key, dept_no, emp_dept：基於年份、dept_no 和 emp_dept 進行分組。
-- 這樣，你應該能夠正確地提取 year_key（年份）、dept_no 和 emp_dept，並將它們分組。