package YNprojects.logistics_system.rawmaterialinventory.service;

import YNprojects.logistics_system.alert.entity.AlertSeverity;
import YNprojects.logistics_system.alert.entity.AlertType;
import YNprojects.logistics_system.alert.entity.EntityType;
import YNprojects.logistics_system.alert.service.AlertService;
import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.rawmaterialinventory.mapper.RawMaterialInventoryMapper;
import YNprojects.logistics_system.rawmaterial.entity.RawMaterial;
import YNprojects.logistics_system.rawmaterialinventory.dto.RawMaterialInventoryDto;
import YNprojects.logistics_system.rawmaterialinventory.entity.RawMaterialInventory;
import YNprojects.logistics_system.rawmaterialinventory.repository.RawMaterialInventoryRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class RawMaterialInventoryService {

    private final RawMaterialInventoryRepo rawMaterialInventoryRepo;
    private final AlertService alertService;

    public List<RawMaterialInventoryDto> getAllRawMaterialInventory() {
        return rawMaterialInventoryRepo.findAll()
                .stream()
                .map(RawMaterialInventoryMapper::toRawMaterialInventoryDto)
                .collect(Collectors.toList());
    }

    public RawMaterialInventoryDto getRawMaterialInventoryById(Long id) {
        RawMaterialInventory rawMaterialInventory = rawMaterialInventoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("This raw material inventory item doesn't exist."));
        return RawMaterialInventoryMapper.toRawMaterialInventoryDto(rawMaterialInventory);
    }

    public RawMaterialInventory createRawMaterialInventory(RawMaterial rawMaterial) {
        RawMaterialInventory rawMaterialInventory = new RawMaterialInventory();
        rawMaterialInventory.setQuantity(0.0);
        rawMaterialInventory.setReorderThreshold(0.0);
        rawMaterialInventory.setLastUpdated(LocalDateTime.now());
        rawMaterialInventory.setRawMaterial(rawMaterial);
        return rawMaterialInventoryRepo.save(rawMaterialInventory);
    }

    @Transactional
    public RawMaterialInventoryDto updateRawMaterialInventory(RawMaterialInventoryDto rawMaterialInventoryDto) {
        RawMaterialInventory rawMaterialInventory = rawMaterialInventoryRepo.findById(rawMaterialInventoryDto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("This raw material inventory item doesn't exist."));
        rawMaterialInventory.setLastUpdated(LocalDateTime.now());
        rawMaterialInventory.setQuantity(rawMaterialInventoryDto.getQuantity());
        rawMaterialInventory.setReorderThreshold(rawMaterialInventoryDto.getReorderThreshold());

        if (rawMaterialInventory.getQuantity() <= rawMaterialInventory.getReorderThreshold()) {
            alertService.createIfNotExists(AlertType.RAW_MATERIAL_SHORTAGE,
                    AlertSeverity.CRITICAL,
                    EntityType.RAW_MATERIAL_INVENTORY,
                    rawMaterialInventory.getId());
        } else {
            alertService.resolveByTypeAndEntity(AlertType.RAW_MATERIAL_SHORTAGE,
                    EntityType.RAW_MATERIAL_INVENTORY,
                    rawMaterialInventory.getId());
        }

        RawMaterialInventory saved = rawMaterialInventoryRepo.save(rawMaterialInventory);
        return RawMaterialInventoryMapper.toRawMaterialInventoryDto(saved);
    }
}
