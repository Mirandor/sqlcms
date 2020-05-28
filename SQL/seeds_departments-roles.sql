USE employees_db;

-- Departments Creation --
INSERT INTO departments (department_name) VALUES ("Top Management"), ("Operations"), ("Sales & Marketing"), ("HR & Finance"), ("IT & Development");

-- Roles Creation --
INSERT INTO roles (role, salary, department_id) VALUES ("CEO", 200000, 1);

INSERT INTO roles (role, salary, department_id) VALUES ("SVP Operations", 150000, 2);

INSERT INTO roles (role, salary, department_id) VALUES ("SVP Sales & Marketing", 150000, 3);

INSERT INTO roles (role, salary, department_id) VALUES ("SVP HR & Finance", 150000, 4);

INSERT INTO roles (role, salary, department_id) VALUES ("SVP IT & Development", 150000, 5);

INSERT INTO roles (role, salary, department_id) VALUES ("Delivery Manager", 80000, 2);

INSERT INTO roles (role, salary, department_id) VALUES ("Customer Service Manager", 80000, 2);

INSERT INTO roles (role, salary, department_id) VALUES ("Sales Manager", 80000, 3);

INSERT INTO roles (role, salary, department_id) VALUES ("Marketing Manager", 80000, 3);

INSERT INTO roles (role, salary, department_id) VALUES ("Director of Finance", 80000, 4);

INSERT INTO roles (role, salary, department_id) VALUES ("HR Manager", 80000, 4);

INSERT INTO roles (role, salary, department_id) VALUES ("IT Director", 80000, 5);

INSERT INTO roles (role, salary, department_id) VALUES ("Director of Development", 80000, 5);