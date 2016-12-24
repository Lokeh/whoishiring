import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import * as firebase from 'firebase';

export function makeFirebaseDriver(): Cactus.Driver {
    const app = firebase.initializeApp({
        databaseURL: 'https://hacker-news.firebaseio.com/',
    });
    const database = app.database();
    return (sinkProxies: Cactus.Sinks, key: string) => {
        const proxy = sinkProxies[key];
        const source = proxy.flatMap(({ ref, tag }) => 
            Rx.Observable.fromEvent(database.ref(ref), 'value')
                .map((v: any) => ({
                    value: v.val(),
                    tag,
                }))).share()

        const subscription = source.subscribe();
        const dispose = () => subscription.unsubscribe();
        return {
            source,
            dispose,
        };
    };
}
