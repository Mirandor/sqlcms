DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;

-- Department Table Creation --
CREATE TABLE departments (
  id INTEGER AUTO_INCREMENT NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (id)
);

-- Role Table Creation --
CREATE TABLE roles (
  id INTEGER AUTO_INCREMENT NOT NULL,
  title VARCHAR(50) NULL,
  salary DECIMAL(10,2) NULL,
  department_id INTEGER ,
  PRIMARY KEY (id)
);

-- Employee Table Creation --
CREATE TABLE employee (
  id INTEGER AUTO_INCREMENT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role_id INTEGER NULL,
  manager_id INTEGER NULL,
  PRIMARY KEY (id)
);