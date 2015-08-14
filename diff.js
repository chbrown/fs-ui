/// <reference path="type_declarations/index.d.ts" />
var async = require('async');
var _ = require('lodash');
var path_1 = require('path');
var fsnode_1 = require('./fsnode');
function pushAll(array, items) {
    return Array.prototype.push.apply(array, items);
}
function compareDirectories(left, right, callback) {
    var files = _.union(left.children, right.children);
    async.map(files, function (file, callback) {
        var in_left = _.contains(left.children, file);
        var in_right = _.contains(right.children, file);
        var left_child_path = in_left ? path_1.join(left.path, file) : null;
        var right_child_path = in_right ? path_1.join(right.path, file) : null;
        compare(left_child_path, right_child_path, callback);
    }, function (error, children) {
        if (error)
            return callback(error);
        var equal = children.every(function (child) { return child.equal; });
        callback(null, { left: left, right: right, equal: equal, children: children });
    });
}
function compare(left_path, right_path, callback) {
    async.parallel({
        left_node: function (callback) { return fsnode_1.FSNode.read(left_path, callback); },
        right_node: function (callback) { return fsnode_1.FSNode.read(right_path, callback); },
    }, function (error, _a) {
        var left_node = _a.left_node, right_node = _a.right_node;
        if (error)
            return callback(error);
        if (left_node && right_node) {
            if (left_node.stats.isDirectory() && right_node.stats.isDirectory()) {
                return compareDirectories(left_node, right_node, callback);
            }
            else if (left_node.stats.isFile() && right_node.stats.isFile()) {
                if (left_node.stats.size === left_node.stats.size) {
                    return callback(null, { left: left_node, right: right_node, equal: true });
                }
            }
            return callback(null, { left: left_node, right: right_node, equal: false });
        }
        else if (left_node) {
            return callback(null, { left: left_node, right: null, equal: false });
        }
        else {
            return callback(null, { left: null, right: right_node, equal: false });
        }
    });
}
exports.compare = compare;
