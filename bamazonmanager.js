var mysql = require('mysql');
var inquirer = require('inquirer');
var table = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "orangegit12", //Your password
    database: "Bamazon"
})

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
})

var start = function() {
	inquirer.prompt([{
		name: "menu",
		type: "list",
		message: "Select an option: ",
		choices: ["View products", "View low inventory", "Add to inventory", "Add new product", "Exit"]
	}]).then(function(response) {
		if (response.menu == "View products") {
			viewProduct();
		}
		if (response.menu == "View low inventory") {
			lowInventory();
		}
		if (response.menu == "Add to inventory") {
			addInventory();
		}
		if (response.menu == "Add new product") {
			addProduct();
		}
		if (response.menu == "Exit") {
			process.exit();
		}
	})
}

var viewProduct = function() {

	connection.query('SELECT * FROM products', function(err, res) {
		if (err) throw err;
		console.table(res);
		start();
	})
}

var lowInventory = function() {
	var query = 'SELECT ItemID,name,price,quantity FROM products WHERE quantity BETWEEN 0 AND 5';
	connection.query(query, function(err,res) {
		if (err) throw err;
		console.table(res);
		start();
	})
}

var addInventory = function() {

	connection.query('SELECT * FROM products', function(err, res) {
		if (err) throw err;
		console.table(res);
		inquirer.prompt([{
			type: 'input',
			name: 'select',
			message: 'Please enter the item ID of the product you would like to replenish:'
		}]).then(function(answer) {
			var correct = false;

			for (var i = 0; i < res.length; i++) {

				if (answer.select == res[i].ItemID) {
					correct = true;

					connection.query('SELECT quantity, ItemID FROM products WHERE ItemID = ' + answer.select, function(err, res) {
						if (err) throw err;
						inquirer.prompt([{
							type: 'input',
							name: 'qselect',
							message: 'How much of the product would you like to add?'
						}]).then(function(answer) {
							var addItem = parseFloat(res[0].quantity) + parseFloat(answer.qselect);

							connection.query('UPDATE products SET quantity = ' + addItem + ' WHERE ItemID = ' + res[0].ItemID, function(err, res) {
								console.log('Item quantity updated.')
								start();
							})
						})
					})
				}
			}
			
			if (i == res.length && correct == false) {
				start();
			}
		})	
	})
}

var addProduct = function() {
	connection.query('SELECT * FROM products', function(err, res) {
		if (err) throw err;
		console.table(res);
		inquirer.prompt([{
			
			name: "deptmenu",
			type: "list",
			message: "Select product department: ",
			choices: ["Appliances", "Beauty", "Electronics", "Computers", "Food", "Health", "Instruments"]
		},

		{
			name: "prodname",
			type: "input",
			message: "Input the name of the product:"
		},

		{
			name: "price",
			type: "input",
			message: "Enter the price of the product:"
		},

		{
			name: "quantity",
			type: "input",
			message: "Enter the quantity of the product:"
		
		}]).then(function(response) {

					connection.query("INSERT INTO products (Name, Department, Price, Quantity) VALUES ('" + response.prodname + "','" + response.deptmenu + "','" + response.price + "','" + response.quantity + "')", function(err, res) {
					console.log("Item added to inventory.");
					start();
				})
		})
	})
}

