package YNprojects.logistics_system.productinventory.mapper;

import YNprojects.logistics_system.product.mapper.ProductMapper;
import YNprojects.logistics_system.productinventory.dto.ProductInventoryDto;
import YNprojects.logistics_system.productinventory.entities.ProductInventory;

public class ProductInventoryMapper {
    public static ProductInventoryDto toProductInventoryDto(ProductInventory productInventory) {
        ProductInventoryDto dto = new ProductInventoryDto();
        dto.setId(productInventory.getId());
        dto.setQuantity(productInventory.getQuantity());
        dto.setReorderThreshold(productInventory.getReorderThreshold());
        dto.setLastUpdated(productInventory.getLastUpdated());
        dto.setProductDto(ProductMapper.toProductDto(productInventory.getProduct()));
        return dto;
    }

    public static ProductInventory toProductInventory(ProductInventoryDto dto) {
        ProductInventory productInventory = new ProductInventory();
        productInventory.setId(dto.getId());
        productInventory.setQuantity(dto.getQuantity());
        productInventory.setReorderThreshold(dto.getReorderThreshold());
        productInventory.setLastUpdated(dto.getLastUpdated());
        productInventory.setProduct(ProductMapper.toProduct(dto.getProductDto()));
        return productInventory;
    }
}
