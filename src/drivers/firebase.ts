import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import * as firebase from 'firebase';

export interface FirebaseSink extends Cactus.Sinks {
    firebase: Rx.Observable<{
        ref: string,
        tag: string,
    }>;
}
export interface FirebaseSourceDefinition extends Cactus.SourceDefinition {
    source: Rx.Observable<{
        value: any,
        tag: string,
    }>;
    dispose: Cactus.DisposeFn;
}
export interface FirebaseSource extends Cactus.Sources {
    firebase: Rx.Observable<{
        value: any,
        tag: string,
    }>;
}
export interface FirebaseDriver extends Cactus.Driver {
    (sinks: FirebaseSink, key: string): FirebaseSourceDefinition;
}
export interface FirebaseDriverDefinition extends Cactus.Drivers {
    firebase: FirebaseDriver;
}

export function makeFirebaseDriver(): FirebaseDriver {
    const app = firebase.initializeApp({
        databaseURL: 'https://hacker-news.firebaseio.com/',
    });
    const database = app.database();
    return (sinkProxies: FirebaseSink, key: string) => {
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
