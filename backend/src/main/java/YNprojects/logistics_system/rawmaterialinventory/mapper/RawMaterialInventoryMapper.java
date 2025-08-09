package YNprojects.logistics_system.rawmaterialinventory.mapper;

import YNprojects.logistics_system.rawmaterial.mapper.RawMaterialMapper;
import YNprojects.logistics_system.rawmaterialinventory.dto.RawMaterialInventoryDto;
import YNprojects.logistics_system.rawmaterialinventory.entity.RawMaterialInventory;

public class RawMaterialInventoryMapper {

    public static RawMaterialInventoryDto toRawMaterialInventoryDto(RawMaterialInventory rawMaterialInventory) {
        if (rawMaterialInventory == null) {
            return null;
        }
        RawMaterialInventoryDto dto = new RawMaterialInventoryDto();
        dto.setId(rawMaterialInventory.getId());
        dto.setQuantity(rawMaterialInventory.getQuantity());
        dto.setReorderThreshold(rawMaterialInventory.getReorderThreshold());
        dto.setLastUpdated(rawMaterialInventory.getLastUpdated());
        dto.setRawMaterialDto(RawMaterialMapper.toRawMaterialDto(rawMaterialInventory.getRawMaterial()));
        return dto;
    }

    public static RawMaterialInventory toRawMaterialInventory(RawMaterialInventoryDto dto) {
        if (dto == null) {
            return null;
        }
        RawMaterialInventory rawMaterialInventory = new RawMaterialInventory();
        rawMaterialInventory.setId(dto.getId());
        rawMaterialInventory.setQuantity(dto.getQuantity());
        rawMaterialInventory.setReorderThreshold(dto.getReorderThreshold());
        rawMaterialInventory.setLastUpdated(dto.getLastUpdated());
        rawMaterialInventory.setRawMaterial(RawMaterialMapper.toRawMaterial(dto.getRawMaterialDto()));
        return rawMaterialInventory;
    }
}

