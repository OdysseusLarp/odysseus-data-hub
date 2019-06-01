import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MapComponent } from './map.component';
import { ShipDetailsComponent } from './components/ship-details.component';
import { GridDetailsComponent } from './components/grid-details.component';
import { ObjectDetailsComponent } from './components/object-details.component';
import { DottedListComponent } from './components/dotted-list.component';
import { AuthGuard } from '@app/routes';

const routes: Routes = [
	{ path: '', component: MapComponent, canActivate: [AuthGuard] },
];

@NgModule({
	declarations: [
		MapComponent,
		ShipDetailsComponent,
		GridDetailsComponent,
		ObjectDetailsComponent,
		DottedListComponent,
	],
	imports: [CommonModule, HttpClientModule, RouterModule.forChild(routes)],
	providers: [HttpClient],
})
export class MapModule {}
