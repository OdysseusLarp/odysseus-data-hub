import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	OnDestroy,
	HostListener,
	Input,
} from '@angular/core';
import { StateService } from '@app/services/state.service';
import { fadeInAnimation } from '@app/animations';

// Cool matrix animation copied from:
// https://code.sololearn.com/Wj7ZWBg5m2OG/?ref=app#html

const HACKING_PASSWORD_LENGTH = 15;
const RENDER_INTERVAL_MS = 28;

@Component({
	selector: 'app-hacking',
	templateUrl: './hacking.component.html',
	styleUrls: ['./hacking.component.scss'],
	animations: [fadeInAnimation],
})
export class HackingComponent implements OnInit, OnDestroy {
	@ViewChild('canvas') canvas: ElementRef;
	@Input() onCompletion: () => void;
	private ctx;
	private fontSize;
	private drops = []; // an array of drops - one per column
	private matrix: string[] = [];
	private interval;
	correctInputValue: string;
	hackInputValue = '';
	isHackingComplete = false;
	charsRemaining = Array(HACKING_PASSWORD_LENGTH - 1);
	completeHackingTimeout: any;

	constructor(private state: StateService) {}

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

	@HostListener('document:keydown', ['$event'])
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
		if (event.key === 'Escape') this.state.showHackingView.next(false);
	}

	private setHackingComplete() {
		this.isHackingComplete = true;
		clearTimeout(this.completeHackingTimeout);
		this.completeHackingTimeout = setTimeout(() => this.onCompletion(), 1000);
	}

	private generateCorrectInputValue() {
		this.charsRemaining = Array(HACKING_PASSWORD_LENGTH - 1);
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

		this.matrix = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%'.split('');
		this.fontSize = 18;

		const columns = c.width / this.fontSize; // number of columns for the rain

		// x below is the x coordinate
		// 1 = y co-ordinate of the drop(same for every drop initially)
		for (let x = 0; x < columns; x++) this.drops[x] = 1;

		if (this.interval) clearInterval(this.interval);
		this.interval = setInterval(() => this.draw(), RENDER_INTERVAL_MS);
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

		this.ctx.fillStyle = '#02f6fe';
		this.ctx.font = this.fontSize + 'px arial';
		// looping over drops
		for (let i = 0; i < this.drops.length; i++) {
			// get a random matrix character to print
			const text = this.matrix[Math.floor(Math.random() * this.matrix.length)];
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
