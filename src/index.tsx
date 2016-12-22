// import 'normalize.css';
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Cactus from 'cactus';
import { makeHot } from './hmrDriver';
import { main } from './app';

const drivers = makeHot({
    render: Cactus.makeReactDOMDriver(document.getElementById('root')),
    events: Cactus.makeEventDriver(true),
});

Cactus.run(main, drivers);

// Hot Module Replacement API
if (module.hot) {
    module.hot.accept("./app", () => {
        const nextMain = require("./app").main;
        Cactus.run(
            nextMain,
            drivers
        );
    });
}
