import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { getLog } from '@api/Log';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { SocketService } from '@app/services/socket.service';

@Component({
	selector: 'app-ship-log',
	templateUrl: './ship-log.component.html',
	styleUrls: ['./ship-log.component.scss'],
})
export class ShipLogComponent implements OnInit, OnDestroy {
	logs: api.LogEntry[];
	timeUpdater$: Subscription;
	logEntryAdded$: Subscription;

	constructor(private route: ActivatedRoute, private socket: SocketService) {}

	ngOnInit() {
		// Fetch new page when page query param changes
		this.route.queryParams.subscribe(({ page }) => {
			this.getLogPage(page);
		});

		// Update human readable timestamp every 10sec
		this.timeUpdater$ = interval(10000).subscribe(() => {
			this.logs = (this.logs || []).map(e => this.parseLogEntry(e));
		});

		// Listen for added log entries
		this.logEntryAdded$ = this.socket.logEntryAdded$.subscribe(logEntry => {
			this.logs = [logEntry, ...(this.logs || [])].map(e =>
				this.parseLogEntry(e)
			);
		});
	}

	ngOnDestroy() {
		this.timeUpdater$.unsubscribe();
	}

	getLogPage(page) {
		getLog({ page: page || 1, entries: 150 }).then((res: api.Response<any>) => {
			this.logs = (res.data || []).map(e => this.parseLogEntry(e));
		});
	}

	parseLogEntry(logEntry) {
		const entry = {
			...logEntry,
			time: this.addReadableTime(logEntry),
		};
		return entry;
	}

	addReadableTime(obj) {
		return moment.duration(moment(obj.created_at).diff(moment())).humanize();
	}
}
