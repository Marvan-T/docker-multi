const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000 //if client looses connection retry to connect every second
});

const sub = redisClient.duplicate(); //to watch/listen to redis

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
};

//sub stands for subscription
sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fib(parseInt(message))); //insert into a hash called 'values'. Key would be the index (message) value would be the fib number for that index
});
sub.subscribe('insert');  //subscribe to any insert events (anytime when some inserts into redis we gonna get that value and calcualte the fib number for it) - listening
