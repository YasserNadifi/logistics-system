package YNprojects.logistics_system.productinventory.controller;

import YNprojects.logistics_system.productinventory.dto.ProductInventoryDto;
import YNprojects.logistics_system.productinventory.service.ProductInventoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/product-inventory")
@CrossOrigin(origins = "*")
public class ProductInventoryController {

    private final ProductInventoryService productInventoryService;

    @GetMapping
    public ResponseEntity<List<ProductInventoryDto>> getAllProductInventory() {
        return ResponseEntity.ok(productInventoryService.getAllProductInventory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductInventoryDto> getProductInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(productInventoryService.getProductInventoryById(id));
    }

    // @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<ProductInventoryDto> updateProductInventory(@RequestBody ProductInventoryDto productInventoryDto) {
        return ResponseEntity.ok(productInventoryService.updateProductInventory(productInventoryDto));
    }

}
