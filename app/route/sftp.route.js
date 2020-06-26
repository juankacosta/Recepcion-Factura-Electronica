module.exports = function(app) {
    const sftp_ctr = require('../controller/sftp.controller');

    app.get("/api/listar_sftp", sftp_ctr.listar_sftp)
}