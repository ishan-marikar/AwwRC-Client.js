var net = require('net');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

util.inherits(AwwRC, EventEmitter);

function AwwRC(options) {
  if (!(this instanceof AwwRC)) {
    return new AwwRC(options);
  }
  // optional params
  options = options || {};

  // we need to store the reference of `this` to `self`, so that we can use the current context in the functions
  // using `this` in the functions will refer to those funtions, not the class

  // private data
  this.server = options.server || 'localhost';
  this.port = parseInt(options.port) || 5050;
  this.nickname = options.nickname || 'awwClient';

  var self = this;

  // connecting to the server
  self.client = net.connect({
    port: this.port,
    host: this.server
  }).on('end', function() {
    self.emit('disconnect');
  });

  // whenever anything passes through to us from the server
  self.client.on('data', function(socketData) {
    var parsedSocketData = socketData.toString().trim().split('\n');
    parsedSocketData.forEach(function(eachCommand) {
    var parsedComand;
      try {
        parsedCommand = JSON.parse(eachCommand);
      } catch (ex) {
        self.emit('error', {
          message: 'An error occured when parsing the response',
          code: '0000'
        });
        throw ex;
      }
      switch (parsedCommand.type.toUpperCase()) {
        case 'SERVERMOTD':
          self.emit('motd', parsedCommand.message);
          break;
        case 'INVALIDCOMMAND':
          self.emit('invalidCommand');
          break;
        case 'SERVERCONFIG':
          self.emit('connect', parsedCommand.config);
          break;
        case 'PICKNICK':
          self.client.write(self.nickname);
          break;
        case 'NICK':
          self.emit('nickChange', {
            newNick: parsedCommand.new_nick,
            oldNick: parsedCommand.old_nick
          });
          break;
        case 'SERVERUSERS':
          self.emit('serverUsers', parsedCommand.amount);
          break;
        case 'ERROR':
          self.emit('error', {
            message: parsedCommand.message,
            code: parsedCommand.code
          });
          break;
        case 'SERVERMSG':
          self.emit('serverMessage', parsedCommand.message);
          break;
        case 'YOUQUIT':
          self.emit('youQuit', parsedCommand.message);
          break;
        default:
          console.log(parsedCommand);
          break;
      }
    });
  });
}

AwwRC.prototype.messageUser = function(user, message) {
  this.client.write('usermsg ' + user + ' ' + message + '\r');
};

AwwRC.prototype.messageChannel = function(channel, message) {
  this.client.write('chanmsg ' + channel + ' ' + message + '\r');
};

AwwRC.prototype.quit = function(message) {
  this.client.write('quit ' + message + '\r');
  this.client.destroy();
};

AwwRC.prototype.setNick = function(nick) {
  this.client.write('nick ' + nick + '\r');
};

module.exports.Client = AwwRC;
