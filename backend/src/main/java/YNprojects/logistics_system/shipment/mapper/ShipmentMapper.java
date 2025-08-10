package YNprojects.logistics_system.shipment.mapper;

import YNprojects.logistics_system.product.mapper.ProductMapper;
import YNprojects.logistics_system.rawmaterial.mapper.RawMaterialMapper;
import YNprojects.logistics_system.shipment.dto.ShipmentDto;
import YNprojects.logistics_system.shipment.entity.Shipment;
import YNprojects.logistics_system.supplier.mapper.SupplierMapper;

public final class ShipmentMapper {

    private ShipmentMapper() {}

    public static ShipmentDto toDto(Shipment s) {
        if (s == null) return null;

        ShipmentDto dto = new ShipmentDto();
        dto.setId(s.getId());
        dto.setReferenceCode(s.getReferenceCode());
        dto.setDirection(s.getDirection());
        dto.setStatus(s.getStatus());
        dto.setTransportMode(s.getTransportMode());
        dto.setQuantity(s.getQuantity());
        dto.setProductDto(ProductMapper.toProductDto(s.getProduct()));
        dto.setRawMaterialDto(RawMaterialMapper.toRawMaterialDto(s.getRawMaterial()));
        dto.setSupplierDto(SupplierMapper.toDto(s.getSupplier()));
        dto.setCustomerName(s.getCustomerName());
        dto.setDepartureDate(s.getDepartureDate());
        dto.setEstimateArrivalDate(s.getEstimateArrivalDate());
        dto.setActualArrivalDate(s.getActualArrivalDate());
        dto.setTrackingNumber(s.getTrackingNumber());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());

        return dto;
    }

    /**
     * DTO -> Entity (shallow)
     * Copies nested object references from the DTO into the entity.
     *
     * IMPORTANT:
     * - This method assumes the DTO carries the actual entity types (Product, RawMaterial, Supplier).
     * - If your DTOs use separate types (ProductDto / RawMaterialDto / SupplierDto), do NOT use this directly;
     *   instead resolve DTO -> actual entities in the service layer (fetch by id) before persisting.
     */
    public static Shipment toEntity(ShipmentDto dto) {
        if (dto == null) return null;

        Shipment s = new Shipment();
        s.setId(dto.getId());
        s.setReferenceCode(dto.getReferenceCode());
        s.setDirection(dto.getDirection());
        s.setStatus(dto.getStatus());
        s.setTransportMode(dto.getTransportMode());
        s.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0.0);
        s.setProduct(ProductMapper.toProduct(dto.getProductDto()));
        s.setRawMaterial(RawMaterialMapper.toRawMaterial(dto.getRawMaterialDto()));
        s.setSupplier(SupplierMapper.toEntity(dto.getSupplierDto()));
        s.setCustomerName(dto.getCustomerName());
        s.setDepartureDate(dto.getDepartureDate());
        s.setEstimateArrivalDate(dto.getEstimateArrivalDate());
        s.setActualArrivalDate(dto.getActualArrivalDate());
        s.setTrackingNumber(dto.getTrackingNumber());
        s.setCreatedAt(dto.getCreatedAt());
        s.setUpdatedAt(dto.getUpdatedAt());

        return s;
    }
}