import * as React from "react";
import * as Cactus from 'cactus';
import { compose }from 'ramda';

function view(model$: any) {
    const Input = compose(
        Cactus.observe('onChange'),
        Cactus.withProps({ type: "text" }),
    )('input');

    function View({ name }: { name: string }) {
        return (
            <div>
                <div>Bon jour, { name }!</div>
                <Input />
            </div>
        )
    }

    return Cactus.connectView(
        View,
        {
            input: Cactus.from(Input),
        },
        model$
    );
}

function main(sources: any) {
    const actions = Cactus.selectable<any>(sources.events);
    const inputChange$ = actions.select('input')
        .map(({ value: ev }) => ({ name: ev.target.value }))
        .startWith({ name: '' });

    const { view$, events$ } = view(inputChange$);

    return {
        render: view$,
        events: events$,
    };
}

export default Cactus.appAsComponent(
    main,
    {
        render: Cactus.makeReactComponentDriver(),
        events: Cactus.makeEventDriver(),
    },
    'hello-world'
);