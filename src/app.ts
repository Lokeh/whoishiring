import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import { view } from './view';

function byTag(name) {
    return ({ tag }) => tag === name;
}

export function main(sources: any) {
    const getPosts$ = sources.firebase
        .filter(byTag("latestThread"))
        .flatMap(({ value }) => {
            return Rx.Observable.from(value.kids)
                .map((id) => ({
                    ref: `v0/item/${id}`,
                    tag: 'post',
                }));
        });
    const getLatestThread$ = sources.firebase
        .filter(byTag("threads"))
        .map(({ value }) => ({
            ref: `v0/item/${value[0]}`,
            tag: 'latestThread',
        }))
    
    const getThreads$ = Rx.Observable.of({
            ref: 'v0/user/whoishiring/submitted',
            tag: 'threads',
        });

    const model$ = sources.firebase
            .do((v) => console.log('model$', v))
            .map(() => ({ loading: false }))
            .startWith({ loading: true });
    // const model$ = Rx.Observable.of({})
    const { view$, events$ } = view(model$);
    const firebase$ = Rx.Observable.merge(getThreads$, getLatestThread$, getPosts$);
    return {
        render: view$,
        events: events$,
        firebase: firebase$,
    };
}
