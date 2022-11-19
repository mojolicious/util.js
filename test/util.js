import {setTimeout} from 'node:timers/promises';
import {
  AbortError,
  AsyncHooks,
  captureOutput,
  cssUnescape,
  decodeURIComponentSafe,
  escapeRegExp,
  jsonPointer,
  SafeString,
  stickyMatch,
  tablify,
  termEscape,
  urlSplit,
  xmlEscape,
  xmlUnescape
} from '../lib/util.js';
import t from 'tap';

t.test('Util', async t => {
  await t.test('captureOutput', async t => {
    const output = await captureOutput(async () => {
      console.log('test works');
    });
    t.match(output, /test works/);

    let output2, error;
    try {
      output2 = await captureOutput(async () => {
        throw new Error('Capture error');
      });
    } catch (err) {
      error = err;
    }
    t.same(output2, undefined);
    t.match(error, /Capture error/);

    const output3 = await captureOutput(
      async () => {
        process.stdout.write('works');
        process.stderr.write('too');
      },
      {stderr: true}
    );
    t.match(output3, /workstoo/);
  });

  t.test('cssUnescape', t => {
    t.equal(cssUnescape('#\\n\\002603x'), '#☃x');
    t.end();
  });

  t.test('escapeRegExp', t => {
    t.equal(escapeRegExp('te*s?t'), 'te\\*s\\?t');
    t.equal(escapeRegExp('\\^$.*+?()[]{}|'), '\\\\\\^\\$\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|');
    t.end();
  });

  t.test('decodeURIComponentSafe', t => {
    const decode = decodeURIComponentSafe;
    t.same(decode('%E0%A4%A'), null);
    t.same(decode('te%2fst'), 'te/st');
    t.same(decode('te%2Fst'), 'te/st');
    t.end();
  });

  t.test('jsonPointer (RFC 6901)', t => {
    t.equal(jsonPointer({hello: 'world'}, '/hello'), 'world', 'right result');
    t.same(jsonPointer({hello: 'world'}, '/bye'), undefined, 'no result');
    t.same(jsonPointer({hello: 'world'}, '/'), undefined, 'no result');
    t.same(jsonPointer({hello: 'world'}, '/0'), undefined, 'no result');
    t.same(jsonPointer({hello: null}, '/hello'), null, 'right result');

    t.same(jsonPointer([], '/0'), undefined, 'no result');
    t.same(jsonPointer(['test', 123], '/0'), 'test', 'right result');
    t.same(jsonPointer(['test', 123], '/1'), 123, 'right result');
    t.same(jsonPointer('test', ''), 'test', 'right result');
    t.same(jsonPointer('', '/0'), undefined, 'no result');
    t.same(jsonPointer('test', '0'), undefined, 'no result');

    const value = {
      foo: ['bar', 'baz'],
      '': 0,
      'a/b': 1,
      'c%d': 2,
      'e^f': 3,
      'g|h': 4,
      'i\\j': 5,
      'k"l': 6,
      ' ': 7,
      'm~n': 8
    };
    t.same(jsonPointer(value, ''), value, 'empty pointer is whole document');
    t.same(jsonPointer(value, '/foo'), ['bar', 'baz'], '"/foo" is "["bar", "baz"]"');
    t.same(jsonPointer(value, '/'), 0, '"/" is 0');
    t.same(jsonPointer(value, '/a~1b'), 1, '"/a~1b" is 1');
    t.same(jsonPointer(value, '/c%d'), 2, '"/c%d" is 2');
    t.same(jsonPointer(value, '/e^f'), 3, '"/e^f" is 3');
    t.same(jsonPointer(value, '/g|h'), 4, '"/g|h" is 4');
    t.same(jsonPointer(value, '/i\\j'), 5, '"/i\\j" is 5');
    t.same(jsonPointer(value, '/k"l'), 6, '"/k"l" is 6');
    t.same(jsonPointer(value, '/ '), 7, '"/ " is 7');
    t.same(jsonPointer(value, '/m~0n'), 8, '"/m~0n" is 8');
    t.end();
  });

  t.test('stickyMatch', t => {
    const regex = /\s*(test\d)/y;
    const results = [];
    const sticky = {offset: 0, value: 'test1 test2 test3 test4'};
    while (sticky.value.length > sticky.offset) {
      const match = stickyMatch(sticky, regex);
      if (match === null) break;
      results.push(match[1]);
    }
    t.same(results, ['test1', 'test2', 'test3', 'test4']);
    t.end();
  });

  t.test('tablify', t => {
    t.equal(typeof tablify, 'function');
    t.equal(tablify([['foo']]), 'foo\n');
    t.equal(tablify([['f\r\no o\r\n', 'bar']]), 'fo o  bar\n');
    t.equal(tablify([['  foo', '  b a r']]), '  foo    b a r\n');
    t.equal(
      tablify([
        ['foo', 'yada'],
        ['yada', 'yada']
      ]),
      'foo   yada\nyada  yada\n'
    );
    t.equal(
      tablify([
        [undefined, 'yada'],
        ['yada', null]
      ]),
      '      yada\nyada  \n'
    );
    t.equal(
      tablify([
        ['foo', 'bar', 'baz'],
        ['yada', 'yada', 'yada']
      ]),
      'foo   bar   baz\nyada  yada  yada\n'
    );
    t.equal(
      tablify([
        ['a', '', 0],
        [0, '', 'b']
      ]),
      'a    0\n0    b\n'
    );
    t.equal(tablify([[1, 2], [3]]), '1  2\n3\n');
    t.equal(tablify([[1], [2, 3]]), '1\n2  3\n');
    t.equal(tablify([[1], [], [2, 3]]), '1\n\n2  3\n');
    t.end();
  });

  t.test('termEscape', t => {
    t.equal(typeof termEscape, 'function');
    t.equal(termEscape('Accept: */*\x0d\x0a'), 'Accept: */*\\x0d\x0a');
    t.equal(termEscape('\t\b\r\n\f'), '\\x09\\x08\\x0d\n\\x0c');
    t.equal(termEscape('\x00\x09\x0b\x1f\x7f\x80\x9f'), '\\x00\\x09\\x0b\\x1f\\x7f\\x80\\x9f');
    t.end();
  });

  t.test('urlSplit', t => {
    t.same(urlSplit(''), {authority: '', fragment: '', path: '', query: '', scheme: ''});

    t.same(urlSplit('http://foo:bar@example.com:3000/test/index.html?foo=bar#test'), {
      authority: 'foo:bar@example.com:3000',
      fragment: 'test',
      path: '/test/index.html',
      query: 'foo=bar',
      scheme: 'http'
    });
    t.same(urlSplit('http://☃.net./♥'), {authority: '☃.net.', fragment: '', path: '/♥', query: '', scheme: 'http'});
    t.same(urlSplit('//example.com'), {authority: 'example.com', fragment: '', path: '', query: '', scheme: ''});
    t.same(urlSplit('../index.html'), {authority: '', fragment: '', path: '../index.html', query: '', scheme: ''});
    t.same(urlSplit('http://bücher.ch:3000/foo'), {
      authority: 'bücher.ch:3000',
      fragment: '',
      path: '/foo',
      query: '',
      scheme: 'http'
    });
    t.same(urlSplit('data:image/png;base64,helloworld123'), {
      authority: '',
      fragment: '',
      path: 'image/png;base64,helloworld123',
      query: '',
      scheme: 'data'
    });

    t.end();
  });

  t.test('xmlEscape', t => {
    t.same(xmlEscape('Hello World!'), 'Hello World!');
    t.same(xmlEscape('привет<foo>'), 'привет&lt;foo&gt;');
    t.same(xmlEscape('la<f>\nbar"baz"\'yada\n\'&lt;la'), 'la&lt;f&gt;\nbar&quot;baz&quot;&#39;yada\n&#39;&amp;lt;la');
    t.same(xmlEscape('<p>'), '&lt;p&gt;');
    t.same(xmlEscape(new SafeString('<p>')), '<p>');
    t.same(xmlEscape(undefined), 'undefined');
    t.same(xmlEscape(null), 'null');
    t.end();
  });

  t.test('xmlUnescape', t => {
    t.same(xmlUnescape('Hello World!'), 'Hello World!');
    t.same(xmlUnescape('привет&lt;foo&gt;'), 'привет<foo>');
    t.same(xmlUnescape('la&lt;f&gt;\nbar&quot;baz&quot;&#39;yada\n&#39;&amp;lt;la'), 'la<f>\nbar"baz"\'yada\n\'&lt;la');
    t.same(xmlUnescape('&lt;p&gt;&apos;'), "<p>'");
    t.end();
  });

  t.test('AsyncHooks', async t => {
    await t.test('Simple hook chain', async t => {
      const hooks = new AsyncHooks();
      const results = [];

      hooks.addHook('foo', async value => {
        results.push(value + 1);
        results.push(1);
        await setTimeout(1);
        results.push(2);
      });
      hooks.addHook('foo', async value => {
        results.push(value + 2);
        results.push(3);
        await setTimeout(1);
        results.push(4);
      });
      hooks.addHook('foo', async value => {
        results.push(value + 3);
        results.push(5);
        await setTimeout(1);
        results.push(6);
      });

      await hooks.runHook('foo', 'test');
      t.same(results, ['test1', 1, 2, 'test2', 3, 4, 'test3', 5, 6]);
    });

    await t.test('Multiple runs', async t => {
      const hooks = new AsyncHooks();
      let results = [];

      hooks.addHook('foo', async value => {
        results.push(value + 1);
        results.push(1);
      });
      hooks.addHook('foo', async value => {
        results.push(value + 2);
        results.push(2);
        await setTimeout(1);
        results.push(3);
      });

      await hooks.runHook('foo', 'first');
      t.same(results, ['first1', 1, 'first2', 2, 3]);

      results = [];
      await hooks.runHook('foo', 'second');
      t.same(results, ['second1', 1, 'second2', 2, 3]);

      results = [];
      await hooks.runHook('foo', 'third');
      t.same(results, ['third1', 1, 'third2', 2, 3]);
    });

    await t.test('Interrupted chain', async t => {
      const hooks = new AsyncHooks();
      const results = [];

      hooks.addHook('foo', async value => {
        results.push(value + 1);
        results.push(1);
        await setTimeout(1);
        results.push(2);
        return false;
      });
      hooks.addHook('foo', async value => {
        results.push(value + 'fail');
      });

      t.same(await hooks.runHook('foo', 'test'), false);
      t.same(results, ['test1', 1, 2]);
    });

    await t.test('Not all functions are async', async t => {
      const hooks = new AsyncHooks();
      const results = [];

      hooks.addHook('foo', async value => {
        results.push(value + 1);
        results.push(1);
        await setTimeout(1);
        results.push(2);
      });
      hooks.addHook('foo', value => {
        results.push(value + 2);
        results.push(3);
      });
      hooks.addHook('foo', async value => {
        results.push(value + 3);
        results.push(4);
        await setTimeout(1);
        results.push(5);
      });

      await hooks.runHook('foo', 'test');
      t.same(results, ['test1', 1, 2, 'test2', 3, 'test3', 4, 5]);
    });

    await t.test('Multiple values', async t => {
      const hooks = new AsyncHooks();
      const results = [];

      hooks.addHook('bar', async (first, second) => {
        results.push(first + second + 1);
        results.push(1);
        await setTimeout(1);
        results.push(2);
      });
      hooks.addHook('bar', async (first, second) => {
        results.push(first + second + 2);
        results.push(3);
        await setTimeout(1);
        results.push(4);
      });
      hooks.addHook('bar', async (first, second) => {
        results.push(first + second + 3);
        results.push(5);
        await setTimeout(1);
        results.push(6);
      });

      await hooks.runHook('bar', 'test', 123);
      t.same(results, ['test1231', 1, 2, 'test1232', 3, 4, 'test1233', 5, 6]);
    });

    await t.test('Exception in chain', async t => {
      const hooks = new AsyncHooks();
      const results = [];

      hooks.addHook('foo', async value => {
        results.push(value + 1);
        results.push(1);
        await setTimeout(1);
        results.push(2);
        throw new Error('Test');
      });
      hooks.addHook('foo', async value => {
        results.push(value + 'fail');
      });

      let fail;
      await hooks.runHook('foo', 'test').catch(error => (fail = error));
      t.equal(fail.message, 'Test');
      t.same(results, ['test1', 1, 2]);
    });
  });

  t.test('AbortError', t => {
    let result;
    try {
      throw new AbortError();
    } catch (error) {
      result = error;
    }
    t.equal(result.name, 'AbortError');
    t.equal(result.message, 'Aborted');
    t.end();
  });

  t.end();
});
