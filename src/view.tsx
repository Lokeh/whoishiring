import * as Cactus from '@lilactown/cactus';
import * as React from "react";
import { compose } from 'ramda';
import {
    Container,
    Toolbar,
    NavItem,
    Drawer,
    Close,
    Panel,
    PanelHeader,
    Text,
} from 'rebass';

export function view(model$: any) {
    const MenuToggle = Cactus.observe('onClick')(NavItem);
    function View({ title, posts }) {
        return (
            <div>
                <Drawer open={false}>
                </Drawer>
                <Toolbar>
                    <MenuToggle><i className="fa fa-bars" /></MenuToggle>
                    <NavItem>{ title }</NavItem>
                </Toolbar>
                <Container style={{ paddingTop: "10px" }}>
                    {posts.map((post, i) => {
                        return (
                            <Panel key={post.id}>
                                <PanelHeader>
                                    Post
                                </PanelHeader>
                                <Text><span dangerouslySetInnerHTML={{ __html: post.text }} /></Text>
                            </Panel>
                        )
                    })}
                </Container>
            </div>
        )
    }

    return Cactus.connectView(
        View,
        {
            menuButton: Cactus.from(MenuToggle)
        },
        model$
    );
}
