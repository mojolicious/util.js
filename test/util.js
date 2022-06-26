import {cssUnescape, escapeRegExp, SafeString, stickyMatch, urlSplit, xmlEscape, xmlUnescape} from '../lib/util.js';
import t from 'tap';

t.test('Util', t => {
  t.test('cssUnescape', t => {
    t.equal(cssUnescape('#\\n\\002603x'), '#☃x');
    t.end();
  });

  t.test('escapeRegExp', t => {
    t.equal(escapeRegExp('te*s?t'), 'te\\*s\\?t');
    t.equal(escapeRegExp('\\^$.*+?()[]{}|'), '\\\\\\^\\$\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|');
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

  t.end();
});
