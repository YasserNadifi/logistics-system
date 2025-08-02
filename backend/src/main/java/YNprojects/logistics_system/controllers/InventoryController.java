package YNprojects.logistics_system.controllers;

import YNprojects.logistics_system.DTO.InventoryDto;
import YNprojects.logistics_system.entities.Inventory;
import YNprojects.logistics_system.services.InventoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryDto>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<InventoryDto> updateInventory(@RequestBody InventoryDto inventoryDto) {
        return ResponseEntity.ok(inventoryService.updateInventory(inventoryDto));
    }

}
