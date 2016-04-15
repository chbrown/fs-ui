import {join} from 'path';
import {FSNode} from 'fs-metadata';
import {flatMap} from 'tarry';

export const bind: MethodDecorator = <T extends Function>(target: Object,
                                                          propertyKey: string | symbol,
                                                          descriptor: TypedPropertyDescriptor<T>) => {
  return {
    configurable: true,
    get() {
      const value = descriptor.value.bind(this);
      Object.defineProperty(this, propertyKey, {
        value,
        configurable: true,
        writable: true
      });
      return value;
    }
  };
}

export type FSNodeWithDepth = FSNode & {depth: number, path: string};

export function flattenFSNode(node: FSNode, parentPath: string, depth = 0): FSNodeWithDepth[] {
  const path = join(parentPath, node.name);
  return [
    Object.assign({depth, path}, node),
    ...flatMap(node.children || [], childNode => flattenFSNode(childNode, path, depth + 1)),
  ];
}

export function compileFunction<T extends Function>(...args: string[]): T {
  try {
    const func = Function(...args);
    return func as any;
  }
  catch (exc) {
    // console.error('Failed to compile', exc);
    return (() => { throw exc; }) as any;
  }
}
