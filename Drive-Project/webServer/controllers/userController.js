const User = require('../models/user');

const usersController = {

    /**
     * Expects: { name, gmail, password, image } (from the REQUEST BODY)
     * Return: JSON: { message }
     */
    register: (req, res) => {
        const { name, gmail, password, image } = req.body;

        if (!name || !gmail || !password) {
            return res.status(400).json({ error: "400 Bad Request" });
        }

        // Password validation: minimum 8 characters, only letters and numbers
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }
        if (!/^[a-zA-Z0-9]+$/.test(password)) {
            return res.status(400).json({ error: "Password must contain only letters and numbers" });
        }

        if (User.findByGmail(gmail)) {
            return res.status(404).json({ error: "404 Not Found" });
        }

        User.create({ name, gmail, password, image });
        res.status(201).json({ message: "201 Created" });
    },

    /**
     * Expects: param: gmail (from the URL PARAMETERS)
     * Return: JSON: name, gmail, image
     */
    getUserInfo: (req, res) => {
        const userID = req.params.id;
        
        const user = User.findByID(userID);

        if (!user) {
            return res.status(404).json({ error: "404 Not Found" });
        }

        res.status(200).json({
            name: user.name,
            ID: userID,
            gmail: user.gmail,
            image: user.image
        });
    },

    /**
     * Expects: { gmail, password } (from the REQUEST BODY)
     * Return: JSON: { gmail }
     */
    login: (req, res) => {
        const { gmail, password } = req.body;

        if (!gmail || !password) {
            return res.status(400).json({ error: "400 Bad Request" });
        }

        const user = User.findByGmail(gmail);

        if (!user || !user.verifyPassword(password)) {
            return res.status(404).json({ error: "404 Not Found" });
        }

        // Return the userID as plain text (to be used as token in authorization)
        const userID = Array.from(require('../models/DataBase').users.entries()).find(([id, u]) => u.gmail === gmail)[0];
        res.status(200).send(String(userID));
    }
};

module.exports = usersController;