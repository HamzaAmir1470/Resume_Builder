// import mongoose from 'mongoose'
// import bcrypt from 'bcrypt'

// const UserSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
// }, { timestamps: true })


// // Pre-save hook to hash password
// UserSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next(); // only hash if password is new/changed
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (err) {
//         next(err);
//     }
// });

// // use "bcrypt" when we are comparing password during login from use side 
// UserSchema.methods.comparePassword = function (password) {
//     return bcrypt.compareSync(password, this.password)
// }

// const User = mongoose.model("User", UserSchema)


// export default User





import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);



export default User;
