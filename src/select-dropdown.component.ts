import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';

import {Option} from './option';
import {OptionList} from './option-list';

@Component({
    selector: 'select-dropdown',
    template: `
    <div
            [ngStyle]="{'top.px': top, 'left.px': left, 'width.px': width}">

        <div class="filter"
             *ngIf="!multiple && filterEnabled">
            <input
                    #filterInput
                    autocomplete="off"
                    [placeholder]="placeholder"
                    (click)="onSingleFilterClick($event)"
                    (input)="onSingleFilterInput($event)"
                    (keydown)="onSingleFilterKeydown($event)">
        </div>

        <div class="options"
             #optionsList>
            <ul
                    (wheel)="onOptionsWheel($event)">
                <li *ngFor="let option of optionList.filtered"
                    [ngClass]="{'highlighted': option.highlighted, 'selected': option.selected, 'disabled': option.disabled}"
                    [ngStyle]="getOptionStyle(option)"
                    (click)="onOptionClick(option)"
                    (mouseover)="onOptionMouseover(option)">
                    {{option.label}}
                </li>
                <li
                        *ngIf="!optionList.hasShown"
                        class="message">
                    {{notFoundMsg}}
                </li>
            </ul>
        </div>
    </div>
     `,
    styles: [`
select-dropdown {
    box-sizing: border-box;
    font-family: Sans-Serif;
}
select-dropdown * {
    box-sizing: border-box;
    font-family: Sans-Serif;
}
select-dropdown > div {
    background-color: #fff;
    border: 1px solid #ccc;
    border-top: none;
    box-sizing: border-box;
    position: absolute;
    z-index: 1;
}
select-dropdown > div .filter {
    padding: 3px;
    width: 100%;
}
select-dropdown > div .filter input {
    border: 1px solid #eee;
    box-sizing: border-box;
    padding: 4px;
    width: 100%;
}
select-dropdown > div .options {
    max-height: 200px;
    overflow-y: auto;
}
select-dropdown > div .options ul {
    list-style: none;
    margin: 0;
    padding: 0;
}
select-dropdown > div .options ul li {
    padding: 4px 8px;
    cursor: pointer;
    user-select: none;
}
select-dropdown .selected {
    background-color: #e0e0e0;
}
select-dropdown .selected.highlighted {
    background-color: #2196F3;
    color: #fff;
}
select-dropdown .highlighted {
    background-color: #2196F3;
    color: #fff;
}
select-dropdown .disabled {
    background-color: #fff;
    color: #9e9e9e;
    cursor: default;
    pointer-events: none;
}

    `],
    encapsulation: ViewEncapsulation.None
})

export class SelectDropdownComponent
        implements AfterViewInit, OnChanges, OnInit {

    @Input() filterEnabled: boolean;
    @Input() highlightColor: string;
    @Input() highlightTextColor: string;
    @Input() left: number;
    @Input() multiple: boolean;
    @Input() notFoundMsg: string;
    @Input() optionList: OptionList;
    @Input() top: number;
    @Input() width: number;
    @Input() placeholder: string;

    @Output() close = new EventEmitter<boolean>();
    @Output() optionClicked = new EventEmitter<Option>();
    @Output() singleFilterClick = new EventEmitter<null>();
    @Output() singleFilterInput = new EventEmitter<string>();
    @Output() singleFilterKeydown = new EventEmitter<any>();

    @ViewChild('filterInput') filterInput: any;
    @ViewChild('optionsList') optionsList: any;

    disabledColor: string = '#fff';
    disabledTextColor: string = '9e9e9e';

    /** Event handlers. **/

    // Angular life cycle hooks.

    ngOnInit() {
        this.optionsReset();
    }

    ngOnChanges(changes: any) {
        if (changes.hasOwnProperty('optionList')) {
            this.optionsReset();
        }
    }

    ngAfterViewInit() {
        this.moveHighlightedIntoView();
        if (!this.multiple && this.filterEnabled) {
            this.filterInput.nativeElement.focus();
        }
    }

    // Filter input (single select).

    onSingleFilterClick(event: any) {
        this.singleFilterClick.emit(null);
    }

    onSingleFilterInput(event: any) {
        this.singleFilterInput.emit(event.target.value);
    }

    onSingleFilterKeydown(event: any) {
        this.singleFilterKeydown.emit(event);
    }

    // Options list.

    onOptionsWheel(event: any) {
        this.handleOptionsWheel(event);
    }

    onOptionMouseover(option: Option) {
        this.optionList.highlightOption(option);
    }

    onOptionClick(option: Option) {
        this.optionClicked.emit(option);
    }

    /** Initialization. **/

    private optionsReset() {
        this.optionList.filter('');
        this.optionList.highlight();
    }

    /** View. **/

    getOptionStyle(option: Option): any {
        if (option.highlighted) {
            let style: any = {};

            if (typeof this.highlightColor !== 'undefined') {
                style['background-color'] = this.highlightColor;
            }
            if (typeof this.highlightTextColor !== 'undefined') {
                style['color'] = this.highlightTextColor;
            }
            return style;
        }
        else {
            return {};
        }
    }

    clearFilterInput() {
        if (this.filterEnabled) {
            this.filterInput.nativeElement.value = '';
        }
    }

    moveHighlightedIntoView() {

        let list = this.optionsList.nativeElement;
        let listHeight = list.offsetHeight;

        let itemIndex = this.optionList.getHighlightedIndex();

        if (itemIndex > -1) {
            let item = list.children[0].children[itemIndex];
            let itemHeight = item.offsetHeight;

            let itemTop = itemIndex * itemHeight;
            let itemBottom = itemTop + itemHeight;

            let viewTop = list.scrollTop;
            let viewBottom = viewTop + listHeight;

            if (itemBottom > viewBottom) {
                list.scrollTop = itemBottom - listHeight;
            }
            else if (itemTop < viewTop) {
                list.scrollTop = itemTop;
            }
        }
    }

    private handleOptionsWheel(e: any) {
        let div = this.optionsList.nativeElement;
        let atTop = div.scrollTop === 0;
        let atBottom = div.offsetHeight + div.scrollTop === div.scrollHeight;

        if (atTop && e.deltaY < 0) {
            e.preventDefault();
        }
        else if (atBottom && e.deltaY > 0) {
            e.preventDefault();
        }
    }
}
