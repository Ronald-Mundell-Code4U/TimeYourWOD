/** Jest config for the Expo (SDK 52) app. */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // jest-expo ships sane transformIgnorePatterns; extend to also transform
  // the libraries this app pulls in (async-storage, gesture-handler, expo-google-fonts).
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|@react-native-async-storage/.*|react-native-.*))',
  ],
  collectCoverageFrom: [
    'shared/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
  ],
};
