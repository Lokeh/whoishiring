# Hacker News: Who's Hiring?

[Live site](http://projects.willacton.com/whoishiring)

An app to easily filter and look through postings in the "Ask HN: Who is hiring?" threads.

The app can query all available data dating back to 2011, and is live updated while a thread is going.

In the search bar, you can type in a regular expression to narrow your results. e.g.: `javascript|ruby`

Or, getting more advance: `(?=.*javascript)(?=.*remote|portland)`

## Developing

I encourage anyone to fork it, hack away, create pull requests! It's easy enough:

```
git clone https://github.com/Lokeh/whoishiring.git
cd whoishiring/
npm install
grunt
```

Grunt-browserify will then watch files in src/ and build them into dist/app.js.

**Who's Hiring** is built using React and material-ui. Most of the code is contained in `src/js/components/App.jsx`.

## To Do
- Mobile search styling
