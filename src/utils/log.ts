export function log<S extends string, T extends any>(kind: S, value: T) {
  console.log(`%c[${kind}] %c${JSON.stringify(value)}`, 'color: orange; text-transform: capitalize', 'color: yellow')
}
