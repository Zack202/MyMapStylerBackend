const auth = require('../auth')
const User = require('../models/user-model')
const bcrypt = require('bcryptjs')
const sendEmail = require('../utils/email')
const crypto = require('crypto')

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await User.findOne({ _id: userId });
        console.log("loggedInUser: " + loggedInUser);

        return res.status(200).json({
            loggedIn: true,
            user: {
                userName: loggedInUser.userName,
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,  
                email: loggedInUser.email
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        console.log("Body", req.body)
        const { email, password } = req.body;
        console.log("Email: ", email, " Password:", password)
        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await User.findOne({ email: email });
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            console.log("Incorrect password");
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        // LOGIN THE USER
        const token = auth.signToken(existingUser._id);
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                userName: existingUser.userName,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,  
                email: existingUser.email             
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
}

registerUser = async (req, res) => {
    try {
        console.log(req.body);
        const { userName, firstName, lastName, email, password, confirmPassword } = req.body;
        console.log("create user: " + userName + " " + firstName + " " + lastName + " " + email + " " + password + " " + confirmPassword);
        if (!userName || !firstName || !lastName || !email || !password || !confirmPassword) {

            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        console.log("all fields provided");
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        console.log("password long enough");
        if (password !== confirmPassword) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        console.log("password and password verify match");
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a valid email."
                })
        }
        console.log("valid email formatting")
        
        const existingUser = await User.findOne({ email: email });
        console.log("existingUser: " + existingUser);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        const existingUserName = await User.findOne({ userName: userName });
        console.log("existingUser: " + existingUserName);
        if (existingUserName) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this user name already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash);

        const newUser = new User({
            userName, firstName, lastName, email, passwordHash, 
        });
        const savedUser = await newUser.save();
        console.log("new user saved: " + savedUser._id);

        // LOGIN THE USER
        const token = auth.signToken(savedUser._id);
        console.log("token:" + token);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).status(201).json({
            success: true,
            user: {
                userName: savedUser.userName,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,  
                email: savedUser.email
                             
            }
        })

        console.log("token sent");

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}


forgotPassword = async (req, res) => {
    userEmailAddress = req.body.email;
    console.log("userEmailAddress: " + userEmailAddress);
    if (!userEmailAddress) {
        return res
            .status(400)
            .json({ errorMessage: "Please enter all required fields." });
    }
    console.log("all fields provided");

    const existingUser = await User.findOne({ email: userEmailAddress });
    console.log("existingUser: " + existingUser);
    if (!existingUser) {
        return res
            .status(400)
            .json({
                success: false,
                errorMessage: "An account with this email address does not exist."
            })
    }

    // SEND EMAIL TO USER WITH PASSWORD RESET LINK
    let resetToken = existingUser.createResetPasswordToken();

    //Return success and give cookie to allow user to reset password

    await existingUser.save(validatebeforeSave = false);
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    const baseURL = isLocal ? 'http://localhost:3000' : 'https://my-map-styler-frontend-60bea3c51be3.herokuapp.com';
    const resetURL = `${baseURL}/resetPassword/${resetToken}`;
    
    const messageToSend = `Forgot your password? Submit a request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    try {
        console.log("here1");
        await sendEmail(
            email = existingUser.email,
            subject = 'Your password reset token (valid for 10 minutes)',
            message = messageToSend
        );
        return res.status(200).json({
            success: true,
            message: 'Token sent to email!'
        })
    } catch (err) {
        console.log("err: " + err);
        existingUser.passwordResetToken = undefined;
        existingUser.passwordResetExpires = undefined;
        await existingUser.save(validatebeforeSave = false);
        return res.status(500).json({
            success: false,
            errorMessage: "There was an error sending the email. Try again later!"
        })
    }

}

resetPassword = async (req, res) => {

    const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        return res.status(400).json({
            success: false,
            errorMessage: "Token is invalid or has expired."
        })
    }

    if (!req.body.password || !req.body.passwordConfirm) {
        return res.status(400).json({
            success: false,
            errorMessage: "Please enter all required fields."
        })
    }

    if  (req.body.password.length < 8) {
        return res.status(400).json({
            success: false,
            errorMessage: "Please enter a password of at least 8 characters."
        })
    }

    if (req.body.password !== req.body.passwordConfirm) {
        return res.status(400).json({
            success: false,
            errorMessage: "Please enter the same password twice."
        })
    }
    //Need to Hash the password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    user.passwordHash = passwordHash = await bcrypt.hash(req.body.password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // LOGIN THE USER
        const tokenLogin = auth.signToken(user._id);
        console.log(tokenLogin);

        res.cookie("token", tokenLogin, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                userName: user.userName,
                firstName: user.firstName,
                lastName: user.lastName,  
                email: user.email             
            }
        })
    }

deleteUser = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await User.findOne({ _id: userId });
        console.log("loggedInUser: " + loggedInUser);

        await User.findOneAndDelete({ _id: userId });
        console.log("user deleted");

        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
            secure: true,
            sameSite: "none"
        }).status(200).json({
            success: true,
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }

}

updateUserInfo = async (req, res) => {
    try{
        const body = req.body.data;
        console.log("trying to update profile info")
        console.log(body)
        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'You must provide a body to update',
            })
        }

        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const user = await User.findOne({ _id: userId });
        console.log("THE loggedInUser: " + user);
        console.log(body.firstName)

        user.firstName = body.firstName;
        user.lastName = body.lastName;

        await user.save();
        //returns success even though there was an error need to fix
        return res.status(200).json({
            success: true,
            message: 'Profile was updated'
        })
    } catch (err){
        console.log(err)
        res.json(false);
    }
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    deleteUser,
    updateUserInfo,
}