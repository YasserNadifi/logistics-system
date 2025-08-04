package YNprojects.logistics_system.DTO;

import YNprojects.logistics_system.entities.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChangeStatusShipmentDto {
    private Long id;
    private ShipmentStatus status;
    private LocalDate newEstimateArrivalDate;
}
