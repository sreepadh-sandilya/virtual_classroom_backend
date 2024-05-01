const vcDb = require('../connection/poolConnection');

const validator = require('validator');

const userController = {
    testConnection: async (req, res) => {
        return res.status(200).send({
            "message": "User is up. 👍🏻",
            "WHO": "User"
        });
    },


    getAllDepartments: async (req, res) => {
        const db_connection = await vcDb.promise().getConnection();


        try {

            await db_connection.query(`LOCK TABLES departmentData READ`);

            const [rows] = await db_connection.query(`SELECT * FROM departmentData`);

            await db_connection.query(`UNLOCK TABLES`);

            return res.status(200).send({
                "message": "Departments fetched successfully.",
                "data": rows
            });

        } catch (err) {
            console.log(err);
            const time = new Date();
            fs.appendFileSync('logs/user.log', `${time.toISOString()} - getAllDepartments - ${err}\n`);
            return res.status(400).send({ "message": "Internal Server Error." });
        } finally {
            await db_connection.query(`UNLOCK TABLES`);
            db_connection.release();
        }
    },

    getDepartmentById: async (req, res) => {
        const db_connection = await vcDb.promise().getConnection();

        if (!validator.isNumeric(req.params.deptId)) {
            return res.status(400).send({
                "message": "Invalid Department ID."
            });
        }

        try {

            req.params.deptId = parseInt(req.params.deptId);

            await db_connection.query(`LOCK TABLES departmentData READ`);

            const [rows] = await db_connection.query(`SELECT * FROM departmentData WHERE deptId = ?`, [req.params.deptId]);

            await db_connection.query(`UNLOCK TABLES`);

            return res.status(200).send({
                "message": "Departments fetched successfully.",
                "data": rows
            });

        } catch (err) {
            console.log(err);
            const time = new Date();
            fs.appendFileSync('logs/user.log', `${time.toISOString()} - getAllDepartments - ${err}\n`);
            return res.status(400).send({ "message": "Internal Server Error." });
        } finally {
            await db_connection.query(`UNLOCK TABLES`);
            db_connection.release();
        }
    },
}

module.exports = userController;