import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import { view } from './view';

function byTag(name) {
    return ({ tag }) => tag === name;
}

export function main(sources: any) {
    const actions = Cactus.selectable<any>(sources.events);

    const threads$ = sources.firebase
        .filter(byTag('thread'))
        .filter(({ value }) => value.title && value.title.includes('Ask HN: Who is hiring?') && !value.dead)
    const newThreadIntent$ = threads$
        .buffer(threads$.debounceTime(50))
        .map((valueArray) => (state) => {
            const newThreads = state.threads.slice();
            const liveThreads = valueArray
                .map(({ value }) => value);

            newThreads.push(...liveThreads);
            return {
                ...state,
                threads: newThreads,
            };
        });

    const posts$ = sources.firebase
        .filter(byTag('post'));
    const postIntent$ = posts$
        .buffer(posts$.debounceTime(50))
        .map((values) => (state) => {
            const newPosts = state.posts.slice();
            newPosts.push(...values.map(({ value }) => value));
            return {
                ...state,
                posts: newPosts,
            };
        });

    const menuToggleIntent$ = Rx.Observable.merge(
        actions.select('menuToggle'),
        actions.select('drawer'),
    )
        .map(() => ({ showMenu, ...state }) => ({
            ...state,
            showMenu: !showMenu,
        }));

    const titleIntent$ = threads$
        .take(1)
        .map(({ value: { title } }) => (state) => ({
            ...state,
            title,
        }));

    const model$ = 
        Rx.Observable.merge(menuToggleIntent$, newThreadIntent$, postIntent$, titleIntent$)
            .scan((state, reducer: any) => reducer(state), {
                title: 'Hello, world!',
                threads: [],
                selectedThread: 0,
                posts: [],
                showMenu: false,
            })
            .startWith({
                title: '',
                threads: [],
                selectedThread: 0,
                posts: [],
                showMenu: false,
            })
            .do((v) => console.log(v));
    const { view$, events$ } = view(model$);

    const getPosts$ = threads$
        .take(1)
        .flatMap(({ value }) => {
            return Rx.Observable.from(value.kids.slice(0,10))
                .map((id) => ({
                    ref: `v0/item/${id}`,
                    tag: 'post',
                }));
        });

    const getThreads = sources.firebase
        .filter(byTag("threadIds"))
        .flatMap(({ value }) =>
            Rx.Observable.from(value)
                .map((id) => ({
                    ref: `v0/item/${id}`,
                    tag: 'thread',
                }))
        );

    const getThreadIds$ = Rx.Observable.of({
            ref: 'v0/user/whoishiring/submitted',
            tag: 'threadIds',
        });
    const firebase$ = Rx.Observable.merge(getThreadIds$, getThreads, getPosts$);
    return {
        render: view$,
        events: events$,
        firebase: firebase$,
    };
}
