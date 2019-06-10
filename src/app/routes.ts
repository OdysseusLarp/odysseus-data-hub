import { Injectable } from '@angular/core';
import {
	Routes,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from '@angular/router';
import { first, map } from 'rxjs/operators';

import { NewsComponent } from './components/news/news.component';
import { LoginComponent } from './components/login/login.component';
import { PersonnelComponent } from '@app/components/personnel/personnel.component';
import { VoteComponent } from '@app/components/vote/vote.component';
import { MessagesComponent } from '@app/components/messages/messages.component';
import { ShipLogComponent } from '@app/components/ship-log/ship-log.component';
import { VoteDetailsComponent } from '@app/components/vote-details/vote-details.component';
import { PersonnelDetailsComponent } from '@app/components/personnel-details/personnel-details.component';
import { ArtifactsComponent } from '@app/components/artifacts/artifacts.component';
import { ArtifactDetailsComponent } from '@app/components/artifact-details/artifact-details.component';
import { CaptainsLogComponent } from '@app/components/captains-log/captains-log.component';
import { FleetComponent } from '@app/components/fleet/fleet.component';
import { FleetDetailsComponent } from '@app/components/fleet-details/fleet-details.component';
import { VoteCreateComponent } from '@app/components/vote-create/vote-create.component';
import { StateService } from '@app/services/state.service';
import { PermissionService } from '@app/services/permission.service';
import { DialogService } from '@app/services/dialog.service';
import { PhoneComponent } from './components/phone/phone.component';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private state: StateService, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return this.state.hasInitialized$.pipe(
			first(Boolean),
			map(() => {
				const isLoggedIn = !!this.state.user.getValue();
				if (!isLoggedIn) this.router.navigate(['/']);
				return isLoggedIn;
			})
		);
	}
}

@Injectable()
export class PermissionGuard implements CanActivate {
	constructor(
		private state: StateService,
		private permission: PermissionService,
		private dialog: DialogService,
		private router: Router
	) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return this.state.hasInitialized$.pipe(
			first(Boolean),
			map(() => {
				let neededPermission;
				if (state.url.match(/^\/captains-log/))
					neededPermission = 'role:captain';
				if (state.url.match(/^\/artifact/)) neededPermission = 'role:science';
				if (!neededPermission) return false;
				const isAllowed = this.permission.has(neededPermission);
				if (!isAllowed)
					this.dialog.error(
						'Access denied',
						'Your access to this section is denied due to insufficient privileges.'
					);
				return isAllowed;
			})
		);
	}
}

export const routes: Routes = [
	{ path: '', component: LoginComponent },
	{ path: 'phone', component: PhoneComponent },
	{ path: 'news', component: NewsComponent, canActivate: [AuthGuard] },
	{
		path: 'personnel',
		component: PersonnelComponent,
		canActivate: [AuthGuard],
	},
	{
		path: 'personnel/:id',
		component: PersonnelDetailsComponent,
		canActivate: [AuthGuard],
	},
	{
		path: 'artifact',
		component: ArtifactsComponent,
		canActivate: [AuthGuard, PermissionGuard],
	},
	{
		path: 'artifact/:id',
		component: ArtifactDetailsComponent,
		canActivate: [AuthGuard],
	},
	{ path: 'fleet', component: FleetComponent, canActivate: [AuthGuard] },
	{
		path: 'fleet/:id',
		component: FleetDetailsComponent,
		canActivate: [AuthGuard],
	},
	{ path: 'vote', component: VoteComponent, canActivate: [AuthGuard] },
	{
		path: 'vote/new',
		component: VoteCreateComponent,
		canActivate: [AuthGuard],
	},
	{
		path: 'vote/:id',
		component: VoteDetailsComponent,
		canActivate: [AuthGuard],
	},
	{
		path: 'communications',
		component: MessagesComponent,
		canActivate: [AuthGuard],
	},
	{
		path: 'communications/:type/:target',
		component: MessagesComponent,
		canActivate: [AuthGuard],
	},
	{ path: 'ship-log', component: ShipLogComponent, canActivate: [AuthGuard] },
	{
		path: 'captains-log',
		component: CaptainsLogComponent,
		canActivate: [AuthGuard, PermissionGuard],
	},
	{
		path: 'map',
		canActivate: [AuthGuard],
		loadChildren: './components/map/map.module#MapModule',
	},
];
