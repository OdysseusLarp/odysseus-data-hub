import { Pipe, PipeTransform } from '@angular/core';
import { get } from 'lodash';

@Pipe({
	name: 'isVisible',
})
export class IsVisiblePipe implements PipeTransform {
	transform(value: any, args?: any): any {
		return !!get(value, 'is_visible');
	}
}
