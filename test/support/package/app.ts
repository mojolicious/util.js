import assert from 'node:assert/strict';
import {type JSONValue, jsonPointer} from '@mojojs/util';

const data: JSONValue = {hello: ['TypeScript!']};
assert.equal(jsonPointer(data, '/hello/0'), 'TypeScript!');

console.log('TypeScript consumer works');
