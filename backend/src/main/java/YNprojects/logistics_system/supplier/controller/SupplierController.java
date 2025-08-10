package YNprojects.logistics_system.supplier.controller;

import YNprojects.logistics_system.supplier.dto.SupplierDto;
import YNprojects.logistics_system.supplier.service.SupplierService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@Validated
@AllArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<SupplierDto> createSupplier(@RequestBody SupplierDto dto) {
        SupplierDto saved = supplierService.create(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<SupplierDto>> listSuppliers() {
        List<SupplierDto> list = supplierService.getAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDto> getSupplier(@PathVariable Long id) {
        SupplierDto dto = supplierService.findById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping
    public ResponseEntity<SupplierDto> updateSupplier(@RequestBody SupplierDto dto) {
        SupplierDto updated = supplierService.update(dto);
        return ResponseEntity.ok(updated);
    }
}