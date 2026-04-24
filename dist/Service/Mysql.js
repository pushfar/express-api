// @ts-ignore - Optional peer dependency
import mysql2 from 'mysql2/promise';
/**
 * @module express-api/Service/Mysql
 * @class Mysql
 * @description Service class providing database connection using mysql2
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 * @example
 * new Mysql('192.168.1.10', 3306, 'your_db', 'your_user', 'your_password');
 */
export default class Mysql {
    /**
     * @public @method constructor
     * @description Base method when instantiating class
     */
    constructor(host, port, db, user, password, name = 'mysql') {
        // create mysql2
        this.mysql = mysql2;
        // cache
        this.name = name;
        this.service = name + ':' + db;
        this.host = host;
        this.port = port;
        this.db = db;
        this.user = user;
        this.password = password;
    }
    connect() {
        return this.mysql.createConnection({
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.db
        }).then((con) => {
            this.con = con;
            delete this.user;
            delete this.password;
        });
    }
    end() {
        if (this.con == null)
            return Promise.resolve();
        return this.con.end();
    }
}
//# sourceMappingURL=Mysql.js.map