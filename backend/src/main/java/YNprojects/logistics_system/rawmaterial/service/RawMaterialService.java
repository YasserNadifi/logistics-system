package YNprojects.logistics_system.rawmaterial.service;

import YNprojects.logistics_system.exceptions.ResourceNotFoundException;
import YNprojects.logistics_system.rawmaterial.mapper.RawMaterialMapper;
import YNprojects.logistics_system.rawmaterial.dto.CreateRawMaterialDto;
import YNprojects.logistics_system.rawmaterial.dto.RawMaterialDto;
import YNprojects.logistics_system.rawmaterial.entity.RawMaterial;
import YNprojects.logistics_system.rawmaterial.repository.RawMaterialRepo;
import YNprojects.logistics_system.rawmaterialinventory.service.RawMaterialInventoryService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class RawMaterialService {

    private final RawMaterialRepo rawMaterialRepo;
    private final RawMaterialInventoryService rawMaterialInventoryService;

    public List<RawMaterialDto> getAllRawMaterials() {
        return rawMaterialRepo.findAll().stream()
                .map(RawMaterialMapper::toRawMaterialDto)
                .toList();
    }

    public RawMaterialDto getRawMaterialById(Long id) {
        RawMaterial rawMaterial = rawMaterialRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("This raw material doesn't exist."));
        return RawMaterialMapper.toRawMaterialDto(rawMaterial);
    }

    public RawMaterialDto createRawMaterial(CreateRawMaterialDto createRawMaterialDto) {
        RawMaterial rawMaterial = new RawMaterial();
        rawMaterial.setName(createRawMaterialDto.getName());
        rawMaterial.setDescription(createRawMaterialDto.getDescription());
        rawMaterial.setUnit(createRawMaterialDto.getUnit());

        rawMaterial = rawMaterialRepo.save(rawMaterial);
        rawMaterialInventoryService.createRawMaterialInventory(rawMaterial);

        return RawMaterialMapper.toRawMaterialDto(rawMaterial);
    }

    public RawMaterialDto updateRawMaterial(RawMaterialDto rawMaterialDto) {
        RawMaterial rawMaterial = rawMaterialRepo.findById(rawMaterialDto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("This raw material doesn't exist."));

        rawMaterial.setName(rawMaterialDto.getName());
        rawMaterial.setDescription(rawMaterialDto.getDescription());
        rawMaterial.setUnit(rawMaterialDto.getUnit());

        RawMaterial updated = rawMaterialRepo.save(rawMaterial);
        return RawMaterialMapper.toRawMaterialDto(updated);
    }
}
