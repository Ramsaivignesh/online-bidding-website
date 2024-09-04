const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');

mongoose.connect("mongodb://0.0.0.0:27017/react-login-tut")
    .then(() => {
        console.log("mongodb connected");
    })
    .catch(() => {
        console.log('failed');
    })


const newSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})
newSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

newSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', newSchema);

module.exports = User;


const collection = mongoose.model("collection", newSchema)

module.exports = collection
