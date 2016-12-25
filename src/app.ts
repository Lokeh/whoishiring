import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import { view } from './view';

function byTag(name) {
    return ({ tag }) => tag === name;
}

export function main(sources: any) {
    const actions = Cactus.selectable<any>(sources.events);
    const scrollBottom$ = sources.scroll
        .filter(({ scrollY, scrollHeight }) => scrollY === scrollHeight)

    const threads$: Rx.Observable<any> = sources.firebase
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
        .filter(byTag('post'))
        .filter(({ value }) => !!value);
    const postIntent$ = posts$
        .buffer(posts$.debounceTime(50))
        .map((values) => (state) => {
            const newPosts = state.posts.slice();
            newPosts.push(...values.map(({ value }) => value));
            return {
                ...state,
                posts: newPosts,
                lastPost: newPosts[newPosts.length-1].id,
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
    
    const chooseThread$ = actions.select('threadItem')
        .map(({ props: { id } }) => id);

    const threadSelectIntent$ = Rx.Observable.merge(
        threads$
            .take(1)
            .map(({ value: { title, id } }) => (state) => ({
                ...state,
                selectedThread: id,
                title,
            })),
        chooseThread$
            .map((chosenId) => ({ threads, ...state }) => ({
                ...state,
                threads,
                title: threads.find(({ id }) => id === chosenId).title,
                selectedThread: chosenId,
                showMenu: false,
                posts: [],
            })),
    );

    const model$ = 
        Rx.Observable.merge(menuToggleIntent$, newThreadIntent$, postIntent$, threadSelectIntent$)
            .scan((state, reducer: any) => reducer(state), {
                title: 'Loading...',
                threads: [],
                selectedThread: 0,
                posts: [],
                lastPost: 0,
                showMenu: false,
            })
            .startWith({
                title: '',
                threads: [],
                selectedThread: 0,
                posts: [],
                lastPost: 0,
                showMenu: false,
            })
            .do((v) => console.log(v));
    const { view$, events$ } = view(model$);

    const getPosts$ = Rx.Observable.merge(
        threads$
            .take(1)
            .map(({ value }) => ({
                threadPosts: value.kids.slice(0, 50),
                start: 0,
            })),
        chooseThread$
            .withLatestFrom(
                model$,
                (chosenId, { threads }) => ({
                    threadPosts: threads.find(({ id }) => id === chosenId)
                        .kids,
                    start: 0,
                })
            )
    ).flatMap(({ threadPosts, start }) => {
        return Rx.Observable.from(threadPosts.slice(start, start+50)).map((id) => ({
            ref: `v0/item/${id}`,
            tag: 'post',
        }))
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
