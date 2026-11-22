import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-explore-container',
    templateUrl: './explore-container.component.html',
    styleUrls: ['./explore-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ExploreContainerComponent {

  @Input() name?: string;

}
