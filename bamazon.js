var mysql = require('mysql');
var inquirer = require('inquirer');
var table = require('console.table');

var totalcost = 0;

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
    makeTable();
})

var makeTable = function() {

    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;
        console.table(res);
        promptCustomer(res);
    });
};

var promptCustomer = function(res) {
	inquirer.prompt([{
		type: 'input',
		name: 'choice',
		message: 'Please enter the item ID of the product you would like to purchase.'
	}]).then(function(answer) {
		
		var correct = false;

		for (var i = 0; i < res.length; i++) {

			if (answer.choice == res[i].ItemID) {
				correct = true;

				connection.query('SELECT quantity,ItemID,price FROM products WHERE ItemID = ' + answer.choice, function(err, res) {
					inquirer.prompt([{
						type: 'input',
						name: 'qchoice',
						message: 'How many would you like to purchase:'
					}]).then(function(answer) {

						if (res[0].quantity > answer.qchoice) {

							var update = res[0].quantity - answer.qchoice; 
							cost = res[0].price * answer.qchoice;
							totalcost += cost;
							
							console.log("You purchase cost: $" + cost);
							console.log("Your total cost so far: $" + totalcost);


							connection.query('UPDATE products SET quantity = ' + update + ' WHERE ItemID = ' + res[0].ItemID, function(err, res) {
								makeTable();
							})
						}

						else {
							console.log('Insufficient quantity.')
							promptCustomer(res);
						}

					})
				})
			}
		}
		
			if (i == res.length && correct == false) {
				promptCustomer(res);
			}
	})
}