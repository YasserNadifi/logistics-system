package YNprojects.logistics_system.shipment.dto;

import YNprojects.logistics_system.product.dto.ProductDto;
import YNprojects.logistics_system.rawmaterial.dto.RawMaterialDto;
import YNprojects.logistics_system.shipment.entity.ShipmentDirection;
import YNprojects.logistics_system.shipment.entity.ShipmentStatus;
import YNprojects.logistics_system.shipment.entity.TransportMode;
import YNprojects.logistics_system.supplier.dto.SupplierDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ShipmentDto {

    private Long id;
    private String referenceCode;
    private ShipmentDirection direction;
    private ShipmentStatus status;
    private TransportMode transportMode;
    private Double quantity;

    private ProductDto productDto;

    private RawMaterialDto rawMaterialDto;

    private SupplierDto supplierDto;

    private String customerName;

    private LocalDate departureDate;
    private LocalDate estimateArrivalDate;
    private LocalDate actualArrivalDate;

    private String trackingNumber;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
