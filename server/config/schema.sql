-- MySQL dump 10.13  Distrib 5.7.24, for Linux (x86_64)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adoption_requests`
--

DROP TABLE IF EXISTS `adoption_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adoption_requests` (
  `id` int NOT NULL,
  `request_date` timestamp NULL DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT NULL,
  `decision_date` timestamp NULL DEFAULT NULL,
  `USERS_id_user` int NOT NULL,
  `USERS_adrees_idadrees_id` int NOT NULL,
  `USERS_adrees_state_state_id` int NOT NULL,
  PRIMARY KEY (`id`,`USERS_id_user`,`USERS_adrees_idadrees_id`,`USERS_adrees_state_state_id`),
  KEY `fk_adoption_requests_USERS1_idx` (`USERS_id_user`,`USERS_adrees_idadrees_id`,`USERS_adrees_state_state_id`),
  CONSTRAINT `fk_adoption_requests_USERS1` FOREIGN KEY (`USERS_id_user`, `USERS_adrees_idadrees_id`, `USERS_adrees_state_state_id`) REFERENCES `users` (`id_user`, `adrees_idadrees_id`, `adrees_state_state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adoption_requests`
--

LOCK TABLES `adoption_requests` WRITE;
/*!40000 ALTER TABLE `adoption_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `adoption_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adrees`
--

DROP TABLE IF EXISTS `adrees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adrees` (
  `idadrees_id` int NOT NULL,
  `line_1` varchar(45) DEFAULT NULL,
  `line_2` varchar(45) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state_state_id` int NOT NULL,
  PRIMARY KEY (`idadrees_id`,`state_state_id`),
  KEY `fk_adrees_state1_idx` (`state_state_id`),
  CONSTRAINT `fk_adrees_state1` FOREIGN KEY (`state_state_id`) REFERENCES `state` (`state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adrees`
--

LOCK TABLES `adrees` WRITE;
/*!40000 ALTER TABLE `adrees` DISABLE KEYS */;
/*!40000 ALTER TABLE `adrees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `animals`
--

DROP TABLE IF EXISTS `animals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `animals` (
  `id_animal` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `species` varchar(100) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `status` enum('available','adopted','surrendered') DEFAULT NULL,
  `intake_date` date DEFAULT NULL,
  `photo_url` text,
  `sex` varchar(10) DEFAULT NULL,
  `note` text,
  `notes` varchar(45) DEFAULT NULL,
  `donation_date` date DEFAULT NULL,
  `surrender_requests_USERS_id_user` int NOT NULL,
  `surrender_requests_USERS_adrees_idadrees_id` int NOT NULL,
  `surrender_requests_USERS_adrees_state_state_id` int NOT NULL,
  PRIMARY KEY (`id_animal`,`surrender_requests_USERS_id_user`,`surrender_requests_USERS_adrees_idadrees_id`,`surrender_requests_USERS_adrees_state_state_id`),
  KEY `fk_ANIMALS_surrender_requests1_idx` (`surrender_requests_USERS_id_user`,`surrender_requests_USERS_adrees_idadrees_id`,`surrender_requests_USERS_adrees_state_state_id`),
  CONSTRAINT `fk_ANIMALS_surrender_requests1` FOREIGN KEY (`surrender_requests_USERS_id_user`, `surrender_requests_USERS_adrees_idadrees_id`, `surrender_requests_USERS_adrees_state_state_id`) REFERENCES `surrender_requests` (`USERS_id_user`, `USERS_adrees_idadrees_id`, `USERS_adrees_state_state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `animals`
--

LOCK TABLES `animals` WRITE;
/*!40000 ALTER TABLE `animals` DISABLE KEYS */;
/*!40000 ALTER TABLE `animals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `animals_has_adoption_requests`
--

DROP TABLE IF EXISTS `animals_has_adoption_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `animals_has_adoption_requests` (
  `ANIMALS_id_animal` int NOT NULL,
  `adoption_requests_id` int NOT NULL,
  `adoption_requests_USERS_id_user` int NOT NULL,
  `adoption_requests_USERS_adrees_idadrees_id` int NOT NULL,
  `adoption_requests_USERS_adrees_state_state_id` int NOT NULL,
  PRIMARY KEY (`ANIMALS_id_animal`,`adoption_requests_id`,`adoption_requests_USERS_id_user`,`adoption_requests_USERS_adrees_idadrees_id`,`adoption_requests_USERS_adrees_state_state_id`),
  KEY `fk_ANIMALS_has_adoption_requests_adoption_requests1_idx` (`adoption_requests_id`,`adoption_requests_USERS_id_user`,`adoption_requests_USERS_adrees_idadrees_id`,`adoption_requests_USERS_adrees_state_state_id`),
  KEY `fk_ANIMALS_has_adoption_requests_ANIMALS1_idx` (`ANIMALS_id_animal`),
  CONSTRAINT `fk_ANIMALS_has_adoption_requests_adoption_requests1` FOREIGN KEY (`adoption_requests_id`, `adoption_requests_USERS_id_user`, `adoption_requests_USERS_adrees_idadrees_id`, `adoption_requests_USERS_adrees_state_state_id`) REFERENCES `adoption_requests` (`id`, `USERS_id_user`, `USERS_adrees_idadrees_id`, `USERS_adrees_state_state_id`),
  CONSTRAINT `fk_ANIMALS_has_adoption_requests_ANIMALS1` FOREIGN KEY (`ANIMALS_id_animal`) REFERENCES `animals` (`id_animal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `animals_has_adoption_requests`
--

LOCK TABLES `animals_has_adoption_requests` WRITE;
/*!40000 ALTER TABLE `animals_has_adoption_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `animals_has_adoption_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `donations` (
  `id` int NOT NULL,
  `donation_type` varchar(45) DEFAULT NULL,
  `amount` varchar(45) DEFAULT NULL,
  `donation_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medical_records` (
  `records_id` int NOT NULL,
  `record_type` varchar(45) DEFAULT NULL,
  `record_date` date DEFAULT NULL,
  `created_at` varchar(45) DEFAULT NULL,
  `note` text,
  `medical_recordscol` varchar(45) DEFAULT NULL,
  `ANIMALS_id_animal` int NOT NULL,
  `USERS_id_user` int NOT NULL,
  PRIMARY KEY (`records_id`,`ANIMALS_id_animal`),
  KEY `fk_medical_records_ANIMALS1_idx` (`ANIMALS_id_animal`),
  KEY `USERS_id_user` (`USERS_id_user`),
  CONSTRAINT `fk_medical_records_ANIMALS1` FOREIGN KEY (`ANIMALS_id_animal`) REFERENCES `animals` (`id_animal`),
  CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`USERS_id_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_records`
--

LOCK TABLES `medical_records` WRITE;
/*!40000 ALTER TABLE `medical_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `medical_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `notifications_id` int NOT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `USERS_id` int NOT NULL,
  PRIMARY KEY (`notifications_id`,`USERS_id`),
  KEY `fk_notifications_USERS1_idx` (`USERS_id`),
  CONSTRAINT `fk_notifications_USERS1` FOREIGN KEY (`USERS_id`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `state`
--

DROP TABLE IF EXISTS `state`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `state` (
  `state_id` int NOT NULL,
  `state` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `state`
--

LOCK TABLES `state` WRITE;
/*!40000 ALTER TABLE `state` DISABLE KEYS */;
/*!40000 ALTER TABLE `state` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `surrender_requests`
--

DROP TABLE IF EXISTS `surrender_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `surrender_requests` (
  `animal_description` text,
  `reason` text,
  `surrender_requestscol` varchar(45) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT NULL,
  `surrender_requestscol1` varchar(45) DEFAULT NULL,
  `USERS_id_user` int NOT NULL,
  `USERS_adrees_idadrees_id` int NOT NULL,
  `USERS_adrees_state_state_id` int NOT NULL,
  PRIMARY KEY (`USERS_id_user`,`USERS_adrees_idadrees_id`,`USERS_adrees_state_state_id`),
  CONSTRAINT `fk_surrender_requests_USERS1` FOREIGN KEY (`USERS_id_user`, `USERS_adrees_idadrees_id`, `USERS_adrees_state_state_id`) REFERENCES `users` (`id_user`, `adrees_idadrees_id`, `adrees_state_state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `surrender_requests`
--

LOCK TABLES `surrender_requests` WRITE;
/*!40000 ALTER TABLE `surrender_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `surrender_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id_user` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(64) DEFAULT NULL,
  `role` enum('manager','volunteer','veterinarian','public') DEFAULT NULL,
  `created_at` varchar(45) DEFAULT NULL,
  `sex` varchar(45) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `Security_question` varchar(45) DEFAULT NULL,
  `adrees_idadrees_id` int NOT NULL,
  `adrees_state_state_id` int NOT NULL,
  PRIMARY KEY (`id_user`,`adrees_idadrees_id`,`adrees_state_state_id`),
  KEY `fk_USERS_adrees1_idx` (`adrees_idadrees_id`,`adrees_state_state_id`),
  CONSTRAINT `fk_USERS_adrees1` FOREIGN KEY (`adrees_idadrees_id`, `adrees_state_state_id`) REFERENCES `adrees` (`idadrees_id`, `state_state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_has_donations`
--

DROP TABLE IF EXISTS `users_has_donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users_has_donations` (
  `USERS_id` int NOT NULL,
  `donations_id` int NOT NULL,
  PRIMARY KEY (`USERS_id`,`donations_id`),
  KEY `fk_USERS_has_donations_donations1_idx` (`donations_id`),
  KEY `fk_USERS_has_donations_USERS_idx` (`USERS_id`),
  CONSTRAINT `fk_USERS_has_donations_donations1` FOREIGN KEY (`donations_id`) REFERENCES `donations` (`id`),
  CONSTRAINT `fk_USERS_has_donations_USERS` FOREIGN KEY (`USERS_id`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_has_donations`
--

LOCK TABLES `users_has_donations` WRITE;
/*!40000 ALTER TABLE `users_has_donations` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_has_donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_has_notifications`
--

DROP TABLE IF EXISTS `users_has_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users_has_notifications` (
  `USERS_id` int NOT NULL,
  `USERS_adrees_idadrees_id` int NOT NULL,
  `USERS_adrees_state_state_id` int NOT NULL,
  `USERS_volunteer_requests_id` int NOT NULL,
  `notifications_idnotifications_id` int NOT NULL,
  PRIMARY KEY (`USERS_id`,`USERS_adrees_idadrees_id`,`USERS_adrees_state_state_id`,`USERS_volunteer_requests_id`,`notifications_idnotifications_id`),
  KEY `fk_USERS_has_notifications_notifications1_idx` (`notifications_idnotifications_id`),
  KEY `fk_USERS_has_notifications_USERS1_idx` (`USERS_id`,`USERS_adrees_idadrees_id`,`USERS_adrees_state_state_id`,`USERS_volunteer_requests_id`),
  CONSTRAINT `fk_USERS_has_notifications_notifications1` FOREIGN KEY (`notifications_idnotifications_id`) REFERENCES `notifications` (`notifications_id`),
  CONSTRAINT `fk_USERS_has_notifications_USERS1` FOREIGN KEY (`USERS_id`, `USERS_adrees_idadrees_id`, `USERS_adrees_state_state_id`) REFERENCES `users` (`id_user`, `adrees_idadrees_id`, `adrees_state_state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_has_notifications`
--

LOCK TABLES `users_has_notifications` WRITE;
/*!40000 ALTER TABLE `users_has_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_has_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteer_requests`
--

DROP TABLE IF EXISTS `volunteer_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `volunteer_requests` (
  `id` int NOT NULL,
  `availability_date` varchar(45) DEFAULT NULL,
  `skills` varchar(150) DEFAULT NULL,
  `motivation` text,
  `request_date` date DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT NULL,
  `availability_time` varchar(45) DEFAULT NULL,
  `USERS_id_user` int NOT NULL,
  PRIMARY KEY (`id`,`USERS_id_user`),
  KEY `fk_volunteer_requests_USERS1_idx` (`USERS_id_user`),
  CONSTRAINT `fk_volunteer_requests_USERS1` FOREIGN KEY (`USERS_id_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteer_requests`
--

LOCK TABLES `volunteer_requests` WRITE;
/*!40000 ALTER TABLE `volunteer_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `volunteer_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `volunteer_tasks`
--

DROP TABLE IF EXISTS `volunteer_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `volunteer_tasks` (
  `task_id` int NOT NULL,
  `task_name` varchar(45) DEFAULT NULL,
  `description` text,
  `task_date` date DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `created_at` varchar(45) DEFAULT NULL,
  `USERS_id_user` int NOT NULL,
  PRIMARY KEY (`task_id`,`USERS_id_user`),
  KEY `fk_volunteer_tasks_USERS1_idx` (`USERS_id_user`),
  CONSTRAINT `fk_volunteer_tasks_USERS1` FOREIGN KEY (`USERS_id_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `volunteer_tasks`
--

LOCK TABLES `volunteer_tasks` WRITE;
/*!40000 ALTER TABLE `volunteer_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `volunteer_tasks` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-06  2:02:02
