var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table2');

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "mysqlroot",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    runSearch()
});

function runSearch() {
    var query = "SELECT item_id,product_name,department_name,price,stock_quantity FROM products ";

    var productTable = new Table({
        head: ['ID', 'Product', 'Department', 'Price', 'QTY Avail.']
        , colWidths: [5, 30, 20, 10, 10]
    });

    connection.query(query, function (err, res) {
        for (var i = 0; i < res.length; i++) {
            productTable.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(productTable.toString())
        askQuestions();
    });
};


function askQuestions() {

    inquirer
        .prompt([{
            name: "id",
            type: "input",
            message: "Enter an ID # of which item you would like to purchase.",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }, {
            name: "qty",
            type: "input",
            message: "How many would you like to purchase? ",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }])
        .then(function (answer) {
            var currentQty = 0
            var query = "SELECT product_name, stock_quantity, price FROM products WHERE item_id = ?";
            connection.query(query, answer.id, function (err, res1) {
                //console.log(res)
                currentQty = res1[0].stock_quantity;
                var itemID = answer.id;
                var newQty = currentQty - answer.qty;
                var price = res1[0].price;
                if (newQty < 0) {
                    console.log("Sorry, there is only " + currentQty + " available. Please try again.");
                    //console.log(currentQty + " " + newQty)
                    askQuestions();
                    //runSearch();
                } else {
                    //runSearch();
                    updateDB(itemID, newQty, res1[0].product_name, answer.qty, price);
                }
            });
        });
}

function updateDB(id, qty, product_name, purchasedQty, purchaseAmount) {
    var query = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
    connection.query(query, [qty, id], function (err, res) {
        //console.log(answer.id + " " + answer.qty)
    });
    if (purchasedQty <= 1) {
        console.log("Thank You For Purchasing " + purchasedQty + " " + product_name + " for $" + purchaseAmount * purchasedQty)

    } else {
        console.log("Thank You For Purchasing " + purchasedQty + " " + product_name + "'s for $" + purchaseAmount * purchasedQty)

    };
    // connection.end();
    runSearch();
}