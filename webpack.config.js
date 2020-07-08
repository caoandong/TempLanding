const HtmlWebPackPlugin = require('html-webpack-plugin');
const path = require('path');
const htmlPlugin = new HtmlWebPackPlugin({
    template: './src/index.html',
    filename: 'index.html',
});

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
    },
    node: {
        // https://stackoverflow.com/questions/59487224/webpack-throws-error-with-emscripten-cant-resolve-fs
        fs: 'empty',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: [
                    /node_modules/,
                    path.resolve(__dirname, 'src/mesh_processing.js'),
                    path.resolve(__dirname, 'src/mesh_processing.worker.js'),
                ],
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            esModule: false,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [htmlPlugin],
};
