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
    let subscriber;
    let tDispose;
    return function hotProxy(sinks, key) {
        if (subscriber) {
            subscriber.unsubscribe();
            tDispose();
        }
        const { source, dispose } = driver(sinks, key);
        tDispose = dispose;
        subscriber = source.subscribe(hotSource);
        const driverOutput = {
            source: hotSource,
            dispose: () => {
                subscriber.unsubscribe();
                dispose();
            }
        };
        return driverOutput;
    }
}

export function makeHot(drivers) {
    const hotDrivers = R.mapObjIndexed(makeHotDriver);
    return hotDrivers(drivers);
}
