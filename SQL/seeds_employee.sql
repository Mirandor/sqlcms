USE employees_db;

-- Manager Employee Creation --
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Bruce", "Wayne", 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Richard", "Grayson", 2, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Jason", "Todd", 3, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Tim", "Drake", 4, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Damian", "Wayne", 5, 1);

-- Other Employee Creation --
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Helena", "Bertinelli", 6, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Barbara", "Gordon", 7, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Kori", "Anders", 8, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Roy", "Harper", 9, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Stephanie", "Brown", 10, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Harper", "Row", 11, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Cassandra", "Cain", 12, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Julia", "Pennyworth", 13, 5);