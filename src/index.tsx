import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Cactus from 'cactus';
import { compose } from 'ramda';
import { view } from './view';

function main(sources: any) {
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

// Hot Module Replacement API
if (module.hot) {
    module.hot.accept("./view", () => {
        const Nextview = require("./view").view;
        Cactus.run(
            main,
            {
                render: Cactus.makeReactComponentDriver(),
                events: Cactus.makeEventDriver(),
            }
        );
    });
}
