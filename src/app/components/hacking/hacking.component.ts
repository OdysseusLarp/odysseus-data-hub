import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	OnDestroy,
	HostListener,
} from '@angular/core';

// Cool matrix animation copied from:
// https://code.sololearn.com/Wj7ZWBg5m2OG/?ref=app#html

const HACKING_PASSWORD_LENGTH = 12;

@Component({
	selector: 'app-hacking',
	templateUrl: './hacking.component.html',
	styleUrls: ['./hacking.component.scss'],
})
export class HackingComponent implements OnInit, OnDestroy {
	@ViewChild('canvas') canvas: ElementRef;
	private ctx;
	private fontSize;
	private drops = []; // an array of drops - one per column
	private matrix: string[] = [];
	private interval;
	correctInputValue: string;
	hackInputValue = '';
	isHackingComplete = false;
	charsRemaining = Array(HACKING_PASSWORD_LENGTH);

	constructor() {}

	ngOnInit() {
		this.initCanvas();
		this.generateCorrectInputValue();
	}

	ngOnDestroy() {
		clearInterval(this.interval);
	}

	// Init canvas again on window resize
	onResize() {
		this.initCanvas();
	}

	@HostListener('document:keyup', ['$event'])
	onKeyDown(event) {
		const correctChar = this.correctInputValue.split('')[
			this.hackInputValue.length
		];
		const key = event.key.toUpperCase();
		if (key === correctChar) {
			this.hackInputValue += key;
			this.charsRemaining.pop();
		}
		if (this.hackInputValue === this.correctInputValue)
			this.setHackingComplete();
	}

	private setHackingComplete() {
		this.isHackingComplete = true;
	}

	private generateCorrectInputValue() {
		this.charsRemaining = Array(HACKING_PASSWORD_LENGTH);
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
		let val = '';
		for (let i = 0; i < HACKING_PASSWORD_LENGTH; i++) {
			val += chars[Math.floor(Math.random() * chars.length)];
		}
		this.correctInputValue = val;
		console.log('correct val =>', this.correctInputValue);
	}

	private initCanvas() {
		// geting canvas by id c
		const c = this.canvas.nativeElement;
		this.ctx = c.getContext('2d');

		// making the canvas full screen
		c.height = window.innerHeight - 5;
		c.width = window.innerWidth - 1;

		// chinese characters - taken from the unicode charset
		this.matrix = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%'.split('');

		this.fontSize = 18;

		const columns = c.width / this.fontSize; // number of columns for the rain

		// x below is the x coordinate
		// 1 = y co-ordinate of the drop(same for every drop initially)
		for (let x = 0; x < columns; x++) this.drops[x] = 1;

		// render every 35ms
		if (this.interval) clearInterval(this.interval);
		this.interval = setInterval(() => this.draw(), 28);
	}

	private draw() {
		// Black BG for the canvas
		// translucent BG to show trail
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
		this.ctx.fillRect(
			0,
			0,
			this.canvas.nativeElement.width,
			this.canvas.nativeElement.height
		);

		this.ctx.fillStyle = '#02f6fe'; // green text
		this.ctx.font = this.fontSize + 'px arial';
		// looping over drops
		for (let i = 0; i < this.drops.length; i++) {
			// a random chinese character to print
			const text = this.matrix[Math.floor(Math.random() * this.matrix.length)];
			// x = i*font_size, y = value of drops[i]*font_size
			this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

			// sending the drop back to the top randomly after it has crossed the screen
			// adding a randomness to the reset to make the drops scattered on the Y axis
			if (
				this.drops[i] * this.fontSize > this.canvas.nativeElement.height &&
				Math.random() > 0.975
			)
				this.drops[i] = 0;

			// incrementing Y coordinate
			this.drops[i]++;
		}
	}
}
