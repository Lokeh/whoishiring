import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';

export function makeScrollDriver(): Cactus.Driver {
    const scrollEvent = Rx.Observable.fromEventPattern(
        (h: EventListener) => window.addEventListener('scroll', h, false),
        (h: EventListener) => window.removeEventListener('scroll', h, false)
    );
    return (sinkProxies: Cactus.Sinks, key: string) => {
        const proxy = sinkProxies[key];
        const source = scrollEvent.map((evt) => ({
            scrollY: document.body.scrollTop + window.innerHeight,
            scrollHeight: document.body.scrollHeight,
        }));
        const subscription = source.subscribe();
        const dispose = () => subscription.unsubscribe();
        return {
            source,
            dispose,
        };
    };
}
