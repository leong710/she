-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-08-14 05:07:42
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
-- 資料表結構 `_shlocaldept`
--

CREATE TABLE `_shlocaldept` (
  `id` int(10) NOT NULL COMMENT 'AID',
  `OSTEXT_30` varchar(20) NOT NULL COMMENT '廠區',
  `OSHORT` varchar(10) NOT NULL COMMENT '部門代碼',
  `OSTEXT` varchar(20) NOT NULL COMMENT '部門名稱',
  `base` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '員工清單json',
  `inCare` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '變更作業json',
  `remark` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '備註說明json',
  `flag` tinyint(1) NOT NULL COMMENT '開關',
  `created_at` datetime NOT NULL COMMENT '創建時間',
  `updated_at` datetime NOT NULL COMMENT '更新時間',
  `updated_cname` varchar(10) NOT NULL COMMENT '更新人員cname'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `_shlocaldept`
--

INSERT INTO `_shlocaldept` (`id`, `OSTEXT_30`, `OSHORT`, `OSTEXT`, `base`, `inCare`, `remark`, `flag`, `created_at`, `updated_at`, `updated_cname`) VALUES
(1, 'FAB7', '9T426501', '黃光一課', '{\"202507\":{\"getIn\":[{\"13037706\":\"呂國楷\"},{\"10014369\":\"吳俊緯\"},{\"10023383\":\"余進益\"}]},\"202508\":{\"getOut\":[],\"getIn\":[],\"keepGoing\":[]}}', '{\"202507\":[{\"13037706\":\"呂國楷\"},{\"10014369\":\"吳俊緯\"},{\"10023383\":\"余進益\"}],\"202508\":[]}', '{\"memo\":[]}', 1, '2025-08-04 08:23:02', '2025-08-04 08:23:02', '陳建良');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `_shlocaldept`
--
ALTER TABLE `_shlocaldept`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `OSHORT` (`OSHORT`) USING BTREE;

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_shlocaldept`
--
ALTER TABLE `_shlocaldept`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'AID', AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
