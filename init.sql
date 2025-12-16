-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 06, 2025 at 07:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pharma`
--

-- --------------------------------------------------------

--
-- Table structure for table `drug`
--

CREATE TABLE `drug` (
                        `idDrug` int(11) NOT NULL,
                        `name` varchar(64) NOT NULL,
                        `manufacturer` varchar(64) NOT NULL,
                        `api` varchar(128) NOT NULL,
                        `mkb_10` varchar(16) NOT NULL,
                        `prescription_only` tinyint(1) NOT NULL DEFAULT 0,
                        `price` decimal(10,2) NOT NULL,
                        `package_size` int(10) UNSIGNED NOT NULL,
                        `api_per_pill` decimal(10,2) NOT NULL,
                        `unit` enum('g','mg','μg','ml') NOT NULL,
                        `date_produced` datetime NOT NULL DEFAULT current_timestamp(),
                        `date_modified` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                        `stock` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drug`
--

INSERT INTO `drug` (`idDrug`, `name`, `manufacturer`, `api`, `mkb_10`, `prescription_only`, `price`, `package_size`, `api_per_pill`, `unit`, `date_produced`, `date_modified`, `stock`) VALUES
                                                                                                                                                                                            (1, 'Nalgesin S', 'Krka', 'Naproxen', 'M01AE02', 0, 12.99, 30, 275.00, 'mg', '2025-11-04 15:03:29', '2025-11-04 20:46:11', 48),
                                                                                                                                                                                            (2, 'OxyContin', 'Mundipharma Gesellschaft', 'Oxicodone', 'N02AA05', 1, 9.99, 60, 10.00, 'mg', '2025-11-04 16:05:34', '2025-11-04 20:46:11', 48);

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
                            `idPatient` int(11) NOT NULL,
                            `first_name` varchar(120) NOT NULL,
                            `last_name` varchar(120) NOT NULL,
                            `dob` date DEFAULT NULL,
                            `allergies` text DEFAULT NULL,
                            `phone` varchar(40) DEFAULT NULL,
                            `date_created` datetime NOT NULL DEFAULT current_timestamp(),
                            `date_modified` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`idPatient`, `first_name`, `last_name`, `dob`, `allergies`, `phone`, `date_created`, `date_modified`) VALUES
                                                                                                                                  (1, 'Ana', 'Kralj', '1994-06-10', 'Penicillin', '+38640111222', '2025-11-04 18:00:00', NULL),
                                                                                                                                  (2, 'Marko', 'Bizjak', '1989-01-23', NULL, '+38640333444', '2025-11-04 18:00:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
                                 `idRx` int(11) NOT NULL,
                                 `fk_patient` int(11) NOT NULL,
                                 `created_at` datetime NOT NULL DEFAULT current_timestamp(),
                                 `note` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prescriptions`
--

INSERT INTO `prescriptions` (`idRx`, `fk_patient`, `created_at`, `note`) VALUES
                                                                             (5, 2, '2025-11-04 20:40:39', 'Prescribed for headaches '),
                                                                             (6, 1, '2025-11-04 20:46:11', 'Popolna prevod upravljanja vozil');

-- --------------------------------------------------------

--
-- Table structure for table `prescription_items`
--

CREATE TABLE `prescription_items` (
                                      `idItem` int(11) NOT NULL,
                                      `fk_rx` int(11) NOT NULL,
                                      `fk_drug` int(11) NOT NULL,
                                      `qty` int(11) NOT NULL,
                                      `directions` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `prescription_items`
--

INSERT INTO `prescription_items` (`idItem`, `fk_rx`, `fk_drug`, `qty`, `directions`) VALUES
                                                                                         (1, 5, 1, 1, 'Twice per day'),
                                                                                         (2, 6, 2, 2, 'Po potrebi, maksimalno 2 na dan'),
                                                                                         (3, 6, 1, 1, 'Po potrebi');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `drug`
--
ALTER TABLE `drug`
    ADD PRIMARY KEY (`idDrug`),
    ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
    ADD PRIMARY KEY (`idPatient`);

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
    ADD PRIMARY KEY (`idRx`),
    ADD KEY `idPatient` (`fk_patient`);

--
-- Indexes for table `prescription_items`
--
ALTER TABLE `prescription_items`
    ADD PRIMARY KEY (`idItem`),
    ADD KEY `fk_rx` (`fk_rx`),
    ADD KEY `fk_drug` (`fk_drug`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `drug`
--
ALTER TABLE `drug`
    MODIFY `idDrug` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
    MODIFY `idPatient` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `prescriptions`
--
ALTER TABLE `prescriptions`
    MODIFY `idRx` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `prescription_items`
--
ALTER TABLE `prescription_items`
    MODIFY `idItem` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `prescriptions`
--
ALTER TABLE `prescriptions`
    ADD CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`fk_patient`) REFERENCES `patients` (`idPatient`) ON DELETE CASCADE;

--
-- Constraints for table `prescription_items`
--
ALTER TABLE `prescription_items`
    ADD CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`fk_rx`) REFERENCES `prescriptions` (`idRx`) ON DELETE CASCADE,
    ADD CONSTRAINT `prescription_items_ibfk_2` FOREIGN KEY (`fk_drug`) REFERENCES `drug` (`idDrug`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
