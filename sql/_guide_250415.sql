-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-04-15 03:08:41
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
-- 資料表結構 `_guide`
--

CREATE TABLE `_guide` (
  `id` int(10) UNSIGNED NOT NULL,
  `_file` varchar(255) NOT NULL COMMENT '檔名',
  `_title` varchar(255) NOT NULL COMMENT '文件名稱',
  `_remark` varchar(255) NOT NULL COMMENT '文件簡介說明',
  `flag` varchar(10) NOT NULL COMMENT '開關',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `updated_user` varchar(10) NOT NULL COMMENT '建檔/更新人員'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `_guide`
--

INSERT INTO `_guide` (`id`, `_file`, `_title`, `_remark`, `flag`, `created_at`, `updated_at`, `updated_user`) VALUES
(1, 'Online Information Session For ZTNA', '零信任說明書', '有關公司之筆電導入零信任管制事宜', 'On', '2025-04-14 10:47:03', '2025-04-14 11:09:14', '陳建良'),
(3, 'GA_交通_台南廠區區間車_(20241210)_v5', 'GA_交通_台南廠區區間車', 'GA_交通_台南廠區區間車_(20241210)_v5', 'On', '2025-04-14 11:34:28', '2025-04-14 11:34:28', '陳建良');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `_guide`
--
ALTER TABLE `_guide`
  ADD PRIMARY KEY (`id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_guide`
--
ALTER TABLE `_guide`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
