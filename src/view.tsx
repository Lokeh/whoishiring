import * as Cactus from 'cactus';
import * as React from "react";
import { compose } from 'ramda';

export function view(model$: any) {
    const Input = compose(
        Cactus.observe<any>('onChange'),
        Cactus.withProps({ type: "text" }),
    )('input');

    function View({ name }: { name: string }) {
        return (
            <div>
                <div>Hello, { name }!</div>
                <Input value={name} />
            </div>
        )
    }

    return Cactus.connectView(
        View,
        { input: Cactus.from(Input) },
        model$
    );
}
