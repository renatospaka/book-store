// const Sequelize = require('sequelize')

// const sequelize = new Sequelize(
//   'node_complete', // database
//   'nodecomplete', // user
//   'nodecomplete', // pwd,
//   {
//     dialect: 'mysql',
//     host: 'hkh-mysql-d.co7iaamhjk2r.us-east-2.rds.amazonaws.com',
//     port: 3306
//   })

// module.exports = sequelize
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;

const mongoConnect = callback => {
  MongoClient.connect('mongodb+srv://nodecomplete:nodecomplete@renatospaka-m001-oiyd7.mongodb.net/dev_bs?retryWrites=true&w=majority')
    .then(client => {
      console.log('Connected!')
      callback(client)
    })
    .catch(err => {
      console.log(err)
    })
}

module.exports = mongoConnect;