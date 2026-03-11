import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
    username: {
         type: String,
          required: true,
           unique: true 
        },
    email: {
         type: String,
          required: true, 
          unique: true },
    password: { 
        type: String,
         required: true
         },

    profilePicture: {
         type: String,
          default: "" 
        },


    role: {
         type: String,
          enum: ['user', 'admin'], 
          default: 'user' }
},
 { 
    timestamps: true 
});

//hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
  
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      next();
    } catch (error) {
      next(error);
    }
  });

  //method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};



const User = mongoose.model('User', userSchema);
export default User;