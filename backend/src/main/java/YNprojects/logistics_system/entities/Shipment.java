package YNprojects.logistics_system.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.mapping.Set;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@ToString
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String referenceCode;
    private Double quantity;
    private LocalDate departureDate;
    private LocalDate estimateArrivalDate;
    private LocalDate actualArrivalDate;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status;

    @Enumerated(EnumType.STRING)
    private TransportMode transportMode;
    private String destination;
    private String trackingNumber;
    private LocalDateTime createdAt;

    @ManyToOne
    private Product product;

    @OneToMany(mappedBy = "shipment")
    private List<ShipmentAlert> alerts;
}
