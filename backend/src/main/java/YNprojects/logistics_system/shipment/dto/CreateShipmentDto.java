package YNprojects.logistics_system.shipment.dto;

import YNprojects.logistics_system.shipment.entity.ShipmentDirection;
import YNprojects.logistics_system.shipment.entity.TransportMode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateShipmentDto {
    @NotNull
    private ShipmentDirection direction;
    @NotNull
    private TransportMode transportMode;
    @NotNull
    private Double quantity;

    private Long productId;
    private String customerName;

    private Long rawMaterialId;
    private Long supplierId;

    private LocalDate departureDate;
    private LocalDate estimateArrivalDate;

    private String trackingNumber;
}