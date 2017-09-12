const express = require('express');
const multer = require('multer');
const cors = require('cors');
const winston = require('winston');
const mkdirp = require('mkdirp');
const fs = require('fs');
const p = require('path');
const _ = require('lodash');
var swaggerMetaData = require('./swagger-docs-metadata.json');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var dirs = prefix(file.originalname).split('-');
    
        var dest = p.join('uploads/', p.join.apply(null, dirs));
        // create target dir and make parent dirs if not exists
        mkdirp(dest, function(err) {
            if(err) {
                winston.log('error', 'can not mkdir for %s', dest)
            } else {
                swaggerMetaData = _.mergeWith(swaggerMetaData, metaOf(dest, file.originalname, p.sep), (objValue, srcValue) => {
                    if (_.isArray(objValue)) {
                        var it = item => item.version;
                        return _.sortBy(_.uniqBy(objValue.concat(srcValue), it), it) ;
                    }
                });

                fs.writeFile('swagger-docs-metadata.json', JSON.stringify(swaggerMetaData, null, 2), (err) => {
                    if (err) throw err;
                    cb(null, dest);
                    console.log('It\'s saved!');
                });
            }
        });
    },
   filename: function(req, file, cb) {
       cb(null, file.originalname);
   }
});

function metaOf(swaggerPath, filename, sep) {
    var keys = swaggerPath.split(sep);
    var parent, result = {};
    parent = result;
    
    for (var j = 0; j < keys.length - 2; j++) {
        parent = parent[keys[j]] = parent[keys[j]] || {};
    }

    var lastOne = {version: keys[keys.length - 1], filename: filename};

    parent[keys[keys.length - 2]] = [lastOne];

    return result;
}

const allowedFileTypes = [".yaml", ".yml", ".json"];

function suffix(filename) {
    let startOfSuffix = filename.lastIndexOf(".");
    return filename.substring(startOfSuffix);
}

function prefix(filename) {
    let startOfSuffix = filename.lastIndexOf(".");
    return filename.substring(0, startOfSuffix);
}

function validSuffix(filename) {
    if(!allowedFileTypes.includes(suffix(filename))) {
        winston.log('error', 
        "We don't accept any file except that ends with .yaml, .yml or .json, but your file suffix is %s", suffix(filename));
        return {
            status: false,
            errorMsg: "We don't accept any file except that ends with .yaml, .yml or .json, but your file suffix is " + suffix(filename)
        };
    }

    return {status: true, errorMsg: null};
}

function validFormat(filename) {
    var dirs = prefix(filename).split('-');
    if(dirs.length < 3) {
        winston.log('error', 'Your filename is not valid, Must be likes `so-iam-v1.yaml`., but your filename is `%s`', filename);
        return {
            status: false,
            errorMsg: "Your filename is not valid, Must be likes `so-iam-v1.yaml`. but your filename is " + filename
        };
    }
    return {status: true, errorMsg: null};
}

const filter = function(req, file, cb) {
    var result = validSuffix(file.originalname)
    if(result.status) {
        result = validFormat(file.originalname);
    }

    cb(result.errorMsg, result.status);
}

const upload = multer({storage: storage, fileFilter: filter});

var app = express();

app.use(cors())
app.post('/docs', upload.any(), function(req, res, next) {
    res.redirect('back');
})

app.use(express.static('./'))
app.listen(3000, function() {
    console.log('the upload server is started on http://localhost:3000')
});

exports.validSuffix = validSuffix;
exports.metaOf = metaOf;
exports.validFormat = validFormat;
