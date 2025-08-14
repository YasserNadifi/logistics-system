package YNprojects.logistics_system.rawmaterial.mapper;

import YNprojects.logistics_system.rawmaterial.dto.RawMaterialDto;
import YNprojects.logistics_system.rawmaterial.entity.RawMaterial;

public class RawMaterialMapper {

    public static RawMaterialDto toRawMaterialDto(RawMaterial rawMaterial) {
        if (rawMaterial == null) {
            return null;
        }
        RawMaterialDto dto = new RawMaterialDto();
        dto.setId(rawMaterial.getId());
        dto.setName(rawMaterial.getName());
        dto.setDescription(rawMaterial.getDescription());
        dto.setUnit(rawMaterial.getUnit());
        dto.setSku(rawMaterial.getSku());
        dto.setUpdatedAt(rawMaterial.getUpdatedAt());
        dto.setCreatedAt(rawMaterial.getCreatedAt());
        return dto;
    }

    public static RawMaterial toRawMaterial(RawMaterialDto dto) {
        if (dto == null) {
            return null;
        }
        RawMaterial rawMaterial = new RawMaterial();
        rawMaterial.setId(dto.getId());
        rawMaterial.setName(dto.getName());
        rawMaterial.setDescription(dto.getDescription());
        rawMaterial.setUnit(dto.getUnit());
        rawMaterial.setSku(dto.getSku());
        rawMaterial.setCreatedAt(dto.getCreatedAt());
        rawMaterial.setUpdatedAt(dto.getUpdatedAt());
        return rawMaterial;
    }
}

