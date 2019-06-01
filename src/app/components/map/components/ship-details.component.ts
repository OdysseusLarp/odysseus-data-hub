import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { StateService } from '@app/services/state.service';
import { ListItem } from './dotted-list.component';

@Component({
	selector: 'app-ship-details',
	templateUrl: './ship-details.component.html',
	styleUrls: ['./ship-details.component.scss'],
})
export class ShipDetailsComponent implements OnInit, OnDestroy {
	@Input() fleet$: Observable<any>;
	@Input() onUnselect: (closePopup: boolean) => void;
	selectedFleet$: Subscription;
	fleet: any;
	formattedListItems: ListItem[] = [];

	constructor(private state: StateService) {}

	ngOnInit() {
		this.selectedFleet$ = this.fleet$.subscribe(fleet => {
			this.fleet = fleet;
			if (!this.fleet) return;
			this.generateFormattedList();
		});
	}

	ngOnDestroy() {
		this.selectedFleet$.unsubscribe();
	}

	closeBox() {
		this.onUnselect(true);
	}

	private generateFormattedList() {
		if (!this.fleet) return;
		const { count_civilian, count_military } = this.fleet;
		const count_total = count_civilian + count_military;
		this.formattedListItems = [
			{ key: 'Civilian ship count', value: count_civilian },
			{ key: 'Military ship count', value: count_military },
			{ key: 'Total ship count', value: count_total },
		];
	}
}
