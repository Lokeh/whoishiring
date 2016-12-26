import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';

export function makeStateReloadDriver() {
    const hotSource = new Rx.ReplaySubject<any>();
    let hotSubscription: Rx.Subscription;
    let originalDispose: Cactus.DisposeFn;
    return function hotProxyDriver(sinks: Cactus.Sinks, key: string) {
        // if we're already running, dispose of our subscribers
        if (hotSubscription) {
            hotSubscription.unsubscribe();
            hotSubscription = null;
        }

        // by remembering the outputs of the drivers, we hopefully
        // avoid repeating side effects (which may not be idempotent)
        const source = sinks[key];

        // subscribe to our source with our ReplaySubject
        // this will remember everything it emits, and then
        // when a new subscriber adds itself (e.g. above!)
        // it will replay all of it's events, in order
        hotSubscription = source.subscribe(hotSource);

        // return our "hot" driver
        return {
            source: hotSource.asObservable(),
            dispose: () => {
                hotSubscription.unsubscribe();
                hotSubscription = null;
            }
        };
    }
}
