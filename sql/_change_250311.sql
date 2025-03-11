-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-03-11 06:29:01
-- 伺服器版本： 10.4.24-MariaDB
-- PHP 版本： 8.1.6

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
  `created_cname` varchar(10) NOT NULL COMMENT '建檔人員',
  `created_at` datetime NOT NULL COMMENT '建檔時間',
  `updated_cname` varchar(10) NOT NULL COMMENT '更新人員',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `_change`
--

INSERT INTO `_change` (`id`, `emp_id`, `cname`, `_changeLogs`, `_content`, `created_cname`, `created_at`, `updated_cname`, `updated_at`) VALUES
(1, '10114369', '洪于人', '{\"202502\":{\"OSHORT\":\"9T041500\",\"_0isClose\":false,\"_8isCheck\":true,\"_11whyChange\":\" 1.作業場所異動\",\"_6shCheck\":[\"11:二甲基甲醯胺\"],\"_9inCareDate\":\"2025-03-09\",\"_12checkDate\":\"2025-03-12\",\"_13reportDate\":\"2025-03-13\",\"_14notifyDate\":\"2025-03-14\",\"_10changeRemark\":\"remark-10\",\"_15bpmRemark\":\"remark-15\"}}', '{\"202502\":[]}', '陳建良', '2025-03-11 13:02:20', '陳建良', '2025-03-11 05:27:50'),
(2, '10008048', '陳建良', '{\"202502\":{\"OSHORT\":\"9T041500\",\"_0isClose\":false,\"_6shCheck\":[],\"_8isCheck\":false,\"_11whyChange\":\" 3.新進移工\",\"_9inCareDate\":\"2025-03-09\",\"_12checkDate\":\"2025-03-12\",\"_13reportDate\":\"2025-03-13\",\"_14notifyDate\":\"2025-03-14\",\"_10changeRemark\":\"remark-10\",\"_15bpmRemark\":\"remark-15\"}}', '{\"202502\":[]}', '陳建良', '2025-03-11 13:02:20', '陳建良', '2025-03-11 05:27:50');

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
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'aid', AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
