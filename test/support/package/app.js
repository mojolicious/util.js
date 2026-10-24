import assert from 'node:assert/strict';
import {xmlEscape} from '@mojojs/util';

assert.equal(xmlEscape('<p>Hello JavaScript!</p>'), '&lt;p&gt;Hello JavaScript!&lt;/p&gt;');

console.log('JavaScript consumer works');
