const db = require('./DataBase');

class User {
    #password;

    constructor(name, gmail, password, image) {
        this.name = name;
        this.gmail = gmail;
        this.#password = password;
        this.image = image;
    }

    /**
     * @param {string} inputPassword 
     * @returns {boolean}
     */
    verifyPassword(inputPassword) {
        return this.#password === inputPassword;
    }

    /**
     * @param {object} userData 
     * @returns {User}
     */
    static create(userData) {
        const newUser = new User(
            userData.name,
            userData.gmail,
            userData.password,
            userData.image
        );
        
        const newUserId = db.generateUID();
        db.users.set(newUserId, newUser);
        return newUser;
    }

    static getAllUsers() {
        return Array.from(db.users.values());
    }

    static findByGmail(gmail) {
        return Array.from(db.users.values()).find(u => u.gmail === gmail);
    }


    static findByID(userID) {
        // go through Map values to find the user
        // Handle both string and number IDs
        const searchId = String(userID);
        for (const [id, user] of db.users.entries()) {
            if (String(id) === searchId) {
                return user;
            }
        }
        return null;
    }
}

module.exports = User;