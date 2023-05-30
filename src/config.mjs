/**
 * @typedef {import('type-fest').PackageJson} PackageJson
 */
import fs from 'fs-extra';
import path from 'path';

/**
 * @typedef {Object} CustomFncOpts
 *
 * @property {boolean} all
 * @property {boolean} dryRun
 * @property {string} [releaseAs]
 * @property {boolean} yes
 */

/**
 * @typedef {Object} AddToPackageJsonOpts
 *
 * @property {boolean} noDeps
 * @property {boolean} noPublish
 * @property {string} monorepoRoot
 * @property {string} whichPackageManager
 */

/**
 * Allows you to specify additional contents that will be merged into
 * the generated package.json file when running the "turbo-tools init" command
 *
 * @callback AddToPackageJson
 * @param {AddToPackageJsonOpts} opts
 * @returns {Partial<PackageJson>}
 */

/**
 *
 * Given a series of arguments provided to the Turbo Tools,
 * expects you to return an async true or false for whether or
 * not this publish should continue.
 *
 * If this function doesn't exist, `true` will be used by default
 *
 * @callback CheckCanPublish
 * @param {CheckCanPublishOpts} opts
 * @returns {Promise<boolean>}
 */

/**
 * @typedef GetCommanReturnType
 * @property {string[]} args
 * @property {string} cmd
 */

/**
 *
 * Given a series of arguments provided to the Turbo Tools,
 * expects you to return a string representing the CLI command
 * to use for publishing packages for your project.
 * This is useful, particularly at enterprise companies, where
 * a custom NPM repository and publish command
 * may be used before pushing.
 *
 * If this function doesn't exist or if it returns a falsey value, "npm publish" will be used as default
 * @callback GetCommand
 * @param {CustomFncOpts} opts
 *
 * @returns {GetCommanReturnType}
 */

/**
 * @typedef {Object} TurboToolsInitConfig
 *
 * @property {AddToPackageJson} addToPackageJson
 */

/**
 * @typedef {Object} TurboToolsPublishConfig
 * @property {GetCommand} getCommand
 * @property {CheckCanPublish} checkCanPublish
 */

/**
 * @typedef {Object} TurboToolsConfig
 *
 *
 * @property {TurboToolsInitConfig} init
 *
 * @property {TurboToolsPublishConfig} publish
 */

/**
 * Utility function that returns an array of all paths
 * in the CWD up to the root
 */
function getAllFoldersUpToRoot() {
  /** @type {string[]} */
  const out = [];
  const cwd = process.cwd();

  let buffer = '';
  for (const char of cwd) {
    if (char === path.sep) out.push(buffer.length ? buffer : path.sep);

    buffer += char;
  }

  out.push(buffer);

  return out.sort((a, b) => b.localeCompare(a));
}

/**
 * Attempts to read the nearest turboTools.config.js file (if it exists)
 * and returns its contents
 *
 * @returns {TurboToolsConfig | null}
 */
export function readTurboToolsConfig() {
  /**
   * @param {string} prefix
   * @returns {string}
   */
  const getTurboToolsConfigFilePath = prefix => {
    if (prefix.endsWith(path.sep)) return `${prefix}turboTools.config.js`;
    return `${prefix}${path.sep}turboTools.config.js`;
  };

  for (const dir of getAllFoldersUpToRoot()) {
    const turboConfigPath = getTurboToolsConfigFilePath(dir);
    try {
      const stat = fs.statSync(turboConfigPath);
      if (stat.isFile()) return require(turboConfigPath);
    } catch (error) {}
  }

  return null;
}

/**
 * Simple pass-through utility for providing TypeScript typings
 * in non-TS environments when defining a config override
 *
 * @param {TurboToolsConfig} config
 *
 * @returns {TurboToolsConfig}
 */
export function defineTurboToolsConfig(config) {
  return config;
}
