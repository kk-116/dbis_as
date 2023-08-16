const fs = require('fs');
const config_obj = JSON.parse(fs.readFileSync("./Config.txt",'utf-8'));

const pool = {
  user: config_obj.pool.user,
  host:config_obj.pool.host,
  database:config_obj.pool.database,
  password:config_obj.pool.password,
  port:config_obj.pool.port,

};

module.exports ={
  pool
}