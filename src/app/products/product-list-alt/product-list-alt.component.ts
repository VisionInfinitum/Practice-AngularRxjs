import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { EMPTY, Observable, Subject } from 'rxjs';

import { ProductService } from '../product.service';
import { catchError, map } from 'rxjs/operators';
import { Product } from '../product';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';

  private errorMessageSubject$: Subject<string> = new Subject<string>();
  errorMessage$: Observable<string> = this.errorMessageSubject$.asObservable();

  products$: Observable<Product[]> = this.productService.productsWithCategory$.pipe(
    catchError(err => {
      this.errorMessageSubject$.next(err);
      return EMPTY;
    })
  );

  selectedProduct$: Observable<Product> = this.productService.selectedProduct$;

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChange(productId);
  }
}
