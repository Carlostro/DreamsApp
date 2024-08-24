import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../services/product.service';

interface TableRow {
  [key: string]: any;
}

@Component({
  selector: 'app-pagina-admin',
  templateUrl: './pagina-admin.component.html',
  styleUrls: ['./pagina-admin.component.css']
})
export class PaginaAdminComponent implements OnInit {
  tables: string[] = [];
  tableData: any[] = [];
  selectedTable: string | null = null;
  editingRow: TableRow | null = null;
  editForm: FormGroup;

  constructor(private productService: ProductService, private fb: FormBuilder) {
    this.editForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.productService.getTables().subscribe(
      (data: string[]) => {
        this.tables = data;
        if (this.tables.length > 0) {
          this.loadTableData(this.tables[0]); // Cargar datos de la primera tabla por defecto
        }
      },
      (error) => {
        console.error('Error fetching tables', error);
      }
    );
  }

  onSelectTable(tableName: string): void {
    this.selectedTable = tableName;
    this.loadTableData(tableName);
  }

  loadTableData(tableName: string): void {
    this.productService.getTableData(tableName).subscribe(
      (data: any[]) => {
        this.tableData = data;
      },
      (error) => {
        console.error(`Error fetching data for table ${tableName}`, error);
      }
    );
  }

  onAdd(): void {
    // Lógica para añadir un nuevo producto
    console.log('Añadir producto');
  }

  onEdit(row: any): void {
    this.editingRow = { ...row }; // Clonar la fila para editar
    if (this.editingRow) {
      this.editForm = this.fb.group(this.editingRow); // Inicializar el formulario con los datos de la fila
    }
  }

  onSaveEdit(): void {
    if (this.selectedTable && this.editingRow) {
      const productId = this.editingRow['id'];
      if (productId !== undefined) {
        this.productService.updateTableData(this.selectedTable, productId, this.editForm.value).subscribe(
          response => {
            console.log('Producto actualizado', response);
            this.loadTableData(this.selectedTable!); // Recargar los datos de la tabla
            this.editingRow = null; // Limpiar la fila en edición
          },
          error => {
            console.error('Error updating product', error);
          }
        );
      } else {
        console.error('Product ID is undefined');
      }
    }
  }

  onCancelEdit(): void {
    this.editingRow = null; // Cancelar la edición
  }

  onDelete(row: any): void {
    // Lógica para borrar un producto existente
    console.log('Borrar producto', row);
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
