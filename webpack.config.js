const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        main: './src/js/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader?url=false']
                })
            },
            {
                test: /\.hbs/,
                loader: 'handlebars-loader'
            },
            {
                test: /\.(jpe?g|png|gif|svg|)$/i,
                use: 'file-loader?name=/img/[hash].[ext]'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'style.css'
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            title: 'Geo reviews',
            template: './src/index.hbs'
        }),
        new CleanWebpackPlugin(['dist']),
        new CopyWebpackPlugin([
            {
                from: './src/img',
                to: 'img'
            }
        ])
    ]
}