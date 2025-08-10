package YNprojects.logistics_system.shipment.dto;

import YNprojects.logistics_system.shipment.entity.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChangeShipmentStatusDto {

    private Long shipmentId;
    private ShipmentStatus targetStatus;

}
