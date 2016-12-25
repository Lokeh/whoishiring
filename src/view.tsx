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

function scrapeTitle(text) {
    // console.log(text);
    return text.match(/.*\|.*?(?=<p>|$)/);
}

function threadTitle(title) {
    return title.trim().slice('Ask HN: Who is hiring? ('.length, -1);
}

export function view(model$: any) {
    const MenuToggle = Cactus.observe('onClick')(NavItem);
    const DismissableDrawer = Cactus.observe<any>('onDismiss')(Drawer);
    const ThreadItem = Cactus.observe<any>('onClick')(NavItem);
    function View({ title, posts, threads, showMenu }) {
        return (
            <div>
                <DismissableDrawer open={showMenu}>
                    {threads.map((thread, i) => 
                        <ThreadItem style={{color: "#fff"}} key={thread.id} id={thread.id}>
                            {threadTitle(thread.title)}
                        </ThreadItem>    
                    )}
                </DismissableDrawer>
                <Toolbar>
                    <MenuToggle><i className="fa fa-bars" /></MenuToggle>
                    <NavItem>{ title }</NavItem>
                </Toolbar>
                <Container style={{ paddingTop: "10px" }}>
                    {posts.map((post, i) => {
                        const title = post.text ? scrapeTitle(post.text) : null;
                        return (
                            <Panel key={i}>
                                <PanelHeader>
                                    <span dangerouslySetInnerHTML={{ __html: title ? title[0] : 'Post'}} />
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
            menuToggle: Cactus.from(MenuToggle),
            drawer: Cactus.from(DismissableDrawer),
            threadItem: Cactus.from(ThreadItem),
        },
        model$
    );
}
