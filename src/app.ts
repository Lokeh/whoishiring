import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import { view } from './view';

export function main(sources: any) {
    const actions = Cactus.selectable<any>(sources.events);

    const model$ = Rx.Observable.of({});

    const { view$, events$ } = view(model$);

    return {
        render: view$,
        events: events$,
    };
}
