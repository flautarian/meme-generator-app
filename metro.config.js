
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
    resetCache: true,
    transformer: {
        assetPlugins: ['expo-asset/tools/hashAssetFiles'],
        babelTransformerPath: require.resolve('react-native-svg-transformer/react-native'),
    },
    resolver: {
        assetExts: [...assetExts, "png", "jpg", "jpeg", "svg"],
        sourceExts: [...sourceExts, "js", "json", "ts", "tsx"],
    },
};

const mergedConfig = mergeConfig(defaultConfig, config);

module.exports = mergedConfig;
