import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import { Sources } from './app';
function byTag(name) {
    return ({ tag, value }) => tag === name;
}

export type Reducer = (state: any) => any;
export type Intents = Rx.Observable<Reducer>;

export function intent(sources: Sources): Intents {
        const actions = Cactus.selectable<any>(sources.events);
    const scrollBottom$ = sources.scroll
        .filter(({ scrollY, scrollHeight }) => scrollY === scrollHeight)
        .do(() => console.log('bottom'));

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

    return Rx.Observable.merge(menuToggleIntent$, newThreadIntent$, postIntent$, threadSelectIntent$);
}
