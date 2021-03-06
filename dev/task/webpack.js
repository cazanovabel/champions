import gulp from 'gulp';
import gutil from 'gulp-util';
import opn from 'opn';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import webpackConfig, { extractStylesPlugin } from '../config/webpack-config.js';

gulp.task('develop', (callback) => {
    const domain = 'localhost';
    const port = 8080;
    const config = {
        ...webpackConfig,
        entry: ((entry) => {
            const hotEntry = {};
            for(const key in entry) {
                hotEntry[ key ] = [
                    `webpack-dev-server/client?http://${ domain }:${ port }`,
                    'webpack/hot/only-dev-server',
                    ...entry[ key ],
                ];
            }
            return hotEntry;
        })(webpackConfig.entry),
        module: {
            ...webpackConfig.module,
            loaders: webpackConfig.module.loaders.map((loader) => (!loader.hot)? loader: {
                ...loader,
                loaders: [
                    'simple-hot',
                    ...loader.loaders,
                ],
            }),
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            ...webpackConfig.plugins || [],
        ],
        devtool: '#cheap-source-map',
    };
    const compiler = webpack(config);
    const server = new WebpackDevServer(compiler, {
        contentBase: './src',
        hot: true,
        inline: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        historyApiFallback: true,
        stats: {
            colors: true,
            assets: false,
            cached: false,
            cachedAssets: false,
            chunks: false,
        },
    });
    server.listen(port, domain, (err) => {
        if (err) {
            callback();
            throw new gutil.PluginError('webpack-dev-server', err);
        }
        gutil.log('[webpack-dev-server] 🌎', `http://${ domain }:${ port }/index.html`);
        opn(`http://${domain}:${port}`);
    });
});

gulp.task('webpack', (callback) => {
    const config = {
        ...webpackConfig,
        module: {
            ...webpackConfig.module,
            loaders: webpackConfig.module.loaders.map((loader) => (!loader.deploy)? loader: {
                ...loader,
                ...loader.deploy,
            }),
        },
        plugins: [
            extractStylesPlugin,
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({ minimize: true }),
            ...webpackConfig.plugins || [],
        ],
        devtool: '#source-map',
    };
    webpack(config, (err) => {
        if(err)
            throw new gutil.PluginError('webpack', err);
        callback();
    });
});
