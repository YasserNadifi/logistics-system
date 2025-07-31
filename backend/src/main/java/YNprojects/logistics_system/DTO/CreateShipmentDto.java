package YNprojects.logistics_system.DTO;

import YNprojects.logistics_system.entities.TransportMode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateShipmentDto {
    private Double quantity;
    private LocalDate departureDate;
    private LocalDate estimateArrivalDate;
    private TransportMode transportMode;
    private String destination;
    private String trackingNumber;
    private Long productId;
}
