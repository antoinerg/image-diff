import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		imagesUrl: [
			'https://raw.githubusercontent.com/plotly/plotly.js/master/test/image/baselines/14.png',
			'https://raw.githubusercontent.com/plotly/plotly.js/master/test/image/baselines/gl2d_14.png'
		]
	}
});

export default app;
