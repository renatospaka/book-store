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

let _db

const mongoConnect = callback => {
  MongoClient.connect('mongodb+srv://nodecomplete:nodecomplete@renatospaka-m001-oiyd7.mongodb.net/books?retryWrites=true&w=majority')
    .then(client => {
      console.log('Connected!')
      _db = client.db()
      callback(client)
    })
    .catch(err => {
      console.log(err)
      throw err
    })
}

const getDb = () => {
  if (_db) {
    return _db
  }

  throw 'No database found !'
}
exports.mongoConnect = mongoConnect
exports.getDb = getDb