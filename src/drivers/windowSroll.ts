import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';

export function makeScrollDriver(): Cactus.Driver {
    const scrollPosition$ = Rx.Observable.fromEventPattern(
        (h: EventListener) => window.addEventListener('scroll', h, false),
        (h: EventListener) => window.removeEventListener('scroll', h, false)
    );
    return (sinkProxies: Cactus.Sinks, key: string) => {
        const proxy = sinkProxies[key];
        const source = scrollPosition$.do((v) => console.log(v));
        const subscription = source.subscribe();
        const dispose = () => subscription.unsubscribe();
        return {
            source,
            dispose,
        };
    };
}
