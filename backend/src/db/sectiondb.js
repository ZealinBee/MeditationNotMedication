const pool = require("./dbconfig");
const SectionError = require('../utils/SectionError');

//@desc Gets all Sections from database
const getAllSections = async (sortBy, order) => {
    const query = `SELECT S.section_id, content_id, content_name, author, section_name, image FROM content AS C, section AS S WHERE S.section_id=C.section_id ORDER BY ${sortBy} ${order};`;
    try {
        return await pool.query(query);
    } catch (error) {
        console.log(error)
        throw new SectionError("SectionDatabaseError", "Unexpected database error");
    }
};

//@desc Gets all content from one section by id
const getSection = async (id, sortBy, order) => {
    const query = `SELECT content_id, content_name, author, section_name, image, description FROM Content AS C LEFT JOIN Section AS S ON C.section_id = S.section_id WHERE C.section_id=$1 ORDER BY ${sortBy} ${order};`;
    try {
        let result = await pool.query(query, [id]);
        if (result.rowCount === 0)
            throw new SectionError("SectionError","Section ID Not Found");
        return result;
    } catch (error) {
        throw new SectionError("SectionDatabaseError", error.details ? error.details : "Unexpected database error");
    }
};

//@desc Gets section_id by section name
const getSectionByName = async (name) => {
    const query = `SELECT section_id FROM Section WHERE section_name=$1;`;
    try {
        let result = await pool.query(query, [name]);
        if (result.rowCount === 0)
            return false;
        return result.rows[0].section_id;
    } catch (error) {
        throw new SectionError("SectionDatabaseError", error.details ? error.details : "Unexpected database error");
    }
};

//@desc Creates new section
const createSection = async (name) => {
    const query = "INSERT INTO \"section\" (section_name) VALUES ($1) RETURNING section_id";
    try {
        let result = await pool.query(query, [name]);
        if (result.rowCount === 0)
            throw new Error;
        return result.rows[0].section_id;
    } catch (error) {
        throw new SectionError("SectionDatabaseError", error.details ? error.details : "Unexpected database error");
    }
}


module.exports = {
    getAllSections: getAllSections,
    getSection: getSection,
    getSectionByName: getSectionByName,
    createSection: createSection
};


