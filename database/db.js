const mongoose = require("mongoose");

var client = mongoose

  .connect("mongodb://127.0.0.1:27017/EmbedBI", {

    //useCreateIndex : true,

    useNewUrlParser: true,

    useUnifiedTopology: true,

  })

  .then(() => {

    console.log(" Connected to the database");

  })

  .catch((err) => {

    console.log(" @@@@@@@@@@@@@@@@@@@@@ error in conection", err);

    throw err;

  });



module.exports = { client };