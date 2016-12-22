import * as Cactus from '@lilactown/cactus';
import { view } from './view';

export function main(sources: any) {
    const actions = Cactus.selectable<any>(sources.events);
    const inputChange$ = actions.select('input')
        .map(({ value: ev }) => ({ name: ev.target.value }))
        .startWith({ name: '' })

    const { view$, events$ } = view(inputChange$);

    return {
        render: view$,
        events: events$,
    };
}
