// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// DOM elements
const getImageBtn = document.getElementById('getImageBtn');
const gallery = document.getElementById('gallery');
const randomFactText = document.getElementById('randomFactText');

// Random space facts (display one at page load)
const spaceFacts = [
	'A day on Venus is longer than a year on Venus — it rotates very slowly.',
	'There are more trees on Earth than stars in the Milky Way galaxy (estimates vary).',
	'Neutron stars can spin up to 716 times per second.',
	'Space is not completely empty — it contains sparse gas, dust, and background radiation.',
	'A spoonful of a neutron star would weigh about a billion tons on Earth.',
	'The largest volcano in the solar system is Olympus Mons on Mars — roughly three times the height of Mount Everest.',
	'The footprints left on the Moon will likely remain for millions of years because there is no wind to erase them.',
	'Saturn could float in water because it is mostly made of gas and has a low average density.',
	'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
	'Harvard astronomers estimate the observable universe contains over 2 trillion galaxies.'
];

function displayRandomFact() {
	if (!randomFactText) return;
	const idx = Math.floor(Math.random() * spaceFacts.length);
	randomFactText.textContent = spaceFacts[idx];
}

// Show a different fact each time the page loads
displayRandomFact();

// Ensure modal exists (we create it dynamically)
function ensureModal() {
	if (document.getElementById('apodModal')) return;

	const modal = document.createElement('div');
	modal.id = 'apodModal';
	modal.className = 'modal hidden';
	modal.innerHTML = `
		<div class="modal-backdrop" id="modalBackdrop"></div>
		<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
			<button class="modal-close" id="modalClose" aria-label="Close modal">✕</button>
			<div class="modal-media" id="modalMedia"></div>
			<h2 id="modalTitle"></h2>
			<p class="modal-date" id="modalDate"></p>
			<p class="modal-explanation" id="modalExplanation"></p>
		</div>
	`;

	document.body.appendChild(modal);

	// Close handlers
	modal.querySelector('#modalClose').addEventListener('click', closeModal);
	modal.querySelector('#modalBackdrop').addEventListener('click', closeModal);
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closeModal();
	});
}

function openModal(item) {
	ensureModal();
	const modal = document.getElementById('apodModal');
	const media = document.getElementById('modalMedia');
	const title = document.getElementById('modalTitle');
	const date = document.getElementById('modalDate');
	const explanation = document.getElementById('modalExplanation');

	// Clear previous
	media.innerHTML = '';
	title.textContent = item.title || '';
	date.textContent = item.date || '';
	explanation.textContent = item.explanation || '';

	if (item.media_type === 'image') {
		const img = document.createElement('img');
		// Prefer hdurl for the larger view when available
		img.src = item.hdurl || item.url || '';
		img.alt = item.title || 'APOD image';
		img.className = 'modal-img';
		media.appendChild(img);
	} else if (item.media_type === 'video') {
		// Some video urls already use /embed/ which is safe for iframes.
		const iframe = document.createElement('iframe');
		iframe.src = item.url;
		iframe.setAttribute('frameborder', '0');
		iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
		iframe.setAttribute('allowfullscreen', '');
		iframe.className = 'modal-iframe';
		media.appendChild(iframe);
	} else {
		// Fallback: link to the URL
		const a = document.createElement('a');
		a.href = item.url;
		a.textContent = 'Open media in a new tab';
		a.target = '_blank';
		media.appendChild(a);
	}

	modal.classList.remove('hidden');
	document.body.style.overflow = 'hidden';
}

function closeModal() {
	const modal = document.getElementById('apodModal');
	if (!modal) return;
	modal.classList.add('hidden');
	// stop video playback by removing iframe src (simple cleanup)
	const iframe = modal.querySelector('iframe');
	if (iframe) iframe.src = iframe.src;
	document.body.style.overflow = '';
}

function createGalleryItem(item) {
	const card = document.createElement('article');
	card.className = 'gallery-item';

	// Thumbnail container (image or video thumbnail)
	const thumb = document.createElement('div');
	thumb.className = 'gallery-thumb';

	if (item.media_type === 'image') {
		const img = document.createElement('img');
		img.src = item.url || item.hdurl || '';
		img.alt = item.title || 'APOD image';
		thumb.appendChild(img);
	} else if (item.media_type === 'video') {
		// Use provided thumbnail_url when available; otherwise use an embedded screenshot if possible
		const img = document.createElement('img');
		img.src = item.thumbnail_url || '';
		img.alt = item.title || 'APOD video thumbnail';
		img.className = 'video-thumb';
		thumb.appendChild(img);

		// Play overlay
		const play = document.createElement('div');
		play.className = 'play-overlay';
		play.textContent = '▶';
		thumb.appendChild(play);
	}

	// Text block
	const info = document.createElement('div');
	info.className = 'gallery-info';
	const title = document.createElement('h3');
	title.textContent = item.title || '';
	const date = document.createElement('p');
	date.className = 'gallery-date';
	date.textContent = item.date || '';
	info.appendChild(title);
	info.appendChild(date);

	card.appendChild(thumb);
	card.appendChild(info);

	// Click opens modal
	card.addEventListener('click', () => openModal(item));

	return card;
}

function showLoading() {
	gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🔄</div><p>Loading space photos…</p></div>`;
}

function showError(message) {
	gallery.innerHTML = `<div class="placeholder"><p>${message}</p></div>`;
}

async function fetchAndRender() {
	showLoading();
	try {
		const res = await fetch(apodData);
		if (!res.ok) throw new Error(`Network response was not ok (${res.status})`);
		const data = await res.json();

		if (!Array.isArray(data) || data.length === 0) {
			showError('No images found.');
			return;
		}

		// Clear and render
		gallery.innerHTML = '';
		data.forEach(item => {
			const node = createGalleryItem(item);
			gallery.appendChild(node);
		});

	} catch (err) {
		console.error(err);
		showError('Failed to load images. Please try again later.');
	}
}

// Wire button
getImageBtn.addEventListener('click', fetchAndRender);

// Create modal CSS via ensureModal call later; ensure initial modal exists so CSS is applied when needed
ensureModal();