const Sequelize = require('sequelize')

const sequelize = new Sequelize(
  'node_complete', // database
  'nodecomplete', // user
  'nodecomplete', // pwd,
  {
    dialect: 'mysql',
    host: 'hkh-mysql-d.co7iaamhjk2r.us-east-2.rds.amazonaws.com',
    port: 3306
  })

module.exports = sequelize
