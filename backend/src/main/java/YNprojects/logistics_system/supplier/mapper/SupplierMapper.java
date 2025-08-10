package YNprojects.logistics_system.supplier.mapper;

import YNprojects.logistics_system.supplier.dto.SupplierDto;
import YNprojects.logistics_system.supplier.entity.Supplier;

public class SupplierMapper {
    public static SupplierDto toDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setContactInfo(supplier.getContactInfo());
        dto.setSupplierName(supplier.getSupplierName());
        return dto;
    }

    public static Supplier toEntity(SupplierDto dto) {
        Supplier supplier = new Supplier();
        supplier.setId(dto.getId());
        supplier.setContactInfo(dto.getContactInfo());
        supplier.setSupplierName(dto.getSupplierName());
        return supplier;
    }
}
