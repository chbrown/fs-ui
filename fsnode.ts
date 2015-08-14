/// <reference path="type_declarations/DefinitelyTyped/node/node.d.ts" />
import {join, dirname, basename} from 'path';
import {readdir, stat, Stats} from 'fs';

/**
`path` is a full filepath
`stats` is a fs.Stats object
`children` is a list of filenames
*/
export class FSNode {
  constructor(public path: string,
              public stats: Stats,
              public children: string[]) { }

  get dirname(): string {
    return dirname(this.path);
  }

  get basename(): string {
    return basename(this.path);
  }

  static read(path: string, callback: (error: Error, node?: FSNode) => void) {
    if (!path) return callback(null, null);
    stat(path, (error: Error, stats: Stats) => {
      if (error) return callback(error);

      if (!stats.isDirectory()) {
        return callback(null, new FSNode(path, stats, []));
      }

      readdir(path, (error: Error, files: string[]) => {
        if (error) return callback(error);

        callback(null, new FSNode(path, stats, files));
      });
    });
  }
}
