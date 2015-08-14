/// <reference path="type_declarations/index.d.ts" />
import async = require('async');
import _ = require('lodash');
import {join} from 'path';
import fs = require('fs');
import {FSNode} from './fsnode';

function pushAll<T>(array: T[], items: T[]): void {
  return Array.prototype.push.apply(array, items);
}

export interface FSNodePair {
  left: FSNode;
  right: FSNode;
  equal: boolean;
  children?: FSNodePair[];
}

interface CompareCallback {
  (error: Error, pair?: FSNodePair): void;
}

function compareDirectories(left: FSNode,
                            right: FSNode,
                            callback: CompareCallback) {
  var files = _.union(left.children, right.children);
  async.map(files, (file, callback) => {
    var in_left = _.contains(left.children, file);
    var in_right = _.contains(right.children, file);
    var left_child_path = in_left ? join(left.path, file) : null;
    var right_child_path = in_right ? join(right.path, file) : null;
    compare(left_child_path, right_child_path, callback);
  }, (error, children: FSNodePair[]) => {
    if (error) return callback(error);

    var equal = children.every(child => child.equal);

    callback(null, {left, right, equal, children});
  });
}

export function compare(left_path: string,
                        right_path: string,
                        callback: CompareCallback) {
  async.parallel<FSNode>({
    left_node: (callback) => FSNode.read(left_path, callback),
    right_node: (callback) => FSNode.read(right_path, callback),
  }, (error, {left_node, right_node}) => {
    if (error) return callback(error);
    if (left_node && right_node) {
      if (left_node.stats.isDirectory() && right_node.stats.isDirectory()) {
        return compareDirectories(left_node, right_node, callback);
      }
      else if (left_node.stats.isFile() && right_node.stats.isFile()) {
        if (left_node.stats.size === left_node.stats.size) {
          return callback(null, {left: left_node, right: right_node, equal: true});
        }
      }
      return callback(null, {left: left_node, right: right_node, equal: false});
    }
    else if (left_node) {
      return callback(null, {left: left_node, right: null, equal: false});
    }
    else { // if (right_node) {
      return callback(null, {left: null, right: right_node, equal: false});
    }
  });
}
