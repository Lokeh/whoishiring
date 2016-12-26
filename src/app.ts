import * as Rx from 'rxjs/Rx';
import * as Cactus from '@lilactown/cactus';
import { FirebaseSource } from './drivers/firebase';
import { model, Model } from './model';
import { view } from './view';
import { intent } from './intents';
import { firebaseRequests } from './firebaseRequests';

function byTag(name) {
    return ({ tag, value }) => tag === name;
}

export interface Sources extends Cactus.RenderSource, Cactus.EventSource, FirebaseSource {
    scroll: Rx.Observable<any>,
    reload: Rx.Observable<Model>,
};

export function main(sources: Sources) {
    const model$ = Rx.Observable.merge(
        model(intent(sources)),
        sources.reload.take(1),
    );
    const { view$, events$ } = view(model$);
    const firebase$ = firebaseRequests(sources, model$);
    return {
        render: view$,
        events: events$,
        firebase: firebase$,
        reload: model$,
    };
}
