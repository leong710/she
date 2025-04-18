-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025 年 04 月 18 日 05:07
-- 伺服器版本： 10.4.28-MariaDB
-- PHP 版本： 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `she`
--

-- --------------------------------------------------------

--
-- 資料表結構 `_change`
--

CREATE TABLE `_change` (
  `id` int(10) NOT NULL COMMENT 'aid',
  `emp_id` varchar(10) NOT NULL COMMENT '員工編號',
  `cname` varchar(10) NOT NULL COMMENT '員工姓名',
  `_changeLogs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '異動紀錄',
  `_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '訪談內容JSON',
  `_todo` longtext NOT NULL COMMENT '等待體檢',
  `created_cname` varchar(10) NOT NULL COMMENT '建檔人員',
  `created_at` datetime NOT NULL COMMENT '建檔時間',
  `updated_cname` varchar(10) NOT NULL COMMENT '更新人員',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `_change`
--

INSERT INTO `_change` (`id`, `emp_id`, `cname`, `_changeLogs`, `_content`, `_todo`, `created_cname`, `created_at`, `updated_cname`, `updated_at`) VALUES
(1, '10114369', '洪于人', '{\"202502\":{\"OSHORT\":\"9T041500\",\"_0isClose\":false,\"_8isCheck\":true,\"_11whyChange\":\" 1.作業場所異動\",\"_6shCheck\":[\"11:二甲基甲醯胺\"],\"_9inCareDate\":\"2025-03-09\",\"_12checkDate\":\"2025-03-12\",\"_13reportDate\":\"2025-03-13\",\"_14notifyDate\":\"2025-03-14\",\"_10changeRemark\":\"remark-10\",\"_15bpmRemark\":\"remark-15\",\"_7isCheck\":true}}', '{\"202502\":{\"notify\":[{\"from_cname\":\"陳建良\",\"to_cname\":\"陳飛良\",\"dateTime\":\"2025\\/04\\/10 10:46:03\",\"result\":true}]}}', '{\"202502\":{\"OSHORT\":\"9T041500\"}}', '陳建良', '2025-03-11 13:02:20', '陳建良', '2025-04-10 02:46:03'),
(2, '10008048', '陳建良', '{\"202502\":{\"OSHORT\":\"9T041500\",\"_0isClose\":false,\"_6shCheck\":[\"02:噪音\",\"31:銦\"],\"_8isCheck\":false,\"_11whyChange\":\" 3.新進移工\",\"_9inCareDate\":\"2025-03-09\",\"_12checkDate\":\"2025-03-12\",\"_13reportDate\":\"2025-03-13\",\"_14notifyDate\":\"2025-03-14\",\"_10changeRemark\":\"remark-10\",\"_15bpmRemark\":\"remark-15\",\"_7isCheck\":true}}', '{\"202502\":{\"notify\":[{\"from_cname\":\"陳建良\",\"to_cname\":\"陳飛良\",\"dateTime\":\"2025\\/04\\/10 10:46:03\",\"result\":true}]}}', '{\"202502\":{\"OSHORT\":\"9T041500\"}}', '陳建良', '2025-03-11 13:02:20', '陳建良', '2025-04-10 02:46:03'),
(19, '11084472', '蕭惠旭', '{\"202503\":{\"OSHORT\":\"9T523501\",\"_6shCheck\":[\"02:噪音\"],\"_7isCheck\":true}}', '{\"202503\":{\"notify\":[{\"from_cname\":\"陳建良\",\"to_cname\":\"黃慧文\",\"dateTime\":\"2025\\/04\\/11 15:44:42\",\"result\":true}]}}', '{\"202503\":{\"OSHORT\":\"9T523501\"}}', '陳建良', '2025-04-02 10:26:40', '蕭惠旭', '2025-04-15 08:14:19'),
(20, '14109582', '楊傑安', '{\"202504\":{\"OSHORT\":\"9T523501\",\"_6shCheck\":[\"02:噪音\"],\"_7isCheck\":true}}', '{\"202504\":{\"notify\":[{\"from_cname\":\"陳建良\",\"to_cname\":\"黃慧文\",\"dateTime\":\"2025\\/04\\/11 15:44:42\",\"result\":true}]}}', '{\"202504\":{\"OSHORT\":\"9T523501\"}}', '陳建良', '2025-04-02 10:26:40', '蕭惠旭', '2025-04-15 08:14:19'),
(23, '11053787', '李振豪', '{\"202504\":{\"OSHORT\":\"9T422502\",\"_6shCheck\":[\"0231:噪音+銦\"],\"_7isCheck\":true}}', '{\"202504\":{\"notify\":[{\"from_cname\":\"李品萱\",\"to_cname\":\"施明豐\",\"dateTime\":\"2025\\/04\\/14 14:28:03\",\"result\":true}]}}', '{\"202504\":{\"OSHORT\":\"9T422502\"}}', '李品萱', '2025-04-14 14:20:38', '李品萱', '2025-04-14 06:28:03'),
(24, '11106399', '薛鈺錠', '{\"202504\":{\"OSHORT\":\"9T422502\",\"_6shCheck\":[\"0231:噪音+銦\"],\"_7isCheck\":true}}', '{\"202504\":{\"notify\":[{\"from_cname\":\"李品萱\",\"to_cname\":\"施明豐\",\"dateTime\":\"2025\\/04\\/14 14:28:03\",\"result\":true}]}}', '{\"202504\":{\"OSHORT\":\"9T422502\"}}', '李品萱', '2025-04-14 14:20:38', '李品萱', '2025-04-14 06:28:03'),
(31, '15070072', '林正堂', '{\"202504\":{\"OSHORT\":\"9T512501\",\"_6shCheck\":[],\"_7isCheck\":false,\"_8Remark\":\"4\\/8 主管回覆此員工無進入噪音區作業\",\"_9checkDate\":\"2025-04-08\"}}', '{\"202504\":{\"notify\":[]}}', '[]', '蕭惠旭', '2025-04-15 13:13:19', '蕭惠旭', '2025-04-15 06:01:22'),
(33, '10024025', '蔡政芳', '{\"202504\":{\"OSHORT\":\"9T523501\",\"_6shCheck\":[\"02:噪音\"],\"_7isCheck\":true}}', '{\"202504\":{\"notify\":[{\"from_cname\":\"蕭惠旭\",\"to_cname\":\"黃慧文\",\"dateTime\":\"2025\\/04\\/15 16:14:31\",\"result\":true}]}}', '{\"202504\":{\"OSHORT\":\"9T523501\"}}', '蕭惠旭', '2025-04-15 16:13:08', '蕭惠旭', '2025-04-15 08:14:31');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `_change`
--
ALTER TABLE `_change`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `emp_id` (`emp_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_change`
--
ALTER TABLE `_change`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'aid', AUTO_INCREMENT=39;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
