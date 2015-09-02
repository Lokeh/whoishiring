// App.jsx
const React = require('react');
const Firebase = require('firebase');
const Promise = require('bluebird');
const debounce = require('lodash/function/debounce');
const mui = require('material-ui');
const MediaQuery = require('react-responsive');
const ThemeManager = new mui.Styles.ThemeManager();

const {Card, CardHeader, CardText, CardActions, CircularProgress, LeftNav, AppBar, TextField, FontIcon, Avatar, FlatButton, RaisedButton, IconButton, ClearFix} = mui;

const userRef = new Firebase('https://hacker-news.firebaseio.com/v0/user');
const itemRef = new Firebase('https://hacker-news.firebaseio.com/v0/item');

function retrieveItems(...ids) {
	return new Promise((resolve, reject) => {
		let count = ids.length;
		const results = [];
		ids.forEach((id) => {
			itemRef.child(id).once('value', (d) => {
				results.push(d.val());
				if (--count === 0) {
					resolve(results);
				}
			});
		});
	});
}

const App = React.createClass({
	getInitialState() {
		return {
			threadIds: [],
			selectedIndex: 0,
			currentThread: [],
			search: "",
			page: 1
		};
	},
	childContextTypes: {
		muiTheme: React.PropTypes.object
	},
	getChildContext() {
		return {
			muiTheme: ThemeManager.getCurrentTheme()
		};
	},
	componentWillMount() {
		// MUI theme
		ThemeManager.setPalette({
			primary1Color: "#ff6600"
		});
		ThemeManager.setComponentThemes({
			textField: {
				textColor: mui.Styles.Colors.darkWhite
			}
		});

		// Firebase HN API
		userRef.child('whoishiring/submitted').on('value', (data) => {
			const ids = data.val();
			retrieveItems(...ids).then((threads) => {
				const threadIds = threads.filter((post) => post.title && post.title.substr(0, "Ask HN: Who is hiring?".length).toLowerCase() === "ask hn: who is hiring?")
				this.setState({ threadIds });
				this.threadRef = itemRef.child(threadIds[0].id+'/kids');
				this.threadRef.on('value', (postIds) => {
					retrieveItems(...postIds.val()).then((thread) => {
						this.setState({
							currentThread: thread,
							page: 1
						});
					});
				});
			});
		});
	},
	_toggleNav() {
		this.refs.leftNav.toggle();
	},
	_navSelect(e, selectedIndex, menuItem) {
		// get selected thread
		this.threadRef.off(); // clean up previous firebase listeners
		this.threadRef = itemRef.child(this.state.threadIds[selectedIndex].id+'/kids');
		this.setState({ currentThread: [], selectedIndex });
		this.threadRef.on('value', (threadIds) => {
			retrieveItems(...threadIds.val()).then((thread) => {
				this.setState({
					currentThread: thread,
					page: 1
				});
			});
		});
	},
	_nextPage() {
		this.setState({
			page: this.state.page +1
		});
	},
	render() {
		console.log('update');
		const menuItems = this.state.threadIds.map((post) => ({ text: post.title.slice('Ask HN: Who is hiring? ('.length, -1), postId: post.id }));
		return (
			<div>
				<AppBar title="Who's Hiring?"
					onLeftIconButtonTouchTap={this._toggleNav}
					iconElementRight={
						<div>
							<MediaQuery minDeviceWidth={600}>
								<Search onChange={debounce((value) => this.setState({ search: value, page: 1 }), 400)} />
							</MediaQuery>
							<MediaQuery maxDeviceWidth={599}>
								<IconButton iconClassName="fa fa-search" iconStyle={{color: mui.Styles.Colors.darkWhite}} />
							</MediaQuery>
						</div>
					}
				/>
				<LeftNav ref="leftNav" menuItems={menuItems} selectedIndex={this.state.selectedIndex} docked={false} onChange={this._navSelect} />
				{this.state.currentThread.length
					? <Page posts={this.state.currentThread} search={this.state.search} page={this.state.page} nextPage={this._nextPage} />
					: (<div style={{textAlign: "center"}}>
						<CircularProgress mode="indeterminate" size={2} />
					</div>)
				}
				<ClearFix />
				<p style={{textAlign: "center", fontFamily: "Roboto, sans-serif"}}>Design and code by <a href="http://willacton.com">Will Acton</a></p>
			</div>
		);
	}
});

module.exports = App;

// {title={post.text
// 							.split('<p>')[0]
// 							.replace(/(<([^>]+)>)/ig,"")
// 							.replace(/&#x27;/g,"'")
// 							.replace(/&#x2F;/g,"/")
// 							.slice(0, 60)+'...'}
// 						subtitle={post.by}}

const Page = React.createClass({
	render() {
		const thread = this.props.posts
			.filter((el) => el && !el.deleted)
			.filter((post) => post.text.toLowerCase().match(this.props.search.toLowerCase()));
			
		console.log(this.props.page, Math.ceil(thread.length / 10));
		return (
			<div style={{width: "90%", margin: "5px auto", wordWrap: 'break-word'}}>
				{thread
					.slice(0, this.props.page*10)
					.map((post, i) => (
						<Card key={post.id} style={{margin: "10px 0"}} initiallyExpanded>
							<CardHeader
								title="Post"
								subtitle={(<a href={"https://news.ycombinator.com/user?id="+post.by}>by {post.by}</a>)}
								avatar={<Avatar>H</Avatar>}
								showExpandableButton
							/>
							<CardText dangerouslySetInnerHTML={{__html: post.text}} expandable />
							<CardActions expandable style={{textAlign: "right"}}>
								<FlatButton linkButton labelStyle={{marginRight: "12px"}} href={"https://news.ycombinator.com/item?id="+post.id} target="_blank" label="Link" />
							</CardActions>
						</Card>
					))
				}
				{/*this.state.page > 1
					? (<FlatButton label="Previous" onClick={this._prevPage} />)
					: ''
				*/}
				<div style={{textAlign: "center"}}>
				{this.props.page < Math.ceil(thread.length / 10)
					? (<RaisedButton backgroundColor="#ff6600" labelColor={mui.Styles.Colors.darkWhite} label="More" onClick={this.props.nextPage} fullWidth />)
					: ''
				}
				</div>
			</div>
		);
	}
});

const Search = React.createClass({
	handleChange(e) {
		this.props.onChange(e.target.value);
	},
	render() {
		return (
			<div style={{marginRight: "50px"}}>
				<FontIcon className="fa fa-search" color={mui.Styles.Colors.darkWhite} style={{margin: "0 5px", top: "3px", fontSize: "20px"}} />
				<TextField onChange={this.handleChange} hintText="regexp" />
			</div>
		);
	}
});
