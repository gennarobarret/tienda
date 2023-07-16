import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { GLOBAL } from "./GLOBAL";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

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
    fd.append('icono', data.icono);
    fd.append('estado', data.estado);
    fd.append('oferta', data.oferta);
    fd.append('portada', file);
    fd.append('descuento_oferta', data.descuento_oferta);
    fd.append('fin_oferta', data.fin_oferta);

    return this._http.post(this.url + 'registro_categoria_admin', fd, { headers: headers });
  }

  listar_categorias_admin(filtro: string, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_categorias_admin/' + filtro, { headers: headers });
  }

  obtener_categoria_admin(id: string, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_categoria_admin/' + id, { headers: headers });
  }
}