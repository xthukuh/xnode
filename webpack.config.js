const path = require('path');
const {name} = require('./package.json');

module.exports = env => {
	let {mode, library} = Object(env);
	mode = mode === 'production' ? mode : 'development';
	library = 'string' === typeof library && /^[_a-z0-9]+$/.test(library) ? library : name;
	const filename = `${library}.min.js`;
	return {
		mode,
		// devtool: 'inline-source-map',
		entry: {
			main: './lib/index.ts',
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename,
			libraryTarget: 'umd',
			library,
			// umdNamedDefine: true,
			globalObject: 'this',
		},
		resolve: {
			extensions: ['.ts', '.js'],
			fallback: {
				'fs': false,
				'path': false,
				'readline': false,
			},
		},
		module: {
			rules: [
				{ 
					test: /\.tsx?$/,
					loader: 'ts-loader',
					options: {configFile: 'tsconfig.prod.json'},
				}
			]
		},
	};
};