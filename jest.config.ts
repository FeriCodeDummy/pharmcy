/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';
import nextJest from 'next/jest.js'
import "whatwg-fetch";
const createNextJestConfig = nextJest({
    dir: './'
})

const config: Config = {
  clearMocks: true,

  collectCoverage: true,

  coverageDirectory: "coverage",

  coverageProvider: "v8",
  testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/$1",
  },

};


export default createNextJestConfig(config);
