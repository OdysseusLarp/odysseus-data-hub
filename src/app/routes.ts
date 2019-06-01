import { Injectable } from '@angular/core';
import {
	Routes,
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
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

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private state: StateService) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return !!this.state.user.getValue();
	}
}

export const routes: Routes = [
	{ path: '', component: LoginComponent },
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
	{ path: 'artifact', component: ArtifactsComponent, canActivate: [AuthGuard] },
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
		canActivate: [AuthGuard],
	},
];
