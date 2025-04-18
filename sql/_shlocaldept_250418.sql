-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025 年 04 月 18 日 05:06
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `_shlocaldept`
--

INSERT INTO `_shlocaldept` (`id`, `OSTEXT_30`, `OSHORT`, `OSTEXT`, `base`, `inCare`, `remark`, `flag`, `created_at`, `updated_at`, `updated_cname`) VALUES
(1, 'FAB7', '9T041500', '環安衛一部', '{\"202502\":{\"getIn\":[{\"10008048\":\"陳建良\"},{\"10114369\":\"洪于人\"}]},\"202503\":{\"getOut\":[],\"getIn\":[],\"keepGoing\":[]}}', '{\"202502\":[{\"10008048\":\"陳建良\"},{\"10114369\":\"洪于人\"}],\"202503\":[]}', '{\"memo\":[]}', 1, '2025-03-12 09:10:40', '2025-04-16 15:02:10', '陳建良'),
(2, 'FAB8', '9T523501', '乾蝕刻課', '{\"202503\":{\"getOut\":[],\"getIn\":[{\"11084472\":\"蕭惠旭\"}],\"keepGoing\":[]},\"202504\":{\"getIn\":[{\"14109582\":\"楊傑安\"},{\"10024025\":\"蔡政芳\"}]}}', '{\"202503\":[{\"11084472\":\"蕭惠旭\"}],\"202504\":[{\"14109582\":\"楊傑安\"},{\"10024025\":\"蔡政芳\"}]}', '{\"memo\":[]}', 1, '2025-03-12 10:26:45', '2025-04-15 13:24:37', '蕭惠旭'),
(3, 'FAB8', '9T522503', '設備保養課', '{\"202503\":{\"getOut\":[],\"getIn\":[{\"22009990\":\"多尼司\"},{\"10007486\":\"陳家儒\"}],\"keepGoing\":[]}}', '{\"202503\":[{\"22009990\":\"多尼司\"}]}', '{\"memo\":[]}', 1, '2025-03-12 10:26:45', '2025-04-15 13:24:37', '蕭惠旭'),
(4, 'FAB8', '9T521501', '塗佈課', '{\"202503\":{\"getOut\":[],\"getIn\":[{\"16019033\":\"林峻宏\"}],\"keepGoing\":[]}}', '{\"202503\":[{\"16019033\":\"林峻宏\"}]}', '{\"memo\":[]}', 1, '2025-03-12 10:26:45', '2025-04-15 13:24:37', '蕭惠旭'),
(16, 'FAB7', '9T422502', '物理濺鍍課', '{\"202504\":{\"getOut\":[],\"getIn\":[{\"22000041\":\"陳邵軒\"},{\"21016175\":\"黃政諺\"},{\"21007945\":\"高建勝\"},{\"20031642\":\"林育聖\"},{\"20013950\":\"黃上維\"},{\"18007129\":\"王俊閔\"},{\"18007126\":\"周俊達\"},{\"17008760\":\"鄭凱文\"},{\"13099973\":\"姜秉辰\"},{\"12107938\":\"蔡榮?\"},{\"11106399\":\"薛鈺錠\"},{\"11106370\":\"邱垂青\"},{\"11053787\":\"李振豪\"},{\"11006112\":\"黃盟夫\"},{\"10025143\":\"吳丞燿\"},{\"10024454\":\"郭信亨\"},{\"10014088\":\"陳伯豪\"},{\"10012582\":\"施明豐\"},{\"10010554\":\"葉昌謀\"},{\"10010544\":\"陳勁志\"},{\"10010512\":\"蘇彥鳴\"},{\"10007480\":\"吳冠慶\"},{\"10007286\":\"張銘修\"},{\"10006556\":\"葉耀文\"},{\"10004330\":\"蕭駿豪\"},{\"10003848\":\"江俊昌\"}],\"keepGoing\":[]}}', '{\"202504\":[{\"11106399\":\"薛鈺錠\"},{\"11053787\":\"李振豪\"}]}', '{\"memo\":[]}', 1, '2025-04-14 14:14:41', '2025-04-14 14:43:32', '李品萱'),
(18, 'FAB8', '9T533501', '製造課', '{\"202504\":{\"getOut\":[],\"getIn\":[{\"10003390\":\"張春敏\"}],\"keepGoing\":[]}}', '{\"202504\":[{\"10003390\":\"張春敏\"}]}', '{\"memo\":[]}', 1, '2025-04-15 13:11:13', '2025-04-15 13:24:37', '蕭惠旭'),
(19, 'FAB8', '9T952501', '空調課', '{\"202504\":{\"getOut\":[],\"getIn\":[{\"10004533\":\"林玉濱\"}],\"keepGoing\":[]}}', '{\"202504\":[{\"10004533\":\"林玉濱\"}]}', '{\"memo\":[]}', 1, '2025-04-15 13:11:13', '2025-04-15 13:24:37', '蕭惠旭'),
(20, 'FAB8', '9T512501', '薄膜課', '{\"202504\":{\"getOut\":[],\"getIn\":[{\"15070072\":\"林正堂\"}],\"keepGoing\":[]}}', '{\"202504\":[{\"15070072\":\"林正堂\"}]}', '{\"memo\":[]}', 1, '2025-04-15 13:11:13', '2025-04-15 13:24:37', '蕭惠旭');

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
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'AID', AUTO_INCREMENT=34;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
