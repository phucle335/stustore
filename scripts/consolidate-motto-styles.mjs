/**
 * One-time helper: convert .motto-block selectors to camelCase module locals.
 */
export function mottoClassToCamel(selector) {
  const base = selector.replace(/^\.motto-/, "").replace(/^\./, "");
  return base.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export function transformCssBlock(css) {
  return css.replace(/\.motto-([a-z0-9-]+)/g, (_, name) => {
    const camel = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return `.${camel}`;
  });
}
