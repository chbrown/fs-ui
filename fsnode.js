/// <reference path="type_declarations/DefinitelyTyped/node/node.d.ts" />
var path_1 = require('path');
var fs_1 = require('fs');
/**
`path` is a full filepath
`stats` is a fs.Stats object
`children` is a list of filenames
*/
var FSNode = (function () {
    function FSNode(path, stats, children) {
        this.path = path;
        this.stats = stats;
        this.children = children;
    }
    Object.defineProperty(FSNode.prototype, "dirname", {
        get: function () {
            return path_1.dirname(this.path);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FSNode.prototype, "basename", {
        get: function () {
            return path_1.basename(this.path);
        },
        enumerable: true,
        configurable: true
    });
    FSNode.read = function (path, callback) {
        if (!path)
            return callback(null, null);
        fs_1.stat(path, function (error, stats) {
            if (error)
                return callback(error);
            if (!stats.isDirectory()) {
                return callback(null, new FSNode(path, stats, []));
            }
            fs_1.readdir(path, function (error, files) {
                if (error)
                    return callback(error);
                callback(null, new FSNode(path, stats, files));
            });
        });
    };
    return FSNode;
})();
exports.FSNode = FSNode;
