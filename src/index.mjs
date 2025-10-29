// src/index.mjs
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * @typedef {Object} PhpOptions
 * @property {string} [phpBinary] - 'php-cgi' or 'php' path/binary name.
 * @property {string} [phpDir]    - directory containing .php files (default: './src/php')
 */

/** @type {(opts?: PhpOptions) => import('astro').AstroIntegration} */
export default function astroPhpSSR(options = {}) {
  const {
    phpBinary = "php-cgi",       // prefer php-cgi when available
    phpDir = "./src/php",
  } = options;

  return {
    name: "astro-php-ssr",
    hooks: {
      "astro:config:setup": ({ addMiddleware, config, logger }) => {
        // Resolve phpDir relative to project root
        const root = config.root?.pathname
          ? fileURLToPath(config.root)
          : process.cwd();
        const resolvedPhpDir = resolve(root, phpDir);

        // Expose options for middleware via env
        process.env.ASTRO_PHP_BINARY = phpBinary;
        process.env.ASTRO_PHP_DIR = resolvedPhpDir;

        logger.info(
          `[astro-php-ssr] phpBinary="${process.env.ASTRO_PHP_BINARY}", phpDir="${process.env.ASTRO_PHP_DIR}"`
        );

        addMiddleware({
          order: "pre",
          entrypoint: new URL("./middleware.mjs", import.meta.url).pathname,
        });
      },
    },
  };
}
