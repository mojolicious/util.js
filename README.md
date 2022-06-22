<p align="center">
  <a href="https://mojojs.org">
    <picture>
      <source srcset="https://github.com/mojolicious/mojo.js/blob/main/docs/images/logo-dark.png?raw=true" media="(prefers-color-scheme: dark)">
      <img src="https://github.com/mojolicious/mojo.js/blob/main/docs/images/logo.png?raw=true" style="margin: 0 auto;">
    </picture>
  </a>
</p>

[![](https://github.com/mojolicious/util.js/workflows/test/badge.svg)](https://github.com/mojolicious/util.js/actions)
[![Coverage Status](https://coveralls.io/repos/github/mojolicious/util.js/badge.svg?branch=main)](https://coveralls.io/github/mojolicious/util.js?branch=main)
[![npm](https://img.shields.io/npm/v/@mojojs/util.svg)](https://www.npmjs.com/package/@mojojs/util)

Just a bunch of utility functions shared by [mojo.js](https://mojojs.org) packages.

```js
import {SafeString, escapeRegExp, xmlEscape, xmlUnescape} from '@mojojs/util';

// "te\*s\?t"
const str = escapeRegExp('te*s?t');

// "&lt;p&gt;"
const str = xmlEscape('<p>');

// "<p>"
const str = xmlEscape(new SafeString('<p>'));

// "<p>"
const str = xmlUnescape('&lt;p&gt;&apos;');
```

## Installation

All you need is Node.js 16.0.0 (or newer).

```
$ npm install @mojojs/util
```
