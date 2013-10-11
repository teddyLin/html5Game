SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 1;

DROP TABLE IF EXISTS building_instances;

DROP TABLE IF EXISTS buildings;
CREATE TABLE buildings (
  ID int(10) NOT NULL AUTO_INCREMENT,
  NAME varchar(255) NOT NULL,
  COST int(10) unsigned NOT NULL,
  XSIZE int(3) unsigned NOT NULL,
  YSIZE int(3) unsigned NOT NULL,
  PROFIT int(5) unsigned DEFAULT NULL,
  LAPSE int(5) unsigned DEFAULT NULL,
  PRIMARY KEY (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO buildings VALUES 
	(1, 'Ice Cream Shop', 250, 1, 1, 5, 1800), 
	(2, 'Hotel', 1000, 2, 2, 30, 3600), 
	(3, 'Cinema', 500, 2, 2, 12, 1800),
	(4, 'Tree', 20, 1, 1, null, null);
     
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  ID int(10) NOT NULL AUTO_INCREMENT,
  NAME varchar(30) NOT NULL,
  PASSWORD varchar(255) NOT NULL,
  EMAIL varchar(255) NOT NULL,
  BALANCE int(10) unsigned NOT NULL,
  CONFIG blob NOT NULL,
  CREATIONTIME int(10) unsigned NOT NULL,
  LASTUPDATE int(10) unsigned NOT NULL,
  PRIMARY KEY (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE building_instances (
	ID int(10) NOT NULL AUTO_INCREMENT,
	USERID int(10) unsigned NOT NULL,
	BUILDINGID int(10) unsigned NOT NULL,
	XPOS int(3) unsigned NOT NULL,
	YPOS int(3) unsigned NOT NULL,
	PRIMARY KEY (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;