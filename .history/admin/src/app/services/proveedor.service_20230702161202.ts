import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GLOBAL } from './GLOBAL';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
    providedIn: 'root',
})
export class ProveedorService {
    public url;
    constructor(private _http: HttpClient) {
        this.url = GLOBAL.url;
    }

    registro_proveedor_admin(data: any, token: any): Observable<any> {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: token,
        });
        return this._http.post(this.url + 'registro_proveedor_admin', data, { headers: headers });
    }

    listar_proveedores_filtro_admin(tipo: any, filtro: any, token: any): Observable<any> {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json', Authorization: token });
        return this._http.get(this.url + 'listar_proveedores_filtro_admin/' + tipo + '/' + filtro, { headers: headers });
    }

    obtener_proveedor_admin(id: any, token: any): Observable<any> {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: token,
        });
        return this._http.get(this.url + 'obtener_proveedor_admin/' + id, { headers: headers });
    }

    actualizar_proveedor_admin(id: any, data: any, token: any): Observable<any> {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: token,
        });
        return this._http.put(this.url + 'actualizar_proveedor_admin/' + id, data, { headers: headers });
    }

    eliminar_proveedor_admin(id: any, token: any): Observable<any> {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: token,
        });
        return this._http.delete(this.url + 'eliminar_proveedor_admin/' + id, { headers: headers });
    }

    get_Countries(): Observable<any> {
        return this._http.get('./assets/countries.json');
    }
    get_States(): Observable<any> {
        return this._http.get('./assets/states.json');
    }



}