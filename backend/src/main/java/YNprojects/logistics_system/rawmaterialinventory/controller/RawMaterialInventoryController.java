package YNprojects.logistics_system.rawmaterialinventory.controller;

import YNprojects.logistics_system.rawmaterialinventory.dto.RawMaterialInventoryDto;
import YNprojects.logistics_system.rawmaterialinventory.service.RawMaterialInventoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/raw-material-inventory")
@CrossOrigin(origins = "*")
public class RawMaterialInventoryController {

    private final RawMaterialInventoryService rawMaterialInventoryService;

    @GetMapping
    public ResponseEntity<List<RawMaterialInventoryDto>> getAllRawMaterialInventory() {
        return ResponseEntity.ok(rawMaterialInventoryService.getAllRawMaterialInventory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawMaterialInventoryDto> getRawMaterialInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(rawMaterialInventoryService.getRawMaterialInventoryById(id));
    }

    // @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<RawMaterialInventoryDto> updateRawMaterialInventory(
            @RequestBody RawMaterialInventoryDto rawMaterialInventoryDto) {
        return ResponseEntity.ok(rawMaterialInventoryService.updateRawMaterialInventory(rawMaterialInventoryDto));
    }
}
