// App.jsx
const React = require('react');
const Firebase = require('firebase');
const Promise = require('bluebird');
const debounce = require('lodash/function').debounce;
const mui = require('material-ui');
const ThemeManager = new mui.Styles.ThemeManager();

const {Card, CardHeader, CardText, CircularProgress, LeftNav, AppBar, TextField, FontIcon} = mui;

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
			postIds: [],
			selectedIndex: 0,
			currentThread: [],
			search: ""
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
			retrieveItems(...ids).then((posts) => {
				const postIds = posts.filter((post) => post.title && post.title.substr(0, "Ask HN: Who is hiring?".length) === "Ask HN: Who is hiring?")
				this.setState({ postIds });
				this.threadRef = itemRef.child(postIds[0].id+'/kids');
				this.threadRef.on('value', (threadIds) => {
					retrieveItems(...threadIds.val()).then((thread) => {
						this.setState({
							currentThread: thread
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
		console.log(selectedIndex, menuItem);
		this.threadRef.off();
		this.threadRef = itemRef.child(this.state.postIds[selectedIndex].id+'/kids');
		this.setState({ currentThread: [], selectedIndex });
		this.threadRef.on('value', (threadIds) => {
			retrieveItems(...threadIds.val()).then((thread) => {
				this.setState({
					currentThread: thread
				});
			});
		});
	},
	render() {
		console.log('update');
		// if (!this.state.currentThread.length) {
		// 	return (
				
		// 	);
		// }
		const menuItems = this.state.postIds.map((post) => ({ text: post.title.slice('Ask HN: Who is hiring? ('.length, -1), postId: post.id }));
		return (
			<div>
				<AppBar title="HN: Who's Hiring?"
					onLeftIconButtonTouchTap={this._toggleNav}
					iconElementRight={
						<div>
							<Search onChange={debounce((value) => this.setState({ search: value }), 600)} />
						</div>
					} 
				/>
				<LeftNav ref="leftNav" menuItems={menuItems} selectedIndex={this.state.selectedIndex} docked={false} onChange={this._navSelect} />
				{this.state.currentThread.length
					? <Page posts={this.state.currentThread} search={this.state.search} />
					: (<div style={{textAlign: "center"}}>
						<CircularProgress mode="indeterminate" size={2} />
					</div>)
				}
			</div>
		);
	}
});

module.exports = App;

const Page = React.createClass({
	render() {
		const thread = this.props.posts
			.filter((el) => el && !el.deleted)
			.filter((post) => post.text.toLowerCase().match(this.props.search.toLowerCase()))
			.map((post, i) => (
				<Card key={post.id} style={{margin: "10px 0"}}>
					<CardText dangerouslySetInnerHTML={{__html: post.text}} />
				</Card>
			));

		return (
			<div style={{width: "90%", margin: "0 auto", wordWrap: 'break-word'}}>
				{thread}
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
			<TextField onChange={this.handleChange} style={{marginRight: "20px"}} hintText="search" />
		);
	}
});
