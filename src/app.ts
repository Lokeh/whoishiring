import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import { view } from './view';
import { intent } from './intents';

function byTag(name) {
    return ({ tag }) => tag === name;
}

function model(intents$) {
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

export function main(sources: any) {
    const model$ = model(intent(sources));
    const { view$, events$ } = view(model$);

    const actions = Cactus.selectable<any>(sources.events);
    const scrollBottom$ = sources.scroll
        .filter(({ scrollY, scrollHeight }) => scrollY === scrollHeight)
        .do(() => console.log('bottom'));

    const threads$: Rx.Observable<any> = sources.firebase
        .filter(byTag('thread'))
        .filter(({ value }) => value.title && value.title.includes('Ask HN: Who is hiring?') && !value.dead)

    const posts$ = sources.firebase
        .filter(byTag('post'))
        .filter(({ value }) => !!value);
    
    const chooseThread$ = actions.select('threadItem')
        .map(({ props: { id } }) => id);

    const getPosts$ = Rx.Observable.merge(
        threads$
            .take(1)
            .map(({ value }) => ({
                threadPosts: value.kids,
                start: 0,
            })),
        chooseThread$
            .withLatestFrom(
                model$,
                (chosenId, { threads }) => ({
                    threadPosts: threads.find(({ id }) => id === chosenId).kids,
                    start: 0,
                })
            ),
        scrollBottom$
            .withLatestFrom(
                model$,
                (_, { threads, selectedThread, lastPost }) => {
                    const threadPosts = threads.find(({ id }) => id === selectedThread).kids;
                    const start = threadPosts.findIndex((id) => id === lastPost)+1;
                    return {
                        threadPosts,
                        start,
                    };
                }
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
