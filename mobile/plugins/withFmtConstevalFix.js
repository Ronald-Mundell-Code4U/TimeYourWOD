const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Xcode 26's Clang tightened C++20 consteval validation, which breaks the fmt
 * library that React Native 0.76 vendors (fmt 11.0.2, via RCT-Folly). The build
 * fails compiling fmt/format-inl.h: "call to consteval function ... is not a
 * constant expression". The upstream fix (fmt 12.1.0) only reached Expo SDK 56 /
 * RN 0.83+.
 *
 * Workaround: compile the `fmt` pod as C++17. consteval doesn't exist in C++17,
 * so fmt disables its compile-time FMT_STRING checks and the error goes away.
 * Only the fmt pod is downgraded; the rest of the app stays on C++20.
 *
 * This MUST run AFTER react_native_post_install — that call sets the C++
 * standard on pod targets, so setting it earlier (or via a preprocessor define)
 * gets overwritten. We inject right after the react_native_post_install(...) call.
 *
 * Remove once the app moves to an SDK whose RN bundles fmt >= 12.1.0.
 */
const FMT_FIX = `

    # fmt consteval fix (Xcode 26 + RN 0.76 vendored fmt 11.0.2) — compile fmt as
    # C++17 so its consteval FMT_STRING path is disabled. Placed AFTER
    # react_native_post_install so the language standard isn't reset to C++20.
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |bc|
          bc.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end`;

module.exports = function withFmtConstevalFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');

      // idempotent
      if (contents.includes("target.name == 'fmt'")) return cfg;

      const rnPostInstall = /react_native_post_install\([\s\S]*?\n\s*\)/;
      if (rnPostInstall.test(contents)) {
        contents = contents.replace(rnPostInstall, (match) => `${match}${FMT_FIX}`);
      } else {
        // Fallback: inject just before the Podfile's final `end`.
        contents = contents.replace(/\nend\s*$/, `${FMT_FIX}\nend\n`);
      }
      fs.writeFileSync(podfile, contents);
      return cfg;
    },
  ]);
};
