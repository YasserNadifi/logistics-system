package YNprojects.logistics_system.productionorder.mapper;

import YNprojects.logistics_system.product.entity.Product;
import YNprojects.logistics_system.productionorder.dto.ProductionOrderDto;
import YNprojects.logistics_system.productionorder.dto.ProductionOrderMaterialDto;
import YNprojects.logistics_system.productionorder.dto.ProductionOrderProductDto;
import YNprojects.logistics_system.productionorder.entity.ProductionOrder;
import YNprojects.logistics_system.productionorder.entity.ProductionOrderMaterial;
import YNprojects.logistics_system.productionorder.entity.ProductionOrderProduct;
import YNprojects.logistics_system.rawmaterial.entity.RawMaterial;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public final class ProductionOrderMapper {

    private ProductionOrderMapper() {}

    // Entity -> DTO
    public static ProductionOrderDto toDto(ProductionOrder order) {
        if (order == null) return null;

        ProductionOrderDto dto = new ProductionOrderDto();
        dto.setId(order.getId());
        dto.setReference(order.getReference());
        dto.setCreationDate(order.getCreationDate());
        dto.setStartDate(order.getStartDate());
        dto.setPlannedCompletionDate(order.getPlannedCompletionDate());
        dto.setStatus(order.getStatus());

        if (order.getRawMaterials() != null) {
            List<ProductionOrderMaterialDto> mats = order.getRawMaterials().stream().map(item -> {
                ProductionOrderMaterialDto m = new ProductionOrderMaterialDto();
                m.setId(item.getId());
                if (item.getRawMaterial() != null) {
                    m.setRawMaterialId(item.getRawMaterial().getId());
                }
                m.setQuantity(item.getQuantity());
                return m;
            }).collect(Collectors.toList());
            dto.setRawMaterials(mats);
        }

        // map the single product (one-to-one)
        ProductionOrderProduct pEntity = order.getProduct();
        if (pEntity != null) {
            ProductionOrderProductDto pd = new ProductionOrderProductDto();
            pd.setId(pEntity.getId());
            if (pEntity.getProduct() != null) {
                pd.setProductId(pEntity.getProduct().getId());
            }
            pd.setQuantity(pEntity.getQuantity());
            dto.setProduct(pd);
        }

        return dto;
    }

    // DTO -> Entity (shallow mapping: item entities include only product/rawMaterial id reference)
    // NOTE: service should resolve and set real RawMaterial and Product objects before saving if needed.
    public static ProductionOrder toEntity(ProductionOrderDto dto) {
        if (dto == null) return null;

        ProductionOrder order = new ProductionOrder();
        order.setId(dto.getId());
        order.setReference(dto.getReference());
        order.setCreationDate(dto.getCreationDate());
        order.setStartDate(dto.getStartDate());
        order.setPlannedCompletionDate(dto.getPlannedCompletionDate());
        order.setStatus(dto.getStatus());

        if (dto.getRawMaterials() != null) {
            List<ProductionOrderMaterial> items = new ArrayList<>();
            for (ProductionOrderMaterialDto mDto : dto.getRawMaterials()) {
                ProductionOrderMaterial m = new ProductionOrderMaterial();
                m.setId(mDto.getId());
                // Only set a RawMaterial with id; service should fetch the real entity and set it if needed:
                if (mDto.getRawMaterialId() != null) {
                    RawMaterial rm = new RawMaterial();
                    rm.setId(mDto.getRawMaterialId());
                    m.setRawMaterial(rm);
                }
                m.setQuantity(mDto.getQuantity());
                m.setProductionOrder(order); // set back-reference
                items.add(m);
            }
            order.setRawMaterials(items);
        }

        // single product mapping
        ProductionOrderProductDto pDto = dto.getProduct();
        if (pDto != null) {
            ProductionOrderProduct p = new ProductionOrderProduct();
            p.setId(pDto.getId());
            if (pDto.getProductId() != null) {
                Product prod = new Product();
                prod.setId(pDto.getProductId());
                p.setProduct(prod);
            }
            p.setQuantity(pDto.getQuantity());
            p.setProductionOrder(order); // set back-reference
            order.setProduct(p);
        }

        return order;
    }
}
