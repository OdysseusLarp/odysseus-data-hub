/*
Copied and slightly modified from source:
https://github.com/AndrewPoyntz/time-ago-pipe/blob/master/time-ago.pipe.ts

MIT License
Copyright (c) 2016 Andrew Poyntz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import {
	Pipe,
	PipeTransform,
	NgZone,
	ChangeDetectorRef,
	OnDestroy,
} from '@angular/core';

@Pipe({
	name: 'duration',
	pure: false,
})
export class DurationPipe implements PipeTransform, OnDestroy {
	private timer: number;
	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private ngZone: NgZone
	) {}

	transform(value: string) {
		this.removeTimer();
		const d = new Date(value);
		const now = new Date();
		const seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
		const timeToUpdate = Number.isNaN(seconds)
			? 1000
			: this.getSecondsUntilUpdate(seconds) * 1000;
		this.timer = this.ngZone.runOutsideAngular(() => {
			if (typeof window !== 'undefined') {
				return window.setTimeout(() => {
					this.ngZone.run(() => this.changeDetectorRef.markForCheck());
				}, timeToUpdate);
			}
			return null;
		});
		const occursInPast = now > d;
		const minutes = Math.round(Math.abs(seconds / 60));
		const hours = Math.round(Math.abs(minutes / 60));
		const days = Math.round(Math.abs(hours / 24));
		const months = Math.round(Math.abs(days / 30.416));
		const years = Math.round(Math.abs(days / 365));
		if (Number.isNaN(seconds)) {
			return '';
		} else if (seconds <= 45) {
			return 'a few seconds' + (occursInPast ? ' ago' : '');
		} else if (seconds <= 90) {
			return 'a minute';
		} else if (minutes <= 45) {
			return minutes + ' minutes' + (occursInPast ? ' ago' : '');
		} else if (minutes <= 90) {
			return 'an hour' + (occursInPast ? ' ago' : '');
		} else if (hours <= 22) {
			return hours + ' hours' + (occursInPast ? ' ago' : '');
		} else if (hours <= 36) {
			return 'a day' + (occursInPast ? ' ago' : '');
		} else if (days <= 25) {
			return days + ' days' + (occursInPast ? ' ago' : '');
		} else if (days <= 45) {
			return 'a month' + (occursInPast ? ' ago' : '');
		} else if (days <= 345) {
			return months + ' months' + (occursInPast ? ' ago' : '');
		} else if (days <= 545) {
			return 'a year' + (occursInPast ? ' ago' : '');
		} else {
			// (days > 545)
			return years + ' years' + (occursInPast ? ' ago' : '');
		}
	}
	ngOnDestroy(): void {
		this.removeTimer();
	}
	private removeTimer() {
		if (this.timer) {
			window.clearTimeout(this.timer);
			this.timer = null;
		}
	}
	private getSecondsUntilUpdate(seconds: number) {
		const min = 60;
		const hr = min * 60;
		const day = hr * 24;
		if (seconds < min) {
			// less than 1 min, update every 2 secs
			return 2;
		} else if (seconds < hr) {
			// less than an hour, update every 30 secs
			return 30;
		} else if (seconds < day) {
			// less then a day, update every 5 mins
			return 300;
		} else {
			// update every hour
			return 3600;
		}
	}
}
