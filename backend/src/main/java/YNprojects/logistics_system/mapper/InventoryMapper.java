package YNprojects.logistics_system.mapper;

import YNprojects.logistics_system.DTO.InventoryDto;
import YNprojects.logistics_system.entities.Inventory;

public class InventoryMapper {
    public static InventoryDto toInventoryDto(Inventory inventory) {
        InventoryDto inventoryDto = new InventoryDto();
        inventoryDto.setId(inventory.getId());
        inventoryDto.setQuantity(inventory.getQuantity());
        inventoryDto.setProductDto(ProductMapper.toProductDto(inventory.getProduct()));
        inventoryDto.setReorderThreshold(inventory.getReorderThreshold());
        inventoryDto.setLastUpdated(inventory.getLastUpdated());
        return inventoryDto;
    }

    public static Inventory toInventory(InventoryDto inventoryDto) {
        Inventory inventory = new Inventory();
        inventory.setId(inventoryDto.getId());
        inventory.setQuantity(inventoryDto.getQuantity());
        inventory.setProduct(ProductMapper.toProduct(inventoryDto.getProductDto()));
        inventory.setReorderThreshold(inventoryDto.getReorderThreshold());
        inventory.setLastUpdated(inventoryDto.getLastUpdated());
        return inventory;
    }

}
