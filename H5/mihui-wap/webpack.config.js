const path = require('path');
// 将打包后的文件插入模板
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 清理 dist 文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// 压缩js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// 分离css
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        'index': './src/js/index.js',
        'pay-fail': './src/js/pay-fail.js',
        'pay-success': './src/js/pay-success.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].[chunkhash].js'
    },
    devServer: {
        contentBase: './dist',
        port: 8085,
        host: '192.168.1.22',
        https: false,
        open: true,
        proxy: {
            '/wj/': {
                // 王建测试
                target: 'http://192.168.1.24:8085',
                changeOrigin: true,
                pathRewrite: {
                    '^/wj/': ''
                }
            },
            '/r/': {
                // 线上测试
                target: 'http://120.55.149.52:18086',
                changeOrigin: true,
                pathRewrite: {
                    '^/r/': ''
                }
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use : [
                    MiniCssExtractPlugin.loader,
                    { loader: "css-loader" }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader: "css-loader"},
                    {loader: "less-loader"}
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new UglifyJsPlugin({
            test: /\.js($|\?)/i
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].[hash].css",
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                minifyCSS: true
            },
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            filename: 'pay-fail.html',
            template: './src/pay-fail.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                minifyCSS: true
            },
            chunks:['pay-fail']
        }),
        new HtmlWebpackPlugin({
            filename: 'pay-success.html',
            template: './src/pay-success.html',
            minify: { // 压缩HTML文件
                removeComments: true, // 移除HTML中的注释
                collapseWhitespace: true, // 删除空白符与换行符
                minifyCSS: true// 压缩内联css
            },
            chunks:['pay-success']
        })
    ]
}
