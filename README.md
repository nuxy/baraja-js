# Baraja-JS [![npm version](https://badge.fury.io/js/baraja-js.svg)](https://badge.fury.io/js/baraja-js) [![](https://img.shields.io/npm/dw/localeval.svg)](https://www.npmjs.com/package/baraja-js)

_Baraja_ is a JavaScript plugin that allows to move elements in a card-like fashion and spreads them like one would spread a deck of cards on a table.  It uses CSS transforms for rotating and translating the items.

There are several options available that will create various spreading possibilities of the items, for example, moving the items laterally or rotating them in a fan-like way.

Checkout the [demo](https://nuxy.github.io/baraja-js) for examples of use.

## Dependencies

- [Node.js](https://nodejs.org)

## Installation

Install the package into your project using [NPM](https://npmjs.com), or download the [sources](http://github.com/nuxy/baraja-js/archive/master.zip).

    $ npm install baraja-js

## Usage

There are two ways you can use this package.  One is by including the JavaScript/CSS sources directly.  The other is by importing the module into your component.

### HTML include

After you [build the distribution sources](#cli-options) the set-up is fairly simple..

```
<script type="text/javascript" src="path/to/baraja.min.js"></script>
<link rel="stylesheet" href="path/to/baraja.min.css" media="all" />

var baraja = new Baraja(container, options);
```

### JS framework

If your using a modern framework like [Aurelia](https://aurelia.io), [Angular](https://angular.io), [React](https://reactjs.org), or [Vue](https://vuejs.org)

```
import Baraja from 'baraja-js';

const baraja = new Baraja(container, options);
```

## Fan options

Overriding the animation behavior can be done using the following options:

| Option      | Description                            | Type    | Default  |
|-------------|----------------------------------------|---------|----------|
| direction   | Direction to fan the cards.            | String  | right    |
| easing      | Animation type (ease-in/ease-out).     | String  | ease-out |
| speed       | Length of time in milliseconds.        | Number  | 500      |
| range       | Card horizontal spread distance.       | Number  | 90       |
| translation | Card horizontal/vertical direction.    | Number  | 0        |
| origin.x    | Card horizontal position (calculated). | Number  | 25       |
| origin.y    | Card vertical position (calculated).   | Number  | 100      |
| center      | Stack position is always centered.     | Boolean | true     |
| scatter     | Position cards in a non-linear way.    | Boolean | false    |

These options can also be used by the `Baraja.fan` method.  See the [animation examples](https://github.com/nuxy/baraja-js/blob/master/demo/index.html#L107) provided in the demo.

## Developers

### CLI options

Run [ESLint](https://eslint.org/) on project sources:

    $ npm run lint

Transpile ES6 sources (using [Babel](https://babeljs.io)) and minify to a distribution:

    $ npm run build

## Common questions

> What was your motivation for creating this package?

I use the [Codrops plugin](https://github.com/codrops/Baraja) on several personal projects and at this point, I have been officially abandoning any support for [jQuery](https://jquery.com) for more modern frameworks.  Unfortunately, the plugin was pretty old and a little behind on today's [JavaScript standards](https://es6.io) so achieving this was not possible without a complete rewrite.

What I wanted was pretty simple..

- ES6 language support
- Import capabilities
- Output compression
- Installation via NPM
- Production support

All of the items above are now provided with this package.

## Credits

This package would not be possible without the original [Codrops](https://tympanus.net) [article](https://tympanus.net/codrops/2012/11/13/baraja-a-plugin-for-spreading-items-in-a-card-like-fashion) and proof-of-concept [demo](https://tympanus.net/Development/Baraja).  I have yet to find a package that provides anything close to this type of functionality.  It's in a league of its own and it's important to give credit where it's due.

## Contributions

If you fix a bug, or have a code you want to contribute, please send a pull-request with your changes. (Note: Before committing your code please ensure that you are following the [Node.js style guide](https://github.com/felixge/node-style-guide))

## Versioning

This package is maintained under the [Semantic Versioning](https://semver.org) guidelines.

## License and Warranty

This package is distributed in the hope that it will be useful, but without any warranty; without even the implied warranty of merchantability or fitness for a particular purpose.

_Baraja-JS_ is provided under the terms of the [MIT license](http://www.opensource.org/licenses/mit-license.php)

Demo and proof-of-concept by [Codrops](https://www.codrops.com) [[LICENSE](http://tympanus.net/codrops/licensing)]

Demo background patterns by [Subtle Patterns](https://subtlepatterns.com) [[LICENSE](http://creativecommons.org/licenses/by-sa/3.0/deed.en_US
)]

Demo card illustrations by [Jason Custer](http://dribbble.com/jdelamancha)

## Author

[Marc S. Brooks](https://github.com/nuxy)
