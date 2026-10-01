// Learn more https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so shared packages AND the root assets/ folder
// (brand backgrounds, icons, vehicle images) resolve via require().
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// getDefaultConfig's resolver.platforms omits "web" here, which silently
// disables Metro's <name>.web.tsx platform-extension resolution -- e.g.
// packages/ui-native/src/RapexMapView.web.tsx (the web-safe stand-in that
// keeps react-native-maps, which has no web build, out of the web bundle)
// was being ignored in favor of RapexMapView.tsx, crashing the whole app
// on web at import time. Adding "web" back restores that resolution.
config.resolver.platforms = [...config.resolver.platforms, 'web'];

module.exports = config;
