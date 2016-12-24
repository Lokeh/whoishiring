import * as Cactus from '@lilactown/cactus';
import * as React from "react";
import { compose } from 'ramda';
import {
    Container,
    Toolbar,
    NavItem,
    Drawer,
    Close,
    Card,
    Heading,
    Text,
} from 'rebass';

export function view(model$: any) {
    const Post = Cactus.observe('onClick')(Card);
    function View() {
        return (
            <div>
                <Drawer open={false}>
                    <Close />
                </Drawer>
                <Toolbar>
                    <NavItem>Who is hiring? (December 2016)</NavItem>
                </Toolbar>
                <Container style={{ paddingTop: "10px" }}>
                    <Post>
                        <Heading level={3}>Hello</Heading>
                        <Text>World</Text>
                    </Post>
                    <Post>
                        <Heading level={3}>Hello</Heading>
                        <Text>World</Text>
                    </Post>
                </Container>
            </div>
        )
    }

    return Cactus.connectView(
        View,
        {
            postClick: Cactus.from(Post),
        },
        model$
    );
}
