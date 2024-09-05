-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-09-05 05:05:04
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
-- 資料表結構 `_staff`
--

CREATE TABLE `_staff` (
  `id` int(10) NOT NULL COMMENT 'aid',
  `emp_id` varchar(10) NOT NULL COMMENT '員工編號',
  `cname` varchar(10) NOT NULL COMMENT '員工姓名',
  `gesch` varchar(2) NOT NULL COMMENT '性別',
  `natiotxt` varchar(30) NOT NULL COMMENT '國別',
  `HIRED` date NOT NULL COMMENT '到職日',
  `shCase_logs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '年度特作紀錄',
  `_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '訪談內容JSON',
  `created_at` datetime NOT NULL COMMENT '建檔時間',
  `created_cname` varchar(10) NOT NULL COMMENT '建檔人員',
  `updated_at` datetime NOT NULL COMMENT '更新時間',
  `updated_cname` varchar(10) NOT NULL COMMENT '更新人員'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `_staff`
--

INSERT INTO `_staff` (`id`, `emp_id`, `cname`, `gesch`, `natiotxt`, `HIRED`, `shCase_logs`, `_content`, `created_at`, `created_cname`, `updated_at`, `updated_cname`) VALUES
(1, '10008048', '陳建良', '1', '台灣', '2010-03-18', '{\"2024\":{\"dept_no\":\"9T041500\",\"emp_dept\":\"環安衛一部\",\"emp_sub_scope\":\"南科管理大樓\",\"schkztxt\":\"常態班(GE)日班\",\"cstext\":\"主任工程師\",\"emp_group\":\"台灣正式員工\",\"eh_time\":9,\"shCase\":[{\"id\":32,\"OSTEXT_30\":\"TAC棟\",\"OSHORT\":\"9T041500\",\"OSTEXT\":\"環安衛一部\",\"HE_CATE\":{\"02\":\"噪音\"},\"AVG_VOL\":\"96\",\"AVG_8HR\":\"\",\"MONIT_NO\":\"noise_check1\",\"MONIT_LOCAL\":\"Off1ce 1F\",\"WORK_DESC\":\"Noies-1\"},{\"id\":33,\"OSTEXT_30\":\"TAC棟\",\"OSHORT\":\"9T041500\",\"OSTEXT\":\"環安衛一部\",\"HE_CATE\":{\"31\":\"銦\",\"02\":\"噪音\"},\"AVG_VOL\":\"96\",\"AVG_8HR\":\"87\",\"MONIT_NO\":\"noise_check2\",\"MONIT_LOCAL\":\"Off1ce 1F\",\"WORK_DESC\":\"Noise-2+In\"},{\"OSTEXT_30\":\"南科管理大樓\",\"OSHORT\":\"9T041500\",\"OSTEXT\":\"環安衛一部\"}],\"shCondition\":{\"noise\":true,\"newOne\":false,\"regular\":false,\"change\":false}}}', '{\"2024\":{\"2024\":{\"2024\":null}}}', '2024-09-04 13:41:38', 'Leong.chen', '2024-09-04 16:32:57', 'Leong.chen'),
(2, '10010721', '陳飛良', '1', '台灣', '2010-03-18', '{\"2024\":{\"dept_no\":\"9T041500\",\"emp_dept\":\"環安衛一部\",\"emp_sub_scope\":\"FAB&nbsp;7\",\"schkztxt\":\"常態班(GE)日班\",\"cstext\":\"經理\",\"emp_group\":\"台灣正式員工\",\"eh_time\":9,\"shCase\":[{\"id\":32,\"OSTEXT_30\":\"TAC棟\",\"OSHORT\":\"9T041500\",\"OSTEXT\":\"環安衛一部\",\"HE_CATE\":{\"02\":\"噪音\"},\"AVG_VOL\":\"96\",\"AVG_8HR\":\"\",\"MONIT_NO\":\"noise_check1\",\"MONIT_LOCAL\":\"Off1ce 1F\",\"WORK_DESC\":\"Noies-1\"}],\"shCondition\":{\"noise\":true,\"newOne\":false,\"regular\":false,\"change\":false}}}', '{\"2024\":{\"2024\":{\"2024\":null}}}', '2024-09-04 13:41:38', 'Leong.chen', '2024-09-04 16:32:57', 'Leong.chen'),
(3, '10114369', '洪于人', '1', '台灣', '2010-07-01', '{\"2024\":{\"dept_no\":\"9T041500\",\"emp_dept\":\"環安衛一部\",\"emp_sub_scope\":\"南科管理大樓\",\"schkztxt\":\"常態班(GE)日班\",\"cstext\":\"高級工程師\",\"emp_group\":\"台灣正式員工\",\"eh_time\":9,\"shCase\":[{\"id\":33,\"OSTEXT_30\":\"TAC棟\",\"OSHORT\":\"9T041500\",\"OSTEXT\":\"環安衛一部\",\"HE_CATE\":{\"31\":\"銦\",\"02\":\"噪音\"},\"AVG_VOL\":\"96\",\"AVG_8HR\":\"87\",\"MONIT_NO\":\"noise_check2\",\"MONIT_LOCAL\":\"Off1ce 1F\",\"WORK_DESC\":\"Noise-2+In\"}],\"shCondition\":{\"noise\":true,\"newOne\":false,\"regular\":false,\"change\":false}}}', '{\"2024\":{\"2024\":{\"2024\":null}}}', '2024-09-04 13:41:38', 'Leong.chen', '2024-09-04 16:32:57', 'Leong.chen');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `_staff`
--
ALTER TABLE `_staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `emp_id` (`emp_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_staff`
--
ALTER TABLE `_staff`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'aid', AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
