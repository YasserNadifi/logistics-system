package YNprojects.logistics_system.shipment.dto;

import YNprojects.logistics_system.shipment.entity.ShipmentStatus;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ChangeShipmentStatusDto {

    private Long shipmentId;
    private ShipmentStatus targetStatus;

}
