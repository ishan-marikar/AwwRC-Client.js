var chalk = require('chalk');
var awwrc = require('./awwrc');
var readlineSync = require('readline-sync');

console.log(chalk.bgRed.black("Please do note that this is still a work in progress and not entirely functional as of yet.\nPlease run this on a new instance of the server."));

var server = readlineSync.question('Which AwwRC server do you want to connect to? ', {
  defaultInput: 'localhost'
});

var port = readlineSync.question('Which port? ', {
  defaultInput: 5050,
  limit: function(input) {
    return (input < 65536 && input > 0) ? true : false;
  }
});

var nickname = readlineSync.question('Now that that\'s all done. Enter your username: ', {
  limit: function(input) {
    return (input.length < 13 && input.length > 2) ? true : false;
  }
});


var client = awwrc.Client({
  server: server,
  port: port,
  nickname: nickname
});

client.on('motd', function(message) {
  console.log(chalk.magenta.bold(message));
});
client.on('invalidCommand', function() {
  console.log(chalk.bgRed.black.bold("Invalid command!"));
});

client.on('nickChange', function(nicks) {
  console.log(chalk.green.bold(nicks.oldNick, "is now", nicks.newNick));
});

client.on('error', function(error) {
  console.log(chalk.bgRed.black(error.message, '[', error.code, ']'));
});

client.on('serverMessage', function(quit) {
  console.log(chalk.bgBlue.black(quit.message));
});

client.on('serverUsers', function(users) {
  console.log(chalk.bgBlue.black('The server has', users, 'users'));
});

client.on('disconnect', function() {
  console.log('You have been disconnected from the server.');
});