import * as Cactus from 'cactus';
import * as React from "react";
import { compose } from 'ramda';

export function view(model$: any) {
    const Input = compose(
        Cactus.observe('onChange'),
        Cactus.withProps({ type: "text" }),
    )('input');

    function View({ name }: { name: string }) {
        return (
            <div>
                <div>zzz, { name }!</div>
                <Input />
            </div>
        )
    }

    return Cactus.connectView(
        View,
        { input: Cactus.from(Input) },
        model$
    );
}
