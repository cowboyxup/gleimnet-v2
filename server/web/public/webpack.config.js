module.exports = {
    entry: './src/app.ts',
    output: {
        filename: 'dist/map.js'
    },
    cache: true,
    debug: true,
    devtool: 'source-map',
    resolve: {
        extensions: ["", ".ts", ".js", ".json", ".css"],
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolveLoader: {
        modulesDirectories: [
            'node_modules'
        ]
    },
}