const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({message: "Fields are required" });
            return;
        }

        const userToFind = await db.user.findFirst({
         where: {
         email: email,
        },
        });

if(userToFind) {
    res.status(400).json({message: "User already exists"});
    return;
}

const hashedPassword = await bcrypt.hash(password, 10);

const newUser = await db.user.create({
    data: {
        email,
        name,
        password: hashedPassword
    },
    select: {
        email: true,
        name: true,
        password: false
    }
});

delete newUser.password;

res.json({ data: { ...newUser }, success: true });
} catch (error) {
  res.status(500).json({ message: error.message, success: false });
}
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
    
        if (!email || !password) {
          return res.status(400).json({
            message: "Please provide all necessary fields",
            success: false,
          });
        }
    
        const userToFind = await db.user.findFirst({
          where: {
            email,
          },
        });
    
        if (!userToFind) {
          return res
            .status(400)
            .json({ message: "User not found", success: false });
        }

const isPasswordValid = await bcrypt.compare(password, userToFind.password);

if (!isPasswordValid) {
    return res
    .status(400)
    .json({message: "Invalid password", success: false});
}

delete userToFind.password;

const payload = {
    id: userToFind.id,
    email: userToFind.email,
};

const authToken = jwt.sign(payload, process.env.TOKEN_SECRET);
res.status(200).json({ data: {...userToFind, authToken }, success: true });
} catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

module.exports = router;