import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { GLOBAL } from "./GLOBAL";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class OfertaService {

  public url;

  constructor(
    private _http: HttpClient,
  ) {
    this.url = GLOBAL.url;
  }

  registro_oferta_admin(data: any, file: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Authorization': token });
    const fd = new FormData();
    fd.append('nombre_oferta', data.nombre_oferta);
    fd.append('descuento_oferta', data.descuento_oferta);
    fd.append('descripcion_oferta', data.descripcion_oferta);
    fd.append('inicio_oferta', data.inicio_oferta);
    fd.append('fin_oferta', data.fin_oferta);
    fd.append('portada_oferta', file);
    fd.append('estado_oferta', data.estado_oferta);
    return this._http.post(this.url + 'registro_oferta_admin', fd, { headers: headers });
  }

  listar_ofertas_admin(filtro: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_ofertas_admin/' + filtro, { headers: headers });
  }

  obtener_oferta_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_oferta_admin/' + id, { headers: headers });
  }

  actualizar_oferta_admin(data: any, id: any, token: any): Observable<any> {
    if (data.portada_oferta) {
      let headers = new HttpHeaders({ 'Authorization': token });
      const fd = new FormData();

      fd.append('estado_oferta', data.estado_oferta);
      fd.append('nombre_oferta', data.nombre_oferta);
      fd.append('descuento_oferta', data.descuento_oferta);
      fd.append('descripcion_oferta', data.descripcion_oferta);
      fd.append('inicio_oferta', data.inicio_oferta);
      fd.append('fin_oferta', data.fin_oferta);
      fd.append('portada_oferta', data.portada_oferta);


      return this._http.put(this.url + 'actualizar_oferta_admin/' + id, fd, { headers: headers });
    } else {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
      return this._http.put(this.url + 'actualizar_oferta_admin/' + id, data, { headers: headers });
    }
  }

  eliminar_oferta_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_oferta_admin/' + id, { headers: headers });
  }
}