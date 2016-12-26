import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Cactus from '@lilactown/cactus';
import { makeFirebaseDriver, FirebaseDriverDefinition } from './drivers/firebase';
import { makeScrollDriver } from './drivers/scroll';
import { main } from './app';

type Drivers =
    Cactus.RenderDriverDefinition &
    Cactus.EventDriverDefinition &
    FirebaseDriverDefinition

const drivers: Drivers = {
    render: Cactus.makeReactDOMDriver(document.getElementById('root')),
    events: Cactus.makeEventDriver(true),
    firebase: makeFirebaseDriver(),
    scroll: makeScrollDriver(),
};

Cactus.run(main, drivers);
