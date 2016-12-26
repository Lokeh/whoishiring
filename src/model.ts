import * as Rx from 'rxjs/Rx';
import { Intents } from './intents';
export type Model = {
    title: string,
    threads: any[],
    selectedThread: number,
    posts: any[],
    lastPost: number,
    showMenu: boolean,
};

export function model(intents$: Intents, reload$): Rx.Observable<Model> {
    return reload$.take(1).flatMap((initialState) => {
        return intents$
            .scan((state, reducer: any) => reducer(state), initialState)
            .startWith(initialState)
    })
        // .startWith({
        //     title: 'Loading...',
        //     threads: [],
        //     selectedThread: 0,
        //     posts: [],
        //     lastPost: 0,
        //     showMenu: false,
        // })
        // .do((v) => console.log(v));
}
