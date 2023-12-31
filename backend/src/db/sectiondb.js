const pool = require("./dbconfig");
const SectionError = require('../utils/SectionError');

//@desc Gets all Sections from database
const getAllSections = async () => {
    const query = "SELECT S.section_id, content_id, content_name, author, section_name, image FROM content AS C, section AS S WHERE S.section_id=C.section_id;";
    try {
        return await pool.query(query);
    } catch (error) {
        throw new SectionError("SectionDatabaseError", "Unexpected database error");
    }
};

//@desc Gets all content from one section
const getSection = async (id) => {
    const query = `SELECT content_id, content_name, author, section_name, image, description FROM Content AS C LEFT JOIN Section AS S ON C.section_id = S.section_id WHERE C.section_id=${id};`;
    try {
        let result = await pool.query(query);
        if (result.rowCount === 0)
            throw new SectionError("SectionError","Section ID Not Found");
        return result;
    } catch (error) {
        throw new SectionError("SectionDatabaseError", error.details ? error.details : "Unexpected database error");
    }
};


module.exports = {
    getAllSections: getAllSections,
    getSection: getSection
};


