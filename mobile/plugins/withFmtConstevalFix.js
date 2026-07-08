const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Xcode 26's Clang tightened C++20 consteval validation, which breaks the fmt
 * library that React Native 0.76 vendors (fmt 11.0.2, via RCT-Folly). The build
 * fails with: fmt/format-inl.h "call to consteval function ... is not a constant
 * expression". The upstream fix (fmt 12.1.0) only reached Expo SDK 56 / RN 0.83+.
 *
 * For SDK 52 the accepted workaround is to disable fmt's compile-time format
 * checking by defining FMT_USE_CONSTEVAL=0 on every pod target. This is a local
 * config plugin (no third-party dependency) that appends that to the generated
 * Podfile's post_install hook during prebuild.
 *
 * Remove once the app moves to an SDK whose RN bundles fmt >= 12.1.0.
 */
const POST_INSTALL_SNIPPET = `
    # fmt consteval fix (Xcode 26 + RN 0.76 vendored fmt 11.0.2)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |bc|
        defs = bc.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || ['$(inherited)']
        defs = [defs] unless defs.is_a?(Array)
        defs << 'FMT_USE_CONSTEVAL=0' unless defs.include?('FMT_USE_CONSTEVAL=0')
        bc.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs
      end
    end`;

module.exports = function withFmtConstevalFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');

      if (!contents.includes('FMT_USE_CONSTEVAL=0')) {
        if (/post_install do \|installer\|/.test(contents)) {
          contents = contents.replace(
            /post_install do \|installer\|/,
            `post_install do |installer|${POST_INSTALL_SNIPPET}`
          );
        } else {
          // No post_install block — add one before the final `end`.
          contents = contents.replace(
            /end\s*$/,
            `  post_install do |installer|${POST_INSTALL_SNIPPET}\n  end\nend\n`
          );
        }
        fs.writeFileSync(podfile, contents);
      }
      return cfg;
    },
  ]);
};
