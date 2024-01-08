const pool = require("./dbconfig")
const UserError = require('../utils/UserError');
const { encrypt, compare } = require("../utils/passwordEncryption");

//@desc Creates new user in database
const createUser = async (newUser) => {
    newUser.password = await encrypt(newUser.password);
    const query = `INSERT INTO "user" (user_name, email, password) VALUES ($1, $2, $3) RETURNING user_id;`;
    try {
        const result = await pool.query(query, [newUser.name, newUser.email, newUser.password]);

        if (result.rowCount === 0) 
            throw new UserError("AuthenticationError", "Email doesn't exist");

        return result.rows[0];
    } catch (error) {
        if (error.message === "duplicate key value violates unique constraint \"email\"")
            throw new UserError("EmailValidationError", "Email already exists");
        throw new UserError("UserDatabaseError", "Unexpected database error");
    }
};

//@desc Logs in user
const loginUser = async (user) => {
    const query = `SELECT user_id, user_name AS name, password AS encryptedpassword, image, role  FROM "user" WHERE email = $1`;
    try {
        const results = await pool.query(query, [user.email]);

        if (results.rowCount === 0) 
            throw new UserError("AuthenticationError", "Email doesn't exist");

        const { user_id, name, encryptedpassword, image, role } = results.rows[0]; 
        const isPasswordValid = await compare(user.password, encryptedpassword)

        if (isPasswordValid) 
            return { "name": name, "image": image, "user_id": user_id, "role": role };
        throw new UserError("AuthenticationError", "Wrong or no password");
    } catch (error) {
        throw new UserError("AuthenticationError", error.details ? error.details : "Unexpected database error");
    }
};

const getUser = async (user) => {
    const query = `SELECT user_id AS id, user_name AS name, image, email, role  FROM "user" WHERE user_id = $1`;
    try {
        const results = await pool.query(query, [user.id]);
        
        if (results.rowCount === 0) 
            throw new UserError("UserDatabaseError", "User doesn't exist");

        const fetchedUser = results.rows[0]; 
        return fetchedUser;
    } catch (error) {
        throw new UserError("UserDatabaseError", error.details ? error.details : "Unexpected database error");
    }
};

//@desc Change user's data except for password and role
const changeUser = async (updatedUser, user) => {
    const query = `UPDATE "user" SET user_name=$1, email=$2, image=$3 WHERE user_id=$4`;
    try {
        if (user.name === updatedUser.name && user.email === updatedUser.email && user.image === updatedUser.image)
            throw new UserError("UserDatabaseError", "No new data provided for update");
    
        const results = await pool.query(query, [updatedUser.name, updatedUser.email, updatedUser.image, user.id]);

        if (results.rowCount === 0) 
            throw new UserError("UserDatabaseError", "User doesn't exist");

    } catch (error) {
        throw new UserError("UserDatabaseError", error.details ? error.details : "Unexpected database error");
    }
};

//@desc Change user's password
const changeUserPassword = async (password, user) => {
    const query = `UPDATE "user" SET password=$1 WHERE user_id=$2 RETURNING user_name as name, user_id as id, email, image, role;`;
    try {
        password = await encrypt(password);
        const results = await pool.query(query, [password, user.id]);

        if (results.rowCount === 0) 
            throw new UserError("UserDatabaseError", "User doesn't exist");

        return results;
    } catch (error) {
        throw new UserError("UserDatabaseError", error.details ? error.details : "Unexpected database error");
    }
};

//@desc Deletes one user
const deleteSingleUser = async (user) => {
    const query = "DELETE FROM \"user\" WHERE user_id = $1 RETURNING user_name as name, user_id as id, email, image, role;"
    try {
        const results =  await pool.query(query, [user.id]);

        if (results.rowCount === 0) 
            throw new UserError("UserDatabaseError", "User doesn't exist");

        return results.rows[0];
    } catch (error) {
        throw new UserError("UserDatabaseError", error.details ? error.details : "Unexpected database error");
    }
};

//@desc Gets all users
const getAllUsers = async () => {
    const query = "SELECT user_id, user_name, email, image, role FROM \"user\";"
    try {
        const results =  await pool.query(query);
        return results.rows;
    } catch (error) {
        throw new UserError("UserDatabaseError", error.details ? error.details : "Unexpected database error");
    }
};

//@desc Changes user's role
const changeUserRole = async (role, user_id) => {
    const query = "UPDATE \"user\" SET role=$1 WHERE user_id=$2;"
    try {
        if (role !== 0 && role !== 1)
            throw new UserError("UserDatabaseError", "Passed role value is invalid");
        
        const results =  await pool.query(query, [role, user_id]);
        
        if (results.rowCount === 0) 
            throw new UserError("UserDatabaseError", "User doesn't exist");

        return results;
    } catch (error) {
        throw new UserError("UserDatabaseError", error.details ? error.details : "Unexpected database error");
    }
};


//@desc Clears database
const clearUsers = async () => {
    const query = `DELETE FROM "user";`;
    try {
        await pool.query(query);
    } catch (error) {
        console.log(error);
        throw new UserError("UserDatabaseError", "Unexpected database error");
    }
};

//@desc Seeds database with mock data
const seedDb = async () => {
    let query = "INSERT INTO \"user\" (email, user_name, password) VALUES ('RomanZin@gmail.com', 'Roman', '$2b$10$SL1V.hi1uVJD9P.OQK3MpOW3i2apznVjp.hKez.HGG/e9mqST4rvG');"
    query += "INSERT INTO \"user\" (user_name, email, password) VALUES ('ADMIN', 'ADMIN', '$2b$10$tiiq4L6hsZTQCStM54lI4etpYHiduUjFmTjmeNGnXgEsMwS8K4WBq');"
    query += "UPDATE \"user\" SET role=1 WHERE email='ADMIN';"
    try {
        await pool.query(query);
    } catch (error) {
        console.log(error);
        throw new UserError("UserDatabaseError", "Unexpected database error");
    }
};

module.exports = {
    createUser: createUser,
    loginUser: loginUser,
    getUser: getUser,
    changeUser: changeUser,
    changeUserPassword: changeUserPassword,
    deleteSingleUser: deleteSingleUser,
    getAllUsers: getAllUsers,
    changeUserRole: changeUserRole,
    clearUsers: clearUsers,
    seedDb: seedDb
};

