-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-12-27 09:25:22
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
-- 資料表結構 `autolog`
--

CREATE TABLE `autolog` (
  `id` int(10) NOT NULL COMMENT 'aid',
  `thisDay` varchar(10) NOT NULL COMMENT 'Log日期',
  `sys` varchar(50) NOT NULL COMMENT '系統名稱',
  `logs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '記錄事項',
  `t_stamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '記錄時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- 資料表結構 `_document`
--

CREATE TABLE `_document` (
  `id` int(10) NOT NULL COMMENT 'aid',
  `uuid` varchar(100) NOT NULL COMMENT '系統uuid：年度記錄+部門代號OSHORT+廠區名稱',
  `age` varchar(10) DEFAULT NULL,
  `dept_no` varchar(10) DEFAULT NULL COMMENT '部門代號',
  `emp_dept` varchar(50) DEFAULT NULL COMMENT '部門名稱',
  `sub_scope` varchar(50) DEFAULT NULL COMMENT '人事子範圍',
  `check_list` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '健檢名單JSON',
  `omager` varchar(10) NOT NULL COMMENT '部門主管工號',
  `in_sign` varchar(10) DEFAULT NULL COMMENT '待簽人員ID',
  `in_signName` varchar(10) DEFAULT NULL COMMENT '待簽人員姓名',
  `idty` varchar(5) NOT NULL COMMENT '表單狀態STEP',
  `flow` varchar(50) DEFAULT NULL COMMENT 'approval_steps/步驟名稱',
  `flow_remark` varchar(50) DEFAULT NULL COMMENT 'remark/節點說明',
  `_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'command內容JSON',
  `created_emp_id` varchar(10) NOT NULL COMMENT '開單工號',
  `created_cname` varchar(10) NOT NULL COMMENT '開單姓名',
  `created_at` datetime NOT NULL COMMENT '建檔時間',
  `updated_cname` varchar(10) NOT NULL COMMENT '更新人員',
  `updated_at` datetime NOT NULL COMMENT '更新時間',
  `logs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Logs' CHECK (json_valid(`logs`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `_document`
--

INSERT INTO `_document` (`id`, `uuid`, `age`, `dept_no`, `emp_dept`, `sub_scope`, `check_list`, `omager`, `in_sign`, `in_signName`, `idty`, `flow`, `flow_remark`, `_content`, `created_emp_id`, `created_cname`, `created_at`, `updated_cname`, `updated_at`, `logs`) VALUES
(1, '2024,9T041500,南科管理大樓', '2024', '9T041500', '環安衛一部', '南科管理大樓', '[\"10008048\",\"10114369\"]', '10010721', '10010721', '陳飛良', '4', '各站點審核', '上層主管,單位窗口,護理師', '[]', '10008048', '陳建良', '2024-12-25 15:09:46', '陳建良', '2024-12-25 15:09:46', '[{\"step\":\"step\",\"cname\":\"陳建良 (10008048)\",\"datetime\":\"2024-12-25 15:09:46\",\"action\":\"送出 (Submit)\",\"remark\":\"sign_comm\"}]'),
(2, '2024,9T041502,FAB 7', '2024', '9T041502', '工安衛二課', 'FAB 7', '[\"10019391\"]', '10009068', '10009068', '郭淑玲', '4', '各站點審核', '上層主管,單位窗口,護理師', '[]', '10008048', '陳建良', '2024-12-27 16:11:31', '陳建良', '2024-12-27 16:11:31', '[{\"step\":\"名單送審\",\"cname\":\"陳建良 (10008048)\",\"datetime\":\"2024-12-27 16:11:31\",\"action\":\"送出 (Submit)\",\"remark\":\"sign_comm\"}]');

-- --------------------------------------------------------

--
-- 資料表結構 `_fab`
--

CREATE TABLE `_fab` (
  `id` int(10) UNSIGNED NOT NULL COMMENT 'ai',
  `site_id` int(10) NOT NULL COMMENT '歸屬site',
  `fab_title` varchar(20) NOT NULL COMMENT 'fab名稱',
  `fab_remark` varchar(255) NOT NULL COMMENT 'fab備註',
  `osha_id` varchar(15) NOT NULL COMMENT '職安署事業單位編號',
  `flag` varchar(3) NOT NULL COMMENT '開關',
  `sign_code` varchar(10) NOT NULL COMMENT '管理權責(部課)',
  `pm_emp_id` varchar(255) DEFAULT NULL COMMENT '轄區管理員',
  `created_at` datetime NOT NULL COMMENT '創建日期',
  `updated_at` datetime NOT NULL COMMENT '更新日期',
  `updated_user` varchar(10) NOT NULL COMMENT '建檔人員'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `_fab`
--

INSERT INTO `_fab` (`id`, `site_id`, `fab_title`, `fab_remark`, `osha_id`, `flag`, `sign_code`, `pm_emp_id`, `created_at`, `updated_at`, `updated_user`) VALUES
(1, 1, 'tnESH', '台南環安處', '128002250000', 'Off', '9T040500', '10008048,陳建良', '2023-07-03 14:30:51', '2024-08-05 16:37:55', '陳建良'),
(2, 1, 'FAB1棟', '一廠', '128002250025', 'On', '9T041501', '10008048,陳建良', '2023-07-04 15:11:08', '2024-08-06 16:03:45', '陳建良'),
(3, 1, 'FAB2棟', '二廠', '128002250005', 'On', '9T043501', '', '2023-07-04 15:11:30', '2024-08-05 16:38:06', '陳建良'),
(4, 1, 'FAB3棟', '三廠', '128002250005', 'On', '9T043501', '', '2023-07-04 15:11:59', '2024-08-05 16:38:10', '陳建良'),
(5, 1, 'TAC棟', '四廠', '128002250026', 'On', '9T042501', '', '2023-07-04 15:12:32', '2024-08-05 16:38:15', '陳建良'),
(6, 1, 'FAB5棟', '五廠', '128002250005', 'On', '9T043502', '', '2023-07-04 15:12:52', '2024-08-05 16:38:20', '陳建良'),
(7, 1, 'FAB6棟', '六廠', '131116120003', 'On', '9T044501', NULL, '2023-07-04 15:13:11', '2023-10-26 13:54:28', '陳建良'),
(8, 1, 'FAB7棟', '七廠', '128002250026', 'On', '9T041502', '', '2023-07-04 15:13:30', '2024-03-29 11:00:48', '陳建良'),
(9, 1, 'FAB8棟', '八廠', '128002250015', 'On', '9T044502', NULL, '2023-07-04 15:14:07', '2023-10-26 13:54:18', '陳建良'),
(10, 1, 'LCM棟', 'C廠區', '128002250029', 'On', '9T042502', '', '2023-07-04 15:14:29', '2023-12-19 11:14:31', '陳建良'),
(11, 1, 'TOC棟', 'TOC', '128002250026', 'On', '9T042501', '', '2023-07-04 15:15:35', '2024-03-29 11:00:42', '陳建良'),
(12, 1, 'K9棟', '科九', '128002250034', 'On', '9T042501', '', '2023-07-04 15:16:11', '2024-03-29 11:00:31', '陳建良'),
(13, 1, 'T6', 'T6', '128002250031', 'On', '9T044502', '', '2024-06-21 15:31:18', '2024-08-06 16:15:42', '陳建良'),
(14, 1, 'TS1', '先進封裝廠', '128002250030', 'On', '9T041501', '', '2024-06-21 15:33:09', '2024-08-06 16:15:54', '陳建良'),
(16, 2, 'HQ棟', '企業總部', '', 'On', '8N051501', '', '2024-06-21 15:31:18', '2024-08-05 16:37:35', '陳建良'),
(17, 2, 'JOC棟', '企業總部', '', 'On', '8N051501', '', '2024-06-21 15:33:09', '2024-08-05 16:37:29', '陳建良'),
(18, 2, 'T3棟', '企業總部', '', 'On', '8N051501', '', '2024-06-21 15:34:38', '2024-08-05 16:37:15', '陳建良');

-- --------------------------------------------------------

--
-- 資料表結構 `_local`
--

CREATE TABLE `_local` (
  `id` int(10) UNSIGNED NOT NULL COMMENT 'ai',
  `fab_id` int(10) UNSIGNED NOT NULL COMMENT '歸屬Fab',
  `local_title` varchar(50) NOT NULL COMMENT '子區域名稱',
  `local_remark` varchar(50) NOT NULL COMMENT '子區域註解',
  `low_level` varchar(50) DEFAULT NULL COMMENT '安全水位',
  `flag` varchar(5) NOT NULL COMMENT '開關',
  `created_at` datetime NOT NULL COMMENT '創建時間',
  `updated_at` datetime NOT NULL COMMENT '更新時間',
  `updated_user` varchar(10) NOT NULL COMMENT '建檔人員'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `_local`
--

INSERT INTO `_local` (`id`, `fab_id`, `local_title`, `local_remark`, `low_level`, `flag`, `created_at`, `updated_at`, `updated_user`) VALUES
(1, 2, 'Array-1', 'Array-1', NULL, 'On', '2024-05-06 09:24:28', '2024-05-06 09:24:28', '陳建良'),
(2, 2, 'CF-1', 'CF-1', NULL, 'On', '2024-05-06 09:24:52', '2024-05-06 09:24:52', '陳建良'),
(3, 2, 'Cell(LCD)-1', 'Cell(LCD)-1', NULL, 'On', '2024-05-06 09:27:47', '2024-05-06 09:27:47', '陳建良'),
(4, 2, 'TS1廠', 'TS1廠', NULL, 'On', '2024-05-06 09:28:21', '2024-05-06 09:28:21', '陳建良'),
(5, 2, '儲運管理WH-1', '儲運管理WH-1', NULL, 'On', '2024-05-06 09:29:09', '2024-05-06 09:29:09', '陳建良'),
(6, 2, '其他Other-1', '其他Other-1', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(7, 2, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 09:30:18', '2024-05-06 09:30:18', '陳建良'),
(8, 2, '整合INT-1', '整合INT-1', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(9, 2, '環安衛ESH', '環安衛ESH', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 13:38:50', '陳建良'),
(10, 2, '總務GA', '總務GA', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(11, 2, '自動化AT(MAHS)-1', '自動化AT(MAHS)-1', NULL, 'On', '2024-05-06 09:32:47', '2024-05-06 09:32:47', '陳建良'),
(12, 3, 'Array-2', 'Array-2', NULL, 'On', '2024-05-06 09:56:49', '2024-05-06 09:56:49', '陳建良'),
(13, 3, 'CF/Cell(LCD)-2', 'CF/Cell(LCD)-2', NULL, 'On', '2024-05-06 09:57:17', '2024-05-06 09:57:17', '陳建良'),
(14, 3, 'TN-XRay廠', 'TN-XRay廠', NULL, 'On', '2024-05-06 10:50:38', '2024-05-06 10:50:38', '陳建良'),
(15, 3, 'TN-XR其他Other', 'TN-XR其他Other', NULL, 'On', '2024-05-06 10:55:48', '2024-05-06 10:55:48', '陳建良'),
(16, 3, '儲運管理WH-2', '儲運管理WH-2', NULL, 'On', '2024-05-06 11:00:30', '2024-05-06 11:00:30', '陳建良'),
(17, 3, '其他Other-2', '其他Other-2', NULL, 'On', '2024-05-06 11:12:25', '2024-05-06 11:12:25', '陳建良'),
(18, 3, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 11:12:52', '2024-05-06 11:12:52', '陳建良'),
(19, 3, '整合INT-2', '整合INT-2', NULL, 'On', '2024-05-06 11:13:12', '2024-05-06 11:13:12', '陳建良'),
(20, 3, '環安衛ESH', '環安衛ESH', NULL, 'On', '2024-05-06 11:13:29', '2024-05-06 11:13:29', '陳建良'),
(21, 3, '總務GA', '總務GA', NULL, 'On', '2024-05-06 11:13:55', '2024-05-06 11:13:55', '陳建良'),
(22, 3, '自動化AT(MAHS)-2', '自動化AT(MAHS)-2', NULL, 'On', '2024-05-06 11:14:16', '2024-05-06 11:14:16', '陳建良'),
(23, 4, 'Array-3', 'Array-3', NULL, 'On', '2024-05-06 09:24:28', '2024-05-06 09:24:28', '陳建良'),
(24, 4, 'CF-3', 'CF-3', NULL, 'On', '2024-05-06 09:24:52', '2024-05-06 09:24:52', '陳建良'),
(25, 4, 'Cell(LCD)-3', 'Cell(LCD)-3', NULL, 'On', '2024-05-06 09:27:47', '2024-05-06 09:27:47', '陳建良'),
(26, 4, '儲運管理WH-3', '儲運管理WH-3', NULL, 'On', '2024-05-06 09:29:09', '2024-05-06 09:29:09', '陳建良'),
(27, 4, '其他Other-3', '其他Other-3', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(28, 4, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 09:30:18', '2024-05-06 09:30:18', '陳建良'),
(29, 4, '整合INT-3', '整合INT-3', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(30, 4, '環安衛ESH', '環安衛ESH', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(31, 4, '總務GA', '總務GA', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(32, 4, '自動化AT(MAHS)-3', '自動化AT(MAHS)-3', NULL, 'On', '2024-05-06 09:32:47', '2024-05-06 09:32:47', '陳建良'),
(33, 5, 'HR人資', 'HR人資', NULL, 'On', '2024-05-06 09:28:21', '2024-05-06 09:28:21', '陳建良'),
(34, 5, '儲運管理WH-4', '儲運管理WH-4', NULL, 'On', '2024-05-06 09:29:09', '2024-05-06 09:29:09', '陳建良'),
(35, 5, '其他Other-4', '其他Other-4', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(36, 5, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 09:30:18', '2024-05-06 09:30:18', '陳建良'),
(37, 5, '環安衛ESH', '環安衛ESH', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(38, 5, '總務GA', '總務GA', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(39, 6, 'Array-5', 'Array-5', NULL, 'On', '2024-05-06 09:24:28', '2024-05-06 09:24:28', '陳建良'),
(40, 6, 'CF-5', 'CF-5', NULL, 'On', '2024-05-06 09:24:52', '2024-05-06 09:24:52', '陳建良'),
(41, 6, 'Cell(LCD)-5', 'Cell(LCD)-5', NULL, 'On', '2024-05-06 09:27:47', '2024-05-06 09:27:47', '陳建良'),
(42, 6, '儲運管理WH-5', '儲運管理WH-5', NULL, 'On', '2024-05-06 09:29:09', '2024-05-06 09:29:09', '陳建良'),
(43, 6, '其他Other-5', '其他Other-5', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(44, 6, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 09:30:18', '2024-05-06 09:30:18', '陳建良'),
(45, 6, '整合INT-5', '整合INT-5', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(46, 6, '環安衛ESH', '環安衛ESH', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(47, 6, '總務GA', '總務GA', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(48, 6, '自動化AT(MAHS)-5', '自動化AT(MAHS)-5', NULL, 'On', '2024-05-06 09:32:47', '2024-05-06 09:32:47', '陳建良'),
(49, 7, 'Array-6', 'Array-6', NULL, 'On', '2024-05-06 09:24:28', '2024-05-06 09:24:28', '陳建良'),
(50, 7, 'CF-6', 'CF-6', NULL, 'On', '2024-05-06 09:24:52', '2024-05-06 09:24:52', '陳建良'),
(51, 7, 'Cell(LCD)-6', 'Cell(LCD)-6', NULL, 'On', '2024-05-06 09:27:47', '2024-05-06 09:27:47', '陳建良'),
(52, 7, '儲運管理WH-6', '儲運管理WH-6', NULL, 'On', '2024-05-06 09:29:09', '2024-05-06 09:29:09', '陳建良'),
(53, 7, '其他Other-6', '其他Other-6', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(54, 7, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 09:30:18', '2024-05-06 09:30:18', '陳建良'),
(55, 7, '整合INT-6', '整合INT-6', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(56, 7, '環安衛ESH', '環安衛ESH', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(57, 7, '總務GA', '總務GA', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(58, 7, '自動化AT(MAHS)-6', '自動化AT(MAHS)-6', NULL, 'On', '2024-05-06 09:32:47', '2024-05-06 09:32:47', '陳建良'),
(59, 8, 'Array/CF-7', 'Array/CF-7', NULL, 'On', '2024-05-06 09:24:52', '2024-05-06 09:24:52', '陳建良'),
(60, 8, 'Cell(LCD)-7', 'Cell(LCD)-7', NULL, 'On', '2024-05-06 09:27:47', '2024-05-06 09:27:47', '陳建良'),
(61, 8, '儲運管理WH-7', '儲運管理WH-7', NULL, 'On', '2024-05-06 09:29:09', '2024-05-06 09:29:09', '陳建良'),
(62, 8, '其他Other-7', '其他Other-7', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(63, 8, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 09:30:18', '2024-05-06 09:30:18', '陳建良'),
(64, 8, '整合INT-7', '整合INT-7', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(65, 8, '環安衛ESH', '環安衛ESH', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(66, 8, '總務GA', '總務GA', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(67, 8, '自動化AT(MAHS)-7', '自動化AT(MAHS)-7', NULL, 'On', '2024-05-06 09:32:47', '2024-05-06 09:32:47', '陳建良'),
(68, 9, 'Array-8A', 'Array-8A', NULL, 'On', '2024-05-06 09:24:28', '2024-05-06 09:24:28', '陳建良'),
(69, 9, 'CF-8', 'CF-8', NULL, 'On', '2024-05-06 09:24:52', '2024-05-06 09:24:52', '陳建良'),
(70, 9, 'Cell(LCD)-8', 'Cell(LCD)-8', NULL, 'On', '2024-05-06 09:27:47', '2024-05-06 09:27:47', '陳建良'),
(71, 13, 'T6-Array/CF', 'T6-Array/CF', NULL, 'On', '2024-05-06 09:24:52', '2024-10-22 08:41:55', '陳建良'),
(72, 13, 'T6-Cell(LCD)', 'T6-Cell(LCD)', NULL, 'On', '2024-05-06 09:27:47', '2024-10-22 08:42:05', '陳建良'),
(73, 13, 'T6-其他Other', 'T6-其他Other', NULL, 'On', '2024-05-06 09:29:56', '2024-10-22 08:42:15', '陳建良'),
(74, 13, 'T6-整合INT', 'T6-整合INT', NULL, 'On', '2024-05-06 09:30:46', '2024-10-22 08:42:25', '陳建良'),
(75, 13, 'T6-自動化AT(MAHS)', 'T6-自動化AT(MAHS)', NULL, 'On', '2024-05-06 09:32:47', '2024-10-22 08:42:37', '陳建良'),
(76, 9, '儲運管理WH-8', '儲運管理WH-8', NULL, 'On', '2024-05-06 09:29:09', '2024-05-06 09:29:09', '陳建良'),
(77, 9, '其他Other-8', '其他Other-8', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(78, 9, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 09:30:18', '2024-05-06 09:30:18', '陳建良'),
(79, 9, '整合INT-8', '整合INT-8', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(80, 9, '環安衛ESH', '環安衛ESH', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(81, 9, '總務GA', '總務GA', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(82, 9, '自動化AT(MAHS)-8', '自動化AT(MAHS)-8', NULL, 'On', '2024-05-06 09:32:47', '2024-05-06 09:32:47', '陳建良'),
(83, 12, 'K9-MOD廠', 'K9-MOD廠', NULL, 'On', '2024-05-06 09:29:09', '2024-05-06 09:29:09', '陳建良'),
(84, 12, 'K9-其他Other', 'K9-其他Other', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(85, 12, 'K9-自動化AT(MAHS)', 'K9-自動化AT(MAHS)', NULL, 'On', '2024-05-06 09:32:47', '2024-05-06 09:32:47', '陳建良'),
(86, 12, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 09:30:18', '2024-05-06 09:30:18', '陳建良'),
(87, 12, '總務GA', '總務GA', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(88, 10, 'CG-其他Other', 'CG-其他Other', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(89, 10, 'CG-自動化AT(MAHS)', 'CG-自動化AT(MAHS)', NULL, 'On', '2024-05-06 09:32:47', '2024-05-06 09:32:47', '陳建良'),
(90, 10, 'CG-製造廠', 'CG-製造廠', NULL, 'On', '2024-05-06 09:29:09', '2024-05-06 09:29:09', '陳建良'),
(91, 10, 'LCDU', 'LCDU', NULL, 'On', '2024-05-06 09:24:52', '2024-05-06 09:24:52', '陳建良'),
(92, 10, 'MOD3', 'MOD3', NULL, 'On', '2024-05-06 09:27:47', '2024-05-06 09:27:47', '陳建良'),
(93, 10, 'TN-CarMOD廠', 'TN-CarMOD廠', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(94, 10, 'TN-Car其他Other', 'TN-Car其他Other', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(95, 10, '其他Other-C', '其他Other-C', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(96, 10, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 09:30:18', '2024-05-06 09:30:18', '陳建良'),
(97, 10, '整合INT-C', '整合INT-C', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(98, 10, '環安衛ESH', '環安衛ESH', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(99, 10, '總務GA', '總務GA', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(100, 10, '自動化AT(MAHS)-C', '自動化AT(MAHS)-C', NULL, 'On', '2024-05-06 09:32:47', '2024-05-06 09:32:47', '陳建良'),
(101, 11, 'BLC', 'BLC', NULL, 'On', '2024-05-06 09:24:52', '2024-05-06 09:24:52', '陳建良'),
(102, 11, 'Cell(LCD)-6', 'Cell(LCD)-6', NULL, 'On', '2024-05-06 09:27:47', '2024-05-06 09:27:47', '陳建良'),
(103, 11, 'MOD-儲運管理WH', 'MOD-儲運管理WH', NULL, 'On', '2024-05-06 09:29:09', '2024-05-06 09:29:09', '陳建良'),
(104, 11, 'MOD-其他Other', 'MOD-其他Other', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(105, 11, 'MOD-整合INT', 'MOD-整合INT', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(106, 11, 'MOD1', 'MOD1', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(107, 11, 'MOD3', 'MOD3', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(108, 11, 'SGCux-辦公室Office', 'SGCux-辦公室Office', NULL, 'On', '2024-05-06 09:29:56', '2024-05-06 09:29:56', '陳建良'),
(109, 11, 'TV-Car品質管理QS', 'TV-Car品質管理QS', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(110, 11, 'TV-辦公室Office', 'TV-辦公室Office', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(111, 11, '品管-辦公室Office', '品管-辦公室Office', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(112, 11, '廠務FAC(CE)', '廠務FAC(CE)', NULL, 'On', '2024-05-06 09:30:18', '2024-05-06 09:30:18', '陳建良'),
(113, 11, '整合-辦公室Office', '整合-辦公室Office', NULL, 'On', '2024-05-06 09:30:46', '2024-05-06 09:30:46', '陳建良'),
(114, 11, '環安衛ESH', '環安衛ESH', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(115, 11, '研發-辦公室Office', '研發-辦公室Office', NULL, 'On', '2024-05-06 09:31:12', '2024-05-06 09:31:12', '陳建良'),
(116, 11, '總務GA', '總務GA', NULL, 'On', '2024-05-06 09:31:33', '2024-05-06 09:31:33', '陳建良'),
(117, 11, '自動化-辦公室Office', '自動化-辦公室Office', NULL, 'On', '2024-05-06 09:32:47', '2024-05-06 09:32:47', '陳建良'),
(118, 11, '自動化AT(MAHS)-6', '自動化AT(MAHS)-6', NULL, 'On', '2024-05-06 09:24:28', '2024-05-06 09:24:28', '陳建良');

-- --------------------------------------------------------

--
-- 資料表結構 `_shlocal`
--

CREATE TABLE `_shlocal` (
  `id` int(10) NOT NULL COMMENT 'AID',
  `OSTEXT_30` varchar(20) NOT NULL COMMENT '廠區',
  `OSHORT` varchar(10) NOT NULL COMMENT '部門代碼',
  `OSTEXT` varchar(20) NOT NULL COMMENT '部門名稱',
  `HE_CATE` varchar(255) NOT NULL COMMENT '預防職業病健康檢查類別/代碼',
  `AVG_VOL` varchar(10) DEFAULT NULL COMMENT '均能音量',
  `AVG_8HR` varchar(10) DEFAULT NULL COMMENT '工作日8小時平均音壓值',
  `MONIT_NO` varchar(20) DEFAULT NULL COMMENT '監測編號',
  `MONIT_LOCAL` varchar(10) DEFAULT NULL COMMENT '監測處所(10)',
  `WORK_DESC` varchar(20) NOT NULL COMMENT '作業描述(20)',
  `flag` varchar(5) NOT NULL COMMENT '開關',
  `created_at` datetime NOT NULL COMMENT '創建時間',
  `updated_at` datetime NOT NULL COMMENT '更新時間',
  `updated_cname` varchar(10) NOT NULL COMMENT '更新人員cname'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `_shlocal`
--

INSERT INTO `_shlocal` (`id`, `OSTEXT_30`, `OSHORT`, `OSTEXT`, `HE_CATE`, `AVG_VOL`, `AVG_8HR`, `MONIT_NO`, `MONIT_LOCAL`, `WORK_DESC`, `flag`, `created_at`, `updated_at`, `updated_cname`) VALUES
(1, 'FAB8', '9T511501', '黃光一課', '{\"03\":\"游離輻射\"}', '', '', NULL, NULL, '曝光機/塗佈機維修', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(2, 'FAB8', '9T511502', '黃光二課', '{\"03\":\"游離輻射\"}', '', '', NULL, NULL, '曝光機/塗佈機維修', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(3, 'FAB8', '9T512501', '薄膜課', '{\"02\":\"噪音\"}', '98.3', '', 'CN-05', 'CF8L30E54', 'ITSP異常排除維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(4, 'FAB8', '9T521501', '塗佈課', '{\"03\":\"游離輻射\"}', '', '', NULL, NULL, 'TLCD設備保養維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(5, 'FAB8', '9T521502', '曝光課', '{\"03\":\"游離輻射\"}', '', '', NULL, NULL, '曝光機設備保養維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(6, 'FAB8', '9T522502', '物理濺鍍課', '{\"02\":\"噪音\",\"31\":\"銦\"}', '102.0', '', 'CN-01', '8BL50L4042', '化學沉積機台尾氣處理設備維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(7, 'FAB8', '9T522503', '設備保養課', '{\"02\":\"噪音\",\"31\":\"銦\"}', '101.2', '', 'CN-01', '8BL50K40', 'CVD(化學沉積機台)設備保養維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(8, 'FAB8', '9T522503', '設備保養課', '{\"02\":\"噪音\",\"31\":\"銦\"}', '', '94.7', 'CD-01', 'Arr8L10F30', '化學沉積機台尾氣處理設備維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(9, 'FAB8', '9T522503', '設備保養課', '{\"02\":\"噪音\",\"31\":\"銦\"}', '102.0', '', 'CN-01', '8BL50L4042', '化學沉積機台尾氣處理設備維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(10, 'FAB8', '9T523502', '濕蝕刻課', '{\"03\":\"游離輻射\"}', '', '', NULL, NULL, '總硫總酸分析儀保管人員', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(11, 'FAB8', '9T523501', '乾蝕刻課', '{\"02\":\"噪音\"}', '98.5', '', 'CN-01', 'Arr8L10B20', 'DRYT(乾蝕刻機)設備保養維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(12, 'FAB8', '9T523503', '設備保養課', '{\"02\":\"噪音\"}', '98.5', '', 'CN-01', 'Arr8L10B20', 'DRYT(乾蝕刻機)設備保養維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(13, 'FAB8', '9T523501', '乾蝕刻課', '{\"02\":\"噪音\"}', '102.4', '', 'CN-01', '8BL50I28', 'SCBD(乾蝕刻用洗滌設備)保養維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(14, 'FAB8', '9T523503', '設備保養課', '{\"02\":\"噪音\"}', '102.4', '', 'CN-01', '8BL50I28', 'SCBD(乾蝕刻用洗滌設備)保養維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(15, 'FAB8', '9T523503', '設備保養課', '{\"02\":\"噪音\"}', '', '93.3', 'CD-01', '8B L50', 'SCBD(乾蝕刻用洗滌設備)保養維修作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(16, 'FAB8', '9T533501', '製造課', '{\"26\":\"鎳\"}', '', '', 'FM235', 'LCD8L60E32', '調膠作業', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(17, 'FAB8', '9T952501', '空調課', '{\"02\":\"噪音\"}', '91.1', '', 'CN-03', 'FAC8CUBL30', '空壓機房巡檢抄表設備操作', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(18, 'FAB8', '9T953500', '水氣八部', '{\"02\":\"噪音\"}', '94.0', '', 'CN-05', 'FAC8WWTL10', '鼓風機段設備保養查修巡檢', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(19, 'FAB8', '9T953501', '水務課', '{\"02\":\"噪音\"}', '94.0', '', 'CN-05', 'FAC8WWTL10', '鼓風機段設備保養查修巡檢', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(20, 'TOC', '9J333501', '製造一課', '{\"26\":\"鎳\"}', '', '', 'AO1', 'M1三樓玻璃膠著區', 'BONDING(玻璃膠著)區做含鎳膠補料', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(21, 'TOC', '9J052503', '製造課', '{\"26\":\"鎳\"}', '', '', 'AD100', 'M34樓玻璃膠著區', 'BONDING(玻璃膠著區)做鎳膠更換', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(22, 'T6', '9K113504', '設備保養課', '{\"31\":\"銦\"}', '', '', 'AB135', '1Array濺鍍熱區', '保養Array(陣列製程)氧化銦錫設備', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(23, 'T6', '9K113505', '設備保養課', '{\"31\":\"銦\"}', '', '', 'AB136', '4Array濺鍍熱區', '保養Array(陣列製程)氧化銦錫設備', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(24, 'T6', '9K113506', '設備保養課', '{\"31\":\"銦\"}', '', '', 'AB137', '2Array濺鍍暖區', '保養Array(陣列製程)氧化銦錫設備', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(25, 'T6', '9K113507', '設備保養課', '{\"31\":\"銦\"}', '', '', 'AB138', '3Array濺鍍冷區', '保養Array(陣列製程)氧化銦錫設備', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(26, 'T6', '9K113508', '設備保養課', '{\"31\":\"銦\"}', '', '', 'AB139', '5Array濺鍍除污', '保養Array(陣列製程)氧化銦錫設備', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(27, 'T6', '9K111503', '設備保養課', '{\"26\":\"鎳\"}', '', '', 'AD700', 'CFCT01', '換CFCT(彩色濾光片製程)含鎳光阻桶 ', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(28, 'T6', '9K111504', '黃光課', '{\"26\":\"鎳\"}', '', '', 'AD700', 'CFCT01', '換CFCT(彩色濾光片製程)含鎳光阻桶 ', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(29, 'T6', '9K113504', '設備保養課', '{\"02\":\"噪音\"}', '86.2', '', 'N4', 'Array化學氣相', '於噪音區執行設備研磨及粉塵清潔', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(30, 'T6', '9T951502', '水氣課', '{\"02\":\"噪音\"}', '92.9', '', 'N2', 'T6廠務水氣', 'FAC(廠務)鼓風機房(噪音區)巡查點檢', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(31, 'T6', '9K118503', '製造課', '{\"26\":\"鎳\"}', '', '', 'AD700', 'CFCT01', '換CFCT(彩色濾光片製程)含鎳光阻桶 ', 'On', '2024-08-29 12:48:16', '2024-08-29 12:48:16', '陳建良'),
(32, 'TAC棟', '9T041500', '環安衛一部', '{\"11\":\"二甲基甲醯胺\"}', '', '', 'C12345', 'Off1ce 1F', 'test chemical', 'On', '2024-08-29 13:05:24', '2024-08-29 13:05:24', '陳建良'),
(33, 'TAC棟', '9T041500', '環安衛一部', '{\"02\":\"噪音\"}', '96', '', 'C12345', 'Off1ce 1F', 'Noies-1', 'On', '2024-08-29 13:06:31', '2024-08-29 14:24:13', '陳建良'),
(34, 'TAC棟', '9T041500', '環安衛一部', '{\"31\":\"銦\"}', '', '87', 'C12346', 'Off 1F ERC', 'Noise-2+In', 'On', '2024-08-29 13:07:27', '2024-11-18 09:51:36', '陳建良'),
(35, 'TAC棟', '9T040500', '南科環安處', '{\"02\":\"噪音\"}', '90', '', 'C12344', 'Off1ce 1F', 'Noise-0', 'On', '2024-08-29 13:08:16', '2024-08-29 13:08:16', '陳建良'),
(36, 'FAB6棟', '9T321503', '設備保養課', '{\"31\":\"銦\"}', '', '', 'S25258', '1', '定期(銦),轉出', 'On', '2024-10-29 08:46:41', '2024-10-29 08:46:41', '陳建良'),
(37, 'FAB7棟', '9T041502', '工安衛二課', '{\"02\":\"噪音\"}', '92', '95', 'ERC&_01', 'ERC7', '日常作業', 'On', '2024-11-21 15:59:00', '2024-11-21 15:59:00', '陳建良'),
(38, 'FAB7棟', '9T041502', '工安衛一課', '{\"24\":\"重鉻酸\"}', '', '', '不適用', 'Off1ce 1F ', '日常作業', 'On', '2024-11-26 12:09:40', '2024-11-26 12:21:29', '陳建良');

-- --------------------------------------------------------

--
-- 資料表結構 `_site`
--

CREATE TABLE `_site` (
  `id` int(10) UNSIGNED NOT NULL COMMENT 'ai',
  `site_title` varchar(20) NOT NULL COMMENT 'site名稱',
  `site_remark` varchar(255) NOT NULL COMMENT 'site註解',
  `flag` varchar(3) NOT NULL COMMENT '開關',
  `created_at` datetime NOT NULL COMMENT '創建日期',
  `updated_at` datetime NOT NULL COMMENT '更新日期',
  `updated_user` varchar(10) NOT NULL COMMENT '建檔人員'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 傾印資料表的資料 `_site`
--

INSERT INTO `_site` (`id`, `site_title`, `site_remark`, `flag`, `created_at`, `updated_at`, `updated_user`) VALUES
(1, 'TN', '南科廠區', 'On', '2023-07-03 14:22:27', '2024-07-01 08:42:35', '陳建良'),
(2, 'JN', '竹南廠區', 'On', '2023-07-04 15:10:00', '2024-07-01 08:42:43', '陳建良');

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
(1, '22007335', '梅爾', '1', '菲律賓', '2022-04-26', '{\"2024\":{\"dept_no\":\"9K118503\",\"emp_dept\":\"CF製造課\",\"emp_sub_scope\":\"FAB 8\",\"schkztxt\":null,\"cstext\":null,\"emp_group\":null,\"shCase\":[{\"id\":27,\"OSTEXT_30\":\"T6\",\"OSHORT\":\"9K111503\",\"OSTEXT\":\"設備保養課\",\"HE_CATE\":{\"26\":\"鎳\"},\"AVG_VOL\":\"\",\"AVG_8HR\":\"\",\"MONIT_NO\":\"AD700\",\"MONIT_LOCAL\":\"CFCT01\",\"WORK_DESC\":\"換CFCT(彩色濾光片製程)含鎳光阻桶 \"},{\"id\":36,\"OSTEXT_30\":\"FAB6棟\",\"OSHORT\":\"9T321503\",\"OSTEXT\":\"設備保養課\",\"HE_CATE\":{\"31\":\"銦\"},\"AVG_VOL\":\"\",\"AVG_8HR\":\"\",\"MONIT_NO\":\"S25258\",\"MONIT_LOCAL\":\"1\",\"WORK_DESC\":\"定期(銦),轉出\"}],\"shCondition\":{\"newOne\":false,\"noise\":false,\"regular\":\"銦\",\"change\":\"鎳\"}}}', '{\"2024\":{\"import\":{\"yearHe\":\"26:鎳,31:銦\",\"yearCurrent\":\"定期(銦),轉出\"}}}', '2024-12-09 15:21:16', '陳建良', '2024-12-20 16:32:48', '陳建良'),
(2, '22007336', '喬亦', '1', '菲律賓', '2022-04-26', '{\"2024\":{\"dept_no\":\"9K118503\",\"emp_dept\":\"CF製造課\",\"emp_sub_scope\":\"FAB 8\",\"schkztxt\":null,\"cstext\":null,\"emp_group\":null,\"shCase\":[{\"id\":27,\"OSTEXT_30\":\"T6\",\"OSHORT\":\"9K111503\",\"OSTEXT\":\"設備保養課\",\"HE_CATE\":{\"26\":\"鎳\"},\"AVG_VOL\":\"\",\"AVG_8HR\":\"\",\"MONIT_NO\":\"AD700\",\"MONIT_LOCAL\":\"CFCT01\",\"WORK_DESC\":\"換CFCT(彩色濾光片製程)含鎳光阻桶 \"},{\"id\":36,\"OSTEXT_30\":\"FAB6棟\",\"OSHORT\":\"9T321503\",\"OSTEXT\":\"設備保養課\",\"HE_CATE\":{\"31\":\"銦\"},\"AVG_VOL\":\"\",\"AVG_8HR\":\"\",\"MONIT_NO\":\"S25258\",\"MONIT_LOCAL\":\"1\",\"WORK_DESC\":\"定期(銦),轉出\"}],\"shCondition\":{\"newOne\":false,\"noise\":false,\"regular\":\"銦\",\"change\":\"鎳\"}}}', '{\"2024\":{\"import\":{\"yearHe\":\"26:鎳,31:銦\",\"yearCurrent\":\"定期(銦),轉出\"}}}', '2024-12-09 15:21:16', '陳建良', '2024-12-20 16:32:48', '陳建良'),
(35, '10008048', '陳建良', '1', '台灣', '2010-03-18', '{\"2024\":{\"dept_no\":\"9T041500\",\"emp_dept\":\"環安衛一部\",\"emp_sub_scope\":\"南科管理大樓\",\"schkztxt\":\"常態班(GE)日班\",\"cstext\":\"主任工程師\",\"emp_group\":null,\"shCase\":[{\"id\":33,\"OSTEXT_30\":\"TAC棟\",\"OSHORT\":\"9T041500\",\"OSTEXT\":\"環安衛一部\",\"HE_CATE\":{\"02\":\"噪音\"},\"AVG_VOL\":\"96\",\"AVG_8HR\":\"\",\"MONIT_NO\":\"C12345\",\"MONIT_LOCAL\":\"Off1ce 1F\",\"WORK_DESC\":\"Noies-1\",\"eh_time\":2},{\"id\":34,\"OSTEXT_30\":\"TAC棟\",\"OSHORT\":\"9T041500\",\"OSTEXT\":\"環安衛一部\",\"HE_CATE\":{\"31\":\"銦\"},\"AVG_VOL\":\"\",\"AVG_8HR\":\"87\",\"MONIT_NO\":\"C12346\",\"MONIT_LOCAL\":\"Off 1F ERC\",\"WORK_DESC\":\"Noise-2+In\"}],\"shCondition\":{\"newOne\":false,\"noise\":true,\"regular\":\"銦;噪音\",\"change\":\"游離輻射\"}}}', '{\"2024\":{\"import\":{\"yearHe\":\"02:噪音,03:游離輻射\"}}}', '2024-12-11 14:31:19', '陳建良', '2024-12-25 13:58:11', '陳建良'),
(37, '10114369', '洪于人', '1', '台灣', '2010-07-01', '{\"2024\":{\"dept_no\":\"9T041500\",\"emp_dept\":\"環安衛一部\",\"emp_sub_scope\":\"南科管理大樓\",\"schkztxt\":\"常態班(GE)日班\",\"cstext\":\"高級工程師\",\"emp_group\":null,\"shCase\":[{\"id\":34,\"OSTEXT_30\":\"TAC棟\",\"OSHORT\":\"9T041500\",\"OSTEXT\":\"環安衛一部\",\"HE_CATE\":{\"31\":\"銦\"},\"AVG_VOL\":\"\",\"AVG_8HR\":\"87\",\"MONIT_NO\":\"C12346\",\"MONIT_LOCAL\":\"Off 1F ERC\",\"WORK_DESC\":\"Noise-2+In\"}],\"shCondition\":{\"newOne\":false,\"noise\":false,\"regular\":\"銦\",\"change\":\"\"}}}', '{\"2024\":{\"import\":{\"yearHe\":\"\"}}}', '2024-12-11 14:31:19', '陳建良', '2024-12-25 13:58:11', '陳建良'),
(133, '10019391', '馬吉謙', '1', '台灣', '2010-03-18', '{\"2024\":{\"dept_no\":\"9T041502\",\"emp_dept\":\"工安衛二課\",\"emp_sub_scope\":\"FAB 7\",\"schkztxt\":\"二二輪(22)夜B班\",\"cstext\":\"高級工程師\",\"emp_group\":null,\"shCase\":[{\"id\":37,\"OSTEXT_30\":\"FAB7棟\",\"OSHORT\":\"9T041502\",\"OSTEXT\":\"工安衛二課\",\"HE_CATE\":{\"02\":\"噪音\"},\"AVG_VOL\":\"92\",\"AVG_8HR\":\"95\",\"MONIT_NO\":\"ERC&_01\",\"MONIT_LOCAL\":\"ERC7\",\"WORK_DESC\":\"日常作業\",\"eh_time\":3}],\"shCondition\":{\"newOne\":false,\"noise\":true,\"regular\":\"噪音\",\"change\":\"游離輻射\"}}}', '{\"2024\":{\"import\":{\"yearHe\":\"02:噪音\"},\"memo\":[{\"cname\":\"馬吉謙\",\"emp_id\":\"10019391\",\"msg\":\"測試馬\",\"timeStamp\":\"2024\\/12\\/27 14:51:33\"},{\"cname\":\"陳建良\",\"emp_id\":\"10008048\",\"msg\":\"沒有message內容\",\"timeStamp\":\"2024\\/12\\/27 15:32:37\"}]}}', '2024-12-13 14:05:37', '陳建良', '2024-12-27 16:11:28', '陳建良'),
(157, '10010721', '陳飛良', '1', '台灣', '2010-03-18', '{\"2024\":{\"dept_no\":\"9T041500\",\"emp_dept\":\"環安衛一部\",\"emp_sub_scope\":\"FAB 7\",\"schkztxt\":\"常態班(GE)日班\",\"cstext\":\"經理\",\"emp_group\":null,\"shCase\":[{\"id\":32,\"OSTEXT_30\":\"TAC棟\",\"OSHORT\":\"9T041500\",\"OSTEXT\":\"環安衛一部\",\"HE_CATE\":{\"11\":\"二甲基甲醯胺\"},\"AVG_VOL\":\"\",\"AVG_8HR\":\"\",\"MONIT_NO\":\"C12345\",\"MONIT_LOCAL\":\"Off1ce 1F\",\"WORK_DESC\":\"test chemical\"}],\"shCondition\":{\"newOne\":false,\"noise\":false,\"regular\":\"二甲基甲醯胺\",\"change\":\"\"}}}', '{\"2024\":{\"import\":{\"yearHe\":\"11:二甲基甲醯胺\"}}}', '2024-12-20 16:22:56', '陳建良', '2024-12-23 13:53:28', '陳建良');

-- --------------------------------------------------------

--
-- 資料表結構 `_users`
--

CREATE TABLE `_users` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT 'ai',
  `emp_id` varchar(20) CHARACTER SET utf8mb4 NOT NULL COMMENT '工號',
  `user` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '帳號',
  `cname` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  `sign_code` varchar(20) CHARACTER SET utf8mb4 NOT NULL COMMENT '部門代號',
  `created_at` datetime DEFAULT NULL COMMENT '創建日期',
  `role` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT '1' COMMENT '權限',
  `idty` varchar(2) CHARACTER SET utf8mb4 DEFAULT '1' COMMENT '身份'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `_users`
--

INSERT INTO `_users` (`id`, `emp_id`, `user`, `cname`, `sign_code`, `created_at`, `role`, `idty`) VALUES
(0, '90000000', 'admin', 'invest管理員', '9T040500', '2022-08-17 09:39:31', '0', '1'),
(1, '90000001', 'susu', 'invest測試1', '9T041500', '2022-09-01 12:46:49', '1', '1'),
(2, '90000002', 'micro', 'invest測試2', '9T040500', '2022-12-07 15:14:40', '2', '1'),
(3, '10008048', 'LEONG.CHEN', '陳建良', '9T041500', '2023-12-28 17:15:02', '1', '1'),
(4, '11084472', 'HUIHSU.HSIAO', '蕭惠旭', '9T044502', '2024-08-29 08:27:19', '1', '1'),
(5, '10114369', 'YUJEN.HONG', '洪于人', '9T041500', '2024-08-29 08:36:25', '1', '1'),
(6, '10010721', 'ASKA.CHEN', '陳飛良', '9T041500', '2024-08-29 08:36:38', '1', '3');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `autolog`
--
ALTER TABLE `autolog`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `_document`
--
ALTER TABLE `_document`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`) USING BTREE;

--
-- 資料表索引 `_fab`
--
ALTER TABLE `_fab`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `_local`
--
ALTER TABLE `_local`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `_shlocal`
--
ALTER TABLE `_shlocal`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `_site`
--
ALTER TABLE `_site`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `_staff`
--
ALTER TABLE `_staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `emp_id` (`emp_id`);

--
-- 資料表索引 `_users`
--
ALTER TABLE `_users`
  ADD PRIMARY KEY (`id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `autolog`
--
ALTER TABLE `autolog`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'aid';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_document`
--
ALTER TABLE `_document`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'aid', AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_fab`
--
ALTER TABLE `_fab`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ai', AUTO_INCREMENT=19;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_local`
--
ALTER TABLE `_local`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ai', AUTO_INCREMENT=119;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_shlocal`
--
ALTER TABLE `_shlocal`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'AID', AUTO_INCREMENT=39;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_site`
--
ALTER TABLE `_site`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ai', AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_staff`
--
ALTER TABLE `_staff`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'aid', AUTO_INCREMENT=196;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `_users`
--
ALTER TABLE `_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ai', AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
