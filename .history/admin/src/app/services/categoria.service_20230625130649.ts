import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { GLOBAL } from "./GLOBAL";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  public url;

  constructor(
    private _http: HttpClient,
  ) {
    this.url = GLOBAL.url;
  }

  registro_categoria_admin(
    data: any,
    file: any,
    token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Authorization': token });

    const fd = new FormData();
    fd.append('titulo', data.titulo);
    fd.append('icono', file);
    return this._http.post(this.url + 'registro_categoria_admin', fd, { headers: headers });
  }
}