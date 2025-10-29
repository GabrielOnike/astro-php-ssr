import type { AstroIntegration } from "astro";

export interface PhpOptions {
  /** php-cgi or php absolute path/binary name. Default: 'php-cgi' (falls back to 'php') */
  phpBinary?: string;
  /** Directory containing .php scripts. Default: './src/php' */
  phpDir?: string;
}

export default function astroPhpSSR(options?: PhpOptions): AstroIntegration;
