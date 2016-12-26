import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import { Model } from './model';

function byTag(name) {
    return ({ tag, value }) => tag === name;
}

type GetPostsQuery = {
    threadPosts: number[],
    start: number,
};

export function firebaseRequests(sources, model$: Rx.Observable<Model>) {
    const actions = Cactus.selectable<any>(sources.events);
    const scrollBottom$: Rx.Observable<Cactus.ComponentEvent> = sources.scroll
        .filter(({ scrollY, scrollHeight }) => scrollY === scrollHeight)
        .do(() => console.log('bottom'));

    const threads$ = sources.firebase
        .filter(byTag('thread'))
        .filter(({ value }) => value.title && value.title.includes('Ask HN: Who is hiring?') && !value.dead)

    const posts$ = sources.firebase
        .filter(byTag('post'))
        .filter(({ value }) => !!value);
    
    const chooseThread$: Rx.Observable<number> = actions.select('threadItem')
        .map(({ props: { id } }) => id);

    const getPosts$ = Rx.Observable.merge(
        threads$
            .take(1)
            .map(({ value }) => ({
                threadPosts: value.kids,
                start: 0,
            })),
        chooseThread$
            .withLatestFrom<number, Model, GetPostsQuery>(
                model$,
                (chosenId, { threads }) => ({
                    threadPosts: threads.find(({ id }) => id === chosenId).kids,
                    start: 0,
                })
            ),
        scrollBottom$
            .withLatestFrom(
                model$.filter((state) => !!state.threads.length && !!state.posts.length),
                (_, { threads, selectedThread, lastPost }) => {
                    const threadPosts = threads.find(({ id }) => id === selectedThread).kids;
                    const start = threadPosts.findIndex((id) => id === lastPost)+1;
                    return {
                        threadPosts,
                        start,
                    };
                }
            )
    ).flatMap(({ threadPosts, start }: { threadPosts: number[], start: number }) => {
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

    const getThreadIds$ = model$
        .filter((state) => !state.threads.length)
        .take(1)
        .map(() => ({
                ref: 'v0/user/whoishiring/submitted',
                tag: 'threadIds',
        }));

    return Rx.Observable.merge(getThreadIds$, getThreads, getPosts$);
}
