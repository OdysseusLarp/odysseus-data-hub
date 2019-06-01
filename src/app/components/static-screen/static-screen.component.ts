import {
	Component,
	OnInit,
	OnDestroy,
	ViewChild,
	ElementRef,
} from '@angular/core';

// Code copied from:
// https://codepen.io/alenaksu/pen/dGjeMZ

@Component({
	selector: 'app-static-screen',
	templateUrl: './static-screen.component.html',
	styleUrls: ['./static-screen.component.scss'],
})
export class StaticScreenComponent implements OnInit, OnDestroy {
	@ViewChild('canvas') canvas: ElementRef;
	scaleFactor = 2.5;
	sampleIndex = 0;
	scanOffsetY = 0;
	FPS = 50;
	scanSpeed = this.FPS * 15;
	SAMPLE_COUNT = 10;
	scanSize = 0;
	samples = [];

	constructor() {}

	ngOnInit() {
		const canvas: HTMLCanvasElement = this.canvas.nativeElement;
		const context: CanvasRenderingContext2D =
			canvas.getContext('gl') || <any>canvas.getContext('2d');

		window.onresize = () => {
			canvas.width = canvas.offsetWidth / this.scaleFactor;
			canvas.height = canvas.width / (canvas.offsetWidth / canvas.offsetHeight);
			this.scanSize = canvas.offsetHeight / this.scaleFactor / 3;

			this.samples = [];
			for (let i = 0; i < this.SAMPLE_COUNT; i++)
				this.samples.push(
					this.generateRandomSample(context, canvas.width, canvas.height)
				);
		};
		window.onresize(undefined);
		window.requestAnimationFrame(() => this.render());
	}

	ngOnDestroy() {
		window.onresize = null;
	}

	private interpolate(x, x0, y0, x1, y1) {
		return y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
	}

	private generateRandomSample(context, w, h) {
		const intensity = [];
		const factor = h / 50;
		const trans = 1 - Math.random() * 0.05;

		const intensityCurve = [];
		for (let i = 0; i < Math.floor(h / factor) + factor; i++)
			intensityCurve.push(Math.floor(Math.random() * 15));

		for (let i = 0; i < h; i++) {
			intensity.push(
				this.interpolate(
					i / factor,
					Math.floor(i / factor),
					intensityCurve[Math.floor(i / factor)],
					Math.floor(i / factor) + 1,
					intensityCurve[Math.floor(i / factor) + 1]
				)
			);
		}

		const imageData = context.createImageData(w, h);
		for (let i = 0; i < w * h; i++) {
			const k = i * 4;
			let color = Math.floor(36 * Math.random());
			color += intensity[Math.floor(i / w)];
			imageData.data[k] = imageData.data[k + 1] = imageData.data[k + 2] = color;
			imageData.data[k + 3] = Math.round(255 * trans);
		}
		return imageData;
	}

	private render() {
		const canvas: HTMLCanvasElement = this.canvas.nativeElement;
		const context: CanvasRenderingContext2D =
			canvas.getContext('gl') || <any>canvas.getContext('2d');
		context.putImageData(this.samples[Math.floor(this.sampleIndex)], 0, 0);

		this.sampleIndex += 20 / this.FPS; // 1/FPS == 1 second
		if (this.sampleIndex >= this.samples.length) this.sampleIndex = 0;

		const grd = context.createLinearGradient(
			0,
			this.scanOffsetY,
			0,
			this.scanSize + this.scanOffsetY
		);

		grd.addColorStop(0, 'rgba(212,251,252,0)');
		grd.addColorStop(0.1, 'rgba(212,251,252,0)');
		grd.addColorStop(0.2, 'rgba(212,251,252,0.2)');
		grd.addColorStop(0.3, 'rgba(212,251,252,0.0)');
		grd.addColorStop(0.45, 'rgba(212,251,252,0.1)');
		grd.addColorStop(0.5, 'rgba(212,251,252,1.0)');
		grd.addColorStop(0.55, 'rgba(212,251,252,0.55)');
		grd.addColorStop(0.6, 'rgba(212,251,252,0.25)');
		grd.addColorStop(1, 'rgba(212,251,252,0)');

		context.fillStyle = grd;
		context.fillRect(
			0,
			this.scanOffsetY,
			canvas.width,
			this.scanSize + this.scanOffsetY
		);
		context.globalCompositeOperation = 'lighter';

		this.scanOffsetY += canvas.height / this.scanSpeed;
		if (this.scanOffsetY > canvas.height)
			this.scanOffsetY = -(this.scanSize / 2);

		window.requestAnimationFrame(() => this.render());
	}
}
