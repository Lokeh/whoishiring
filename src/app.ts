import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import { view } from './view';

function byTag(name) {
    return ({ tag }) => tag === name;
}

export function main(sources: any) {
    const actions = Cactus.selectable<any>(sources.events);
    const titleIntent$ = sources.firebase
        .filter(byTag('latestThread'))
        .map(({ value }) => (state) => ({ ...state, title: value.title }));

    const postIntent$ = sources.firebase
        .filter(byTag('post'))
        .map(({ value }) => (state) => {
            const newPosts = state.posts.slice();
            newPosts.push(value);
            return {
                ...state,
                posts: newPosts,
            };
        });

    const menuToggleIntent$ = Rx.Observable.merge(
            actions.select('menuToggle'),
            actions.select('drawer'),
    )
        .do(() => console.log('toggled'))
        .map(() => ({ showMenu, ...state }) => ({
            ...state,
            showMenu: !showMenu,
        }));

    const model$ = Rx.Observable.merge(titleIntent$, postIntent$, menuToggleIntent$)
            .scan((state, reducer: any) => reducer(state), {
                title: '',
                posts: [],
                showMenu: false,
            })
            .startWith({
                title: 'Hello, world!',
                posts: [],
                showMenu: false,
            });
    // const model$ = Rx.Observable.of({})
    const { view$, events$ } = view(model$);

    const getPosts$ = sources.firebase
        .filter(byTag("latestThread"))
        .flatMap(({ value }) => {
            return Rx.Observable.from(value.kids.slice(0,10))
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
    const firebase$ = Rx.Observable.merge(getThreads$, getLatestThread$, getPosts$);
    return {
        render: view$,
        events: events$,
        firebase: firebase$,
    };
}
