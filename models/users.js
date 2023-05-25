const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');



const UserSchemaMyApp = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});


UserSchemaMyApp.plugin(passportLocalMongoose);


module.exports = mongoose.model('User', UserSchemaMyApp);