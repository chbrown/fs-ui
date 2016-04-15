import * as async from 'async';
import {createReadStream} from 'fs';
import {join, dirname} from 'path';
import {FSNode, FSNodeStructure,
        nullChecksum, hashString, hashStream,
        readStructure, read} from 'fs-metadata';

export interface FSNodePair {
  left: FSNode;
  right: FSNode;
  equal: boolean;
  children?: FSNodePair[];
}

type CompareCallback = (error: Error, pair?: FSNodePair) => void;

/**
Compare two FSNodes on the basis of their {name} value.

    If a < b,  return -1
    If a == b, return 0
    If a > b,  return 1

undefined is considered to be very, very large.
*/
function cmpFSNodes(a: FSNode, b: FSNode): number {
  if (a === undefined) {
    return 1;
  }
  if (b === undefined) {
    return -1;
  }
  // they won't *both* be undefined, honest
  return a.name.localeCompare(b.name);
}

function zipLike<T>(xs: T[], ys: T[], cmp: (x: T, y: T) => number): [T, T][] {
  let x_i = 0;
  const xs_length = xs.length;
  let y_i = 0;
  const ys_length = ys.length;
  const pairs: [T, T][] = [];
  while (x_i < xs_length || y_i < ys_length) {
    const x = xs[x_i];
    const y = ys[y_i];
    const rel = cmp(x, y);
    if (rel === 0) {
      // x = y
      pairs.push([x, y]);
      x_i++;
      y_i++;
    }
    else if (rel < 0) {
      // x < y
      pairs.push([x, null]);
      x_i++;
    }
    else {
      // y > x
      pairs.push([null, y]);
      y_i++;
    }
  }
  return pairs;
}

function compareDirectories(left: FSNode & {path: string},
                            right: FSNode & {path: string},
                            callback: CompareCallback): void {
  // console.log('compareDirectories', left, right);
  const left_right_pairs = zipLike(left.children, right.children, cmpFSNodes);
  async.map(left_right_pairs, ([leftChild, rightChild], callback) => {
    const leftChild_path = leftChild ? join(left.path, leftChild.name) : null;
    const rightChild_path = rightChild ? join(right.path, rightChild.name) : null;
    compare(leftChild_path, rightChild_path, callback);
  }, (error, children: FSNodePair[]) => {
    if (error) return callback(error);

    const equal = children.every(child => child.equal);

    callback(null, {left, right, equal, children});
  });
}

export function compare(leftPath: string,
                        rightPath: string,
                        callback: CompareCallback): void {
  async.parallel<FSNode>({
    // atom shell incorrectly wraps fs.lstat, so we need to check for null here, first
    leftNode: callback => leftPath ? readCached(leftPath, callback) : setImmediate(callback),
    rightNode: callback => rightPath ? readCached(rightPath, callback) : setImmediate(callback),
  }, (error, {leftNode, rightNode}) => {
    if (error) return callback(error);
    if (leftNode && rightNode) {
      if (leftNode.type == 'directory' && rightNode.type == 'directory') {
        return compareDirectories(Object.assign(leftNode, {path: leftPath}), Object.assign(rightNode, {path: rightPath}), callback);
      }
      else if (leftNode.type == 'file' && rightNode.type == 'file') {
        if (leftNode.size === rightNode.size) {
          return callback(null, {left: leftNode, right: rightNode, equal: true});
        }
      }
      return callback(null, {left: leftNode, right: rightNode, equal: false});
    }
    else if (leftNode) {
      return callback(null, {left: leftNode, right: null, equal: false});
    }
    else { // if (rightNode) {
      return callback(null, {left: null, right: rightNode, equal: false});
    }
  });
}

interface CacheClient {
  get(key: string, callback: (error: Error, value?: string) => void): void;
  set(key: string, value: string, callback: (error: Error) => void): void;
}
const localStoragePrefix = 'cache:';
/**
localStorage-backed for now, but with an async API so, e.g., Redis can be incorporated later
*/
const cacheClient = {
  get(key: string, callback: (error: Error, value?: string) => void) {
    const value = localStorage.getItem(localStoragePrefix + key);
    setImmediate(() => callback(null, value));
  },
  set(key: string, value: string, callback: (error: Error) => void) {
    localStorage.setItem(localStoragePrefix + key, value);
    setImmediate(() => callback(null));
  },
};

function getSet(cacheClient: CacheClient,
                key: string,
                fallback: (key: string, callback: (error: Error, value: string) => void) => void,
                callback: (error: Error, value?: string) => void) {
  cacheClient.get(key, (error, value) => {
    if (error) return callback(error);
    if (value !== undefined && value !== null) {
      callback(null, value);
    }
    else {
      fallback(key, (error, value) => {
        if (error) return callback(error);
        cacheClient.set(key, value, (error) => {
          if (error) return callback(error);
          callback(null, value);
        });
      });
    }
  });
}

function readChecksumsCached(node: FSNodeStructure,
                             parentPath: string,
                             callback: (error: Error, node?: FSNode) => void): void {
  const path = join(parentPath, node.name);
  if (node.type == 'directory') {
    async.map<FSNodeStructure, FSNode>(node.children, (childNode, callback) => {
      readChecksumsCached(childNode, path, callback);
    }, (error, nodes) => {
      if (error) return callback(error);
      // the directory checksum is somewhat arbitrary, but relatively simple
      const checksum = hashString(nodes.map(node => node.name + node.checksum).join('\n'));
      callback(null, Object.assign(node, {checksum, children: nodes}));
    });
  }
  else if (node.type == 'file') {
    // files require a checksum
    getSet(cacheClient, path, (path, callback) => {
      // fallback: actually read the file
      hashStream(createReadStream(path), callback);
    }, (error, checksum) => {
      // console.log(`getSet result for "${path}":`, error, checksum);
      callback(null, Object.assign(node, {checksum, children: undefined}));
    });
  }
  else if (node.type == 'symlink') {
    // it's a silly checksum, but it keeps things uniform
    const checksum = hashString(node.target);
    callback(null, Object.assign(node, {checksum, children: undefined}));
  }
  else {
    callback(null, Object.assign(node, {checksum: nullChecksum, children: undefined}));
  }
}

/**
Like fs-metadata.read(), but with checksum caching
*/
export function readCached(path: string, callback: (error: Error, node?: FSNode) => void): void {
  readStructure(path, (error, node) => {
    if (error) return callback(error);
    readChecksumsCached(node, dirname(path), callback);
  });
}
