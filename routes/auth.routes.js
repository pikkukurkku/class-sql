const router = require("express").Router();

const db = require("../db");
const bcrypt = require("bcryptjs");

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


res.status(200).json({
    data: {
        ...newUser,
    }
});
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;