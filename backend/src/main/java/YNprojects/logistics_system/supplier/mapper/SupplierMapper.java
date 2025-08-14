package YNprojects.logistics_system.supplier.mapper;

import YNprojects.logistics_system.supplier.dto.SupplierDto;
import YNprojects.logistics_system.supplier.entity.Supplier;

public class SupplierMapper {
    public static SupplierDto toDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setCity(supplier.getCity());
        dto.setCountry(supplier.getCountry());
        dto.setAddress(supplier.getAddress());
        dto.setSupplierName(supplier.getSupplierName());
        return dto;
    }

    public static Supplier toEntity(SupplierDto dto) {
        Supplier supplier = new Supplier();
        supplier.setId(dto.getId());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setCity(dto.getCity());
        supplier.setCountry(dto.getCountry());
        supplier.setAddress(dto.getAddress());
        supplier.setSupplierName(dto.getSupplierName());
        return supplier;
    }
}
