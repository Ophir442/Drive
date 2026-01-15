/* 
    for part 3 of the project, we just need to notice what actions do need a logged-in user
    and wich dont. 
    later we will make it impossible to do actions like patch if you are not a logged-in user.
*/


const authorizer = (req, res, next) => {
    // Extract user ID from Authorization header (Bearer token format)
    const authHeader = req.headers['authorization'];
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        userId = authHeader.substring(7); // Remove "Bearer " prefix
    }

    // if there isnt a user ID in the url for an action that needs a logged-in user, we return an unauthorized error
    // if (!userId) {
    //     /*
    //     for part 3 of the project, we will allow actions without a logged-in user
    //     for part 4, we will uncomment the following line to enforce authorization
    //     + we will check the user exists in the database
    //     */
    //     return res.status(401).json({ error: "Unauthorized: Missing User ID" });
    // }

    // save user id to request object for further use in controllers
    req.userId = userId;
    next();
};

module.exports = authorizer;