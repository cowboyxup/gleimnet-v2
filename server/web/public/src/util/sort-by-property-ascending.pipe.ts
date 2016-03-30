import {Pipe, PipeTransform} from "angular2/core";

@Pipe({
    name: `sortAscendingByProperty`,
    pure: false // causes the pipe to continue to update as the data source is updated
})
export class SortByPropertyAscendingPipe {
    transform(list, [propertyName, order]) {
        return list.sort((a, b) => {
            let aValue = getNestedValue(a, propertyName);
            let bValue = getNestedValue(b, propertyName);

            if (aValue > bValue) return 1;
            if (aValue < bValue) return -1;
            return 0;
        });
    }
}

function getNestedValue(obj, nestedKey) {
    return nestedKey.split('.').reduce((acc, curr) => {
        return acc[curr];
    }, obj);
}

