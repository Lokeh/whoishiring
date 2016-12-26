import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';

export function makeStateReloadDriver(initialState) {
    const hotSource = new Rx.ReplaySubject<any>(1);
    let firstLoad = true;
    let hotSubscription: Rx.Subscription;
    let originalDispose: Cactus.DisposeFn;
    return function hotProxyDriver(sinks: Cactus.Sinks, key: string) {
        // if we're already running, dispose of our subscribers
        if (hotSubscription) {
            hotSubscription.unsubscribe();
            hotSubscription = null;
        }

        const sink = sinks[key];

        // subscribe to our sink with our ReplaySubject
        // this will remember everything it emits, and then
        // when a new subscriber adds itself (e.g. above!)
        // it will replay all of it's events, in order
        hotSubscription = sink.subscribe(hotSource);

        let source;
        if (firstLoad) {
            console.log('first load');
            source = hotSource.asObservable().startWith(initialState);
            firstLoad = false;
        }
        else {
            source = hotSource.asObservable();
        }

        // return our "hot" driver
        return {
            source,
            dispose: () => {
                hotSubscription.unsubscribe();
                hotSubscription = null;
            }
        };
    }
}
