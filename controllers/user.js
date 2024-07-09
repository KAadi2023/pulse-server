import { compare } from 'bcrypt';
import { User } from '../models/user.js'
import { sendToken } from '../utils/common.js';

// create the new user and save it to the database and save in cookies and save token
const register = async (req, res) => {

    const { name, username, password, bio } = req.body;

    const avatar = {
        public_id: "https://google.com",
        url: "https://www.google.com"
    }

    const user = await User.create({
        name,
        username,
        password,
        bio,
        avatar
    })

    sendToken(res, user, 201, "User created successfully")
}

const login = async (req, res) => {

    const { username, password } = req.body;
    // find the user by username and validate password
    const user = await User.findOne({ username }).select('+password');

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    sendToken(res, user, 200, `Welcome Back, ${user.name}`);
};

export { login, register };