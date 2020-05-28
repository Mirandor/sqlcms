const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const cTable = require('console.table');
const printMessage = require('print-message');
const gradient = require('gradient-string');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "employees_db"
});

// Gradient Style
let alertGradient = gradient([
  {color: '#d11717', pos: 0},
  {color: '#d62d2d', pos: 0.2},
  {color: '#ff6645', pos: 1}
]);

connection.connect(function (err) {
  if (err) throw err;
  console.log(" ");
  console.log(gradient.cristal("  Connected!  "));
  console.log(" ");
  runRequest();
});

// Back to Main Menu Prompt
function back() {
  inquirer.prompt({
    name: "back",
    type: "list",
    message: "Go back to main menu?",
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
      "View",
      "Add",
      "Update",
      "Delete",
      "Search",
      new inquirer.Separator(".........."),
      "Exit",
      new inquirer.Separator("..........")
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
      new inquirer.Separator(".........."),
      "Back",
      "Exit",
      new inquirer.Separator("..........")
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
            printMessage(["Employees by Manager"],{border: true, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
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
    SELECT roles.ruId AS 'id', roles.role, roles.salary, departments.department_name AS 'department'
    FROM (roles
      INNER JOIN departments ON roles.department_id = departments.duId)
      ORDER BY id;
  `, function (err, res) {
    if (err) throw err;
    printMessage(["All Roles"],{border: true, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
    console.table(res);
    console.log(" ");
    back();
  });
}

// View ALL Departments
function viewDepartmentsAll() {
  connection.query(`
  SELECT duId AS 'id', department_name AS 'department' FROM departments ORDER BY duId`, function (err, res) {
    if (err) throw err;
    printMessage(["All Departments"],{border: true, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
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
      new inquirer.Separator(".........."),
      "Back",
      "Exit",
      new inquirer.Separator("..........")
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
          message: "Select a manager: ",
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
              console.log(" ");
              console.log(gradient.vice("   Success! Created new employee.   "));
              console.log(" ");
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
          function (err) {
            if (err) throw err;
            console.log(" ");
            console.log(gradient.vice("   Success! New role created.   "));
            console.log(" ");
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
          console.log(" ");
          console.log(gradient.vice("   Success! New department created.   "));
          console.log(" ");
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
      "Employee Role",
      "Update Roles",
      "Update Departments",
      new inquirer.Separator(".........."),
      "Back",
      "Exit",
      new inquirer.Separator("..........")
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

        case "Employee Role":
          updateEmpRole();
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
      name: "selectedEmployee",
      type: "list",
      choices: function () {
        var choiceSelEmp = [];
        for (var i = 0; i < res.length; i++) {
          choiceSelEmp.push(res[i].euId +": " + res[i].first_name + " " + res[i].last_name);
        }
        return choiceSelEmp;
      },
      message: "Which employee name do you want to change?"
    }, {
      name: "upFirstName",
      type: "input",
      message: "First Name: "
    }, {
      name: "upLastName",
      type: "input",
      message: "Last Name: "
    }
    ])
      .then(function (answer) {
        var splitSelEmp = answer.selectedEmployee.split(": ");
        var selEmpId = parseInt(splitSelEmp[0]);
        var chosenSelEmp;
        for (var i = 0; i < res.length; i++) {
          if (res[i].choiceSelEmp === answer.choice) {
            chosenSelEmp = res[i];
          }
        }
        connection.query(`UPDATE employee 
        SET first_name = "${answer.upFirstName}", last_name = "${answer.upLastName}"
        WHERE euId = ${selEmpId};`,
        function (err) {
          if (err) throw err;
          console.log(" ");
          console.log(gradient.fruit("   Hooray! We renamed the employee.   "));
          console.log(" ");
          back();
        });
      });
  });
}

// Update Employee Manager
function updateManager() {
connection.query("SELECT * FROM employee", function (err, res) {
  if (err) throw err;
  inquirer.prompt([
    {
      name: "empSelect",
      type: "list",
      message: "Select which employee you want to update: ",
      choices: function () {
        var choiceEmp = [];
        for (var i = 0; i < res.length; i++) {
          choiceEmp.push(res[i].euId + ": " + res[i].first_name + " " + res[i].last_name);
        }
        return choiceEmp;
      }
    }, {
      name: "empManagerUpdate",
      type: "list",
      message: "Choose a manager: ",
      choices: function () {
        var choiceUpManager = [];
        for (var i = 0; i < res.length; i++) {
          choiceUpManager.push(res[i].euId + ": " + res[i].first_name + " " + res[i].last_name);
        }
        return choiceUpManager;
      }
    }
  ])
  .then(function(answer) {
    var splitEmp = answer.empSelect.split(": ");
    var empSelectId = parseInt(splitEmp[0]);
    var chosenEmp;
    for (var i =0; i < res.length; i++) {
      if (res[i].choiceEmp === answer.choice) {
        chosenEmp = res[i];
      }
    }
    var splitUpManager = answer.empManagerUpdate.split(": ");
    var upEmpMangerId = parseInt(splitUpManager[0]);
    var chosenUpManager;
    for (var i = 0; i < res.length; i++) {
      if (res[i].choiceUpManager === answer.choiceUpManager) {
        chosenUpManager = res[i];
      }
    }
    connection.query(`UPDATE employee 
    SET manager_id = "${upEmpMangerId}"
    WHERE euId = ${empSelectId};`,
    function (err){
      if (err) throw err;
      console.log(" ");
      console.log(gradient.fruit("   Hooray! We updated the manager.   "));
      console.log(" ");
      back();
    });
  });
});
}

// Update Employee Role
function updateEmpRole(){
  var empSelectQuery = connection.query("SELECT * FROM employee", function (err, data) {
    if (err) throw err;
    var empRoleQuery = connection.query("SELECT * FROM roles", function (err, res) {
    if (err) throw err;
    inquirer.prompt([
      {
        name: "empUpSelect",
        type: "list",
        message: "Select which employee you want to update: ",
        choices: function (empSelectQuery) {
          var choiceUpEmp = [];
          for (var i = 0; i < data.length; i++) {
            choiceUpEmp.push(data[i].euId + ": " + data[i].first_name + " " + data[i].last_name);
          }
          return choiceUpEmp;
        }
      }, {
        name: "empRole",
        type: "list",
        message: "Choose a new role: ",
        choices: function (empRoleQuery) {
          var choiceEmpRole = [];
          for (var i = 0; i < res.length; i++) {
            choiceEmpRole.push(res[i].ruId + ": " + res[i].role);
          }
          return choiceEmpRole;
        }
      }
    ])
    .then(function(answer) {
      var splitUpEmp = answer.empUpSelect.split(": ");
      var upEmpId = parseInt(splitUpEmp[0]);
      var chosenUpEmp;
      for (var i =0; i < data.length; i++) {
        if (data[i].choiceUpEmp === answer.choice) {
          chosenUpEmp = data[i];
        }
      }
      var splitEmpRole = answer.empRole.split(": ");
      var empRoleId = parseInt(splitEmpRole[0]);
      var chosenEmpRole;
      for (var i = 0; i < res.length; i++) {
        if (res[i].choiceEmpRole === answer.choiceEmpRole) {
          chosenEmpRole = res[i];
        }
      }
      connection.query(`UPDATE employee 
      SET role_id = "${empRoleId}"
      WHERE euId = ${upEmpId};`,
      function (err){
        if (err) throw err;
        console.log(" ");
        console.log(gradient.fruit("   Hooray! We updated the employee role.   "));
        console.log(" ");
        back();
      });
    });
  });
});
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
            console.log(" ");
            console.log(gradient.fruit("   Hooray! We renamed a role.   "));
            console.log(" ");
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
            console.log(" ");
            console.log(gradient.fruit("   Hooray! We renamed a department.   "));
            console.log(" ");
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
      new inquirer.Separator(".........."),
      "Back",
      "Exit",
      new inquirer.Separator("..........")
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
            console.log(" ");
            console.log(alertGradient("  Poof! Employee deleted.  "));
            console.log(" ");
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
            console.log(" ");
            console.log(alertGradient("   Poof! Role deleted.   "));
            console.log(" ");
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
            console.log(" ");
            console.log(alertGradient("   Poof! Department deleted.   "));
            console.log(" ");
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
      new inquirer.Separator(".........."),
      "Back",
      "Exit",
      new inquirer.Separator("..........")
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
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
  inquirer.prompt([
    {
      name: "employeeSearch",
      type: "list",
      message: "Select an employee: ",
      choices: function () {
        var choiceEmpSer = [];
        for (var i = 0; i < res.length; i++) {
          choiceEmpSer.push(res[i].euId +": " + res[i].first_name + " " + res[i].last_name);
        }
          return choiceEmpSer;
        }
    }
  ])
    .then(function (answer) {
      var splitEmpSer = answer.employeeSearch.split(": ");
      var empSerId = parseInt(splitEmpSer[0]);
      var chosenEmpSer;
      for (var i = 0; i < res.length; i++) {
        if (res[i].choiceEmpSer === answer.choice) {
          chosenEmpSer = res[i];
        }
      }
      connection.query(`SELECT 
      employee.euId AS 'id', CONCAT(employee.first_name, " ", employee.last_name) AS 'employee', roles.role AS 'role', roles.salary, CONCAT(m.first_name, " ", m.last_name) AS 'manager', departments.department_name AS 'department'
      FROM ((employee
        INNER JOIN employee m ON employee.manager_id = m.euId OR (employee.manager_id IS NULL = m.euId)
        INNER JOIN roles ON employee.role_id = roles.ruId)
        INNER JOIN departments ON roles.department_id = departments.duId)
      WHERE employee.euId = ${empSerId};`,
      function (err, res) {
        if (err) throw err;
        printMessage(["Employee"],{border: true, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
        console.table(res);
        console.log(" ");
        back();
      })
    })
  })
}

// SEARCH by Role
function searchByRole() {
  connection.query("SELECT * FROM roles", function (err, res) {
    inquirer.prompt([
      {
        name: "roleSearch",
        type: "list",
        message: "Select a role: ",
        choices: function () {
          var choiceRoleSer = [];
          for (var i = 0; i < res.length; i++) {
            choiceRoleSer.push(res[i].ruId +": " + res[i].role);
          }
            return choiceRoleSer;
        }
      }
    ])
    .then(function (answer) {
      var splitRoleSer = answer.roleSearch.split(": ");
      var roleSerId = parseInt(splitRoleSer[0]);
      var chosenRoleSer;
      for (var i = 0; i < res.length; i++) {
        if (res[i].choiceRoleSer === answer.choice) {
          chosenRoleSer = res[i];
        }
      }
      connection.query(`SELECT roles.ruId AS 'id', roles.role, roles.salary, departments.department_name AS 'department'
      FROM (roles 
        INNER JOIN departments ON roles.department_id = departments.duId)
      WHERE roles.ruId = ${roleSerId};`,
        function (err, res) {
          if (err) throw err;
          printMessage(["Role"],{border: true, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
          console.table(res);
          console.log(" ");
          back();
        })
      });
    });
}


// SEARCH by Department
function searchByDepartment() {
  connection.query("SELECT * FROM departments", function (err, res) {
    inquirer.prompt([
      {
        name: "deptSearch",
        type: "list",
        message: "Select a department: ",
        choices: function () {
          var choiceDeptSer = [];
          for (var i = 0; i < res.length; i++) {
            choiceDeptSer.push(res[i].duId +": " + res[i].department_name);
          }
            return choiceDeptSer;
        }
      }
    ])
    .then(function (answer) {
      var splitDeptSer = answer.deptSearch.split(": ");
      var deptSerId = parseInt(splitDeptSer[0]);
      var chosenDeptSer;
      for (var i = 0; i < res.length; i++) {
        if (res[i].choiceDeptSer === answer.choice) {
          chosenDeptSer = res[i];
        }
      }
      connection.query(`SELECT departments.duId AS 'id', departments.department_name AS 'department', roles.role, roles.salary
      FROM (departments 
        INNER JOIN roles ON departments.duId = roles.department_id)
      WHERE departments.duId = ${deptSerId};`,
        function (err, res) {
          if (err) throw err;
          printMessage(["Role"],{border: true, marginTop: 1, marginBottom: 1, paddingTop: 0, paddingBottom: 0});
          console.table(res);
          console.log(" ");
          back();
        })
      });
    });
}