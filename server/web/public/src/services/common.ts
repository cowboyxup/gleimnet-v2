
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import {Headers} from "angular2/http";

//import

export const autKey =  "AuthKey";
export const usernameKey =  "username";
export const authHeader =  "authHeader";


export function headers(){
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var basicAuth =  localStorage.getItem('AuthKey');
    headers.append('Authorization',basicAuth);

    return headers;
}


export interface IDictionary <T>{
    add(key: string, value: T): void;
    remove(key: string): void;
    containsKey(key: string): boolean;
    keys(): string[];
    values(): T[];
}

export class Dictionary<T>{

    _keys: string[] = new Array<string>()
    _values: T[] = Array<T>();


    public _values$: Observable<Array<T>>;
    private _valuesObserver: any;

    constructor(init: { key: string; value: T; }[]) {

        for (var x = 0; x < init.length; x++) {
            this[init[x].key] = init[x].value;
            this._keys.push(init[x].key);
            this._values.push(init[x].value);
        }

        this._values$ = new Observable(observer => {
            this._valuesObserver = observer;
        }).share();
    }

    add(key: string, value: T) {
        this[key] = value;
        this._keys.push(key);
        this._values.push(value);

        this.update();
    }

    addFront(key: string, value: T) {
        this[key] = value;
        this._keys.unshift(key);
        this._values.unshift(value);

        this.update();
    }

    remove(key: string) {
        var index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);

        delete this[key];

        this.update();
    }

    get(key:string):T{
        var index = this._keys.indexOf(key, 0);
        return this._values[index]
    }

    keys(): string[] {
        return this._keys;
    }

    values(): T[] {
        return this._values;
    }

    containsKey(key: string):boolean {
        if (typeof this[key] === "undefined") {
            return false;
        }
        return true;
    }

    toLookup(): IDictionary<T> {
        return this;
    }

    update(){
        this._valuesObserver.next(this._values);
    }
}