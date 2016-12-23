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
    function View() {
        return (
            <div>
                <Drawer open={false}>
                    <Close />
                </Drawer>
                <Toolbar>
                    <NavItem>Who is hiring: December</NavItem>
                </Toolbar>
                <Container style={{ paddingTop: "10px" }}>
                    <Card>
                        <Heading level={3}>Hello</Heading>
                        <Text>World</Text>
                    </Card>
                    <Card>
                        <Heading level={3}>Hello</Heading>
                        <Text>World</Text>
                    </Card>
                </Container>
            </div>
        )
    }

    return Cactus.connectView(
        View,
        {},
        model$
    );
}
