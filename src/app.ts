import * as Cactus from 'cactus';
import { view } from './view';

export function main(sources: any) {
    const actions = Cactus.selectable<any>(sources.events);
    const inputChange$ = actions.select('input')
        .map(({ value: ev }) => ({ name: ev.target.value }))
        .startWith({ name: '' })
        .do((v) => console.log(v));

    const { view$, events$ } = view(inputChange$);

    return {
        render: view$,
        events: events$,
    };
}
