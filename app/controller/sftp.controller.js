const Client = require('ssh2-sftp-client');
const cfgsfpt = require('../config/config_sftp.js');
let fs = require('fs');
const reel = require('node-reel');
const path = require('path');
const { url } = require('inspector');
const rutatmp = require('../config/config_sftp').rutatmp;
const rutadescargas = require('../config/config_sftp').rutadescargas;
const sftp_descargados = require('../config/config_sftp').sftp_descargados;
// https://www.npmjs.com/package/ssh2-sftp-client#orgb9fbf50

exports.listar_sftp = (req, res) => {
    let cliente = new Client();
    console.clear();
    console.log("Iniciando ciclo...");

    /* cliente.connect(cfgsfpt)
        .then(() => {
            return cliente.exists('/path/to/remote/dir');
        })
        .then(async(data) => {
            console.log("xxxxxxxxx", data); // will be false or d, -, l (dir, file or link)
        })
        .then(() => {
            cliente.end();
        })
        .catch(err => {
            console.error(err.message);
        }); */

    try {
        console.log(sftp_descargados);

        cliente.connect(cfgsfpt).then(() => {
                return cliente.exists(sftp_descargados);
                // return cliente.list('/', '*.pdf')
            })
            .then(resp => {
                if (resp === 'd') {
                    return cliente.list('/', '*.pdf');
                } else {
                    cliente.end();
                    return res.status(500).json({
                        result: 'Error',
                        msg: 'El directorio remoto no existe...'
                    })

                    // throw Error('El directorio remoto no existe...');

                }
            })
            .then(async(data) => {
                let files = data.map(n => n.name);
                await Promise.all(files.map((archivo) => {
                    let remoteFilePath = '/' + archivo;
                    return cliente.get(remoteFilePath).then((stream) => {
                        let nfile = rutatmp + '/' + archivo;
                        console.log("Recibiendo: ", archivo);
                        fs.writeFile(nfile, stream, (err) => {
                            if (err) {
                                console.log("Se ha producido un error: ", err);
                            } else {
                                console.log("Enviando: ", archivo)
                                cliente.put(stream, sftp_descargados + '/' + archivo);
                            }
                        })
                    });
                }))
                console.log("Fin del ciclo...");
                return res.status(200).json({
                    result: 'Ok',
                    msg: 'Proceso terminado...',
                    files: files
                })

            })
            .catch(e => {
                console.log("e.message: ", e.message);
            })

    } catch (error) {
        console.log("Msg: ", error.message);
    }

};

async function main() {
    const client = new Client('upload-test');
    const src = '/';

    try {
        await client.connect(cfgsfpt);
        client.on('download', info => {
            console.log(`Listener: Download ${info.source}`);
        });
        let rslt = await client.downloadDir(src, rutatmp);
        return rslt;
    } finally {

        client.end();
    }
}

async function descarga() {
    let sftp = new Client();
    console.clear();
    console.log("Iniciando proceso...");
    try {
        sftp.connect(cfgsfpt).then(() => {
            return sftp.list('/', '*.pdf');
        }).then(async(data) => {

            len = data.length;
            console.log("Archivos encontrados: => ", len);
            await data.forEach(x => {
                let remoteFilePath = '/' + x.name;
                sftp.get(remoteFilePath).then((stream) => {
                    let file = rutatmp + '/' + x.name;
                    console.log("Descargando...", remoteFilePath);

                    const xy = fs.writeFile(file, stream, (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            sftp.put(stream, '/Descargados/' + x.name);
                        };
                    });
                });
            })
        })

    } catch (error) {
        return error;
    } finally {

        sftp.end();
    }
}

async function ciclo() {
    let cliente = new Client();
    console.clear();
    console.log("Iniciando ciclo...");
    try {

        cliente.connect(cfgsfpt).then(() => {
                return cliente.list('/', '*.pdf')
            })
            .then(async(data) => {
                let filesx = data.map(n => n.name);
                await Promise.all(filesx.map((archivo) => {
                    let remoteFilePath = '/' + archivo;
                    return cliente.get(remoteFilePath).then((stream) => {
                        let nfile = rutatmp + '/' + archivo;
                        console.log("Procesando: ", archivo);
                        fs.writeFile(nfile, stream, (err) => {
                            if (err) {
                                console.log("Se ha producido un error: ", err);
                            } else {
                                cliente.put(stream, '/Descargados/' + archivo);
                            }
                        })
                    });
                }))
                console.log("Fin del ciclo...");
            })

    } catch (error) {
        console.log("Msg: ", error.message);
    }
}