import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { GLOBAL } from "./GLOBAL";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SubcategoriaService {

  public url;

  constructor(
    private _http: HttpClient,
  ) {
    this.url = GLOBAL.url;
  }

  registro_subcategoria_admin(data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Authorization': token });
    const fd = new FormData();
    fd.append('nombre_subcategoria', data.nombre_subcategoria);
    fd.append('estado_subcategoria', data.estado_subcategoria);
    fd.append('categoria', data.categoria);
    fd.append('ofertas', data.ofertas);
    return this._http.post(this.url + 'registro_subcategoria_admin', fd, { headers: headers });
  }

  listar_subcategorias_admin(filtro: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_subcategorias_admin/' + filtro, { headers: headers });
  }

  obtener_subcategoria_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_subcategoria_admin/' + id, { headers: headers });
  }

  actualizar_subcategoria_admin(data: any, id: any, token: any): Observable<any> {
    if (data.portada) {
      let headers = new HttpHeaders({ 'Authorization': token });
      const fd = new FormData();
      fd.append('nombre_subcategoria', data.nombre_subcategoria);
      fd.append('estado_subcategoria', data.estado_subcategoria);
      fd.append('categoria_subcategoria', data.categoria_subcategoria);
      fd.append('ofertas_subcategoria', data.ofertas_subcategoria);


      return this._http.put(this.url + 'actualizar_subcategoria_admin/' + id, fd, { headers: headers });
    } else {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
      return this._http.put(this.url + 'actualizar_subcategoria_admin/' + id, data, { headers: headers });
    }
  }

  eliminar_subcategoria_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_subcategoria_admin/' + id, { headers: headers });
  }
}