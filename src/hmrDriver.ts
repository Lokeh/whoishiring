import * as Rx from 'rxjs/Rx';
import * as R from 'ramda';

interface Driver {
    (sinks: any, key: string): {
       source: Rx.Observable<any>,
       dispose: () => void,
    };
};

function makeHotDriver(driver: Driver) {
    const hotSource = new Rx.ReplaySubject<any>();
    let hotSubscriber;
    let originalDispose;
    return function hotProxyDriver(sinks, key) {
        // if we're already running, dispose of our subscribers
        if (hotSubscriber) {
            hotSubscriber.unsubscribe();
            originalDispose();
        }

        // by remembering the outputs of the drivers, we hopefully
        // avoid repeating side effects (which may not be idempotent)
        const { source, dispose } = driver(sinks, key);
        originalDispose = dispose;

        // subscribe to our source with our ReplaySubject
        // this will remember everything it emits, and then
        // when a new subscriber adds itself (e.g. above!)
        // it will replay all of it's events, in order
        hotSubscriber = source.subscribe(hotSource);

        // return our "hot" driver
        return {
            source: hotSource,
            dispose: () => {
                hotSubscriber.unsubscribe();
                dispose();
            }
        };
    }
}

export function makeHot(drivers) {
    // apply makeHotDriver to each driver definition
    const hotDrivers = R.mapObjIndexed(makeHotDriver);
    return hotDrivers(drivers);
}
