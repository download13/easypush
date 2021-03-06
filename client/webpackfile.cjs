/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const Dotenv = require('dotenv-webpack')

const clientSrc = path.resolve('./client')
const clientDist = path.resolve('./dist/client')

const tsRule = {
	test: /\.tsx?$/,
	exclude: /node_modules/,
	use: {
		loader: 'ts-loader'
	}
}

const babelRule = {
	test: /\.js$/,
	exclude: /node_modules/,
	use: {
		loader: 'babel-loader',
		options: {
			presets: [
				['@babel/preset-env', {
					'targets': '> 2%, not dead'
				}]
			]
		}
	}
}

module.exports = [
	{
		entry: path.join(clientSrc, 'index.tsx'),
		output: {
			path: clientDist,
			filename: 'client.js'
		},
		module: {
			rules: [
				tsRule,
				babelRule
			]
		},
		plugins: [
			new Dotenv()
		],
		resolve: {
			extensions: ['.js', '.ts', '.tsx'],
		}
	},
	{ // Service worker
		entry: path.join(clientSrc, 'sw.js'),
		output: {
			path: clientDist,
			filename: 'sw.js'
		},
		module: {
			rules: [
				babelRule
			]
		}
	}
]
