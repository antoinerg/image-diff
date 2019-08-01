<svelte:head>
	<title>Diff images</title>
</svelte:head>

<script>
	import Comparify from './Comparify.svelte';

	import Spinner from 'svelte-spinner';
	import Icon from 'fa-svelte'
	import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
	let icon = faCheck;

	import pixelmatch from 'pixelmatch'; // To diff canvas images
	import { onMount } from 'svelte';

	onMount(() => {
		imgDiff();
	});

	export let imagesUrl;

	let images = [];
	let canvases = [];
	let width = [];
	let height = [];
	let loading = [];
	let error = [];

  let availableComponents = ['Diff', 'Slider']
	let components = availableComponents;
	let diffCanvas;
	let numDiffPixels;
	let percentDifference;

	let msg;

	function fetchImage(i) {
		loading[i] = true
		error[i] = false
	  return new Promise((resolve, reject) => {
	    const image = new Image;
	    image.crossOrigin = "anonymous";
	    image.src = imagesUrl[i];
	    image.onload = () => {
				loading[i] = false
				resolve(image);
			}
	    image.onerror = () => {
				loading[i] = false
				error[i] = true
				reject;
			}
	  })
		.then(function(image) {
			images[i] = image;
			var w = image.width;
			var h = image.height;

			width[i] = w;
			height[i] = h;

			var canvas = canvases[i]
			canvas.width = w;
			canvas.height = h;
		})
	}

	async function imgDiff() {
		await Promise.all([fetchImage(0), fetchImage(1)]);
		// if(width[0] !== width[1] || height[0] !== height[1]) msg = 'Size mismatch'

		// Size all canvases to same size
		var w = Math.max(...width)
		var h = Math.max(...height)
		canvases.forEach((c, i) => {
			c.width = w;
			c.height = h

			var ctx = c.getContext("2d")
			ctx.drawImage(images[i], 0, 0);
			images[i] = ctx.getImageData(0, 0, w, h);
		})

		// Diff canvas
		diffCanvas.width = w;
		diffCanvas.height = h;
		var diffCtx = diffCanvas.getContext('2d');
		var diffImg = diffCtx.createImageData(w, h);

		numDiffPixels = pixelmatch(images[0].data, images[1].data, diffImg.data, w, h, {
			threshold: 0
		});
		percentDifference = (numDiffPixels / (w*h) * 100).toFixed(2)

		diffCtx.putImageData(diffImg, 0, 0);
	}
</script>

<style>
input {
	flex-grow: 1;
}

div.imgSelector {
	display: flex;
	flex-wrap: nowrap;
	justify-content: space-around;
	align-self: center;
	align-items: center;
	margin-bottom: 15px;
}

div.imgSelector * {
	margin-right: 20px;
}

div :global(.ok) {
	color: green;
}

div :global(.error) {
	color: red;
}

div :global(.icon) {
	font-size: 1.5em;
}

.hidden {
	display: none;
}
</style>

<h1>Diff images</h1>
{#each imagesUrl as image, i}
<div class="imgSelector">
	<input on:change={imgDiff} bind:value={image} />
	{#if loading[i]}
	<Spinner
	  speed="1000"
	  color="black"
	  thickness="5"
	  gap="40"
	/>
	{:else if !loading[i] && error[i]}
		<Icon icon={faTimes} class="icon error"/>
	{:else if !loading[i] && !error[i]}
		<Icon icon={faCheck} class="icon ok"/>
	{/if}
</div>
{/each}

<button on:click={imgDiff}>Compare</button>
{#each availableComponents as component}
	<label>
		<input type=checkbox bind:group={components} value={component}>
		{component}
	</label>
{/each}

<div class:hidden="{components.indexOf('Diff') === -1}">
	<h2>{numDiffPixels} different pixels (≈{percentDifference}%)</h2>
	{#if msg}
		<h3>{msg}</h3>
	{/if}
	<canvas bind:this={diffCanvas}/>
</div>

<div class:hidden="{components.indexOf('Slider') === -1}">
<Comparify width={width[0]} value="50">
	<canvas slot="A" bind:this={canvases[0]} />
	<canvas slot="B" bind:this={canvases[1]} />
</Comparify>
</div>
