/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js

/* eslint-disable @typescript-eslint/no-var-requires */

const { configure } = require('quasar/wrappers')
const resolve = require('path').resolve
const { name, version } = require('./package')
const SystemJSPublicPathWebpackPlugin = require('systemjs-webpack-interop/SystemJSPublicPathWebpackPlugin')

module.exports = configure(function (ctx) {
  return {
    // https://v2.quasar.dev/quasar-cli-webpack/supporting-ts
    supportTS: {
      tsCheckerConfig: {
        eslint: {
          enabled: true,
          files: './src/**/*.{ts,tsx,js,jsx,vue}'
        }
      }
    },

    // https://v2.quasar.dev/quasar-cli-webpack/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-webpack/boot-files
    boot: [
      'i18n',
      'axios'
    ],

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-css
    css: [
      'app.scss'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      'mdi-v5',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons' // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-build
    build: {
      vueRouterMode: 'history', // available values: 'hash', 'history'
      distDir: 'dist/wallet', // @mimas: change quasar build dir, quasar will clean this folder each time building
      env: {
        appVersion: version, // @mimas: application version, process.env.appVersion
        releaseTime: `${new Date()}` // @mimas: release time stamp, process.env.releaseTime
      },

      // transpile: false,
      // publicPath: '/',

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      // transpileDependencies: [],

      // rtl: true, // https://quasar.dev/options/rtl-support
      // preloadChunks: true,
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://v2.quasar.dev/quasar-cli-webpack/handling-webpack
      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      // chainWebpack (/* chain */) {
      //   chain
      //     .plugin('mini-css-extract') // @mimas: this will stop css filename hashing
      //     .tap(args => [{ filename: 'css/[name].css' }, ...args])
      // }

      extendWebpack (cfg) {
        cfg.output = {
          // @mimas: https://single-spa.js.org/docs/recommended-setup/#build-tools-webpack--rollup
          libraryTarget: 'system',
          // @mimas: the variable that distinguish each micro-app's chunking results. Sharing the same variable will cause booting issues for single-spa.
          // see https://zhuanlan.zhihu.com/p/415900889?utm_medium=social&utm_oi=682743049231273984
          chunkLoadingGlobal: `webpackJsonp_${name}`,
          publicPath: `${name}`, // @mimas: publicPath needs an initial value, but will be changed on the fly by 'systemjs-webpack-interop'
          path: resolve(__dirname, 'dist/wallet') // @mimas: where to put all files but index.html (which goes with the distDir setting)
        }

        // @mimas: dependencies that will be provided by root-config
        cfg.externals = [
          /^@cnic\/.+/, // @mimas: treat other micro frontends as in-browser modules
          'single-spa',
          'single-spa-vue',
          'axios',
          'core-js'
          // 'quasar'
          // '@quasar/extras',
          // 'pinia',
          // 'vue',
          // 'vue-i18n',
          // 'vue-router'
        ]

        // @mimas: https://single-spa.js.org/docs/recommended-setup/#build-tools-webpack--rollup
        cfg.optimization.splitChunks = false // potentially problematic
        cfg.devtool = 'source-map' // for debugging
        cfg.plugins.push(
          new SystemJSPublicPathWebpackPlugin({ systemjsModuleName: name })
        )

        // @mimas: real meat for single-spa!
        // replace /.quasar files(generated by 'quasar dev') with /.singleSpa files during bundling
        cfg.module.rules.push({
          test: /\.js$/,
          loader: 'file-replace-loader',
          options: {
            condition: 'always',
            replacement (resourcePath) {
              // @mimas: modified for single-spa
              if (resourcePath.endsWith('app.js')) {
                return resolve(__dirname, '.singleSpa', 'singleSpa-app.js')
              }
              if (resourcePath.endsWith('client-entry.js')) {
                return resolve(__dirname, '.singleSpa', 'singleSpa-client-entry.js')
              }
            },
            async: true
          }
        })

        // @mimas: alias
        cfg.resolve.alias = {
          ...cfg.resolve.alias, // This adds the existing alias
          // Add your own alias like this
          api: resolve(__dirname, './src/api'),
          hooks: resolve(__dirname, './src/hooks')
        }
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-devServer
    devServer: {
      server: {
        type: 'http'
      },
      port: 9800,
      open: false, // opens browser window automatically
      // @mimas: allow cors for dev servers
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      }
    },

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-framework
    framework: {
      config: {},

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar language pack
      lang: 'zh-CN', // en-US'

      // Quasar plugins
      plugins: [
        'Loading',
        'Notify',
        'Dialog'
      ]
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-webpack/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      maxAge: 1000 * 60 * 60 * 24 * 30,
      // Tell browser when a file from the server should expire from cache (in ms)

      // chainWebpackWebserver (/* chain */) {},

      middlewares: [
        ctx.prod ? 'compression' : '',
        'render' // keep this as last one
      ]
    },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW

      // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
      // if using workbox in InjectManifest mode
      // chainWebpackCustomSW (/* chain */) {},

      manifest: {
        name: 'Micro Frontend Wallet',
        short_name: 'Micro Frontend Wallet',
        description: '',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: '@cnic/wallet'
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackMain (/* chain */) {
        // do something with the Electron main process Webpack cfg
        // extendWebpackMain also available besides this chainWebpackMain
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
      chainWebpackPreload (/* chain */) {
        // do something with the Electron main process Webpack cfg
        // extendWebpackPreload also available besides this chainWebpackPreload
      }
    }
  }
})
