DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;

-- DROP TABLE IF EXISTS departments;
-- DROP TABLE IF EXISTS roles;
-- DROP TABLE IF EXISTS employee;

-- Department Table Creation --
CREATE TABLE departments (
  duId INTEGER AUTO_INCREMENT NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (duId)
);

-- Role Table Creation --
CREATE TABLE roles (
  ruId INTEGER AUTO_INCREMENT NOT NULL,
  role VARCHAR(50) NULL,
  salary DECIMAL(10,2) NULL,
  department_id INTEGER NOT NULL,
  PRIMARY KEY (ruId),
  FOREIGN KEY (department_id) REFERENCES departments(duId)
);

-- Employee Table Creation --
CREATE TABLE employee (
  euId INTEGER AUTO_INCREMENT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role_id INTEGER NOT NULL,
  manager_id INTEGER NULL,
  PRIMARY KEY (euId),
  FOREIGN KEY (manager_id) REFERENCES employee(euId),
  FOREIGN KEY (role_id) REFERENCES roles(ruId)
);