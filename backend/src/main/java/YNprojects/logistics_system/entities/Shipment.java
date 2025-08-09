package YNprojects.logistics_system.entities;

import YNprojects.logistics_system.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

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
    @Enumerated(EnumType.STRING)
    private ShipmentDirection direction;
    private String destination;
    private String trackingNumber;
    private LocalDateTime createdAt;

    @ManyToOne
    private Product product;

    @OneToMany(mappedBy = "shipment")
    private List<ShipmentAlert> alerts;
}
