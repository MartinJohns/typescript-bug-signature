import { DropFirst, First, MergeProperty } from './utils';

export type AddCreatedProperty<TName extends string, TProperty> = { type:'addCreatedProperty'; name: TName; creator: () => TProperty }
export type AddStaticProperty<TName extends string, TProperty> = { type: 'addStaticProperty', name: TName; value: TProperty }
export type UseResult<TResult> = { type: 'useResult'; handler: (result: TResult) => void }

export type Step =
    | AddCreatedProperty<any, any>
    | AddStaticProperty<any, any>
    | UseResult<any>

type Result<T extends Step[], R> = 
    First<T> extends undefined ? R :
    First<T> extends AddCreatedProperty<infer TName, infer TType> ? Result<DropFirst<T>, MergeProperty<R, 'data', { [P in TName]: TType }>> :
    First<T> extends AddStaticProperty<infer TName, infer TType> ? Result<DropFirst<T>, MergeProperty<R, 'data', { [P in TName]: TType }>> :
    Result<DropFirst<T>, R>

class Builder<T extends Step[]> {
    constructor(private readonly steps: T) {}

    append<S extends Step>(step: S): Builder<[...T, S]> { return new Builder([...this.steps, step]); }

    addCreatedProperty = <TName extends string, TProp>(name: TName, creator: () => TProp) =>
        this.append({ type: 'addCreatedProperty', name, creator });

    addStaticProperty = <TName extends string, TProp>(name: TName, value: TProp) =>
        this.append({ type: 'addStaticProperty', name, value });

    result = (handler: (result: Result<T, {}>) => void) =>
        this.append({ type: 'useResult', handler });
}

new Builder<[]>([])
    .addCreatedProperty('first', () => 1)
    .addCreatedProperty('another', () => 2)
    .result(result => result.data.first)
