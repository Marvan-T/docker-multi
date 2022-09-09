const keys = require("./keys");

/* express setup - for handling http requests*/
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors()); //cross origin request sharing. Make requests from one domain (react app) to another domain (express api)
app.use(bodyParser.json()); //parse incomming requests to json (like Jackson)


/* setting up postgres client - express to postgres communication */
const { Pool } = require("pg");

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.log("Error in pg client", err));
});


/*redis setup*/
const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate(); // when you have a client that is used for listenning, subscribing or publishing information it cannot be used for other purposes hence we have duplicate clients

/* api's */
app.get("/", (req, res) => {
  res.send("Hey Marvan the api's working fine ☺️");
})


app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * FROM values");

  res.send(values.rows); //only the retrieved information (not anything else) - there's other metadata in values (time taken for query exec etc.)
});


//geting the stored values from redis (client doesen't have out of the box async/await support 😟)
app.get("/values/current", async(req, res) => {
  redisClient.hgetall("values", (err, values) => { // look up a hash value inside the redis instance and get all the information from it (think buckets)
    res.send(values);
  })
});


app.post("/values", async(req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high. Should be less than 40");
  }

  redisClient.hset("values", index, "nothing yet"); //worker will eventually come and update this value
  redisPublisher.publish('insert', index); //publish this event so the worker will be notified

  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]); //parameterised query -> we use an array to pass the values

  res.send({ working: true });
});


app.listen(5000, err => {
  console.log("Listening on port 5000");
})

