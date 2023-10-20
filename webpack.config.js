const path = require('path');
const {name} = require('./package.json');

module.exports = env => {
	const {mode, library} = Object(env);
	return {
		mode: mode === 'production' ? mode : 'development',
		devtool: 'inline-source-map',
		entry: {
			main: './src/index.ts',
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'index.js',
			libraryTarget: 'umd',
			library: ('string' === typeof library && /^[_a-z0-9]+$/.test(library) ? library : name).replace(/[^0-9a-zA-Z]/g, '_'),
			umdNamedDefine: true,
			globalObject: 'this',
		},
		resolve: {
			extensions: ['.ts', '.js'],
			fallback: {
				fs: false,
				path: false,
				readline: false,
			},
		},
		target: 'node',
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