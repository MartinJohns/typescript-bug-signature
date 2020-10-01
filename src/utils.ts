export type First<T extends any[]> = T[0];
export type DropFirst<T extends any[]> = T extends readonly [any?, ...infer U] ? U : [...T];

export type GetProperty<T, N extends string> = T extends { [P in N]: infer R } ? R : never;
export type SetProperty<T, N extends string, V> = { readonly [P in keyof T | N]: P extends N ? V : P extends keyof T ? T[P] : never; };
export type MergeProperty<T, N extends string, V> =
  N extends keyof T ?
    SetProperty<T, N, {
      readonly [P in (keyof GetProperty<T, N>) | (keyof V)]: P extends keyof V ? V[P] : P extends keyof GetProperty<T, N> ? GetProperty<T, N>[P] : never
    }>
  : SetProperty<T, N, { readonly [P in keyof V]: V[P] }>;
