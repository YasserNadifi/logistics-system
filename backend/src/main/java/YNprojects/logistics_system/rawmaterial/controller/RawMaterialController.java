package YNprojects.logistics_system.rawmaterial.controller;


import YNprojects.logistics_system.rawmaterial.dto.CreateRawMaterialDto;
import YNprojects.logistics_system.rawmaterial.dto.RawMaterialDto;
import YNprojects.logistics_system.rawmaterial.service.RawMaterialService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/raw-material")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    @GetMapping
    public ResponseEntity<List<RawMaterialDto>> getAllRawMaterials() {
        return ResponseEntity.ok(rawMaterialService.getAllRawMaterials());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawMaterialDto> getRawMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(rawMaterialService.getRawMaterialById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<RawMaterialDto> createRawMaterial(@RequestBody CreateRawMaterialDto createRawMaterialDto) {
        return ResponseEntity.ok(rawMaterialService.createRawMaterial(createRawMaterialDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<RawMaterialDto> updateRawMaterial(@RequestBody RawMaterialDto rawMaterialDto) {
        return ResponseEntity.ok(rawMaterialService.updateRawMaterial(rawMaterialDto));
    }
}
