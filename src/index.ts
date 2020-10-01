import { DropFirst, First, MergeProperty, SetProperty } from './utils';

export type AddCreatedProperty<TName extends string, TProperty, TOther> = { type:'addCreatedProperty'; name: TName; creator: (other: TOther) => TProperty }
export type AddStaticProperty<TName extends string, TProperty> = { type: 'addStaticProperty', name: TName; value: TProperty }
export type UseResult<TResult> = { type: 'useResult'; handler: (result: TResult) => void }

export type Step =
    | AddCreatedProperty<any, any, any>
    | AddStaticProperty<any, any>
    | UseResult<any>

export type AvailableProps<T extends Step[], R> =
    First<T> extends undefined ? R :
    First<T> extends AddCreatedProperty<infer TName, infer TType, any> ? AvailableProps<DropFirst<T>, SetProperty<R, TName, TType>> :
    First<T> extends AddStaticProperty<infer TName, infer TType> ? AvailableProps<DropFirst<T>, SetProperty<R, TName, TType>> :
    AvailableProps<DropFirst<T>, R>

type Result<T extends Step[], R> = 
    First<T> extends undefined ? R :
    First<T> extends AddCreatedProperty<infer TName, infer TType, any> ? Result<DropFirst<T>, MergeProperty<R, 'data', { [P in TName]: TType }>> :
    First<T> extends AddStaticProperty<infer TName2, infer TType2> ? Result<DropFirst<T>, MergeProperty<R, 'data', { [P in TName2]: TType2 }>> :
    Result<DropFirst<T>, R>

class Builder<T extends Step[]> {
    constructor(private readonly steps: T) {}

    append<S extends Step>(step: S): Builder<[...T, S]> { return new Builder([...this.steps, step]); }

    addCreatedProperty = <TName extends string, TProp>(name: TName, creator: (available: AvailableProps<T, {}>) => TProp) =>
        this.append({ type: 'addCreatedProperty', name, creator });

    addStaticProperty = <TName extends string, TProp>(name: TName, value: TProp) =>
        this.append({ type: 'addStaticProperty', name, value });

    result = (handler: (result: Result<T, {}>) => void) =>
        this.append({ type: 'useResult', handler });
}

new Builder<[]>([])
    .addCreatedProperty('first', () => 1)
    .addCreatedProperty('another', () => 2)
    .addCreatedProperty('bla', other => other.another)
    .result(result => result.data.first)
