import * as Rx from 'rxjs/Rx';

export type Model = {
    title: string,
    threads: any[],
    selectedThread: number,
    posts: any[],
    lastPost: number,
    showMenu: boolean,
};

export function model(intents$): Rx.Observable<Model> {
    return intents$
        .scan((state, reducer: any) => reducer(state), {
            title: 'Loading...',
            threads: [],
            selectedThread: 0,
            posts: [],
            lastPost: 0,
            showMenu: false,
        })
        .startWith({
            title: 'Loading...',
            threads: [],
            selectedThread: 0,
            posts: [],
            lastPost: 0,
            showMenu: false,
        })
        .do((v) => console.log(v));
}
