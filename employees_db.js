const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const chalkPipe = require('chalk-pipe');
const style = require('ansi-styles');
const cTable = require('console.table');
const Table = require('easy-table');
const printMessage = require('print-message');
const { printTable } = require('console-table-printer');
const gradient = require('gradient-string');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "RunDevil92",
  database: "employees_db"
});

// Chalk
var connected = chalk.bgBlack;
var bbWhite = chalk.bgWhiteBright.bold;
var link = chalkPipe('blue.underline');
var error = chalkPipe('bgRed.#cccccc');
var warning = chalkPipe('orange.bold');

// Gradient Style
let alertGradient = gradient([
  {color: '#d11717', pos: 0},
  {color: '#d62d2d', pos: 0.2},
  {color: '#ff6645', pos: 1}
]);

connection.connect(function (err) {
  if (err) throw err;
  console.log(gradient.cristal("  Connected!  "));
  runRequest();
});

// Back to Main Menu Prompt
function back() {
  inquirer.prompt({
    name: "back",
    type: "list",
    message: "Go [BACK] to main menu?",
    choices: ["BACK", "EXIT"]
  })
    .then(function (answer) {
      if (answer.back === "BACK") {
        runRequest();
      }
      else if (answer.back === "EXIT") {
        connection.end();
      }
    });
}

function runRequest() {
  inquirer.prompt({
    name: "actionMenu",
    type: "list",
    message: "What would you like to do?",
    choices: [
      new inquirer.Separator(".........."),
      "View",
      "Add",
      "Update",
      "Delete",
      "Search",
      "Exit"
    ]
  }).then(function (answer) {
    switch (answer.actionMenu) {

      case "View":
        viewBy();
        break;

      case "Add":
        addNew();
        break;

      case "Update":
        updateBy();
        break;

      case "Delete":
        deleteBy();
        break;

      case "Search":
        searchBy();
        break;

      case "Exit":
        connection.end();
        break;
    }
  });
}

// VIEW BY
function viewBy() {
  inquirer.prompt({
    name: "viewBy",
    type: "list",
    message: "What do you want to view?",
    choices: [
      "Employees ALL",
      "Employees by Department",
      "Employees by Manager",
      "Roles ALL",
      "Departments ALL",
      "Back",
      "Exit"
    ]
  })
    .then(function (answer) {
      switch (answer.viewBy) {

        case "Employees ALL":
          viewEmployeesAll();
          break;

        case "Employees by Department":
          viewEmployeesDepartment();
          break;

        case "Employees by Manager":
          viewEmployeesManager();
          break;

        case "Roles ALL":
          viewRolesAll();
          break;

        case "Departments ALL":
          viewDepartmentsAll();
          break;

        case "Back":
          back();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

// View ALL Employees
function viewEmployeesAll() {
  connection.query(`
  SELECT employee.euId AS 'id', CONCAT (employee.first_name, " ", employee.last_name) AS 'employee', roles.role AS 'role', roles.salary, CONCAT(m.first_name, " ", m.last_name) AS 'manager', departments.department_name AS 'department'
  FROM ((employee
    INNER JOIN employee m ON employee.manager_id = m.euId OR (employee.manager_id IS NULL = m.euId)
    INNER JOIN roles ON employee.role_id = roles.ruId)
    INNER JOIN departments ON roles.department_id = departments.duId)
    ORDER BY id;
  `, function (err, res) {
    if (err) throw err;
    printMessage(["All Employees Table"],{border: true, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
    console.table(res);
    console.log("  ");
    back();
  });
}

// View Employees by DEPARTMENT
function viewEmployeesDepartment() {
  connection.query("SELECT * FROM departments", function (err, res) {
    if (err) throw err;
    inquirer.prompt({
      name: "byDepartment",
      type: "list",
      choices: function () {
        var choiceDept = [];
        for (var i = 0; i < res.length; i++) {
          choiceDept.push(res[i].duId + ": " + res[i].department_name);
        }
        return choiceDept;
      },
      message: "Which department would you like to view employees by?"
    })
      .then(function (answer) {
        var splitDept = answer.byDepartment.split(": ");
        var deptId = parseInt(splitDept[0]);
        for (var i = 0; i < res.length; i++) {
          if (res[i].choiceDept === answer.choice) {
            chosenDepartment = res[i];
          }
        }
        connection.query(`
        SELECT employee.euId AS 'id', CONCAT (employee.first_name, " ", employee.last_name) AS 'employee', roles.role, roles.salary, CONCAT(m.first_name, " ", m.last_name) AS 'manager', departments.department_name AS 'department'
        FROM ((employee
          INNER JOIN employee m ON employee.manager_id = m.euId OR (employee.manager_id IS NULL = m.euId)
          INNER JOIN roles ON employee.role_id = roles.ruId)
          INNER JOIN departments ON roles.department_id = departments.duId)
          WHERE duId = ${deptId};
        `,
          function (err, res) {
            if (err) throw err;
            printMessage(["Employees by Department"],{border: true, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
            console.table(res);
            console.log("  ");
            back();
          });
        });
  });
}

// View Employees by MANAGER
function viewEmployeesManager() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    inquirer.prompt({
      name: "byManager",
      type: "list",
      choices: function () {
        var choiceManager = [];
        for (var i = 0; i < res.length; i++) {
          choiceManager.push(res[i].euId + ": " + res[i].first_name + " " + res[i].last_name);
        }
        return choiceManager;
      },
      message: "Which manager do you want to view employees by?"
    })
      .then(function (answer) {
        var splitManager = answer.byManager.split(": ");
        var empId = parseInt(splitManager[0]);
        var chosenManager;
        for (var i = 0; i < res.length; i++) {
          if (res[i].choiceManager === answer.choice) {
            chosenManager = res[i];
          }
        }
        connection.query(`
        SELECT employee.euId AS 'id', CONCAT (employee.first_name, " ", employee.last_name) AS 'employee', roles.role, roles.salary, CONCAT(m.first_name, " ", m.last_name) AS 'manager', departments.department_name AS 'department'
        FROM ((employee
          INNER JOIN employee m ON employee.manager_id = m.euId
        INNER JOIN roles ON employee.role_id = roles.ruId)
        INNER JOIN departments ON roles.department_id = departments.duId)
        WHERE employee.manager_id = ${empId};
        `,
          function (err, res) {
            if (err) throw err;
            printMessage(["Employees by Manager "],{border: true, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
            console.table(res);
            console.log("  ");
            back();
          });
        });
  });
}

// View ALL Roles
function viewRolesAll() {
  connection.query(`
    SELECT roles.ruId AS 'roleId', roles.role, roles.salary, departments.department_name AS 'department'
    FROM (roles
      INNER JOIN departments ON roles.department_id = departments.duId)
      ORDER BY roleId;
  `, function (err, res) {
    if (err) throw err;
    printMessage([],{border: false, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
    console.table(res);
    console.log(" ");
    back();
  });
}

// View ALL Departments
function viewDepartmentsAll() {
  connection.query(`
  SELECT duId AS 'dept id', department_name AS 'department' FROM departments ORDER BY duId`, function (err, res) {
    if (err) throw err;
    printMessage([],{border: false, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
    console.table(res);
    console.log(" ");
    back();
  });
}


// ADD NEW

function addNew() {

  inquirer.prompt({

    name: "addNew",
    type: "list",
    message: "What do you want to add?",
    choices: [
      "Employee",
      "Role",
      "Department",
      "Back",
      "Exit"
    ]
  })
    .then(function (answer) {
      switch (answer.addNew) {

        case "Employee":
          addNewEmployee();
          break;

        case "Role":
          addNewRole();
          break;

        case "Department":
          addNewDepartment();
          break;

        case "Back":
          back();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}


// Add New Employee
function addNewEmployee() {
  var empQuery = connection.query("SELECT * FROM employee", function (err, data) {
    if (err) throw err;
    var roleQuery = connection.query("SELECT * FROM roles", function (err, res) {
      if (err) throw err;
      inquirer.prompt([
        {
          name: "firstName",
          type: "input",
          message: "Enter first name: "
        }, {
          name: "lastName",
          type: "input",
          message: "Enter last name: "
        }, {
          name: "newEmpRole",
          type: "list",
          message: "Select a role: ",
          choices: function (roleQuery) {
            var choiceRole = [];
            for (var i = 0; i < res.length; i++) {
              choiceRole.push(res[i].ruId + ": " + res[i].role);
            }
            return choiceRole;
          }
        }, {
          name: "newEmpManager",
          type: "list",
          message: "Select a manager (if applicable): ",
          choices: function (empQuery) {
            var choiceEmp = [];
            for (var i = 0; i < data.length; i++) {
              choiceEmp.push(data[i].euId + ": " + data[i].first_name + " " + data[i].last_name);
            }
            return choiceEmp;
          }
        }
      ])
        .then(function (answer) {
          var splitRole = answer.newEmpRole.split(": ");
          var roleId = parseInt(splitRole[0]);
          var chosenRole;
          for (var i = 0; i < res.length; i++) {
            if (res[i].choiceRole === answer.choice) {
              chosenRole = res[i];
            }
          }
          var splitEmp = answer.newEmpManager.split(": ");
          var empId = parseInt(splitEmp[0]);
          var chosenEmpManager;
          for (var i = 0; i < res.length; i++) {
            if (res[i].choiceEmp === answer.choice) {
              chosenEmpManager = res[i];
            }
          }
          var query = connection.query(`
    INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES ("${answer.firstName}", "${answer.lastName}", "${roleId}", "${empId}");`,
            function (err) {
              if (err) throw err;
              console.log(bbWhite(gradient.rainbow("   Success! Created new employee.   ")));
              back();
            });
        });
    });
  });
}

// Add New Role
function addNewRole() {
  connection.query("SELECT * FROM departments", function (err, res) {
    if (err) throw err;
    inquirer.prompt([
      {
        name: "newRole",
        type: "input",
        message: "Enter new role: "
      }, {
        name: "salary",
        type: "input",
        message: "Enter salary: ",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }, {
        name: "department",
        type: "list",
        message: "Choose a department: ",
        choices: function () {
          var choiceDept = [];
          for (var i = 0; i < res.length; i++) {
            choiceDept.push(res[i].duId + ": " + res[i].department_name);
          }
          return choiceDept;
        }
      }
    ])
      .then(function (answer) {
        var splitDept = answer.department.split(": ");
        var deptId = parseInt(splitDept[0]);
        var chosenDepartment;
        for (var i = 0; i < res.length; i++) {
          if (res[i].choiceDept === answer.choice) {
            chosenDepartment = res[i];
          }
        }
        var query = connection.query(`INSERT INTO roles (role, salary, department_id) VALUES ("${answer.newRole}", "${answer.salary}", "${deptId}");`,
          function (err, answer) {
            if (err) throw err;
            console.log(bbWhite(gradient.rainbow("   Success! New role created.   ")));
            back();
          });
      });
  });
}

// Add New Department
function addNewDepartment() {
  inquirer.prompt([
    {
      name: "newDepartment",
      type: "input",
      message: "Enter new department name: "
    }
  ])
    .then(function (answer) {
      connection.query(`INSERT INTO departments (department_name) VALUES 
    ("${answer.newDepartment}");`,
        function (err) {
          if (err) throw err;
          console.log(bbWhite(gradient.rainbow("   Success! New department created.   ")));
          back();
        });
    });
}

// UPDATE

function updateBy() {

  inquirer.prompt({

    name: "updateBy",
    type: "list",
    message: "What do you want to update?",
    choices: [
      "Employee Name",
      "Employee Manager",
      "Update Roles",
      "Update Departments",
      "Back",
      "Exit"
    ]
  })
    .then(function (answer) {
      switch (answer.updateBy) {

        case "Employee Name":
          updateEmployee();
          break;

        case "Employee Manager":
          updateManager();
          break;

        case "Update Roles":
          updateRole();
          break;

        case "Update Departments":
          updateDepartment();
          break;

        case "Back":
          back();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

// Update Employee Data
function updateEmployee() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    inquirer.prompt([{
      name: "employeeName",
      type: "list",
      choices: function () {
        var choiceArray = [];
        for (var i = 0; i < res.length; i++) {
          choiceArray.push(res[i].first_name + " " + res[i].last_name);
        }
        return choiceArray;
      },
      message: "Which employee name do you want to change?"
    }, {
      name: "updateSelectedEmployee"
    }
    ])
      .then(function (answer) {
        connection.query("UPDATE products SET ? WHERE ?",
        )
      });
  });
}

// Update Employee Manager
function updateManager() {

}

// Update Roles
function updateRole() {
  connection.query("SELECT * FROM roles", function (err, res) {
    if (err) throw err;
    inquirer.prompt([
      {
        name: "roleUpdate",
        type: "list",
        message: "Choose which role to update: ",
        choices: function () {
          var choiceRole = [];
          for (var i = 0; i < res.length; i++) {
            choiceRole.push(res[i].ruId + ": " + res[i].role);
          }
          return choiceRole;
        }
      }, {
        name: "roleRename",
        type: "input",
        message: "Rename the selected role: "
      }, {
        name: "salaryUpdate",
        type: "input",
        message: "Enter a new salary: ",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
      .then(function (answer) {
        var splitRole = answer.roleUpdate.split(": ");
        var roleId = parseInt(splitRole[0]);
        var chosenRole;
        for (var i = 0; i < res.length; i++) {
          if (res[i].choiceRole === answer.choice) {
            chosenRole = res[i];
          }
        }
        var query = connection.query(`UPDATE roles 
    SET role = "${answer.roleRename}", salary = "${answer.salaryUpdate}" 
    WHERE ruId = ${roleId};`,
          function (err) {
            if (err) throw err;
            console.log("Hooray! We renamed a role.");
            back();
          });
      });
  });
}

// Update Departments
function updateDepartment() {
  connection.query("SELECT * FROM departments", function (err, res) {
    if (err) throw err;
    inquirer.prompt([
      {
        name: "departmentUpdate",
        type: "list",
        message: "Choose which department to update: ",
        choices: function () {
          var choiceDept = [];
          for (var i = 0; i < res.length; i++) {
            choiceDept.push(res[i].duId + ": " + res[i].department_name);
          }
          return choiceDept;
        }
      }, {
        name: "departmentRename",
        type: "input",
        message: "Rename the selected department: "
      }
    ])
      .then(function (answer) {
        var splitDept = answer.departmentUpdate.split(": ");
        var deptId = parseInt(splitDept[0]);
        var chosenDepartment;
        for (var i = 0; i < res.length; i++) {
          if (res[i].choiceDept === answer.choice) {
            chosenDepartment = res[i];
          }
        }
        var query = connection.query(`UPDATE departments 
    SET department_name = "${answer.departmentRename}" 
    WHERE duId = ${deptId};`,
          function (err) {
            if (err) throw err;
            console.log("Hooray! We renamed a department.");
            back();
          });
      });
  });
}

// DELETE

function deleteBy() {

  inquirer.prompt({

    name: "deleteBy",
    type: "list",
    message: "What do you want to delete?",
    choices: [
      "Employee",
      "Role",
      "Department",
      "Back",
      "Exit"
    ]
  })
    .then(function (answer) {
      switch (answer.deleteBy) {

        case "Employee":
          deleteEmployee();
          break;

        case "Role":
          deleteRole();
          break;

        case "Department":
          deleteDepartment();
          break;

        case "Back":
          back();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

// Delete Employee
function deleteEmployee() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    inquirer.prompt([
      {
        name: "empDelete",
        type: "list",
        message: "Select an employee to delete: ",
        choices: function () {
          var choiceEmp = [];
          for (var i = 0; i < res.length; i++) {
            choiceEmp.push(res[i].euId + ": " + res[i].first_name + " " + res[i].last_name);
          }
          return choiceEmp;
        }
      }, {
        name: "confirmEmpDelete",
        type: "confirm",
        message: "Are you sure you want to delete this employee? Once done, you cannot undo this action."
      }
    ])
      .then(function (answer) {
        var splitEmp = answer.empDelete.split(": ") && answer.empDelete.split(" ");
        var empId = parseInt(splitEmp[0]);
        var chosenEmp;
        for (var i = 0; i < res.length; i++) {
          if (res[i].choiceEmp === answer.choice) {
            chosenEmp = res[i];
          }
        }
        var query = connection.query(`DELETE FROM employee 
    WHERE euId = ${empId};`,
          function (err) {
            if (err) throw err;
            console.log(bbWhite(alertGradient("  Poof! Employee deleted.  ")));
            back();
          });
      });
  });
}

// Delete Role
function deleteRole() {
  connection.query("SELECT * FROM roles", function (err, res) {
    if (err) throw err;
    inquirer.prompt([
      {
        name: "roleDelete",
        type: "list",
        message: "Select a role to delete: ",
        choices: function () {
          var choiceRole = [];
          for (var i = 0; i < res.length; i++) {
            choiceRole.push(res[i].ruId + ": " + res[i].role);
          }
          return choiceRole;
        }
      }, {
        name: "confirmRoleDelete",
        type: "confirm",
        message: "Are you sure you want to delete this role? Once done, you cannot undo this action."
      }
    ])
      .then(function (answer) {
        var splitRole = answer.roleDelete.split(": ");
        var roleId = parseInt(splitRole[0]);
        for (var i = 0; i < res.length; i++) {
          if (res[i].choiceRole === answer.choice) {
            chosenRole = res[i];
          }
        }
        var query = connection.query(`DELETE FROM roles 
    WHERE ruId = ${roleId};`,
          function (err) {
            if (err) throw err;
            console.log(bbWhite(alertGradient("   Poof! Role deleted.   ")));
            back();
          });
      });
  });
}

// Delete Department
function deleteDepartment() {
  connection.query("SELECT * FROM departments", function (err, res) {
    if (err) throw err;
    inquirer.prompt([
      {
        name: "deptDelete",
        type: "list",
        message: "Select a department to delete: ",
        choices: function () {
          var choiceDept = [];
          for (var i = 0; i < res.length; i++) {
            choiceDept.push(res[i].duId + ": " + res[i].department_name);
          }
          return choiceDept;
        }
      }, {
        name: "confirmDeptDelete",
        type: "confirm",
        message: "Are you sure you want to delete this department? Once done, you cannot undo this action."
      }
    ])
      .then(function (answer) {
        var splitDept = answer.deptDelete.split(": ");
        var deptId = parseInt(splitDept[0]);
        var chosenDepartment;
        for (var i = 0; i < res.length; i++) {
          if (res[i].choiceDept === answer.choice) {
            chosenDepartment = res[i];
          }
        }
        var query = connection.query(`DELETE FROM departments
    WHERE duId = ${deptId};`,
          function (err) {
            if (err) throw err;
            console.log(bbWhite(alertGradient("   Poof! Department deleted.   ")));
            back();
          });
      });
  });
}

// SEARCH
function searchBy() {

  inquirer.prompt({

    name: "searchBy",
    type: "list",
    message: "What do you want to search by?",
    choices: [
      "Employee",
      "Role",
      "Department",
      "Back",
      "Exit"
    ]
  })
    .then(function (answer) {
      switch (answer.searchBy) {

        case "Employee":
          searchByEmployee();
          break;

        case "Role":
          searchByRole();
          break;

        case "Department":
          searchByDepartment();
          break;

        case "Back":
          back();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

// SEARCH by Employee
function searchByEmployee() {
  inquirer.prompt({
    name: "employeeSearch",
    type: "input",
    message: "Which employee are you looking for?"
  })
    .then(function (answer) {
      connection.query("SELECT * FROM employee WHERE first_name = ? OR last_name = ?", { name: answer.first_name, name: answer.last_name }, function (err, res) {
        if (err) throw err;
        console.log("euID: " + res[0].euId + " | Name: " + res[0].first_name + " " + res[0].last_name + " | Role Id: " + res[0].role_id + " | Manager Id: " + res[0].manager_id);
      }
      )
      // var query = "SELECT employee.first_name, employee.last_name FROM employee WHERE ?", { name: answer.first_name }, ; 
      // connection.query(query, [answer.first_name, answer.last_name], function (err, res) {
      //   console.log(res.length + " matches found!");
      //   for (var i = 0; i < res.length; i++) {
      //     console.log(i+1 + ". " + 
      //     "First Name: " + res[i].first_name +
      //     "Last Name:  " + res[i].last_name
      //     )
      //   }
      // });
    })
}

// SEARCH by Role
function searchByRole() {
  inquirer.prompt({
    name: "roleSearch",
    type: "input",
    message: "What role are you looking for?"
  })
    .then(function (answer) {
      var query = "SELECT role, salary FROM roles WHERE ?";
      connection.query(query, { role: answer.role }, function (err, res) {
        for (var i = 0; i < res.length; i++) {
          console.log("Role: " + res[i].role + " || Salary: " + res[i].salary);
        }
        back();
      });
    });
}

// SEARCH by Department
function searchByDepartment() {
  inquirer.prompt({
    name: "departmentSearch",
    type: "input",
    message: "What department are you looking for?"
  })
    .then(function (answer) {
      var query = "SELECT * FROM departments WHERE ?";
      connection.query(query, { department_name: answer.department_name }, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
          console.log("Department: " + res[i].department_name);
        }
        back();
      });
    });
}

  // connection.connect();

  // module.exports = employees_db;