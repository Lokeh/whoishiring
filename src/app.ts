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
    const newThreadIntent$ = threads$
        .buffer(threads$.debounceTime(50))
        .map((valueArray) => (state) => {
            const newThreads = state.threads.slice();
            const liveThreads = valueArray
                .filter(({ value }) => value.title && value.title.includes('Ask HN: Who is hiring?') && !value.dead)
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
        .buffer(posts$.debounceTime(50)).flatMap(x => x)
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
        .map(() => ({ showMenu, ...state }) => ({
            ...state,
            showMenu: !showMenu,
        }));

    const model$ = 
        Rx.Observable.merge(menuToggleIntent$, newThreadIntent$)//, titleIntent$, postIntent$)
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

    const getPosts$ = sources.firebase
        .filter(byTag("latestThread"))
        .flatMap(({ value }) => {
            return Rx.Observable.from(value.kids.slice(0,10))
                .map((id) => ({
                    ref: `v0/item/${id}`,
                    tag: 'post',
                }));
        });

    // TO DO: Get all thread titles
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
