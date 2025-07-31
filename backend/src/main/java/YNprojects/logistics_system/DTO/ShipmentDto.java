package YNprojects.logistics_system.DTO;

import YNprojects.logistics_system.entities.Product;
import YNprojects.logistics_system.entities.ShipmentStatus;
import YNprojects.logistics_system.entities.TransportMode;
import jakarta.persistence.ManyToOne;
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
    private Double quantity;
    private LocalDate departureDate;
    private LocalDate estimateArrivalDate;
    private LocalDate actualArrivalDate;
    private ShipmentStatus status;
    private TransportMode transportMode;
    private String destination;
    private String trackingNumber;
    private LocalDateTime createdAt;
    private ProductDto productDto;
}
