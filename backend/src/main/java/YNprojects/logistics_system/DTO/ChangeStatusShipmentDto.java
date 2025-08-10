package YNprojects.logistics_system.DTO;

import YNprojects.logistics_system.shipment.entity.ShipmentStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ChangeStatusShipmentDto {
    private Long id;
    private ShipmentStatus status;
    private LocalDate newEstimateArrivalDate;
}
