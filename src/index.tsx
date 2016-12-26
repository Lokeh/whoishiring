import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Cactus from '@lilactown/cactus';
import { makeHot } from '@lilactown/cactus/utils/hotReloading';
import { makeFirebaseDriver, FirebaseDriverDefinition } from './drivers/firebase';
import { makeScrollDriver } from './drivers/scroll';
import { makeStateReloadDriver } from './drivers/hotReload';
import { main } from './app';

type Drivers =
    Cactus.RenderDriverDefinition &
    Cactus.EventDriverDefinition &
    FirebaseDriverDefinition// &
    // {
    //     reload: any,
    // };

const drivers = {
    render: Cactus.makeReactDOMDriver(document.getElementById('root')),
    events: Cactus.makeEventDriver(true),
    firebase: makeFirebaseDriver(),
    scroll: makeScrollDriver(),
    reload: makeStateReloadDriver(),
};

let dispose = Cactus.run(main, drivers);

// Hot Module Replacement API
if (module.hot) {
    module.hot.accept("./app", () => {
        const nextMain = require("./app").main;
        dispose();
        dispose = Cactus.run(
            nextMain,
            drivers
        );
    });
}
